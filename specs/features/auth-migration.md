# Spec: Migração de Auth — Firebase → Backend próprio

## Contexto

O frontend usa Next.js 14.2.9. A autenticação era feita via Firebase Auth e será substituída
por chamadas ao backend próprio (`access` module). O JWT retornado pelo backend será
armazenado em **cookie HttpOnly** — não em localStorage.

As telas já existem. O escopo desta spec é **apenas a camada de service e hook**.

---

## Por que cookie HttpOnly e não localStorage

- localStorage é acessível por qualquer JavaScript na página — um ataque XSS consegue ler
  e exfiltrar o token
- Cookie HttpOnly é inacessível ao JavaScript — o browser envia automaticamente em cada
  requisição, mas nenhum script consegue lê-lo
- Compatível com JWT stateless: o servidor continua validando o token em cada request,
  sem guardar sessão

---

## Pré-requisito — CORS no backend

Antes de implementar o frontend, verificar se o backend já tem CORS configurado com:
```java
allowedOrigins("http://localhost:3000") // ou o domínio de produção
allowCredentials(true)
```
Se não estiver, **perguntar ao responsável pelo backend antes de prosseguir**.

---

## 1. Alterar o service existente de auth

**Localizar** o service de autenticação atual em `src/store/services/` (provavelmente
`authService.ts` ou similar — verificar o nome real antes de criar arquivo novo).

**Substituir** as chamadas Firebase pelas chamadas ao backend. Manter o mesmo nome de
arquivo e as mesmas funções exportadas para não quebrar os hooks que já as consomem.

### `login(email, password)`

```ts
// POST /api/access/auth/login
// body: { email: string, password: string }
// resposta esperada do backend: { token: string, user: { id, name, email, role } }
// o token deve ser salvo em cookie HttpOnly via Set-Cookie do servidor
// se o backend não fizer isso automaticamente — perguntar antes de implementar
```

Toda requisição deve usar `fetch` com:
```ts
fetch(url, {
  credentials: 'include', // obrigatório para enviar/receber cookies cross-origin
  headers: { 'Content-Type': 'application/json' },
})
```

### `logout()`

```ts
// POST /api/access/auth/logout
// o backend deve invalidar o cookie via Set-Cookie com maxAge=0
// no frontend: redirecionar para /login após resposta 200
```

### `getMe()` — verificar sessão ativa

```ts
// GET /api/access/auth/me
// sem body — o cookie é enviado automaticamente pelo browser
// retorna os dados do usuário autenticado ou 401 se não autenticado
// usar para hidratar o estado do usuário ao carregar a aplicação
```

---

## 2. Alterar o hook existente de auth

**Localizar** o hook atual em `src/hooks/` (provavelmente `useAuth.ts` — verificar nome real).

**Manter a mesma interface pública do hook** para não quebrar as telas existentes.
Substituir apenas as chamadas internas para usar o novo service.

O hook deve:
- Chamar `getMe()` no mount para verificar se há sessão ativa
- Expor `user`, `isLoading`, `login(email, password)`, `logout()`
- Redirecionar para `/login` quando `logout()` for chamado
- Redirecionar para a rota autenticada quando `login()` for bem-sucedido

---

## Perguntar antes de implementar

- [ ] O endpoint de login retorna o token no body ou já seta o cookie via `Set-Cookie`?
- [ ] Qual o path exato dos endpoints de auth no backend (`/auth/login`? `/api/access/auth/login`?)
- [ ] O backend já tem CORS com `allowCredentials: true` configurado?
- [ ] O payload de usuário retornado pelo backend bate com o que o frontend espera?
      Se não bater, **perguntar antes de adaptar** — não criar mapeamento por conta própria

---

## Arquivos esperados ao final

```
src/
  store/services/
    authService.ts        ← alterado (Firebase → fetch com credentials)
  hooks/
    useAuth.ts            ← alterado (mantém interface pública, troca internos)
```

---

## Como validar

1. Fazer login com credenciais válidas → deve redirecionar para rota autenticada
2. Inspecionar cookies no browser (DevTools → Application → Cookies) → deve existir cookie HttpOnly
3. Recarregar a página autenticada → usuário deve continuar logado (getMe() hidrata o estado)
4. Fazer logout → cookie deve ser removido e redirecionar para /login
5. Tentar acessar rota protegida sem cookie → deve redirecionar para /login