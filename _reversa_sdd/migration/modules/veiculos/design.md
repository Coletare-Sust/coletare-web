# Veículos — Design

Aggregate `Veiculo`:
- id, plate, model, ownerId, collaborators[], status, registrationDocs[]

Ports & Adapters
- `VeiculoRepository`, `StorageAdapter` para docs.

Considerações
- Validar unicidade de `plate` via índice único no MongoDB.
