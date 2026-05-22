# Auth — Tasks e Playbook de Migração

1) Infra & Keycloak
- Provisionar Keycloak em staging; criar realm `coletare` e clients `bff-client`.
- Configurar Identity Provider Google (opcional, testar login social).

2) BFF Implementation
- Implementar endpoints: `/bff/auth/login`, `/bff/auth/callback`, `/bff/auth/me`, `/bff/auth/logout`, `/bff/auth/refresh`.
- Implementar session store (Redis recommended) e cookie strategy.

3) User Migration
- Export users from Firebase: `uid,email,providers,displayName,photoURL,createdAt`.
- Write provisioning script to create users in Keycloak; where password hash unavailable, mark `needs-reset=true` and queue email.
- Verify counts and sample logins in staging.

4) Tests & Cutover
- Contract tests: `GET /bff/auth/me` matches expected frontend shape.
- Perform cutover in staging; enable BFF to accept frontend traffic.
- Plan production migration window: run provisioning script, enable BFF, monitor auth metrics.

Rollback
- If problems, revert BFF traffic to Firebase (keep both systems running for a short fall-back window) and invalidate sessions in Keycloak as needed.
