# rotas

## Visão Geral
Gerencia criação, edição, consulta e exclusão de rotas operacionais por cidade.

## Responsabilidades
- Criar rotas com waypoints, período e dias.
- Consultar/listar rotas por cidade.
- Atualizar e remover rotas.

## Regras de Negócio
- Rota pertence a uma cidade (`cityId`). 🟢
- Dias de operação são representados em vetor booleano. 🟢
- `platformAdmin` não cria rota diretamente na tela de listagem. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Criar rota | Must | Rota salva em `routes/{id}` com campos obrigatórios |
| RF-02 | Listar rotas por cidade | Must | Lista retorna apenas rotas da cidade |
| RF-03 | Editar rota | Should | Alterações persistidas por update parcial |
| RF-04 | Excluir rota | Should | Registro removido por ID |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Tratamento de erro com retorno nulo/erro controlado | `src/store/services/route.ts` | 🟢 |
| Escalabilidade | Filtro por cidade no backend reduz volume de leitura | `src/store/services/route.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado um admin de cidade
Quando criar uma nova rota válida
Então a rota deve aparecer na listagem da cidade

Dado uma rota existente
Quando removê-la
Então a rota não deve mais aparecer na listagem
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Criação/listagem | Must | Núcleo operacional do módulo |
| Edição/exclusão | Should | Ciclo de manutenção |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/route.ts` | `createRoute`, `getRoutes`, `updateRouteDoc`, `deleteRoute` | 🟢 |
| `src/app/(authenticated)/rotas/page.tsx` | `Rotas` | 🟢 |
