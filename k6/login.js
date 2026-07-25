import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Env vars: E2E_EMAIL, E2E_PASSWORD, API_URL, VUS, DURATION
// Ex: k6 run -e E2E_EMAIL=user@x.com -e E2E_PASSWORD=pass -e VUS=20 -e DURATION=30s k6/login.js

const errorRate = new Rate('login_errors');

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 10,
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    login_errors: ['rate<0.01'],
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  const payload = JSON.stringify({
    email: __ENV.E2E_EMAIL,
    password: __ENV.E2E_PASSWORD,
    authType: 'LOCAL',
  });

  const res = http.post(`${API_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'tem cookie de sessão': (r) => r.headers['Set-Cookie'] !== undefined,
    'resposta < 2s': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!ok);

  sleep(1);
}
