# Requisitos e Critérios de Sucesso — Migração

Escopo dos requisitos
- Funcionais: preservar todas as operações existentes expostas ao frontend (login, CRUD de rotas, coletadores, ecopontos, avisos, solicitações de retirada, etc.).
- Não funcionais: disponibilidade ≥99%, latência compatível com UX atual, observabilidade completa, backups e rollback.

Requisitos essenciais
- Autenticação centralizada em Keycloak com RBAC compatível com perfis atuais.
- BFF em Spring Boot para manter compatibilidade com Next.js App Router.
- Migrar dados do Firestore/Realtime DB para MongoDB sem perda.
- Migrar arquivos do Firebase Storage para MinIO, atualizando a forma de gerar URLs seguros.
- Implementar testes de contrato (OpenAPI) e migração de dados verificáveis.

Critérios de aceitação
- Testes E2E (fluxos críticos) passam em staging com dados migrados.
- Comparação de contagem/checagem de integridade entre Firestore e MongoDB OK.
- Uploads/downloads de arquivos funcionam via MinIO no ambiente de staging.
- Autenticação e autorização válidas via Keycloak; sessions BFF autenticam o Next.js.

Observabilidade e segurança
- Logs estruturados (JSON), métricas Prometheus, traces distribuídos (OpenTelemetry).
- Gestão de segredos via vault/secret manager; TLS obrigatório entre serviços.
