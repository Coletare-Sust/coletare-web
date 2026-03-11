import http from 'k6/http'
import { check, sleep } from 'k6'

export default function () {

  const payload = JSON.stringify({
    email: 'coletapppegasusambiental@gmail.com',
    password: 'Coletapp2025',
    returnSecureToken: true
  })

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const res = http.post(
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA7UCWZlQbKbjtL5QeiqM2wyojo7eqOjHQ',
    payload,
    params
  )

  check(res, {
    'login success': (r) => r.status === 200
  })

  sleep(1)
}