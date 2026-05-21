# veiculos, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getAllVehicles` | `(cityId: string)` | `UserEntity[]` | Filtro por role `vehicle` |
| `updateUserDoc` | `(uid: string, data: Partial<UserEntity>)` | `{ error }` | Update parcial |

## Fluxo Principal
1. Obter cidade do usuário logado.
2. Para criação, montar payload de veículo com role `vehicle`.
3. Para edição, atualizar campos específicos.
4. Invalidar queries da lista.

## Fluxos Alternativos
- **Erro no cadastro:** manter formulário e apresentar erro.
- **Erro na edição:** não navegar até confirmação de sucesso.

## Dependências
- Serviço de usuários.
- Hook de autenticação para criação de credencial.
- React Query.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Reutilizar entidade de usuário para veículo | `src/common/entities/user.ts` | 🟢 |
| Separar fluxo de cadastro e edição no mesmo formulário | `src/app/(authenticated)/cadastrar-veiculo/page.tsx` | 🟢 |

## Estado Interno
Estado de formulário em modo create/edit.

## Observabilidade
Toasts de sucesso em edição e logs de erro implícitos.

## Riscos e Lacunas
- 🟡 Política de senha para login de veículo depende do validador de formulário.
