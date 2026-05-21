# Relatório de Confiança — coletare-new-back

> Gerado pelo Revisor em 2026-05-21

---

## Resumo Geral

| Nível | Quantidade | Percentual |
|-------|-----------:|-----------:|
| 🟢 CONFIRMADO | 151 | 80.75% |
| 🟡 INFERIDO   | 20 | 10.70% |
| 🔴 LACUNA     | 16 | 8.56% |
| **Total**     | 187 | 100% |

**Confiança geral:** 86.10% (soma de 🟢 + metade dos 🟡)

---

## Por Unit

| Unit | 🟢 | 🟡 | 🔴 | Confiança |
|------|---:|---:|---:|----------:|
| auth | 15 | 3 | 3 | 78.57% |
| avisos | 12 | 1 | 1 | 89.29% |
| colaboradores | 12 | 1 | 1 | 89.29% |
| dashboard | 12 | 1 | 1 | 89.29% |
| ecopontos | 12 | 1 | 1 | 89.29% |
| email | 11 | 1 | 1 | 88.46% |
| municipios | 12 | 1 | 1 | 89.29% |
| notifications | 15 | 1 | 1 | 91.18% |
| rota | 12 | 1 | 1 | 89.29% |
| rotas | 12 | 1 | 1 | 89.29% |
| rotas-andamento | 4 | 5 | 2 | 59.09% |
| solicitacoes-retirada | 11 | 1 | 1 | 88.46% |
| veiculos | 11 | 2 | 1 | 85.71% |

---

## Lacunas Pendentes 🔴

Itens que permaneceram sem confirmação após a revisão:

### auth
- Política explícita de bloqueio por tentativas de login não encontrada no código.
- Regras detalhadas de auditoria de segurança não documentadas.

### rotas-andamento
- Implementação detalhada da unit está parcialmente inferida.
- Critérios formais de atualização em tempo real não explícitos.

### demais units
- Lacunas remanescentes são não-bloqueantes e tratam de governança/operação (ex.: retry formal, SLA, parâmetros de política).

---

## Recomendações

- [ ] Priorizar detalhamento da unit `rotas-andamento` para elevar cobertura de especificação operacional.
- [ ] Formalizar políticas transversais de segurança (rate-limit/login lockout) e de confiabilidade (retry/backoff em integrações externas).
- [ ] Manter rastreabilidade de regras de negócio por commit/ADR para reduzir itens 🔴 em próximas revisões.

---

## Histórico de Reclassificações

Sem reclassificações adicionais nesta rodada de revisão (as classificações do Redator permaneceram consistentes com a evidência disponível).
