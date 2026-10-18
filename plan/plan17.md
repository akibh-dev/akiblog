# Plan 17 — Migrate `islands/terminal` + `islands/projects` from React to full Astro (zero functionality/UI change)

Analysis only — no code yet. Verdict up front: **both islands can migrate with
pixel- and behavior-parity; Terminal is low-risk, Projects is medium-effort
bounded almost entirely by ARIA re-implementation.** Sources: Astro docs
(client-side scripts, custom elements), astro-framework skill guidance
("if the interactivity is small, vanilla `<script>` beats hydrating React").

---

## 1. Current inventory (verified against source)

### Terminal island — 629 lines, only 223 are React
| File | Lines | Nature |
|---|---|---|
| `Terminal.tsx` | 223 | **Only React piece** — stateful shell |
| `commands.ts` | 271 | Pure TS command functions — migrate **verbatim** |
| `registry.ts` / `dsl.ts` / `types.ts` | 135 | Pure TS — migrate **verbatim** |

React surface in `Terminal.tsx`: `entries` scrollback, `input` draft,
`history` + `histIdx` pointer, id counter, `inputRef`/`scrollRef`.
Keyboard contract: Enter run · ↑/↓ history (draft restore) · Tab complete ·
Ctrl+L clear · Ctrl+C abort. Renders boot entries + segment-mapped output
(tone classes, links), click-to-focus container, hidden input.
Mounted: `Hero.astro:88 <Terminal client:load data={portfolioData} />`.
(No GSAP anymore — removed in the interactive-shell rewrite.)

### Projects island — ~1650 lines
- `ProjectWorkspace.tsx` state: `sidebarOpen`, `openTabs[]`, `activeTab`,
  bounded history deque + `historyIndex`; `Tabs.Root` (Base UI, controlled).
- `EditorMenuBar.tsx`: `Menu.Root` (Base UI) avatar dropdown.
- `useScrollbarVisibility.ts`: scroll listener → `data-scrolling` attr.
- `icons.tsx`: the `?island-icon` build adapter (25 exports,
  `dangerouslySetInnerHTML`) — exists **only** because React can't import
  `.astro` icons.
- Everything else (TitleBar, Tabs, Breadcrumbs, StatusBar, Panel,
  ReadmePreview, Minimap, ChromeButton) is presentational.
- Mounted: `Projects.astro:19 <ProjectBrowser client:load ... />`.

### Remaining React (out of scope, but caps the payoff)
`ThemeSwitch.tsx` (Base UI ToggleGroup), `MobileMenu.tsx` (Base UI Dialog),
`CopyButton.tsx` (plain React). While any React remains, the ~209KB
react/react-dom/client chunk still ships.

---

## 2. Key insights that make this feasible

1. **Terminal is already 65% vanilla.** commands/registry/dsl/types have
   zero React imports. A terminal is *append-only* output — vanilla DOM
   (`appendChild` per output line) is more natural than React, which
   re-renders the entire scrollback on every keystroke today.

2. **Projects' state space is tiny and enumerable — 5 projects.**
   Strategy: **pre-render every state at build, toggle visibility at
   runtime.** All 5 README panels in the DOM (`hidden` except active);
   all 5 tab-bar buttons (`hidden` until opened); tree static; folder
   collapse = class toggle; breadcrumbs/status-bar values carried in
   `data-*` attributes. The whole React re-render layer collapses into one
   `render()` that toggles `hidden` / `aria-selected` / classes.

3. **The icon adapter disappears.** In `.astro` templates the canonical
   `src/icons/*.astro` are native components — `<FolderIcon class="…" />`
   directly. Delete `icons.tsx`; the `?island-icon` plugin only stays if
   other React islands remain.

4. **The real cost is ARIA parity, and it's bounded.** Base UI gives
   `Tabs.Root` roving tabindex + ←/→/↑/↓/Home/End + `aria-selected`, and
   `Menu.Root` ↑/↓ + typeahead + Esc/outside-click + focus return.
   "No functionality change" includes keyboard/AT behavior → hand-roll
   both patterns (~60–80 lines tabs, ~100–150 lines menu, well-documented
   WAI-ARIA patterns). This is the only genuinely hard work in the plan.

5. **Recommended vehicle: custom elements** (Astro docs' canonical
   vanilla-island pattern). `<portfolio-terminal>` and
   `<project-workspace>` wrappers: scoped `this.querySelector()`,
   per-instance `connectedCallback`, server data via `data-*`.
   Astro-processed `<script>` = TypeScript + bundling + dedup +
   auto-inline, no framework runtime.

---

## 3. Migration strategy (phased, golden-master gated)

**Phase 0 — Golden master.** `pnpm build`; save `dist/` HTML + full-page
screenshots + an interaction checklist (every keyboard/click behavior in
§1). All later phases diff against this.

**Phase 1 — Terminal (proves the pattern, low risk).**
`Terminal.astro` renders boot entries + static chrome at build (identical
HTML to today's SSR); `<portfolio-terminal>` custom element owns scrollback
append, input draft, history pointer, keyboard contract, click-to-focus,
scroll-to-bottom. commands/registry/dsl/types move untouched.
Gate: type every command, run the keyboard contract, diff screenshot.

**Phase 2 — Projects static shell.** Port the 10 presentational components
to `.astro` with native icons; pre-render all 5 panels/tabs with `hidden`;
`data-*` for per-project status-bar/breadcrumb values. Zero JS yet —
page must already look pixel-identical (screenshot diff gate).

**Phase 3 — Projects controller.** `<project-workspace>` custom element:
state machine (openTabs/activeTab/history deque/sidebarOpen/folders),
event delegation on tree + tab bar, visibility render pass,
hand-rolled ARIA tabs + menu, scrollbar-visibility listener.
Gate: full keyboard walkthrough vs checklist; tab order audit.

**Phase 4 — Verify + delete.** Dist HTML diff (should differ only in
React/Astro scaffolding attrs), bundle-size compare, delete `*.tsx` for
both islands. `@astrojs/react` stays (ThemeSwitch etc. still React).

**Phase 5 — (optional, separate scope) drop React entirely.**
ThemeSwitch/MobileMenu/CopyButton → vanilla (all trivial; MobileMenu via
`<dialog>` or hand-rolled), then remove `@astrojs/react`, `react`,
`react-dom`, `@base-ui-components/react`, and the `?island-icon` plugin.

---

## 4. Payoff math (raw bundle, current build)

| Chunk | Today | After Phase 4 | After Phase 5 |
|---|---|---|---|
| react + react-dom + client runtime | ~209KB | ~209KB (stays) | **0** |
| ProjectBrowser + CompositeItem (Base UI) | ~118KB | **~8–12KB** controller | same |
| Terminal | ~9.4KB | **~4–6KB** element | same |
| **Total page JS** | ~345KB | ~230KB | **~15–20KB** |

Secondary wins: no hydration pass (interaction ready at parse; zero
hydration-mismatch surface), `dangerouslySetInnerHTML` icon hack gone,
Terminal scrollback stops re-rendering per keystroke.

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| ARIA/keyboard regression in tabs + menu | §3 Phase 0 checklist; WAI-ARIA APG patterns verbatim; manual + axe audit |
| SSR HTML drift (spacing/attr diffs) | Phase 2 gate: pixel-diff before any JS is added |
| `hidden`-attribute vs Tailwind class conflicts | Use `hidden` attr + `[hidden]{display:none}` guard; never mix with `hidden` class on same node |
| Scrollbar-visibility timing | Port hook 1:1 (scroll listener + 700ms timer) — trivial |
| Status-bar/breadcrumb text updates | `data-*` carriers + textContent writes; no innerHTML of user data |
| Scope creep into ThemeSwitch/MobileMenu | Explicitly Phase 5; Phase 4 ships with React runtime still present |

**Feasibility verdict:** Terminal — HIGH (days→hours). Projects — HIGH with
bounded effort (~1 focused session; 70% of it is the two ARIA patterns).
No functionality or UI change is required by the migration itself; every
dynamic behavior maps to a DOM operation.
