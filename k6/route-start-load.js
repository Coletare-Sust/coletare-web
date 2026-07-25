import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Simula N motoristas "inicializando" a rota em andamento ao mesmo tempo.
//
// O que "iniciar rota" significa aqui:
//   O collect já existe no banco (criado pelo admin). O driver abre o app,
//   faz login e envia a primeira localização — isso o faz aparecer no mapa
//   da página /rotas-andamento em tempo real.
//
// Cenários em paralelo:
//   viewer  — 1 admin assistindo /rotas-andamento via WebSocket (60s → 210s)
//   drivers — motoristas em ramp-up 5 → 25 → 50 → 100, cada um faz login +
//             POST /collect/{id}/location (simulando início da rota)
//
// Métricas principais:
//   login_duration_ms       — tempo para autenticar o motorista
//   route_start_duration_ms — tempo do POST de localização (início da rota)
//   route_start_errors      — POSTs que falharam
//   msgs_recebidas          — broadcasts que chegaram ao viewer
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta admin (viewers e login dos trucks)
//   CITY_ID                  — ID da cidade
//   COLLECT_ID               — ID de coleta ativa (base, separado por vírgula para múltiplas)
//
// Env vars opcionais:
//   API_URL    — padrão: http://localhost:8080
//   BASE_LAT   — padrão: -8.3369
//   BASE_LNG   — padrão: -36.4251
//
// Exemplo:
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e CITY_ID=abc -e COLLECT_ID=id1,id2 \
//          k6/route-start-load.js

const API_URL  = __ENV.API_URL || 'http://localhost:8080';
const CITY_ID  = __ENV.CITY_ID;
const BASE_LAT = parseFloat(__ENV.BASE_LAT || '-8.3369');
const BASE_LNG = parseFloat(__ENV.BASE_LNG || '-36.4251');

// ── métricas ─────────────────────────────────────────────────────────────────
const loginDuration      = new Trend('login_duration_ms',       true);
const routeStartDuration = new Trend('route_start_duration_ms', true);
const routeStartErrors   = new Rate('route_start_errors');
const loginErrors        = new Rate('login_errors');
const msgsRecebidas      = new Counter('msgs_recebidas');

// ── configuração de carga ─────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Viewer fica conectado por toda a duração observando o mapa
    viewer: {
      executor: 'constant-vus',
      vus: 1,
      startTime: '0s',
      duration: '210s',
      exec: 'viewer',
    },
    // Drivers em ramp: 5 → 25 → 50 → 100, cada iteração = 1 início de rota
    drivers: {
      executor: 'ramping-vus',
      startTime: '10s',        // viewer tem 10s para conectar antes dos drivers
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5   },  // ramp para 5 drivers
        { duration: '30s', target: 5   },  // mantém 5 (baseline)
        { duration: '20s', target: 25  },  // ramp para 25
        { duration: '30s', target: 25  },  // mantém 25
        { duration: '20s', target: 50  },  // ramp para 50
        { duration: '30s', target: 50  },  // mantém 50
        { duration: '20s', target: 100 },  // ramp para 100
        { duration: '30s', target: 100 },  // mantém 100 (pico)
        { duration: '10s', target: 0   },  // ramp down
      ],
      exec: 'driver',
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    login_duration_ms:       ['p(95)<3000'],
    route_start_duration_ms: ['p(95)<3000'],
    route_start_errors:      ['rate<0.10'],
    login_errors:            ['rate<0.05'],
  },
};

// ── setup: resolve collect IDs disponíveis ────────────────────────────────────
export function setup() {
  const cookie = loginRequest();
  if (!cookie) return { collectIds: [] };

  // Aceita lista separada por vírgula via env ou busca do banco
  if (__ENV.COLLECT_ID) {
    const ids = __ENV.COLLECT_ID.split(',').map((s) => s.trim()).filter(Boolean);
    console.log(`Collect IDs via env (${ids.length}): ${ids.join(', ')}`);
    return { collectIds: ids };
  }

  const res = http.get(`${API_URL}/collect/${CITY_ID}/city`, {
    headers: { Cookie: cookie },
  });
  check(res, { 'GET collects 200': (r) => r.status === 200 });

  let ids = [];
  try {
    const all = JSON.parse(res.body);
    ids = all.filter((c) => !c.hasEnded).map((c) => c.id);
  } catch (e) {
    console.error(`Erro ao buscar collects: ${e}`);
  }

  console.log(`\nCollects ativos encontrados: ${ids.length}`);
  ids.forEach((id, i) => console.log(`  [${i + 1}] ${id}`));
  console.log(`Cada collect receberá ~${Math.ceil(100 / (ids.length || 1))} req simultâneas no pico\n`);

  return { collectIds: ids };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function loginRequest() {
  const t0 = Date.now();
  const res = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  loginDuration.add(Date.now() - t0);

  const ok = check(res, { 'login 200': (r) => r.status === 200 });
  loginErrors.add(!ok);
  if (!ok) return null;

  let cookieStr = '';
  for (const [name, values] of Object.entries(res.cookies)) {
    cookieStr += `${name}=${values[0].value}; `;
  }
  return cookieStr.trim();
}

function sockjsFrame(frame) { return JSON.stringify([frame]); }
function randId(len) { return Math.random().toString(36).substring(2, 2 + len); }

// ── cenário: viewer ───────────────────────────────────────────────────────────

export function viewer() {
  const cookie = loginRequest();
  if (!cookie) { sleep(1); return; }

  const server  = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const session = randId(16);
  const wsUrl   = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${server}/${session}/websocket`;

  ws.connect(wsUrl, { headers: { Cookie: cookie } }, function (socket) {
    let subscribed = false;

    socket.on('message', (raw) => {
      if (raw === 'o') {
        socket.send(sockjsFrame('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\x00'));
        return;
      }
      if (raw === 'h' || raw.startsWith('c')) return;
      if (!raw.startsWith('a')) return;

      let frames;
      try { frames = JSON.parse(raw.substring(1)); } catch { return; }

      for (const frame of frames) {
        if (frame.startsWith('CONNECTED') && !subscribed) {
          socket.send(sockjsFrame(
            `SUBSCRIBE\nid:sub-0\ndestination:/topic/locations/${CITY_ID}\n\n\x00`
          ));
          subscribed = true;
          console.log('[viewer] Inscrito. Aguardando motoristas iniciarem rota...');
        }

        if (frame.startsWith('MESSAGE') && subscribed) {
          msgsRecebidas.add(1);
        }
      }
    });

    socket.on('error', () => console.error('[viewer] WS error'));

    // Mantém aberto por toda a duração
    socket.setTimeout(() => socket.close(), 200_000);
  });

  sleep(1);
}

// ── cenário: driver (1 iteração = 1 início de rota) ──────────────────────────

export function driver(data) {
  const { collectIds } = data;

  if (!collectIds || collectIds.length === 0) {
    console.error(`Driver VU ${__VU}: nenhum collect ativo disponível`);
    routeStartErrors.add(true);
    return;
  }

  // Round-robin entre os collects disponíveis
  const collectId = collectIds[(__VU - 1) % collectIds.length];

  // Passo 1: motorista faz login no app
  const cookie = loginRequest();
  if (!cookie) {
    routeStartErrors.add(true);
    sleep(1);
    return;
  }

  // Simula posição inicial aleatória próxima à base
  const lat = BASE_LAT + (Math.random() * 0.02 - 0.01);
  const lng = BASE_LNG + (Math.random() * 0.02 - 0.01);

  // Passo 2: envia primeira localização → aparece no mapa como "rota iniciada"
  const t0 = Date.now();
  const res = http.post(
    `${API_URL}/collect/${collectId}/location`,
    JSON.stringify({
      latitude:  lat,
      longitude: lng,
      driverId:  __ENV.DRIVER_ID  || `driver-${__VU}`,
      vehicleId: __ENV.VEHICLE_ID || `truck-${__VU}`,
    }),
    { headers: { 'Content-Type': 'application/json', Cookie: cookie } }
  );
  routeStartDuration.add(Date.now() - t0);

  const ok = check(res, {
    'rota iniciada 2xx': (r) => r.status >= 200 && r.status < 300,
  });
  routeStartErrors.add(!ok);

  if (!ok) {
    console.error(`Driver VU ${__VU} (${collectId}): HTTP ${res.status}`);
  }

  // Intervalo entre tentativas (simula app que re-envia a cada ~5s)
  sleep(5 + Math.random() * 2);
}
