# auth, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `signInWithEmailAndPasswordLocal` | `(email: string, password: string)` | `{ user, error }` | Login por email/senha |
| `loginWithGoogle` | `()` | `{ user, error }` | OAuth popup Google |
| `recoverPassword` | `(email: string)` | `{ error }` | Envia reset com URL de retorno |
| `createUserAuthAdmin` | `(email: string, password: string)` | `{ uid, error }` | Criação administrativa |
| `deleteUserAuthAdmin` | `(uid: string)` | `{ error }` | Exclusão administrativa |

## Fluxo Principal
1. UI chama serviço de autenticação local/social.
2. Serviço Firebase Auth executa credenciais.
3. Resultado estruturado (`user`/`error`) volta para a camada de tela.
4. Para provisionamento, UI chama endpoint interno que usa Firebase Admin.

## Fluxos Alternativos
- **Credencial inválida:** retorna `error` sem quebrar renderização.
- **Email já existente em criação admin:** retorna erro de negócio padronizado.

## Dependências
- Firebase Auth (`src/store/services/auth.ts`).
- Firebase Admin (`src/store/services/firebaseAdmin.ts`).
- Endpoints App Router (`src/app/api/createAuth/route.ts`, `deleteAuth/route.ts`).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Encapsular retorno de erro em objetos simples | `src/store/services/auth.ts` | 🟢 |
| Operações sensíveis de usuário via backend interno | `src/app/api/createAuth/route.ts` | 🟢 |

## Estado Interno
Sem estado persistente próprio além do usuário autenticado no provedor Firebase.

## Observabilidade
Uso pontual de `console.error` em falhas.

## Riscos e Lacunas
- 🔴 Política de rate-limit/lockout não identificada.
- 🟡 Mensagens de erro podem variar por provedor.
