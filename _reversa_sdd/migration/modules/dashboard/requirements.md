# Dashboard — Requisitos

Resumo
- APIs para alimentar dashboards: agregações de collects, rotas, ecopontos e KPIs.

Funcionais
- Endpoints de leitura otimizada: `/bff/dashboard/summary`, `/bff/dashboard/collects`, `/bff/dashboard/routes`.

Não-funcionais
- Leitura com latência baixa; suportar consultas paginadas e caches (Redis).

Critérios de aceitação
- Dashboards em staging exibem dados equivalentes ao ambiente atual após migração dos dados.
