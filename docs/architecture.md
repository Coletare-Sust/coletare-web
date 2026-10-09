# Arquitetura do web

## Stack
Next.js 14.2 (App Router, `output: "standalone"`), React 18, TypeScript 5.1, Tailwind 3 + Radix, TanStack Query v4 (cache persistido em `localStorage`), react-hook-form + zod, `@react-google-maps/api`, Chart.js, `@stomp/stompjs` + `sockjs-client`, nodemailer e `expo-server-sdk` nas rotas de servidor. Gerenciador: yarn.

## Estrutura de pastas

```
src/
  app/
    layout.tsx, page.tsx                 login / recuperação de senha
    (authenticated)/                     área logada (layout com FetchAuth + guarda de permissão)
      dashboard/ (+ inserir-dados)       métricas e lançamento de dados de coleta/cálculo
      rotas/, rota/, criar-rota/         lista, detalhe e criação de rotas
      rotas-andamento/                   mapa em tempo real (WebSocket)
      ecopontos/, avisos/, solicitacoes-retirada/
      veiculos/, colaboradores/, veiculos-colaboradores/, cadastrar-veiculo/, cadastrar-colaborador/
      municipios/ (+ cadastrar)          somente PLATFORM_ADMIN na prática
      permissoes/                        gestão de permissões por usuário (RBAC)
    api/email, api/notifications         rotas de servidor (exigem sessão no backend)
  common/        accessControl, constants, dtos, entities, mappers, validation
  components/    atoms, molecules, organisms, templates, ui
  config/        api.ts (URL da API), firebase.ts (legado)
  hooks/         useAuth, useAppToast, queries/* (React Query)
  store/         providers (Auth, QueryClientApp) e services (HTTP por recurso)
  utils/         apiFetch, serverSession, polyline, datas, coordenadas
  validations/   schemas zod dos formulários
```

Aliases em `tsconfig.json`: `@/*`, `@atoms/*`, `@molecules/*`, `@organisms/*`, `@templates/*`, `@store/*`, `@providers/*`, `@common/*`, `@entities/*`, `@constants/*`.

## Camadas de dados
`page/component` -> `hooks/queries/*` (React Query) -> `store/services/*` -> `utils/apiFetch` -> backend. Os services convertem DTOs do backend em entidades do front (mapeamentos de enums em `common/mappers/backendEnums.ts`).

`apiFetch`: `credentials: "include"` (cookie), `Content-Type` JSON (ou multipart automático para `FormData`), erros lançam `Error(message)`. HTTP 401 em rota não pública dispara o evento `coletare:authorization-expired`; o provider de Auth limpa cache e vai para `/`.

URL da API (`config/api.ts`): `NEXT_PUBLIC_API_URL`; sem ela, `http://localhost:8080` em desenvolvimento e `https://api.coletapp.com` no build de produção.

## Sessão e controle de acesso
- Login: `POST /auth/login`; o backend define o cookie HttpOnly `jwt`. Não há token em JavaScript nem `onAuthStateChanged`.
- `FetchAuth` sincroniza a sessão via `/auth/me` e carrega o perfil; `Authenticated` redireciona para `/` quando não há usuário; `BlockInactiveUser` bloqueia o acesso de usuário com `status === "Inativo"`.
- Permissões: `/auth/me` devolve o usuário com suas permissões (as mesmas do enum `Permission` do backend). `common/accessControl/routes.ts` mapeia cada rota a permissões exigidas (regra aninhada `[A, B]` = qualquer uma) e `permissions.ts` oferece `hasPermission`/`canAccessAll`. A UI esconde o que o usuário não pode fazer, mas **a autorização real é do backend**.
- Resquício: alguns componentes (ex.: `templates/Administrator`) ainda checam `user.role`; a direção é migrar tudo para permissões.

## Cache
`store/providers/queryClient.ts` persiste o cache do React Query no `localStorage` (`cacheTime` de 5 dias) via `createSyncStoragePersister`. Atenção: dados de negócio ficam legíveis no navegador enquanto o cache existir. Ao fazer logout ou receber 401, o cache e o persister são limpos (`clearClientSession`) para não vazar dados entre usuários.

## Tempo real (`rotas-andamento`)
1. Conecta em `${apiUrl}/ws` com `@stomp/stompjs` e `SockJS` (nova instância a cada reconexão, `reconnectDelay` 3 s).
2. Assina `/topic/locations/{cityId}` (o backend só permite a cidade do usuário).
3. Cada mensagem (`LiveLocationPayload`: `collectId, vehicleId, vehicleName, carPlate, routeId, latitude, longitude, routePath[], hasEnded, timestamp`) atualiza o marcador/trajeto do veículo; `hasEnded=true` remove o veículo e mostra um toast.

## Rotas de servidor (`src/app/api`)
- `POST /api/email`: envia e-mail via nodemailer; exige papel ADMIN/PLATFORM_ADMIN validado no backend (`serverSession.requireRole`).
- `POST /api/notifications`: envia push via Expo para os tokens dos usuários; exige sessão. É usado também pelo mobile (`NOTIFICATIONS_API_URL`), por isso `serverSession` aceita cookie **ou** `Authorization: Bearer`.
- `serverSession` repassa cookie/Bearer do chamador para `GET {API}/auth/me`.

## Segurança do front
Cabeçalhos em `next.config.js`: CSP em modo **Report-Only**, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (geolocalização só `self`), HSTS. O `connect-src` inclui a origem da API e o `ws(s)` correspondente. Ao mudar de domínio da API, o `next.config.js` acompanha `NEXT_PUBLIC_API_URL`.
A conta de serviço do Firebase Admin **não é versionada** (`chore/untrack-firebase-adminsdk`).
