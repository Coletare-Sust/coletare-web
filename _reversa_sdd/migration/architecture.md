# Arquitetura alvo — Visão de alto nível

Principais decisões arquiteturais
- Monólito Modular em Spring Boot: cada domínio (auth, users, routes, collects, ecopontos, notifications, email, storage) como módulo Java com fronteiras claras.
- Padrões: Domain-Driven Design (Agregados, Entities, Value Objects), Clean Architecture (use-cases, ports/adapters), Ports & Adapters para infra.
- Persistência: MongoDB por módulo (coleções per-aggregate), repositórios implementando portas.
- Autenticação: Keycloak (OIDC). Frontend comunica-se apenas com BFF (Spring Boot) que atua como cliente OIDC/ponto seguro.
- Armazenamento de objetos: MinIO (S3-compatível) acessado por adaptadores infra.

Diagrama (resumo textual)
- Next.js UI ↔ BFF (Spring Boot - Módulo `bff`) ↔ Serviço de Domínio (módulos) ↔ MongoDB
- Serviços infra: Keycloak, MinIO, MongoDB, Observability stack, CI/CD.

Contrato e compatibilidade
- BFF expõe endpoints que substituem os atuais endpoints do Firebase used pelo frontend; OpenAPI para cada módulo.
- Contratos versionados; em primeira fase, BFF oferece endpoints compatíveis com chamadas atuais do frontend.

Módulos iniciais (priorizados)
1. Auth & Users (Keycloak integration)
2. Collects / Dashboard (crítico para relatórios)
3. Routes (criação/atualização de rotas)
4. Ecopontos
5. Avisos (warnings)
6. Vehicles & Collaborators
7. Notifications & Email (push/email)
8. Storage adapter (MinIO)

Notas operacionais
- Módulos internos comunicam-se via method calls; evitar RPC interna no monólito.
- Planejar limites de agregação para evitar hotspots (por ex. rotas muito grandes).
