import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "15s", target: 10 }, // Sobe para 20 caminhões em 30 segundos
    { duration: "30s", target: 10 }, // Mantém 20 caminhões rodando por 1 minuto
    { duration: "30s", target: 0 } // Desce para 0
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"] // O teste falha se mais de 5% das requisições derem erro
  },
};

export default function () {
  // O __VU garante que cada "robô" do k6 seja um caminhão diferente no mapa
  const collectId = `k6_truck_test_${__VU}`;

  // URL REST do seu Firebase (o .json no final é obrigatório)
  const url = `https://coletare-60241-default-rtdb.firebaseio.com/collects/${collectId}.json`;

  const payload = JSON.stringify({
    cityId: "5TWzDEnYsQM4HUVigcWajwbAm0g1", // ID que você usa no Next.js
    routeId: "rota_teste_k6",
    vehicleName: `Caminhão K6 #${__VU}`,
    carPlate: `K6-2026`,
    vehicleLatitude: -8.3369 + (Math.random() * 0.005), // Simula movimento
    vehicleLongitude: -36.4251 + (Math.random() * 0.005),
    hasEnded: false,
    createdAt: {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0
    }
  });

  // Enviamos um PATCH para atualizar apenas a posição, igual ao seu App Mobile
  const res = http.patch(url, payload);

  check(res, {
    'Firebase aceitou o dado': (r) => r.status === 200,
    'Tempo de resposta < 800ms': (r) => r.timings.duration < 800,
  });

  // O caminhão envia a posição a cada 3 segundos
  sleep(3);
}
