# avisos

## Visão Geral
Gerencia publicação de avisos por cidade, com conteúdo textual, imagem, listagem, edição e remoção.

## Responsabilidades
- Criar aviso com imagem opcional/obrigatória conforme fluxo de tela.
- Listar e filtrar avisos por data.
- Editar e excluir avisos.

## Regras de Negócio
- Apenas admin da cidade pode criar aviso. 🟢
- Criação e atualização registram timestamps ISO. 🟢
- Exclusão remove imagem associada quando existente. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Criar aviso com título, descrição e imagem | Must | Aviso persiste em `warnings` com ID e timestamps |
| RF-02 | Listar avisos por cidade | Must | Lista retorna somente cidade do usuário |
| RF-03 | Editar aviso | Should | Atualização persiste novos campos e `updatedAt` |
| RF-04 | Excluir aviso | Must | Registro e imagem associada são removidos |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Validação de perfil admin na criação | `src/store/services/warning.ts` | 🟢 |
| Disponibilidade | Tratamento explícito de erro no CRUD | `src/store/services/warning.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado um admin autenticado
Quando criar um aviso válido
Então o aviso deve aparecer na listagem da cidade

Dado um aviso existente
Quando for removido
Então o registro e sua imagem devem deixar de existir
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Criação e listagem | Must | Comunicação operacional central |
| Exclusão | Must | Controle de conteúdo obrigatório |
| Edição | Should | Manutenção incremental |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/warning.ts` | `createWarningService`, `getAllWarningService`, `updateWarningService`, `deleteWarningService` | 🟢 |
| `src/app/(authenticated)/avisos/page.tsx` | `ListaDeAvisosPag` | 🟢 |
