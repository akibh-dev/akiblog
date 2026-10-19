# Component Architecture

Delta.dev-style component taxonomy. One rule decides where a file lives:
**what kind of job does it do?**

```
components/
├── ui/         Presentational primitives — pure markup, zero behavior
│   ├── Hatch.astro          45° hatched pattern band (themed via --color-hatch)
│   ├── SectionShell.astro   section wrapper: hatch + numbered eyebrow + reveal
│   └── ScrollRow.astro      CSS scroll-snap horizontal scroller
│
├── layout/     Site shell — one instance each, owned by Layout.astro
│   ├── ViewportFrame.astro  fixed hatched frame (delta.dev signature)
│   ├── SiteSidebar.astro    desktop sidebar = header (nav tree, theme)
│   └── MobileHeader.astro   mobile top bar + menu trigger
│
├── sections/   Content sections — data in, markup out, no behavior
│   ├── Hero.astro           status pill, name, CTAs, live terminal
│   ├── Projects.astro       shell + data → ProjectBrowser island
│   ├── Writings.astro       blog card ScrollRow
│   ├── Skills.astro         category card ScrollRow + CV CTA
│   └── Contact.astro        form + channels + footer bar
│
└── islands/    Interactive — the ONLY components with client-side JS
    ├── ThemeSwitch.tsx      Base UI ToggleGroup  (client:load)
    ├── MobileMenu.tsx       Base UI Dialog       (client:load)
    ├── ProjectBrowser.tsx   Base UI Tabs         (client:load)
    ├── CopyButton.tsx       plain React          (client:visible)
    ├── ScrollSpy.astro      native custom element (IntersectionObserver)
    └── terminal/            interactive shell    (client:load)
        ├── types.ts         Segment/OutputLine/Command contracts
        ├── dsl.ts           typed output builders (t, link, kv, blank)
        ├── registry.ts      alias map + tab completion
        ├── commands.ts      16 pure commands over injected data
        └── Terminal.tsx     shell state machine (history, ctrl+c/l)
```

Shared typed modules live in `src/lib/` (e.g. `theme.ts` — consumed by
both `ThemeSwitch` and the terminal's `theme` command).

## Conventions

- **No `<script>` outside `islands/`** — sections/layout/ui are declarative.
- **No one-off hex values** — style with token utilities from `global.css`
  (`bg-canvas`, `text-subtle`, `border-line-subtle`, `text-accent`, …).
- **Behavior via platform first** — scroll-snap, scroll-driven animations,
  `aria-current`; JS only where the platform has no answer.
- Every file opens with a docblock: what it is + why it exists.
