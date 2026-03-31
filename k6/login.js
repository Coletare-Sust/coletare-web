import http from 'k6/http'
import { check, sleep } from 'k6'

export default function () {

  const API_KEY = __ENV.API_KEY;
  const payload = JSON.stringify({
    email: __ENV.E2E_EMAIL,
    password: __ENV.E2E_PASSWORD,
    returnSecureToken: true
  })

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const res = http.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    payload,
    params
  )

  check(res, {
    'login success': (r) => r.status === 200
  })

  sleep(1)
}