import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,          // number of virtual users
  duration: '1s',  // test duration
};

export default function () {
  const url = 'https://coletare-60241-default-rtdb.firebaseio.com/withdrawalsRequests.json';
  const now = Date.now();

  const payload = JSON.stringify({
    cityId: "5TWzDEnYsQM4HUVigcWajwbAm0g1",
    createdById: "5TWzDEnYsQM4HUVigcWajwbAm0g1",
    fullAddress: "Abreu e Lima, PE, Brasil",
    isResolved: false,
    latitude: -7.9054787,
    longitude: -34.9049499,
    residueType: "Resíduos de Construção",
    type: "inappropriate-location",
    createdAt: {
    seconds: Math.floor(now / 1000),
    nanoseconds: (now % 1000) * 1_000_000
  }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}