# Solicitações de Retirada — Design

Aggregate `Solicitacao`:
- id, requesterId, address, municipalityId, residueTypes[], status, assignedRouteId?, scheduledAt, attachments[]

Ports
- `SolicitacaoRepository`, `NotificationPort` to inform users/operators.

State machine
- States: `requested` → `scheduled` → `in_progress` → `completed` → `closed`.
