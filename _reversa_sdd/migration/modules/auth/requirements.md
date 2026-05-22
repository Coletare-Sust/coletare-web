# Auth — Requisitos

Resumo
- Substituir Firebase Auth por Keycloak; BFF (Spring Boot) atua como ponte segura entre Next.js e Keycloak.

Funcionais
- Login/Logout (email/pass), Login Social (Google).
- Recuperação e reset de senha.
- Roles/permissions: `admin`, `colaborador`, `operador`, `cidadao`.
- Endpoint BFF: `/bff/auth/login`, `/bff/auth/logout`, `/bff/auth/me`, `/bff/auth/refresh`.

Não-funcionais
- Sessions via HTTP-only secure cookies; SameSite=strict.
- Latência: auth flow ≤ 300ms em média para token exchange.
- Auditoria de logins e eventos críticos.

Critérios de aceitação
- Migrar 100% dos usuários ativos (email matches) ou emitir fluxo de reset de senha para accounts sem hash exportável.
- `GET /bff/auth/me` retorna payload compatível com frontend atual.
