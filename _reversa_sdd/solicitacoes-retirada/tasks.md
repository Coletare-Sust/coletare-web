# solicitacoes-retirada, Tarefas de Implementação

## Pré-requisitos
- [ ] Coleção `withdrawalsRequests` disponível
- [ ] Entidade de solicitação definida

## Tarefas
- [ ] T-01, Implementar consulta por cidade
  - Origem no legado: `src/store/services/withdrawalsRequests.ts`
  - Critério de pronto: retorno correto por `cityId`
  - Confiança: 🟢

- [ ] T-02, Implementar tela de composição principal
  - Origem no legado: `src/app/(authenticated)/solicitacoes-retirada/page.tsx`
  - Critério de pronto: componentes renderizam dados
  - Confiança: 🟢

- [ ] T-03, Integrar com fluxo de rota especial/notificação
  - Origem no legado: `src/app/api/notifications/route.ts`
  - Critério de pronto: solicitações vinculadas influenciam envio
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Consulta com dados
- [ ] TT-02, Consulta sem dados
- [ ] TT-03, Integração com notificação de rota especial

## Ordem Sugerida
1. Serviço
2. Tela
3. Integração

## Lacunas Pendentes (🔴)
- Política de SLA de resolução de solicitações.
