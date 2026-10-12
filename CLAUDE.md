# CLAUDE.md — coletare-web

Guidance for Claude Code when working in this repository. Docs live in `docs/` (start at `docs/README.md`).

## Coletapp ecosystem and branches (read this first)

Coletapp is solid-waste collection management for municipalities. Three repositories, all under `C:\Users\pedro\OneDrive\Documentos\`:

| Repo | Role | Stack | Default / working branch |
| --- | --- | --- | --- |
| `coletapp-backend` | REST + WebSocket API | Java 25, Spring Boot 4, MongoDB | **`main`** is the default; `development` is the integration branch. |
| `coletare-web` (this one) | City-admin panel | Next.js 14, React 18, TypeScript | **`refactor/migrate-backend`** is where work happens and will become the default. Do **not** base work on `main`, `master` or `development` here. |
| `coletare-mobile` | Citizen + collection-vehicle app | Expo 53 / React Native 0.79 | **`refactor/migrate-backend`** likewise. |

- `refactor/migrate-backend` is the migration of this app from Firebase (Auth, Realtime DB, Storage, direct logic in the client) to the `coletapp-backend` REST API. Branch feature/fix work from it and merge back into it. Local `origin/HEAD` still points to `master`; ignore that.
- Git preferences: atomic commits, conventional-commit style (`feat(...)`, `fix(security): ...`, `docs: ...`), one topic per branch, **do not add a Co-Authored-By trailer**, do not push or open PRs unless asked.
- The working tree may contain uncommitted changes that are not yours. Never revert them; stage only the files you changed.

## Commands

```bash
yarn install            # yarn is the package manager (yarn.lock)
yarn dev                # http://localhost:3000  (needs the backend at NEXT_PUBLIC_API_URL, default http://localhost:8080)
yarn build && yarn start
yarn lint               # next lint (eslint 8, rocketseat + airbnb config)
```

There is no unit-test suite. `load_tests/coletapp_test.js` is a k6 script for the backend's location endpoint. Prettier: `trailingComma: none`, tailwind plugin; run it on files you touch (CRLF/LF warnings from Git on Windows are noise).

Env vars (see `docs/development.md`; never print or commit values): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, and server-only `NODEMAILER_USER/PASS`, `EXPO_ACCESS_TOKEN`. The Firebase Admin service-account JSON that sits in the repo root is **untracked on purpose**; never `git add` it.

## Architecture

Next.js 14 App Router, TypeScript, Tailwind, Radix/shadcn-style primitives, TanStack Query v4 (cache persisted to `localStorage`, 5-day cacheTime), react-hook-form + zod, Google Maps (`@react-google-maps/api`), Chart.js, STOMP over SockJS.

```
src/app/(authenticated)/   pages: dashboard, rotas, rota, criar-rota, rotas-andamento (live map), ecopontos, avisos,
                           solicitacoes-retirada, veiculos, colaboradores, veiculos-colaboradores, cadastrar-*, municipios, permissoes
src/app/api/               server routes: email (nodemailer), notifications (Expo push). Both require a backend session.
src/store/services/        one module per backend resource; all HTTP goes through apiFetch
src/store/providers/       Auth (session by polling /auth/me), QueryClientApp (persisted cache)
src/hooks/queries/         React Query hooks over the services (+ usePermissions/useUserPermissions)
src/common/accessControl/  permissions.ts (PermissionKey type, check helpers) and routes.ts (route -> required permissions)
src/components/            atomic design: atoms, molecules, organisms, templates (Authenticated, Administrator, FetchAuth, BlockInactiveUser)
src/config/api.ts          getApiUrl(): NEXT_PUBLIC_API_URL, else localhost:8080 in dev / https://api.coletapp.com in production build
src/utils/apiFetch.ts      fetch wrapper (credentials: "include", JSON/FormData, 401 -> authorization-expired event)
src/utils/serverSession.ts server-side helper that validates the caller against backend /auth/me (used by src/app/api/*)
```

Path aliases (`tsconfig.json`): `@/*` -> `src/*`, plus `@atoms/`, `@molecules/`, `@organisms/`, `@templates/`, `@store/`, `@providers/`, `@common/`, `@entities/`, `@constants/`.

## Rules that matter

- **All data goes through the backend** via `apiFetch` in `src/store/services/*`. Do not add Firebase reads/writes. The Firebase SDK is no longer a dependency (`Timestamp`/`DocumentData` are local types in `common/entities`); `firebaseStorage.ts` is a stub (uploads are multipart to the backend).
- **Session = HttpOnly cookie `jwt`** set by `POST /auth/login`. JavaScript never sees the token; there is no `onAuthStateChanged`. The Auth provider calls `/auth/me`; a 401 anywhere dispatches `coletare:authorization-expired`, which clears the query cache and sends the user to `/`.
- **Authorization is permission-based.** The backend returns the user's permissions; gate routes in `src/common/accessControl/routes.ts` and UI with the helpers in `permissions.ts`. Do not add new `role === "admin"` checks; the backend enforces the same permissions (`@PreAuthorize`) and city scope, so the UI gate is UX only. When the backend adds a permission, add it to `PermissionKey`.
- **Multi-tenant:** most endpoints are `/{resource}/{cityId}/city`. `PLATFORM_ADMIN` can access any city (the `/municipios` area); `ADMIN` is bound to the user's `cityId`. Some legacy guards still compare `user.role` (e.g. `templates/Administrator` checks `platformAdmin`); migrate them to permissions when touching them.
- **Live map:** `rotas-andamento` subscribes to `/topic/locations/{cityId}` at `${apiUrl}/ws` (cookie authenticates the handshake; a new SockJS per reconnect). Payload `hasEnded=true` means the collect finished.
- Security headers live in `next.config.js` (CSP is **Report-Only** on purpose; tighten only after checking reports). Keep `connect-src` in sync with the API origin.
- `/api/email` and `/api/notifications` must keep their session checks (`requireRole`/`getSessionUser`).
- Keep Portuguese for user-facing text; code identifiers in English.

## Adding a feature (checklist)

1. Confirm the endpoint and permission in `coletapp-backend/docs/api-reference.md` (or the controller). If the backend lacks it, say so; it needs a backend branch first.
2. Add/extend a service in `src/store/services`, a query hook in `src/hooks/queries`, and the DTO/entity types.
3. Add the page under `src/app/(authenticated)/...`, register its permission in `routes.ts`, hide actions the user lacks permission for.
4. Run `yarn lint` and `yarn build` (type-check) before finishing.
5. Update `docs/` if routes, services or contracts changed.
