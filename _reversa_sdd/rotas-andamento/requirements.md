# rotas-andamento

## Visão Geral
Acompanha o estado operacional das rotas em andamento no contexto do município.

## Responsabilidades
- Exibir visão consolidada de execução atual.
- Integrar com fluxo de veículos e rotas ativas.

## Regras de Negócio
- Tela é acessada via navegação autenticada. 🟢
- Dados dependem de rotas/coletas ativas no período. 🟡

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Mostrar rotas em andamento | Must | Operação atual visível para usuário autorizado |
| RF-02 | Permitir navegação operacional associada | Should | Usuário consegue ir para telas relacionadas |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Renderização em layout autenticado comum | `src/app/(authenticated)/layout.tsx` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado usuário autenticado
Quando abrir rotas em andamento
Então deve visualizar o estado operacional atual

Dado ausência de rotas ativas
Quando abrir a tela
Então deve visualizar estado vazio sem falha
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Visualização operacional | Must | Acompanhamento de execução |
| Navegação associada | Should | Complemento do fluxo |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/(authenticated)/rotas-andamento/page.tsx` | `default export` | 🟡 |
| `src/app/(authenticated)/layout.tsx` | composição de navegação | 🟢 |
