# veiculos, Tarefas de Implementação

## Pré-requisitos
- [ ] Serviços de usuário e autenticação internos
- [ ] Schema de validação de veículo

## Tarefas
- [ ] T-01, Implementar cadastro de veículo
  - Origem no legado: `src/app/(authenticated)/cadastrar-veiculo/page.tsx`
  - Critério de pronto: criação persistida e lista invalidada
  - Confiança: 🟢

- [ ] T-02, Implementar edição de veículo
  - Origem no legado: `src/store/services/user.ts`
  - Critério de pronto: update parcial consistente
  - Confiança: 🟢

- [ ] T-03, Implementar listagem de veículos por cidade
  - Origem no legado: `src/app/(authenticated)/veiculos/page.tsx`
  - Critério de pronto: lista mostra apenas veículos da cidade
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Cadastro happy path
- [ ] TT-02, Edição happy path
- [ ] TT-03, Falha de cadastro por validação

## Ordem Sugerida
1. Serviço e query
2. Formulário
3. Listagem e testes

## Lacunas Pendentes (🔴)
- Requisitos de complexidade de senha não explicitados fora do schema.
