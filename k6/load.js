import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,           // simulate 50 users
  duration: '30s'    // test duration
}

export default function () {

  const url = 'https://www.coletarepgs.com/dashboard?city=5TWzDEnYsQM4HUVigcWajwbAm0g1&_rsc=2z2io'

  const params = {
    headers: {
      'Accept': '*/*',
      'Next-Url': '/dashboard',
      'RSC': '1',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'k6-load-test'
    }
  }

  const res = http.get(url, params)

  check(res, {
    'status is 200 or 304': (r) => r.status === 200 || r.status === 304,
    'response time < 1000ms': (r) => r.timings.duration < 1000
  })

  sleep(0.3)
}