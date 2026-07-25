import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Testa conexões WebSocket/STOMP simultâneas na página /rotas-andamento.
// Cada VU simula um administrador municipal que abre o mapa de monitoramento ao vivo.
//
// O que cada VU faz:
//   1. Faz login via POST /auth/login (obtém cookie de sessão)
//   2. Abre conexão WebSocket via SockJS em /ws/{server}/{session}/websocket
//   3. Envia STOMP CONNECT
//   4. Aguarda STOMP CONNECTED do servidor
//   5. Envia STOMP SUBSCRIBE em /topic/locations/{cityId}
//   6. Fica ouvindo mensagens pelo tempo configurado (MONITOR_DURATION)
//   7. Desconecta limpo
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta de administrador municipal
//   CITY_ID                  — ID da cidade para monitorar
//
// Env vars opcionais:
//   API_URL          — padrão: http://localhost:8080
//   MAX_VUS          — pico de VUs (padrão: 20)
//   MONITOR_DURATION — segundos que cada VU fica conectado (padrão: 30)
//
// Exemplo — ramp up para 50 viewers simultâneos:
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e CITY_ID=abc123 -e MAX_VUS=50 k6/rotas-andamento-ws.js

const API_URL = __ENV.API_URL || 'http://localhost:8080';
const CITY_ID = __ENV.CITY_ID;
const MAX_VUS = parseInt(__ENV.MAX_VUS || '20');
const MONITOR_DURATION_S = parseInt(__ENV.MONITOR_DURATION || '30');

const wsConnectTime = new Trend('ws_connect_time_ms', true);
const stompConnectedTime = new Trend('stomp_connected_time_ms', true);
const messagesReceived = new Counter('stomp_location_messages');
const connectionErrors = new Counter('ws_connection_errors');
const stompErrors = new Rate('stomp_error_rate');

export const options = {
  stages: [
    { duration: '20s', target: MAX_VUS },       // ramp up
    { duration: `${MONITOR_DURATION_S}s`, target: MAX_VUS }, // steady state
    { duration: '10s', target: 0 },              // ramp down
  ],
  thresholds: {
    ws_connect_time_ms: ['p(95)<5000'],
    stomp_connected_time_ms: ['p(95)<3000'],
    stomp_error_rate: ['rate<0.05'],
    checks: ['rate>0.90'],
  },
};

// Gera IDs aleatórios para o path do SockJS (/{server}/{session}/websocket)
function randomServerId() {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}
function randomSessionId() {
  return Math.random().toString(36).substring(2, 18);
}

// Frames SockJS: o cliente envia mensagens como array JSON: ["STOMP_FRAME"]
function sockjsFrame(stompFrame) {
  return JSON.stringify([stompFrame]);
}

// Frames STOMP (terminam com byte nulo \x00)
const STOMP_CONNECT =
  'CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\x00';

function stompSubscribe(cityId) {
  return `SUBSCRIBE\nid:sub-0\ndestination:/topic/locations/${cityId}\n\n\x00`;
}

const STOMP_DISCONNECT = 'DISCONNECT\nreceipt:bye\n\n\x00';

function login() {
  const res = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, { 'login 200': (r) => r.status === 200 });
  if (!ok) {
    connectionErrors.add(1);
    return null;
  }

  let cookieStr = '';
  for (const [name, values] of Object.entries(res.cookies)) {
    cookieStr += `${name}=${values[0].value}; `;
  }
  return cookieStr.trim();
}

export default function () {
  const cookie = login();
  if (!cookie) {
    sleep(1);
    return;
  }

  const server = randomServerId();
  const session = randomSessionId();
  const wsUrl = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${server}/${session}/websocket`;

  const connectStart = Date.now();

  const res = ws.connect(wsUrl, { headers: { Cookie: cookie } }, function (socket) {
    wsConnectTime.add(Date.now() - connectStart);

    let stompConnectedAt = null;
    let subscribed = false;

    socket.on('open', () => {
      // SockJS envia "o" (open frame) antes de qualquer mensagem STOMP
      // Não precisamos fazer nada aqui — esperamos o "o" no handler de message
    });

    socket.on('message', (rawMsg) => {
      // SockJS open frame
      if (rawMsg === 'o') {
        socket.send(sockjsFrame(STOMP_CONNECT));
        return;
      }

      // SockJS heartbeat
      if (rawMsg === 'h') return;

      // SockJS close frame
      if (rawMsg.startsWith('c')) return;

      // SockJS message frame: a["STOMP_FRAME"]
      if (rawMsg.startsWith('a')) {
        let frames;
        try {
          frames = JSON.parse(rawMsg.substring(1));
        } catch {
          return;
        }

        for (const frame of frames) {
          if (frame.startsWith('CONNECTED')) {
            stompConnectedAt = Date.now();
            stompConnectedTime.add(stompConnectedAt - connectStart);

            check(frame, { 'STOMP CONNECTED': (f) => f.includes('CONNECTED') });
            stompErrors.add(false);

            // Inscreve no tópico da cidade
            socket.send(sockjsFrame(stompSubscribe(CITY_ID)));
            subscribed = true;

          } else if (frame.startsWith('MESSAGE') && subscribed) {
            // Mensagem de localização de caminhão recebida
            messagesReceived.add(1);

            try {
              const bodyStart = frame.indexOf('\n\n') + 2;
              const body = frame.substring(bodyStart).replace('\x00', '');
              const payload = JSON.parse(body);

              check(payload, {
                'payload tem collectId': (p) => !!p.collectId,
                'payload tem latitude': (p) => typeof p.latitude === 'number',
              });
            } catch {
              // payload malformado — não quebra o teste
            }

          } else if (frame.startsWith('ERROR')) {
            stompErrors.add(true);
            console.error(`STOMP ERROR no VU ${__VU}: ${frame}`);
            socket.close();
          }
        }
      }
    });

    socket.on('error', (e) => {
      connectionErrors.add(1);
      console.error(`WS error no VU ${__VU}: ${e.error()}`);
    });

    // Mantém a conexão aberta pelo tempo de monitoramento configurado
    socket.setTimeout(() => {
      if (subscribed) {
        socket.send(sockjsFrame(STOMP_DISCONNECT));
      }
      socket.close();
    }, MONITOR_DURATION_S * 1000);
  });

  check(res, { 'WS status 101': (r) => r && r.status === 101 });

  sleep(1);
}
