# Rotas-Andamento — Design

Model
- Collection `rota_progress` with documents per route run: routeId, runId, pointStatuses[], startedAt, updatedAt.

Adapters
- `ProgressRepository`, optional websocket adapter in BFF to push updates to frontend.

Considerações
- Keep writes append-only where possible and provide compaction job.
