# email, Design Técnico

## Interface

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| POST | `/api/email` | `{ email, subject, html }` | `{ error }` | 200 |

## Fluxo Principal
1. Camada cliente chama `sendEmail`.
2. Requisição POST para `/api/email`.
3. Endpoint monta `transporter` do Nodemailer.
4. Executa `sendMail` e responde JSON.

## Fluxos Alternativos
- **Erro SMTP:** resposta `{ error: "Não foi possível enviar o email" }`.

## Dependências
- Nodemailer.
- Variáveis de ambiente SMTP.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Encapsular envio em endpoint interno do Next | `src/app/api/email/route.ts` | 🟢 |
| Serviço cliente simplifica retorno para `{ error }` | `src/store/services/email.ts` | 🟢 |

## Estado Interno
Sem estado persistente.

## Observabilidade
Erros não estruturados, sem tracing dedicado.

## Riscos e Lacunas
- 🟡 Ausência de retry/backoff explícito.
