# solicitacoes-retirada

## Visão Geral
Acompanha solicitações de retirada por cidade e suporta sua utilização em rotas especiais e notificações.

## Responsabilidades
- Listar solicitações por cidade.
- Exibir solicitações em componentes operacionais.
- Alimentar fluxos de rota especial/notificação.

## Regras de Negócio
- Solicitações são filtradas por `cityId`. 🟢
- Estado principal de resolução é `isResolved`. 🟢
- Solicitações em rota especial impactam notificações. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar solicitações por cidade | Must | Retorno traz itens de `withdrawalsRequests` da cidade |
| RF-02 | Exibir painel principal e lista | Must | Tela mostra componentes de solicitação |
| RF-03 | Integrar com rotas especiais | Should | Solicitações vinculadas podem afetar notificações |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Erros de consulta tratados com fallback nulo | `src/store/services/withdrawalsRequests.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado uma cidade com solicitações registradas
Quando abrir a tela de solicitações
Então os itens da cidade devem ser exibidos

Dado uma cidade sem solicitações
Quando abrir a tela
Então a UI deve manter estado vazio sem falha
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Listagem e visualização | Must | Base funcional da unit |
| Integração com rota especial | Should | Fluxo derivado |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/withdrawalsRequests.ts` | `getAllWithdrawalsRequests` | 🟢 |
| `src/app/(authenticated)/solicitacoes-retirada/page.tsx` | `SolicitacaoRetirada` | 🟢 |
