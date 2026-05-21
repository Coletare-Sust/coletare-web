Plano de Migração — Firebase BaaS → Spring Boot + MongoDB

Status: Rascunho inicial

Objetivo
- Migrar o backend atual (Firebase Auth, Firestore/Realtime DB, Firebase Storage, Cloud Functions) para um backend em Spring Boot (Java) com banco MongoDB e armazenamento S3-compatível (MinIO).
- Garantir design baseado em Domain-Driven Design (DDD), Clean Architecture, Ports & Adapters e arquitetura de Monólito Modular.

Escopo
- Gerar especificações, arquitetura e planejamento por módulo antes de iniciar a migração executável.
- Autenticação: Keycloak + BFF (Backend For Frontend) para o Next.js frontend.
- Armazenamento de objetos: MinIO (S3-compatível).
- Banco de dados primário: MongoDB (hosted/self-managed conforme infra definida).

Restrições e critérios de sucesso
- Manter compatibilidade funcional com o frontend Next.js sem mudanças drásticas no cliente (BFF suaviza diferenças).
- Zero perda de dados; operações idempotentes durante migração.
- Plano de rollback testado para cada módulo.

Riscos principais
- Mapeamento não-trivial de modelos Firestore para coleções MongoDB (denormalização/consistência).
- Diferenças entre regras de segurança do Firebase e controle de acesso em Keycloak/serviços.
- Latência durante sincronização massiva de objetos para MinIO.

Próximos artefatos (criando em `_reversa_sdd/migration/`)
- requirements.md — requisitos e critérios.
- architecture.md — visão de alto nível, diagramas C4 e módulos.
- auth-spec.md — especificação de migração de autenticação e BFF.
- data-migration.md — mapeamentos e scripts de migração.
- storage-spec.md — plano de migração de arquivos para MinIO.
- module-migration-template.md — template para specs por módulo.
- ci-cd-rollout.md — pipelines e estratégia de implantação.

Autor: Reversa-Migrate (assistente) — rascunho para revisão

Aguardando autorização do time para proceder com a geração detalhada das specs por módulo e execução da migração.
