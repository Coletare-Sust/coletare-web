# avisos, Tarefas de Implementação

## Pré-requisitos
- [ ] Tabela/coleção `warnings` disponível
- [ ] Serviço de storage configurado

## Tarefas
- [ ] T-01, Implementar criação de aviso com upload de imagem
  - Origem no legado: `src/store/services/warning.ts`
  - Critério de pronto: aviso persistido com URL de imagem
  - Confiança: 🟢

- [ ] T-02, Implementar listagem e filtro por data
  - Origem no legado: `src/app/(authenticated)/avisos/page.tsx`
  - Critério de pronto: filtro diário retorna subconjunto correto
  - Confiança: 🟢

- [ ] T-03, Implementar edição e exclusão com limpeza de mídia
  - Origem no legado: `src/store/services/warning.ts`, `src/store/services/firebaseStorage.ts`
  - Critério de pronto: update e delete consistentes
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Criar aviso válido
- [ ] TT-02, Editar aviso existente
- [ ] TT-03, Excluir aviso com imagem

## Ordem Sugerida
1. CRUD de serviço
2. Tela e filtro
3. Testes

## Lacunas Pendentes (🔴)
- Estratégia de moderação/expiração de avisos.
