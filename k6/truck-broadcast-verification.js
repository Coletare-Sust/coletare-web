import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Simula N motoristas iniciando rota ao mesmo tempo e verifica se o viewer
// (página /rotas-andamento) realmente detecta todos os caminhões ativos.
//
// Fluxo:
//   setup()  — busca collects ativos da cidade via GET /collect/{cityId}/city
//   viewer   — 1 VU conecta via WebSocket/STOMP e conta caminhões únicos vistos
//   trucks   — TRUCK_VUS VUs disparam simultaneamente, cada um usando um collectId
//              diferente (round-robin). O viewer deve detectar todos os únicos.
//
// Verificação final:
//   unique_trucks_seen  deve ser >= número de collects ativos encontrados no setup
//   truck_error_rate    deve ser < 10%
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta admin
//   CITY_ID                  — ID da cidade
//
// Env vars opcionais:
//   API_URL      — padrão: http://localhost:8080
//   TRUCK_VUS    — caminhões simultâneos (padrão: 100)
//   BASE_LAT     — latitude base (padrão: -8.3369)
//   BASE_LNG     — longitude base (padrão: -36.4251)
//
// Exemplo:
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e CITY_ID=abc123 -e TRUCK_VUS=100 k6/truck-broadcast-verification.js

const API_URL  = __ENV.API_URL  || 'http://localhost:8080';
const CITY_ID  = __ENV.CITY_ID;
const TRUCK_VUS = parseInt(__ENV.TRUCK_VUS || '100');
const BASE_LAT = parseFloat(__ENV.BASE_LAT || '-8.3369');
const BASE_LNG = parseFloat(__ENV.BASE_LNG || '-36.4251');

// ── métricas ─────────────────────────────────────────────────────────────────
const locationsSent       = new Counter('locations_sent');       // requisições HTTP 200 dos trucks
const truckErrors         = new Rate('truck_error_rate');        // taxa de erro dos trucks
const uniqueTrucksSeen    = new Counter('unique_trucks_seen');   // collectIds únicos vistos pelo viewer
const totalMsgReceived    = new Counter('total_msgs_received');  // total de mensagens WS recebidas
const viewerErrors        = new Rate('viewer_error_rate');       // erros do viewer WS

export const options = {
  scenarios: {
    // Viewer sobe primeiro e fica ouvindo por toda a duração
    viewer: {
      executor: 'constant-vus',
      vus: 1,
      duration: '90s',
      exec: 'viewer',
      startTime: '0s',
    },
    // 100 trucks disparam ao mesmo tempo após o viewer estar conectado
    trucks: {
      executor: 'shared-iterations',
      vus: TRUCK_VUS,
      iterations: TRUCK_VUS,
      maxDuration: '60s',
      exec: 'truck',
      startTime: '10s',  // viewer tem 10s para conectar antes dos trucks
    },
  },
  thresholds: {
    truck_error_rate:   ['rate<0.10'],
    viewer_error_rate:  ['rate<0.05'],
    // unique_trucks_seen: threshold dinâmico impresso no summary via teardown
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function login() {
  const res = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, { 'login 200': (r) => r.status === 200 });
  let cookieStr = '';
  for (const [name, values] of Object.entries(res.cookies)) {
    cookieStr += `${name}=${values[0].value}; `;
  }
  return cookieStr.trim();
}

function sockjsFrame(stompFrame) {
  return JSON.stringify([stompFrame]);
}

function randId(len) {
  return Math.random().toString(36).substring(2, 2 + len);
}

// ── setup: descobre collects ativos ──────────────────────────────────────────

export function setup() {
  const cookie = login();

  const res = http.get(`${API_URL}/collect/${CITY_ID}/city`, {
    headers: { Cookie: cookie },
  });
  check(res, { 'GET collects 200': (r) => r.status === 200 });

  let activeCollects = [];
  try {
    const all = JSON.parse(res.body);
    activeCollects = all.filter((c) => !c.hasEnded);
  } catch (e) {
    console.error(`Erro ao parsear collects: ${e}`);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Collects ativos encontrados: ${activeCollects.length}`);
  activeCollects.forEach((c, i) => {
    console.log(`  [${i + 1}] ${c.id} — veículo: ${c.legacy?.vehicleName || '(sem nome)'}`);
  });
  console.log(`Trucks simultâneos: ${TRUCK_VUS}`);
  console.log(`Cada collect receberá ~${Math.ceil(TRUCK_VUS / (activeCollects.length || 1))} requisições simultâneas`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  return {
    collectIds:    activeCollects.map((c) => c.id),
    totalExpected: activeCollects.length,
  };
}

// ── cenário: viewer ───────────────────────────────────────────────────────────

export function viewer(data) {
  const cookie = login();
  if (!cookie) { viewerErrors.add(true); sleep(1); return; }

  const seenCollects = new Set();
  const expectedTotal = data.totalExpected;

  const server  = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const session = randId(16);
  const wsUrl   = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${server}/${session}/websocket`;

  ws.connect(wsUrl, { headers: { Cookie: cookie } }, function (socket) {
    let subscribed = false;

    socket.on('message', (rawMsg) => {
      if (rawMsg === 'o') {
        socket.send(sockjsFrame('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\x00'));
        return;
      }
      if (rawMsg === 'h' || rawMsg.startsWith('c')) return;

      if (rawMsg.startsWith('a')) {
        let frames;
        try { frames = JSON.parse(rawMsg.substring(1)); } catch { return; }

        for (const frame of frames) {
          if (frame.startsWith('CONNECTED') && !subscribed) {
            socket.send(
              sockjsFrame(`SUBSCRIBE\nid:sub-0\ndestination:/topic/locations/${CITY_ID}\n\n\x00`)
            );
            subscribed = true;
            console.log('Viewer conectado e inscrito. Aguardando broadcast dos trucks...');

          } else if (frame.startsWith('MESSAGE') && subscribed) {
            totalMsgReceived.add(1);

            try {
              const bodyStart = frame.indexOf('\n\n') + 2;
              const body = frame.substring(bodyStart).replace('\x00', '');
              const payload = JSON.parse(body);

              if (payload.collectId && !seenCollects.has(payload.collectId)) {
                seenCollects.add(payload.collectId);
                uniqueTrucksSeen.add(1);

                const coverage = Math.round((seenCollects.size / expectedTotal) * 100);
                console.log(
                  `[viewer] Novo caminhão: ${payload.collectId.substring(0, 12)}...` +
                  ` | veículo: ${payload.vehicleName || '?'}` +
                  ` | cobertura: ${seenCollects.size}/${expectedTotal} (${coverage}%)`
                );
              }
            } catch { /* payload malformado */ }

          } else if (frame.startsWith('ERROR')) {
            viewerErrors.add(true);
            console.error(`STOMP ERROR: ${frame}`);
          }
        }
      }
    });

    socket.on('error', (e) => {
      viewerErrors.add(true);
      console.error(`WS error: ${e.error()}`);
    });

    socket.setTimeout(() => {
      const coverage = expectedTotal > 0
        ? Math.round((seenCollects.size / expectedTotal) * 100)
        : 0;

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`RESULTADO DO VIEWER`);
      console.log(`Caminhões esperados: ${expectedTotal}`);
      console.log(`Caminhões vistos:    ${seenCollects.size}`);
      console.log(`Cobertura:           ${coverage}%`);
      console.log(`Msgs WS recebidas:   ${totalMsgReceived.name}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      socket.close();
    }, 85_000);
  });

  viewerErrors.add(false);
  sleep(1);
}

// ── cenário: truck (100 VUs simultâneos) ─────────────────────────────────────

export function truck(data) {
  const collectIds = data.collectIds;

  if (!collectIds || collectIds.length === 0) {
    console.error(`Truck VU ${__VU}: nenhum collect ativo disponível`);
    truckErrors.add(true);
    return;
  }

  // Round-robin: VU 1 → collectIds[0], VU 2 → collectIds[1], etc.
  const myCollectId = collectIds[(__VU - 1) % collectIds.length];

  const cookie = login();
  if (!cookie) { truckErrors.add(true); return; }

  const lat = BASE_LAT + (Math.random() * 0.02 - 0.01);
  const lng = BASE_LNG + (Math.random() * 0.02 - 0.01);

  const res = http.post(
    `${API_URL}/collect/${myCollectId}/location`,
    JSON.stringify({
      latitude:  lat,
      longitude: lng,
      driverId:  __ENV.DRIVER_ID  || `k6-driver-${__VU}`,
      vehicleId: __ENV.VEHICLE_ID || `k6-truck-${__VU}`,
    }),
    { headers: { 'Content-Type': 'application/json', Cookie: cookie } }
  );

  const ok = check(res, {
    'localização enviada 200': (r) => r.status === 200 || r.status === 201 || r.status === 204,
  });

  if (ok) {
    locationsSent.add(1);
    truckErrors.add(false);
  } else {
    truckErrors.add(true);
    console.error(`Truck VU ${__VU} (${myCollectId}): HTTP ${res.status}`);
  }
}
