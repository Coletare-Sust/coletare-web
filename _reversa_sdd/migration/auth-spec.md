# Especificação — Autenticação e BFF

Objetivo
- Substituir Firebase Auth por Keycloak, usando BFF para manter sessão segura entre Next.js e backend.

Requisitos
- Keycloak realm com mapeamento de roles (admin, colaborador, operador, cidadão).
- Migração de usuários: exportar usuários Firebase (UID, email, metadata) e provisionar em Keycloak.
- Suporte a login social (Google) reativado via Keycloak Identity Provider ou migração de credenciais.
- BFF deve emitir cookie HTTP-only com sessão e encaminhar tokens OIDC internamente.

Fluxo proposto
1. Usuário acessa Next.js → request para BFF `/auth/login` → redireciona para Keycloak (OIDC) ou aceita credentials.
2. Ao autenticar, BFF armazena sessão segura (cookie) e mantém tokens internamente.
3. BFF injeta informação de usuário (claims) nos requests para serviços de domínio.

Migração de contas
- Exportar usuários do Firebase: identificar provedores (email/pass, google) e mapear para Keycloak.
- Para senhas, se hash não exportável, emitir fluxo de reset para usuários (email) com aviso.

Segurança
- TLS + SameSite=strict cookies; CSRF mitigations no BFF.
- RBAC: mapear roles atuais para roles Keycloak e aplicar Gatekeepers nos casos de autorização por método.

Testes
- Testes de contrato: `GET /bff/me` deve retornar payload compatível com frontend.
- Testes de migração: número de usuários e emails correspondentes, logins testados em staging.
