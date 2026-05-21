# email, Tarefas de Implementação

## Pré-requisitos
- [ ] Variáveis SMTP configuradas
- [ ] Endpoint API ativo

## Tarefas
- [ ] T-01, Implementar endpoint de envio de email
  - Origem no legado: `src/app/api/email/route.ts`
  - Critério de pronto: envia email em cenário válido
  - Confiança: 🟢

- [ ] T-02, Implementar serviço cliente de envio
  - Origem no legado: `src/store/services/email.ts`
  - Critério de pronto: encapsula chamada e retorno de erro
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Happy path SMTP
- [ ] TT-02, Falha de credenciais
- [ ] TT-03, Payload inválido

## Ordem Sugerida
1. Endpoint
2. Serviço cliente
3. Testes

## Lacunas Pendentes (🔴)
- Política de fila/retry para indisponibilidade SMTP.
