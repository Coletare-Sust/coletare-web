# Template de Migração por Módulo

Cada módulo deve ter um arquivo de especificação baseado neste template. O objetivo é detalhar passos seguros e idempotentes para migrar funcionalidades e dados.

1. Identificação
- Nome do módulo: (ex: `rotas`)
- Responsáveis: (devs, owners)

2. Escopo do módulo
- Endpoints afetados
- Entidades e coleções Firestore envolvidas

3. Dependências
- Módulos que obrigatoriamente devem estar prontos antes deste módulo.

4. Estratégia de migração
- Ordem: infra → auth → dados → API → verificação → switch.
- Migração de dados: scripts, bulk, incremental.
- Backfill e sincronização final.

5. Contratos e OpenAPI
- Lista de endpoints e payloads que o BFF deverá expor.

6. Testes e verificação
- Testes de contrato, E2E e comparações de dados.

7. Rollback
- Procedimento de rollback e pontos de verificação.

8. Checklist de corte
- Passos atômicos para realizar o cutover em produção.
