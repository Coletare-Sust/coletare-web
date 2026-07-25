import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Mede a latência de broadcast do backend: tempo entre o POST /location do
// caminhão e a chegada da mensagem WebSocket no viewer.
//
// Design (corrigido):
//   1. VU abre WebSocket  →  se inscreve em /topic/locations/{cityId}
//   2. Aguarda 300ms para garantir que o servidor registrou a subscrição
//   3. Dispara POST /collect/{id}/location  (WS permanece aberto!)
//   4. Aguarda o MESSAGE chegar via WS (broadcast do backend)
//   5. latência = tempo do POST até receber o MESSAGE
//
// O erro do design anterior era fechar o WS antes do POST — o broadcast
// chegava sem ninguém inscrito. Aqui o WS nunca fecha entre os passos.
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta admin
//   CITY_ID                  — ID da cidade
//   COLLECT_ID               — ID de uma coleta ativa (hasEnded=false)
//
// Env vars opcionais:
//   API_URL        — padrão: http://localhost:8080
//   DRIVER_ID      — padrão: k6-latency
//   VEHICLE_ID     — padrão: k6-latency-vehicle
//   VUS            — VUs simultâneos (padrão: 1)
//   ITERATIONS     — medições por VU (padrão: 10)
//   WS_TIMEOUT_MS  — timeout aguardando MESSAGE após o POST (padrão: 8000)
//   SUBSCRIBE_WAIT — ms aguardando subscrição ser registrada (padrão: 300)
//   BASE_LAT       — latitude base (padrão: -8.3369)
//   BASE_LNG       — longitude base (padrão: -36.4251)
//
// Exemplos:
//   # Medição limpa (1 VU, 10 iterações):
//   k6 run -e E2E_EMAIL=x -e E2E_PASSWORD=y -e CITY_ID=c -e COLLECT_ID=col \
//          k6/broadcast-latency.js
//
//   # Ver degradação com 20 VUs simultâneos:
//   k6 run -e E2E_EMAIL=x -e E2E_PASSWORD=y -e CITY_ID=c -e COLLECT_ID=col \
//          -e VUS=20 -e ITERATIONS=5 k6/broadcast-latency.js

const API_URL       = __ENV.API_URL       || 'http://localhost:8080';
const CITY_ID       = __ENV.CITY_ID;
const COLLECT_ID    = __ENV.COLLECT_ID;
const BASE_LAT      = parseFloat(__ENV.BASE_LAT      || '-8.3369');
const BASE_LNG      = parseFloat(__ENV.BASE_LNG      || '-36.4251');
const WS_TIMEOUT_MS = parseInt(__ENV.WS_TIMEOUT_MS   || '8000');
const SUBSCRIBE_WAIT = parseInt(__ENV.SUBSCRIBE_WAIT || '300');

// ── métricas ─────────────────────────────────────────────────────────────────
const broadcastLatency = new Trend('broadcast_latency_ms', true); // POST → MESSAGE
const wsConnectTime    = new Trend('ws_connect_ms',        true); // tempo de handshake WS
const timeouts         = new Counter('broadcast_timeouts');        // sem MESSAGE no prazo
const postErrors       = new Counter('post_errors');               // falha no POST HTTP
const successRate      = new Rate('broadcast_success_rate');       // medições completas

export const options = {
  vus:        __ENV.VUS        ? parseInt(__ENV.VUS)        : 1,
  iterations: __ENV.ITERATIONS ? parseInt(__ENV.ITERATIONS) : 10,
  thresholds: {
    broadcast_latency_ms:   ['p(50)<500', 'p(95)<2000'],
    broadcast_timeouts:     ['count<3'],
    broadcast_success_rate: ['rate>0.80'],
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

function sockjsUrl() {
  const server  = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const session = Math.random().toString(36).substring(2, 18);
  return `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${server}/${session}/websocket`;
}

function sockjsFrame(stompFrame) {
  return JSON.stringify([stompFrame]);
}

// ── cenário principal ─────────────────────────────────────────────────────────

export default function () {
  const cookie = login();
  if (!cookie) { sleep(1); return; }

  let subscribed   = false;
  let postFired    = false;
  let received     = false;
  let sentAt       = 0;

  const t0 = Date.now();

  ws.connect(sockjsUrl(), { headers: { Cookie: cookie } }, function (socket) {
    wsConnectTime.add(Date.now() - t0);

    // ── handler de mensagens WS ──────────────────────────────────────────────
    socket.on('message', (rawMsg) => {
      if (rawMsg === 'o') {
        socket.send(sockjsFrame('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\x00'));
        return;
      }
      if (rawMsg === 'h' || rawMsg.startsWith('c')) return;
      if (!rawMsg.startsWith('a')) return;

      let frames;
      try { frames = JSON.parse(rawMsg.substring(1)); } catch { return; }

      for (const frame of frames) {

        // Passo 1: CONNECTED → inscreve no tópico
        if (frame.startsWith('CONNECTED') && !subscribed) {
          socket.send(
            sockjsFrame(`SUBSCRIBE\nid:sub-0\ndestination:/topic/locations/${CITY_ID}\n\n\x00`)
          );
          subscribed = true;
        }

        // Passo 3: MESSAGE do broadcast → mede latência
        if (frame.startsWith('MESSAGE') && postFired && !received) {
          const latency = Date.now() - sentAt;
          broadcastLatency.add(latency);
          received = true;
          successRate.add(true);
          socket.close();
        }

        if (frame.startsWith('ERROR')) {
          postErrors.add(1);
          successRate.add(false);
          socket.close();
        }
      }
    });

    socket.on('error', () => {
      postErrors.add(1);
      successRate.add(false);
    });

    // ── Passo 2: aguarda SUBSCRIBE_WAIT ms, depois dispara o POST ────────────
    // O WS fica ABERTO durante todo esse tempo — garantia de que o broadcast
    // vai encontrar o subscriber registrado no servidor.
    socket.setTimeout(() => {
      if (!subscribed) {
        // CONNECTED não chegou no prazo — desiste
        timeouts.add(1);
        successRate.add(false);
        socket.close();
        return;
      }

      const lat = BASE_LAT + (Math.random() * 0.002 - 0.001);
      const lng = BASE_LNG + (Math.random() * 0.002 - 0.001);

      sentAt    = Date.now();
      postFired = true;

      // HTTP POST (bloqueante dentro do event loop do WS)
      // Quando retornar, o MESSAGE já estará no buffer TCP e será processado
      const res = http.post(
        `${API_URL}/collect/${COLLECT_ID}/location`,
        JSON.stringify({
          latitude:  lat,
          longitude: lng,
          driverId:  __ENV.DRIVER_ID  || 'k6-latency',
          vehicleId: __ENV.VEHICLE_ID || 'k6-latency-vehicle',
        }),
        { headers: { 'Content-Type': 'application/json', Cookie: cookie } }
      );

      const postOk = check(res, {
        'POST location 2xx': (r) => r.status >= 200 && r.status < 300,
      });

      if (!postOk) {
        postErrors.add(1);
        successRate.add(false);
        postFired = false;
        socket.close();
        return;
      }

      // Timeout: se MESSAGE não chegar em WS_TIMEOUT_MS após o POST, desiste
      socket.setTimeout(() => {
        if (!received) {
          timeouts.add(1);
          successRate.add(false);
          console.warn(`VU ${__VU}: timeout ${WS_TIMEOUT_MS}ms sem broadcast`);
        }
        socket.close();
      }, WS_TIMEOUT_MS);

    }, SUBSCRIBE_WAIT);
  });

  sleep(1);
}
