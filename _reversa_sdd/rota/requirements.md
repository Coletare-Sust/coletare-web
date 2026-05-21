# rota

## Visão Geral
Exibe detalhes de execução de uma rota/coleta, com mapa, indicadores e exportação de relatório.

## Responsabilidades
- Mostrar dados da coleta e da rota associada.
- Exibir trajeto/waypoints no mapa.
- Exportar dados em XLSX.

## Regras de Negócio
- Detalhe cruza dados de coleta, rota, cidade e colaborador. 🟢
- Exportação calcula custo/consumo/emissão derivados. 🟢
- Sem coleta carregada, tela deve exibir loading/fallback. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Exibir detalhes de coleta e rota | Must | Informações principais aparecem com dados consistentes |
| RF-02 | Renderizar rota no mapa | Must | Polyline e waypoints visíveis |
| RF-03 | Exportar relatório | Should | Arquivo XLSX gerado com métricas principais |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Consulta segmentada por IDs | `src/app/(authenticated)/rota/[id]/page.tsx` | 🟢 |
| Disponibilidade | Fallback para loading enquanto dados não chegam | `src/app/(authenticated)/rota/[id]/page.tsx` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado uma coleta válida
Quando abrir o detalhe da rota
Então o mapa, os indicadores e as informações da coleta devem ser exibidos

Dado coletas associadas à rota
Quando solicitar exportação
Então um arquivo XLSX deve ser gerado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Exibição de detalhe e mapa | Must | Fluxo operacional central |
| Exportação | Should | Função analítica complementar |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/(authenticated)/rota/[id]/page.tsx` | `Rota` | 🟢 |
| `src/store/services/exportExcel.ts` | `exportExcel` | 🟢 |
