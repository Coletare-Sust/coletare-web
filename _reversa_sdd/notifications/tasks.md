# notifications, Tarefas de Implementação

## Pré-requisitos
- [ ] Chave/token Expo configurados
- [ ] Serviços de rota/usuário/solicitação disponíveis

## Tarefas
- [ ] T-01, Implementar endpoint de notificação com validação
  - Origem no legado: `src/app/api/notifications/route.ts`
  - Critério de pronto: payload inválido rejeitado e payload válido processado
  - Confiança: 🟢

- [ ] T-02, Implementar filtro de usuários por proximidade
  - Origem no legado: `src/app/api/notifications/route.ts`, `src/utils/location.ts`
  - Critério de pronto: conjunto de usuários elegíveis calculado corretamente
  - Confiança: 🟢

- [ ] T-03, Implementar envio em lote via Expo
  - Origem no legado: `src/app/api/notifications/route.ts`
  - Critério de pronto: mensagens chunkadas enviadas sem interromper por token inválido
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Notificação happy path
- [ ] TT-02, Rota inválida
- [ ] TT-03, Token inválido e continuidade do lote

## Ordem Sugerida
1. Validação + dados-base
2. Seleção de destinatários
3. Envio em lote e testes

## Lacunas Pendentes (🔴)
- Parametrização dinâmica do raio de proximidade.
