# auth

## Visão Geral
A unit `auth` cobre autenticação e ciclo de vida de credenciais dos usuários no Coletare Web. Ela concentra login (email/senha e provedores sociais), recuperação e atualização de senha, logout e operações administrativas de criação/remoção de contas via backend interno.

## Responsabilidades
- Autenticar usuários com Firebase Auth (email/senha, Google e Facebook).
- Gerenciar recuperação e atualização de senha.
- Encerrar sessão de usuário autenticado.
- Criar e excluir credenciais de usuários em operações administrativas.

## Regras de Negócio
- Login por email/senha deve retornar `{ user, error }` sem quebrar o fluxo de UI. 🟢
- Recuperação de senha e verificação de email usam URL de retorno configurada em ambiente (`NEXT_PUBLIC_LOGIN_URL`). 🟢
- Criação/exclusão administrativa de credenciais ocorre via rotas internas (`/api/createAuth` e `/api/deleteAuth`) usando Firebase Admin. 🟢
- Mensagens de erro são normalizadas para o cliente, mas podem perder detalhe técnico do provedor externo. 🟡
- Política de bloqueio/limite de tentativas de login não foi encontrada no código analisado. 🔴

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Permitir login com email e senha | Must | Dado usuário válido, quando autenticar, então recebe `user` e `error=null` |
| RF-02 | Permitir login social (Google/Facebook) | Should | Dado popup autorizado, quando concluir login social, então sessão autenticada é criada |
| RF-03 | Permitir recuperação de senha | Must | Dado email válido, quando solicitar recuperação, então email de redefinição é disparado |
| RF-04 | Permitir atualização de senha do usuário autenticado | Should | Dado usuário logado, quando informar nova senha, então senha é atualizada com sucesso |
| RF-05 | Permitir logout | Must | Dado sessão ativa, quando realizar logout, então sessão é encerrada |
| RF-06 | Criar credencial administrativa via endpoint interno | Must | Dado payload válido, quando chamar `/api/createAuth`, então retorna `uid` sem erro |
| RF-07 | Excluir credencial administrativa via endpoint interno | Must | Dado `uid` existente, quando chamar `/api/deleteAuth`, então retorna `error=null` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Operações sensíveis de criação/remoção de conta são executadas server-side com Firebase Admin | `src/app/api/createAuth/route.ts`, `src/app/api/deleteAuth/route.ts`, `src/store/services/firebaseAdmin.ts` | 🟢 |
| Segurança | Credenciais e URLs de autenticação dependem de variáveis de ambiente | `src/store/services/auth.ts`, `src/config/firebaseAdmin.ts` | 🟢 |
| Disponibilidade | Funções retornam erro estruturado em fallback para evitar quebra do fluxo de tela | `src/store/services/auth.ts` | 🟢 |
| Observabilidade | Erros são tratados com mensagens simplificadas; não há trilha estruturada de auditoria | `src/store/services/firebaseAdmin.ts` | 🟡 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado um usuário com email e senha válidos
Quando ele submete o formulário de login
Então o sistema autentica com Firebase Auth e redireciona para a área autenticada

Dado uma solicitação de criação de credencial com email já existente
Quando o endpoint interno de criação é chamado
Então o sistema retorna erro de negócio e não cria novo usuário
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Login com email/senha | Must | Caminho crítico de entrada da aplicação |
| Criação/exclusão administrativa de credenciais | Must | Necessário para provisionamento de usuários operacionais |
| Recuperação de senha | Must | Suporte operacional sem intervenção manual |
| Login social | Should | Importante, mas não é único caminho de autenticação |
| Atualização de senha | Should | Relevante para manutenção de conta |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/auth.ts` | `loginWithGoogle`, `loginWithFacebook`, `signInWithEmailAndPasswordLocal`, `recoverPassword`, `updatePassword`, `logout` | 🟢 |
| `src/store/services/firebaseAdmin.ts` | `createUserAuthAdmin`, `deleteUserAuthAdmin` | 🟢 |
| `src/app/api/createAuth/route.ts` | `POST` | 🟢 |
| `src/app/api/deleteAuth/route.ts` | `POST` | 🟢 |
