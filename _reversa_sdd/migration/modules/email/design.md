# Email — Design

Componentes
- `EmailService` interface (port) and `SmtpAdapter` implementation.
- Templates stored in repo or templating service.

Queue
- Use a durable queue (e.g., RabbitMQ/Kafka) for retry and resilience if high volume expected.
