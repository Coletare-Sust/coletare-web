import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Cenário misto: simula caminhões atualizando localização enquanto viewers assistem ao mapa.
// Mede a latência de broadcast do backend (tempo entre envio e recebimento).
//
// Dois grupos de VUs rodam em paralelo:
//
//   "viewers"  — administradores com mapa aberto (WebSocket/STOMP, passivos)
//   "trucks"   — app do caminhoneiro enviando localização via PUT /collect/{id}
//
// Fluxo do grupo "trucks":
//   1. Login como veículo/admin
//   2. PUT /collect/{COLLECT_ID} com latitude/longitude atualizados a cada TRUCK_INTERVAL segundos
//      → o backend recebe e faz broadcast via STOMP para todos os viewers do CITY_ID
//
// Fluxo do grupo "viewers":
//   1. Login como admin
//   2. Abre WebSocket STOMP em /topic/locations/{CITY_ID}
//   3. Conta mensagens recebidas e mede latência (se o payload incluir timestamp)
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta admin (usada pelos viewers)
//   CITY_ID                  — ID da cidade
//   COLLECT_ID               — ID de uma coleta ativa (para o PUT /collect/{id})
//
// Env vars opcionais:
//   API_URL          — padrão: http://localhost:8080
//   VIEWER_VUS       — VUs viewers simultâneos (padrão: 10)
//   TRUCK_VUS        — VUs trucks simultâneos (padrão: 3)
//   TRUCK_INTERVAL   — segundos entre envios de localização por caminhão (padrão: 5)
//   TEST_DURATION    — duração total do cenário (padrão: 2m)
//   BASE_LAT         — latitude base do percurso (padrão: -8.3369)
//   BASE_LNG         — longitude base do percurso (padrão: -36.4251)
//
// Exemplo:
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e CITY_ID=abc123 -e COLLECT_ID=col789 \
//          -e VIEWER_VUS=20 -e TRUCK_VUS=5 k6/truck-simulator.js

const API_URL = __ENV.API_URL || 'http://localhost:8080';
const CITY_ID = __ENV.CITY_ID;
const COLLECT_ID = __ENV.COLLECT_ID;
const TRUCK_INTERVAL_S = parseFloat(__ENV.TRUCK_INTERVAL || '5');
const BASE_LAT = parseFloat(__ENV.BASE_LAT || '-8.3369');
const BASE_LNG = parseFloat(__ENV.BASE_LNG || '-36.4251');
const TEST_DURATION = __ENV.TEST_DURATION || '2m';
const VIEWER_VUS = parseInt(__ENV.VIEWER_VUS || '10');
const TRUCK_VUS = parseInt(__ENV.TRUCK_VUS || '3');

// Métricas
const locationsSent = new Counter('locations_sent');
const locationsReceived = new Counter('locations_received');
const broadcastLatency = new Trend('broadcast_latency_ms', true);
const truckErrors = new Counter('truck_update_errors');
const viewerErrors = new Rate('viewer_error_rate');

export const options = {
  scenarios: {
    viewers: {
      executor: 'constant-vus',
      vus: VIEWER_VUS,
      duration: TEST_DURATION,
      exec: 'viewer',
    },
    trucks: {
      executor: 'constant-vus',
      vus: TRUCK_VUS,
      duration: TEST_DURATION,
      exec: 'truck',
      startTime: '5s',  // viewers conectam primeiro
    },
  },
  thresholds: {
    locations_sent: [`count>${TRUCK_VUS * 3}`],
    viewer_error_rate: ['rate<0.10'],
    http_req_duration: ['p(95)<2000'],
  },
};

// ─── helpers compartilhados ────────────────────────────────────────────────

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

// ─── cenário: viewer (WebSocket/STOMP) ────────────────────────────────────

export function viewer() {
  const cookie = login();
  if (!cookie) { sleep(2); return; }

  const server = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const session = randId(16);
  const wsUrl = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${server}/${session}/websocket`;

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

          } else if (frame.startsWith('MESSAGE') && subscribed) {
            locationsReceived.add(1);

            // Se o payload incluir um campo "sentAt" (ms epoch), calcula latência
            try {
              const bodyStart = frame.indexOf('\n\n') + 2;
              const body = frame.substring(bodyStart).replace('\x00', '');
              const payload = JSON.parse(body);
              if (payload.sentAt) {
                broadcastLatency.add(Date.now() - payload.sentAt);
              }
            } catch { /* payload sem timestamp — normal */ }

          } else if (frame.startsWith('ERROR')) {
            viewerErrors.add(true);
          }
        }
      }
    });

    socket.on('error', () => viewerErrors.add(true));

    // Fica conectado enquanto o cenário rodar
    socket.setTimeout(() => socket.close(), 120_000);
  });

  sleep(1);
}

// ─── cenário: truck (HTTP PUT de localização) ─────────────────────────────

export function truck() {
  const cookie = login();
  if (!cookie) { sleep(2); return; }

  // Simula o caminhão percorrendo uma rota: move ~50m por atualização
  let lat = BASE_LAT + (Math.random() * 0.02 - 0.01);
  let lng = BASE_LNG + (Math.random() * 0.02 - 0.01);

  // Envia atualizações enquanto o cenário estiver ativo (loop interno)
  for (let i = 0; i < 100; i++) {
    lat += 0.0005 * (Math.random() > 0.5 ? 1 : -1);
    lng += 0.0005 * (Math.random() > 0.5 ? 1 : -1);

    const body = JSON.stringify({
      latitude: lat,
      longitude: lng,
      driverId: __ENV.DRIVER_ID,
      vehicleId: __ENV.VEHICLE_ID || 'k6-load-test',
    });

    const res = http.post(`${API_URL}/collect/${COLLECT_ID}/location`, body, {
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    });

    const ok = check(res, {
      'localização enviada 200': (r) => r.status === 200 || r.status === 201 || r.status === 204,
    });

    if (ok) {
      locationsSent.add(1);
    } else {
      truckErrors.add(1);
      if (res.status === 401) {
        // Sessão expirou — reconecta
        break;
      }
    }

    sleep(TRUCK_INTERVAL_S);
  }
}
