# notifications

## Visão Geral
Orquestra envio de push notifications para cidadãos com base em proximidade da rota e vínculo com solicitações especiais.

## Responsabilidades
- Validar payload de notificação.
- Resolver usuários elegíveis por localização e contexto de rota.
- Enviar mensagens em lote via Expo.

## Regras de Negócio
- Payload exige `title`, `content`, `routeId`, `cityId`. 🟢
- Usuário elegível inclui proximidade da polyline da rota. 🟢
- Em rota especial, inclui autores de solicitações vinculadas. 🟢
- Token inválido é ignorado no envio. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Validar payload da notificação | Must | Requisição inválida é rejeitada |
| RF-02 | Selecionar usuários por proximidade da rota | Must | Usuários próximos recebem mensagem |
| RF-03 | Incluir usuários de solicitações em rota especial | Should | Usuários criadores de solicitações vinculadas recebem mensagem |
| RF-04 | Enviar lotes para Expo Push | Must | Mensagens são chunkadas e enviadas |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Validação de input com Zod | `src/app/api/notifications/route.ts` | 🟢 |
| Escalabilidade | Envio em chunks via SDK Expo | `src/app/api/notifications/route.ts` | 🟢 |
| Disponibilidade | Tokens inválidos não interrompem lote | `src/app/api/notifications/route.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado uma rota válida e cidadãos próximos com token
Quando enviar notificação
Então os tokens válidos devem receber a mensagem

Dado uma rota especial com solicitações vinculadas
Quando enviar notificação
Então autores dessas solicitações também devem ser incluídos
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Seleção por proximidade + envio | Must | Núcleo da função de notificação |
| Inclusão por rota especial | Should | Regra complementar de negócio |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/api/notifications/route.ts` | `POST` | 🟢 |
| `src/utils/location.ts` | utilitários de distância | 🟢 |
