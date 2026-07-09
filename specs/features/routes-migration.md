# Spec: Migração de Rotas (Routes) — Firebase → Backend REST

## Contexto

A gestão de rotas do sistema está localizada no arquivo `route.ts`. A conversão envolve mapear as chamadas orientadas ao Firebase Database para o `RouteController` no gateway backend de logística.

## Endpoints Disponíveis e Mapeamentos

Substitua as implementações atuais do Firebase por `apiFetch`:

### 1. `getRoutes(cityId)`
- **Chamar:** `GET /route/{cityId}/city`
- Retornará todas as rotas específicas daquela cidade. 
- O frontend precisará formatar os dias da semana (`weekdays`) e coordenadas caso exijam parse.

### 2. `createRoute(data)`
- **Chamar:** `POST /route/{cityId}/city`
- O `cityId` será passado na URL e o body com o `CreateRouteInput` que compreende nomes, descrição, horários e arrays de pontos.

### 3. `getRoute(id)`
- **Chamar:** `GET /route/{id}`

### 4. `updateRoute(id, data)` / `updateRouteDoc(id, data)`
- **Chamar:** `PUT /route/{id}`
- O body deve conter os dados parciais ou absolutos preenchidos no objeto `UpdateRouteInput`.

### 5. `deleteRoute(id)` / `deleteRouteDoc(id)`
- **Chamar:** `DELETE /route/{id}`
