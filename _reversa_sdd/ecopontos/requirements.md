# ecopontos

## Visão Geral
Gerencia ecopontos por cidade via API externa REST, com filtros por tipo de resíduo e operações CRUD.

## Responsabilidades
- Criar, atualizar e excluir ecopontos.
- Listar ecopontos por cidade.
- Filtrar visualização por tipos de resíduo.

## Regras de Negócio
- Fonte principal é API externa configurada por ambiente. 🟢
- Ecoponto pode ter múltiplos tipos de resíduo. 🟢
- Exclusão exige confirmação do usuário na UI. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar ecopontos por cidade | Must | Lista retornada da API para `cityId` |
| RF-02 | Criar/editar ecoponto | Must | Alterações persistidas na API |
| RF-03 | Excluir ecoponto | Should | Registro removido e lista atualizada |
| RF-04 | Filtrar por resíduo | Should | UI mostra somente pontos compatíveis |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Fallback de URL local para desenvolvimento | `src/store/services/ecopoint.ts` | 🟢 |
| Segurança | Requisições JSON com validação de status HTTP | `src/store/services/ecopoint.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado um município com ecopontos cadastrados
Quando abrir a tela
Então os pontos devem ser listados

Dado filtro de tipo de resíduo selecionado
Quando aplicar filtro
Então apenas ecopontos compatíveis devem aparecer
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD básico | Must | Núcleo do módulo |
| Filtro por resíduo | Should | Experiência operacional |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/ecopoint.ts` | `createEcoponto`, `updateEcoponto`, `deleteEcoponto`, `getEcopontosByCity` | 🟢 |
| `src/app/(authenticated)/ecopontos/page.tsx` | `EcopontosPage` | 🟢 |
