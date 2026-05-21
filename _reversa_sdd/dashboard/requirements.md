# dashboard

## Visão Geral
Consolida indicadores operacionais de coleta por cidade e por rota, com recortes anual, semestral e mensal.

## Responsabilidades
- Agregar dados de coletas dos últimos 12 meses.
- Exibir custos, massa, emissão e combustível em gráficos.

## Regras de Negócio
- Janela temporal é móvel de 12 meses. 🟢
- Séries são reorganizadas para refletir mês corrente como referência. 🟢
- Sem coletas, retorna estrutura zerada padrão. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Calcular séries de `landfill`, `fuel`, `emission`, `mass` | Must | Dados agregados disponíveis por ano/semestre/mês |
| RF-02 | Permitir filtro por rota | Should | Quando rota é informada, somente coletas da rota entram na série |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Cache de consulta com React Query | `src/hooks/queries/useDashboardData.ts` | 🟢 |
| Disponibilidade | Fallback para estrutura padrão sem dados | `src/store/services/collects.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado uma cidade com coletas no período
Quando o dashboard for carregado
Então os quatro indicadores devem ser apresentados com séries temporais válidas

Dado uma cidade sem coletas
Quando o dashboard for carregado
Então os gráficos devem renderizar com valores zerados
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Agregação das séries | Must | Base do módulo analítico |
| Filtro por rota | Should | Segmentação importante, mas não bloqueante |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/collects.ts` | `getDashboardData` | 🟢 |
| `src/hooks/queries/useDashboardData.ts` | `useAllDashboard` | 🟢 |
