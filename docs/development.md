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
| `NEXT_PUBLIC_API_URL` | cliente | URL do backend (padrão: `http://localhost:8080` em dev) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | cliente | Mapas (restrinja a chave por referrer) |
| `NEXT_PUBLIC_LOGIN_URL`, `NEXT_PUBLIC_API_ECOTOOLS_URL` | cliente | Presentes no `.env`; confirme o uso antes de mexer |
| `NODEMAILER_USER`, `NODEMAILER_PASS` | servidor | Envio de e-mail em `/api/email` (o código ainda aceita as versões `NEXT_PUBLIC_*`, que não devem carregar credenciais) |
| `EXPO_ACCESS_TOKEN` | servidor | Push em `/api/notifications` |
| `NEXT_PUBLIC_BUILD_ID` | cliente (build, opcional) | Versão do cache persistido do React Query; se ausente, `next.config.js` usa o horário do build |

`NEXT_PUBLIC_*` vai para o bundle do navegador: nunca coloque segredo nessas variáveis. A conta de serviço do Firebase Admin não deve estar no repositório.

## Scripts
`yarn dev`, `yarn build`, `yarn start`, `yarn lint`. Não há testes unitários; use `yarn build` para checar tipos. `load_tests/coletapp_test.js` é um teste de carga k6 contra o backend.

## Build e deploy
- `Dockerfile` multi-stage (Node 20 alpine, saída `standalone`, porta 3000).
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
