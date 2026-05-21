# notifications, Design Técnico

## Interface

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| POST | `/api/notifications` | `{ title, content, routeId, cityId }` | `{ success: true }` | 200, 400 |

## Fluxo Principal
1. Validar corpo com Zod.
2. Buscar cidadãos da cidade.
3. Buscar rota e solicitações da cidade.
4. Decodificar polyline e calcular proximidade.
5. Montar lista final de usuários elegíveis.
6. Filtrar tokens válidos Expo.
7. Enviar notificações em chunks.

## Fluxos Alternativos
- **Rota inválida:** retornar 400.
- **Token inválido:** pular token sem abortar lote.

## Dependências
- Expo SDK.
- Serviços de rota, usuários e solicitações.
- Utilitários de geolocalização/polyline.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Critério de proximidade geográfica para notificação | `src/app/api/notifications/route.ts` | 🟢 |
| Inclusão de rota especial por `withdrawalRequestsIds` | `src/app/api/notifications/route.ts` | 🟢 |
| Chunking de mensagens para envio | `src/app/api/notifications/route.ts` | 🟢 |

## Estado Interno
Sem estado persistente; processamento por requisição.

## Observabilidade
Logs de token inválido e erros de envio não estruturados.

## Riscos e Lacunas
- 🟡 Distância-limite fixa (0.1) sem parametrização explícita.
