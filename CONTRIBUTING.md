# Como contribuir

Vale para `coletapp-backend`, `coletare-web`, `coletare-mobile`, `coletapp-pipe` e `coletapp-infra`.

## Fluxo de branches

- `main`: produção. Só recebe PR vindo de `development` (release) ou de `hotfix/*`.
- `development`: integração. Todo trabalho entra por PR com **squash**.
- Branches de trabalho saem de `development`, uma por tópico, com o nome `tipo/assunto-curto`:
  `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `perf/`, `ci/`, `hotfix/`.
- Apague a branch depois do merge (o GitHub faz isso automaticamente).

## Commits e PRs (Conventional Commits)

Formato: `tipo(escopo opcional): assunto em minúsculas`, sem ponto final.

| Tipo | Quando |
| --- | --- |
| `feat` | funcionalidade nova (sobe a versão minor) |
| `fix` | correção de bug (sobe a patch) |
| `perf`, `refactor` | sem mudança de comportamento |
| `docs`, `test`, `build`, `ci`, `chore`, `style` | apoio |
| `security` | correção de segurança |
| `revert` | reversão |

Mudança que quebra compatibilidade: `feat(api)!: ...` ou o rodapé `BREAKING CHANGE: ...` (sobe a major).

O **título do PR** é validado e vira a mensagem do commit no squash. Um commit por tópico, atômico.

## Checks obrigatórios no PR

`pr-title`, `commitlint`, `gitleaks`, o CI do repositório, `vulnerability-scan` e `sast`. O merge só libera com todos verdes.

## Segredos

Nunca commite `.env`, chaves de service account, keystores, `.p8`/`.p12` ou arquivos de configuração com valores reais. Use o `*.example` com placeholders. Antes de commitar, rode `gitleaks protect --staged` se tiver o gitleaks instalado.

## Releases

Cada repositório usa SemVer e o `release-please`: ao mergear em `main`, ele abre/atualiza o PR de release com CHANGELOG. Mergear esse PR cria a tag e o GitHub Release.

| Repositório | Tag |
| --- | --- |
| backend, web | `vX.Y.Z` |
| mobile | `mobile-vX.Y.Z` |
| pipe | `v1.x.y` e a tag móvel `v1` |

Deploy sempre por tag ou digest da imagem, nunca por `latest`.

## Issues

Use os formulários de **Bug** e **Feature**. Cada issue entra no project *coletapp* com prioridade (P0 a P2) e tamanho (XS a XL).
