# CI/CD, Infra e Estratégia de Rollout

Infra recomendada
- Containerizar serviços Spring Boot com Docker.
- Orquestração: Kubernetes (Helm) ou VMs + Systemd para monólito modular. Escolher conforme restrições operacionais.
- Provisionamento infra: Terraform (multi-cloud) ou ARM/Bicep se for Azure.

CI/CD
- Pipelines para build/test/containerize → push imagem → deploy em staging → run migrations → smoke tests → deploy em produção.
- Gate de deploy: aprovação manual após validações automatizadas e verificação de dados.

Rollout
- Canary ou Blue-Green para reduzir risco. Fazer cutover por módulo quando possível.
- Horário de janela de manutenção curta para operações de migração massiva.

Backup e Disaster Recovery
- Backups regulares do MongoDB; snapshot consistente antes de cada grande migração.

Observability
- Instrumentar com OpenTelemetry + Prometheus + Grafana.
- Centralizar logs (EFK/ELK) e configurar alertas para erros críticos e regressões de latência.
