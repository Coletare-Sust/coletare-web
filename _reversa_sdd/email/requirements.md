# email

## Visão Geral
Realiza envio de email transacional através de endpoint interno usando Nodemailer.

## Responsabilidades
- Receber payload de email da UI.
- Encaminhar para endpoint interno.
- Enviar email via SMTP configurado por ambiente.

## Regras de Negócio
- Endpoint `/api/email` aceita `email`, `subject`, `html`. 🟢
- Credenciais SMTP vêm de variáveis de ambiente. 🟢
- Falha de envio retorna erro amigável no JSON. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Enviar email via endpoint interno | Must | Retorno `error=null` em sucesso |
| RF-02 | Propagar erro de envio para camada chamadora | Should | Chamador recebe `error` quando falha |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Credenciais não hardcoded, via env | `src/app/api/email/route.ts` | 🟢 |
| Disponibilidade | Tratamento de exceção com resposta JSON controlada | `src/app/api/email/route.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado um payload válido de email
Quando chamar o endpoint de envio
Então o email deve ser enviado e `error` deve ser nulo

Dado falha de credencial SMTP
Quando chamar o endpoint
Então a resposta deve indicar erro de envio
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Envio de email | Must | Suporta onboarding e comunicação |
| Propagação de erro | Should | Diagnóstico operacional |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/email.ts` | `sendEmail` | 🟢 |
| `src/app/api/email/route.ts` | `POST` | 🟢 |
