import http from 'k6/http'
import { check, sleep } from 'k6'

// Use environment variables to avoid committing secrets/endpoints.
// Recommended env vars: TARGET_URL, AUTH_TOKEN, USER_AGENT, NEXT_URL, RSC, VUS, DURATION, SLEEP
export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 50,
  duration: __ENV.DURATION
}

export default function () {
  const url = __ENV.TARGET_URL

  const headers = {
    'Accept': '*/*',
    'User-Agent': __ENV.USER_AGENT
  }

  if (__ENV.NEXT_URL) headers['Next-Url'] = __ENV.NEXT_URL
  if (__ENV.RSC) headers['RSC'] = __ENV.RSC
  if (__ENV.AUTH_TOKEN) headers['Authorization'] = `Bearer ${__ENV.AUTH_TOKEN}`

  const params = { headers }

  const res = http.get(url, params)

  check(res, {
    'status is 200 or 304': (r) => r.status === 200 || r.status === 304,
    'response time < 1000ms': (r) => r.timings.duration < 1000
  })

  sleep(__ENV.SLEEP ? parseFloat(__ENV.SLEEP) : 0.3)
}