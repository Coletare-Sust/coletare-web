# Documentação do Coletare Web

Painel web da prefeitura do Coletapp (Next.js 14). Orientações para agentes de IA: [`CLAUDE.md`](../CLAUDE.md).

| Documento | Conteúdo |
| --- | --- |
| [architecture.md](architecture.md) | Estrutura do código, sessão, controle de acesso, cache, mapa em tempo real, rotas de servidor |
| [backend-integration.md](backend-integration.md) | Mapa tela -> serviço -> endpoint do backend e pendências da migração do Firebase |
| [development.md](development.md) | Setup, variáveis de ambiente, build/deploy, fluxo de branches |

## Ecossistema e branches

| Repositório | Papel | Branch de trabalho |
| --- | --- | --- |
| `coletapp-backend` | API REST + WebSocket (Spring Boot 4, MongoDB) | `main` é a padrão; integração em `development` |
| `coletare-web` (este) | Painel da prefeitura | **`refactor/migrate-backend`** (futura padrão) |
| `coletare-mobile` | App do cidadão e do veículo | **`refactor/migrate-backend`** |

A documentação do backend (`coletapp-backend/docs`) é a referência para endpoints, permissões e WebSocket.
