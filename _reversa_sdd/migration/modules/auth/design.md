# Auth — Design

Componentes
- Keycloak realm (`coletare`) com clients:
  - `bff-client` (confidential, OIDC) — BFF aplica token exchange and session cookie
  - `admin-cli` (for admin ops)

Mapping de usuários
- Export Firebase users (uid, email, providers, displayName, photoURL, createdAt)
- Provisionar em Keycloak como user federated or local: prefer local users with mapped attributes

BFF responsibilities
- Handle OIDC redirects and code exchange
- Store tokens server-side; set HTTP-only cookie with session id
- Provide `me` endpoint with consolidated claims (roles, uid mapping)

Ports & Adapters
- Port: `UserProvisioningPort`, `AuthPort` (login, refresh, logout)
- Adapter infra: `KeycloakAdapter` implementing ports via Keycloak Admin REST and OIDC endpoints

Data model
- `User` aggregate: id (UUID), externalId (firebase UID), email, roles[], metadata

Security
- Enforce RBAC via method-level guards in service layer; map Keycloak roles to domain permissions
