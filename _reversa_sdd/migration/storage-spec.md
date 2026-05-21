# Storage Migration — Firebase Storage → MinIO (S3-compatível)

Objetivo
- Migrar todos os ativos (imagens, documentos) do Firebase Storage para MinIO e atualizar o fluxo de geração de URLs seguros.

Etapas
1. Inventariar buckets/paths usados (referências no código: storage bucket URIs, links em entidades).
2. Provisionar MinIO (staging) com buckets e políticas.
3. Copiar objetos em lote (rclone, gsutil -> s3 transfer tools ou scripts node/python usando streams).
4. Migrar metadados relevantes (content-type, custom metadata) e preservar timestamps quando possível.
5. Atualizar adaptador de storage no backend (adapter S3) para gerar presigned URLs.

Considerações
- Preservar permalinks usados pelo frontend; se mudar rota de URL, implementar redirect/rewriting no BFF.
- Implementar TTL/lifecycle rules se necessário.

Validação
- Testar uploads/downloads via MinIO; garantir permissões e performance.
