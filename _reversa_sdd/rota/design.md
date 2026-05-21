# rota, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `useCollect` | `(id: string)` | `CollectEntity` | Coleta por ID |
| `useRoute` | `(routeId: string)` | `RouteEntity` | Rota por ID |
| `exportExcel` | `(excelData, fileName)` | `void` | Exportação XLSX |

## Fluxo Principal
1. Carregar coleta via parâmetro da rota dinâmica.
2. Resolver rota/cidade/colaborador relacionados.
3. Renderizar mapa com polyline decodificada.
4. Exibir cards e gráficos.
5. Montar JSON de exportação e gerar XLSX.

## Fluxos Alternativos
- **Sem dados ainda:** loading.
- **Dados parciais:** fallback textual para campos faltantes.

## Dependências
- Serviços de coleta/rota.
- Google Maps API.
- Serviço de exportação.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Cálculo de métricas antes da exportação | `src/app/(authenticated)/rota/[id]/page.tsx` | 🟢 |
| Uso de polyline para renderização de trajeto | `src/app/(authenticated)/rota/[id]/page.tsx` | 🟢 |

## Estado Interno
Estados de séries de gráfico e path do mapa.

## Observabilidade
Sem telemetria dedicada; logs e toasts pontuais.

## Riscos e Lacunas
- 🟡 Dependência forte da Google Maps API em tempo de execução.
