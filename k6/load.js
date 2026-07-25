import http from 'k6/http';
import { check, sleep } from 'k6';

// Teste de carga genérico para qualquer endpoint REST do backend.
//
// Env vars obrigatórias: TARGET_URL
// Env vars opcionais:
//   E2E_EMAIL / E2E_PASSWORD  — faz login antes de cada iteração e usa o cookie de sessão
//   VUS                       — virtual users (padrão: 50)
//   DURATION                  — duração do teste (padrão: 30s)
//   SLEEP                     — pausa entre iterações em segundos (padrão: 0.3)
//
// Exemplos:
//   # Testar listagem de rotas com sessão autenticada (50 VUs por 1 min):
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e TARGET_URL=http://localhost:8080/route/CITY_ID/city \
//          -e VUS=50 -e DURATION=1m k6/load.js
//
//   # Testar endpoint público sem auth:
//   k6 run -e TARGET_URL=http://localhost:8080/actuator/health -e VUS=10 -e DURATION=30s k6/load.js

const API_URL = __ENV.API_URL || 'http://localhost:8080';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 50,
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const headers = { Accept: 'application/json' };

  // Login opcional: se as credenciais forem passadas, obtém cookie de sessão
  if (__ENV.E2E_EMAIL && __ENV.E2E_PASSWORD) {
    const loginRes = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(loginRes, { 'login ok': (r) => r.status === 200 });

    const setCookie = loginRes.headers['Set-Cookie'];
    if (setCookie) {
      headers['Cookie'] = setCookie.split(';')[0];
    }
  }

  const res = http.get(__ENV.TARGET_URL, { headers });

  check(res, {
    'status 200 ou 304': (r) => r.status === 200 || r.status === 304,
    'resposta < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(__ENV.SLEEP ? parseFloat(__ENV.SLEEP) : 0.3);
}
