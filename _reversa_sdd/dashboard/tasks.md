# dashboard, Tarefas de Implementação

## Pré-requisitos
- [ ] Serviço de coletas disponível
- [ ] Estrutura de `DashboardEntity` definida

## Tarefas
- [ ] T-01, Implementar agregador temporal de coletas
  - Origem no legado: `src/store/services/collects.ts`
  - Critério de pronto: arrays anual/semestral/mensal preenchidos
  - Confiança: 🟢

- [ ] T-02, Implementar hook de consulta com cache
  - Origem no legado: `src/hooks/queries/useDashboardData.ts`
  - Critério de pronto: query invalida e atualiza corretamente
  - Confiança: 🟢

- [ ] T-03, Integrar com componentes visuais
  - Origem no legado: `src/app/(authenticated)/dashboard/page.tsx`
  - Critério de pronto: gráficos exibidos sem erro
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Série com dados reais
- [ ] TT-02, Série vazia
- [ ] TT-03, Filtro por rota

## Ordem Sugerida
1. Agregador
2. Hook
3. Tela

## Lacunas Pendentes (🔴)
- Limites operacionais de volume não formalizados.
