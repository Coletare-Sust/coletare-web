# Avisos — Design

Componentes
- Use-cases: `CreateAviso`, `UpdateAviso`, `ListAvisos`, `DeleteAviso`.
- Aggregate `Aviso`: id, title, content, authorId, municipalityId, routeId?, attachments[], status, createdAt, updatedAt.

Ports & Adapters
- Port: `AvisoRepository`, `NotificationPort` (to send push/email on creation if required).
- Adapter infra: `MongoAvisoRepository`, `StorageAdapter`.

Indexing
- Index by `municipalityId`, `status`, `createdAt` to support queries.
