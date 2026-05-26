# Execução da Migração — Módulos Auth e Users

Data: 2026-05-25

## Pré-condições lidas e consideradas
- `.reversa/migrate-plan.md`
- `_reversa_sdd/migration/auth-spec.md`
- `_reversa_sdd/migration/modules/auth/{requirements,design,tasks}.md`
- `_reversa_sdd/auth/{requirements,design,tasks}.md`

## Implementação realizada
- Backend novo criado em `backend/` com:
  - Spring Boot 3.3, Java 21, MongoDB, Security, Actuator.
  - Arquitetura modular monolith com `modules/auth` e `modules/user`.
  - `auth` com portas/adaptadores para Keycloak e store de sessão.
  - `users` com persistência MongoDB (adapter de repositório).
  - Endpoints BFF implementados:
    - `POST /bff/auth/login`
    - `GET /bff/auth/me`
    - `POST /bff/auth/refresh`
    - `POST /bff/auth/logout`
    - `GET /bff/users`
    - `GET /bff/users/{id}`
    - `POST /bff/users`
    - `DELETE /bff/users/{id}`
- Frontend:
  - Rotas proxy App Router criadas em `src/app/api/bff/auth/*`.
  - Serviço `src/store/services/bffAuth.ts` criado para adoção gradual.

## Pós-condições atendidas nesta etapa
- Existe base de backend para iniciar substituição de Firebase Auth por Keycloak/BFF.
- Existe módulo de usuários no MongoDB para migrar dados de `users` do Firebase Realtime/Firestore.
- Infra local disponível via `backend/docker-compose.yml` (MongoDB, Keycloak, MinIO).

## Pendências para fechar o módulo em produção
1. Conectar `AuthProvider` atual do frontend para usar `bffAuth.ts` como fluxo principal.
2. Migrar contas Firebase para Keycloak (script de provisionamento + reset de senha para hash não exportável).
3. Validar contratos e E2E em staging.
4. Descomissionar endpoints legados `/api/createAuth` e `/api/deleteAuth` quando a nova trilha estiver estável.
