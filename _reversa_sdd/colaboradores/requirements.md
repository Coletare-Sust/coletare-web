# colaboradores

## Visão Geral
Gerencia cadastro, edição e listagem de colaboradores vinculados ao município.

## Responsabilidades
- Cadastrar colaborador com dados pessoais e imagem.
- Editar dados cadastrais.
- Listar colaboradores por cidade.

## Regras de Negócio
- Colaborador é usuário com `role = employee`. 🟢
- Colaborador pertence ao `cityId` do admin autenticado. 🟢
- Imagem de perfil é opcional, mas suportada no fluxo. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cadastrar colaborador | Must | Novo registro de usuário com role `employee` |
| RF-02 | Editar colaborador | Should | Campos atualizados sem perder vínculo da cidade |
| RF-03 | Listar colaboradores da cidade | Must | Retorno filtrado por `cityId` e `role=employee` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Escopo por cidade via filtro no backend de dados | `src/store/services/user.ts` | 🟢 |
| Disponibilidade | Erros retornados em estrutura controlada | `src/store/services/user.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado um admin autenticado
Quando cadastrar colaborador válido
Então o colaborador deve aparecer na listagem da cidade

Dado um colaborador existente
Quando editar nome e documento
Então os novos dados devem persistir
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cadastro e listagem | Must | Fluxo operacional central |
| Edição | Should | Manutenção contínua |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/user.ts` | `createUser`, `getAllCollaborators`, `updateUserDoc` | 🟢 |
| `src/app/(authenticated)/cadastrar-colaborador/page.tsx` | `CadastrarVeiculoPage` | 🟢 |
