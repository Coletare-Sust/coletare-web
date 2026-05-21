# Data Migration — Firestore/Realtime → MongoDB

Visão geral
- Cada coleção/entidade do Firestore será mapeada a uma coleção MongoDB. Avaliar denormalização para otimizar leituras usadas pelo frontend.

Etapas
1. Inventariar coleções e documentos (usar `.reversa/context/modules.json` gerado pelo Reversa para identificar entidades).
2. Definir mapeamentos por entidade (transformações de campos, tipos e timestamps).
3. Implementar scripts de migração em Java/Python (ETL), com modo `dry-run` e `verify`.
4. Rodar migração inicial para staging; validar contagens, checksums e amostras de dados.
5. Implementar sincronização incremental (change stream / pubsub) para updates ocorridos durante rollout.

Consistência e verificação
- Para cada documento migrado, armazenar hash e comparação entre origem/destino.
- Testes de integridade: contagem por query, amostras aleatórias verificadas por campo.

Ferramentas sugeridas
- MongoDB Compass / mongoimport para cargas; escrever scripts especializados para transformações complexas.
- Se necessário, usar Debezium para CDC (se Firestore tiver integração) ou cron jobs para diff incremental.

Considerações de performance
- Lotes (bulk write) com tamanhos controlados; retry/backoff e idempotência.
