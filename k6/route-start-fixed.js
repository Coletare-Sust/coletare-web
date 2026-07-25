import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Versão com VUs fixos para tabela comparativa (5 / 10 / 50 / 100 drivers).
// Env vars: E2E_EMAIL, E2E_PASSWORD, CITY_ID, COLLECT_ID
// Opcional: DRIVER_VUS (padrão 10), DURATION (padrão 45s)

const API_URL    = __ENV.API_URL    || 'http://localhost:8080';
const CITY_ID    = __ENV.CITY_ID;
const DRIVER_VUS = parseInt(__ENV.DRIVER_VUS  || '10');
const DURATION   = __ENV.DURATION             || '45s';
const SLEEP_S    = parseFloat(__ENV.SLEEP_S   || '5');

const loginMs       = new Trend('login_duration_ms',       true);
const routeStartMs  = new Trend('route_start_duration_ms', true);
const routeErrors   = new Rate('route_start_errors');
const loginErrors   = new Rate('login_errors');
const msgsViewer    = new Counter('msgs_recebidas');

export const options = {
  scenarios: {
    viewer: {
      executor: 'constant-vus', vus: 1, duration: DURATION,
      exec: 'viewer', startTime: '0s',
    },
    drivers: {
      executor: 'constant-vus', vus: DRIVER_VUS, duration: DURATION,
      exec: 'driver', startTime: '5s',
    },
  },
  thresholds: {
    login_duration_ms:      ['p(95)<5000'],
    route_start_duration_ms:['p(95)<5000'],
    route_start_errors:     ['rate<0.10'],
  },
};

export function setup() {
  const res = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  let cookie = '';
  for (const [n, v] of Object.entries(res.cookies)) cookie += `${n}=${v[0].value}; `;

  const ids = __ENV.COLLECT_ID
    ? __ENV.COLLECT_ID.split(',').map(s => s.trim())
    : (() => {
        const r = http.get(`${API_URL}/collect/${CITY_ID}/city`, { headers: { Cookie: cookie } });
        return JSON.parse(r.body).filter(c => !c.hasEnded).map(c => c.id);
      })();

  return { collectIds: ids };
}

function doLogin() {
  const t0 = Date.now();
  const res = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  loginMs.add(Date.now() - t0);
  const ok = check(res, { 'login 200': r => r.status === 200 });
  loginErrors.add(!ok);
  if (!ok) return null;
  let c = '';
  for (const [n, v] of Object.entries(res.cookies)) c += `${n}=${v[0].value}; `;
  return c.trim();
}

function frame(f) { return JSON.stringify([f]); }
function rid(l)   { return Math.random().toString(36).substring(2, 2 + l); }

export function viewer() {
  const cookie = doLogin();
  if (!cookie) { sleep(1); return; }
  const wsUrl = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws/${
    Math.floor(Math.random()*1000).toString().padStart(3,'0')}/${rid(16)}/websocket`;

  ws.connect(wsUrl, { headers: { Cookie: cookie } }, socket => {
    let sub = false;
    socket.on('message', raw => {
      if (raw === 'o') { socket.send(frame('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\x00')); return; }
      if (raw === 'h' || raw.startsWith('c') || !raw.startsWith('a')) return;
      let frames; try { frames = JSON.parse(raw.substring(1)); } catch { return; }
      for (const f of frames) {
        if (f.startsWith('CONNECTED') && !sub) {
          socket.send(frame(`SUBSCRIBE\nid:sub-0\ndestination:/topic/locations/${CITY_ID}\n\n\x00`));
          sub = true;
        }
        if (f.startsWith('MESSAGE') && sub) msgsViewer.add(1);
      }
    });
    socket.setTimeout(() => socket.close(), 120_000);
  });
  sleep(1);
}

export function driver(data) {
  const { collectIds } = data;
  if (!collectIds?.length) { routeErrors.add(true); return; }
  const collectId = collectIds[(__VU - 1) % collectIds.length];

  const cookie = doLogin();
  if (!cookie) { routeErrors.add(true); sleep(1); return; }

  const lat = -8.3369 + (Math.random() * 0.02 - 0.01);
  const lng = -36.4251 + (Math.random() * 0.02 - 0.01);

  const t0 = Date.now();
  const res = http.post(
    `${API_URL}/collect/${collectId}/location`,
    JSON.stringify({
      latitude: lat, longitude: lng,
      driverId:  __ENV.DRIVER_ID  || `driver-${__VU}`,
      vehicleId: __ENV.VEHICLE_ID || `truck-${__VU}`,
    }),
    { headers: { 'Content-Type': 'application/json', Cookie: cookie } }
  );
  routeStartMs.add(Date.now() - t0);

  const ok = check(res, { 'rota iniciada 2xx': r => r.status >= 200 && r.status < 300 });
  routeErrors.add(!ok);
  sleep(SLEEP_S + Math.random() * 0.5);
}
