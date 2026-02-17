# 🧪 Testes E2E – Playwright

Este documento descreve **passo a passo** como executar os testes end-to-end (E2E) do projeto usando **Playwright**.

---

## 1️⃣ Pré-requisitos

Antes de rodar os testes, verifique:

- Node.js >= 18
- Yarn ou npm
- Aplicação rodando localmente
- Firebase configurado corretamente

```bash
node -v
```

## 2 Instalação das dependências

```bash
npm install
npx playwright install
npm install -D dotenv
```

## 3 Configurar o .env.local na raiz do projeto

Adicionar os campos:

```
E2E_EMAIL= "email do usuario"
E2E_PASSWORD= "Senha Usuario"
E2E_A_EMAIL= "email do admin"
E2E_A_PASSWORD= "Senha do admin"
```

## 4 Adicionar o playwright a lista de scripts

no package.json Adicionar na lista de scripts: `"test:e2e": "playwright test"`

## 5 Subir a Aplicação

```bash
npm run dev
```

## 6 Executar os testes

```bash
npm run test:e2e
```

ou para um arquivo específico:

```bash
npm run test:e2e -- specs/login-page.spec.ts
```
