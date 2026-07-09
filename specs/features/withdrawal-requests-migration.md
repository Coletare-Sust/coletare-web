# Spec: Migração de Solicitações (Withdrawal Requests) — Firebase → Backend REST

## Contexto

Módulo `withdrawalsRequests.ts` no frontend deve apontar suas origens de dados de agendamento de coletas especiais para a Controller de Logística do backend.

## Endpoints Disponíveis e Mapeamentos

### 1. Consultar Solicitações
- **Chamar:** `GET /withdrawal-request/{cityId}/city`

### 2. Criar Solicitação (`createWithdrawalRequest`)
- **Chamar:** `POST /withdrawal-request/{cityId}/city`
- Esse endpoint no backend exige **`multipart/form-data`**. O objeto via `data` e o arquivo anexado via `image`. No `feth` do Next.js, use `FormData`.

### 3. Deletar Solicitação (`deleteWithdrawalRequest`)
- **Chamar:** `DELETE /withdrawal-request/{id}`

### 4. Atualizar Solicitação (`updateWithdrawalRequest`)
- **Chamar:** `PUT /withdrawal-request/{id}`
- **Nota:** O backend já receberá cobertura desse endpoint de atualização ainda neste roadmap.
