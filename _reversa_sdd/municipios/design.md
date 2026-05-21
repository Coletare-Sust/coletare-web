# municipios, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createUser` | `(data: UserEntity, image: File)` | `{ error }` | Cria perfil da cidade |
| `updateUser` | `(id: string, data: Partial<UserEntity>)` | `{ error }` | Atualiza município |
| `deleteUser` | `(id: string)` | `{ error }` | Remove perfil |
| `sendEmail` | `({ email, subject, html })` | `{ error }` | Envia credenciais |

## Fluxo Principal
1. Coletar dados do formulário.
2. Criar credencial auth (novo cadastro).
3. Persistir perfil admin da cidade com parâmetros de cálculo.
4. Enviar email de acesso.
5. Em edição, atualizar imagem/dados e status.

## Fluxos Alternativos
- **Falha na criação auth:** aborta restante do fluxo.
- **Falha no upload de imagem:** não conclui atualização.

## Dependências
- Serviços de usuário/auth/email/storage.
- Validações de formulário.
- React Query.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Fluxo sequencial de provisionamento (auth → perfil → email) | `src/app/(authenticated)/municipios/cadastrar/page.tsx` | 🟢 |
| Atualização com substituição de imagem antiga | `src/app/(authenticated)/municipios/cadastrar/page.tsx` | 🟢 |

## Estado Interno
Estado local para cor, imagem, endereço georreferenciado e loading.

## Observabilidade
Toasts de sucesso/erro e logs em exceções.

## Riscos e Lacunas
- 🟡 Transação distribuída (auth+db+email) sem compensação completa explícita.
