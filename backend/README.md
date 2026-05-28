# Coletare Backend (Spring Boot)

Backend modular monolith com padrões:
- DDD
- Clean Architecture
- Ports & Adapters
- BFF para Next.js

## Módulos entregues nesta migração inicial
- `auth`: integração com Keycloak (OIDC password/refresh/logout) + sessão via cookie HTTP-only.
- `users`: persistência de usuários em MongoDB e endpoints BFF básicos.

## Estrutura
- `modules/auth`
- `modules/user`
- `shared/config`

## Endpoints principais
- `POST /bff/auth/login`
- `GET /bff/auth/me`
- `POST /bff/auth/refresh`
- `POST /bff/auth/logout`
- `GET /bff/users`
- `GET /bff/users/{id}`
- `POST /bff/users`
- `DELETE /bff/users/{id}`

## Configuração
Ver `src/main/resources/application.yml`.

Variáveis:
- `MONGODB_URI`
- `KEYCLOAK_BASE_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`
- `KEYCLOAK_ADMIN_CLIENT_ID`
- `KEYCLOAK_ADMIN_CLIENT_SECRET`

Por padrão, o backend usa o banco Mongo `coletapp` quando `MONGODB_URI` não é definido.

## Ambiente local (infra)
Na pasta `backend/`:

```yaml
# docker-compose.yml já incluído
```

## Observações de migração
- Este passo substitui o núcleo de autenticação/usuário do Firebase para Keycloak + MongoDB.
- Próximo passo: trocar chamadas no frontend para consumir totalmente o BFF e remover dependências remanescentes de Firebase por módulo.
