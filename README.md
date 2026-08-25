# Coletapp Web

Este é o **README da versão Web do Coletapp**, uma plataforma de utilidade pública para coleta e registro de informações em campo, desenvolvida com **React (Next.js)**.

O objetivo deste guia é fornecer as instruções necessárias para configurar, rodar e fazer o deploy do projeto.

---

## Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Executando em Desenvolvimento](#executando-em-desenvolvimento)
- [Deploy](#deploy)

---

## 1. Visão Geral

Este projeto utiliza **React com Next.js**, proporcionando um ciclo de desenvolvimento simples e rápido graças ao **hot reload** e ao **build otimizado**.

### Fluxo principal:

1. Configurar o ambiente local
2. Instalar as dependências
3. Rodar o projeto em modo de desenvolvimento
4. Deploy

---

## 2. Pré-requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados:

- **Node.js**: Versão 18.x ou superior  
- **Yarn**: Gerenciador de pacotes  
- **Git**: Controle de versão  
- **(Opcional)**: [Vercel CLI](https://vercel.com/docs/cli) ou [Firebase CLI](https://firebase.google.com/docs/cli) (caso deseje realizar deploy via terminal)

---

## 3. Configuração Inicial

### Passo 1: Clonar o Repositório

No terminal:

```bash
git clone [https://github.com/seu-usuario/coletapp-web.git](https://github.com/Coletare-Sust/coletare-web.git)
cd coletare-web
````

**Passo 2: Instalar Dependências**

No terminal, dentro da pasta do projeto, execute:

```bash
yarn install
```

**Passo 3: Configurar o Firebase**

O projeto precisa dos dados de configuração do Firebase.

**3.1 Criar um arquivo `.env.local` na raiz do projeto**

Se estiver usando o Windows PowerShell, execute:

```bash
New-Item -Path . -Name ".env.local" -ItemType "file"
```

Ou crie manualmente via editor de texto.

**3.2 Adicionar as chaves do Firebase no `.env.local`**

Abra o arquivo `.env.local` e adicione as seguintes chaves:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=coloque-sua-api-key-aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=coloque-seu-auth-domain-aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=coloque-seu-project-id-aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=coloque-seu-storage-bucket-aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=coloque-seu-messaging-sender-id-aqui
NEXT_PUBLIC_FIREBASE_APP_ID=coloque-seu-app-id-aqui
NEXT_PUBLIC_FIREBASE_DATABASE_URL=coloque-sua-database-url-aqui
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=coloque-sua-google-maps-api-key-aqui
```

**3.3 Como obter as chaves do Firebase**

* Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
* Selecione o projeto
* Vá em **Configurações do Projeto** (ícone ⚙️)
* Role até **SDK da Web** e copie os valores de configuração

⚠️ **Importante:**
Nunca suba o `.env.local` para o Git.
Esse arquivo já está listado no `.gitignore` e é exclusivo do ambiente local.

---

## 4. Executando em Desenvolvimento

Execute o projeto em modo de desenvolvimento com o comando:

```bash
yarn dev
```

O app estará disponível em:

[http://localhost:3000](http://localhost:3000)

---

## 5. Deploy

O deploy da aplicação é automatizado via **Vercel**.

A **Vercel** está configurada para monitorar o repositório Git.
Cada **push** para a branch `main` (ou a branch de produção configurada) automaticamente disparará um novo deploy na Vercel, tornando o processo contínuo e eficiente.

Isso garante que a versão mais recente do código na `main` esteja sempre em produção.

A versão de testes está disponível do CLoudn Run da GCP


---




