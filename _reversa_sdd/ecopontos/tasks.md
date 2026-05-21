# ecopontos, Tarefas de Implementação

## Pré-requisitos
- [ ] Endpoint externo configurado
- [ ] Tipos de resíduo definidos

## Tarefas
- [ ] T-01, Implementar cliente HTTP de ecopontos
  - Origem no legado: `src/store/services/ecopoint.ts`
  - Critério de pronto: chamadas GET/POST/PUT/DELETE funcionais
  - Confiança: 🟢

- [ ] T-02, Implementar listagem e filtro por resíduo
  - Origem no legado: `src/app/(authenticated)/ecopontos/page.tsx`
  - Critério de pronto: filtro atualiza lista corretamente
  - Confiança: 🟢

- [ ] T-03, Implementar exclusão com confirmação
  - Origem no legado: `src/app/(authenticated)/ecopontos/page.tsx`
  - Critério de pronto: item removido após confirmação
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Listagem por cidade
- [ ] TT-02, CRUD completo
- [ ] TT-03, Erro da API

## Ordem Sugerida
1. Cliente HTTP
2. Tela e filtros
3. Testes

## Lacunas Pendentes (🔴)
- SLA e retry formal da API externa.
