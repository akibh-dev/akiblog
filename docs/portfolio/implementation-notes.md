# Portfolio implementation notes

Architecture, rationale, usage examples, and POCs moved from comments in `apps/portfolio/` and its deployment workflow.

Notes are grouped by source file. Each source comment points directly to its corresponding note below. Short local comments remain beside the code. These notes preserve the original explanations; they are not a fresh audit of implementation details.

Source links are relative to this guide; paths in the original notes are relative to the repository root unless stated otherwise.

## Source index

### Deployment workflow

- [`.github/workflows/portfolio-deploy.yml`](#github-workflows-portfolio-deploy-yml)

### Configuration, data, libraries, and scripts

- [`astro.config.mjs`](#astro-config-mjs)
- [`functions/api/contact.ts`](#functions-api-contact-ts)
- [`src/data/portfolio.ts`](#src-data-portfolio-ts)
- [`src/data/sections.ts`](#src-data-sections-ts)
- [`src/env.d.ts`](#src-env-d-ts)
- [`src/lib/blog.ts`](#src-lib-blog-ts)
- [`src/lib/theme.ts`](#src-lib-theme-ts)
- [`wrangler.toml`](#wrangler-toml)

### Styles and public files

- [`public/_headers`](#public-headers)
- [`public/robots.txt`](#public-robots-txt)
- [`src/styles/global.css`](#src-styles-global-css)

### Components and icons

- [`src/components/islands/CopyButton.astro`](#src-components-islands-copybutton-astro)
- [`src/components/islands/MobileMenu.astro`](#src-components-islands-mobilemenu-astro)
- [`src/components/islands/ScrollSpy.astro`](#src-components-islands-scrollspy-astro)
- [`src/components/islands/ThemeSwitch.astro`](#src-components-islands-themeswitch-astro)
- [`src/components/islands/projects/ProjectsIsland.astro`](#src-components-islands-projects-projectsisland-astro)
- [`src/components/islands/projects/chrome/Breadcrumbs.astro`](#src-components-islands-projects-chrome-breadcrumbs-astro)
- [`src/components/islands/projects/chrome/ChromeButton.astro`](#src-components-islands-projects-chrome-chromebutton-astro)
- [`src/components/islands/projects/chrome/MenuBar.astro`](#src-components-islands-projects-chrome-menubar-astro)
- [`src/components/islands/projects/chrome/Minimap.astro`](#src-components-islands-projects-chrome-minimap-astro)
- [`src/components/islands/projects/chrome/ProjectPanel.astro`](#src-components-islands-projects-chrome-projectpanel-astro)
- [`src/components/islands/projects/chrome/ReadmePanel.astro`](#src-components-islands-projects-chrome-readmepanel-astro)
- [`src/components/islands/projects/chrome/StatusBar.astro`](#src-components-islands-projects-chrome-statusbar-astro)
- [`src/components/islands/projects/chrome/TabBar.astro`](#src-components-islands-projects-chrome-tabbar-astro)
- [`src/components/islands/projects/chrome/TitleBar.astro`](#src-components-islands-projects-chrome-titlebar-astro)
- [`src/components/islands/projects/controller.ts`](#src-components-islands-projects-controller-ts)
- [`src/components/islands/projects/dummy.ts`](#src-components-islands-projects-dummy-ts)
- [`src/components/islands/projects/scrollbars.ts`](#src-components-islands-projects-scrollbars-ts)
- [`src/components/islands/projects/types.ts`](#src-components-islands-projects-types-ts)
- [`src/components/islands/terminal/Terminal.astro`](#src-components-islands-terminal-terminal-astro)
- [`src/components/islands/terminal/boot.ts`](#src-components-islands-terminal-boot-ts)
- [`src/components/islands/terminal/commands.ts`](#src-components-islands-terminal-commands-ts)
- [`src/components/islands/terminal/dsl.ts`](#src-components-islands-terminal-dsl-ts)
- [`src/components/islands/terminal/registry.ts`](#src-components-islands-terminal-registry-ts)
- [`src/components/islands/terminal/render.ts`](#src-components-islands-terminal-render-ts)
- [`src/components/islands/terminal/shell.ts`](#src-components-islands-terminal-shell-ts)
- [`src/components/islands/terminal/types.ts`](#src-components-islands-terminal-types-ts)
- [`src/components/layout/BrandLogo.astro`](#src-components-layout-brandlogo-astro)
- [`src/components/layout/MobileHeader.astro`](#src-components-layout-mobileheader-astro)
- [`src/components/layout/SiteSidebar.astro`](#src-components-layout-sitesidebar-astro)
- [`src/components/layout/ViewportFrame.astro`](#src-components-layout-viewportframe-astro)
- [`src/components/sections/About.astro`](#src-components-sections-about-astro)
- [`src/components/sections/Contact.astro`](#src-components-sections-contact-astro)
- [`src/components/sections/Footer.astro`](#src-components-sections-footer-astro)
- [`src/components/sections/Hero.astro`](#src-components-sections-hero-astro)
- [`src/components/sections/Projects.astro`](#src-components-sections-projects-astro)
- [`src/components/sections/Skills.astro`](#src-components-sections-skills-astro)
- [`src/components/sections/Writings.astro`](#src-components-sections-writings-astro)
- [`src/components/ui/Hatch.astro`](#src-components-ui-hatch-astro)
- [`src/components/ui/PostCover.astro`](#src-components-ui-postcover-astro)
- [`src/components/ui/ScrollRow.astro`](#src-components-ui-scrollrow-astro)
- [`src/components/ui/Seam.astro`](#src-components-ui-seam-astro)
- [`src/components/ui/SectionShell.astro`](#src-components-ui-sectionshell-astro)
- [`src/components/ui/VerseCalligraphy.astro`](#src-components-ui-versecalligraphy-astro)
- [`src/icons/IconBase.astro`](#src-icons-iconbase-astro)
- [`src/icons/index.ts`](#src-icons-index-ts)
- [`src/icons/lang/Python.astro`](#src-icons-lang-python-astro)
- [`src/icons/tech/Django.astro`](#src-icons-tech-django-astro)
- [`src/icons/tech/Docker.astro`](#src-icons-tech-docker-astro)
- [`src/icons/tech/Flutter.astro`](#src-icons-tech-flutter-astro)
- [`src/icons/tech/Git.astro`](#src-icons-tech-git-astro)
- [`src/icons/tech/Linux.astro`](#src-icons-tech-linux-astro)

### Layouts and pages

- [`src/layouts/BaseHead.astro`](#src-layouts-basehead-astro)
- [`src/layouts/Layout.astro`](#src-layouts-layout-astro)
- [`src/pages/404.astro`](#src-pages-404-astro)
- [`src/pages/index.astro`](#src-pages-index-astro)
- [`src/pages/llms.txt.ts`](#src-pages-llms-txt-ts)

<a id="github-workflows-portfolio-deploy-yml"></a>

## .github/workflows/portfolio-deploy.yml

Source: [`.github/workflows/portfolio-deploy.yml`](../../.github/workflows/portfolio-deploy.yml).

<a id="github-workflows-portfolio-deploy-yml-note-1"></a>

### Overview

Portfolio → Cloudflare Pages deployment

Documentation & Implementation POC:

- Trigger: a push to `main` that touches apps/portfolio/** (or this file),
  or a manual run from the Actions tab (workflow_dispatch).

- Builds IN CI from source with bun (the repo's package manager, workspace
  deps such as @repo/tsconfig included), so the deployed site always
  matches the pushed commit. No committed dist.tar.gz is involved.
  GitHub-hosted ubuntu runners have plenty of RAM, so the OOM concern
  behind the Alpine/tarball flow in deploy.yml doesn't apply here.

- Deploys with `wrangler pages deploy`, run from apps/portfolio so Wrangler
  picks up wrangler.toml (MAILER service binding) and compiles
  functions/ (/api/contact) along with the static dist/.
  `--branch=main` makes it a PRODUCTION deployment.

- First run: if the Pages project doesn't exist yet, it is created with
  production branch `main`. After that the step is a no-op.

- `concurrency` stops two pushes from racing; the newer deploy wins.

Required GitHub repository secrets:
  CLOUDFLARE_API_TOKEN   token with "Cloudflare Pages: Edit" permission
  CLOUDFLARE_ACCOUNT_ID  the account that owns the Pages project and `mailer`

<a id="astro-config-mjs"></a>

## astro.config.mjs

Source: [`apps/portfolio/astro.config.mjs`](../../apps/portfolio/astro.config.mjs).

<a id="astro-config-mjs-note-1"></a>

### Overview

Standalone Astro configuration for the minimalist personal portfolio.

POC / Implementation Architecture:

- Employs static output mode (`output: 'static'`) for optimal edge CDN caching and zero server runtime costs.
- Image service: Astro's default (sharp, a devDependency). Images under src/assets go through
  astro:assets &lt;Image&gt;/&lt;Picture&gt; and are resized + converted to AVIF/WebP AT BUILD TIME, so the
  static output ships small files and no runtime image service is needed on Cloudflare.
  (Previously `passthrough` to keep sharp off constrained Alpine CI runners; switched by request
  so the hero portrait is optimized — the build host must be able to install sharp.)

- No UI framework integration: every island is a pure .astro component with a vanilla custom
  element (AGENTS.md rule 5; React + Base UI removed in plan 17 Phase 5).

- security.csp: hash-based Content-Security-Policy generated by Astro at build (see inline notes).
- @astrojs/sitemap generates the sitemap from `site` (single source of truth for the domain).
- Integrates Tailwind CSS v4 via `@tailwindcss/vite` plugin for lightning-fast builds and utility-first styling.
- Deploys to Cloudflare Workers static assets routing directly to apex domain `akibh.dev`.

<a id="astro-config-mjs-note-2"></a>

### Additional note 2

Content-Security-Policy — Astro hashes every &lt;script&gt;/&lt;style&gt; it renders
(bundled modules, is:inline theme init, the 404's define:vars, font-face
block) and writes a &lt;meta http-equiv&gt; CSP into each page. No
'unsafe-inline' for scripts: an injected inline script won't run.
Allowed third parties, and why:
  challenges.cloudflare.com   Turnstile script + its iframe (contact form)
  static.cloudflareinsights.com / cloudflareinsights.com
                              Cloudflare Web Analytics beacon (edge-injected)
  blog.akibh.dev / akiblog.pages.dev
                              blog post covers in Writings (lib/blog.ts)
style-src-attr 'unsafe-inline': markup uses a few style="" attributes
(status-bar font size, SVG strokes); attributes can't be hashed one by one.
frame-ancestors is NOT here: browsers ignore it in &lt;meta&gt;; public/_headers
sends X-Frame-Options: DENY instead.

<a id="functions-api-contact-ts"></a>

## functions/api/contact.ts

Source: [`apps/portfolio/functions/api/contact.ts`](../../apps/portfolio/functions/api/contact.ts).

<a id="functions-api-contact-ts-note-1"></a>

### Overview

Pages Function for POST /api/contact. Forwards the contact
             form to the private `mailer` Worker over the MAILER service
             binding (configured in wrangler.toml).

  Browser ──POST /api/contact (same origin)──▶ this Function
                                                 │ env.MAILER.fetch(request)
                                                 ▼  (service binding, never public)
                                               mailer Worker → Turnstile → Email Routing

WHY THIS IMPLEMENTATION (POC / rationale):

1. PAGES FUNCTION, NOT A WORKER SCRIPT — the portfolio is deployed to
   Cloudflare Pages. Pages turns `functions/` into routes and generates
   _routes.json, so ONLY /api/contact runs code; every other path stays
   a static asset with no compute.

2. HTTP ENTRYPOINT — Pages Functions call bindings via fetch(), and the
   mailer exposes an HTTP entrypoint that runs the same checks as its RPC
   `send()`. Forwarding the request unchanged keeps the Content-Type and
   Cloudflare's CF-Connecting-IP header, which the mailer prefers over
   any `ip` field in the body, so the per-IP rate limit can't be spoofed.

3. NO SECRETS HERE — validation, the honeypot, the rate limit, Turnstile
   Siteverify (secret + hostname check) and sending all live in the mailer.

4. SAME ORIGIN — the form posts to its own host, so there is no CORS, and
   the Turnstile token's hostname (akibh.dev) is in the mailer's
   TURNSTILE_HOSTNAMES.

5. FAIL SAFE — if the binding is missing (not configured, or local
   `astro dev`), the visitor gets a JSON error they can read, not a crash page.

Types are declared locally so this file needs no @cloudflare/workers-types
globals (which would clash with Astro's DOM types).

<a id="src-data-portfolio-ts"></a>

## src/data/portfolio.ts

Source: [`apps/portfolio/src/data/portfolio.ts`](../../apps/portfolio/src/data/portfolio.ts).

<a id="src-data-portfolio-ts-note-1"></a>

### Overview

Centralized portfolio content model derived from akibh.dev and the legacy portfolio repository.

POC / Implementation Architecture:

- Structured TypeScript objects providing compile-time type safety for all profile data.
- Single source of truth for bio, skills, competitive coding metrics, projects, and featured blog posts.
- Designed to easily pull or synchronize with external APIs or D1 in future iterations.

<a id="src-data-portfolio-ts-note-2"></a>

### Additional note 2

`handle` is the account name ON THAT PLATFORM (shown on the About tiles,
    terminal and llms.txt). It is deliberately NOT meta.handle: only some
    accounts moved to akibh (LeetCode, AtCoder); the others are still `akib35`, and the
    shown handle must always match the account the url opens.

<a id="src-data-portfolio-ts-note-3"></a>

### Additional note 3

Rotating epigraphs shown in the hero eyebrow slot (sections/Hero.astro).
One quote is picked at random in the browser on every page load.

WHY a standalone export (not inside portfolioData): the tiny client-side
picker script imports ONLY this array, so the hero's JS bundle tree-shakes
down to a few strings instead of shipping the entire dataset to the browser.

Edit freely — keep each quote a single line; quotation marks are rendered
by the component, attribution included in the string.

<a id="src-data-sections-ts"></a>

## src/data/sections.ts

Source: [`apps/portfolio/src/data/sections.ts`](../../apps/portfolio/src/data/sections.ts).

<a id="src-data-sections-ts-note-1"></a>

### Overview

SINGLE SOURCE OF TRUTH for page-section nav data
             (plan11 §3 + plan12 correction).

WHY NOT import the .astro panels here: Astro's Vite pipeline compiles
`.astro` imports only through a component frontmatter — a plain .ts
module importing ".astro/*.astro" fails the build
([builtin:vite-transform] Unexpected token). So this file holds the
serializable nav data, and pages/index.astro binds ids → components
with one import + one id-keyed record (plan12.md).

EXTENSIBILITY CONTRACT — adding a section is three additive lines:
  1. src/components/sections/YourThing.astro — wrap content in
     &lt;SectionShell id="…" index="NN" label="…"&gt;.
  2. Append one entry below (id = the SectionShell id; number = "06"…).
  3. index.astro: import the panel + add one `record` line.
Sidebar stations, mobile menu and the page composition all follow.

<a id="src-env-d-ts"></a>

## src/env.d.ts

Source: [`apps/portfolio/src/env.d.ts`](../../apps/portfolio/src/env.d.ts).

<a id="src-env-d-ts-note-1"></a>

### Overview

Astro client type references.

WHY THIS FILE EXISTS: plain `tsc --noEmit` cannot resolve `.astro`
imports without it (e.g. src/icons/index.ts re-exporting every icon
component). `astro/client` provides the `declare module "*.astro"`
shim plus types for Astro.locals / import.meta.env. This is the
standard Astro scaffold file — tsconfig's `include: src/**` picks it
up automatically; zero runtime effect.

<a id="src-env-d-ts-note-2"></a>

### Additional note 2

Plain-tsc shim for `.astro` imports (e.g. src/icons/index.ts).
Astro 7 type-checks .astro via its language server (`astro check`), so
`astro/client` no longer declares the module — without this shim plain
`tsc --noEmit` reports TS2307 on every `.astro` import. Same shape the
language server injects: default export is the component factory.

<a id="src-lib-blog-ts"></a>

## src/lib/blog.ts

Source: [`apps/portfolio/src/lib/blog.ts`](../../apps/portfolio/src/lib/blog.ts).

<a id="src-lib-blog-ts-note-1"></a>

### Overview

The portfolio's blog posts, fetched from the blog's API AT
             BUILD TIME: GET &lt;BLOG_API_URL&gt;/api/featured?limit=3
             (apps/blog/functions/api/featured.ts — the blog's featured
             posts first, filled with its newest, always `limit` items).

WHY BUILD TIME (not in the browser): the portfolio is static — Writings,
the terminal's `blog` command and llms.txt are all rendered at build, so
the page ships no extra request, no loading state and no extra JS, and
the CSP needs no blog origin in connect-src. Freshness comes from the
blog's deploy workflow, which re-runs the portfolio deploy after every
blog deploy (.github/workflows/blog-deploy.yml) — a new or newly
featured post appears here about a minute after it's published.

ONE FETCH PER BUILD: the promise is cached at module level, so the three
consumers share a single request.

FAIL SOFT: if the API is unreachable (offline dev, blog outage) the build
still succeeds with an EMPTY list and a warning — Writings then shows a
plain "read the blog" state instead of fake posts. Placeholder posts were
removed from data/portfolio.ts on purpose: never ship invented content.

HOST: `BLOG_API_URL` env, default https://akiblog.pages.dev — the Pages
project's permanent hostname, valid before AND after blog.akibh.dev is
moved to it. The post `url`s themselves come from the blog
(https://blog.akibh.dev/&lt;slug&gt;/).

POC:
  const posts = await getBlogPosts();   // BlogPost[] (data/portfolio.ts)

<a id="src-lib-theme-ts"></a>

## src/lib/theme.ts

Source: [`apps/portfolio/src/lib/theme.ts`](../../apps/portfolio/src/lib/theme.ts).

<a id="src-lib-theme-ts-note-1"></a>

### Overview

Single typed source of truth for theme state.

WHY: Both &lt;ThemeSwitch&gt; (Base UI island) and the terminal's `theme`
command need identical apply/read/validate logic. Extracting it here
keeps one implementation, and the `isThemeMode` type guard gives
commands compile-time + runtime safety on user input.

MODES: dark / light ONLY (no "system"). Dark is the site default and
the fallback for missing or garbage stored values — including legacy
"system" entries written by previous versions, which now resolve to
dark. The choice persists in localStorage under the same "theme" key.

<a id="wrangler-toml"></a>

## wrangler.toml

Source: [`apps/portfolio/wrangler.toml`](../../apps/portfolio/wrangler.toml).

<a id="wrangler-toml-note-1"></a>

### Overview

Portfolio — Cloudflare Pages configuration (wrangler.toml)

POC / Implementation Architecture:

- Cloudflare Pages project "portfolio". `pages_build_output_dir` marks this
  as a Pages config, which makes this file the source of truth for the
  project's settings. `wrangler pages deploy` (see
  .github/workflows/portfolio-deploy.yml) uploads `dist` plus `functions/`.

- Static Astro build served from Pages' edge. Only functions/api/contact.ts
  runs code, and it forwards the contact form to the private `mailer` Worker
  over the MAILER service binding below. The mailer has no public URL, so
  the binding is the only way in.

- Top-level bindings apply to BOTH production and preview deployments.
- The custom domain (akibh.dev) is attached in the dashboard:
  Pages → portfolio → Custom domains. Pages configs have no `routes`.

- No secrets here; Turnstile's secret lives in the mailer only.

<a id="public-headers"></a>

## public/_headers

Source: [`apps/portfolio/public/_headers`](../../apps/portfolio/public/_headers).

<a id="public-headers-note-1"></a>

### Overview

Cloudflare Pages response headers (https://developers.cloudflare.com/pages/configuration/headers/)

WHY:

- /_astro/* files are content-hashed by Astro (name changes whenever the
  bytes change), and /fonts/* never change → cache for a year, immutable.
  Fixes Lighthouse "Use efficient cache lifetimes" for same-origin assets.

- Everything else (HTML, robots, llms.txt, CV) keeps Pages' default
  revalidation so a deploy shows up immediately.

- Security headers (Lighthouse best practices / securityheaders.com):
  nosniff, strict referrer, no framing, minimal permissions. HSTS is set
  at the zone level by Cloudflare (SSL/TLS → Edge Certificates).
  No CSP yet: Turnstile + Cloudflare Web Analytics + inline theme script
  need a hash/nonce-based policy — see the follow-up list.

<a id="public-headers-note-2"></a>

### Additional note 2

The page (HTML): Pages' default caching + `no-transform`, so the zone's
Bot Fight Mode doesn't inject Cloudflare "JavaScript detections" — an
inline per-request script our hashed &lt;meta&gt; CSP must block (Cloudflare
only nonces CSP *headers*), which logged a CSP error on every visit.
Same fix as apps/blog/public/_headers. Bot Fight Mode stays on.

<a id="public-robots-txt"></a>

## public/robots.txt

Source: [`apps/portfolio/public/robots.txt`](../../apps/portfolio/public/robots.txt).

<a id="public-robots-txt-note-1"></a>

### Overview

robots.txt — https://akibh.dev

POLICY (why it looks like this):

- Search engines: fully allowed. A portfolio exists to be found.
- AI *search / answer* agents (fetch a page when a person asks about it):
  allowed, so "who is Akib Hasan?" in ChatGPT / Claude / Perplexity can cite
  this site.

- AI *training* crawlers (bulk-collect content for model training):
  disallowed. They gain nothing for the visitor and can't link back.

- Content-Signal (Cloudflare's Content Signals Policy) is NOT used as a
  directive: Lighthouse/Google flag it as an unknown robots.txt rule
  (SEO audit fails). Our preference, for reference:
  Content-Signal: search=yes, ai-input=yes, ai-train=no

- LLM-friendly summary of the site: /llms.txt (https://llmstxt.org).

robots.txt is a request, not an enforcement. Hard blocking lives in the
Cloudflare dashboard (Security → Bots → "Block AI bots").

<a id="src-styles-global-css"></a>

## src/styles/global.css

Source: [`apps/portfolio/src/styles/global.css`](../../apps/portfolio/src/styles/global.css).

<a id="src-styles-global-css-note-1"></a>

### Overview

Delta.dev-accurate design system built on Tailwind CSS v4 primitives.

WHY THIS APPROACH (vs hardcoded hex + arbitrary values):

1. `@theme` registers design tokens as first-class Tailwind utilities
   (bg-canvas, text-default, border-subtle…) — the same pattern delta.dev
   uses for its `zds-*` classes. One token change re-skins everything.

2. `color-mix()` derives whole color scales from 3 base OKLCH colors —
   exactly how delta.dev generates its palette (verified from their CSS).

3. `@custom-variant dark` scopes dark mode to a `.dark` class so the
   anti-flash script + &lt;theme-switch&gt; element stay in full control.

4. Site geometry mirrors delta.dev's real layout contract
   (--site-inset / --site-max-width / --site-columns / rail height),
   including env(safe-area-inset-*) for notched devices.

<a id="src-styles-global-css-note-2"></a>

### Additional note 2

2. Semantic layer (light) — overridden in .dark

CONTRAST CONTRACT (WCAG AA 4.5:1 for the site's 9–12px mono text; values
found by sweeping each mix % in-browser and taking the smallest that
passes, so the palette moves as little as possible):
  text-muted  ≥4.6 on surface, canvas and surface-strong (both themes)
  text-accent ≥4.6 on surface, canvas and the accent-subtle wash
  white       ≥4.6 on accent-fill (btn-primary)

<a id="src-styles-global-css-note-3"></a>

### Additional note 3

SOLID brand faces that carry white text (btn-primary). Separate from
    --ui-accent because text-red and fill-red pull opposite ways: dark
    mode needs a LIGHTER red for text on dark surfaces but a DARKER red
    behind white text. Same in both themes (≥4.6:1 vs white).

<a id="src-styles-global-css-note-4"></a>

### Additional note 4

DARK LADDER — one cool-neutral lightness ramp, no brand tint:
  canvas (~L19) < surface (~L24) < surface-strong (~L31) < control-hover
  < border-subtle (~L34) < border (~L40).
Why: the old canvas (brand + 88% black ≈ L7, reddish) turned every
inset (Zed editor pane, active tab, commit nodes, theme pill) into a
near-black hole, and border/border-subtle sat within ~3-10 L of the
surface, so the sidebar git tree, section hairlines and IDE splits
vanished. Light mode keeps the same ORDER (canvas a step below
surface, hairlines clearly above), so components need no dark: rules.

<a id="src-styles-global-css-note-5"></a>

### Additional note 5

3. Site geometry — delta.dev's REAL chrome contract (plan13.md, verbatim
   from their live CSS; the old --site-column-gap/--site-accent-line
   "channel" tokens were inventions and are gone).

   ONE full background (--site-frame-background) carries independent chrome:
     • 2-track grid: [sidebar 1fr | content 4fr] — no gap track.
     • --site-section-inset → panels are inset from the column edge; the
       margin strips stay raw frame background and the "=" Seams hatch
       across them.
     • --site-rail-height → the 6px SEGMENTED rail ([3/8 brand, 2/8 gray,
       3/8 --delta-blue]) fixed atop the content track in the chrome
       layer; sections scroll beneath it (main pt-rail + md:border-r).

<a id="src-styles-global-css-note-6"></a>

### Additional note 6

ONE unified brand background (public/bg-pattern*.svg — circled-A +
    name micro-tile, rotated -45°): body and the fixed chrome cells
    (ViewportFrame's top/bottom rails + side gutters) share the SAME
    viewport-anchored layer via background-attachment: fixed, so the
    watermark is pixel-continuous across every chrome area — the old
    per-cell 45° hatch is gone. The SVG's internal &lt;pattern&gt; tiles at
    absolute units (identical scale everywhere); attachment:fixed aligns
    the origin and keeps the watermark still while content scrolls.
    Sections stay opaque bg-surface on top. iOS Safari degrades to
    element-local attachment — same scale, possible phase shift.

<a id="src-styles-global-css-note-7"></a>

### Additional note 7

Page scrollbar in the brand red (--ui-accent, theme-aware). Two
    mechanisms because browsers split: the standard `scrollbar-color`
    on the root covers Firefox; the ::-webkit-* rules keep the slim
    6px rounded thumb in Chromium/Safari. Only the ROOT gets
    scrollbar-color — in Chromium it overrides ::-webkit-* on the same
    element, which would drop the 6px width elsewhere. Inner scrollers
    (Zed IDE) keep their own `zed-scroll` neutral thumb.

<a id="src-styles-global-css-note-8"></a>

### Additional note 8

IDE-frame scrollbar (projects Zed workspace): thicker (10px) and
  rectangular — the rounded 6px site scrollbar stays for the rest of the
  page. The thumb is TRANSPARENT until the container scrolls: the
  useScrollbarVisibility hook sets `data-scrolling` during scroll, and
  only then does the thumb paint (mirrors Zed/macOS overlay scrollbars).

<a id="src-styles-global-css-note-9"></a>

### Additional note 9

DEFAULT BUTTON BEHAVIOUR — one look for every secondary button
(sidebar stations, "View all posts", Copy…).

  static : hairline border on a light face + 1px bottom "lip" shadow
  hover  : border turns brand, face gets a LOW-OPACITY brand wash
           (--ui-accent-subtle) and a soft 3px brand halo ring outside
           the border — the "drawn rectangle" now also glows faintly.

WHY @utility (not a component class): variants compose, so the hover
look can be triggered from a parent too — `group-hover:btn-hover` on
the sidebar label, plain `btn` on standalone buttons. Colors come only
from theme tokens, so dark mode needs no extra rules. Box-shadow ring
(not outline/border) so the halo never shifts layout.

<a id="src-styles-global-css-note-10"></a>

### Additional note 10

SECONDARY button (Copy, View all posts…).
  cursor: pointer is explicit because Tailwind v4's preflight resets
  &lt;button&gt; to `cursor: default` — links got the hand cursor from the UA,
  real &lt;button&gt;s didn't (the "hover feels dead" bug on Copy/Send).

<a id="src-components-islands-copybutton-astro"></a>

## src/components/islands/CopyButton.astro

Source: [`apps/portfolio/src/components/islands/CopyButton.astro`](../../apps/portfolio/src/components/islands/CopyButton.astro).

<a id="src-components-islands-copybutton-astro-note-1"></a>

### Overview

Clipboard button with transient feedback — PURE ASTRO port
             of CopyButton.tsx (plan 17 §3 Phase 5). Same markup,
             classes, labels and timing.

BEHAVIOUR (unchanged): click → navigator.clipboard.writeText(text).
Success shows "Copied!" with the hover look held (`data-ok=true` →
btn-hover + accent text); failure shows "Failed". Either way it reverts
to "Copy" 2s after the LAST click (a new click restarts the timer).

WHY A CUSTOM ELEMENT: no framework runtime for one button (the React
version pulled in react + react-dom + the island hydrator, ~200KB,
and only became interactive after `client:visible` hydration). The
button now works the moment the page is parsed. Text to copy rides in
a data attribute, so several instances can coexist.

POC:  &lt;CopyButton text="hello@akibh.dev" /&gt;

<a id="src-components-islands-mobilemenu-astro"></a>

## src/components/islands/MobileMenu.astro

Source: [`apps/portfolio/src/components/islands/MobileMenu.astro`](../../apps/portfolio/src/components/islands/MobileMenu.astro).

<a id="src-components-islands-mobilemenu-astro-note-1"></a>

### Overview

Mobile navigation sheet — PURE ASTRO, native &lt;dialog&gt;.
             Replaces MobileMenu.tsx (Base UI Dialog) per plan 17 §3
             Phase 5 ("MobileMenu via &lt;dialog&gt;").

WHY NATIVE &lt;dialog&gt; + showModal() (POC / rationale):

1. Everything Base UI gave us is now built into the platform: top-layer
   rendering (no portal, no z-index fights with the fixed site frame),
   focus moved in and trapped, Esc closes, the rest of the page becomes
   inert, and focus returns to the trigger on close. Zero JS shipped
   for any of that; the script below only opens, closes and handles
   clicks on the backdrop.

2. It fixes the old React drawer's mobile bugs: Base UI's scroll lock
   shifted the page under the popup, so on phones the sheet opened
   partly above the viewport (01. Home cut off) and the blurred
   backdrop stopped short of the bottom. A top-layer dialog is
   positioned against the viewport itself, and scroll is locked with
   one `html:has(dialog[open])` rule — the page never moves.

3. The sheet REPLACES the header while open (same inset, same height
   brand row) and carries its own Close button, so the trigger and the
   close control sit at the same spot — thumbs don't travel.

4. Links sit inside &lt;scroll-spy&gt; (islands/ScrollSpy.astro), so the
   section currently on screen is marked aria-current and styled as
   the active station — same rule as the desktop sidebar, no new JS.

5. Resume + socials are only in the desktop sidebar, which is hidden
   below md. They're repeated here so mobile visitors can reach them.

6. Theme switch is the shared ThemeSwitch.astro element (same one as
   the sidebar; all instances stay in sync).

POC:
  &lt;MobileMenu /&gt;  — drop into MobileHeader; renders trigger + dialog.

<a id="src-components-islands-scrollspy-astro"></a>

## src/components/islands/ScrollSpy.astro

Source: [`apps/portfolio/src/components/islands/ScrollSpy.astro`](../../apps/portfolio/src/components/islands/ScrollSpy.astro).

<a id="src-components-islands-scrollspy-astro-note-1"></a>

### Overview

Highlights the sidebar nav link matching the visible section,
and drives the sidebar's "hop connector".

WHY: State is exposed via the standard `aria-current` attribute instead of
ad-hoc classes, so ALL styling stays in CSS ([aria-current] selectors).
One IntersectionObserver for the whole page; zero reflows while scrolling.

HOP CONNECTOR ([data-station-link]): the accent line exists ONLY
while transitioning between stations — never a persistent fill and
nothing red at rest. On every activation change we span the segment
from the previously active node to the current one (measured live via
getBoundingClientRect relative to the positioned wrapper, so it stays
correct across font loading, zoom and resize); the CSS transition on
top/height makes it GROW out of the source node toward the
destination. Once the hop lands (one transition duration later), we
collapse the segment into the destination node — the tail catches up
and the line disappears underneath the node's opaque fill. Rapid
successive hops simply retarget the segment (the pending collapse is
cancelled), so the line stays visible while you keep scrolling and
vanishes ~0.5s after you settle. The first activation collapses to a
zero-length segment at the current node, so nothing is painted before
the first hop. Purely additive: usages without [data-station-link]
behave exactly as before.

<a id="src-components-islands-themeswitch-astro"></a>

## src/components/islands/ThemeSwitch.astro

Source: [`apps/portfolio/src/components/islands/ThemeSwitch.astro`](../../apps/portfolio/src/components/islands/ThemeSwitch.astro).

<a id="src-components-islands-themeswitch-astro-note-1"></a>

### Overview

Segmented Light / Dark theme control — dark is the default.
             PURE ASTRO port of ThemeSwitch.tsx (Base UI ToggleGroup),
             plan 17 §3 Phase 5. Same markup, classes and behaviour.

BEHAVIOUR KEPT 1:1 FROM BASE UI (WAI-ARIA toolbar/toggle-group pattern):

- role="group" + aria-label, each option a &lt;button aria-pressed&gt;.
- ONE tab stop (roving tabindex); ArrowLeft/ArrowRight move focus and
  loop at the ends (Base UI `loopFocus`), Home/End jump to first/last.
  Arrows only MOVE focus; Enter/Space (native button click) selects.

- Exactly one option stays pressed: clicking the pressed one is a
  no-op (the React version blocked "unselect all" the same way).

- Nothing is pressed in the server HTML (SSR can't read localStorage,
  so a hardcoded state would flash the WRONG option). The anti-flash
  script has already set &lt;html class&gt;, and the element syncs as soon as
  its module runs — earlier than the React island, which waited for
  hydration — so at worst a brief neutral state, never a wrong one.

NEW (the React version couldn't): every switch on the page (sidebar +
mobile menu) and the terminal's `theme` command stay in sync. The
pressed state is derived from &lt;html class="dark"&gt; via one
MutationObserver, so whoever calls applyTheme(), every switch follows.

WHY A CUSTOM ELEMENT: state + listeners are scoped per instance and
set up in connectedCallback; the class is defined once per page no
matter how many switches render. Logic stays in lib/theme.ts (shared
with the terminal).

POC:  &lt;ThemeSwitch /&gt;

<a id="src-components-islands-projects-projectsisland-astro"></a>

## src/components/islands/projects/ProjectsIsland.astro

Source: [`apps/portfolio/src/components/islands/projects/ProjectsIsland.astro`](../../apps/portfolio/src/components/islands/projects/ProjectsIsland.astro).

<a id="src-components-islands-projects-projectsisland-astro-note-1"></a>

### Overview

Zed-editor workspace — full chrome, PURE ASTRO edition.
             Replaces ProjectWorkspace.tsx (plan 18).

POC / FRAME STRUCTURE (user-directed, top to bottom — unchanged):
  TitleBar   — traffic lights + window title
  MenuBar    — zed file edit … help + user avatar menu
  Grid       — left sidebar (project panel) | right section
    Right rows (hidden when no buffer is open): TabBar, Breadcrumbs,
    Preview (README pane or the "no editor" empty state)
  StatusBar  — panel/git/diagnostics left · agent/term/encoding right

POC / WHY PRE-RENDER + CONTROLLER (the migration's core decision):
the state space is enumerable (N files), so EVERY dynamic surface is
rendered at build time — all tabs, all README panels, all breadcrumb
navs, all minimaps, the empty state — and controller.ts only toggles
hidden / classes / aria-* via the data-* contract (plan 18). No
framework runtime, no hydration, no runtime data, and SSR output is
the exact initial editor state (first file open + focused).

POC / FULL-BLEED FRAME: the section (Projects.astro) supplies zero
padding and no header, so the editor chrome spans the entire panel —
the island itself carries NO outer padding and NO window border of
its own (a rounded border here would double up against the channel's
border-x side lines). The section's own panel lines + the Seam bands
become the IDE window's outer frame.

STATE MODEL (mirrors a real editor — controller.ts):
openTabs (open buffers, append on open, × removes) · activeTab ·
bounded history deque (8) · sidebar visibility (panel stays MOUNTED) ·
folder collapse cascade · tree tablist + avatar menu ARIA.

<a id="src-components-islands-projects-chrome-breadcrumbs-astro"></a>

## src/components/islands/projects/chrome/Breadcrumbs.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/Breadcrumbs.astro`](../../apps/portfolio/src/components/islands/projects/chrome/Breadcrumbs.astro).

<a id="src-components-islands-projects-chrome-breadcrumbs-astro-note-1"></a>

### Overview

Breadcrumb fixed row — Astro port of EditorBreadcrumbs.tsx.

POC / PRE-RENDERED PER FILE: the React version derived the path from
the active file at render time; here ONE nav per file is rendered at
build time (`data-crumbs`), and controller.ts shows exactly the active
one (all hidden when no buffer is open). Segments stay intentionally
NON-links (read-only workspace metaphor); the file segment is
emphasized like Zed does.

<a id="src-components-islands-projects-chrome-chromebutton-astro"></a>

## src/components/islands/projects/chrome/ChromeButton.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/ChromeButton.astro`](../../apps/portfolio/src/components/islands/projects/chrome/ChromeButton.astro).

<a id="src-components-islands-projects-chrome-chromebutton-astro-note-1"></a>

### Overview

Shared icon button for the editor chrome — Astro port of
             ChromeButton.tsx, markup byte-for-byte.

POC / STATES: actionless BY DEFAULT; two real states exist for wired
buttons — `disabled` (history arrows: dimmed, non-interactive) and
`pressed` (sidebar toggle: aria-pressed + persistent active fill).
BOX: `size-6` (24px — WCAG 2.2 minimum target size; was 20px and
failed Lighthouse target-size) + leading-none — identical to the
status bar's text-item height, so icons and text sit on one center line in every chrome row.

RESPONSIVE HIDING: a caller may pass `hidden md:inline-flex`. The base
`inline-flex` is then DROPPED — two display utilities on one node
resolve by stylesheet order, not class order, and `inline-flex` won,
so "desktop-only" icons leaked into the 390px status bar.

WIRING: no on* props in Astro — interactivity comes from controller.ts
via data-* hooks passed through `{...rest}`.

<a id="src-components-islands-projects-chrome-menubar-astro"></a>

## src/components/islands/projects/chrome/MenuBar.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/MenuBar.astro`](../../apps/portfolio/src/components/islands/projects/chrome/MenuBar.astro).

<a id="src-components-islands-projects-chrome-menubar-astro-note-1"></a>

### Overview

Application menu bar — "Zed File Edit Selection Go Run
             Window Help" + user avatar with a working dropdown
             (Settings / Keymap / Themes / Icon Themes / Extensions /
             Sign Out). Astro port of EditorMenuBar.tsx.

POC / WHY ONLY THE AVATAR MENU WORKS: per user direction, the text
menus are hover-only chrome; ONLY the avatar opens a real menu, and
its items are actionless (functionality decided later). The React
version used Base UI's Menu + Portal; here controller.ts implements
the WAI-ARIA menu-button pattern (↓/↑ cycle, Home/End, typeahead,
Esc + focus return, outside-pointerdown close).

WHY NO PORTAL: Base UI's Portal only existed to escape the frame's
overflow-hidden — but the popup opens DOWNWARD into the frame's
interior, so absolute positioning inside a `relative` wrapper in the
bar is never clipped. z-50 keeps it above the preview pane.

AVATAR: real photo (src/assets/my-pic.png via astro:assets &lt;Image&gt;,
resized to 48px WebP at build — a 24px circle at 2× DPR — instead of
shipping the full portrait) layered over the "AH" initials —
alt="" because the button's aria-label already names it — a non-empty
alt became visible text missing from the name (label-content-name-
mismatch). controller.ts hides the img on error (with a pre-check for errors that
fired before the module ran), leaving the initials as the fallback.

RESPONSIVE: menus from "selection" onward hide below sm.

<a id="src-components-islands-projects-chrome-minimap-astro"></a>

## src/components/islands/projects/chrome/Minimap.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/Minimap.astro`](../../apps/portfolio/src/components/islands/projects/chrome/Minimap.astro).

<a id="src-components-islands-projects-chrome-minimap-astro-note-1"></a>

### Overview

Decorative minimap — a right-edge strip of tiny colored
             bars representing the README's shape, like Zed/VS Code's
             code minimap. Astro port of PreviewMinimap.tsx.

POC / WHY DERIVED FROM DATA (unchanged): every bar is computed
deterministically from the project's real fields — each file's minimap
has a distinct "document fingerprint", zero runtime measurement. One
minimap per file is PRE-RENDERED; controller.ts toggles `hidden`.
Runs entirely in the frontmatter at BUILD time.

Purely decorative: aria-hidden, pointer-events-none, hidden below lg.
Rendered OUTSIDE the scroll container (absolute in the preview
wrapper) so it stays pinned to the right edge while content scrolls.

<a id="src-components-islands-projects-chrome-projectpanel-astro"></a>

## src/components/islands/projects/chrome/ProjectPanel.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/ProjectPanel.astro`](../../apps/portfolio/src/components/islands/projects/chrome/ProjectPanel.astro).

<a id="src-components-islands-projects-chrome-projectpanel-astro-note-1"></a>

### Overview

Zed project panel: collapsible workspace roots
             (akibh → projects), collapsible group folders
             (featured/ archive/), file rows (= tabs), repo footer.
             Astro port of ProjectPanel.tsx.

POC / KEY DECISIONS (unchanged from the React version):

1. ONE tablist contains every file row — controller.ts implements the
   roving-tabindex arrow-key navigation across folders (Base UI's role
   in the React version). Folder headers are aria-hidden rows whose
   &lt;button&gt;s carry tabindex="-1": a tablist may only own role="tab"
   children (axe aria-required-children / Lighthouse a11y), so folder
   collapse stays a pointer-only visual affordance while every file
   remains reachable as a tab by keyboard and screen reader.

2. Selection is a FULL-ROW FILL (aria-selected:* variants), not a left
   accent bar — the accent bar is VS Code's language; Zed fills the row.

3. EVERY directory collapses with correct nesting: closing `akibh`
   hides `projects`; closing `projects` hides the group folders;
   closing a group hides only its files. ALL load EXPANDED.
   data-folder-row / data-folder-content are the controller's cascade
   hooks; `hidden max-lg:contents` keeps the mobile folder-less strip
   showing every file.

4. Git-status dot maps status → editor language: active/wip =
   "uncommitted changes", shipped = clean tree (no dot).

5. The sidebar toggles from the status bar but stays MOUNTED
   (data-sidebar) so folder open-state survives.

<a id="src-components-islands-projects-chrome-projectpanel-astro-note-2"></a>

### Additional note 2

Mobile: horizontal chip in a scroll strip (bordered, rounded).
Desktop (lg): full-width tree row with file indent, no chrome.
`relative` anchors the indent-guide rail; `title` gives the full file
name on truncated rows.

<a id="src-components-islands-projects-chrome-readmepanel-astro"></a>

## src/components/islands/projects/chrome/ReadmePanel.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/ReadmePanel.astro`](../../apps/portfolio/src/components/islands/projects/chrome/ReadmePanel.astro).

<a id="src-components-islands-projects-chrome-readmepanel-astro-note-1"></a>

### Overview

One project rendered as its README.md preview — Astro port
             of ReadmePreview.tsx + the Tabs.Panel wrapper.

POC / PRE-RENDERED: ProjectsIsland renders ONE of these per file at
build time; controller.ts toggles `hidden` so exactly the active
buffer's panel shows. `data-lines` carries the fake line count the
status bar's position item displays (14 + highlights×2 + stack — the
React version's formula), so the controller needs zero project data.

ELEMENT: a &lt;div role="tabpanel"&gt;, not &lt;article&gt; — ARIA forbids the
tabpanel role on &lt;article&gt; (axe aria-allowed-role).

HEADINGS: the page has ONE &lt;h1&gt; (the hero name). The README title is an
&lt;h3&gt; under Projects' sr-only &lt;h2&gt;, its sections &lt;h4&gt; — the look is the
same (classes, not tag, set the size); the outline stays valid.

LAYOUT (unchanged): title (site display serif — Zed's markdown preview
swaps buffer font for UI font), shields-style badge row, &lt;hr&gt;, then
mono-eyebrow sections (Overview / Highlights / Stack) + links footer.

<a id="src-components-islands-projects-chrome-statusbar-astro"></a>

## src/components/islands/projects/chrome/StatusBar.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/StatusBar.astro`](../../apps/portfolio/src/components/islands/projects/chrome/StatusBar.astro).

<a id="src-components-islands-projects-chrome-statusbar-astro-note-1"></a>

### Overview

Bottom status bar — full Zed chrome. Astro port of
             EditorStatusBar.tsx, layout unchanged:
  LEFT:  toggle sidebar (WIRED) · git branch icon(+dirty dot) · collab ·
         outline · project search · language servers · diagnostics
  RIGHT: position (25:1) · LF · Markdown · UTF-8 · copilot · debug ·
         terminal · agent · threads

POC / PRE-RENDERED DYNAMICS: the file-dependent group (data-status-file)
is hidden by controller.ts when no buffer is open; the line count
(data-status-lines) is seeded with the FIRST file's count at build time
and updated from each panel's data-lines on buffer switch; the branch
dirty dot (data-branch-dirty) reflects open tabs' data-dirty.

POC / TEXT SIZING (the browser min-font saga — UNCHANGED): ALL text
sizing is INLINE (font-size: 9px) — no CSS pipeline can drop it and it
always wins over class rules. NOTE: no CSS can beat a browser-level
minimum font size — 9px + tracking-tight is the chosen floor.

<a id="src-components-islands-projects-chrome-statusbar-astro-note-2"></a>

### Additional note 2

Shared base for all text buttons — same box as ChromeButton (h-6, the
 24px WCAG 2.2 minimum target).
 Carries NO display utility: always-visible items add `inline-flex`,
 responsive ones add `hidden sm:inline-flex` (one display class per
 breakpoint, so `hidden` actually hides on mobile).

<a id="src-components-islands-projects-chrome-tabbar-astro"></a>

## src/components/islands/projects/chrome/TabBar.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/TabBar.astro`](../../apps/portfolio/src/components/islands/projects/chrome/TabBar.astro).

<a id="src-components-islands-projects-chrome-tabbar-astro-note-1"></a>

### Overview

Multi-buffer tab bar — the "file name" fixed row.
             Astro port of EditorTabs.tsx.

POC / LAYOUT (unchanged): [←] [→] | [tab] [tab] … | [+] [split] [full]

- Every open buffer gets a tab — ALL files' tabs are PRE-RENDERED at
  build time; controller.ts toggles `hidden` + active classes as
  buffers open/close (zero runtime data).

- History arrows are WIRED (data-back / data-forward), disabled at the
  deque's bounds — initially disabled (one entry).

- data-dirty marks tabs whose status is "uncommitted"; the controller
  aggregates it over OPEN tabs for the status-bar branch dot.

- The row itself is hidden when no buffer is open (data-tabbar).

WHY STILL PLAIN BUTTONS (not a tablist): the tree owns the tablist
semantics; this bar is a second VIEW onto the same state — two
competing tablists controlling the same panels would confuse AT.

<a id="src-components-islands-projects-chrome-titlebar-astro"></a>

## src/components/islands/projects/chrome/TitleBar.astro

Source: [`apps/portfolio/src/components/islands/projects/chrome/TitleBar.astro`](../../apps/portfolio/src/components/islands/projects/chrome/TitleBar.astro).

<a id="src-components-islands-projects-chrome-titlebar-astro-note-1"></a>

### Overview

Window chrome — macOS traffic lights + centered workspace
             title. Astro port of EditorTitleBar.tsx, verbatim.

WHY: deliberately the same chrome language as the hero Terminal, so
the two "apps" on the page read as windows from the same OS. Purely
decorative; the title text is the only meaningful content.

<a id="src-components-islands-projects-controller-ts"></a>

## src/components/islands/projects/controller.ts

Source: [`apps/portfolio/src/components/islands/projects/controller.ts`](../../apps/portfolio/src/components/islands/projects/controller.ts).

<a id="src-components-islands-projects-controller-ts-note-1"></a>

### Overview

State machine + ARIA for the pre-rendered Zed workspace —
             replaces ProjectWorkspace.tsx's React state and Base UI's
             Tabs/Menu behaviors (plan 18).

POC / WHY PRE-RENDER + TOGGLE: the island's state space is enumerable
(N files), so ProjectsIsland.astro renders EVERY state at build time;
this controller only toggles hidden / classes / aria-*. No runtime
data, no JSON island, no re-render layer — one render() pass per
interaction. All class names appear LITERALLY in this file or the
markup (never concatenated) so Tailwind v4 sees them.

ARIA PARITY (replaces Base UI, per WAI-ARIA APG):

- Tree files: tablist semantics — roving tabindex, ↑/↓ (and ←/→) move
  focus AND activate (Base UI activateOnFocus default), Home/End jump.
  Keys are handled only when a FILE TAB has focus (folder buttons are
  not tabs — Base UI's composite skipped them too).

- Avatar menu: click toggle · ↓/↑ cycle · Home/End · typeahead (500ms
  buffer) · Enter/Space activates (actionless → close) · Esc closes +
  returns focus to trigger · outside pointerdown closes · Tab closes.

BEHAVIOR PARITY with the React version: open-activate-close semantics,
bounded history deque (8), neighbor fallback on close, scroll-reset on
buffer switch, panel stays MOUNTED on sidebar toggle (folder state
survives), Ctrl-free actionless chrome stays actionless.

<a id="src-components-islands-projects-dummy-ts"></a>

## src/components/islands/projects/dummy.ts

Source: [`apps/portfolio/src/components/islands/projects/dummy.ts`](../../apps/portfolio/src/components/islands/projects/dummy.ts).

<a id="src-components-islands-projects-dummy-ts-note-1"></a>

### Overview

TODO(data): placeholder README "Highlights" bullets, keyed
             by project title.

WHY A SEPARATE FILE (and not inline in the renderer): dummy content
should be trivially deletable. Once real `highlights` land on the
project objects in data/portfolio.ts, delete this file and collapse
`getHighlights` to `p.highlights ?? []` at its two call sites
(ReadmePreview, EditorStatusBar). Nothing else changes.

<a id="src-components-islands-projects-scrollbars-ts"></a>

## src/components/islands/projects/scrollbars.ts

Source: [`apps/portfolio/src/components/islands/projects/scrollbars.ts`](../../apps/portfolio/src/components/islands/projects/scrollbars.ts).

<a id="src-components-islands-projects-scrollbars-ts-note-1"></a>

### Overview

Vanilla port of useScrollbarVisibility.ts — identical
             behavior: set `data-scrolling` on scroll, remove it 700ms
             after the last event; the `zed-scroll` utility paints the
             thumb only while the attribute is present.

WHY A FUNCTION (not a hook): the island no longer re-renders — the
listener attaches once at mount. Passive listener + timeout = zero
layout work per event, same as the React version.

<a id="src-components-islands-projects-types-ts"></a>

## src/components/islands/projects/types.ts

Source: [`apps/portfolio/src/components/islands/projects/types.ts`](../../apps/portfolio/src/components/islands/projects/types.ts).

<a id="src-components-islands-projects-types-ts-note-1"></a>

### Overview

Shared types + pure mapping helpers for the Zed-workspace
             project browser.

POC / WHY THIS FILE EXISTS:
The workspace renders each project as a *file* in a fake filesystem.
That mapping (title → slug → file name → tree group) is pure data
transformation, so it lives here as testable functions instead of being
scattered across components. `STATUS_META` is the single source of truth
for how a project status translates to editor signals (tab dirty dot,
tree git dot, README badge) — one data field, three UI signals, never
derived twice.

<a id="src-components-islands-terminal-terminal-astro"></a>

## src/components/islands/terminal/Terminal.astro

Source: [`apps/portfolio/src/components/islands/terminal/Terminal.astro`](../../apps/portfolio/src/components/islands/terminal/Terminal.astro).

<a id="src-components-islands-terminal-terminal-astro-note-1"></a>

### Overview

Interactive portfolio shell — pure Astro edition.

POC / ARCHITECTURE (React → Astro migration, plan 17 Phase 1):

- The frame, boot scrollback and input row render on the SERVER — the
  initial HTML is identical to what the React version SSR'd, with zero
  hydration. The processed &lt;script&gt; below (TS, bundled, deduped per
  Astro's script rules) mounts shell.ts for interactivity.

- Boot segments mirror render.ts's href branch (not just plain spans)
  so a future link in boot text survives SSR; TONE_CLASS/LINK_CLASS are
  imported from render.ts so SSR and client output can never drift.

- The input keeps autocorrect="off" (mobile Safari would otherwise
  "fix" commands) — parity with the React version.

- No client:* directive, no framework runtime, no JSON data island —
  shell.ts imports portfolioData directly (same module as the prop).

- `flush` prop: drops the floating-window frame (border, radius, shadow)
  so the terminal can BE a panel's full content, framed only by the
  section's own hairlines — the Projects-IDE contract (sections/About).
  Default stays the standalone window, so other usages are unchanged.

<a id="src-components-islands-terminal-boot-ts"></a>

## src/components/islands/terminal/boot.ts

Source: [`apps/portfolio/src/components/islands/terminal/boot.ts`](../../apps/portfolio/src/components/islands/terminal/boot.ts).

<a id="src-components-islands-terminal-boot-ts-note-1"></a>

### Overview

Static boot scrollback — moved verbatim out of Terminal.tsx
             during the React → pure-Astro migration.

WHY A SEPARATE MODULE: both renderers need it — Terminal.astro prints
the boot text on the SERVER (zero JS), and shell.ts re-runs it on the
client when `clear`/Ctrl+L resets the session. One function, two
runtimes, guaranteed identical output.

`nextId` is vestigial (ids existed for React keys; the DOM renderer
never reads them) but kept so types.ts stays untouched.

<a id="src-components-islands-terminal-commands-ts"></a>

## src/components/islands/terminal/commands.ts

Source: [`apps/portfolio/src/components/islands/terminal/commands.ts`](../../apps/portfolio/src/components/islands/terminal/commands.ts).

<a id="src-components-islands-terminal-commands-ts-note-1"></a>

### Overview

The shell's command set — pure functions over CommandContext.

Every command is data-driven (nothing hardcoded that lives in
portfolio.ts), and user input is validated with type guards before use
(see `theme`). `clear` is registered here so `help` + completion know
it exists, but its execution is intercepted by Terminal.tsx — the shell
owns scrollback state, commands stay pure.

<a id="src-components-islands-terminal-dsl-ts"></a>

## src/components/islands/terminal/dsl.ts

Source: [`apps/portfolio/src/components/islands/terminal/dsl.ts`](../../apps/portfolio/src/components/islands/terminal/dsl.ts).

<a id="src-components-islands-terminal-dsl-ts-note-1"></a>

### Overview

Tiny typed builder DSL for terminal output.

Commands read declaratively because of these:
  [t("status: ", "muted"), t("online", "success")]
  kv("email", link("hello@akibh.dev", "mailto:…"))

<a id="src-components-islands-terminal-registry-ts"></a>

## src/components/islands/terminal/registry.ts

Source: [`apps/portfolio/src/components/islands/terminal/registry.ts`](../../apps/portfolio/src/components/islands/terminal/registry.ts).

<a id="src-components-islands-terminal-registry-ts-note-1"></a>

### Overview

Command lookup + completion over the command list.

A Map keyed by every name AND alias gives O(1) lookup; completion
operates over the de-duplicated key set.

<a id="src-components-islands-terminal-render-ts"></a>

## src/components/islands/terminal/render.ts

Source: [`apps/portfolio/src/components/islands/terminal/render.ts`](../../apps/portfolio/src/components/islands/terminal/render.ts).

<a id="src-components-islands-terminal-render-ts-note-1"></a>

### Overview

DOM renderer for terminal entries — replaces the React
             JSX rendering (Prompt / SegmentView / entries.map).

POC / WHY textContent-ONLY RENDERING: command output is data, not
markup. Building nodes with `textContent` (never innerHTML) makes HTML
injection structurally impossible — the same guarantee JSX gave us,
kept after the migration.

TONE_CLASS / LINK_CLASS are exported so Terminal.astro's server-side
boot render uses the IDENTICAL class strings (single source of truth
between SSR and the client renderer).

<a id="src-components-islands-terminal-shell-ts"></a>

## src/components/islands/terminal/shell.ts

Source: [`apps/portfolio/src/components/islands/terminal/shell.ts`](../../apps/portfolio/src/components/islands/terminal/shell.ts).

<a id="src-components-islands-terminal-shell-ts-note-1"></a>

### Overview

The shell's stateful core — replaces Terminal.tsx's React
             state (scrollback, input draft, history pointer) with a
             vanilla mount function.

POC / WHY DIRECT DATA IMPORT (not a JSON script island): the terminal
is single-purpose — Hero always passes `portfolioData`, and
`PortfolioData = typeof portfolioData` (types.ts) makes the import
type-identical to the prop. Importing here skips HTML-embedded JSON,
the \u003c escaping dance and the runtime parse. SSR (Terminal.astro)
still renders boot from the prop; both read the same module, so they
cannot diverge.

KEYBOARD CONTRACT (unchanged): Enter run · ↑/↓ history (draft restore)
· Tab complete · Ctrl+L clear · Ctrl+C abort line.

DOCUMENTED DEVIATION from the React version: Ctrl+C now also resets
the draft (the React version left draftRef stale, so ↑→Ctrl+C→↓ could
resurrect pre-abort text). Resetting is the saner fresh-line semantic.

<a id="src-components-islands-terminal-types-ts"></a>

## src/components/islands/terminal/types.ts

Source: [`apps/portfolio/src/components/islands/terminal/types.ts`](../../apps/portfolio/src/components/islands/terminal/types.ts).

<a id="src-components-islands-terminal-types-ts-note-1"></a>

### Overview

The terminal's typed contract.

Model: a terminal renders a history of entries. Each entry is one line
of styled segments (or an empty segment list = blank line). Commands
are pure functions: context in, lines out. No command touches React
state directly — the shell owns all side effects except theme.

<a id="src-components-layout-brandlogo-astro"></a>

## src/components/layout/BrandLogo.astro

Source: [`apps/portfolio/src/components/layout/BrandLogo.astro`](../../apps/portfolio/src/components/layout/BrandLogo.astro).

<a id="src-components-layout-brandlogo-astro-note-1"></a>

### Overview

Animated Paint-Fill "A" brand logo — light + dark variants.

SOURCE (reproduced 1:1):
  - assets/Paint-Fill A-html--white/Main.dc.html  → light variant
  - assets/Paint-Fill A — Dark-html/Dark.dc.html  → dark variant
The SVG and its pure-CSS keyframe choreography are lifted EXACTLY from
those exports: same viewBox="0 0 600 600", same path data, same colors,
same stroke-width="4" outline, same timings — a 1s pop intro, then five
rainbow paint layers sweep left→right across the clipped glyph,
staggered 140ms apart starting at t=1s; the final layer (BLACK in the
light variant, WHITE in the dark one) lands at t=1.7s; the rainbow
group fades at t=3.35s, leaving the monochrome A. The dark variant's
outline additionally cross-fades #737373 → #FFFFFF in sync with the
final layer. The exports' react.js/support.js are only the design
tool's preview-page boilerplate — the animation needs no JavaScript,
so this component ships zero JS and plays on first paint.

WHY TWO SVGs (not one recolored): the variants are NOT recolors of
each other — light starts as a WHITE A and fills BLACK under a
constant black outline; dark starts as a zinc-900 (#18181B) A, fills
WHITE, and its outline animates gray→white. Both variants are inlined
and swapped with Tailwind's `dark:` variant (.dark is set on &lt;html&gt;
before first paint → no flash of the wrong logo). Deliberate side
effect: display:none pauses CSS animations, so every theme toggle
REPLAYS the full intro + paint sweep on the newly shown variant.

WHY NO WRAPPER BOX: an earlier iteration sat the logo inside the
sidebar's bordered rounded-md chip, but the chrome rectangle fights
the artwork — the source A is designed to float directly on the page
(its preview stages are plain #E7E4DD / #09090B fields). Here it
floats on the site's own canvas the same way.

NECESSARY DEVIATIONS FROM SOURCE (invisible — required for embedding):
 1. Class names, keyframe names and clipPath ids are prefixed
    (logo-a-*): both variants live in ONE document, so the source's
    bare names (.pop, .l0–.l5, .colors, .ol, #aClip, intro/sweep/gone/ol)
    would collide with each other and could collide with site CSS.
 2. The fixed width="560" height="560" attributes become class-driven
    sizing via the `class` prop — the viewBox is unchanged, so the
    artwork scales losslessly to any size.
 3. The preview background divs (#E7E4DD / #09090B) are dropped — see
    WHY NO WRAPPER BOX above.
 4. role="img" + aria-label become aria-hidden — the logo renders
    inside a link whose adjacent text already names the site.
 5. clipPath ids also carry a per-INSTANCE suffix (logo-a-clip-dark-x7k2q9).
    With one shared id, url(#…) resolves to the FIRST match in the
    document; once the mobile header (display:none on desktop) rendered
    a logo before the sidebar's, every logo pointed at that hidden
    clipPath, the clip failed and the desktop A became a white square.

Reduced motion: jumps straight to the final filled A (rainbow hidden,
last layer parked at its end position, dark outline already white) —
the same end state the source's own reduced-motion block produces.

<a id="src-components-layout-brandlogo-astro-note-2"></a>

### Additional note 2

Choreography timings lifted 1:1 from the source exports; names are
    prefixed logo-a-* because both variants share one document (Astro
    additionally hash-scopes the keyframes, so collisions are impossible).
    Sequence: pop (0–1s) → five staggered rainbow sweeps (1–3.3s) → final
    monochrome layer (from 1.7s) → rainbow fades at 3.35s.

<a id="src-components-layout-mobileheader-astro"></a>

## src/components/layout/MobileHeader.astro

Source: [`apps/portfolio/src/components/layout/MobileHeader.astro`](../../apps/portfolio/src/components/layout/MobileHeader.astro).

<a id="src-components-layout-mobileheader-astro-note-1"></a>

### Overview

Mobile top bar (below md); navigation lives in the
             MobileMenu island (pure Astro, native &lt;dialog&gt; — focus trap,
             Esc, backdrop dismiss come from the platform).

<a id="src-components-layout-sitesidebar-astro"></a>

## src/components/layout/SiteSidebar.astro

Source: [`apps/portfolio/src/components/layout/SiteSidebar.astro`](../../apps/portfolio/src/components/layout/SiteSidebar.astro).

<a id="src-components-layout-sitesidebar-astro-note-1"></a>

### Overview

Desktop sidebar — on delta.dev the sidebar IS the header.

Nav language: Git commit graph / metro map. ONE rail SVG paints the
entire line system as a single unit: a continuous vertical trunk runs
from the first station to the bottom of the sidebar, hollow station
nodes sit on top of it, and below the last station the trunk grows
into an infinite git tree (branches forking RIGHT in the reference
mockup's cascading waterfall, dx=25/dy=20 diagonals, tracks 1.2px).
Between stations an accent HOP CONNECTOR appears ONLY while
transitioning: it grows out of the previously active node toward the
current one, then retracts into the destination node — no red line at
rest (positioned by ScrollSpy, animated by a CSS transition). The
active station's node grows ~1.4× from its center and its label
becomes a filled terracotta pill (all-caps mono).
Hovering a station DRAWS the terracotta rectangle around its label
as an outline only (border-accent, no fill); the active (clicked)
station keeps the filled pill. All stations share identical styling.
Active state = aria-current set by ScrollSpy, styled via
group-aria-[current=true]:* — the only JS is ScrollSpy itself.

WHY ONE SVG (the double-paint bug this fixes): the line used to be
drawn by TWO overlapping layers — a spine &lt;div&gt; (bg-line-subtle,
absolute top-3.5→bottom-0) on top of the tree pattern's own trunk
path (M3.5 0 V760). In light mode --ui-border-subtle is
SEMI-TRANSPARENT (color-mix(..., transparent 82%)), so wherever both
layers painted, the alpha stacked (~18% → ~33%) and the whole tree
zone rendered visibly darker than the stations zone. Now the trunk is
a SINGLE &lt;line&gt; painted exactly once, and the pattern contains ONLY
branches + commit nodes — no trunk — so 1.2px strokes can never stack.
Fork/merge joints where a branch meets the trunk (x=3.5) are masked
by opaque canvas-filled junction circles, exactly like the reference.
Bonus: nothing crosses a pattern tile edge anymore (previously the
trunk did), so vertical tiling is seamless by construction.

WHY STATION NODES STAY HTML (not circles inside the rail SVG):
 1. Their y must equal each anchor's flex-computed center — font
    metrics decide that, not constants we can hardcode without drift.
 2. The active scale-up is pure CSS via the anchor's aria-current
    (group-aria-[current=true]:scale-[1.4]). A detached SVG circle
    can't inherit that without per-index :has() rules or JS coupling.
 3. Their bg-canvas fill is opaque, so the trunk passes cleanly
    underneath — single paint, same visual as a painted SVG node.
They are still "rendered dynamically": one node per `sections` entry.

GEOMETRY (derived — keep in sync with the utility classes below):
  label  = text-2xs line-height 16 + py-0.5 (4) + border (2) = 22px
  anchor = py-1.5 (12) + max(node 7, label 22)               = 34px
  ul     = N×34 + (N−1)×4 (space-y-1); N=6 stations           = 224px
  first node center = 17 → node TOP edge = 14 = top-3.5, where the
  trunk starts (the line emerges from the node's opaque fill). Tree
  starts at 224 + mt-1 (4) = 228 → TREE_TOP, applied via
  patternTransform so tile-internal coords keep the mockup's 0-based
  y values. Trunk x=3.5 = station node centers (size-[7px] from the
  anchor's left edge). Commits are hollow r=3 circles + 1px stroke =
  7px outer — EXACTLY the station nodes' size-[7px] (border-box), so
  SVG commits and HTML stations read as one symbol set (r=3.5
  rendered 8px outer — visibly bigger next to the stations).

IMPLEMENTATION NOTES:

- style="stroke: var(...)" (not presentation attributes) — Firefox
  drops presentation attributes referencing var() in some versions.

- The design system has NO --ui-line token; undefined var() is
  invalid at computed-value time, so strokes silently became `none`
  and solid dots fell back to `fill: black` (a previous version
  rendered only black dots). Use existing tokens: --ui-border-subtle
  / --ui-border / --ui-canvas / --ui-accent.

BRAND LOGO: the animated Paint-Fill "A" (light + dark variants) lives
in layout/BrandLogo.astro — see its header for the full source-fidelity
rationale. It replaces the old boxed Δ glyph: NO bordered wrapper (the
chrome rectangle fights the artwork), the SVG floats on the canvas
exactly like the source exports, and swapping variants via `dark:`
replays the paint animation on every theme toggle.

<a id="src-components-layout-sitesidebar-astro-note-2"></a>

### Additional note 2

FIXED, NOT STICKY — the scroll-vibration fix.
   The sidebar used to be `position: sticky` inside the scrolling grid:
   the ONLY piece of chrome that lived in the scroller while everything
   around it (frame cells, gutters, rail) is `position: fixed`. During
   async (compositor) scrolling the browser moves the page, then offsets
   the sticky layer back; with fractional scroll steps (smooth wheel,
   125%/150% display scaling) that compensation lands on sub-pixel
   offsets and trails the fixed frame by a frame, so its 1.2px tree lines
   and borders get re-sampled every frame → the panel visibly trembles
   against the still frame. (Layout-level measurement shows top=16px
   constantly; the shake is purely compositor-side.)
   A fixed layer is never part of the scroll, so there is nothing to
   compensate. It mirrors ViewportFrame's rail track verbatim
   ([page-left | 1fr | page-right] × --site-columns, column 1) so it sits
   on exactly the pixels the in-flow grid column did. The in-flow grid
   still declares the sidebar track and &lt;main&gt; is explicitly placed in
   column 2, so content layout is unchanged. Height formula unchanged.

<a id="src-components-layout-sitesidebar-astro-note-3"></a>

### Additional note 3

delta verbatim: the sidebar itself carries border-x (their sidebar is
     a zds-bg-subtle bordered column) — its RIGHT border draws the line at
     the START of the red rail segment (the outer line of the "|=|" at the
     main column's left edge, plan15); the rail band's/panels' inset
     border-x is the inner one. Chrome only — content untouched.

<a id="src-components-layout-sitesidebar-astro-note-4"></a>

### Additional note 4

brand — delta.dev's sidebar head: mark + wordmark on one line, an
       italic serif status line under it (their "Now in Beta"). Here the
       status is AVAILABILITY (meta.availability) with a live green dot —
       the one fact a recruiter needs before scrolling anywhere.
       SIZE: the narrow md rail (~108px content column) can't fit a bigger
       mark beside the wordmark, so at md the mark stacks ABOVE it; from
       lg (rail ≥ ~200px) they sit side by side. Mark: size-14 (56px, up
       from 44px). The dot ping is motion-safe only.

<a id="src-components-layout-sitesidebar-astro-note-5"></a>

### Additional note 5

rail — ONE SVG paints the whole line system as a single unit:
           the trunk &lt;line&gt; is painted exactly once (no stacking), and
           the pattern holds ONLY branches + commit nodes (no trunk).
           No viewBox: SVG user units = CSS px, so the mockup's geometry
           renders 1:1. pattern width="100%" → exactly ONE tile column;
           nothing crosses tile edges → seamless vertical tiling.
           Absolutely positioned behind the in-flow stations, whose
           opaque node fills paint cleanly over the trunk.

<a id="src-components-layout-sitesidebar-astro-note-6"></a>

### Additional note 6

commits — hollow r=3 circles: r=3 + 1px stroke = 7px
                 outer, EXACTLY the station nodes' size-[7px] border-box
                 (same border-line bg-canvas). Junction circles at
                 (3.5, 60) and (3.5, 720) mask the branch/trunk joints
                 with an opaque fill.

<a id="src-components-layout-sitesidebar-astro-note-7"></a>

### Additional note 7

hop connector — accent segment that exists ONLY while
             transitioning between stations ("from circle A to circle B"),
             never at rest: ScrollSpy spans it from the previously active
             node to the current one (the CSS transition makes it grow out
             of the source node), then collapses it into the destination
             node after the hop lands. Zero height before the first hop →
             nothing painted; duration-500 matches ScrollSpy's retract
             timer.

<a id="src-components-layout-sitesidebar-astro-note-8"></a>

### Additional note 8

commit node — grows ~1.4× from its center when active
                     (stays centered on the trunk) and fills with the brand
                     red (bg/border-accent), matching the active pill and
                     the red hop connector. data-station-node lets
                     ScrollSpy measure exact centers for the hop connector.

<a id="src-components-layout-sitesidebar-astro-note-9"></a>

### Additional note 9

station label — hover uses the shared default button
                     hover (global.css `btn-hover`: brand border + low-opacity
                     brand wash + faint halo). Active is an OUTLINED pill —
                     brand border + brand text, no fill — because the filled
                     red commit node already marks the station; a second
                     solid red block was redundant. Hovering the active
                     pill adds the same btn-hover wash/halo but keeps the
                     red text. All stations share one box (transparent
                     border at rest), so nothing shifts on change.

<a id="src-components-layout-sitesidebar-astro-note-10"></a>

### Additional note 10

utility zone — resume download + socials share ONE hairline-
       separated block at the bottom of the rail (delta.dev keeps its
       sidebar footer items grouped under a single rule the same way).
       Resume first: it's the primary recruiter CTA, socials are ambient.

<a id="src-components-layout-sitesidebar-astro-note-11"></a>

### Additional note 11

socials — horizontal icon-only buttons (name lives in tooltip +
         aria-label), then the blog's RSS feed as the 4th glyph (moved here
         from the Writings header: it's a site-wide subscription, not a
         per-section action). 4 buttons must fit the narrow md rail
         (~108px content column): size-6 + gap-0.5 → 4×24 + 3×2 = 102px;
         lg relaxes to size-7 + gap-1.5 (4×28 + 3×6 = 130px, room to spare).

<a id="src-components-layout-viewportframe-astro"></a>

## src/components/layout/ViewportFrame.astro

Source: [`apps/portfolio/src/components/layout/ViewportFrame.astro`](../../apps/portfolio/src/components/layout/ViewportFrame.astro).

<a id="src-components-layout-viewportframe-astro-note-1"></a>

### Overview

Fixed chrome layer — delta.dev's REAL structure, verbatim
             (re-extracted from their live DOM, plan13.md):

  fixed inset-0 z-20 grid pointer-events-none
    grid-cols-[page-left 1fr page-right]
    grid-rows-[frame-top 1fr inset-bottom]
    before:border-y md:before:hidden        ← mobile-only edge hairlines

  ├─ top cell      col-span-full row-1   bg-frame-background border-line md:border-b
  ├─ left gutter   col-1 row-2           chrome-bg (+noise)
  ├─ RAIL cell     col-2 row-2           mirrors --site-columns
  │                  └─ col-2 (main): inset wrapper [inset 1fr inset] md:pr-px
  │                     └─ col-2: pointer-events-auto grid grid-cols-8 border-x
  │                        3/8 bg-accent | 2/8 bg-(--delta-neutral-800) | 3/8 bg-delta-blue
  ├─ right gutter  col-3 row-2           chrome-bg (+noise)
  └─ bottom cell   col-span-full row-3   bg-frame-background border-line md:border-t

WHY not one big overlay with an 8px accent line: delta has no such token —
their line IS this 6px segmented rail (solid spans, no border), and the
"line" above/below the page is each cell's md:border-b/t at **--ui-border,
NOT currentColor** — Tailwind's preflight (`border: 0 solid`) makes bare
border classes inherit the near-black text color, which was the "black
line" bug (plan11 §1). Every border here names its color explicitly.

WHY pointer-events: the layer itself is pointer-events-none (content must
scroll/select beneath it); only cells that need interaction opt back in
with pointer-events-auto (the rail, like delta). The sidebar lives in the
z-0 content grid, NOT here, so nothing covers it.

Noise + hatch: each opaque cell paints delta's texture pair — noise.webp
(background-size 180px, opacity .05 / dark .012) under a 45° hatch SVG
(text-hatch = --ui-hatch, faint in dark). Same formulas verified against
the delta recording.

<a id="src-components-layout-viewportframe-astro-note-2"></a>

### Additional note 2

THE RAIL — 6px segmented band, fixed atop the MAIN COLUMN only (plan15):
     delta's verbatim nesting: the band sits inside an inset wrapper
     [inset 1fr inset] md:pr-px pinned to the main column, so the band's
     border-x aligns EXACTLY with the panels'/seams' section-inset lines
     (continuity top-to-bottom), while the SIDEBAR's own border-r (the
     outer line) supplies the second of the pair — the "||".
     Everything else in this cell stays transparent: sections scroll
     beneath (delta verbatim).

<a id="src-components-sections-about-astro"></a>

## src/components/sections/About.astro

Source: [`apps/portfolio/src/components/sections/About.astro`](../../apps/portfolio/src/components/sections/About.astro).

<a id="src-components-sections-about-astro-note-1"></a>

### Overview

About — the interactive terminal framed by ruled lines, then
             an auto-scrolling strip of fact tiles (delta.dev's
             "Words from early adopters" marquee).

  ═══════════════════   ← &lt;Seam/&gt; above this panel (index.astro) = the
  │░░│ terminal │░░│      double top rule
  │░░│          │░░│   ← centre column between full-height hairlines,
  ───────────────────      hatched gutters; terminal fills the column
  ‹ tile  tile  tile ›  ← marquee, edge-faded

POC / WHY THIS APPROACH:

1. LINES, NOT BOXES — headerless SectionShell (pad="p-0"). The terminal
   row is a 3-column grid: hatched gutters (--color-hatch, the brand
   hatch, so empty space reads as intentional) around a centre column
   with border-x. The terminal runs in `flush` mode (no own border,
   radius, shadow) with NO padding, so it fills that column exactly and
   its edges ARE the column lines — framed, not floating.

2. MARQUEE IN PURE CSS — the tile list is rendered TWICE in one flex
   track and the track animates translateX(0 → −50%): at −50% copy #2 is
   exactly where copy #1 started, so the loop is seamless. Spacing is a
   per-tile margin (not `gap`) so −50% lands on an exact tile boundary.
   Transform-only → composited, no layout per frame, zero JS.
   - hover/focus-within pauses it (readable on demand);
   - copy #2 is aria-hidden + inert, so screen readers / keyboard see
     each tile once;
   - prefers-reduced-motion: no animation, the strip becomes a normal
     horizontal scroller (copy #2 hidden).

3. TILE CONTENT IS REAL DATA — no testimonials exist, so tiles are built
   from portfolioData (competitive metrics, education, location) in
   delta's tile anatomy: statement on top, round "avatar" (platform
   glyph) + italic serif name + mono handle at the bottom. Every tile
   links out: metrics → the platform profile, CUET → cuet.ac.bd,
   location → Google Maps.

<a id="src-components-sections-contact-astro"></a>

## src/components/sections/Contact.astro

Source: [`apps/portfolio/src/components/sections/Contact.astro`](../../apps/portfolio/src/components/sections/Contact.astro).

<a id="src-components-sections-contact-astro-note-1"></a>

### Overview

Contact section — editorial "pricing-page" layout in the
             delta.dev language: ONE flat surface, structure drawn with
             hairlines only. NO cards, NO boxed panels, NO numbered
             eyebrow header.

WHY THIS IMPLEMENTATION (POC / rationale):

1. LINES, NOT BOXES — delta.dev's pricing page separates tiers with
   vertical hairlines on a single background, never stacked cards. The
   site's own design contract (SectionShell.astro) says the same:
   "structure reads through lines + hatch on ONE background". So the
   form sits directly on the section surface and the aside is divided
   from it by a single `border-l` (a `border-t` on mobile when stacked).

2. ASIDE ROWS = PRICE-TABLE ROWS — socials/email/location are rendered
   as full-width rows separated by `divide-y` hairlines (like delta's
   feature lists), with mono labels and an arrow that slides on hover.
   Zero chrome: no bg-canvas, no border, no radius, no padding boxes.

3. FLAT FIELDS — inputs keep the site's hairline field style but drop
   the card background (`bg-transparent` over the section surface), so
   the form reads as ruled lines on paper rather than an inset panel.

4. LIVE LOCAL TIME — a tiny module script ticks the visitor's view of
   my Dhaka (UTC+6) clock. Costs ~10 lines of JS, adds the "instrument
   panel" honesty delta.dev uses for stats, and answers the practical
   question "is he awake?" before hitting send.

5. HEADERLESS SectionShell — index/label are omitted, so no
   "05. Transmission" eyebrow renders. The heading + subtitle use the
   same type pair as Skills/Writings (font-display 2xl→3xl title,
   font-mono xs subtitle) so every section header reads as one system.

6. BRAND ICONS — email/social rows use the project's own stroke icon set
   (src/icons/social): currentColor glyphs that inherit the muted→accent
   hover color transition for free and auto-flip with the theme.

7. NO FOOTER BAR — the section ends with the aside grid. The Square
   Kufic colophon moved to its own full-bleed panel (sections/
   Footer.astro, Projects-IDE contract: pad="p-0", headerless), and
   the copyright/Edge texts were removed per request.

7b. BUTTONS — "Send Message" is the page's PRIMARY button (global.css
   `btn-primary`); "Copy" is SECONDARY (`btn`, via CopyButton). Both
   carry cursor:pointer + the shared brand hover halo.

7c. SEND BUTTON STATES — the mailer answers only after Cloudflare has
   actually handed the email over, which takes a few seconds. Faking
   an instant "sent" would lie on failures, so the wait stays honest and
   is made legible instead:
   - sending: the arrow becomes a spinner, a thin progress bar eases
     toward ~90% (it never reaches 100% on its own), and the label
     walks real stages: Verifying → Sending → Delivering → Almost there.
   - sent: the bar completes, a check mark draws itself, a ring pulses
     once, and the status line gives a receipt (time + the address
     the reply will go to). After a few seconds it returns to idle,
     and the receipt fades out ~7s later so it doesn't linger.
   - error: a short shake, and the mailer's own message is shown.
   The button is never `disabled` while busy (that would fade it via
   btn-primary:disabled); aria-disabled + a state guard block double
   submits. All motion is CSS, and prefers-reduced-motion turns it off.

8. FORM BACKEND — same-origin POST /api/contact (Pages Function, functions/api/contact.ts), which
   forwards to the private `mailer` Worker (akibh-dev/mailer) over a
   service binding; the mailer has no public URL at all. Vanilla-TS
   submit handler (see the first &lt;script&gt;): fetch POST JSON. Bot/abuse
   protection is Cloudflare Turnstile — the client holds ONLY the
   public site key; the secret lives in the mailer. Rationale + notes
   live above the script.

8b. LAZY TURNSTILE — api.js used to load with the page. It's ~50KB of
   third-party JS plus an iframe for a form at the very bottom, it
   logged errors for every headless visitor (Lighthouse), and its
   iframe disqualified the page from the back/forward cache. Now the
   script is injected once, when the first of these happens:
     - the form comes within 600px of the viewport (IntersectionObserver),
     - anything inside the form gets focus (keyboard users tabbing in),
     - the form is submitted.
   A real visitor scrolling to the form gets the widget before they
   reach it, so the flow is unchanged; the existing "still loading"
   guard covers a submit that beats the challenge.

<a id="src-components-sections-contact-astro-note-2"></a>

### Additional note 2

── form — straight on the surface, no wrapper ──
       Backend: same-origin /api/contact → mailer binding (see note 8).
       No action attribute: submission is JS-driven (fetch JSON), the
       endpoint travels in data-endpoint so the script stays generic.

<a id="src-components-sections-contact-astro-note-3"></a>

### Additional note 3

Cloudflare Turnstile — bot check. The SITE key is public by
         design (it only renders the challenge); verification happens
         in the worker with the secret key. The widget auto-injects a
         hidden cf-turnstile-response input inside this form, so the
         script below reads the token straight from FormData.
         LAZY: api.js is injected by the form script only when the form
         nears the viewport (note 8b); it then renders this div itself
         (implicit rendering). min-h reserves the widget's 65px so the
         Send button doesn't jump when it appears.

<a id="src-components-sections-contact-astro-note-4"></a>

### Additional note 4

send button — a small state machine (data-state: idle →
           sending → sent | error, see note 7c). Fixed min-width so the
           label swaps never resize it; nowrap so it never breaks to two
           lines in the narrow form column.

<a id="src-components-sections-contact-astro-note-5"></a>

### Additional note 5

socials — ruled rows: icon only, handle + arrow on the right.
           aria-label = "&lt;network&gt; @handle": it must CONTAIN the visible
           handle (WCAG 2.5.3 label-in-name) or voice-control users
           saying "click @akibh" can't hit it

<a id="src-components-sections-contact-astro-note-6"></a>

### Additional note 6

Contact form → /api/contact → private mailer Worker (service binding).

WHY fetch+JSON INSTEAD OF A NATIVE FORM POST: the endpoint speaks
JSON only; a native &lt;form&gt; POST would send form-urlencoded and land
on a raw JSON page. JS submission also keeps the user on the page
with an inline status line.

SECURITY MODEL (v3 — service binding): the browser path carries NO
secret. It posts SAME-ORIGIN (no CORS, no mailer URL anywhere in
the client); the Pages Function forwards it with Cloudflare's
CF-Connecting-IP header to the mailer over a binding. The mailer validates the fields,
checks the honeypot, applies a per-IP rate limit and verifies the
Turnstile token (secret + hostname check) before sending.

ERROR TEXT: the mailer's `error` strings are written to be safe to
show ("Invalid email address", "Too many requests…"), so they are
shown verbatim. Network or non-JSON failures fall back to a generic line.

TOKEN LIFECYCLE: Turnstile tokens are single-use and expire after
300s, so after EVERY attempt (success or failure) the widget is
reset to mint a fresh token for the next submit.

LOCAL TESTING: `astro dev` has no /api/contact (bindings exist only
in the Workers runtime). Build, then `npx wrangler pages dev` here
while the mailer runs `wrangler dev` too; see the mailer README.

<a id="src-components-sections-footer-astro"></a>

## src/components/sections/Footer.astro

Source: [`apps/portfolio/src/components/sections/Footer.astro`](../../apps/portfolio/src/components/sections/Footer.astro).

<a id="src-components-sections-footer-astro-note-1"></a>

### Overview

Site footer — the Square Kufic panel of Qur'an 2:269 as a
             pure full-bleed band: no frame, no border, no margin, no
             padding. The calligraphy starts at the topmost corner of
             the content div and spans it edge to edge.

SAME CONTRACT AS THE PROJECTS IDE: headerless SectionShell (no
index/label) + pad="p-0" — the content IS the section, touching the
channel side lines and the seams above/below.

WHY OUTSIDE THE NAV REGISTRY (data/sections.ts): the registry drives
the sidebar stations / mobile menu — a footer is not a nav target.
index.astro renders it after the sections map with a &lt;Seam/&gt; above.
ScrollSpy only observes sections with sidebar anchors, so an
untracked footer is safe.

FONT CREDIT: Square Kufic by Nedaa Naim Elias (CC BY 4.0,
squarekufic.org) — attribution kept in source per owner's request to
drop the visible credit line.

<a id="src-components-sections-hero-astro"></a>

## src/components/sections/Hero.astro

Source: [`apps/portfolio/src/components/sections/Hero.astro`](../../apps/portfolio/src/components/sections/Hero.astro).

<a id="src-components-sections-hero-astro-note-1"></a>

### Overview

Hero — rotating quote epigraph + identity row (name and
             portrait frame). The interactive shell and the metrics moved
             to sections/About.astro (Hero/About split): the first screen
             is identity only, the second is "talk to me".

POC / Implementation decisions:

1. RANDOM QUOTE (eyebrow slot, replaces "01. Identity"):
   The site is fully static, so a frontmatter-only random pick would be
   frozen at build time. Instead the SSR output renders one quote as the
   no-JS fallback, and a tiny module script (bottom of file) re-picks from
   `heroQuotes` on EVERY page load. `heroQuotes` is a standalone export in
   data/portfolio.ts so this script tree-shakes to a few strings rather
   than shipping the whole dataset to the browser.

2. DELTA HERO LAYOUT (full-bleed, pad="p-0", headerless): two columns
   split by ONE vertical hairline, like delta.dev's hero.
   - Left: the quote is the ruled eyebrow (a hairline bleeds in from the
     column edge, another runs out to the divider — delta's "— From the
     creators of Zed —"), then name + one-liner.
   - Right: delta's drafting panel. A framed square crossed by
     full-length construction lines (two horizontal, two vertical,
     absolutely positioned so they always span edge to edge); the top and
     bottom bands carry the brand hatch, and the photo fills the centre
     cell — the spot delta gives its logo. object-cover with a raised
     focal point keeps the face in frame at every column width.
     From md up the panel STRETCHES to the row height (flex-1, no
     aspect lock) so it never leaves a gap under it when the text
     column is taller; all lines/bands are %-based, so they scale.
     Mobile keeps a square.
   - Stacks on mobile (divider becomes a border-t). Top padding trimmed
     vs. the old eyebrow-header version.

2b. PHOTO PIPELINE — astro:assets &lt;Picture&gt; from src/assets/my-pic.png
   (890×920 source, ~1MB PNG). At build, sharp emits AVIF + WebP at
   480/640/890w with a WebP &lt;img&gt; fallback (a PNG fallback weighed
   up to 1.5MB; every browser that ignores AVIF takes WebP); `sizes` matches the
   rendered size (the cell is ≈85vw on phones / ≤300px at md+, ×1.35
   zoom → 110vw / 400px), so a phone downloads a ~20-40KB AVIF instead
   of the full PNG.
   Intrinsic width/height come from the import (no CLS); eager +
   fetchpriority=high because it's the LCP image above the fold.
   FRAMING: the source is a wide beach shot with the subject small,
   left of centre. The &lt;img&gt; fills an overflow-hidden clip box and is
   scaled 1.35× from origin 43%/58% (the subject's chest), so face +
   shirt fill the cell while some sea/sky context stays.

3. REMOVED per request: status pill and the CTA row (View Projects /
   Get in Touch / CV). `meta.statusText` stays in the data file — it is
   still used by Layout.astro (meta description) and the Terminal.

<a id="src-components-sections-projects-astro"></a>

## src/components/sections/Projects.astro

Source: [`apps/portfolio/src/components/sections/Projects.astro`](../../apps/portfolio/src/components/sections/Projects.astro).

<a id="src-components-sections-projects-astro-note-1"></a>

### Overview

Projects section — Astro owns the section shell + data,
             the interactive browser is a pure-Astro island
             (pre-rendered states + vanilla controller, plan 18).

<a id="src-components-sections-projects-astro-note-2"></a>

### Additional note 2

FULL-BLEED: the IDE window IS the section content — no eyebrow
   header (index/label omitted) and zero padding (pad="p-0"), so the
   editor chrome spans the whole panel between the channel side lines.
   The sr-only &lt;h2&gt; keeps the outline intact (h1 name → h2 per section →
   h3 per project README) for screen readers and crawlers — Bing flagged
   the old per-README &lt;h1&gt;s as "more than one h1".

<a id="src-components-sections-skills-astro"></a>

## src/components/sections/Skills.astro

Source: [`apps/portfolio/src/components/sections/Skills.astro`](../../apps/portfolio/src/components/sections/Skills.astro).

<a id="src-components-sections-skills-astro-note-1"></a>

### Overview

Skills as a ruled table — one full-bleed row per category,
             bare icons only (no cards, no keycaps, no captions).

POC / WHY THIS APPROACH:

1. NO CARDS — like Contact/Projects, structure is hairlines on one
   surface: headerless SectionShell (pad="p-0"), rows split by divide-y,
   the category column split from the icons by a single border-l. Reads
   as a spec sheet, the way delta lays out its pricing table.

2. ICONS ONLY — glyphs from src/icons (stroke, currentColor) sit
   directly on the surface with no caption. The name still exists as a
   native tooltip (title) and as sr-only text, so screen readers and
   hover both identify each glyph. Hover tints the glyph with
   the brand colour and lifts it 2px — transform/color only, GPU-cheap,
   disabled under prefers-reduced-motion.

3. COMPACT — no captions + tight row padding keep each row ~70px.
4. The skill → icon map lives here, so data/portfolio.ts stays
   .astro-free; unmapped skills fall back to Braces instead of breaking
   the build. Pure static Astro, zero JS (AGENTS.md rule 5).

<a id="src-components-sections-writings-astro"></a>

## src/components/sections/Writings.astro

Source: [`apps/portfolio/src/components/sections/Writings.astro`](../../apps/portfolio/src/components/sections/Writings.astro).

<a id="src-components-sections-writings-astro-note-1"></a>

### Overview

"From the blog" — delta.dev's blog teaser, adapted to a
             single-author blog. Full-bleed panel: header row, then a
             column grid split by hairlines (no cards).

POC / WHY THIS APPROACH:

1. FULL BLEED, LINES NOT BOXES — headerless SectionShell with pad="p-0"
   (the Projects/Contact contract). Columns are separated by border-l and
   the grid by one border-t, so the posts read as one ruled sheet that
   runs edge-to-edge between the channel lines, exactly like delta.

2. COVERS — ui/PostCover.astro shows the post's banner (from the blog)
   inside delta's proof-sheet frame; posts WITHOUT a banner get the
   default typographic "document" thumbnail, so mixed rows stay aligned.

3. NO AUTHOR BYLINE — every post is mine, so a name/avatar on each column
   is noise. That slot carries information instead:
     • topic eyebrow (tags) above the title — what it's about at a glance
     • reading-time meter (filled ticks, 1 tick ≈ 1 min) + date below —
       how long it'll take, visible before clicking.

4. "View all posts" uses the site-wide default button (global.css
   `btn`). The RSS feed link lives in the sidebar's social row.

5. Pure static Astro, zero client JS (AGENTS.md rule 5).
6. POSTS COME FROM THE BLOG: lib/blog.ts fetches /api/featured?limit=3 at
   build time (featured first, filled with the newest). If the API was
   unreachable, the grid is replaced by a one-line pointer to the blog —
   no placeholder posts.

<a id="src-components-ui-hatch-astro"></a>

## src/components/ui/Hatch.astro

Source: [`apps/portfolio/src/components/ui/Hatch.astro`](../../apps/portfolio/src/components/ui/Hatch.astro).

<a id="src-components-ui-hatch-astro-note-1"></a>

### Overview

Delta.dev's signature 45° diagonal hatch pattern band.

WHY: This SVG pattern appeared 6× duplicated in the previous build.
As a component it's defined once and themed via the `--color-hatch`
token (currentColor inherits, so dark mode needs zero extra code).

@prop height - band height (Tailwind class), default h-3

<a id="src-components-ui-postcover-astro"></a>

## src/components/ui/PostCover.astro

Source: [`apps/portfolio/src/components/ui/PostCover.astro`](../../apps/portfolio/src/components/ui/PostCover.astro).

<a id="src-components-ui-postcover-astro-note-1"></a>

### Overview

Thumbnail for a blog teaser, inside delta.dev's framed
             "print proof" (crop lines + colour registration squares).
             Two modes:
  1. BANNER  — post.banner set (comes from blog.akibh.dev): the image,
               object-cover, fills the frame.
  2. DEFAULT — no banner: a typographic "document" thumbnail — the
               post rendered as a page: file path tab, a large serif
               drop cap of the title, and faux text lines.

POC / WHY THIS APPROACH:

- Banners are authored on the blog, so the portfolio must look finished
  both WITH and WITHOUT one. The default isn't a grey placeholder: it
  reads unmistakably as "an article" and is unique per post.

- Faux lines are derived from a hash of the slug (deterministic) — every
  post gets its own paragraph rhythm, identical across builds/SSR, with
  no randomness that could change between renders.

- Same frame + same 2:1 aspect in both modes, so a row mixing bannered
  and banner-less posts stays aligned column to column.

- Banner &lt;img&gt; is lazy + async-decoded with explicit size (no CLS), and
  alt="" because the card's title already names the post (decorative).

- Zero JS; hover zoom is CSS on the parent .group, off under
  prefers-reduced-motion.

Example: &lt;PostCover title={post.title} slug={post.slug} banner={post.banner} /&gt;

<a id="src-components-ui-scrollrow-astro"></a>

## src/components/ui/ScrollRow.astro

Source: [`apps/portfolio/src/components/ui/ScrollRow.astro`](../../apps/portfolio/src/components/ui/ScrollRow.astro).

<a id="src-components-ui-scrollrow-astro-note-1"></a>

### Overview

Horizontal snap-scroller for card rows (metrics, posts, skills).

WHY: CSS scroll-snap gives native-feeling horizontal scrolling with zero
JavaScript. Edge fade masks signal overflow. Cards size fluidly with
min() so they never overflow small viewports (the responsiveness bug in
the previous build used fixed 320px cards).

<a id="src-components-ui-seam-astro"></a>

## src/components/ui/Seam.astro

Source: [`apps/portfolio/src/components/ui/Seam.astro`](../../apps/portfolio/src/components/ui/Seam.astro).

<a id="src-components-ui-seam-astro-note-1"></a>

### Overview

The "=" separator between section panels — delta.dev's
             exact markup (plan10.md point 4):

  &lt;div class="relative h-4 flex-none overflow-clip border-y"&gt;
    &lt;div class="px-(--site-section-inset) size-full"&gt;
      &lt;div class="border-x relative z-1 size-full"&gt;&lt;/div&gt;
    &lt;/div&gt;
    &lt;svg …45° hatch, full-bleed, stroke-brand-100/80, dark:opacity-5&gt;
  &lt;/div&gt;

WHY THIS SHAPE (what the recording shows):

1. h-4 (16px) with border-y: two hairlines top and bottom SEPARATE the
   flush panels — the only horizontal lines in the column.

2. The inner inset border-x box continues the panels' side-lines through
   the seam, so the column reads as one instrument channel with a hatched
   "danger stripe" across it rather than separate boxes.

3. PATTERN: the band is TRANSPARENT now — the unified brand watermark
   (body's .chrome-bg layer) shows through, replacing the old 45°
   hatch. The "danger stripe" texture is the watermark itself.

4. flex-none on the stack child: the section stack is a flex column, and
   the seam must never stretch (delta verbatim).

Where: index.astro renders &lt;Seam /&gt; once after every section except the
last (delta's own pattern: seams BETWEEN panels, none at the top/bottom
edge — the fixed frame's border-b/t do the edge lines).

<a id="src-components-ui-sectionshell-astro"></a>

## src/components/ui/SectionShell.astro

Source: [`apps/portfolio/src/components/ui/SectionShell.astro`](../../apps/portfolio/src/components/ui/SectionShell.astro).

<a id="src-components-ui-sectionshell-astro-note-1"></a>

### Overview

A FLUSH PANEL of the content channel: continuous side
             lines (border-x, inset --site-section-inset from the column
             edge), NO top/bottom borders — the horizontal rhythm comes
             from the &lt;Seam/&gt; bands index.astro inserts BETWEEN panels
             (the "=" gaps). Numbered eyebrow header + consistent
             content padding inside.

WHY panels stay bg-canvas: structure reads through lines + hatch on ONE
background (delta.dev), not stacked cards. The old per-section &lt;Hatch&gt;
band and border-b are gone: the seam replaces both — it is the hatch
AND the border-y in one band.

WHY reveal-on-scroll moved to the inner content div: the animation
translates its element — applied to the &lt;section&gt; it would drag the
continuous side lines 1.5rem out of alignment with the seams during
entry. Animating only the content keeps the channel lines still.

Slots:

- default: section content.
- header (optional): overrides the default "NN. Label" eyebrow —
  used by Hero to render its rotating quote in that slot.

HEADERLESS MODE: omit index+label (and the header slot) and no header
renders at all — pair with pad="p-0" for full-bleed sections whose
content IS the header (e.g. the Projects IDE window).

<a id="src-components-ui-versecalligraphy-astro"></a>

## src/components/ui/VerseCalligraphy.astro

Source: [`apps/portfolio/src/components/ui/VerseCalligraphy.astro`](../../apps/portfolio/src/components/ui/VerseCalligraphy.astro).

<a id="src-components-ui-versecalligraphy-astro-note-1"></a>

### Overview

Square Kufic (كوفي مربع) panel of Qur'an 2:269 — ONE solid
             rectangle, four lines filling the shape edge-to-edge both
             horizontally and vertically. Pure Astro + SVG, zero JS.

POC / IMPLEMENTATION RATIONALE:

1. FONT — "Square Kufic" v1.1.0 by Nedaa Naim Elias (squarekufic.org,
   CC BY 4.0 — attribution kept here in source). Self-hosted at
   public/fonts/square-kufic.woff2 (21 KB, the only file — woff2 covers
   every browser this site can run on, so no ttf fallback is shipped).
   A true pixel-grid Kufi Murabba face, not text-kufic (Noto/Reem Kufi).

2. TEXT NORMALIZATION — the cmap covers base Arabic + standard harakat
   but not the Uthmani marks: ٱ (U+0671 → ا), ۚ/ۗ (dropped), ۟ (U+06DF
   dropped). Every rendered character is cmap-verified; no fallback.

3. THE RECTANGLE (why SVG, not HTML text): a Murabba panel needs every
   line at IDENTICAL width — crisp shared vertical edges, ink blocks
   stacked with a hairline gap. HTML can't stretch lines deterministically,
   so each line is an SVG &lt;text&gt; with textLength="1196" +
   lengthAdjust="spacingAndGlyphs" (stretch is applied post-shaping).

4. FOUR-LINE COMPOSITION (v2 — "bigger, fill horizontally AND
   vertically"): the 2-line band was 12.3:1; four lines give a ~3.15:1
   panel, so at the same container width glyphs render ~1.9× larger.
   All widths measured with canvas measureText @ 100px in the actual
   font (the font's space is ZERO-width, so splits lose nothing at
   boundaries — sums are exact):
     D1 يُؤْتِى الْحِكْمَةَ مَن يَشَآءُ              1233.3  → −3.1%
     D2 وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ              1166.6  → −2.4%
     D3 أُوتِىَ خَيْرًا كَثِيرًا وَمَا              1133.4  → +5.5%
     D4 يَذَّكَّرُ إِلَّآ أُولُوا الْأَلْبَـٰبِ        1250.0  → −4.5%
   All lines meet at W=1196 with ≤5.5% symmetric distortion —
   imperceptible in geometric kufic. Line breaks are geometric, which
   is the traditional Murabba convention: the panel reads as one
   composition, not as wrapped prose. (A fully semantic split —
   1233/933/1167/1450 — would need ±22% distortion or long fake
   kashida bars; visibly worse.)

5. GEOMETRY (verified via getBBox on the final markup): this font's ink
   sits entirely ABOVE the baseline — an 84-unit block at size 100,
   harakat included, zero below. Baselines y=92/186/280/374 pack four
   ink blocks with ~9.4-unit gaps; rendered bboxes: all lines
   x=0→1196.7, y 7.4–92 / 101.4–186 / 195.4–280 / 289.4–374 — that
   union bbox IS the viewBox (see note 8).

6. GRADIENT — red-300 → red-500 top→bottom across the WHOLE panel
   (gradientUnits="userSpaceOnUse" over the viewBox height: line 1
   starts at red-300, line 4 ends at red-500 — not per-line).

7. RTL — direction="rtl" + text-anchor="start" anchored at x=1196 pins
   the right edge (Arabic start) so textLength stretches leftward.
   The panel scales with preserveAspectRatio via w-full h-auto.

8. FULL-BLEED FOOTER (v5): the panel lives in sections/Footer.astro
   with pad="p-0" — it must start at the topmost corner of the content
   div and TOUCH the channel border lines (Projects-IDE contract). So
   the viewBox IS the measured ink bounding box (x 0→1196.7,
   y 7.4→374 from the getBBox probe in note 4): zero margins on all
   four sides — the letterforms themselves touch the SVG edges, and
   the SVG edges sit flush against the section's border-x lines and
   the seams above/below. The &lt;svg&gt; is display:block — an inline SVG
   would otherwise leave a few px of baseline descent gap inside the
   figure, breaking the flush bottom edge. The gradient (y1=0→y2=382)
   still covers the ink range 7.4→374 fully.

<a id="src-icons-iconbase-astro"></a>

## src/icons/IconBase.astro

Source: [`apps/portfolio/src/icons/IconBase.astro`](../../apps/portfolio/src/icons/IconBase.astro).

<a id="src-icons-iconbase-astro-note-1"></a>

### Overview

Shared SVG shell for the entire portfolio icon set.

POC / WHY THIS APPROACH:

- Single source of truth for the icon contract: 24×24 grid, stroke-only,
  `currentColor` — so every icon inherits text color and therefore works in
  light AND dark mode automatically (theme tokens flip via the `.dark` class).

- `title` prop gives accessible labeling when an icon is used standalone
  (renders &lt;title&gt; + role="img"); otherwise the icon is aria-hidden.

- Any extra attribute (stroke-width, width, height, data-*, on*) is forwarded
  AFTER the defaults, so callers can override per-instance.

Usage: see any sibling icon — they only supply &lt;path&gt;/&lt;circle&gt; children.

<a id="src-icons-index-ts"></a>

## src/icons/index.ts

Source: [`apps/portfolio/src/icons/index.ts`](../../apps/portfolio/src/icons/index.ts).

<a id="src-icons-index-ts-note-1"></a>

### Overview

Barrel exports for the portfolio icon set.

WHY A BARREL: lets sections import several icons from one path
(`import { GitHubIcon, DockerIcon } from "../../icons"`) while keeping
one file per icon for tree-shaking. All exports carry the `Icon` suffix
to avoid collisions (e.g. `React` the library, `X` the HTML global).

NOTE: `SqlIcon` is an intentional alias of Database.astro — one canonical
cylinder glyph, two semantic names (language pill vs infra pill).

<a id="src-icons-lang-python-astro"></a>

## src/icons/lang/Python.astro

Source: [`apps/portfolio/src/icons/lang/Python.astro`](../../apps/portfolio/src/icons/lang/Python.astro).

<a id="src-icons-lang-python-astro-note-1"></a>

### Overview

Icon: Python — the official two-snake mark as ONE point-symmetric
construction: a single S-stroke forms both snakes' inner bodies, and two
rounded "lips" (left-top, right-bottom) form their outer heads/tails.
Every point maps to its partner via (x,y) → (24−x, 24−y), so the mark is
exactly balanced. Redrawn: the previous version read as a blob/"8" at
16–20px because the heads had no outer lips.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-django-astro"></a>

## src/icons/tech/Django.astro

Source: [`apps/portfolio/src/icons/tech/Django.astro`](../../apps/portfolio/src/icons/tech/Django.astro).

<a id="src-icons-tech-django-astro-note-1"></a>

### Overview

Icon: Django — the "dj" monogram in a rounded badge (Django's own
favicon). Badge pattern as TypeScript/JavaScript. Redrawn: a bare "d"
was unrecognizable and looked like a typo next to the other glyphs.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-docker-astro"></a>

## src/icons/tech/Docker.astro

Source: [`apps/portfolio/src/icons/tech/Docker.astro`](../../apps/portfolio/src/icons/tech/Docker.astro).

<a id="src-icons-tech-docker-astro-note-1"></a>

### Overview

Icon: Docker — whale hull carrying a 3+2 container stack, plus eye.
Simplified from 6 boxes + spout: at 16–20px the extra top box and the
spout curve clumped into a blob (GUIDE.md pitfall 5: remove detail).
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-flutter-astro"></a>

## src/icons/tech/Flutter.astro

Source: [`apps/portfolio/src/icons/tech/Flutter.astro`](../../apps/portfolio/src/icons/tech/Flutter.astro).

<a id="src-icons-tech-flutter-astro-note-1"></a>

### Overview

Icon: Flutter — the logo's two parallel 45° shards: a long upper bar
(top-right → left) and the lower chevron that folds back on itself.
Redrawn: the previous three-piece version had misaligned edges.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-git-astro"></a>

## src/icons/tech/Git.astro

Source: [`apps/portfolio/src/icons/tech/Git.astro`](../../apps/portfolio/src/icons/tech/Git.astro).

<a id="src-icons-tech-git-astro-note-1"></a>

### Overview

Icon: Git — rounded diamond (rotated square, inside the 2→22 live area;
the old sharp diamond ran to the canvas edge and clipped) holding the
logo's branch: an entry line from the upper-left edge into a node, a
stem down to a second node, and a branch out to a third node.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-linux-astro"></a>

## src/icons/tech/Linux.astro

Source: [`apps/portfolio/src/icons/tech/Linux.astro`](../../apps/portfolio/src/icons/tech/Linux.astro).

<a id="src-icons-tech-linux-astro-note-1"></a>

### Overview

Icon: Linux — Tux reduced to what survives at 16px: egg body, belly
oval, two eyes, beak, and flat feet. Redrawn: flippers and inner
contour lines from the previous version merged into noise when small.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-layouts-basehead-astro"></a>

## src/layouts/BaseHead.astro

Source: [`apps/portfolio/src/layouts/BaseHead.astro`](../../apps/portfolio/src/layouts/BaseHead.astro).

<a id="src-layouts-basehead-astro-note-1"></a>

### Overview

Everything inside &lt;head&gt;, shared by every page (index, 404):
             charset/viewport, SEO + social metadata, structured data,
             anti-flash theme init, self-hosted fonts.

WHY ONE COMPONENT: the 404 page must render OUTSIDE Layout.astro (its
sidebar links are `#section` anchors that would resolve against the
missing URL), but it needs the same fonts, theme script and metadata.
Extracting the head keeps both pages byte-identical where it matters.

SEO / SOCIAL (what each tag is for):

- &lt;link rel="canonical"&gt;: one URL per page (akibh.dev vs
  www./?utm=… variants) so ranking signals don't split.

- Open Graph + Twitter card: link previews on LinkedIn/X/Slack/Discord.
  og:image is a 1200×630 PNG (public/og.png) — the size every network
  crops cleanly; absolute URL because crawlers don't resolve relative.

- JSON-LD Person + WebSite + ProfilePage (schema.org): lets Google build a
  knowledge panel for the name and connect the profiles (sameAs).
  Person.name = meta.searchName ("Akib Hasan", what people type); the full
  name and variants go in alternateName so every spelling resolves to the
  same entity. sameAs = socials + coding platforms + blog — each of those
  profiles should link back to akibh.dev to confirm the claim.
  ProfilePage marks "/" as a page ABOUT that Person (Google profile-page
  rich result). image = the headshot (a face, not the banner) at a
  build-time JPEG; alumniOf/knowsAbout come from the same data the page
  renders, so the markup never claims what the page doesn't show.

- theme-color per scheme: mobile browser chrome matches the site.
- `noindex` prop: the 404 asks search engines not to index it.

FONTS — SELF-HOSTED (public/fonts, all SIL OFL 1.1): previously
hot-linked from cdn.delta.dev. A third-party CDN we don't control can
change or vanish, adds a DNS+TLS connection on the critical path, and
its cache headers were short (Lighthouse "efficient cache lifetimes").
Same-origin files get the immutable cache rule in public/_headers.
ONLY the body font (51KB) is preloaded. Preloading all three (~280KB)
made them compete with the hero photo on slow mobile links: Lighthouse
mobile LCP 3.8s → 2.3s, score 88 → 97 when Plex Serif (164KB) and Lilex
load on demand instead (font-display: swap covers the gap).

CSP NOTE: Astro writes its CSP &lt;meta&gt; AFTER this head content, so the
inline anti-flash script runs before the policy applies (a policy only
governs content parsed after it). Keep it inline and first: moving it
below the meta would get it blocked.

ANTI-FLASH: dark is the DEFAULT — `.dark` is set before first paint
unless the user explicitly chose light (legacy "system" values from
older versions also resolve to dark).

POC:
  &lt;head&gt;&lt;BaseHead title="…" description="…" /&gt;&lt;/head&gt;
  &lt;BaseHead title="404 — Not found" noindex /&gt;

<a id="src-layouts-layout-astro"></a>

## src/layouts/Layout.astro

Source: [`apps/portfolio/src/layouts/Layout.astro`](../../apps/portfolio/src/layouts/Layout.astro).

<a id="src-layouts-layout-astro-note-1"></a>

### Overview

Root shell — delta.dev's REAL two-layer layout (plan13.md,
             verified against their live DOM):

  1. ONE-PAINT BACKGROUND — &lt;body&gt; paints --site-frame-background
     everywhere; the chrome cells use the SAME color, so there is a
     single canvas with independent fixed chrome on top.
  2. FIXED CHROME — ViewportFrame (z-20) holds the four opaque corners
     cells (noise + hatch + border) and the 6px SEGMENTED rail
     ([3/8 brand | 2/8 gray | 3/8 --delta-blue]) fixed atop the content
     track. No 8px accent line — that token was an invention; delta's
     line IS this rail.
  3. SCROLLING LAYER — the z-0 grid mirrors the chrome grid exactly
     ([page-left | 1fr | page-right] margins): sidebar column + main
     column, main carries pt-rail + md:border-r so panels and seams
     scroll BENEATH the fixed rail (the z-0 wrapper creates a stacking
     context, so dropdowns/scrollers inside content cannot escape above
     the chrome).
  4. "=" SEAMS — &lt;Seam /&gt; bands between panels (composed by
     pages/index.astro from the data/sections.ts registry).

&lt;head&gt; (metadata, SEO, fonts, the anti-flash theme init) lives in
BaseHead.astro so the standalone 404 page shares it.
All other behavior lives in bundled custom elements, plus one bundled
script at the end of &lt;body&gt;: clean-URL in-page navigation (no `#id` in
the address bar; see its header).

<a id="src-layouts-layout-astro-note-2"></a>

### Additional note 2

The 1rem inset strips show the unified body watermark directly.
           NO local texture layer here: a noise/hatch layer in the SCROLLING
           content slides over the viewport-FIXED watermark and the two
           high-frequency textures moiré — the visible "vibration" on
           scroll/zoom. (The frame cells keep their noise: it's static
           relative to the fixed pattern, so no relative motion.)

<a id="src-layouts-layout-astro-note-3"></a>

### Additional note 3

Clean-URL in-page navigation: anchors keep their real `#id` hrefs
(no-JS fallback, middle-click, copy link, crawlers), but clicks
scroll without writing `#top`, `#projects`, … into the address bar
or piling up history entries.

WHY THIS APPROACH:

- ONE delegated listener on document covers every in-page link
  (sidebar, mobile header, the mobile menu, future ones) with
  no per-component wiring.

- Scrolling uses the browser's own scrollIntoView/scrollTo with the
  default behavior, so the CSS already in global.css still applies:
  `scroll-behavior: smooth` (auto under reduced motion) and
  `scroll-padding-block` (sections land below the fixed frame).

- The mobile menu is a modal with a scroll lock that restores the
  old scroll position when it closes. Scrolling while it's open
  would be undone, so links inside a dialog wait (rAF poll, max
  ~1s) until the dialog is gone, then scroll.

- Focus moves to the target (preventScroll), matching what native
  hash navigation does for keyboard and screen-reader users.

- A URL that arrives WITH a hash (a shared link like /#contact)
  still deep-links: the hash is read, stripped with replaceState
  (no reload, no extra history entry), and the page jumps to the
  section itself once loaded. Stripping first cancels the
  browser's own fragment jump, so the script does it instead,
  instantly, like a native deep link.

<a id="src-pages-404-astro"></a>

## src/pages/404.astro

Source: [`apps/portfolio/src/pages/404.astro`](../../apps/portfolio/src/pages/404.astro).

<a id="src-pages-404-astro-note-1"></a>

### Overview

Not-found page — the missing URL reported as a compiler
             diagnostic (rustc style), set inside the portfolio's own panel
             language: one bordered surface, the segmented brand rail on
             top, IBM Plex Serif display + Lilex mono, theme tokens only.

WHY A COMPILER ERROR (POC / concept):
A developer's site should fail the way developers' tools fail. rustc's
diagnostics are the best-loved error format in the industry: an error
code, a `-->` location, the offending line with `^^^` carets under the
exact span, then `= help:` suggestions. Here:
  error[E0404]: no route matches `/the-path-you-typed`
   --> akibh.dev/the-path-you-typed
    | GET /the-path-you-typed
    |     ^^^^^^^^^^^^^^^^^^^ not found in this workspace
    = help: did you mean `/#projects`?
The carets are sized to the real path, and "did you mean" is a real
suggestion: a Levenshtein match of the path against the site's section
ids and files (data/sections.ts + known files), exactly like rustc's
"a similarly named item exists". /projcts → /#projects (edit distance),
/cv → /akib_s_resume.pdf (substring hit).
Gutter blue: brand blue tuned per theme for ≥4.5:1 on canvas — #2c5f9e
in light (#346dae itself is 4.45:1), #6f9fdc in
dark where the brand blue reads at only ~3.7:1.

WHY STANDALONE (not Layout.astro): Layout's sidebar uses `#section`
anchors, which would resolve against the broken URL. This page uses
BaseHead (same fonts/theme/meta) and links with absolute `/#…` hrefs.

HOW IT'S SERVED: Cloudflare Pages returns dist/404.html with HTTP 404
for any unknown path. Without this file Pages assumed a single-page app
and answered EVERY unknown URL (even /llms.txt) with the homepage and
200 — a soft-404 that search engines penalise.

SEO: noindex (BaseHead) and excluded from the sitemap (astro.config).
CSP: the script is a normal bundled module (hashed by Astro's CSP);
data comes from data-routes, never define:vars (see the script).
NO JS REQUIRED: the static HTML shows a generic path; the tiny script
only personalises it (path, carets, suggestion).

<a id="src-pages-404-astro-note-2"></a>

### Additional note 2

Personalise the diagnostic: real path, caret span, nearest route.
Routes arrive as JSON in data-routes (not define:vars): define:vars
emits an inline script whose body changes per build, which Astro's
CSP can't hash, so the browser would refuse to run it.

<a id="src-pages-index-astro"></a>

## src/pages/index.astro

Source: [`apps/portfolio/src/pages/index.astro`](../../apps/portfolio/src/pages/index.astro).

<a id="src-pages-index-astro-note-1"></a>

### Overview

One-page portfolio — composition ONLY (plan12 contract).

data/sections.ts is the SINGLE nav registry (id / label / number). This
file binds ids → panel components with one static imports block + one
id-keyed record, then maps the registry — so sidebar stations, the
mobile menu and the page itself can never drift apart.

The "=" SEAMS (ui/Seam.astro — hatched band, border-y) are auto-inserted
BETWEEN panels: none at the top/bottom edge, where the fixed frame's
border-b/t draw the edge lines (delta.dev's own pattern).

WHY the binding lives here (not in data/sections.ts): Astro's Vite
pipeline compiles `.astro` imports only through a component frontmatter
— a plain .ts module importing ".astro/*.astro" fails the build
([builtin:vite-transform] Unexpected token, see plan12.md).

EXTENSIBILITY — adding a section is three additive lines:
  1. src/components/sections/YourThing.astro wrapped in &lt;SectionShell&gt;
  2. one entry appended in data/sections.ts
  3. one import + one record line below
No existing content is edited.

<a id="src-pages-llms-txt-ts"></a>

## src/pages/llms.txt.ts

Source: [`apps/portfolio/src/pages/llms.txt.ts`](../../apps/portfolio/src/pages/llms.txt.ts).

<a id="src-pages-llms-txt-ts-note-1"></a>

### Overview

/llms.txt — the site in plain Markdown for LLMs and AI
             agents, following the llms.txt proposal (https://llmstxt.org):
             H1 name, a > summary, short context, then H2 sections of links.

WHY GENERATED (not a hand-written public/llms.txt): every fact comes from
data/portfolio.ts — the same source the page renders — so the summary
can't drift from the site. `prerender` makes it a static file at build
time (dist/llms.txt); no runtime code.

WHAT IT IS NOT: llms.txt doesn't control crawling. It's a map for agents
that are ALLOWED in (AI search / answer bots) so they read one small file
instead of parsing the full HTML. Crawl permissions live in
public/robots.txt (AI training crawlers are disallowed there).

POC: `curl https://akibh.dev/llms.txt`
