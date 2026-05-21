# Dependencies — coletare-new-back

## Gerenciador de pacotes e scripts

- 🟢 **CONFIRMADO** Gerenciador principal: **Yarn** (`yarn.lock` presente).
- 🟢 **CONFIRMADO** Scripts (`package.json`):
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `next lint`

## Dependências críticas

### Core web
- 🟢 **CONFIRMADO** `next@14.2.9`
- 🟢 **CONFIRMADO** `react@18.2.0`
- 🟢 **CONFIRMADO** `react-dom@18.2.0`
- 🟢 **CONFIRMADO** `typescript@5.1.6`

### Backend as a Service / integrações
- 🟢 **CONFIRMADO** `firebase@^10.2.0`
- 🟢 **CONFIRMADO** `firebase-admin@^12.0.0`
- 🟢 **CONFIRMADO** `googleapis@^137.1.0`
- 🟢 **CONFIRMADO** `google-auth-library@^9.10.0`
- 🟢 **CONFIRMADO** `nodemailer@^6.9.12`
- 🟢 **CONFIRMADO** `expo-server-sdk@^3.10.0`

### Estado, dados e validação
- 🟢 **CONFIRMADO** `@tanstack/react-query@^4.33.0`
- 🟢 **CONFIRMADO** `react-hook-form@^7.45.4`
- 🟢 **CONFIRMADO** `@hookform/resolvers@^3.3.0`
- 🟢 **CONFIRMADO** `zod@3`

### UI e visualização
- 🟢 **CONFIRMADO** `tailwindcss@3.3.3`
- 🟢 **CONFIRMADO** `@radix-ui/*` (vários componentes)
- 🟢 **CONFIRMADO** `@mui/base@^5.0.0-beta.11`
- 🟢 **CONFIRMADO** `chart.js@^4.4.2`
- 🟢 **CONFIRMADO** `react-chartjs-2@^5.2.0`
- 🟢 **CONFIRMADO** `lucide-react@^0.356.0`

### Mapas e geolocalização
- 🟢 **CONFIRMADO** `@react-google-maps/api@^2.19.3`

## Dev dependencies relevantes

- 🟢 **CONFIRMADO** `eslint@8.47.0`
- 🟢 **CONFIRMADO** `eslint-config-next@13.4.19`
- 🟢 **CONFIRMADO** `@rocketseat/eslint-config@^2.1.0`
- 🟢 **CONFIRMADO** `prettier-plugin-tailwindcss@^0.5.3`

## Riscos e observações

- 🟡 **INFERIDO** Há acoplamento relevante com Firebase, impactando a migração de backend.
- 🟡 **INFERIDO** Integrações externas principais: Firebase, Google Maps/Google APIs, email e push notifications.
- 🔴 **LACUNA** Não há lock de versão explícito para algumas dependências com `^`; validação final depende do ambiente de build.
