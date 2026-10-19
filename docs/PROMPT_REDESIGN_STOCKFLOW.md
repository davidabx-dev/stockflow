# Prompt para o Claude Code: StockFlow com tema verde neon, fundo novo e performance

> **Como usar:** abra o terminal na raiz do repositório (`stockflow/`), rode `claude` e mande:
>
> ```
> Leia docs/PROMPT_REDESIGN_STOCKFLOW.md inteiro e execute a tarefa descrita nele, etapa por etapa.
> ```

---

## 1. Seu papel e o objetivo

Você é um engenheiro front-end sênior trabalhando no frontend do **StockFlow** (`frontend/`: Next.js 16.3, React 19.2, Tailwind CSS v4). A interface **já está construída**. Esta tarefa é de **refinamento visual e de performance**, não de reconstrução:

1. **Cores:** trocar o acento principal azul pelo **verde neon** e as superfícies azul-marinho por **preto-esverdeado**, para a interface ficar igual à imagem de referência.
2. **Fundo:** aplicar a nova imagem de fundo (preto com ondas de luz verde) em toda a aplicação.
3. **Performance:** deixar canvas, animações e efeitos de vidro mais leves, sem perder o visual.

O alvo é `docs/design/referencia-dashboard.webp`. Quando estiver em dúvida, abra essa imagem e compare.

## 2. Regras de escopo (leia antes de tudo)

- **Não altere** lógica, estado, chamadas de API, dados mockados, textos, rotas, nomes de componentes nem a estrutura ou a ordem dos blocos das telas. O trabalho é sobre **cor, fundo, efeitos e performance**. O que já estiver igual à referência fica como está.
- **Não mexa** em `backend/`, nos HTMLs antigos da raiz (`dashboard.html`, `materiais.html`, `inventario.html`, `2.html`, `3.html`, `fit.html`, `gra.html`, `i.html`) nem no código morto que nenhuma rota importa: `src/views/DashboardView.tsx`, `src/components/StatsCard.tsx`, `src/components/ui/GlassCard.tsx`, `src/components/ui/Badge.tsx` e `src/components/ui/Toast.tsx`.
- **Não adicione dependências** ao `package.json`.
- **Não use** `public/img/cubo-stockflow-1.svg` (17 MB) nem `public/img/logo-stockflow-1.svg` (2,7 MB). Eles são PNGs embutidos em SVG e deixariam a página pesada.
- Existem **dois** `page.tsx` que resolvem para `/`: `src/app/page.tsx` e `src/app/(dashboard)/page.tsx`. Os dois renderizam o mesmo `DashboardFeature`. Não mexa nisso nesta tarefa.
- Esta versão do Next tem mudanças em relação ao que você conhece (veja `frontend/AGENTS.md`). Antes de usar qualquer API do Next, confira a documentação local em `frontend/node_modules/next/dist/docs/`, principalmente `01-app/03-api-reference/02-components/image.md`. No Next 16 a prop `priority` do `<Image>` foi **substituída por `preload`**, e `images.qualities` tem padrão `[75]`, então não passe `quality` diferente de 75.
- O Tailwind v4 é **CSS-first**: não existe `tailwind.config.*`. Os tokens ficam em `@theme`, dentro de `src/app/globals.css`.
- **Cuidado com a cascata:** as classes próprias do `globals.css` estão **fora de `@layer`**, e CSS sem camada sempre vence os utilitários do Tailwind (que ficam em `@layer utilities`). Se um utilitário "não pega", o motivo é esse. Ajuste a regra no CSS em vez de empilhar `!important`.
- Trabalhe por etapas e faça **um commit por etapa**, com mensagem em português (ex.: `style: tokens de cor verde neon`).

## 3. Referências visuais (abra antes de começar)

| Arquivo | O que é |
|---|---|
| `docs/design/referencia-dashboard.webp` | **Alvo.** Como o dashboard deve ficar (1672×940). |
| `docs/design/estado-atual-dashboard.webp` | Como está hoje, no mesmo tamanho de tela, para comparar. |
| `frontend/public/img/bg-stockflow.webp` | **Imagem de fundo** a aplicar (preto com ondas verdes, 1673×940). Se aparecer uma versão em resolução maior, ela substitui esta no mesmo caminho. |

O que muda entre o estado atual e o alvo:

| Área | Hoje | Alvo |
|---|---|---|
| Fundo da página | gradiente azul-marinho com grade | imagem `bg-stockflow.webp` |
| Sidebar | gradiente azul-marinho, borda azul | preto-esverdeado translúcido (as ondas do fundo aparecem na parte de baixo), borda verde sutil |
| "Flow" do logo na sidebar | azul | verde neon |
| Botão do topo da sidebar | 3 barrinhas cinza | ícone "camadas" verde |
| Item ativo da sidebar | borda, brilho e barra azuis | borda, brilho e barra verdes, com pontinho verde à direita |
| Topbar | azul-marinho com brilho azul e roxo | preto-esverdeado, borda verde sutil |
| "StockFlow" do título, ícone do título, badge "V2.4 PRO FLUXO" | azul | verde |
| Aba ativa ("Visão Executiva") | azul | borda e brilho verdes, ícone verde |
| Abas, período e "Ações rápidas" | a 1672 px, o período e "Ações rápidas" caem para uma linha extra | tudo numa **única** linha |
| Valores dos mini-cards (Entradas, Saídas…) | "R$" numa linha e o número na de baixo | "R$ 85.420,00" numa linha só |
| Cubo, anéis e partículas do donut | ciano | verde |
| "1.248 ITENS", IDs "REQ-…" e links "Ver todas…" | ciano | verde |
| Ícone do card "Requisições aguardando aprovação" | roxo | verde (a pílula "23 no fluxo" continua roxa) |
| Cards KPI, mini-cards de indicadores, cores do donut, badges de prioridade e status | já estão certos | **manter** |

## 4. Paleta (use exatamente estes valores)

Os valores abaixo foram medidos na imagem de referência. Adicione-os em `src/app/globals.css`, logo depois de `@import "tailwindcss";` (mantenha as variáveis `--cyber-glow-*` e `--*-stock` que já existem, só atualizando `--green-stock`):

```css
:root {
  /* Verde neon: acento principal */
  --sf-green: #00f56a;          /* textos de destaque, bordas ativas, ícones */
  --sf-green-rgb: 0 245 106;    /* uso: rgb(var(--sf-green-rgb) / 0.24) */
  --sf-green-strong: #00c853;   /* fim de gradiente de botão */
  --sf-green-soft: #6bffae;     /* hover de texto, brilho de gradiente */

  /* Fundo e superfícies: preto-esverdeado, sem azul */
  --sf-bg: #020504;
  --sf-surface-rgb: 6 14 11;    /* cards: rgb(var(--sf-surface-rgb) / 0.84) */
  --sf-surface-2-rgb: 9 20 16;  /* inputs, sub-painéis, pílulas */
  --sf-border-neutral: rgba(255, 255, 255, 0.07);

  /* Cores semânticas: o significado NÃO muda */
  --sf-cyan: #00e5ff;    /* entradas, itens cadastrados */
  --sf-amber: #f59e0b;   /* pendente, reservado, atenção */
  --sf-rose: #f43f5e;    /* saídas, crítico, abaixo do mínimo */
  --sf-purple: #a855f7;  /* requisições */
  --sf-blue: #2583ff;    /* em trânsito, separando */

  --green-stock: #00f56a; /* antes #19e66b */
}

@theme {
  /* Utilitários próprios: bg-sf-surface-2/75, text-sf-green, border-sf-green/40 etc. */
  --color-sf-green: #00f56a;
  --color-sf-bg: #020504;
  --color-sf-surface: #060e0b;
  --color-sf-surface-2: #091410;

  /* A escala emerald vira o verde da marca. Assim todos os text-/bg-/border-emerald-*
     que já existem nas telas mudam juntos, sem editar centenas de classes. */
  --color-emerald-50:  #e8fff1;
  --color-emerald-100: #c6ffdc;
  --color-emerald-200: #8dffbc;
  --color-emerald-300: #4dff98;
  --color-emerald-400: #00f56a;
  --color-emerald-500: #00d65c;
  --color-emerald-600: #00a847;
  --color-emerald-700: #007f37;
  --color-emerald-800: #04602c;
  --color-emerald-900: #064023;
  --color-emerald-950: #032414;

  /* Os slate escuros tiram o tom azulado de ~630 usos de border-slate-800, bg-slate-900,
     bg-slate-800, border-slate-700 etc. (nenhum deles é cor de texto). Os slate de texto
     (100 a 500) NÃO mudam. */
  --color-slate-700: #2a3833;
  --color-slate-800: #19241f;
  --color-slate-900: #0c1512;
  --color-slate-950: #050a08;
}
```

### Regras de mapeamento

- **Verde-menta antigo vira o token novo.** Isso vale para `#00f59b`, `rgba(0, 245, 155, …)`, `#00e08e`, `#00d684`, `#00995c`, `rgba(16, 185, 129, …)` e o `colorHex: '#00f59b'` do `StockDonut`. Use `var(--sf-green)` ou `rgb(var(--sf-green-rgb) / α)`, **mantendo a opacidade que cada regra já tinha**.
- **Azul usado como acento de interface (não semântico) vira verde.** Isso vale para `#38bdf8`, `#3b82f6`, `#60a5fa`, `#2563eb`, `#1d4ed8`, `rgba(0, 140, 255, …)`, `rgba(56, 189, 248, …)`, `rgba(59, 130, 246, …)`, `rgba(0, 130, 255, …)`, `rgba(0, 111, 255, …)`, `rgba(0, 100, 230, …)` e `rgba(0, 180, 255, …)`.
- **Azul-marinho de superfície vira preto-esverdeado** (tokens `--sf-surface*` e `--sf-bg`). Isso vale para `#030712`, `#071728`, `#030c18`, `#01060e`, `#102a45`, `#081625`, `#081524`, `#081424`, `#081528`, `#091526`, `#091524`, `#081324`, `#061220`, `#060c16`, `rgba(8, 28, 52, …)`, `rgba(3, 14, 28, …)`, `rgba(14, 45, 85, …)`, `rgba(6, 22, 45, …)`, `rgba(8, 24, 42, …)`, `rgba(4, 14, 25, …)`, `rgba(2, 8, 16, …)`, `rgba(6, 17, 28, …)`, `rgba(6, 20, 36, …)`, `rgba(2, 10, 20, …)`, `rgba(4, 18, 36, …)`, `rgba(0, 42, 83, …)`, `rgba(2, 16, 31, …)`, `rgba(0, 85, 170, …)`, `rgba(2, 32, 65, …)`, `rgba(1, 15, 32, …)` e `rgba(15, 23, 42, …)`.
- **Mantenha as cores semânticas:** ciano, âmbar, rosa, roxo, o azul `#2583ff`, o `sky-*` do status "Separando", o amarelo e o vermelho do donut, as variantes de cor dos `.kpi-card` e `.neon-indicator-card` e a cor do ícone de cada item da sidebar (Materiais âmbar, Entradas azul, Requisições roxo, Devoluções rosa, Inventário ciano, Relatórios lima, Auditoria índigo). Essas cores têm significado.
- **Roxo e azul decorativos dos brilhos saem.** Os `rgba(168, 85, 247, …)` e azuis em `.sidebar`, `.sidebar::before`, `.sidebar::after`, `.topbar-panel::before` e `.topbar-panel::after` são só enfeite; nesses brilhos fica apenas o verde.
- **Textos neutros não mudam:** `#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b` e `text-slate-100` a `text-slate-500` ficam como estão.

## 5. Mapa do código

| Arquivo | O que controla |
|---|---|
| `frontend/src/app/globals.css` (≈2050 linhas) | **Quase todo o visual**: fundo do `body`, `.hud-card`, `.kpi-card`, `.neon-indicator-card`, donut e cubo, `.sidebar*`, `.topbar-*`, `.module-tab`, botões e scrollbars |
| `frontend/src/app/layout.tsx` | `<body>` com `bg-[#030712]` e fontes via `next/font` |
| `frontend/src/components/layout/AppShell.tsx` | wrapper e tela de carregamento, ambos com `bg-[#030712]` opaco, que **tampa o fundo** |
| `frontend/src/components/LoginView.tsx` | tela de login, também com `bg-[#030712]` |
| `frontend/src/components/layout/Sidebar.tsx` | sidebar: pontinho do item ativo em ciano, cápsula "Almoxarifado Geral" e botão "Recolher" com azul-marinho |
| `frontend/src/components/layout/Header.tsx` | topbar, abas, período e "Ações rápidas" |
| `frontend/src/features/dashboard/index.tsx` | dashboard: tabelas, links e botões |
| `frontend/src/components/dashboard/StockIndicators.tsx` | os 4 mini-cards com ondas |
| `frontend/src/components/dashboard/StockDistribution.tsx` e `components/charts/StockDonut.tsx` | donut, cubo 3D e partículas |
| `frontend/src/components/charts/NeonWave.tsx` | ondas em canvas dos mini-cards |
| `frontend/src/views/*View.tsx` | telas de Materiais, Entradas, Requisições, Devoluções, Inventário, Relatórios e Auditoria |

## 6. Etapas

### Etapa 0: linha de base

```bash
cd frontend
npm ci
npm run build              # tem que passar (passa hoje)
npm run lint 2>&1 | tail -1
# hoje: "✖ 90 problems (32 errors, 58 warnings)", todos pré-existentes
```

Anote esses números. No final, o build tem que passar e o lint **não pode ter mais erros nem mais avisos do que isso**. Não é preciso corrigir os pré-existentes.

### Etapa 1: tokens

1. Adicione o bloco `:root` e o `@theme` da seção 4.
2. Na regra `body` do `globals.css`, troque `background-color: #030712` por `var(--sf-bg)` e **remova o `background-image`/`background-size`** (os dois radiais e a grade). O fundo novo vem na Etapa 2.
3. `npm run build` e commit.

### Etapa 2: imagem de fundo

Use `next/image` para ganhar `srcset` responsivo e preload automáticos. Em `src/app/layout.tsx`:

```tsx
import Image from 'next/image';
// ...
<body className="min-h-screen text-slate-100 antialiased font-sans">
  <div className="app-bg" aria-hidden="true">
    <Image src="/img/bg-stockflow.webp" alt="" fill preload sizes="100vw" className="app-bg-img" />
  </div>
  <AuthProvider>{children}</AuthProvider>
</body>
```

(O `bg-[#030712]` sai do `className` do `<body>`; quem pinta a cor de base agora é o `globals.css`.)

No `globals.css`:

```css
/* Fundo fixo numa camada própria: rolar a página não repinta a imagem.
   Não use background-attachment: fixed, que repinta a cada scroll e falha no iOS. */
.app-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: var(--sf-bg);
  transform: translateZ(0);
}

.app-bg-img {
  object-fit: cover;
  object-position: center;
}

/* Véu escuro no centro para manter o texto legível sobre as ondas */
.app-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 45%, rgba(2, 5, 4, 0.55) 0%, rgba(2, 5, 4, 0.15) 70%, transparent 100%);
}
```

Depois tire os fundos opacos que tampam a imagem:

- `AppShell.tsx`: remova `bg-[#030712]` do `div` raiz e da tela de carregamento. O spinner `border-cyan-500/20 border-t-cyan-500` vira `border-emerald-400/20 border-t-emerald-400`.
- `LoginView.tsx`: remova `bg-[#030712]` do `div` raiz. A tela de login hoje é toda em azul e ciano (`blue-500`, `blue-600`, `cyan-400`, `cyan-500` em botão, foco, ícones e brilhos), então troque esses acentos por verde seguindo a seção 4.

Confira que o fundo aparece no login, no carregamento e em todas as telas internas, e que nada fica ilegível. `npm run build` e commit.

### Etapa 3: shell (sidebar e topbar) no `globals.css`

**Sidebar**

- `.sidebar`:
  - `background`: `radial-gradient(circle at 15% 8%, rgb(var(--sf-green-rgb) / 0.10), transparent 45%), linear-gradient(180deg, rgba(5, 12, 9, 0.80) 0%, rgba(3, 8, 6, 0.74) 55%, rgba(2, 5, 4, 0.62) 100%)`. Fica mais transparente embaixo para as ondas do fundo aparecerem, como na referência.
  - `border-right`: `1px solid rgb(var(--sf-green-rgb) / 0.14)`.
  - `box-shadow`: sem o brilho azul, por exemplo `inset -1px 0 0 rgb(var(--sf-green-rgb) / 0.08), 0 20px 50px rgba(0, 0, 0, 0.6)`.
  - `backdrop-filter`: veja a Etapa 6.
- `.sidebar::before` e `.sidebar::after`: só verde (sem roxo nem azul) e sem `filter: blur()` (veja a Etapa 6).
- `.sidebar-brand-text .brand-flow`: gradiente `linear-gradient(180deg, var(--sf-green-soft) 10%, var(--sf-green) 55%, var(--sf-green-strong) 100%)`, com `drop-shadow` verde (`/ 0.55` e `/ 0.25`).
- `.sidebar-cube-btn`:
  - fundo `rgb(var(--sf-green-rgb) / 0.08)`, borda `rgb(var(--sf-green-rgb) / 0.35)`, cor `var(--sf-green)`, hover com brilho verde.
  - Em `Sidebar.tsx`, troque **só o SVG** das 3 barrinhas pelo ícone "camadas" da referência (o mesmo do KPI "Valor em estoque": `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />`). Mantenha o `onClick={onToggleCollapse}`, o `title` e a classe `icon-menu`.
- `.sidebar-divider`: `linear-gradient(90deg, transparent, rgb(var(--sf-green-rgb) / 0.45), transparent)` com sombra verde fraca.
- `.sidebar-nav-container::-webkit-scrollbar-thumb`: verde.
- `.sidebar-nav-item`, estado base: fundo `linear-gradient(145deg, rgb(var(--sf-surface-2-rgb) / 0.60) 0%, rgb(var(--sf-surface-rgb) / 0.78) 100%)`, borda `var(--sf-border-neutral)` e sombra interna sem azul.
- `.sidebar-nav-item:hover`, regra base (é a que vale para o Dashboard): borda `rgb(var(--sf-green-rgb) / 0.45)` e brilho verde no lugar do azul. As regras de hover de cada `.nav-*` continuam como estão.
- `.sidebar-nav-item.active`: fundo `linear-gradient(145deg, rgb(var(--sf-green-rgb) / 0.14) 0%, rgba(4, 24, 14, 0.85) 55%, rgb(var(--sf-surface-rgb) / 0.95) 100%)`, borda `rgb(var(--sf-green-rgb) / 0.75)`, sombra `0 0 22px rgb(var(--sf-green-rgb) / 0.30), inset 0 0 16px rgb(var(--sf-green-rgb) / 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.18)`.
- `.sidebar-nav-item.active .nav-icon-badge`: **tire o azul forçado.** O ícone ativo mantém a cor do módulo (as regras `.nav-*` já cuidam disso); só reforce o brilho com `filter: drop-shadow(0 0 8px currentColor)`.
- `.sidebar-nav-item.active::before` (a barrinha da esquerda): `var(--sf-green)` com brilho verde.
- Em `Sidebar.tsx`:
  - Pontinho do item ativo: `bg-cyan-400 shadow-[0_0_8px_#00e5ff]` vira `bg-emerald-400 shadow-[0_0_8px_var(--sf-green)]` (as duas ocorrências).
  - Cápsula "Almoxarifado Geral": `bg-[#091524] border-slate-800` vira `bg-sf-surface-2/75 border-white/[0.07]`.
  - Botão "Recolher": `bg-[#081324]` vira `bg-sf-surface-2/75`.

**Topbar**

- `.topbar-panel`: fundo `radial-gradient(circle at 12% 0%, rgb(var(--sf-green-rgb) / 0.08), transparent 45%), linear-gradient(135deg, rgb(var(--sf-surface-2-rgb) / 0.80) 0%, rgb(var(--sf-surface-rgb) / 0.86) 55%, rgba(2, 5, 4, 0.92) 100%)`; borda `rgb(var(--sf-green-rgb) / 0.20)`; sombras sem azul (o brilho externo passa a ser `0 0 30px rgb(var(--sf-green-rgb) / 0.06)`).
- `.topbar-panel::before` e `::after`: só verde, sem roxo e sem `filter: blur()`.
- `.topbar-logo-icon` (incluindo o `svg` interno e o `:hover`): fundo `linear-gradient(145deg, rgb(var(--sf-green-rgb) / 0.20), rgba(2, 26, 14, 0.85))`, borda `rgb(var(--sf-green-rgb) / 0.50)`, cor `var(--sf-green)` e brilhos verdes.
- `.topbar-title`: `font-family` usa `'Outfit'`, que **não é carregada** (cai na fonte do sistema). Troque por `var(--font-plus-jakarta), sans-serif`.
- `.topbar-title span`: `var(--sf-green)` com `text-shadow` verde.
- `.badge-version`: fundo `rgb(var(--sf-green-rgb) / 0.10)`, borda `/ 0.45`, texto `var(--sf-green)` e brilho verde.
- `.topbar-search-input`: fundo `rgb(var(--sf-surface-rgb) / 0.75)` e borda `var(--sf-border-neutral)`. No `:focus`, borda `rgb(var(--sf-green-rgb) / 0.60)` com brilho verde.
- `.status-pill`, `.topbar-notif-btn`, `.user-dropdown-btn`, `.date-range-pill`: fundo de superfície em vez de azul-marinho, borda neutra, hover com borda e brilho verdes.
- `.theme-toggle-switch:hover` e `.theme-toggle-slider`: verde no lugar do azul (fundo do slider `linear-gradient(135deg, #0b2016, #06110c)`).
- `.user-avatar`: borda e brilho verdes. `.user-dropdown-menu`: fundo de superfície, borda verde `/ 0.30`. `.dropdown-item:hover`: fundo `rgb(var(--sf-green-rgb) / 0.12)`, texto `var(--sf-green)`.
- `.topbar-divider`: igual ao `.sidebar-divider`.
- `.module-tab`:
  - base: fundo `rgb(var(--sf-surface-2-rgb) / 0.55)`, borda `var(--sf-border-neutral)`.
  - hover: borda `rgb(var(--sf-green-rgb) / 0.40)` e brilho verde.
  - `.active`: fundo `rgb(var(--sf-green-rgb) / 0.10)`, borda `rgb(var(--sf-green-rgb) / 0.70)`, sombra `0 0 16px rgb(var(--sf-green-rgb) / 0.30), inset 0 0 10px rgb(var(--sf-green-rgb) / 0.12)`, texto branco.
- `.tab-icon-badge`: inativo com fundo `rgba(255, 255, 255, 0.05)` e cor `#cbd5e1`; ativo (`.module-tab.active .tab-icon-badge`) com fundo `rgb(var(--sf-green-rgb) / 0.18)`, cor `var(--sf-green)` e brilho verde.
- `.quick-action-pill`: fundo `linear-gradient(135deg, var(--sf-green-soft) 0%, var(--sf-green) 45%, var(--sf-green-strong) 100%)`, borda `rgb(var(--sf-green-rgb) / 0.80)`, texto `#021a0c` e brilho verde (incluindo o `:hover`).
- **Abas, período e "Ações rápidas" numa linha só.** Hoje, a 1672 px, o período e "Ações rápidas" caem para uma linha extra. Para corrigir:
  - `.topbar-row-bottom`: `flex-wrap: nowrap` a partir de 1280 px (abaixo disso pode continuar quebrando).
  - `.module-nav`: `flex: 1 1 auto; min-width: 0;` (ele já tem `overflow-x: auto`, então rola se faltar espaço).
  - `.topbar-right-controls`: `flex-shrink: 0; flex-wrap: nowrap;`.
  - Compacte as abas como na referência: `.module-nav { gap: 6px }`, `.module-tab { padding: 6px 11px; gap: 6px; font-size: 0.72rem }`, `.tab-icon-badge` com 18×18 px.

`npm run build`, confira visualmente e faça o commit.

### Etapa 4: dashboard

**`globals.css`**

- `.hud-card`:
  - primeira parada do gradiente: de `0.08` para `0.06`.
  - parada azul-marinho `rgba(6, 17, 28, 0.88)`: vira `rgb(var(--sf-surface-rgb) / 0.84)`.
  - borda `rgb(var(--sf-green-rgb) / 0.20)`; no hover, `/ 0.40`.
  - brilhos com o token verde.
- `.kpi-card.kpi-emerald` e `.neon-indicator-card.card-emerald`: só troque o verde-menta pelo token. As outras variantes (ciano, âmbar, rosa) ficam como estão.
- **Bug:** em `.neon-indicator-card.card-rose`, a sombra interna está `rgba(0, 244, 63, 0.18)` (verde num card rosa). Corrija para `rgba(244, 63, 94, 0.18)`.
- **Donut e cubo:** tudo o que hoje é ciano ou azul vira verde, mantendo o alfa de cada regra. Isso vale para `.chart-stock` (drop-shadow), `.ring-base` (de `rgba(0, 88, 120, .16)` para `rgba(0, 110, 55, .18)`), `.inner-ring`, `.center-glow-stock`, `.tech-circle-stock` (com `::before` e `::after`), `.dot-stock` (`#00d9ff`), `.face-stock` e `.cube-stock::before/::after`. As cores dos segmentos (amarelo, azul, vermelho) continuam as mesmas.

**`StockDonut.tsx`**

- Partículas: `rgba(0, 210, 255, α)` vira `rgba(0, 245, 106, α)`, e `shadowColor '#00e5ff'` vira `'#00f56a'`.
- `colorHex` do segmento "Disponível": vira `'#00f56a'`.

**`StockDistribution.tsx`**

- "1.248 ITENS": `text-cyan-400` vira `text-emerald-400`.

**`StockIndicators.tsx`**

- **Bug:** a caixa do ícone usa classes montadas dinamicamente (`` border-${ind.color}-400/70 ``, `` from-${ind.color}-900/60 ``, `` to-${ind.color}-950/80 ``). O Tailwind só gera classes que aparecem escritas por extenso no código, então elas **não existem no CSS final**: o gradiente de fundo nunca aparece, e a borda só aparece porque herda `currentColor`. Troque por um mapa estático, igual ao `textColors` que já existe:

  ```ts
  const iconBoxColors = {
    cyan: 'border-cyan-400/70 from-cyan-900/60 to-cyan-950/80',
    rose: 'border-rose-400/70 from-rose-900/60 to-rose-950/80',
    amber: 'border-amber-400/70 from-amber-900/60 to-amber-950/80',
    emerald: 'border-emerald-400/70 from-emerald-900/60 to-emerald-950/80',
  }[ind.color];
  ```

- Valor do mini-card: hoje quebra em duas linhas ("R$" em cima, número embaixo). Adicione `whitespace-nowrap` e troque `text-lg lg:text-xl` por `text-[clamp(1rem,1.1vw,1.25rem)]`, para "R$ 85.420,00" caber numa linha a 1672 px sem estourar em telas menores.
- Hoje sobra um espaço vazio entre o título "Indicadores de estoque" e os mini-cards, porque o card é `h-full flex justify-between`. Na referência, os mini-cards ficam logo abaixo do título e ocupam a altura: tire o `justify-between` e dê `flex-1` à grid.

**`features/dashboard/index.tsx`**

- Card "Requisições aguardando aprovação":
  - caixa do ícone `bg-purple-500/15 border-purple-400/30 text-purple-400` vira `bg-emerald-500/15 border-emerald-400/30 text-emerald-400`.
  - a pílula "23 no fluxo" **continua roxa**.
- IDs `REQ-…` da tabela: `text-cyan-400` vira `text-emerald-400`.
- Ícone de olho: `hover:text-cyan-400` vira `hover:text-emerald-400`.
- Links de rodapé dos cards ("Ver todas as 42 requisições", "Ver todos os 17 materiais críticos" e os demais "Ver …"): `text-cyan-400 hover:text-cyan-300` vira `text-emerald-400 hover:text-emerald-300`.
- Botão "+ Nova Requisição": `bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30` vira um contorno neutro, `bg-white/[0.03] text-slate-100 border-white/15 hover:border-emerald-400/50 hover:text-white`.
- "Gerar Pedido de Compra" já é `emerald` e fica no verde novo sozinho.
- As linhas de baixo (Últimas entradas, Conferência do inventário, Devoluções, Timeline de auditoria, Alertas, Valor por categoria, Eficiência operacional) **não aparecem na referência**. Nelas, aplique só as regras gerais da seção 4 (links "Ver …" verdes, sem azul-marinho) e mantenha as cores semânticas.

`npm run build`, compare com `docs/design/referencia-dashboard.webp` e faça o commit.

### Etapa 5: demais telas (`src/views/*View.tsx`)

As overrides de `emerald` e `slate` no `@theme` já resolvem a maior parte. Falta o seguinte:

- **Superfícies azul-marinho em hex arbitrário** viram utilitários de superfície:
  - `bg-[#081524]` vira `bg-sf-surface-2`.
  - `bg-[#081424]/90` vira `bg-sf-surface-2/90`.
  - `bg-[#081528]/80` e `bg-[#091526]/80` viram `bg-sf-surface-2/80`.
  - `bg-[#060c16]` vira `bg-sf-surface`.
  - `to-[#061220]` vira `to-sf-surface`.

  Procure assim: `grep -rn "\[#0[0-9a-f]\{5\}\]" src/views src/components src/features`.
- **Ação primária, seleção e foco** passam a ser verdes em todas as telas:
  - Botões `bg-blue-600 hover:bg-blue-500 text-white shadow-[…rgba(37,99,235,…)]` (por exemplo em `EntradasView.tsx`) viram `bg-emerald-400 hover:bg-emerald-300 text-[#021a0c] shadow-[0_0_20px_rgb(0_245_106/0.35)]`.
  - Abas e segmentos selecionados com `bg-blue-600 text-white` seguem o mesmo padrão.
  - `focus:border-blue-500/60` vira `focus:border-emerald-400/60`.
- **Verde-menta hard-coded:** `bg-[#00f59b] hover:bg-[#00e08e]` (Materiais, Inventário) vira `bg-emerald-400 hover:bg-emerald-300`, e `rgba(0,245,155,…)` nas sombras vira `rgb(0_245_106/…)`.
- **Azul ou ciano como informação mantém a cor.** Exemplos: valores do módulo Entradas, status "Em trânsito"/"Separando", destaque ciano de entradas. Na dúvida, pergunte-se: "isso é ação, seleção ou foco (vira verde) ou é um dado com significado (mantém)?".

`npm run build`, confira as 7 telas e faça o commit.

### Etapa 6: performance

**6.1 Canvas: crie `src/lib/canvasLoop.ts` e use-o em `NeonWave.tsx` e nas partículas do `StockDonut.tsx`.**

Problemas atuais:

- `NeonWave` força resolução de **pelo menos 3×** (`Math.max(devicePixelRatio, 2) * 1.5`). São 4 canvas a 60 fps, cada quadro com 3 passadas de `shadowBlur`, e eles continuam rodando com a aba em segundo plano ou fora da tela.
- O `StockDonut` redesenha 28 partículas com `shadowBlur` a 60 fps o tempo todo.

Implementação de referência (adapte se preciso, mas mantenha os comportamentos):

```ts
type DrawFn = (ctx: CanvasRenderingContext2D, time: number, width: number, height: number) => void;

interface CanvasLoopOptions {
  fps?: number;
  maxDpr?: number;
  onResize?: (width: number, height: number) => void;
}

/**
 * Anima um <canvas> gastando o mínimo: só roda com o canvas visível e a aba ativa,
 * limita FPS e resolução e respeita prefers-reduced-motion (desenha um quadro estático).
 * Retorna a função de limpeza para o useEffect.
 */
export function startCanvasLoop(
  canvas: HTMLCanvasElement,
  draw: DrawFn,
  { fps = 30, maxDpr = 2, onResize }: CanvasLoopOptions = {},
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameMs = 1000 / fps;
  let width = 0;
  let height = 0;
  let time = 0;
  let last = 0;
  let rafId = 0;
  let inView = false;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize?.(width, height);
    draw(ctx, time, width, height); // mudar canvas.width limpa o canvas, então redesenha na hora
  };

  const tick = (now: number) => {
    rafId = requestAnimationFrame(tick);
    const elapsed = now - last;
    if (elapsed < frameMs - 1) return; // tolerância de 1 ms para não pular quadros em telas de 60 Hz
    time += elapsed / 1000;
    last = now;
    draw(ctx, time, width, height);
  };

  const start = () => {
    if (rafId || reduceMotion || !inView || document.hidden) return;
    last = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) start();
    else stop();
  });
  const ro = new ResizeObserver(resize);
  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  resize();
  io.observe(canvas);
  ro.observe(canvas);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
```

- **`NeonWave.tsx`:**
  - mantenha todo o desenho (spline, feixes, as 3 passadas de glow, ponto final) e só troque o loop/resize por `startCanvasLoop`.
  - **Mantenha a mesma velocidade visual:** hoje o tempo avança 0,022 por quadro a ~60 fps (≈ 1,32 por segundo), então chame o render com `time * 1.32`.
  - o `useEffect` passa a ser `return startCanvasLoop(canvas, draw, { fps: 30 })`.
- **`StockDonut.tsx` (partículas):**
  - recrie as partículas no `onResize` só se o tamanho mudar de verdade.
  - mova as partículas proporcionalmente ao tempo decorrido (`dt`), para manter a velocidade a 30 fps.
  - troque o `shadowBlur` por partícula por um segundo círculo maior com alfa baixo (≈ 2,5× o raio, alfa × 0,25). O visual é o mesmo e o custo é muito menor.

**6.2 Parallax do cubo sem re-render.** Hoje cada `mousemove` chama `setMouseParallax`, que re-renderiza o donut e a legenda inteiros a cada evento. Troque por `useRef` nos elementos do cubo e do `.tech-circle-stock` e escreva `element.style.transform` dentro de um `requestAnimationFrame` (cancelando o anterior). O `onMouseLeave` volta aos valores iniciais.

Detalhe: hoje o `transform` inline do `.cube-stock` **não aparece**, porque a animação CSS `cubeFloat` também anima `transform`, e animações vencem estilo inline na cascata. Para o parallax funcionar de fato, coloque o parallax num wrapper e deixe a flutuação (`cubeFloat`) no elemento interno.

**6.3 Brilhos sem `filter: blur()`.** Cada pseudo-elemento com `filter: blur(32–45px)` vira uma camada desfocada separada, e há dezenas no dashboard. Troque por `radial-gradient`, que dá o mesmo efeito praticamente de graça. Vale para `.hud-card::after`, `.kpi-card::after` (com as variantes de cor), `.neon-indicator-card::after` (com as variantes), `.sidebar::before`, `.sidebar::after`, `.topbar-panel::before`, `.topbar-panel::after` e `.center-glow-stock`. Exemplo:

```css
/* antes: background: rgba(0, 245, 155, 0.26); filter: blur(38px); left: -10%; bottom: -40px; width: 80%; height: 90px; */
.kpi-card.kpi-emerald::after {
  left: -30%;
  bottom: -90px;
  width: 120%;
  height: 180px;
  background: radial-gradient(ellipse at center, rgb(var(--sf-green-rgb) / 0.26) 0%, transparent 65%);
  filter: none;
}
```

Ajuste tamanho e posição até o brilho ficar igual ao atual.

**6.4 `backdrop-filter` mais leve.** Com o fundo em imagem, cada blur é recalculado a cada quadro de scroll. Os cards já são ~85% opacos, então um blur grande quase não aparece e custa caro:

| Seletor | Hoje | Novo |
|---|---|---|
| `.sidebar` | `blur(30px) saturate(210%)` | `blur(14px)` |
| `.topbar-panel` | `blur(28px) saturate(210%)` | `blur(14px)` |
| `.hud-card`, `.kpi-card` | `blur(20px)` | `blur(10px)` |
| `.neon-indicator-card` | `blur(20px)` | **remover** (fica dentro de um `.hud-card`; blur aninhado custa em dobro e não aparece) |
| `.sidebar-nav-item` | `blur(16px)` | **remover** (dentro da sidebar, que já tem blur) |
| `.module-tab` | `blur(10px)` | **remover** (dentro da topbar) |
| `.user-dropdown-menu` | `blur(24px)` | manter (é flutuante) |

Mantenha os prefixos `-webkit-backdrop-filter` coerentes com os valores novos.

**6.5 Sem `transition: all`.** No `globals.css`, troque `transition: all …` pelas propriedades que mudam de fato (em geral `transform, box-shadow, border-color, background-color, color, opacity`). Vale para `.hud-card`, `.kpi-card`, `.kpi-icon-box`, `.neon-indicator-card`, `.legend-row-stock`, `.sidebar-brand`, `.sidebar-cube-btn`, `.sidebar-nav-item`, `.nav-icon-badge`, `.topbar-logo-icon`, `.topbar-search-input`, `.theme-toggle-switch`, `.topbar-notif-btn`, `.user-dropdown-btn`, `.dropdown-item`, `.module-tab`, `.date-range-pill` e `.quick-action-pill`. Os `transition-all` do Tailwind nos `.tsx` podem ficar.

**6.6 Respeitar quem pediu menos movimento.** No fim do `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`npm run build`, `npm run lint` e commit.

### Etapa 7: ajustes finos de fidelidade (opcional, baixo risco)

Faça só se as etapas anteriores estiverem prontas e validadas:

- Ícone verde pequeno antes dos títulos "Indicadores de estoque" (barras) e "Distribuição do estoque", como na referência, no mesmo padrão de caixa de ícone dos cards de baixo (`w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-400`).
- Na referência, o seletor de tema aparece como um botão redondo de 34×34 com ícone de sol. Se fizer, mude **só a aparência**: mesmo `onClick` e mesmo `aria-label`.

## 7. Validação (obrigatória antes de encerrar)

1. **Build:** `npm run build` passa.
2. **Lint:** `npm run lint 2>&1 | tail -1` mostra **no máximo** 32 erros e 58 avisos (a linha de base). Nenhum problema novo nos arquivos que você mexeu.
3. **Visual:**
   - `npm run dev`. Sem o backend rodando, o login entra em **modo demonstração** com qualquer e-mail e senha (fallback do `AuthContext`).
   - Compare o dashboard a 1672×940 com `docs/design/referencia-dashboard.webp`.
   - Passe pelas 8 telas e pelo login.
   - Teste a sidebar recolhida (Alt+B) e o celular (390 px): o menu abre, não há scroll horizontal e o fundo cobre a tela toda.
   - Se tiver Playwright disponível globalmente (sem adicionar ao projeto), salve screenshots em `docs/design/depois-*.png`. Para pular o login, injete antes da navegação `localStorage.setItem('stockflow_demo_user', JSON.stringify({ id: 'usr_demo', nome: 'Giovanni Silva', email: 'admin@stockflow.local', role: 'ADMIN', ativo: true }))`.
4. **Performance (Chrome DevTools):**
   - Grave 5 s do dashboard parado na aba Performance, antes e depois. Deve haver bem menos tempo de scripting e paint.
   - Troque de aba e volte: nenhum `requestAnimationFrame` roda em segundo plano.
   - Com Rendering → "Emulate CSS prefers-reduced-motion: reduce", nada se mexe e as ondas aparecem estáticas.
   - O scroll do dashboard fica liso.
5. **Contraste:** todo texto continua legível sobre o fundo, inclusive onde as ondas verdes são mais fortes (cantos inferiores).

## 8. Checklist de aceite

- [ ] Fundo `bg-stockflow.webp` visível em todas as telas e no login, sem repintar no scroll
- [ ] Nenhum azul ou azul-marinho de **interface** sobrando (sidebar, topbar, abas, inputs, botões primários, links)
- [ ] Cores semânticas intactas (KPIs, mini-cards, donut, prioridade, status, ícones de módulo)
- [ ] Logo "Flow", título "StockFlow", badge de versão, aba ativa, item ativo e "Ações rápidas" em verde
- [ ] Abas, período e "Ações rápidas" numa linha a 1672 px
- [ ] Mini-cards com valor numa linha só e com o gradiente do ícone aparecendo
- [ ] Cubo, anéis e partículas do donut em verde
- [ ] Canvas pausam fora da tela e com a aba oculta, e respeitam reduced-motion; DPR limitado a 2
- [ ] Parallax do cubo sem `setState` no `mousemove`
- [ ] Brilhos sem `filter: blur()` e `backdrop-filter` reduzidos ou removidos conforme a tabela
- [ ] `npm run build` passa e o lint não piorou
- [ ] Nenhuma lógica, texto, dado ou rota alterados; backend e HTMLs antigos intocados

## 9. Formato da entrega

Ao terminar, responda com:

1. A lista de commits (um por etapa).
2. Os arquivos alterados, com uma linha sobre cada um.
3. O lint antes e depois (a última linha do `npm run lint`).
4. O que ficou de fora ou diferente da referência, e por quê.
5. Onde estão os screenshots de "depois", se conseguiu tirar.
