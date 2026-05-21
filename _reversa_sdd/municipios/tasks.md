# municipios, Tarefas de Implementação

## Pré-requisitos
- [ ] Serviços de auth, usuário, storage e email
- [ ] Schema de cadastro de cidade

## Tarefas
- [ ] T-01, Implementar cadastro de município com provisionamento completo
  - Origem no legado: `src/app/(authenticated)/municipios/cadastrar/page.tsx`
  - Critério de pronto: auth + perfil + email concluídos
  - Confiança: 🟢

- [ ] T-02, Implementar edição de município
  - Origem no legado: `src/app/(authenticated)/municipios/cadastrar/page.tsx`
  - Critério de pronto: atualização de dados e imagem
  - Confiança: 🟢

- [ ] T-03, Implementar exclusão de município
  - Origem no legado: `src/app/(authenticated)/municipios/page.tsx`
  - Critério de pronto: remoção de perfil, auth e imagem
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Cadastro happy path
- [ ] TT-02, Edição com troca de imagem
- [ ] TT-03, Exclusão completa

## Ordem Sugerida
1. Provisionamento
2. Edição
3. Exclusão e testes

## Lacunas Pendentes (🔴)
- Estratégia de rollback entre etapas em falha parcial.
