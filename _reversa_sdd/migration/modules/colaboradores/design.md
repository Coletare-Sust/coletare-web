# Colaboradores — Design

Aggregate `Colaborador`:
- id, userId, vehicleIds[], roles[], municipalityId, active, metadata

Ports & Adapters
- `ColaboradorRepository` (Mongo), `UserPort` para resolução de identidade (via BFF/Keycloak claims).

Considerações
- Use referências a `veiculos` por id (ObjectId) e garantir transações quando necessário (multi-doc updates).
