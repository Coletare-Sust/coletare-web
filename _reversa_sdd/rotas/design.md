# rotas, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createRoute` | `(data: RouteEntity)` | `{ error }` | Criação |
| `getRoutes` | `(cityId: string)` | `RouteEntity[]` | Listagem por cidade |
| `getRoute` | `(routeId: string)` | `RouteEntity | { error }` | Consulta por ID |
| `updateRouteDoc` | `(uid: string, data: Partial<RouteEntity>)` | `{ error }` | Update |
| `deleteRoute` | `(routeId: string)` | `{ error }` | Remoção |

## Fluxo Principal
1. Construir rota via formulário/mapa.
2. Persistir no Realtime DB.
3. Listar rotas por cidade e renderizar accordion.
4. Aplicar operações de manutenção (editar/remover).

## Fluxos Alternativos
- **Sem rotas:** mostrar estado vazio.
- **Erro em query:** retornar null/erro e manter UI funcional.

## Dependências
- Entidade `RouteEntity`.
- Google Maps (fluxo de criação).
- Hooks React Query para cache/listagem.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Persistência por chave de rota no Realtime DB | `src/store/services/route.ts` | 🟢 |
| Mapeamento de dias booleanos para labels na UI | `src/app/(authenticated)/rotas/page.tsx` | 🟢 |

## Estado Interno
Estado de accordion aberto e filtros por query param.

## Observabilidade
Logs básicos em falha.

## Riscos e Lacunas
- 🟡 Estratégia de consistência de waypoints não formalizada.
