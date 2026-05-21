# Inventory — coletare-new-back

## Escopo do reconhecimento (Scout)

- 🟢 **CONFIRMADO** Projeto web com Next.js App Router.
- 🟢 **CONFIRMADO** Código principal em TypeScript/TSX em `src/`.
- 🟢 **CONFIRMADO** Integrações com Firebase (client/admin), Google Maps e envio de email/notificação.

## Estrutura principal de diretórios

- `src/app/` (rotas de UI e APIs)
  - `(authenticated)/` (módulos autenticados)
  - `api/` (rotas server-side)
- `src/components/` (atoms, molecules, organisms, templates, ui)
- `src/common/` (entities, dtos, constants, validation)
- `src/hooks/`, `src/store/`, `src/utils/`, `src/validations/`
- `public/` (assets)
- `load_tests/` (teste de carga)
- `specs/` e `openspec/` (documentação funcional/migração)

## Linguagens e contagem de arquivos

- 🟢 **CONFIRMADO** TypeScript (`.ts`): 127 arquivos em `src/`
- 🟢 **CONFIRMADO** TSX (`.tsx`): 100 arquivos em `src/`
- 🟢 **CONFIRMADO** CSS (`.css`): 1 arquivo em `src/`
- 🟢 **CONFIRMADO** JavaScript (`.js`): presente em configs/auxiliares (ex.: `next.config.js`, `load_tests/coletapp_test.js`)

> 🟡 **INFERIDO** Linguagem principal: **TypeScript** (somando `.ts` + `.tsx`).

## Frameworks e stack

- 🟢 **CONFIRMADO** `next@14.2.9` + `react@18.2.0`
- 🟢 **CONFIRMADO** Tailwind CSS (`tailwindcss@3.3.3`)
- 🟢 **CONFIRMADO** Firebase client/admin (`firebase`, `firebase-admin`)
- 🟢 **CONFIRMADO** React Query (`@tanstack/react-query`)
- 🟢 **CONFIRMADO** React Hook Form + Zod

## Pontos de entrada e arquivos-chave

- 🟢 **CONFIRMADO** App layout raiz: `src/app/layout.tsx`
- 🟢 **CONFIRMADO** Página inicial/login: `src/app/page.tsx`
- 🟢 **CONFIRMADO** Layout autenticado: `src/app/(authenticated)/layout.tsx`
- 🟢 **CONFIRMADO** APIs internas (App Router):
  - `src/app/api/createAuth/route.ts`
  - `src/app/api/deleteAuth/route.ts`
  - `src/app/api/email/route.ts`
  - `src/app/api/notifications/route.ts`
- 🟢 **CONFIRMADO** Build standalone para container: `next.config.js` (`output: "standalone"`)
- 🟢 **CONFIRMADO** Containerização: `Dockerfile`
- 🟢 **CONFIRMADO** Hosting Firebase/App Hosting: `apphosting.yaml`, `firebase.json`

## Configuração e ambiente

- 🟢 **CONFIRMADO** Variáveis em `.env.local` (Firebase e Google Maps, conforme README).
- 🟢 **CONFIRMADO** Config Firebase client: `src/config/firebase.ts`
- 🟢 **CONFIRMADO** Config Firebase admin: `src/config/firebaseAdmin.ts`

## Banco de dados (superficial)

- 🟢 **CONFIRMADO** Não há migrations SQL/Prisma no repositório.
- 🟡 **INFERIDO** Persistência principal via Firebase (Firestore/serviços Firebase).
- 🔴 **LACUNA** Modelo físico de dados não extraído nesta fase (depende do Data Master/escavação).

## Testes

- 🟢 **CONFIRMADO** Há teste de carga em `load_tests/coletapp_test.js`.
- 🟢 **CONFIRMADO** Não foram encontrados testes unitários/integrados em padrão `*.test.*`/`*.spec.*` do app.
- 🟡 **INFERIDO** Cobertura automatizada de regressão funcional é baixa no front-end atual.

## Módulos funcionais identificados

- 🟢 **CONFIRMADO** `auth`, `dashboard`, `avisos`, `colaboradores`, `veiculos`, `rotas`, `rota`, `rotas-andamento`, `ecopontos`, `municipios`, `solicitacoes-retirada`, `email`, `notifications`.

## CI/CD

- 🟢 **CONFIRMADO** Não há workflows em `.github/workflows/`.
- 🟡 **INFERIDO** Deploy principal é externo ao repositório (README cita Vercel/Cloud Run).

## Resumo

- 🟢 **CONFIRMADO** Total de arquivos no projeto (excluindo `.git`, `node_modules`, `.next`, `.reversa`, `_reversa_sdd`): **409**.
- 🟢 **CONFIRMADO** App Next.js orientado a rotas do App Router e Firebase.
- 🔴 **LACUNA** Regras de negócio detalhadas e contratos completos serão aprofundados nas próximas fases.
