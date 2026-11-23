# Design system e responsividade

O painel é **mobile-first**: escreva as classes base para ~360px e acrescente `sm:` (640), `md:` (768) e `lg:` (1024) para telas maiores. A sidebar fixa só aparece a partir de `lg`.

## Cores

Tokens `brand.*` em `tailwind.config.js` (espelhados em `src/common/constants/brandColors.ts` para Chart.js, Google Maps e atributos de SVG):

| Token | Hex | Uso |
| --- | --- | --- |
| `brand-aqua` | `#00ADB4` | Destaques, rotas no mapa, estados ativos |
| `brand-deep` | `#004A55` | Títulos, botões, painel do login |
| `brand-ink` / `brand-strong` | `#4D534C` / `#232B22` | Texto |
| `brand-paper` | `#FAF7FA` | Superfícies claras |
| `brand-mint` | `#C4E7E8` | Fundos de destaque, bordas suaves |

As escalas `greenAqua`, `greenBlue`, `greenDark`, `greenBebe` e `white` continuam válidas. Evite hex solto e as paletas padrão do Tailwind (`slate`, `teal`, `emerald`, `gray`).

## Tipografia

- Títulos e números de destaque: `font-display` (Unbounded). O átomo `Title` já usa.
- Corpo: Work Sans (padrão do `body`).

## Estrutura de página

- O layout autenticado (`src/app/(authenticated)/layout.tsx`) usa `h-dvh`, sidebar fixa em `lg+` e **gaveta** (`MobileSidebar`, baseada em `ui/sheet`) abaixo de `lg`. O header é sticky, com breadcrumb e menu da conta.
- O `<main>` já aplica o espaçamento lateral (`p-4 sm:p-6 lg:px-8`). Páginas novas devem usar `PageContainer` + `PageHeader` (`src/components/molecules`) em vez do `wrapper` inline.
- Páginas de mapa em tela cheia: contêiner `relative -m-4 h-[calc(100dvh-4rem)] overflow-hidden sm:-m-6`.

## Componentes

- `MapPanel`: painel sobre mapa. No desktop é flutuante; no celular fica acoplado à base do mapa e pode ser recolhido para liberar toques no mapa.
- `InfoTable`/`InfoRow`: grade de 10 colunas em `lg+`, cartões empilhados abaixo disso.
- `ui/*` (shadcn): `sheet`, `table`, `tabs`, `select`, `tooltip`, `avatar`, `breadcrumb`, `skeleton`, `separator`. `ui/dialog` rola quando o conteúdo é alto.
- `atoms/Button` tem `variant`: `primary` (ação principal da tela/formulário), `secondary` (ação de apoio, ex.: calcular, ativar/desativar), `outline` (cancelar, copiar, editar, rotacionar), `destructive` (excluir, revogar, suspender) e `ghost`. Use uma só `primary` por grupo de ações. `ConfirmationModal` aceita `destructive` para pintar o botão de confirmar de vermelho.
- Alvos de toque com no mínimo 44px (`min-h-11`); efeitos de hover com `scale` só em `lg:`.

## Animações

Keyframes `login-*` em `globals.css` (gota, ondulação, pulso "ao vivo"). Toda animação nova deve respeitar `prefers-reduced-motion`.
