# Rotas — Design

Aggregate `Rota`:
- id, name, polyline (encoded), points[], assignedVehicleId, assignedCollaborators[], status, createdAt

Indexes
- Index by `assignedVehicleId`, `status`, `createdAt`.

Adapters
- `RouteRepository` (Mongo), `GeoAdapter` for spatial queries if needed.
