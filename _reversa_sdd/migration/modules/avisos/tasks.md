# Avisos — Tasks

1) Data model
- Criar coleção `avisos` em MongoDB com índices (municipalityId, status, createdAt).

2) API
- Implementar endpoints BFF compatíveis com frontend.

3) Storage
- Integrar attachments via Storage Adapter (MinIO).

4) Migration
- Export avisos do Firestore e importar, preservando IDs e timestamps.

5) Tests
- Contrato e E2E validação dos filtros e criação por usuário com role apropriada.
