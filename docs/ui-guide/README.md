# Blog UI Guide: portfolio design system + Delta blog reference

**Updated 2026-10-21. Synced from `apps/portfolio` on the `portfolio` branch,
commit `091c7cf`** (a11y/SEO pass, 404 page, CSP, React removed).

The blog must look, read and behave like akib35.dev. This directory used to be
a standalone Delta-blog reference with its own hardcoded hex palette. It now
has two layers:

1. **The portfolio is the source of truth** for tokens, fonts, page shell,
   buttons, theme switching, head/SEO, CSP and the 404 page (§2–§5).
2. **The Delta reference files here** (`blog.css`, `TableOfContents.astro`,
   `ImageZoom.astro`, …) remain useful for **article-specific** markup and
   behavior, but must be **re-themed onto the portfolio tokens** using the
   mapping in §6 when they are copied into `apps/blog`.

Architecture, content pipeline and deploy: `plan/plan19.md` and `plan/plan20.md`.

---

## 1. Ground rules

1. **Pure Astro, no React/UI framework.** Interactive pieces are `.astro` +
   vanilla TS `<script>`, with custom elements for stateful widgets (the portfolio
   dropped React in `091c7cf`).
2. **No `<script>` outside `islands/`.** `ui/`, `layout/`, `sections/` are declarative.
3. **No one-off colors.** Use only the token utilities in §3. Exceptions are listed
   explicitly (callout semantic colors, the 404's gutter blue).
4. **Platform first**: `<dialog>`, scroll-snap, scroll-driven animation,
   `aria-current`, `<details>`. JS only where the platform has no answer.
5. **Docblock at the top of every file**: what it is, why this approach, POC.
6. **Dark is the default theme.** Light is opt-in and persisted in `localStorage["theme"]`.
   The key is the same as the portfolio's, though separate origins don't share it.
   There is **no "system" mode** (the Delta reference's 3-way toggle is retired).
7. **CSP-safe scripts**: no `define:vars`. Pass data through `data-*`
   attributes (Astro's hash-based CSP can't hash per-build inline scripts).
8. **Copied files carry provenance** in their docblock:
   `Copied from apps/portfolio/src/<path> @ 091c7cf. Keep in sync.`

---

## 2. What to copy from the portfolio (`portfolio` branch @ `091c7cf`)

Extract with `git show portfolio:apps/portfolio/<path>`, since the files are not on
the `blog` branch.

| Portfolio source | Blog destination | Change on copy |
|---|---|---|
| `src/styles/global.css` | `src/styles/global.css` | none. Append blog layers (§7 prose) at the end |
| `src/lib/theme.ts` | `src/lib/theme.ts` | none |
| `src/layouts/BaseHead.astro` | `src/layouts/BaseHead.astro` | props for article SEO: `image`, `type: 'article'`, `published`, `modified`, `tags`, `canonical`. JSON-LD `BlogPosting` (+ `Person` @id → `https://akib35.dev/#person`) |
| `src/layouts/Layout.astro` | `src/layouts/Layout.astro` | forward the BaseHead props. The clean-URL `#` script stays (TOC links use it) |
| `src/pages/404.astro` | `src/pages/404.astro` | **routes list = blog routes** (`/`, the `/#…` sections, `/rss.xml`, each tag, and every post slug, so `/github-cli` suggests `/github-cli-guide/`). Domain text `blog.akib35.dev`. "Read the blog" button → "Portfolio ↗" |
| `src/components/layout/{ViewportFrame,SiteSidebar,MobileHeader,BrandLogo}.astro` | same | sidebar/mobile menu read **stations from a prop** instead of `data/sections.ts` (§4.2) |
| `src/components/islands/{ScrollSpy,MobileMenu,ThemeSwitch,CopyButton}.astro` | same | none (all Astro since `091c7cf`) |
| `src/components/ui/{Seam,Hatch,SectionShell,ScrollRow,PostCover}.astro` | same | PostCover takes `ImageMetadata` → `<Image>` (build-time AVIF/WebP) |
| `src/components/sections/Footer.astro` | same | + `notes@<sha>` build stamp, RSS link |
| `src/icons/IconBase.astro` + used `social/`, `ui/`, `lang/`, `tech/` icons | `src/icons/` | export only what's used |
| `public/fonts/{iAWriterQuattroV,IBMPlexSerif-Var,Lilex-Regular,square-kufic}.woff2` | `public/fonts/` | none (self-hosted, OFL) |
| `public/{bg-pattern.svg,bg-pattern-dark.svg,noise.webp,favicon.ico,apple-touch-icon.png}` | `public/` | none |
| `public/_headers` | `public/_headers` | add `/pagefind/*` cache rule if search ships |
| `public/robots.txt` | `public/robots.txt` | sitemap URL → `https://blog.akib35.dev/sitemap-index.xml` |
| `astro.config.mjs` `security.csp` + `sitemap()` | `astro.config.mjs` | CSP additions for giscus (§8) |
| `public/og.png` | — | blog gets its own default `og.png` (1200×630) for posts without a cover |

**Not copied**: `sections/{Hero,About,Projects,Skills,Contact,Writings}`,
`islands/{terminal,projects}`, `functions/` (contact), Turnstile CSP entries.

---

## 3. Design tokens (the only allowed colors)

Three OKLCH seeds, everything else derived with `color-mix()`:

| Seed | Value |
|---|---|
| `--delta-brand` | `oklch(59% 0.185 32)` (orange-red) |
| `--delta-cream` | `oklch(60% 0.1 75)` (warm light) |
| `--delta-neutral` | `oklch(53% 0.02 259)` (cool gray) |
| `--delta-blue` | `#346dae` (rail tail) |

| Utility | Role | Blog usage |
|---|---|---|
| `bg-frame-background` | one-paint page bg + fixed watermark | body (automatic) |
| `bg-surface` | panel face | every SectionShell / article panel |
| `bg-canvas` | inset, a step below surface | code blocks, cover frame, inline code, callouts |
| `bg-surface-strong` | raised face | code-block tab strip, active tab, `kbd` |
| `bg-control-hover` | hover face | TOC rows, list rows |
| `text-default` / `text-subtle` / `text-muted` | text ladder | body / secondary / meta & captions |
| `border-line` / `border-line-subtle` | hairlines | structure / inner dividers & table rules |
| `text-accent` / `bg-accent-subtle` | brand **text** / brand wash | links, active TOC item, selection, NOTE callout |
| `--ui-accent-fill(-hover)` (via `btn-primary`) | brand **face behind white text** | primary CTA only |
| `bg-hatch` | 45° hatch tint | Hatch bands |
| `btn`, `btn-primary`, `btn-hover` | the only button styles | Copy, "All posts", tag pill hover |
| `no-scrollbar`, `zed-scroll` | inner scrollers | tag rows / code blocks & tables |
| `reveal-on-scroll` | scroll-driven entry | via SectionShell |

**Contrast contract (from `091c7cf`)**: `text-muted` and `text-accent` are
tuned to ≥4.6:1 on surface, canvas and the accent wash in **both** themes.
`text-muted` is still for meta only, never body copy. Never use `text-accent`
for white-on-red. That's what `btn-primary`'s accent-fill is for.

**Dark ladder**: canvas < surface < surface-strong < control-hover <
border-subtle < border, with the same order in light. If you're writing `dark:`,
you're probably using the wrong token.

Page scrollbar is brand red (`html { scrollbar-color: var(--ui-accent) … }`).
Inner scrollers use `zed-scroll`.

### Typography

| Token | Font (self-hosted, `public/fonts`) | Use |
|---|---|---|
| `font-display` | IBM Plex Serif (var) | post title, article h2/h3, card titles, drop cap |
| `font-body` | iA Writer Quattro (var), **the only preloaded font** | article text |
| `font-mono` | Lilex | eyebrows, meta, labels, buttons, code, TOC |
| `text-2xs` | 11px/16px | eyebrows, meta, buttons (uppercase + `tracking-wider/widest`) |

Article measure is **~68ch**. Body `text-[1.0625rem] leading-[1.75]`.

---

## 4. Page shell (identical to the portfolio)

```
body (bg-frame-background + fixed watermark)
├─ ViewportFrame   fixed z-20: top/bottom cells, gutters, 6px rail [3/8 accent | 2/8 neutral | 3/8 blue]
├─ MobileHeader    < md; opens MobileMenu (<dialog>)
└─ grid [sidebar 1fr | main 4fr] (md+), max-width 75rem
   ├─ SiteSidebar  sticky: BrandLogo, stations on the git-tree rail, ThemeSwitch, socials
   └─ main         pt-rail, md:border-r
        Panel (SectionShell) ─ Seam ─ Panel ─ Seam ─ … ─ Footer
```

### 4.1 Panels and seams
- A page is a **vertical stack of SectionShell panels joined by `<Seam/>`**.
  There's no seam at the top or bottom edge, since the frame draws those.
- Panels are flush, with no cards, gaps or shadows. Structure comes only from `border-line` hairlines.
- Default padding is `px-5 md:px-8 py-14 md:py-20`. Full-bleed panels (grids,
  cover, TOC split) use `pad="p-0"` and draw their own internal borders.
- Section headers: `ui/SectionHeader.astro` (portfolio Writings header): a serif
  `h2` (`text-2xl md:text-3xl`), one short mono `text-xs text-subtle` line, and an optional
  right-side count. **No `NN. Label` eyebrows** (plan25).

### 4.2 Sidebar rail: stations on home, TOC on posts (plan22 + plan23)

| Station | On `/` (one-pager) | Elsewhere |
|---|---|---|
| `01. Home` | `#home` (intro) | `/` |
| `02. Search` | `#search` (Pagefind) | `/#search` |
| `03. Tags` | `#tags` (topic list) | `/#tags` (active on `/tags/<tag>/`) |
| `04. Posts` | `#posts` (all posts) | `/#posts` (active on post pages) |
| `05. Portfolio ↗` | `https://akib35.dev` | same |

URLs stay clean like the portfolio: section and TOC clicks never write `#…`
into the address bar (Layout's clean-URL script, plan24). Posts live at the
root: `blog.akib35.dev/<slug>/`.

Stations live in `src/data/site.ts`. On `/` they are in-page anchors under
ScrollSpy, with the hop connector, as in the portfolio. Elsewhere the matching one is
marked at build time.

**On post pages (lg+) the stations are replaced by the table of contents.**
A fixed "On this page" heading (mono `text-xs` uppercase, hairline below, not
a link) sits above the rail's scroll area. Below it the outline is drawn as a
commit graph that starts at the first heading's node: h2 commits on the
trunk, h3 on a branch forked from their h2, h4 on a branch off the h3. Forks and
merges are 45°, lines are 1.2px `--ui-border-subtle`, nodes are 7px hollow. The heading
being read gets the filled accent node, and its ancestors get accent outlines. Below `lg`
the stations stay and an inline `<details>` "On this page" sits above the article.

Stations ⇄ TOC share the view-transition name `sidebar-nav` (global.css §9).
Navigating home ⇄ post lifts the old list out and grows the new one in, while the
rest of the page cross-fades. CSS only, and off under reduced motion.

---

## 5. Post page layout

The TOC lives in the sidebar (§4.2), so the article panel is a single column:

```
Panel                 PostHeader (eyebrow type / tags · h1 · description · meta row) + AiBanner
Panel (p-0)           cover in PostCover proof frame (or typographic default)
Seam
Panel                 <details> On this page (below lg) + article.prose (max-w-[68ch])
Seam
Panel (p-0)           PostNav: ← previous | next → (+ series list)
Seam
Panel                 0N. Comments (giscus, lazy)
Seam
Footer
```

- Scroll-spy (`islands/TocSpy.astro`) marks the heading being read with
  `aria-current="location"` in both the sidebar tree and the inline block.
- `scroll-margin-top: var(--site-content-top)` on headings, the portfolio's own
  offset under the fixed frame (replaces Delta's `5rem`).

### Index `/` (one-pager, plan23 + plan24 order)
```
#home    Panel   h1 "akiblog.", mono tagline, TagPills (no eyebrow)
Seam
#search  Panel   SectionHeader "Search" + <blog-search> (Pagefind)
Seam
#tags    Panel   SectionHeader "Tags" · N tags + ruled topic list (sections/TagList)
Seam
#posts   Panel   SectionHeader "All posts" · N posts
                 ★ Featured  PostGrid of `featured: true` posts (newest first)
                 Latest      PostGrid #feed — batch 1 in HTML, then /feed/<n>/
                             fragments appended on scroll (islands/LoadMore, plan26)
Seam
Footer
```

### Tag `/tags/<tag>/`
Panel with `← All tags` (/#tags), `h1 #tag` + count + sibling TagPills, then Seam and PostGrid.

### 404
Portfolio's rustc-style diagnostic page as-is (standalone, BaseHead, no
sidebar) with the blog's route list. Pages serves `dist/404.html` with HTTP 404.

---

## 6. Re-theming the Delta reference files (token map)

When copying anything from this directory, replace the old variables:

| Delta reference var | Portfolio token / utility |
|---|---|
| `--delta-canvas`, `--ui-background-canvas` | `--ui-surface` / `bg-surface` (panel face) |
| `--delta-surface`, `--ui-background-subtle` | `--ui-canvas` / `bg-canvas` |
| `--ui-background-strong`, `--markdown-code-background` | `--ui-canvas` / `bg-canvas` |
| `--ui-control-background` | `--ui-surface-strong` |
| `--ui-control-background-active` | `--ui-control-hover` |
| `--delta-text`, `--ui-text` | `--ui-text` / `text-default` |
| `--delta-text-subtle`, `--delta-text-muted`, `--ui-text-subtle` | `--ui-text-subtle` / `text-subtle` |
| `--ui-text-placeholder` | `--ui-text-muted` / `text-muted` |
| `--ui-border-subtle` | `--ui-border-subtle` / `border-line-subtle` |
| `--ui-border-strong`, `--ui-border-stronger`, `--ui-control-border`, `border-delta` | `--ui-border` / `border-line` |
| `--delta-brand`, `--ui-accent` | `--ui-accent` / `text-accent` (text) or `--ui-accent-fill` (white-on-red) |
| `--ui-accent-subtle`, `--ui-focus-ring` | `--ui-accent-subtle` / `bg-accent-subtle` |
| `--ui-font-display` | `--font-display` / `font-display` |
| `--ui-font-interface` | `--font-mono` / `font-mono` |
| `--ui-success/-warning/-error(-subtle)` | callout colors, §7 (the only allowed semantic colors) |
| `--site-content-top: 1.5rem` | **delete**. The portfolio defines the real value |

Status of each reference file:

| File | Status |
|---|---|
| `BlogLayout.astro` | **superseded** by portfolio `Layout.astro` + §5. Keep only the article/TOC grid idea |
| `BlogHeader.astro` | **superseded** by `PostHeader` (no author avatar since it's single-author; meta row with reading-time meter) |
| `TableOfContents.astro` | **logic kept** in `islands/TocSpy.astro` (rAF scroll tracking, click-settle); markup replaced by the sidebar tree (plan22) |
| `ImageZoom.astro` | **keep** for in-article images (`<dialog>` lightbox). Light/dark image pairs are optional and not in the schema |
| `MorePosts.astro` | **superseded** by `PostNav` + PostGrid (no avatars) |
| `blog.css` | **keep structure** for `.prose` (headings, code, alerts, tables, footnotes), swap vars via §6, drop its `:root/.dark` palette |
| `content.config.ts` | **updated** to the plan19/plan20 schema |
| `../sample-post.md` | **moved** to `docs/sample-post.md`: the canonical author template (copied to notes as `_templates/sample.md`) |

---

## 7. Article typography (`.prose`, appended to global.css)

Handwritten from tokens, no `@tailwindcss/typography`.

| Element | Style |
|---|---|
| `p, ul, ol` | `font-body` 1.0625rem/1.75, `text-default`, `mb-5` |
| `h2` | `font-display text-2xl tracking-tight text-balance`, `mt-14 mb-4`, `border-b border-line-subtle pb-2` (Delta), hover `#` anchor in `text-muted` |
| `h3` | `font-display text-xl`, `mt-10 mb-3` |
| `h4` | `font-mono text-2xs uppercase tracking-widest text-accent` |
| `a` | `text-accent underline decoration-accent/30 underline-offset-3 hover:decoration-accent`. External links get a trailing ↗ |
| inline `code` | `font-mono text-[0.875em] bg-canvas border border-line-subtle px-1.5 py-0.5 rounded-[2px]` |
| `blockquote` | `border-l-2 border-line pl-5 text-subtle italic` |
| callouts `> [!NOTE\|TIP\|IMPORTANT\|WARNING\|CAUTION]` | `bg-canvas border border-line-subtle border-l-[3px] px-5 py-4`, title `font-mono text-2xs uppercase tracking-widest`. Accent: NOTE `accent`, TIP `#1a7f37/#3fb950`, IMPORTANT `delta-blue`, WARNING `#9a6700/#d29922`, CAUTION `#cf222e/#f85149` (light/dark). These are the only semantic colors, defined once as `--callout-*` vars in global.css |
| `ul` / `ol` markers | `marker:text-accent` / `font-mono text-muted` |
| `hr` | Seam look: `h-4 border-y border-line`, transparent (watermark shows) |
| images | `ImageZoom` figure: `border border-line bg-canvas p-2`, caption `font-mono text-2xs text-muted` |
| `table` | inside `.table-scroll zed-scroll`. `font-mono text-xs`, header `text-2xs uppercase tracking-wider text-muted`, rows `border-b border-line-subtle`, even rows `bg-canvas` (Delta striping) |
| `kbd` | `border border-line bg-surface-strong shadow-[0_1px_0_var(--ui-border)] px-1.5 font-mono text-2xs` |
| footnotes | `text-sm text-subtle`, `border-t border-line-subtle` above, back-refs `text-accent` |

### Code blocks: Zed-style mini chrome
```
┌ border border-line bg-canvas ─────────────────────────────┐
│ [ts] src/middleware.ts                        [ Copy ]   │  tab strip: bg-surface-strong, border-b border-line, font-mono text-2xs
├───────────────────────────────────────────────────────────┤
│  1  export const onRequest = …                           │  Shiki, line numbers text-muted, zed-scroll on x
└───────────────────────────────────────────────────────────┘
```
- Shiki dual themes (`light-plus` / `one-dark-pro`, kept from the Delta reference),
  `defaultColor: false`, switched by `.dark`, with no JS.
- Language icon from `icons/lang|tech` when available. The `title="…"` meta goes in the tab.
- Copy = portfolio `CopyButton.astro`. Full-bleed on mobile (`-mx-5`).

---

## 8. Third parties (CSP)

Start from the portfolio's `security.csp` and **remove** Turnstile/picsum, then **add**:

| Directive | Add | Why |
|---|---|---|
| `script-src` | `https://giscus.app` | giscus client |
| `frame-src` | `https://giscus.app` | comments iframe |
| `img-src` | `https://avatars.githubusercontent.com` | not needed inside the iframe. Only needed if avatars are shown outside it |
| `style-src` | — | giscus theme CSS loads **inside its iframe** from our origin (needs `/giscus/*.css` with `Access-Control-Allow-Origin: https://giscus.app` in `_headers`) |

Keep Cloudflare Web Analytics entries if analytics is enabled on the blog.

---

## 9. Blog components (new)

| Component | Kind | Built from |
|---|---|---|
| `ui/PostCard.astro` | ui | the portfolio Writings column verbatim: PostCover → tags eyebrow → title → 2-line excerpt → reading-time meter (8 ticks) + date |
| `sections/PostGrid.astro` | section | `ul.grid border-t border-line lg:grid-cols-3`, `lg:border-l` splits |
| `sections/FeaturedPost.astro` | section | full-bleed cover + large title |
| `sections/PostHeader.astro` | section | eyebrow · `h1 font-display text-3xl md:text-5xl text-balance` · description · meta (meter, published, updated, series) |
| `ui/AiBanner.astro` | ui | `ai: assisted\|generated` → `border-l-2 border-accent bg-accent-subtle font-mono text-2xs` + Sparkles/Bot icon |
| `ui/TagPill.astro` | ui | `rounded-sm border border-line-subtle px-2.5 py-1 font-mono text-2xs text-subtle hover:border-accent hover:text-default` |
| `sections/PostNav.astro` | section | two-column ruled row prev/next + series |
| `layout/TocTree.astro` + `islands/TocSpy.astro` | layout + island | sidebar git-tree TOC + shared scroll-spy (plan22) |
| `islands/ImageZoom.astro` | island | Delta reference, re-themed |
| `islands/Comments.astro` | island | giscus lazy-mount (IntersectionObserver) + theme sync (MutationObserver on `<html>` class → `postMessage setConfig`) |

---

## 10. Motion, a11y, QA

- Motion: `reveal-on-scroll`, 150 ms color transitions, PostCover zoom. All off
  under `prefers-reduced-motion`.
- 24px minimum hit targets (portfolio a11y pass). Label text is included in the accessible name.
- Skip link → `#main-content`. Single `h1`, headings in order, `<time datetime>`.
- QA per page:
  - [ ] no color literals beyond the §7 callout vars
  - [ ] both themes correct, with no `dark:` utilities
  - [ ] panels and seams have continuous side lines
  - [ ] 375px: no page-level horizontal scroll (code/tables scroll inside)
  - [ ] zero JS on pages without code blocks, TOC or comments
  - [ ] CSP: no console violations
  - [ ] Lighthouse a11y/SEO/best-practices = 100
  - [ ] `bun run build:blog` passes

---

## 11. Featured posts, API and lazy feed (plan26)

- Frontmatter `featured: true` pins a post. It leads the home **All posts**
  section (★ Featured grid) and is served first by `GET /api/featured?limit=3`
  (`apps/blog/functions/api/featured.ts`, the only server code: a Pages Function
  reading the build's `/posts.json` via ASSETS, with CORS for akib35.dev).
- The non-featured list loads in batches of 6 as the reader scrolls. The batches are
  pre-built static HTML fragments (`/feed/<n>/`), so the cards are the same Astro
  markup. Sub-labels "★ Featured" / "Latest" use a `font-mono text-2xs uppercase
  tracking-widest` row with `border-t`. No numbers.
