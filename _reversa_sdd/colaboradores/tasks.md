# colaboradores, Tarefas de Implementação

## Pré-requisitos
- [ ] Schema de formulário de colaborador
- [ ] Serviços de usuário/storage disponíveis

## Tarefas
- [ ] T-01, Implementar cadastro de colaborador com role `employee`
  - Origem no legado: `src/app/(authenticated)/cadastrar-colaborador/page.tsx`
  - Critério de pronto: criação com vínculo de cidade
  - Confiança: 🟢

- [ ] T-02, Implementar listagem filtrada por cidade
  - Origem no legado: `src/store/services/user.ts`
  - Critério de pronto: somente colaboradores da cidade aparecem
  - Confiança: 🟢

- [ ] T-03, Implementar edição com atualização parcial
  - Origem no legado: `src/store/services/user.ts`
  - Critério de pronto: campos atualizados sem perda de integridade
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Cadastro válido
- [ ] TT-02, Edição válida
- [ ] TT-03, Erro de upload de imagem

## Ordem Sugerida
1. Serviços
2. Formulário
3. Testes

## Lacunas Pendentes (🔴)
- Regras completas de CPF não descritas fora do schema.
