# Permissions — coletare-new-back

## Papéis identificados

- 🟢 **CONFIRMADO** `platformAdmin`
- 🟢 **CONFIRMADO** `admin`
- 🟢 **CONFIRMADO** `employee`
- 🟢 **CONFIRMADO** `vehicle`
- 🟢 **CONFIRMADO** `citizen`

## Matriz de permissões resumida

| Funcionalidade | platformAdmin | admin | employee | vehicle | citizen |
|---|---:|---:|---:|---:|---:|
| Gerenciar municípios | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 |
| Visualizar dashboard | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 |
| Inserir dados de rota | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 |
| Criar/editar/excluir rotas | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 |
| Criar/editar/excluir avisos | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 |
| Criar/editar/excluir ecopontos | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 |
| Criar/editar/excluir colaboradores | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 |
| Criar/editar/excluir veículos | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 |
| Acompanhar rotas em andamento | 🟢 | 🟢 | 🟡 | 🟡 | 🔴 |
| Receber notificações push | 🔴 | 🟡 | 🟡 | 🟡 | 🟢 |
| Abrir solicitações de retirada | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 |

## Observações confirmadas

- 🟢 **CONFIRMADO** A tela de rotas esconde o botão de criação para `platformAdmin`.
- 🟢 **CONFIRMADO** A tela de inserção de dados de rota mostra o painel de cálculo somente para `platformAdmin`.
- 🟢 **CONFIRMADO** O cadastro de município depende de permissões administrativas elevadas e cria credencial Firebase Auth.
- 🟢 **CONFIRMADO** `employee` e `vehicle` são modelados como subtipos de usuário com dados específicos no Realtime Database.

## Lacunas e inferências

- 🟡 **INFERIDO** `admin` é o administrador da cidade, enquanto `platformAdmin` é o superusuário operacional.
- 🟡 **INFERIDO** `citizen` consome notificações e solicitações, mas não participa da administração.
- 🔴 **LACUNA** A política fina por tela/componente não está documentada explicitamente e depende de validação em hooks de autenticação/autorização.
