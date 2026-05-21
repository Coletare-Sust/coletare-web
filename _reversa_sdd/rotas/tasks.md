# rotas, Tarefas de Implementação

## Pré-requisitos
- [ ] Entidade de rota e validações
- [ ] Serviço de mapas ativo

## Tarefas
- [ ] T-01, Implementar persistência CRUD de rotas
  - Origem no legado: `src/store/services/route.ts`
  - Critério de pronto: operações create/read/update/delete funcionais
  - Confiança: 🟢

- [ ] T-02, Implementar listagem com detalhes operacionais
  - Origem no legado: `src/app/(authenticated)/rotas/page.tsx`
  - Critério de pronto: accordion exibe propriedades da rota
  - Confiança: 🟢

- [ ] T-03, Integrar criação com tela dedicada
  - Origem no legado: `src/app/(authenticated)/criar-rota/page.tsx`
  - Critério de pronto: rota criada a partir do mapa/formulário
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Criar rota
- [ ] TT-02, Atualizar rota
- [ ] TT-03, Excluir rota

## Ordem Sugerida
1. Serviços
2. UI de criação/listagem
3. Testes

## Lacunas Pendentes (🔴)
- Regras avançadas de validação geográfica.
