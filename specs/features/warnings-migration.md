# Spec: Migração de Avisos (Warnings) — Firebase → Backend REST

## Contexto

O gerenciamento de alertas pelo município (usado para alertar cidadãos de problemas nas rotas ou avisos gerais) é contido em `warning.ts`.

## Endpoints Disponíveis e Mapeamentos

### 1. `getWarnings(cityId)`
- **Chamar:** `GET /warning/{cityId}/city`

### 2. `createWarning(data, imageFile)`
- **Chamar:** `POST /warning/{cityId}/city`
- Note que atualmente o `Warning` pode ter imagem anexada. Se o backend usa base64 ou URL de bucket, garanta que o input no JSON seja compativel (`image` como string), ou adapte caso o backend converta para uso com `MultipartFile` na Controller (o controller atual do `WarningController` não recebe MultipartFile para imagem, recebe apenas JSON: `@RequestBody CreateWarningInput`). Isso significa que a foto deve ser enviada como string ou upada previamente para retorno da URL.

### 3. `updateWarning(id, data)`
- **Chamar:** `PUT /warning/{id}`

### 4. `deleteWarning(id)`
- **Chamar:** `DELETE /warning/{id}`
