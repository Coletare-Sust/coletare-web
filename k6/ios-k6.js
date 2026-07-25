import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Simula o app do cidadão criando solicitações de retirada (withdrawal requests).
// Equivalente ao que o ios-k6.js antigo fazia via Firebase — agora usa a API REST do backend.
//
// Env vars obrigatórias:
//   E2E_EMAIL, E2E_PASSWORD  — conta com permissão para criar solicitações
//   CITY_ID                  — ID da cidade destino
//   REQUESTER_ID             — ID do usuário solicitante (citizen)
//
// Env vars opcionais:
//   API_URL      — padrão: http://localhost:8080
//   VUS          — padrão: 10
//   DURATION     — padrão: 1m
//   RESIDUE_TYPE — padrão: ORGANIC (ver enum backend: ORGANIC | RECYCLABLE | ELECTRONIC | HAZARDOUS)
//   LATITUDE     — latitude do endereço (padrão: -8.3369)
//   LONGITUDE    — longitude do endereço (padrão: -36.4251)
//   SLEEP        — pausa entre iterações (padrão: 1s)
//
// Exemplo:
//   k6 run -e E2E_EMAIL=x@x.com -e E2E_PASSWORD=pass \
//          -e CITY_ID=abc123 -e REQUESTER_ID=user456 \
//          -e VUS=20 -e DURATION=2m k6/ios-k6.js

const created = new Counter('withdrawal_requests_created');
const errors = new Counter('withdrawal_request_errors');

const API_URL = __ENV.API_URL || 'http://localhost:8080';
const CITY_ID = __ENV.CITY_ID;

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 10,
  duration: __ENV.DURATION || '1m',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    withdrawal_request_errors: ['count<5'],
  },
};

function login() {
  const res = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: __ENV.E2E_EMAIL, password: __ENV.E2E_PASSWORD, authType: 'LOCAL' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, { 'login ok': (r) => r.status === 200 });

  const setCookie = res.headers['Set-Cookie'];
  return setCookie ? setCookie.split(';')[0] : '';
}

export default function () {
  const cookie = login();

  const lat = parseFloat(__ENV.LATITUDE || '-8.3369');
  const lng = parseFloat(__ENV.LONGITUDE || '-36.4251');
  const residueType = __ENV.RESIDUE_TYPE || 'ORGANIC';

  // Backend exige multipart/form-data com parte "data" como JSON (application/json blob)
  // k6 suporta via http.file() para simular o Blob
  const dataPayload = JSON.stringify({
    requesterId: __ENV.REQUESTER_ID || __ENV.CITY_ID,
    residueType,
    withdrawalRequestType: 'HOUSEHOLD',
    addressFull: `Endereço de Teste k6 - ${Date.now()}`,
    latitude: lat + (Math.random() * 0.01 - 0.005),  // varia ~500m para não colidir
    longitude: lng + (Math.random() * 0.01 - 0.005),
  });

  const formData = {
    data: http.file(dataPayload, 'data.json', 'application/json'),
  };

  const res = http.post(
    `${API_URL}/withdrawal-request/${CITY_ID}/city`,
    formData,
    { headers: { Cookie: cookie } }
  );

  const ok = check(res, {
    'criado 200/201': (r) => r.status === 200 || r.status === 201,
    'resposta < 3s': (r) => r.timings.duration < 3000,
  });

  if (ok) {
    created.add(1);
  } else {
    errors.add(1);
    console.error(`Erro ao criar solicitação: ${res.status} - ${res.body}`);
  }

  sleep(__ENV.SLEEP ? parseFloat(__ENV.SLEEP) : 1);
}
