# Deploy do painel web

Ordem de deploy do ecossistema: **backend -> web -> mobile**. Suba o web só depois de o backend estar no ar com `APP_CORS_ALLOWED_ORIGIN_PATTERNS` e `APP_FRONTEND_URL` apontando para o domínio do painel.

> A API `https://api.coletapp.com` (ambiente de dev) é tratada como **produção** por enquanto. É também o fallback do `next.config.js` quando `NODE_ENV=production` e `NEXT_PUBLIC_API_URL` está vazio.

## Branch

Trabalho e releases saem de `refactor/migrate-backend` (futura padrão; hoje o GitHub ainda tem `master` como padrão). Antes de publicar: `git status` limpo, branch atualizada com `origin`, `yarn lint` e `yarn build` passando.

## Variáveis

Todas as `NEXT_PUBLIC_*` são embutidas no bundle do navegador **no build**: mudar o valor exige novo build e **nunca** devem conter segredo.

| Variável | Quando | Observação |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | build | URL do backend (`https://api.coletapp.com`). Vazio conta como não definido |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | build | Restrinja a chave por referrer no console do Google |
| `NEXT_PUBLIC_BUILD_ID` | build, opcional | Invalida o cache persistido do React Query; padrão = horário do build |
| `NODEMAILER_USER`, `NODEMAILER_PASS` | runtime (servidor) | Rota `/api/email`. O código ainda aceita `NEXT_PUBLIC_NODEMAILER_*`, que **não** deve carregar credenciais |
| `EXPO_ACCESS_TOKEN` | runtime (servidor) | Push em `/api/notifications` |

## Opção A: Docker (VPS ou Cloud Run)

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.coletapp.com \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<chave-maps> \
  -t coletare-web:<tag> .

docker run -d --name coletare-web --restart unless-stopped \
  --env-file /opt/coletare/web.env \   # NODEMAILER_*, EXPO_ACCESS_TOKEN
  -p 127.0.0.1:3000:3000 coletare-web:<tag>
```

Imagem multi-stage (Node 20 alpine, saída `standalone`, porta 3000). O `.dockerignore` exclui `.env*`, contas de serviço do Firebase, `node_modules` e `.next`. Coloque um proxy HTTPS na frente.

## Opção B: Firebase App Hosting (`apphosting.yaml`, backendId `coletare-web`, projeto `coletare-60241`)

```bash
firebase deploy --only apphosting   # ou push na branch ligada ao backend do App Hosting
```

**Atenção (segurança):** o `apphosting.yaml` versionado contém valores sensíveis em texto (credencial SMTP, token do Expo e chave privada do Firebase Admin). Antes de usar esta opção:
1. Rotacione essas credenciais (elas estão no histórico do git).
2. Troque-as por segredos do Secret Manager (`secret:` em vez de `value:`) e remova-as do arquivo.
3. Mantenha em `value:` apenas variáveis realmente públicas.
`NEXT_PUBLIC_FIREBASE_*` e `NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY` pertencem ao código legado da migração: remova-as quando nenhum código do painel as usar mais.

> O README original menciona deploy automático na Vercel. Confirme qual alvo está ativo (Vercel, App Hosting ou Docker) e use só um; este doc cobre Docker e App Hosting.

## Integração com o backend

- Login por cookie HttpOnly `jwt`. Se web e API estiverem em domínios registráveis diferentes, o backend precisa de `APP_AUTH_COOKIE_SAME_SITE=None`; no mesmo domínio, `Lax` + `APP_AUTH_COOKIE_DOMAIN`.
- O origin do painel precisa estar em `APP_CORS_ALLOWED_ORIGIN_PATTERNS` (o `CookieOriginCheckFilter` também valida a origem).
- A CSP está em modo Report-Only e libera `NEXT_PUBLIC_API_URL` (HTTP e WS) em `connect-src`; trocar a URL da API exige novo build.

## Verificação pós-deploy

1. A página de login carrega e o login grava o cookie `jwt` (Application > Cookies).
2. Mapas carregam; console sem erros de CORS/CSP relevantes.
3. Tela de coleta ao vivo recebe posições (WebSocket em `wss://api...`).
4. Recuperação de senha: o e-mail leva ao domínio certo (`APP_FRONTEND_URL`).

## Rollback

Docker: suba a tag anterior. App Hosting: promova o rollout anterior no console. Como `NEXT_PUBLIC_BUILD_ID` muda por build, o cache do navegador é invalidado automaticamente.
