# rota, Tarefas de Implementação

## Pré-requisitos
- [ ] Query hooks de coleta/rota disponíveis
- [ ] Google Maps carregado

## Tarefas
- [ ] T-01, Implementar tela de detalhe da rota
  - Origem no legado: `src/app/(authenticated)/rota/[id]/page.tsx`
  - Critério de pronto: dados operacionais exibidos
  - Confiança: 🟢

- [ ] T-02, Implementar renderização de percurso no mapa
  - Origem no legado: `src/app/(authenticated)/rota/[id]/page.tsx`
  - Critério de pronto: polyline e marcadores visíveis
  - Confiança: 🟢

- [ ] T-03, Implementar exportação de relatório
  - Origem no legado: `src/store/services/exportExcel.ts`
  - Critério de pronto: planilha com métricas gerada
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Carregar rota válida
- [ ] TT-02, Visualizar mapa
- [ ] TT-03, Exportar XLSX

## Ordem Sugerida
1. Carregamento de dados
2. Mapa
3. Exportação

## Lacunas Pendentes (🔴)
- Regras de auditoria de exportação não identificadas.
