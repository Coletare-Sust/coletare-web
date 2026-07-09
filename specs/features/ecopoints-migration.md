# Spec: Migração de Ecopontos (Ecopoints) — Firebase → Backend REST

## Contexto

A camada de Ecopontos (`ecopoint.ts`) é utilizada para gerenciar pontos ecológicos de descarte em formato de container na cidade.

## Endpoints (Implementação em andamento)

Os endpoints de Ecopontos (`EcopointController`) estão recém-desenvolvidos. Você deverá utilizá-los desta forma usando `apiFetch`:

### 1. `getEcopoints(cityId)`
- **Chamar:** `GET /ecopoint/{cityId}/city`

### 2. `createEcopoint(data)`
- **Chamar:** `POST /ecopoint/{cityId}/city`

### 3. `updateEcopoint(id, data)` / `updateEcopointDoc(uid, data)`
- **Chamar:** `PUT /ecopoint/{id}`

### 4. `deleteEcopoint(id)` / `deleteEcopointDoc(uid)`
- **Chamar:** `DELETE /ecopoint/{id}`

### 5. `getEcopoint(id)`
- **Chamar:** `GET /ecopoint/{id}`
