# Guia de desenvolvimento (web)

## Pré-requisitos
Node 18+ (o Dockerfile usa Node 20), Yarn, Git. Backend rodando localmente (`coletapp-backend/docs/development.md`) ou apontando `NEXT_PUBLIC_API_URL` para um ambiente existente.

## Setup
```bash
yarn install
# crie .env.local (nunca versionar) com as variáveis abaixo
yarn dev            # http://localhost:3000
```

| Variável | Onde | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | cliente (build) | URL do backend (padrão: `http://localhost:8080` em dev, `https://api.coletapp.com` no build de produção; vazio conta como não definido) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | cliente (build) | Mapas (restrinja a chave por referrer) |
| `NEXT_PUBLIC_FIREBASE_*` | cliente | Legado; a migração visa remover |
| `NEXT_PUBLIC_LOGIN_URL`, `NEXT_PUBLIC_API_ECOTOOLS_URL` | cliente | Presentes no `.env`; confirme o uso antes de mexer |
| `NODEMAILER_USER`, `NODEMAILER_PASS` | servidor | Envio de e-mail em `/api/email` (o código ainda aceita as versões `NEXT_PUBLIC_*`, que não devem carregar credenciais) |
| `EXPO_ACCESS_TOKEN` | servidor | Push em `/api/notifications` |

`NEXT_PUBLIC_*` vai para o bundle do navegador **no momento do build**: nunca coloque segredo nessas variáveis, e mudar o valor exige um novo build. A conta de serviço do Firebase Admin não deve estar no repositório.

## Scripts
`yarn dev`, `yarn build`, `yarn start`, `yarn lint`. Não há testes unitários; use `yarn build` para checar tipos. `load_tests/coletapp_test.js` é um teste de carga k6 contra o backend.

## Build e deploy
- `Dockerfile` multi-stage (Node 20 alpine, saída `standalone`, porta 3000). As `NEXT_PUBLIC_*` entram como build args:
  ```bash
  docker build \
    --build-arg NEXT_PUBLIC_API_URL=https://api.exemplo \
    --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... \
    -t coletare-web .
  ```
  As variáveis de servidor (`NODEMAILER_*`, `EXPO_ACCESS_TOKEN`) são passadas no `docker run` (`-e`/`--env-file`), nunca no build. O `.dockerignore` exclui `.env*`, contas de serviço do Firebase, `node_modules` e `.next` do contexto.
- `apphosting.yaml` configura Firebase App Hosting / Cloud Run (instâncias, memória e variáveis de ambiente).
- O README original cita deploy automático pela Vercel a partir da branch de produção e um ambiente de testes no Cloud Run. Confirme qual está ativo antes de mexer na configuração.

## Fluxo de Git
- A branch de trabalho é **`refactor/migrate-backend`** (será a padrão). Crie branches de feature/fix a partir dela e faça merge de volta nela; não use `main`/`master`/`development` como base.
- Um assunto por branch, commits atômicos em *conventional commits* (`feat(...)`, `fix(security): ...`, `chore: ...`). Sem trailer de co-autor. Sem push/PR sem pedir.
- O backend usa `main` (padrão) e `development` (integração). Mudanças que dependem de endpoints novos precisam do backend primeiro.

## Convenções
- Textos de interface em português; identificadores em inglês.
- Prettier (`trailingComma: none`) + ESLint (`next lint`).
- Componentes seguem atomic design (atoms -> molecules -> organisms -> templates).
- Dados sempre via `store/services` + `hooks/queries`; nunca `fetch` direto em componentes.
