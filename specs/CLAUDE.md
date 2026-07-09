# Coletapp Frontend — Project Rules

## Stack
- Next.js 14.2.9 (App Router)
- React (hooks + local state — sem gerenciador de estado global)
- TypeScript
- Fetch API nativa (sem axios, sem SWR, sem React Query)

---

## Estrutura do projeto

```
src/
  store/services/   # funções puras de acesso à API — sem estado React
  hooks/            # hooks que consomem os services e gerenciam estado local
  app/              # páginas e layouts (App Router)
```

---

## Regras de requisição HTTP

- **Sempre usar `fetch` nativo** — nunca instalar ou usar axios
- **Sempre incluir `credentials: 'include'`** em todas as requisições — o JWT fica em
  cookie HttpOnly e é enviado automaticamente pelo browser
- **Nunca ler o JWT do localStorage** — não existe token em localStorage neste projeto
- Nunca concatenar token em headers manualmente — o cookie cuida disso

Padrão base para toda requisição autenticada:
```ts
fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...options,
})
```

---

## Regras de service

- Services em `src/store/services/` são **funções puras** — recebem parâmetros, fazem a
  requisição, retornam dados ou lançam erro. Nenhum `useState`, nenhum `useEffect`
- Um service nunca importa outro service
- Erros HTTP devem ser lançados como `Error` com mensagem legível — nunca engolidos

---

## Regras de hook

- Hooks em `src/hooks/` consomem um ou mais services e gerenciam estado com `useState`
- Cada hook expõe no mínimo: os dados, `isLoading: boolean`, `error: string | null`
- Hooks não fazem requisições diretamente — sempre delegam para o service correspondente
- Manter a interface pública dos hooks existentes ao migrar — não renomear props expostas

---

## Regras de payload e DTO

- **Sempre perguntar** antes de adaptar um payload do backend ou um DTO do frontend
  para fazer uma requisição funcionar
- Não criar mapeamentos silenciosos entre campos com nomes diferentes (ex: `uid` → `id`)
  sem alinhamento explícito
- Se o backend retornar campos que o frontend não usa, ignorar — não remover do tipo
- Tipar todos os payloads com `type` ou `interface` — nunca usar `any`

---

## WebSocket

- Usar `@stomp/stompjs` para conexão STOMP — nunca `new WebSocket()` diretamente
- Sempre desconectar no `useEffect` cleanup (unmount)
- Reconexão com backoff exponencial — máximo 4 tentativas
- Nunca acumular histórico de coordenadas no estado do hook — apenas a posição mais recente

---

## O que nunca fazer

- Nunca instalar axios ou qualquer cliente HTTP que não seja fetch nativo
- Nunca colocar lógica de requisição diretamente em componentes de página — sempre via hook
- Nunca expor o JWT fora do cookie (não colocar em localStorage, sessionStorage ou estado React)
- Nunca fazer mapeamento de payload sem perguntar primeiro
- Nunca refatorar telas além do necessário ao migrar um service — escopo é a camada de dados