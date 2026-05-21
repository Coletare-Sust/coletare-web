# avisos, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createWarningService` | `(warning: WarningDTO)` | `WarningEntity` | Cria aviso e upload de imagem |
| `getAllWarningService` | `(cityId: string)` | `WarningEntity[]` | Lista por cidade |
| `updateWarningService` | `(warningId: string, data)` | `WarningEntity | null` | Atualiza texto/imagem |
| `deleteWarningService` | `(warningId: string)` | `{ error }` | Remove aviso |

## Fluxo Principal
1. Validar perfil da cidade.
2. Gerar ID por `push` no Realtime DB.
3. Subir imagem (quando presente).
4. Persistir aviso com timestamps.
5. Exibir em grid com filtro opcional por data.

## Fluxos Alternativos
- **Sem imagem:** salva com `image = null`.
- **Falha de upload:** aborta criação/edição e retorna erro.

## Dependências
- Firebase Realtime DB.
- Firebase Storage.
- DTOs/entidades de aviso.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| `createdAt`/`updatedAt` em ISO string | `src/store/services/warning.ts` | 🟢 |
| Filtro por data no cliente com `isSameDay` | `src/app/(authenticated)/avisos/page.tsx` | 🟢 |

## Estado Interno
Estado local de tela para lista, seleção de data e modal de exclusão.

## Observabilidade
Logs de erro simples e toasts de sucesso/falha.

## Riscos e Lacunas
- 🟡 Política de retenção histórica de avisos não documentada.
