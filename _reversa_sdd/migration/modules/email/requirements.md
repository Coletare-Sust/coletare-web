# Email — Requisitos

Resumo
- Envio de emails transacionais (recuperação de senha, notificações de sistema) via SMTP provider.

Funcionais
- Endpoints internos usados por serviços: `EmailService.send(template, to, context)`.

Não-funcionais
- Retry com backoff, observability e queueing (e.g., RabbitMQ or internal queue).
