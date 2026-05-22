# Dashboard — Design

Componentes
- Use-cases: `GetDashboardSummary`, `GetCollectStats`, `GetRouteStats`.
- Repositórios de leitura otimizados; considerar agregados pré-computados ou materialized views em coleções auxiliares.

Data model
- Collections: `collects`, `routes`, `users`, `ecopoints`.
- Materialized collection `dashboard_aggregates` com snapshot diário e TTL para refresh.

Adapters
- `MongoDashboardRepository` implementando queries otimizadas; cache layer via Redis.
