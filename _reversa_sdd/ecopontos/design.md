# ecopontos, Design Técnico

## Interface

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/city/:cityId` | `cityId` | `Ecoponto[]` | 200, 4xx |
| POST | `/` | `CreateEcopontoDTO` | `Ecoponto` | 200/201, 4xx |
| PUT | `/:id` | `UpdateEcopontoDTO` | `Ecoponto` | 200, 4xx |
| DELETE | `/:id` | `id` | `true` | 200, 4xx |

## Fluxo Principal
1. Ler `cityId` do usuário autenticado.
2. Buscar ecopontos da cidade.
3. Aplicar filtro local por `residueType`.
4. Executar operações de CRUD via hooks de mutation/query.

## Fluxos Alternativos
- **Erro HTTP:** lançar erro e exibir toast.
- **Sem ecopontos:** renderizar estado vazio.

## Dependências
- API REST de ecopontos.
- React Query.
- Constantes de tipos de resíduos.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Cliente HTTP centralizado com `fetch` e validação `res.ok` | `src/store/services/ecopoint.ts` | 🟢 |
| Filtro por resíduos no cliente | `src/app/(authenticated)/ecopontos/page.tsx` | 🟢 |

## Estado Interno
Filtros ativos, item aberto em accordion e estado do dropdown.

## Observabilidade
Logs de erro de API e toasts na UI.

## Riscos e Lacunas
- 🟡 Contrato exato da API externa pode variar por ambiente.
