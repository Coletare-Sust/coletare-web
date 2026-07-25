import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Simula o fluxo completo de um administrador municipal:
//   1. Carrega a página de login do Next.js  (GET /  → Next.js :3000)
//   2. Faz login via backend                 (POST /auth/login → Spring :8080)
//   3. Carrega a página de monitoramento     (GET /rotas-andamento → Next.js :3000)
//   4. Abre WebSocket no backend             (ws://localhost:8080/ws/...)
//   5. Subscreve /topic/locations/{cityId}   (STOMP SUBSCRIBE)
//   6. Fica ouvindo mensagens em tempo real
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta admin
//   CITY_ID                  — ID da cidade
//
// Env vars opcionais:
//   FRONTEND_URL  — padrão: http://localhost:3000
//   API_URL       — padrão: http://localhost:8080
//   VIEWER_VUS    — viewers simultâneos (padrão: 10)
//   TEST_DURATION — duração (padrão: 60s)
//
// Exemplo:
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e CITY_ID=abc123 -e VIEWER_VUS=50 k6/fullstack-viewer.js

const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';
const API_URL      = __ENV.API_URL      || 'http://localhost:8080';
const CITY_ID      = __ENV.CITY_ID;
const VIEWER_VUS   = parseInt(__ENV.VIEWER_VUS   || '10');
const TEST_DURATION = __ENV.TEST_DURATION || '60s';

// ── métricas ────────────────────────────────────────────────────────────────
const pageLoginTime       = new Trend('page_login_ms',       true); // GET / Next.js
const pageMonitorTime     = new Trend('page_monitor_ms',     true); // GET /rotas-andamento Next.js
const wsConnectTime       = new Trend('ws_connect_ms',       true); // handshake WebSocket
const stompConnectedTime  = new Trend('stomp_connected_ms',  true); // até receber CONNECTED
const locationsReceived   = new Counter('locations_received');
const viewerErrors        = new Rate('viewer_error_rate');

export const options = {
  scenarios: {
    viewers: {
      executor: 'constant-vus',
      vus: VIEWER_VUS,
      duration: TEST_DURATION,
      exec: 'viewer',
    },
  },
  thresholds: {
    page_login_ms:      ['p(95)<3000'],
    page_monitor_ms:    ['p(95)<3000'],
    ws_connect_ms:      ['p(95)<5000'],
    stomp_connected_ms: ['p(95)<6000'],
    viewer_error_rate:  ['rate<0.10'],
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function sockjsFrame(stompFrame) {
  return JSON.stringify([stompFrame]);
}

function randId(len) {
  return Math.random().toString(36).substring(2, 2 + len);
}

// ── cenário principal ─────────────────────────────────────────────────────────

export function viewer() {

  // PASSO 1 — carrega página de login do Next.js
  const t0Login = Date.now();
  const loginPage = http.get(`${FRONTEND_URL}/`, {
    headers: { Accept: 'text/html' },
  });
  pageLoginTime.add(Date.now() - t0Login);
  const loginPageOk = check(loginPage, {
    'Next.js login page 200': (r) => r.status === 200,
  });
  if (!loginPageOk) {
    viewerErrors.add(true);
    sleep(1);
    return;
  }

  // PASSO 2 — autentica no backend (igual ao que o JS do browser faz)
  const authRes = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const authOk = check(authRes, { 'login 200': (r) => r.status === 200 });
  if (!authOk) {
    viewerErrors.add(true);
    sleep(1);
    return;
  }

  let cookieStr = '';
  for (const [name, values] of Object.entries(authRes.cookies)) {
    cookieStr += `${name}=${values[0].value}; `;
  }
  const cookie = cookieStr.trim();

  // PASSO 3 — carrega página /rotas-andamento do Next.js (com cookie de sessão)
  const t0Monitor = Date.now();
  const monitorPage = http.get(`${FRONTEND_URL}/rotas-andamento`, {
    headers: { Accept: 'text/html', Cookie: cookie },
  });
  pageMonitorTime.add(Date.now() - t0Monitor);
  const monitorOk = check(monitorPage, {
    'Next.js /rotas-andamento 200': (r) => r.status === 200,
  });
  if (!monitorOk) {
    viewerErrors.add(true);
    sleep(1);
    return;
  }

  // PASSO 4 — abre WebSocket no backend (igual ao SockJS/STOMP do browser)
  const server  = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const session = randId(16);
  const wsUrl   = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${server}/${session}/websocket`;

  const t0Ws = Date.now();

  ws.connect(wsUrl, { headers: { Cookie: cookie } }, function (socket) {
    wsConnectTime.add(Date.now() - t0Ws);

    let subscribed = false;
    const stompStart = Date.now();

    socket.on('message', (rawMsg) => {
      // SockJS open → manda STOMP CONNECT
      if (rawMsg === 'o') {
        socket.send(sockjsFrame('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\x00'));
        return;
      }
      if (rawMsg === 'h' || rawMsg.startsWith('c')) return;

      if (rawMsg.startsWith('a')) {
        let frames;
        try { frames = JSON.parse(rawMsg.substring(1)); } catch { return; }

        for (const frame of frames) {
          // PASSO 5 — subscreve ao tópico da cidade
          if (frame.startsWith('CONNECTED') && !subscribed) {
            stompConnectedTime.add(Date.now() - stompStart);
            socket.send(
              sockjsFrame(`SUBSCRIBE\nid:sub-0\ndestination:/topic/locations/${CITY_ID}\n\n\x00`)
            );
            subscribed = true;

          // PASSO 6 — conta mensagens de localização recebidas
          } else if (frame.startsWith('MESSAGE') && subscribed) {
            locationsReceived.add(1);

          } else if (frame.startsWith('ERROR')) {
            viewerErrors.add(true);
          }
        }
      }
    });

    socket.on('error', () => viewerErrors.add(true));

    socket.setTimeout(() => socket.close(), 120_000);
  });

  viewerErrors.add(false);
  sleep(1);
}
