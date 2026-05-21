# rotas-andamento, Tarefas de Implementação

## Pré-requisitos
- [ ] Rotas/coletas operacionais disponíveis
- [ ] Navegação autenticada configurada

## Tarefas
- [ ] T-01, Implementar página de acompanhamento operacional
  - Origem no legado: `src/app/(authenticated)/rotas-andamento/page.tsx`
  - Critério de pronto: página renderiza sem erro no fluxo autenticado
  - Confiança: 🟡

- [ ] T-02, Integrar com dados de rotas/coletas ativas
  - Origem no legado: integração com módulos `rotas`/`rota`
  - Critério de pronto: status operacional atualizado
  - Confiança: 🟡

## Tarefas de Teste
- [ ] TT-01, Acesso autenticado
- [ ] TT-02, Estado sem dados
- [ ] TT-03, Estado com dados ativos

## Ordem Sugerida
1. Estrutura da página
2. Integração de dados
3. Testes de estado

## Lacunas Pendentes (🔴)
- Componentes internos e regras de atualização em tempo real.
