# Spec: Migração de Coletas e Dashboard — Firebase → Backend REST

## Contexto

O módulo `collects.ts` e `collect.ts` no frontend realiza chamadas e agregações que utilizavam o Firebase Realtime Database. Recentemente, a listagem migrou para `apiFetch`, mas a agregação de dados da **Dashboard** permaneceu no frontend gerando falhas por incompatibilidade no campo `createdAt`.

## 1. getDashboardData em `collects.ts`

**Problema atual:** A função busca todos os registros de coleta da cidade e calcula localmente o peso, emissão e combustível.
**Mudança:** O backend já faz isso eficientemente e com filtros no `GET /metrics/{cityId}/dashboard`.

**Implementação:**

1. Excluir toda a manipulação de arrays e objetos `defaultDataValue`.
2. Substituir por:

```typescript
export const getDashboardData = async (cityId: string, routeId?: string) => {
  try {
    const url = routeId 
      ? `/metrics/${cityId}/dashboard?routeId=${routeId}` 
      : `/metrics/${cityId}/dashboard`;
    return await apiFetch(url);
  } catch (error) {
    console.error(error);
    return null; // Tratar estado de nulo/vazio na UI
  }
};
```

## 2. updateCollect em `collects.ts`

- **Ação:** O mapeamento para o backend já está adaptado para `PUT /collect/${id}` de forma parcial.
- **Verificar:** Certificar-se de passar corretamente `vehicleId` e manter as tipagens do `CollectEntity` de acordo com a API REST.

## 3. Demais Métodos

- `getCollect` (em `collect.ts`), `getAllCollectsByRoute`, `getAllCollectsByCity` (em `collects.ts`) já fazem fetch para `/collect/*`. Nenhuma mudança grave necessária.
