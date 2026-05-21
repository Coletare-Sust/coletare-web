# solicitacoes-retirada, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getAllWithdrawalsRequests` | `(cityId: string)` | `WithdrawalsRequest[]` | Consulta por cidade |

## Fluxo Principal
1. Ler `cityId` da sessão/usuário.
2. Consultar `withdrawalsRequests` no Realtime DB.
3. Exibir componentes de resumo e listagem.

## Fluxos Alternativos
- **Sem dados:** estado vazio.
- **Erro de consulta:** retorno `null` com log.

## Dependências
- Serviço de solicitações.
- Componentes `MainSolicitation` e `AllSolicitations`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Query por `cityId` em Realtime DB | `src/store/services/withdrawalsRequests.ts` | 🟢 |
| Composição de tela por dois componentes principais | `src/app/(authenticated)/solicitacoes-retirada/page.tsx` | 🟢 |

## Estado Interno
Gerido pelos componentes internos da tela.

## Observabilidade
Erros registrados em console.

## Riscos e Lacunas
- 🟡 Regras completas de transição de `isResolved` não centralizadas aqui.
