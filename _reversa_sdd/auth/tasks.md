# auth, Tarefas de Implementação

## Pré-requisitos
- [ ] Firebase Auth e Admin configurados
- [ ] Variáveis de ambiente de login e admin configuradas

## Tarefas
- [ ] T-01, Implementar login email/senha e social
  - Origem no legado: `src/store/services/auth.ts`
  - Critério de pronto: login retorna `{ user, error }`
  - Confiança: 🟢

- [ ] T-02, Implementar recuperação/atualização de senha e logout
  - Origem no legado: `src/store/services/auth.ts`
  - Critério de pronto: reset enviado e senha atualizável em sessão ativa
  - Confiança: 🟢

- [ ] T-03, Implementar endpoints internos de criação/remoção de credenciais
  - Origem no legado: `src/app/api/createAuth/route.ts`, `src/app/api/deleteAuth/route.ts`
  - Critério de pronto: operação administrativa responde JSON com erro nulo em sucesso
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Happy path login email/senha
- [ ] TT-02, Erro de credencial inválida
- [ ] TT-03, Erro de email duplicado em criação admin

## Ordem Sugerida
1. Serviços auth
2. Endpoints admin
3. Testes de autenticação

## Lacunas Pendentes (🔴)
- Política formal de bloqueio de tentativas.
