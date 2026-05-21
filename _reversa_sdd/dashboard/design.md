# dashboard, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getDashboardData` | `(cityId: string, routeId?: string)` | `DashboardEntity` | Agrega séries |
| `useAllDashboard` | `(cityId: string)` | `UseQueryResult` | Query com cache |

## Fluxo Principal
1. Buscar coletas por cidade.
2. Filtrar últimos 12 meses.
3. Opcionalmente filtrar por rota.
4. Calcular custo de aterro, combustível, emissão e massa.
5. Projetar arrays anual/semestral/mensal.

## Fluxos Alternativos
- **Sem dados:** retorna arrays zerados.
- **Erro de consulta:** captura erro e retorna fallback.

## Dependências
- Serviço de coletas.
- Hooks de query.
- Componentes de gráfico.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Uso de arrays fixos para períodos | `src/store/services/collects.ts` | 🟢 |
| Cache de 45 min com React Query | `src/hooks/queries/useDashboardData.ts` | 🟢 |

## Estado Interno
Estado derivado de consulta; não há persistência local durável.

## Observabilidade
Logs de erro via `console.error`.

## Riscos e Lacunas
- 🟡 Cálculos financeiros dependem da qualidade dos coeficientes de entrada.
