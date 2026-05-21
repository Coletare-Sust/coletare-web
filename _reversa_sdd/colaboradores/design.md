# colaboradores, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getAllCollaborators` | `(cityId: string)` | `UserEntity[]` | Filtro por cidade e role |
| `createUser` | `(data: UserEntity, image?: File)` | `{ error }` | Persistência com upload opcional |
| `updateUserDoc` | `(uid: string, data: Partial<UserEntity>)` | `{ error }` | Update parcial |

## Fluxo Principal
1. Carregar cidade via usuário autenticado.
2. Montar payload com role `employee`.
3. Fazer upload de imagem se fornecida.
4. Salvar/atualizar usuário.

## Fluxos Alternativos
- **Sem imagem:** grava usuário sem URL de foto.
- **Erro de upload/update:** mostra toast e mantém tela.

## Dependências
- Serviço de usuários.
- Serviço de storage.
- React Query para invalidação.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Reuso de entidade `UserEntity` para colaboradores | `src/common/entities/user.ts` | 🟢 |
| Upload desacoplado no serviço de storage | `src/store/services/firebaseStorage.ts` | 🟢 |

## Estado Interno
Estado local para imagem recortada e dados do formulário.

## Observabilidade
Toasts e logs simples.

## Riscos e Lacunas
- 🟡 Validação documental depende de schema de formulário.
