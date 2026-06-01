import http from 'k6/http';
import { check, sleep } from 'k6';

// Use env vars to avoid hardcoding firebase url/ids/tokens.
// Recommended env vars: FIREBASE_BASE_URL, FIREBASE_PATH, FIREBASE_AUTH (or AUTH_TOKEN), CITY_ID, CREATED_BY_ID, VUS, DURATION
export const options = {
  vus: __ENV.VUS,
  duration: __ENV.DURATION
};

export default function () {
  const base = __ENV.FIREBASE_BASE_URL
  const path = __ENV.FIREBASE_PATH

  // If FIREBASE_AUTH provided, use it as query param (REST auth) or set AUTH_TOKEN to use Bearer header.
  let url = `${base}/${path}`
  if (__ENV.FIREBASE_AUTH && !__ENV.AUTH_TOKEN) {
    // use ?auth=TOKEN pattern
    url = `${url}${url.includes('?') ? '&' : '?'}auth=${encodeURIComponent(__ENV.FIREBASE_AUTH)}`
  }

  const now = Date.now();

  const payloadObj = {
    cityId: __ENV.CITY_ID,
    createdById: __ENV.CREATED_BY_ID || (__ENV.CITY_ID),
    fullAddress: __ENV.FULL_ADDRESS,
    isResolved: false,
    latitude: parseFloat(__ENV.LATITUDE),
    longitude: parseFloat(__ENV.LONGITUDE ),
    residueType: __ENV.RESIDUE_TYPE,
    type: __ENV.TYPE,
    createdAt: {
      seconds: Math.floor(now / 1000),
      nanoseconds: (now % 1000) * 1_000_000
    }
  };

  const headers = {
    'Content-Type': 'application/json',
  };
  if (__ENV.AUTH_TOKEN) headers['Authorization'] = `Bearer ${__ENV.AUTH_TOKEN}`

  const params = { headers };

  const res = http.post(url, JSON.stringify(payloadObj), params);

  check(res, {
    'status is 200 or 200/201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(__ENV.SLEEP ? parseFloat(__ENV.SLEEP) : 1);
}