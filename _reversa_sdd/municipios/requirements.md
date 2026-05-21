# municipios

## Visão Geral
Gerencia ciclo de vida de municípios (cidade admin), incluindo criação de credencial, perfil, imagem, parâmetros de cálculo e exclusão.

## Responsabilidades
- Cadastrar município com conta administrativa.
- Editar dados cadastrais e operacionais.
- Excluir município e recursos associados.

## Regras de Negócio
- Cadastro cria primeiro credencial de auth e depois perfil de usuário admin. 🟢
- Exclusão remove perfil, credencial e imagem vinculada. 🟢
- Município possui status operacional (Ativo/Inativo). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cadastrar município | Must | Conta e perfil da cidade criados com sucesso |
| RF-02 | Editar município | Must | Dados e imagem atualizados |
| RF-03 | Excluir município | Should | Conta, perfil e imagem removidos |
| RF-04 | Enviar email de acesso | Should | Credenciais enviadas ao email informado |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Provisionamento de credencial segregado da persistência de perfil | `src/app/(authenticated)/municipios/cadastrar/page.tsx` | 🟢 |
| Disponibilidade | Operações encapsuladas em mutations com tratamento de erro | `src/app/(authenticated)/municipios/page.tsx` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado dados válidos de município
Quando realizar cadastro
Então devem ser criados credencial, perfil e envio de email

Dado um município existente
Quando excluir
Então todos os recursos associados devem ser removidos
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cadastro/edição | Must | Fluxo administrativo central |
| Exclusão/email | Should | Complemento operacional importante |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/(authenticated)/municipios/cadastrar/page.tsx` | `Cadastrar` | 🟢 |
| `src/app/(authenticated)/municipios/page.tsx` | `Municipios` | 🟢 |
