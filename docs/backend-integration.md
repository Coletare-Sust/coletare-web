# Integração com o backend

Referência de endpoints e permissões: `coletapp-backend/docs/api-reference.md`. Aqui, o que o web consome e o que ainda falta migrar.

## Recursos consumidos (`src/store/services`)

| Service | Endpoints do backend | Telas |
| --- | --- | --- |
| `auth.ts` | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/password-reset/request`, `POST /auth/register/{vehicle,employee,city}` | login, cadastro de veículo/colaborador/município |
| `user.ts` | `GET /user/all`, `GET /user/{id}`, `GET /user/{id}/city`, `GET /user/all-cities`, `POST /auth/register/*`, `PUT /user/{id}`, `DELETE /user/{id}` e listas por cidade (`vehicles`, `employees`, `citizens`, `.../page`) | municípios, veículos, colaboradores |
| `route.ts` | `GET/POST /route/{cityId}/city`, `GET/PUT/DELETE /route/{id}`, `POST /route/calculate-polyline` | rotas, criar-rota |
| `collect.ts`, `collects.ts` | `GET /collect/{cityId}/city`, `GET /collect/{id}`, `GET /collect/route/{routeId}`, `PUT /collect/{id}`, `GET /metrics/{cityId}/dashboard` | dashboard, rota, inserir-dados |
| `ecopoint.ts` | `GET/POST /ecopoint/{cityId}/city`, `GET/PUT/DELETE /ecopoint/{id}` | ecopontos |
| `warning.ts` | `GET/POST /warning/{cityId}/city` (multipart), `GET/PUT/DELETE /warning/{id}` | avisos |
| `withdrawalsRequests.ts` | `GET /withdrawal-request/{cityId}/city` (+`/page`, `/count`), `PUT/DELETE /withdrawal-request/{id}` | solicitações de retirada |
| `access.ts` | `GET /access/permissions`, `GET/PUT /access/users/{userId}/permissions` | permissões |
| `email.ts` | `POST /api/email` (rota do próprio Next) | notificações por e-mail |
| WebSocket | `{API}/ws` -> `/topic/locations/{cityId}` | rotas em andamento |

Notificações push: o web envia por `POST /api/notifications` (Expo Push) usando os tokens salvos pelo mobile em `PUT /user/{id}/tokens`.

## Contrato de sessão
- Cookie `jwt` HttpOnly; `credentials: "include"` em todo `fetch`. A API precisa listar a origem do web em `APP_CORS_ALLOWED_ORIGIN_PATTERNS`.
- Em escritas (`POST/PUT/DELETE`) o navegador envia `Origin`; o backend rejeita origens fora da lista (`CookieOriginCheckFilter`).
- Em produção, web e API em domínios diferentes exigem `SameSite=None; Secure`; se compartilharem o domínio registrável, preferir `Lax` com `APP_AUTH_COOKIE_DOMAIN`.
- Rate limit nas rotas públicas de auth: o front deve tratar HTTP 429.

## Pendências da migração (`refactor/migrate-backend`)
- O SDK do Firebase foi removido (#133): `Timestamp`/`DocumentData` são tipos locais e `NEXT_PUBLIC_FIREBASE_*` não é mais lido.
- `firebaseStorage.ts` é um stub: uploads devem ir como multipart ao backend (já é assim para avisos e retiradas).
- Edição de município (`cor`, `endereço`, `status`, `calcData`, ...) usa `PUT /user/{id}`; confirmar no backend se esses campos já são aceitos (a proposta de RBAC apontava a falta de `PUT /city/{id}`).
- Trocar checagens por `role` por checagens de permissão.
- Persistência do cache em `localStorage` expõe dados no navegador; avaliar reduzir o que é persistido.
- Rotas `/api/*` do Next dependem de `NEXT_PUBLIC_API_URL` apontando para o backend alcançável pelo servidor Next.
