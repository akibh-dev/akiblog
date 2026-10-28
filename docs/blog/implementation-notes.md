# Blog implementation notes

Architecture, rationale, usage examples, and POCs moved from comments in `apps/blog/` and its deployment workflow.

Notes are grouped by source file. Each source comment points directly to its corresponding note below. Short local comments remain beside the code. These notes preserve the original explanations; they are not a fresh audit of implementation details.

Source links are relative to this guide; paths in the original notes are relative to the repository root unless stated otherwise.

## Source index

### Deployment workflow

- [`.github/workflows/blog-deploy.yml`](#github-workflows-blog-deploy-yml)

### Configuration, data, libraries, and scripts

- [`astro.config.mjs`](#astro-config-mjs)
- [`functions/api/featured.ts`](#functions-api-featured-ts)
- [`scripts/deploy.ts`](#scripts-deploy-ts)
- [`scripts/dev.ts`](#scripts-dev-ts)
- [`scripts/sync-content.ts`](#scripts-sync-content-ts)
- [`src/config/giscus.ts`](#src-config-giscus-ts)
- [`src/content.config.ts`](#src-content-config-ts)
- [`src/data/site.ts`](#src-data-site-ts)
- [`src/env.d.ts`](#src-env-d-ts)
- [`src/lib/markdown.ts`](#src-lib-markdown-ts)
- [`src/lib/og.ts`](#src-lib-og-ts)
- [`src/lib/post-assets.ts`](#src-lib-post-assets-ts)
- [`src/lib/posts.ts`](#src-lib-posts-ts)
- [`src/lib/theme.ts`](#src-lib-theme-ts)
- [`src/lib/toc.ts`](#src-lib-toc-ts)
- [`wrangler.toml`](#wrangler-toml)

### Styles and public files

- [`public/_headers`](#public-headers)
- [`public/_redirects`](#public-redirects)
- [`public/giscus/dark.css`](#public-giscus-dark-css)
- [`public/giscus/light.css`](#public-giscus-light-css)
- [`public/robots.txt`](#public-robots-txt)
- [`src/styles/global.css`](#src-styles-global-css)

### Components and icons

- [`src/components/islands/Comments.astro`](#src-components-islands-comments-astro)
- [`src/components/islands/CopyButton.astro`](#src-components-islands-copybutton-astro)
- [`src/components/islands/CopyCode.astro`](#src-components-islands-copycode-astro)
- [`src/components/islands/LoadMore.astro`](#src-components-islands-loadmore-astro)
- [`src/components/islands/MobileMenu.astro`](#src-components-islands-mobilemenu-astro)
- [`src/components/islands/ScrollSpy.astro`](#src-components-islands-scrollspy-astro)
- [`src/components/islands/Search.astro`](#src-components-islands-search-astro)
- [`src/components/islands/SearchShortcut.astro`](#src-components-islands-searchshortcut-astro)
- [`src/components/islands/TableOfContents.astro`](#src-components-islands-tableofcontents-astro)
- [`src/components/islands/ThemeSwitch.astro`](#src-components-islands-themeswitch-astro)
- [`src/components/islands/TocSpy.astro`](#src-components-islands-tocspy-astro)
- [`src/components/layout/BrandLogo.astro`](#src-components-layout-brandlogo-astro)
- [`src/components/layout/MobileHeader.astro`](#src-components-layout-mobileheader-astro)
- [`src/components/layout/SiteSidebar.astro`](#src-components-layout-sitesidebar-astro)
- [`src/components/layout/TocTree.astro`](#src-components-layout-toctree-astro)
- [`src/components/layout/ViewportFrame.astro`](#src-components-layout-viewportframe-astro)
- [`src/components/sections/Footer.astro`](#src-components-sections-footer-astro)
- [`src/components/sections/PostGrid.astro`](#src-components-sections-postgrid-astro)
- [`src/components/sections/PostHeader.astro`](#src-components-sections-postheader-astro)
- [`src/components/sections/PostNav.astro`](#src-components-sections-postnav-astro)
- [`src/components/sections/TagList.astro`](#src-components-sections-taglist-astro)
- [`src/components/ui/AiBanner.astro`](#src-components-ui-aibanner-astro)
- [`src/components/ui/Hatch.astro`](#src-components-ui-hatch-astro)
- [`src/components/ui/PostCard.astro`](#src-components-ui-postcard-astro)
- [`src/components/ui/PostCover.astro`](#src-components-ui-postcover-astro)
- [`src/components/ui/ScrollRow.astro`](#src-components-ui-scrollrow-astro)
- [`src/components/ui/Seam.astro`](#src-components-ui-seam-astro)
- [`src/components/ui/SectionHeader.astro`](#src-components-ui-sectionheader-astro)
- [`src/components/ui/SectionShell.astro`](#src-components-ui-sectionshell-astro)
- [`src/components/ui/TagPill.astro`](#src-components-ui-tagpill-astro)
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
- [`src/pages/[slug].astro`](#src-pages-slug-astro)
- [`src/pages/[slug].md.ts`](#src-pages-slug-md-ts)
- [`src/pages/feed/[page].astro`](#src-pages-feed-page-astro)
- [`src/pages/index.astro`](#src-pages-index-astro)
- [`src/pages/llms.txt.ts`](#src-pages-llms-txt-ts)
- [`src/pages/og/[slug].png.ts`](#src-pages-og-slug-png-ts)
- [`src/pages/og.png.ts`](#src-pages-og-png-ts)
- [`src/pages/posts.json.ts`](#src-pages-posts-json-ts)
- [`src/pages/rss.xml.ts`](#src-pages-rss-xml-ts)
- [`src/pages/tags/[tag].astro`](#src-pages-tags-tag-astro)

<a id="github-workflows-blog-deploy-yml"></a>

## .github/workflows/blog-deploy.yml

Source: [`.github/workflows/blog-deploy.yml`](../../.github/workflows/blog-deploy.yml).

<a id="github-workflows-blog-deploy-yml-note-1"></a>

### Overview

Blog (akiblog) → Cloudflare Pages deployment

Documentation & Implementation POC (plan20 §3, plan21):

- Same shape as portfolio-deploy.yml: build IN CI from source with bun,
  ensure the Pages project exists, `wrangler pages deploy --branch=main`
  (a PRODUCTION deployment), concurrency so the newest run wins.

- Triggers:
    push to main touching apps/blog/** (or this file)  → code changes
    workflow_dispatch                                 → "publish new notes":
       `bun run deploy:blog` locally runs `gh workflow run` on this file
    repository_dispatch: notes-updated                 → optional hook the
       notes repo can send later (push a note → it publishes itself)

- CONTENT: posts are NOT in this repo. The notes repo
  (github.com/akibh-dev/notes, public) is checked out to .notes and
  apps/blog/scripts/sync-content.ts copies notes/content/** into the
  content collection (`--require`: a missing checkout fails the run
  instead of deploying an empty blog).

- The build runs the content schema (bad frontmatter fails here, before
  anything is deployed) and Pagefind (search index into dist/pagefind).

- Commit message on Pages shows both revisions: blog@&lt;sha&gt; · notes@&lt;sha&gt;.
- After a successful deploy it re-runs portfolio-deploy.yml: the
  portfolio's Writings section fetches /api/featured AT ITS BUILD
  (apps/portfolio/src/lib/blog.ts), so it must rebuild to show new or
  newly featured posts. Dispatch via the job's GITHUB_TOKEN is allowed
  for workflow_dispatch (needs `actions: write` below).

Required GitHub repository secrets (the SAME two as the portfolio):
  CLOUDFLARE_API_TOKEN   token with "Cloudflare Pages: Edit"
  CLOUDFLARE_ACCOUNT_ID  the account that owns the Pages project
Optional: NOTES_TOKEN (fine-grained PAT, Contents: read on akibh-dev/notes)
  only if the notes repo ever becomes private (giscus needs it public).

<a id="astro-config-mjs"></a>

## astro.config.mjs

Source: [`apps/blog/astro.config.mjs`](../../apps/blog/astro.config.mjs).

<a id="astro-config-mjs-note-1"></a>

### Overview

Astro configuration for akiblog (blog.akibh.dev).

POC / Implementation Architecture (plan19–21):

- `output: 'static'` — every page is pre-rendered; Cloudflare Pages serves
  dist/ from its CDN. No adapter, no Worker, no runtime (the old SSR blog
  with D1/R2/Access is gone). Search is Pagefind (a static index built
  after `astro build`), comments will be giscus (an iframe).

- Posts come from the notes repo, synced into src/content/posts/ by
  scripts/sync-content.ts before dev/build (see src/content.config.ts).

- Image service: Astro's default (sharp) — covers and inline images are
  resized to AVIF/WebP at BUILD time, og:image JPEGs too.

- Same design system as the portfolio: Tailwind v4 via @tailwindcss/vite,
  tokens in src/styles/global.css (copied from apps/portfolio @ 091c7cf).

- No UI framework integration: every island is a pure .astro component
  with a vanilla custom element (AGENTS.md / plan 17).

- postAssets (src/lib/post-assets.ts): files a note LINKS to next to its
  index.md (`./pic.png`) are served at /&lt;slug&gt;/&lt;file&gt;, like on GitHub.

- security.csp: the portfolio's hash-based Content-Security-Policy, with
  Turnstile + picsum removed and Pagefind added (see inline notes).

<a id="astro-config-mjs-note-2"></a>

### Additional note 2

sitemap: emits sitemap-index.xml from `site` — home + posts only. Out:
the 404, the /feed/&lt;n&gt;/ lazy-load fragments (plan26), and /tags/&lt;tag&gt;/
(thin listings, noindex below 2 posts — a noindex URL in the sitemap is
a contradictory signal Search Console flags; tags stay crawlable via
links, plan28)

<a id="astro-config-mjs-note-3"></a>

### Additional note 3

Shiki dual themes (light-plus / one-dark-pro, from docs/ui-guide). With
defaultColor:false every token carries BOTH colors as CSS variables
(--shiki-light / --shiki-dark); global.css picks one under `.dark`, so
code blocks follow the theme toggle with zero JS and no flash.

<a id="astro-config-mjs-note-4"></a>

### Additional note 4

Content-Security-Policy — Astro hashes every &lt;script&gt;/&lt;style&gt; it renders
and writes a &lt;meta http-equiv&gt; CSP into each page. No 'unsafe-inline'
for scripts. Allowed extras, and why:
  'wasm-unsafe-eval'          Pagefind compiles its search core from
                              WebAssembly (plan21 §2); this permits
                              WASM compilation ONLY, not JS eval()
  static.cloudflareinsights.com / cloudflareinsights.com
                              Cloudflare Web Analytics beacon (edge-injected)
  https://giscus.app          comments script + iframe + the small
                              default.css its client.js injects into
                              the page (iframe sizing) — only when
                              src/config/giscus.ts is filled in
style-src-attr 'unsafe-inline': Shiki emits per-token style="" attributes
(the dual-theme CSS variables); attributes can't be hashed one by one.

<a id="functions-api-featured-ts"></a>

## functions/api/featured.ts

Source: [`apps/blog/functions/api/featured.ts`](../../apps/blog/functions/api/featured.ts).

<a id="functions-api-featured-ts-note-1"></a>

### Overview

Pages Function for GET /api/featured — the posts the
             portfolio's Writings section shows (plan26).

  portfolio ──GET https://blog.akibh.dev/api/featured?limit=3──▶ this Function
                                                     │ env.ASSETS.fetch("/posts.json")
                                                     ▼  (the build's own static file)
                                       featured first, filled with the newest

RESPONSE  { posts: Post[] }  — exactly `limit` items when the blog has
that many posts: every `featured: true` post (newest first), then the
newest non-featured posts to fill the remaining slots, so a 3-column
Writings row is always full. Item shape = /posts.json (the portfolio's
BlogPost interface + isoDate/type/featured). `limit` 1–6, default 4.

WHY A PAGES FUNCTION (POC / rationale):

1. Everything else on the blog is static. Pages turns `functions/` into
   routes and auto-generates _routes.json so ONLY /api/* runs code —
   every page, image and /posts.json stays a free static request
   (developers.cloudflare.com/pages/functions/routing).

2. NO SECOND SOURCE OF TRUTH: the data is the build artifact
   /posts.json, read through the ASSETS binding (Pages' own static
   asset server — no network hop, no KV/D1). What the blog renders and
   what the API returns come from the same notes commit.

3. A real API surface the portfolio can rely on: `?limit=`, featured
   ordering + fill, CORS for the portfolio origin, explicit caching —
   things a raw static file can't negotiate.

4. CHEAP: responses are CDN-cacheable (s-maxage) and the portfolio is
   static too, so it calls this at ITS build/deploy time, not per visit.

CORS: GET is a "simple" request, so browsers need only the
Access-Control-Allow-Origin on the response; OPTIONS is answered anyway
for clients that pre-flight. Allowed: the portfolio + its local dev
servers. Server-side callers (the portfolio build) ignore CORS.

Types are declared locally (as in the portfolio's functions/api/contact.ts)
so this file needs no @cloudflare/workers-types globals.

Local test: `bun run preview:pages` → http://localhost:4332/api/featured?limit=3

<a id="scripts-deploy-ts"></a>

## scripts/deploy.ts

Source: [`apps/blog/scripts/deploy.ts`](../../apps/blog/scripts/deploy.ts).

<a id="scripts-deploy-ts-note-1"></a>

### Overview

`bun run deploy:blog` — publish the blog with the newest
             notes, by triggering the CI workflow (plan20 §3). Nothing
             is built or uploaded from this machine: one deploy path,
             one set of Cloudflare credentials (GitHub secrets).

WHY TRIGGER CI (not `wrangler pages deploy` locally): CI checks out the
notes repo at its pushed HEAD, so what goes live is exactly what's on
GitHub — not whatever happens to be uncommitted in ../notes. Code
changes still deploy on push to main; this command covers "I pushed a
new note".

WHY -R &lt;repo&gt;: this repo's `origin` is the Forgejo instance
(the self-hosted Forgejo instance); GitHub is the push mirror that runs Actions, so `gh`
can't infer it from the remotes. Override with GH_REPO=owner/name.

Flow: warn if ../notes has unpushed commits → `gh workflow run` →
find the new run → `gh run watch` (exit code = run result).

Requires: gh CLI logged in (`gh auth login`) with access to the repo.

<a id="scripts-dev-ts"></a>

## scripts/dev.ts

Source: [`apps/blog/scripts/dev.ts`](../../apps/blog/scripts/dev.ts).

<a id="scripts-dev-ts-note-1"></a>

### Overview

`bun run dev:blog` entry: live notes sync + Astro dev server
             in ONE terminal, one Ctrl+C.

WHY A SCRIPT (not `a & b` in package.json): `bun --filter` runs scripts
through its own shell; backgrounding with `&` leaves an orphaned watcher
when the dev server exits. Spawning both here ties their lifetimes
together: if either dies, the other is stopped, and Ctrl+C reaches both.

Flow:
  1. sync-content --watch   copies ../notes/content → src/content/posts,
                            then re-syncs on every save in ../notes
  2. astro dev              serves http://localhost:4321 and hot-reloads
                            when src/ or src/content/ changes
Extra args are forwarded to astro (e.g. `bun run dev -- --port 4400`).

<a id="scripts-sync-content-ts"></a>

## scripts/sync-content.ts

Source: [`apps/blog/scripts/sync-content.ts`](../../apps/blog/scripts/sync-content.ts).

<a id="scripts-sync-content-ts-note-1"></a>

### Overview

Copies posts from the notes repo into the blog's content
             collection: &lt;NOTES_DIR&gt;/content/** → src/content/posts/**.

WHY COPY (not point Astro at ../notes directly) — plan19 §1:

- Vite's fs.allow + the image pipeline expect files inside the project
  root; relative images (`./github-up-time.png`) next to an index.md
  outside it break.

- Reproducible builds: the log line names the exact notes commit that
  was copied (CI also puts it in the Pages deploy message).

- One place that decides what is content: only `content/` is copied;
  Jekyll files (_layouts, _includes, index.md, _config.yml) never reach
  the blog.

The notes repo is READ-ONLY here (plan20 §2) — this script never writes
to NOTES_DIR.

USAGE
  bun scripts/sync-content.ts            one-shot sync (build, CI)
  bun scripts/sync-content.ts --watch    sync, then re-sync on every change
                                         (used by `bun run dev:blog`)
  NOTES_DIR=.notes bun scripts/…         CI checkout location
  --require                              fail if NOTES_DIR is missing (CI)

WATCH MODE: a full re-sync per change (debounced). The notes tree is
small (a few MB), so mirroring it whole is simpler and can't drift,
unlike incremental copying (renames/deletes). Astro's dev server watches
src/content/ and hot-reloads the affected pages.

<a id="src-config-giscus-ts"></a>

## src/config/giscus.ts

Source: [`apps/blog/src/config/giscus.ts`](../../apps/blog/src/config/giscus.ts).

<a id="src-config-giscus-ts-note-1"></a>

### Overview

Comments configuration — PASTE YOUR GISCUS VALUES HERE.
             While this is `null` the blog renders no comments panel and
             the CSP does not allow giscus.app (plan21 §3).

HOW TO FILL IT (owner):
  1. github.com/akibh-dev/notes → Settings → enable Discussions; create a
     category (e.g. "Comments", type Announcements recommended).
  2. Install the giscus app on that repo: https://github.com/apps/giscus
  3. Open https://giscus.app, enter `akibh-dev/notes`, pick the category
     and mapping. Copy the values from the generated &lt;script&gt; tag:
       data-repo          → repo
       data-repo-id       → repoId
       data-category      → category
       data-category-id   → categoryId
       data-mapping       → mapping   (pathname is fine: /&lt;slug&gt;/ is stable)
  4. Replace `null` below with the object (example in the comment).
Nothing else needs changing: islands/Comments.astro renders the panel,
matches the site theme (and follows the toggle), and astro.config adds
giscus.app to the CSP automatically.

Per post, `comments: false` in frontmatter hides the panel.

Example:
  export const giscus: GiscusConfig | null = {
    repo: "akibh-dev/notes",
    repoId: "R_kgDO…",
    category: "Comments",
    categoryId: "DIC_kwDO…",
    mapping: "pathname",
  };

<a id="src-config-giscus-ts-note-2"></a>

### Additional note 2

filled 2026-10-21 — ids verified via the GitHub GraphQL API + giscus.app
  (akibh-dev/notes is public, Discussions on, giscus app installed; the
  repo id survived the GitHub username rename, so it matches the
  Jekyll site's _includes/giscus.html)

<a id="src-content-config-ts"></a>

## src/content.config.ts

Source: [`apps/blog/src/content.config.ts`](../../apps/blog/src/content.config.ts).

<a id="src-content-config-ts-note-1"></a>

### Overview

Post schema (reference copy: docs/ui-guide/content.config.ts).
             Spec: plan/plan19.md §2.1 + plan/plan20.md. Template: docs/sample-post.md (copy in notes: _templates/sample.md).

WHY THIS APPROACH (POC):

1. Content Layer `glob()` loader over the folder-per-post layout that the
   notes repo already uses (content/&lt;year&gt;/&lt;slug&gt;/index.md). The deploy
   step syncs that tree into src/content/posts/, so the base stays inside
   the project root (Vite fs + image pipeline).

2. `generateId` = frontmatter `slug` ?? folder name. The year folder is NOT
   part of the id, so `/<slug>/` survives moving a post between years.

3. `image()` validates the cover exists at build and hands Astro an
   ImageMetadata (AVIF/WebP for the page, 1200×630 JPEG for og:image).

4. Zod fails the build on bad frontmatter (file + field in the error), so
   a broken note can never be deployed. Only the description minimum is
   soft (a warning in the page builder), because existing notes are short.

5. Jekyll-only keys (`layout`) pass through untouched: the object is not
   `.strict()`, so the same file keeps rendering on GitHub Pages.

6. `author: gemini` (legacy notes) is mapped to `ai: "generated"` by the
   preprocess step instead of requiring an edit in the notes repo.

7. `featured: true` pins a post: it leads the home page's post list and is
   what GET /api/featured (functions/api/featured.ts) serves the portfolio.

<a id="src-data-site-ts"></a>

## src/data/site.ts

Source: [`apps/blog/src/data/site.ts`](../../apps/blog/src/data/site.ts).

<a id="src-data-site-ts-note-1"></a>

### Overview

Single source of truth for blog identity + navigation —
             the blog's counterpart of the portfolio's data/portfolio.ts
             (identity) and data/sections.ts (nav registry).

WHY ONE FILE (not a copy of portfolio.ts): the copied shell components
(SiteSidebar, MobileMenu, MobileHeader, BaseHead, 404) only read a small
identity subset (name, handle, socials, urls). Copying the whole
portfolio model (projects, skills, dummy posts) would ship dead data
and drift. Every copied component now imports `site` / `stations` from
here instead — one edit re-brands the whole blog.

STATIONS = SECTIONS OF THE HOME PAGE (plan23): the home page is a
one-pager like the portfolio — #home, #search, #tags, #posts (plan24 order) —
so on "/" stations are in-page anchors marked by ScrollSpy. On every
other page (posts, /tags/&lt;tag&gt;/) `stationHref` points them back to
"/#&lt;id&gt;" and `isActive` marks the matching one at build time.

POC:
  import { stations, stationHref, isActive } from "../data/site";
  &lt;a href={stationHref(s, onHome)} aria-current={!onHome && isActive(s, path) ? "true" : undefined}&gt;

<a id="src-env-d-ts"></a>

## src/env.d.ts

Source: [`apps/blog/src/env.d.ts`](../../apps/blog/src/env.d.ts).

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

<a id="src-lib-markdown-ts"></a>

## src/lib/markdown.ts

Source: [`apps/blog/src/lib/markdown.ts`](../../apps/blog/src/lib/markdown.ts).

<a id="src-lib-markdown-ts-note-1"></a>

### Overview

The blog's markdown pipeline extensions, wired in
             astro.config.mjs. Small, dependency-free tree walkers —
             each one is a few lines, so pulling in unist-util-visit /
             rehype-autolink-headings / remark-github-alerts would add
             more surface than it saves.

 remarkStripTitle     drop a leading `# H1` from the body — the page
                      renders frontmatter `title` as the only h1 (the
                      existing notes start with `# Title`; plan20 §1 #9:
                      fixed here, not by editing the notes repo)
 remarkCodeLang       lowercase fence languages (```Bash → bash) — GitHub
                      accepts any case, Shiki only lowercase ids
 remarkAlerts         GitHub alerts `> [!NOTE]` … → <div class="callout
                      callout-note" role="note"> with a title row. Same
                      syntax renders on GitHub, Jekyll (plain quote) and
                      here (docs/ui-guide §7)
 rehypeHeadingAnchors h2–h4 get a trailing &lt;a class="heading-anchor"&gt; to
                      their own id. The link has NO text (the "#" is CSS
                      ::before), so heading text — and therefore TOC
                      labels + Pagefind titles — stay clean
 rehypeExternalLinks  http(s) links to other hosts → rel="noopener
                      noreferrer" + target=_blank + .external (CSS ↗)
 shikiCodeFrame       Shiki transformer: wraps each code block in the
                      Zed-style frame — tab strip (language + optional
                      `title="file.ts"` meta) and a Copy button wired by
                      islands/CopyCode.astro. The button is static HTML,
                      so the hash-based CSP needs no inline script.

POC (astro.config.mjs):
  markdown: {
    processor: unified({ remarkPlugins: [remarkStripTitle, remarkCodeLang, remarkAlerts],
      rehypePlugins: [rehypeHeadingIds, rehypeHeadingAnchors, rehypeExternalLinks()] }),
    shikiConfig: { transformers: [shikiCodeFrame()] },
  }

<a id="src-lib-og-ts"></a>

## src/lib/og.ts

Source: [`apps/blog/src/lib/og.ts`](../../apps/blog/src/lib/og.ts).

<a id="src-lib-og-ts-note-1"></a>

### Overview

Open Graph share cards (1200×630 PNG), rendered at BUILD
             time with sharp — one per post without a cover
             (/og/&lt;slug&gt;.png) and the site default (/og.png).

WHY: links shared on LinkedIn/X/Slack/Discord show this card. The old
/og.png was a copy of the PORTFOLIO's card, so every blog share showed
the wrong brand. A per-post card with the post's title is what makes a
shared link recognisable (posts WITH a cover keep using the cover).

HOW (no new dependency, deterministic on any machine):

- Shapes (background, frame, segmented brand rail, accent dot) are a
  small SVG.

- Text is rendered by libvips/pango with an explicit `fontfile` — the
  blog's own fonts as TTF (src/lib/og-fonts: IBM Plex Serif, Lilex). SVG &lt;text&gt;
  would use whatever system fonts the build machine has (Liberation on
  Fedora, DejaVu on the Ubuntu CI runner) and look different per host.

- Everything is composited into one PNG with sharp (already the image
  service dependency).
Colors are the dark theme's tokens resolved to sRGB (the site default
theme; same values as public/giscus/dark.css).

POC:
  const png = await renderOgCard({ title, eyebrow: "GUIDE / #CSS", meta: "13 min read · Oct 13, 2026" });
  return new Response(png, { headers: { "Content-Type": "image/png" } });

<a id="src-lib-og-ts-note-2"></a>

### Additional note 2

TTF copies of public/fonts/*.woff2 (decoded once; same OFL fonts): the
  libvips/FreeType build inside sharp can't read WOFF2 and falls back to a
  system font WITHOUT an error. Resolved from the project root (`astro
  build` runs in apps/blog) — import.meta.url points into the bundled
  chunk at build time, not at src/. A missing file must fail the build,
  never silently degrade the cards.

<a id="src-lib-post-assets-ts"></a>

## src/lib/post-assets.ts

Source: [`apps/blog/src/lib/post-assets.ts`](../../apps/blog/src/lib/post-assets.ts).

<a id="src-lib-post-assets-ts-note-1"></a>

### Overview

Astro integration: serves every post's CO-LOCATED FILES
             (screenshots, PDFs, archives — anything next to its
             index.md except markdown) at /&lt;slug&gt;/&lt;file&gt;.

WHY: a note can LINK to a file beside it — `[this](./github-up-time.png)`.
GitHub and Jekyll serve the whole folder, so the link works there; Astro
only ships files it processes (EMBEDDED images `![](./x.png)`), so on the
blog a linked file was a 404. With this, `./file` resolves on the blog
exactly like it does on GitHub: post page /&lt;slug&gt;/ + relative file =
/&lt;slug&gt;/&lt;file&gt;.

HOW

- Slug per folder = frontmatter `slug:` if set, else the folder name —
  the same rule as content.config.ts generateId.

- `astro dev`: a dev-server middleware streams the file from
  src/content/posts (so links work while writing, with live sync).

- `astro build`: astro:build:done copies the files into dist/&lt;slug&gt;/.
Nothing is written to public/, so there's nothing to gitignore.

Registered in astro.config.mjs: integrations: [postAssets(), …]

<a id="src-lib-posts-ts"></a>

## src/lib/posts.ts

Source: [`apps/blog/src/lib/posts.ts`](../../apps/blog/src/lib/posts.ts).

<a id="src-lib-posts-ts-note-1"></a>

### Overview

The ONE place pages read posts from: draft filtering,
             ordering, reading time, tag index and prev/next.

WHY A HELPER (not getCollection in every page): the rules "drafts never
ship", "newest first", "tags are counted the same way everywhere" must
be identical for the index, tag pages, RSS, sitemap-adjacent JSON and
the 404 matcher. One module = one definition.

DRAFTS: included in `astro dev` (so you can preview them live from
../notes), excluded from every production build — unless the build is
run with SHOW_DRAFTS=1 (local preview of unpublished posts).

READING TIME: computed from the raw markdown body (code fences count at
half weight — readers skim code), 200 wpm, minimum 1 min. Pure, so it is
stable across builds and needs no remark plugin.

POC:
  const posts = await getPosts();
  const { prev, next } = neighbours(posts, post.id);

<a id="src-lib-posts-ts-note-2"></a>

### Additional note 2

The home page's post list (plan26): featured posts first (newest first
among them), then every other post newest first — split into the batch
rendered in the HTML (`first`) and the batches served as /feed/&lt;n&gt;/
fragments (`pages`, n = 2, 3, …) that load as the reader scrolls.

<a id="src-lib-theme-ts"></a>

## src/lib/theme.ts

Source: [`apps/blog/src/lib/theme.ts`](../../apps/blog/src/lib/theme.ts).

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

<a id="src-lib-toc-ts"></a>

## src/lib/toc.ts

Source: [`apps/blog/src/lib/toc.ts`](../../apps/blog/src/lib/toc.ts).

<a id="src-lib-toc-ts-note-1"></a>

### Overview

Turns a post's headings into git-graph rows for the
             sidebar TOC (layout/TocTree.astro, plan22).

MODEL — the heading outline IS a commit graph:
  h2 → a commit on the TRUNK (lane 0, the sidebar's existing trunk line)
  h3 → a commit on a BRANCH forked from its h2 (lane 1)
  h4 → a commit on a branch forked from its h3 (lane 2)
A branch FORKS at its first child (45° diagonal out of the parent lane)
and MERGES back (45° diagonal into the parent lane) after its last
descendant — exactly how `git log --graph` draws a topic branch.

Each row only needs three numbers to be drawn locally (no global
layout pass, rows can wrap to any height):
  lane      where this heading's node sits
  prevLane  lane of the row above  (prev < lane  → this row forks)
  nextLane  lane of the row below  (next < k     → lane k ends here and
                                    merges into k-1 in the bottom band)

NORMALISATION: outlines can skip levels (h2 → h4). A lane can only be
one deeper than the row above (`lane ≤ prevLane + 1`), so a skipped
level renders as a plain child instead of a branch from nowhere. The
first row hangs off the trunk (prevLane 0) and the last row hands back
to the trunk (nextLane 0), which continues to the sidebar bottom.

Example:
  tocRows([{depth:2,…}, {depth:3,…}, {depth:3,…}, {depth:2,…}])
  → lanes 0,1,1,0  (fork into 1 at row 2, merge back after row 3)

<a id="wrangler-toml"></a>

## wrangler.toml

Source: [`apps/blog/wrangler.toml`](../../apps/blog/wrangler.toml).

<a id="wrangler-toml-note-1"></a>

### Overview

akiblog — Cloudflare Pages configuration (wrangler.toml)

POC / Implementation Architecture:

- Cloudflare Pages project "akiblog" (plan21 §4: `blog.pages.dev` is taken
  globally, and the name matches the brand → akiblog.pages.dev previews).
  `pages_build_output_dir` marks this as a Pages config, making this file
  the source of truth for the project's settings.

- Static site + ONE Pages Function: functions/api/featured.ts
  (GET /api/featured for the portfolio, plan26). Pages auto-generates
  _routes.json so only /api/* invokes it; everything else is free static.
  No bindings to declare — the Function only uses the built-in ASSETS
  binding. `wrangler pages deploy dist`, run from apps/blog, uploads dist/
  AND compiles functions/ (see .github/workflows/blog-deploy.yml).

- Custom domain blog.akibh.dev is attached in the dashboard
  (Pages → akiblog → Custom domains) AFTER detaching it from the old
  `blog` Worker — plan21 §4 cutover order.

<a id="public-headers"></a>

## public/_headers

Source: [`apps/blog/public/_headers`](../../apps/blog/public/_headers).

<a id="public-headers-note-1"></a>

### Overview

Cloudflare Pages response headers (https://developers.cloudflare.com/pages/configuration/headers/)
Copied from apps/portfolio/public/_headers @ 091c7cf. Blog additions: /pagefind/*, /rss.xml.

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

HTML pages: Pages' default caching (revalidate every time, so a deploy is
live at once) + `no-transform`. Why no-transform: the zone's Bot Fight
Mode injects Cloudflare "JavaScript detections" (an inline script that
differs per request) into HTML. Our CSP is a hashed &lt;meta&gt; (Astro static
build), which Cloudflare's injector can't nonce — "not supported with
nonce set via &lt;meta&gt; tags" — so the browser blocked it and logged a CSP
error on every page. Cloudflare skips the injection when the response
carries `no-transform` (developers.cloudflare.com/cloudflare-challenges/
challenge-types/javascript-detections). Bot Fight Mode itself stays on.
Placeholders match ONE path segment with a trailing slash, so assets
(/_astro/x.css, /fonts/x.woff2) keep their own rules below.

<a id="public-redirects"></a>

## public/_redirects

Source: [`apps/blog/public/_redirects`](../../apps/blog/public/_redirects).

<a id="public-redirects-note-1"></a>

### Overview

Cloudflare Pages redirects (https://developers.cloudflare.com/pages/configuration/redirects/)

Posts live at the root: blog.akibh.dev/&lt;slug&gt;/ (plan24). Every older URL
shape for a post 301s there — 301 = permanent, so search engines move
the ranking. One placeholder rule per shape covers every post because the
folder name IS the slug (content.config.ts generateId); a post that
overrides `slug:` falls through to the 404, whose "did you mean" matcher
still suggests it.
  /posts/&lt;slug&gt;/              the blog's first URL scheme (plan19)
  /content/&lt;year&gt;/&lt;slug&gt;/     the notes repo's Jekyll/GitHub Pages layout

<a id="public-giscus-dark-css"></a>

## public/giscus/dark.css

Source: [`apps/blog/public/giscus/dark.css`](../../apps/blog/public/giscus/dark.css).

<a id="public-giscus-dark-css-note-1"></a>

### Overview

giscus comments theme (dark) matching akiblog's tokens.
             Loaded INSIDE the giscus iframe: islands/Comments.astro passes
             this file's absolute URL as the giscus `theme`, and swaps
             light.css ⇄ dark.css when the site's theme toggle flips.

WHY THIS SHAPE

- @import giscus's own "dark" theme first, then override only the
  variables that define surfaces, text, borders, accent and buttons —
  every other primer variable (syntax colors, states) stays coherent.

- Values are the blog's tokens (src/styles/global.css) RESOLVED to rgb in
  a real browser — the iframe can't read our CSS variables, and the
  tokens are oklch()/color-mix() chains. Re-resolve if the palette changes.
  --primary-default / --bg-default are "r, g, b" triplets (giscus uses
  them inside rgba()).

- Fonts: relative URLs resolve against THIS stylesheet, so the same file
  works from localhost and from blog.akibh.dev. /fonts/* is served with
  Access-Control-Allow-Origin: * (public/_headers), required for
  cross-origin font loads.

- Square-ish corners (2px) like the rest of the site.

<a id="public-giscus-dark-css-note-2"></a>

### Additional note 2

Keep borders off the iframe's last pixel column. giscus draws the
  comment box edge-to-edge (right edge = iframe width), so under some
  engines/zoom levels (Safari, Firefox, fractional display scaling) the
  1px right border rounds out of the viewport and looks clipped. body is
  auto-width, so this padding shrinks its content instead of overflowing:
  the box ends 2px inside the frame everywhere.

<a id="public-giscus-light-css"></a>

## public/giscus/light.css

Source: [`apps/blog/public/giscus/light.css`](../../apps/blog/public/giscus/light.css).

<a id="public-giscus-light-css-note-1"></a>

### Overview

giscus comments theme (light) matching akiblog's tokens.
             Loaded INSIDE the giscus iframe: islands/Comments.astro passes
             this file's absolute URL as the giscus `theme`, and swaps
             light.css ⇄ dark.css when the site's theme toggle flips.

WHY THIS SHAPE

- @import giscus's own "light" theme first, then override only the
  variables that define surfaces, text, borders, accent and buttons —
  every other primer variable (syntax colors, states) stays coherent.

- Values are the blog's tokens (src/styles/global.css) RESOLVED to rgb in
  a real browser — the iframe can't read our CSS variables, and the
  tokens are oklch()/color-mix() chains. Re-resolve if the palette changes.
  --primary-default / --bg-default are "r, g, b" triplets (giscus uses
  them inside rgba()).

- Fonts: relative URLs resolve against THIS stylesheet, so the same file
  works from localhost and from blog.akibh.dev. /fonts/* is served with
  Access-Control-Allow-Origin: * (public/_headers), required for
  cross-origin font loads.

- Square-ish corners (2px) like the rest of the site.

<a id="public-giscus-light-css-note-2"></a>

### Additional note 2

Keep borders off the iframe's last pixel column. giscus draws the
  comment box edge-to-edge (right edge = iframe width), so under some
  engines/zoom levels (Safari, Firefox, fractional display scaling) the
  1px right border rounds out of the viewport and looks clipped. body is
  auto-width, so this padding shrinks its content instead of overflowing:
  the box ends 2px inside the frame everywhere.

<a id="public-robots-txt"></a>

## public/robots.txt

Source: [`apps/blog/public/robots.txt`](../../apps/blog/public/robots.txt).

<a id="public-robots-txt-note-1"></a>

### Overview

robots.txt — https://blog.akibh.dev  (copied from apps/portfolio @ 091c7cf; same policy)

POLICY (why it looks like this):

- Search engines: fully allowed. A blog exists to be found.
- AI *search / answer* agents (fetch a page when a person asks about it):
  allowed, so "how do I …?" in ChatGPT / Claude / Perplexity can cite
  this site.

- AI *training* crawlers (bulk-collect content for model training):
  disallowed. They gain nothing for the visitor and can't link back.

- Content-Signal (Cloudflare's Content Signals Policy) is NOT used as a
  directive: Lighthouse/Google flag it as an unknown robots.txt rule
  (SEO audit fails). Our preference, for reference:
  Content-Signal: search=yes, ai-input=yes, ai-train=no

- LLM-friendly map of the blog: /llms.txt (https://llmstxt.org), with a
  plain-Markdown copy of every post at /&lt;slug&gt;.md.

robots.txt is a request, not an enforcement. Hard blocking lives in the
Cloudflare dashboard (Security → Bots → "Block AI bots").

<a id="src-styles-global-css"></a>

## src/styles/global.css

Source: [`apps/blog/src/styles/global.css`](../../apps/blog/src/styles/global.css).

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

<a id="src-styles-global-css-note-11"></a>

### Additional note 11

8. BLOG — article typography (.prose), code frames, callouts.

Everything above this line is copied from apps/portfolio @ 091c7cf — keep
it in sync. This section is blog-only (docs/ui-guide/README.md §7).

WHY HANDWRITTEN (not @tailwindcss/typography): the plugin ships its own
gray scale and dark-mode inversion (`prose-invert`), which would fight
the portfolio's dark ladder. Here every color is a theme token, so dark
mode needs zero extra rules — except Shiki's per-token colors and the
callout accents, the only semantic colors on the site.

Lives in @layer components so utilities on individual elements still win.

<a id="src-styles-global-css-note-12"></a>

### Additional note 12

9. BLOG — page transitions (plan23)

Cross-document View Transitions: when a link goes home ⇄ post (or any
page → page), the browser snapshots both pages and animates between
them. Pure CSS: no router, no JS, nothing for the CSP to hash; pages
still fully load (custom elements, scroll-spy start fresh). Browsers
without support (Firefox today) just navigate normally.

What moves:
  sidebar-nav   the stations ⇄ "On this page" tree swap (SiteSidebar):
                the old list lifts up and fades, the new one rises in a
                beat later, so the rail reads as "the tree re-grows".
  root          everything else (main column) cross-fades quickly; the
                fixed frame, brand and utility zone are pixel-identical
                on both pages, so they appear perfectly still.
The group's own morph is disabled (the two lists have different
heights; morphing would squash them). Reduced motion → no transition.

<a id="src-components-islands-comments-astro"></a>

## src/components/islands/Comments.astro

Source: [`apps/blog/src/components/islands/Comments.astro`](../../apps/blog/src/components/islands/Comments.astro).

<a id="src-components-islands-comments-astro-note-1"></a>

### Overview

giscus comments panel (GitHub Discussions on
             akibh-dev/notes). Renders NOTHING until src/config/giscus.ts
             is filled in (plan21 §3), so posts ship without a dead slot.

WHY A CUSTOM LOADER (not giscus's copy-paste &lt;script data-*&gt;):

- CSP: that snippet is a third-party &lt;script&gt; whose attributes we'd
  have to inline; here a bundled module (hashed by Astro) injects it.

- Lazy: client.js + the iframe load only when the panel is within
  ~600px of the viewport (IntersectionObserver), so readers who never
  reach the end download nothing.

- Theme: the blog's OWN giscus themes, public/giscus/light.css and
  dark.css (giscus base theme + the blog's tokens resolved to rgb + the
  blog fonts), picked from &lt;html class="dark"&gt; at load. A
  MutationObserver re-sends `setConfig({ theme })` to the iframe
  whenever the site's toggle flips — comments never stay in the wrong
  theme. On localhost the stock giscus light/dark themes are used
  (a public iframe can't load localhost resources — Chrome Private
  Network Access); previews and production use the blog's files.
Config rides in data-* attributes (no define:vars → CSP-safe).

Example: &lt;Comments term={post.id} /&gt;

<a id="src-components-islands-comments-astro-note-2"></a>

### Additional note 2

the blog's own themes (public/giscus/{light,dark}.css), as ABSOLUTE
urls — giscus loads them inside its iframe on giscus.app.
On localhost the stock giscus themes are used instead: Chrome's Private
Network Access rule stops a public page (giscus.app) from loading
anything from localhost, so a custom theme can't work in `astro dev`.

<a id="src-components-islands-copybutton-astro"></a>

## src/components/islands/CopyButton.astro

Source: [`apps/blog/src/components/islands/CopyButton.astro`](../../apps/blog/src/components/islands/CopyButton.astro).

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

<a id="src-components-islands-copycode-astro"></a>

## src/components/islands/CopyCode.astro

Source: [`apps/blog/src/components/islands/CopyCode.astro`](../../apps/blog/src/components/islands/CopyCode.astro).

<a id="src-components-islands-copycode-astro-note-1"></a>

### Overview

Wires the Copy button that lib/markdown.ts (shikiCodeFrame)
             renders into every code block's tab strip.

WHY ONE DELEGATED LISTENER (not portfolio CopyButton per block): code
blocks are generated by Shiki inside rendered markdown, where Astro
components can't be placed. The buttons already exist as static HTML
(`button[data-copy]`), so a single document-level click handler covers
any number of blocks with zero per-block JS and no inline scripts (CSP).

BEHAVIOUR = portfolio islands/CopyButton.astro: "Copy" → "Copied!"
(held hover look via data-ok) or "Failed", reverting 2s after the last
click. Copies the code's text content (Shiki line spans flattened), with
a trailing newline trimmed.

Render once per page that has code: &lt;CopyCode /&gt;

<a id="src-components-islands-loadmore-astro"></a>

## src/components/islands/LoadMore.astro

Source: [`apps/blog/src/components/islands/LoadMore.astro`](../../apps/blog/src/components/islands/LoadMore.astro).

<a id="src-components-islands-loadmore-astro-note-1"></a>

### Overview

Infinite-scroll loader for the home page's post list
             (plan26). Appends the pre-built /feed/&lt;n&gt;/ fragments to the
             grid as the reader approaches its end.

HOW

- A sentinel under the grid is watched by an IntersectionObserver with a
  generous rootMargin (800px), so the next batch is fetched BEFORE the
  reader reaches the end — no visible "loading" stall on normal scroll.

- The fragment (pages/feed/[page].astro) is a &lt;template data-feed-batch&gt;
  holding ready-made &lt;li&gt; cards + `data-next` (the following batch URL).
  It's parsed inertly in a &lt;template&gt; (scripts don't run, images don't
  load until adopted) and its &lt;li&gt;s are appended to the grid; PostGrid's
  global nth-child rules re-rule the lines automatically.

- Card images are &lt;Image loading="lazy"&gt;, so appended covers still only
  download when they scroll into view — two levels of laziness.

- After each batch the sentinel is measured on the next frame: an
  IntersectionObserver only reports CHANGES, so a sentinel that is still
  in range (tall screens, short batches) would otherwise stall the feed.

- One request at a time; stops when a batch has no data-next. On a
  failed fetch the button stays, so the reader can retry.

a11y: a real &lt;button&gt; ("Load older posts") does the same thing — the
keyboard / no-IntersectionObserver path, and the retry path. The count
of newly added posts is announced via an aria-live region. Focus is not
moved (auto-loading must not yank a screen-reader user around).

NO-JS: the button is hidden by default and revealed by the script;
without JS a short note points to tags + RSS, where every post is listed.

Example: &lt;LoadMore grid="feed" next="/feed/2/" /&gt;

<a id="src-components-islands-loadmore-astro-note-2"></a>

### Additional note 2

IntersectionObserver only fires on CHANGES: if the sentinel is
still within range after this batch (tall screen, short batch),
it would never fire again. So measure it ourselves once layout
has settled (next frame) and keep going while it's in range.

<a id="src-components-islands-mobilemenu-astro"></a>

## src/components/islands/MobileMenu.astro

Source: [`apps/blog/src/components/islands/MobileMenu.astro`](../../apps/blog/src/components/islands/MobileMenu.astro).

<a id="src-components-islands-mobilemenu-astro-note-1"></a>

### Overview

Mobile navigation sheet — PURE ASTRO, native &lt;dialog&gt;.

Copied from apps/portfolio/src/components/islands/MobileMenu.astro @ 091c7cf.
Keep in sync. BLOG ADAPTATION: stations from data/site.ts — on the home
one-pager they're #section anchors under ScrollSpy (portfolio verbatim),
elsewhere /#section links marked at build time; brand = site.name; the
resume row became the RSS row.
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

Source: [`apps/blog/src/components/islands/ScrollSpy.astro`](../../apps/blog/src/components/islands/ScrollSpy.astro).

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

<a id="src-components-islands-search-astro"></a>

## src/components/islands/Search.astro

Source: [`apps/blog/src/components/islands/Search.astro`](../../apps/blog/src/components/islands/Search.astro).

<a id="src-components-islands-search-astro-note-1"></a>

### Overview

Full-text search over all posts — a &lt;blog-search&gt; custom
             element on top of the Pagefind JS API (plan21 §2). Lives in
             the home page's #search section (plan23); `/?q=…` pre-fills,
             scrolls to the section and survives reloads, so searches
             are shareable links.

WHY THE PAGEFIND *API* (not Pagefind's default UI): the default UI
injects its own inline styles (blocked by our hash-based CSP) and its
own look. With the API, results are plain markup in this file, styled
with the portfolio tokens — they read like PostCards: mono eyebrow,
Plex Serif title, excerpt with matches in the brand wash.

HOW IT WORKS

- Index: `pagefind --site dist` after `astro build` writes /pagefind/.
  The module is imported lazily on first focus/typing (no cost for
  visitors who never search). The URL is built at runtime so Vite
  doesn't try to bundle a file that only exists after the build.

- Pagefind's core is WebAssembly → CSP has 'wasm-unsafe-eval'
  (astro.config), which allows WASM compilation only, not eval().

- Query: debounced 150ms; tag filter chips come from the index itself
  (pagefind.filters()), so they always match what was indexed.

- Each result links to the best sub-result (the heading section with
  the most matches) when there is one — Pagefind returns heading-
  anchored hits, which land on the right #section of long posts.

- Excerpts are Pagefind's HTML (content escaped, only &lt;mark&gt; added), so
  innerHTML is safe for them; everything else uses textContent.

FOCUS: the box sits on the home page, so it must NOT grab focus on a
normal visit (that would hijack keyboard users and scroll position). It
focuses only when the visitor came to search: `?q=`, `/#search` (read
from &lt;html data-arrived-hash&gt; — the URL itself is cleaned), or the
global shortcut (islands/SearchShortcut).

NO-JS: the &lt;form&gt; GETs /?q=… — without JS the section explains that
search needs JavaScript and links to tags, so it never dead-ends.
DEV: `astro dev` has no index → a notice to use `bun run preview:blog`.

a11y: labelled input, results count in an aria-live region, ↑/↓ move
between results, Enter follows (native link), Esc clears.

Example: &lt;Search /&gt;

<a id="src-components-islands-searchshortcut-astro"></a>

## src/components/islands/SearchShortcut.astro

Source: [`apps/blog/src/components/islands/SearchShortcut.astro`](../../apps/blog/src/components/islands/SearchShortcut.astro).

<a id="src-components-islands-searchshortcut-astro-note-1"></a>

### Overview

Global keyboard shortcut to search: `/`, ⌘K or Ctrl+K.
             On the home page it scrolls to the #search section and
             focuses the box; on any other page it goes to /#search
             (where the box focuses itself on arrival). Rendered once by
             Layout.

WHY NO MODAL: the home #search section already IS the full search UI
with shareable ?q= URLs; a second modal copy would double the code for
the same job.

Ignored while typing in an input/textarea/contenteditable (so "/" can
still be typed), and with other modifiers (Ctrl+Shift+K etc. stay
browser shortcuts). ~15 lines, CSP-hashed bundled module.

<a id="src-components-islands-tableofcontents-astro"></a>

## src/components/islands/TableOfContents.astro

Source: [`apps/blog/src/components/islands/TableOfContents.astro`](../../apps/blog/src/components/islands/TableOfContents.astro).

<a id="src-components-islands-tableofcontents-astro-note-1"></a>

### Overview

Inline "On this page" block above the article, BELOW lg —
             where the sidebar git-tree TOC (layout/TocTree.astro) is not
             shown (phones have no sidebar; the md rail is too narrow
             for nested labels). plan22.

WHY &lt;details&gt;: closed by default, so the article starts right under the
header on a phone; one tap opens the outline. Works without JS — the
scroll-spy (islands/TocSpy) only adds the active-heading highlight.
Indentation follows the same lane model as the tree (lib/toc.ts), so a
skipped heading level never indents twice.

Re-themed from the Delta reference (docs/ui-guide §6): canvas inset
panel, mono labels, accent tick on the active item.

Example: &lt;TableOfContents headings={headings} /&gt;

<a id="src-components-islands-themeswitch-astro"></a>

## src/components/islands/ThemeSwitch.astro

Source: [`apps/blog/src/components/islands/ThemeSwitch.astro`](../../apps/blog/src/components/islands/ThemeSwitch.astro).

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

<a id="src-components-islands-tocspy-astro"></a>

## src/components/islands/TocSpy.astro

Source: [`apps/blog/src/components/islands/TocSpy.astro`](../../apps/blog/src/components/islands/TocSpy.astro).

<a id="src-components-islands-tocspy-astro-note-1"></a>

### Overview

Scroll-spy for any "on this page" list: wraps its slot in a
             &lt;toc-spy&gt; element that marks the heading being read with
             aria-current="location" on its `a[data-toc-link]`.
             Used by the sidebar git-tree TOC (layout/TocTree.astro) and
             the inline mobile TOC (islands/TableOfContents.astro).

LOGIC — from docs/ui-guide/TableOfContents.astro (Delta reference):
rAF-throttled scroll tracking against each heading's document offset
minus its scroll-margin-top; a click-settle window so a clicked jump
isn't overridden mid-scroll; the last heading wins at page bottom
(short final sections never reach the top).

ADDED for the sidebar tree:

- The active link is kept visible inside its own scroll container (a
  long outline scrolls in the fixed sidebar) by adjusting that
  container's scrollTop directly — NOT scrollIntoView, which would
  also try to scroll the window and fight the reader.

- Rows also get data-trail on the active heading's ancestors (the h2
  above an active h3, …) so the tree can tint the path to the commit,
  like a checked-out branch.

WHY a wrapper element: several spies can coexist (sidebar + inline);
each instance tracks only its own links. Bundled module (CSP-hashed).

Example: &lt;TocSpy&gt;&lt;nav&gt;…&lt;a href="#x" data-toc-link data-lane="1"&gt;…&lt;/a&gt;&lt;/nav&gt;&lt;/TocSpy&gt;

<a id="src-components-layout-brandlogo-astro"></a>

## src/components/layout/BrandLogo.astro

Source: [`apps/blog/src/components/layout/BrandLogo.astro`](../../apps/blog/src/components/layout/BrandLogo.astro).

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

Source: [`apps/blog/src/components/layout/MobileHeader.astro`](../../apps/blog/src/components/layout/MobileHeader.astro).

<a id="src-components-layout-mobileheader-astro-note-1"></a>

### Overview

Mobile top bar (below md); navigation lives in the
             MobileMenu island (pure Astro, native &lt;dialog&gt; — focus trap,
             Esc, backdrop dismiss come from the platform).

Copied from apps/portfolio @ 091c7cf. Keep in sync. BLOG ADAPTATION:
brand = site.name, links to "/".

<a id="src-components-layout-sitesidebar-astro"></a>

## src/components/layout/SiteSidebar.astro

Source: [`apps/blog/src/components/layout/SiteSidebar.astro`](../../apps/blog/src/components/layout/SiteSidebar.astro).

<a id="src-components-layout-sitesidebar-astro-note-1"></a>

### Overview

Desktop sidebar — on delta.dev the sidebar IS the header.

Copied from apps/portfolio/src/components/layout/SiteSidebar.astro @ 091c7cf.
Keep in sync. BLOG ADAPTATION (the only deviations):
 - stations come from data/site.ts. The HOME page is a one-pager
   (#home / #tags / #search sections), so there they are in-page anchors
   with ScrollSpy + the hop connector, exactly like the portfolio. On
   every other page they link back (/#tags …) and the active one is
   decided at build time (isActive → aria-current="true", zero JS).
 - brand wordmark: "akiblog" + "by akibh"; the resume row became the
   RSS row (a blog's primary CTA is subscribing).
 - POST PAGES (lg+): the stations are REPLACED by the post's TABLE OF
   CONTENTS (layout/TocTree.astro, plan22/23) — a station-styled
   "On this page" header, then h2 commits on the trunk, h3/h4 on forked
   branches. Stations ⇄ TOC share the view-transition name
   `sidebar-nav`, so navigating home ⇄ post animates the swap. The decorative tree moves into the spacer
   under the last row (its own SVG, pattern starting at the spacer top),
   so it continues below the TOC instead of being drawn over it.
   Long outlines scroll inside the rail (data-toc-scroll); the trunk SVG
   lives inside the scrolled content so it spans the full height.

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
group-aria-[current=page]:* — the only JS is ScrollSpy itself.

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
    (group-aria-[current=page]:scale-[1.4]). A detached SVG circle
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

scroll area — -ml-2/pl-2 (and -mr-5/pr-5) widen the CLIP box without
       moving content: the active node is scaled 1.4× around x=3.5, so its
       left edge sits at ≈-1.4px and overflow-y:auto (which also clips x)
       used to slice it.

<a id="src-components-layout-sitesidebar-astro-note-6"></a>

### Additional note 6

rail — ONE SVG paints the whole line system as a single unit:
           the trunk &lt;line&gt; is painted exactly once (no stacking), and
           the pattern holds ONLY branches + commit nodes (no trunk).
           No viewBox: SVG user units = CSS px, so the mockup's geometry
           renders 1:1. pattern width="100%" → exactly ONE tile column;
           nothing crosses tile edges → seamless vertical tiling.
           Absolutely positioned behind the in-flow stations, whose
           opaque node fills paint cleanly over the trunk.

<a id="src-components-layout-sitesidebar-astro-note-7"></a>

### Additional note 7

SITE STATIONS — home + non-post pages. On a post they're shown
           only below lg (where the TOC tree is hidden); from lg the TOC
           takes the rail. `sidebar-nav` is the view-transition name the
           stations ⇄ TOC swap animates under (global.css §9).

<a id="src-components-layout-sitesidebar-astro-note-8"></a>

### Additional note 8

hop connector (home only, positioned by ScrollSpy against
                   this relative wrapper) — accent segment that exists ONLY
                   while hopping between stations: grows out of the
                   previously active node toward the current one, then
                   retracts into it. Portfolio verbatim.

<a id="src-components-layout-sitesidebar-astro-note-9"></a>

### Additional note 9

POST PAGES (lg+): the rail IS the table of contents — a
           station-styled "On this page" header on the trunk, then the
           outline as a commit graph (TocTree). Same view-transition name
           as the stations, so navigating home ⇄ post morphs one into the
           other. The md rail (~108px) is too narrow for nested labels →
           below lg the post shows its inline TOC and the stations stay.

<a id="src-components-layout-sitesidebar-astro-note-10"></a>

### Additional note 10

commits — hollow r=3 circles: r=3 + 1px stroke = 7px
                 outer, EXACTLY the station nodes' size-[7px] border-box
                 (same border-line bg-canvas). Junction circles at
                 (3.5, 60) and (3.5, 720) mask the branch/trunk joints
                 with an opaque fill.

<a id="src-components-layout-sitesidebar-astro-note-11"></a>

### Additional note 11

utility zone — resume download + socials share ONE hairline-
       separated block at the bottom of the rail (delta.dev keeps its
       sidebar footer items grouped under a single rule the same way).
       Resume first: it's the primary recruiter CTA, socials are ambient.

<a id="src-components-layout-sitesidebar-astro-note-12"></a>

### Additional note 12

socials — horizontal icon-only buttons (name lives in tooltip +
         aria-label), then the blog's RSS feed as the 4th glyph (moved here
         from the Writings header: it's a site-wide subscription, not a
         per-section action). 4 buttons must fit the narrow md rail
         (~108px content column): size-6 + gap-0.5 → 4×24 + 3×2 = 102px;
         lg relaxes to size-7 + gap-1.5 (4×28 + 3×6 = 130px, room to spare).

<a id="src-components-layout-toctree-astro"></a>

## src/components/layout/TocTree.astro

Source: [`apps/blog/src/components/layout/TocTree.astro`](../../apps/blog/src/components/layout/TocTree.astro).

<a id="src-components-layout-toctree-astro-note-1"></a>

### Overview

The post's table of contents drawn AS the sidebar's git
             tree (plan22): h2 = commits on the trunk, h3 = commits on a
             branch forked from their h2, h4 = a branch off the h3.
             Branches fork and merge with the same 45° diagonals, 1.2px
             strokes and 7px hollow commit nodes as the portfolio's
             decorative tree, so the TOC reads as that tree come alive.

GEOMETRY (px, SVG user units = CSS px, x measured from the nav's left):
  lane x     X(L) = 3.5 + 16·L        (lane 0 = the existing trunk at 3.5)
  node       center y = T = 15        (pt 7 + half of the 16px first line)
  fork       top band 0→T:   M X(L-1) 0 L X(L) T     (dx 16, dy 15 ≈ 45°)
  merge      bottom band 16: M X(k) 0 L X(k-1) 16    (dx 16, dy 16 = 45°)
  row        pt 7 + label + pb 8 → ≥ 31, so T + merge band always fit
Lane spacing is 16 (not the decorative tree's 25) so three lanes plus a
label fit the narrow lg sidebar column.

WHY PER-ROW SEGMENTS (not one SVG for the whole tree): labels wrap, so
row heights are only known after layout. Each row draws just its own
pieces from lib/toc.ts's lane numbers — verticals are CSS boxes
(top/bottom insets stretch with the row), diagonals are fixed-size SVGs
pinned to the row's top (fork) or bottom (merge) band. Nothing is
measured in JS, and it survives font loading, zoom and resize.

WHY LANE 0 IS NEVER DRAWN HERE: the sidebar's single trunk &lt;line&gt; already
paints x=3.5 top to bottom. Painting it again would double the alpha of
the semi-transparent --ui-border-subtle in light mode — the exact
double-paint bug SiteSidebar's header documents. Diagonals only TOUCH
the trunk at their end point.

STATES (from islands/TocSpy): aria-current="location" → filled accent
node (scaled 1.4×, like the active station) + accent label;
data-trail on its ancestors → accent-outlined node + stronger label,
so the path from trunk to the commit you're reading lights up.

HEADER: "On this page" is a fixed heading rendered by SiteSidebar ABOVE
the rail's scroll area (plan24), so this component starts straight
with the first commit — the trunk begins at its node.

Example: &lt;TocTree headings={headings} /&gt;

<a id="src-components-layout-viewportframe-astro"></a>

## src/components/layout/ViewportFrame.astro

Source: [`apps/blog/src/components/layout/ViewportFrame.astro`](../../apps/blog/src/components/layout/ViewportFrame.astro).

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

<a id="src-components-sections-footer-astro"></a>

## src/components/sections/Footer.astro

Source: [`apps/blog/src/components/sections/Footer.astro`](../../apps/blog/src/components/sections/Footer.astro).

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

<a id="src-components-sections-postgrid-astro"></a>

## src/components/sections/PostGrid.astro

Source: [`apps/blog/src/components/sections/PostGrid.astro`](../../apps/blog/src/components/sections/PostGrid.astro).

<a id="src-components-sections-postgrid-astro-note-1"></a>

### Overview

Ruled grid of PostCards — the portfolio Writings grid
             (`ul.grid border-t lg:grid-cols-3`, columns split by
             hairlines) generalised to any number of posts, and to posts
             appended later by the lazy loader (islands/LoadMore).

WHY THE BORDER MATH: the portfolio grid has exactly 3 posts (one row),
so `lg:border-l` on every item after the first was enough. With N posts
the grid wraps, so lines are drawn per cell from its POSITION:
  - every cell: border-b (row separator; the grid's border-t is the top
    rule); the last row drops it so it doesn't double the seam below
  - md (2 cols): border-l on the 2nd cell of each row
  - lg (3 cols): border-l on cells that aren't first in their row
Pure nth-child CSS, so cards appended by LoadMore re-flow the lines
automatically (the old "last row" stops being last, and so on).

WHY GLOBAL CSS (not Astro-scoped): scoped rules only match elements
rendered by THIS component instance's hash. Appended batches come from
/feed/&lt;n&gt;/ fragment pages — scoping would leave their cells unruled.
The `.post-grid` class is the namespace instead.

MODES
  &lt;PostGrid posts={…} /&gt;                 the &lt;ul&gt; + items
  &lt;PostGrid posts={…} id="feed" /&gt;       same, with an id for LoadMore
  &lt;PostGrid posts={…} itemsOnly /&gt;       just the &lt;li&gt;s (fragment pages)

<a id="src-components-sections-postheader-astro"></a>

## src/components/sections/PostHeader.astro

Source: [`apps/blog/src/components/sections/PostHeader.astro`](../../apps/blog/src/components/sections/PostHeader.astro).

<a id="src-components-sections-postheader-astro-note-1"></a>

### Overview

Post hero — replaces the Delta reference BlogHeader
             (docs/ui-guide §6: no author avatar, single-author blog).

  ← All posts                                   (mono back link)
  GUIDE / #web / #css                           (eyebrow: type + tag links)
  Title in IBM Plex Serif                       (the page's only h1)
  description in mono subtle                    (= meta description)
  ▮▮▮▮▯▯▯▯ 4 min read · Oct 13, 2026 · Updated Oct 20, 2026
  [AI disclosure banner, if ai ≠ none]

WHY the description is shown: it is written for SEO anyway (required,
≤160 chars), and showing it keeps meta description and visible lead in
sync — search snippets match what readers see.
The reading meter is the PostCard meter at a larger scale, so card and
page read as one system.

SEARCH (Pagefind, plan21 §2): the header is a second data-pagefind-body
region (the article is the first), so title + description are indexed
and the h1 becomes the result title. Navigation and meta text are
data-pagefind-ignore. Tags/type are FILTERS (attribute form `tag:web`,
so the visible "#" never leaks into filter values); the ISO date is the
sort key, the formatted date a result meta.

Example: &lt;PostHeader post={post} /&gt;

<a id="src-components-sections-postnav-astro"></a>

## src/components/sections/PostNav.astro

Source: [`apps/blog/src/components/sections/PostNav.astro`](../../apps/blog/src/components/sections/PostNav.astro).

<a id="src-components-sections-postnav-astro-note-1"></a>

### Overview

Older / newer post links at the end of an article — a
             two-column ruled row (replaces the Delta reference
             MorePosts list; docs/ui-guide §6).

WHY two plain cells (not cards): the reader has just finished a post;
the next action is "keep reading", so the titles are the content —
same Plex Serif title + mono eyebrow language as PostCard, split by one
hairline. A missing side leaves an empty cell so the newer post always
sits on the right (direction stays meaningful). rel=prev/next helps
crawlers walk the archive.

Example: &lt;PostNav prev={olderPost} next={newerPost} /&gt;

<a id="src-components-sections-taglist-astro"></a>

## src/components/sections/TagList.astro

Source: [`apps/blog/src/components/sections/TagList.astro`](../../apps/blog/src/components/sections/TagList.astro).

<a id="src-components-sections-taglist-astro-note-1"></a>

### Overview

Ruled list of all tags with counts — the home page's #tags
             section (plan23; was the standalone /tags/ page).

WHY A LIST (not a cloud): font-size clouds are hard to scan and fail
contrast at the small end. A ruled, count-sorted list reads like the
rest of the site (hairlines, mono meta, serif names) and doubles as an
index of the whole blog — each row shows the newest post under the tag.

Lines: border-t on the list, border-b per row, border-l on the right
column (md). The last row(s) drop border-b so they don't double the
seam line below the panel.

Example: &lt;TagList tags={tagIndex(posts)} /&gt;

<a id="src-components-ui-aibanner-astro"></a>

## src/components/ui/AiBanner.astro

Source: [`apps/blog/src/components/ui/AiBanner.astro`](../../apps/blog/src/components/ui/AiBanner.astro).

<a id="src-components-ui-aibanner-astro-note-1"></a>

### Overview

AI-disclosure note under the post header, shown when the
             post's frontmatter says `ai: assisted | generated`
             (legacy `author: gemini` is mapped to `generated` by the
             content schema).

WHY: readers deserve to know when a text was machine-written or
machine-assisted — stated plainly, once, at the top, without alarm
colors. Brand wash + left rule (docs/ui-guide §9), Sparkles glyph from
the portfolio icon set, role="note" so screen readers announce it as
an aside rather than part of the article.

Example: &lt;AiBanner level="generated" /&gt;

<a id="src-components-ui-hatch-astro"></a>

## src/components/ui/Hatch.astro

Source: [`apps/blog/src/components/ui/Hatch.astro`](../../apps/blog/src/components/ui/Hatch.astro).

<a id="src-components-ui-hatch-astro-note-1"></a>

### Overview

Delta.dev's signature 45° diagonal hatch pattern band.

WHY: This SVG pattern appeared 6× duplicated in the previous build.
As a component it's defined once and themed via the `--color-hatch`
token (currentColor inherits, so dark mode needs zero extra code).

@prop height - band height (Tailwind class), default h-3

<a id="src-components-ui-postcard-astro"></a>

## src/components/ui/PostCard.astro

Source: [`apps/blog/src/components/ui/PostCard.astro`](../../apps/blog/src/components/ui/PostCard.astro).

<a id="src-components-ui-postcard-astro-note-1"></a>

### Overview

One post column — the portfolio's Writings column
             (apps/portfolio/src/components/sections/Writings.astro
             @ 091c7cf), extracted as a reusable card for PostGrid.

POC / WHY THIS SHAPE (verbatim from Writings, docs/ui-guide §9):

1. LINES, NOT BOXES — the card draws no border of its own; PostGrid
   separates columns with hairlines, so a row reads as one ruled sheet.

2. COVER — ui/PostCover in its proof-sheet frame; posts without a cover
   get the typographic "document" thumbnail, so mixed rows stay aligned.

3. NO AUTHOR BYLINE (single-author blog) — that slot carries the topic
   eyebrow (type + first tags) and a reading-time meter (1 tick ≈ 1 min,
   8 max) + date, so length is visible before clicking.

4. Whole card is one link (one tab stop, big target); title is the
   accessible name, the cover is decorative (alt="").

5. `headingLevel` keeps the outline valid wherever the grid is placed.

Example: &lt;PostCard post={post} /&gt;

<a id="src-components-ui-postcover-astro"></a>

## src/components/ui/PostCover.astro

Source: [`apps/blog/src/components/ui/PostCover.astro`](../../apps/blog/src/components/ui/PostCover.astro).

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

Copied from apps/portfolio/src/components/ui/PostCover.astro @ 091c7cf.
Keep in sync. BLOG ADAPTATION: `banner` is the post's `cover` as
ImageMetadata (validated by the content schema) rendered through
astro:assets &lt;Image&gt; → resized + AVIF/WebP at build, real width/height
(no CLS). `eager` for the above-the-fold cover on a post page.

Example: &lt;PostCover title={post.data.title} slug={post.id} banner={post.data.cover} /&gt;

<a id="src-components-ui-scrollrow-astro"></a>

## src/components/ui/ScrollRow.astro

Source: [`apps/blog/src/components/ui/ScrollRow.astro`](../../apps/blog/src/components/ui/ScrollRow.astro).

<a id="src-components-ui-scrollrow-astro-note-1"></a>

### Overview

Horizontal snap-scroller for card rows (metrics, posts, skills).

WHY: CSS scroll-snap gives native-feeling horizontal scrolling with zero
JavaScript. Edge fade masks signal overflow. Cards size fluidly with
min() so they never overflow small viewports (the responsiveness bug in
the previous build used fixed 320px cards).

<a id="src-components-ui-seam-astro"></a>

## src/components/ui/Seam.astro

Source: [`apps/blog/src/components/ui/Seam.astro`](../../apps/blog/src/components/ui/Seam.astro).

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

<a id="src-components-ui-sectionheader-astro"></a>

## src/components/ui/SectionHeader.astro

Source: [`apps/blog/src/components/ui/SectionHeader.astro`](../../apps/blog/src/components/ui/SectionHeader.astro).

<a id="src-components-ui-sectionheader-astro-note-1"></a>

### Overview

Section header row: serif title + one-line mono description
             on the left, an optional slot (count, CTA) on the right.

The portfolio's Writings header ("From the blog" + "Field notes on …",
apps/portfolio/src/components/sections/Writings.astro @ 091c7cf),
extracted so every home section (Search, Tags, Posts) shares the same
rhythm. No "NN. Label" eyebrow: the title says what the section is, and
the sidebar stations already number the page.

Padding is part of the header so it works in full-bleed (pad="p-0")
panels whose content (grids, lists) runs edge to edge below it.

Example:
  &lt;SectionHeader title="Tags" description="Browse posts by topic."&gt;
    &lt;span slot="aside"&gt;9 tags&lt;/span&gt;
  &lt;/SectionHeader&gt;

<a id="src-components-ui-sectionshell-astro"></a>

## src/components/ui/SectionShell.astro

Source: [`apps/blog/src/components/ui/SectionShell.astro`](../../apps/blog/src/components/ui/SectionShell.astro).

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

<a id="src-components-ui-tagpill-astro"></a>

## src/components/ui/TagPill.astro

Source: [`apps/blog/src/components/ui/TagPill.astro`](../../apps/blog/src/components/ui/TagPill.astro).

<a id="src-components-ui-tagpill-astro-note-1"></a>

### Overview

Tag link pill — the portfolio's icon-pill style
             (apps/portfolio/src/icons/README.md "skill pill"):
             hairline border, mono 2xs label, brand border on hover.
             Optional count in text-muted.

WHY a link (not a button/filter): every tag has a static page
(/tags/&lt;tag&gt;/), so the pill works without JS, can be opened in a new
tab and is crawlable. 24px+ target height (portfolio a11y contract).

Example: &lt;TagPill tag="cloudflare" count={3} /&gt;

<a id="src-components-ui-versecalligraphy-astro"></a>

## src/components/ui/VerseCalligraphy.astro

Source: [`apps/blog/src/components/ui/VerseCalligraphy.astro`](../../apps/blog/src/components/ui/VerseCalligraphy.astro).

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

Source: [`apps/blog/src/icons/IconBase.astro`](../../apps/blog/src/icons/IconBase.astro).

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

Source: [`apps/blog/src/icons/index.ts`](../../apps/blog/src/icons/index.ts).

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

Source: [`apps/blog/src/icons/lang/Python.astro`](../../apps/blog/src/icons/lang/Python.astro).

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

Source: [`apps/blog/src/icons/tech/Django.astro`](../../apps/blog/src/icons/tech/Django.astro).

<a id="src-icons-tech-django-astro-note-1"></a>

### Overview

Icon: Django — the "dj" monogram in a rounded badge (Django's own
favicon). Badge pattern as TypeScript/JavaScript. Redrawn: a bare "d"
was unrecognizable and looked like a typo next to the other glyphs.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-docker-astro"></a>

## src/icons/tech/Docker.astro

Source: [`apps/blog/src/icons/tech/Docker.astro`](../../apps/blog/src/icons/tech/Docker.astro).

<a id="src-icons-tech-docker-astro-note-1"></a>

### Overview

Icon: Docker — whale hull carrying a 3+2 container stack, plus eye.
Simplified from 6 boxes + spout: at 16–20px the extra top box and the
spout curve clumped into a blob (GUIDE.md pitfall 5: remove detail).
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-flutter-astro"></a>

## src/icons/tech/Flutter.astro

Source: [`apps/blog/src/icons/tech/Flutter.astro`](../../apps/blog/src/icons/tech/Flutter.astro).

<a id="src-icons-tech-flutter-astro-note-1"></a>

### Overview

Icon: Flutter — the logo's two parallel 45° shards: a long upper bar
(top-right → left) and the lower chevron that folds back on itself.
Redrawn: the previous three-piece version had misaligned edges.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-git-astro"></a>

## src/icons/tech/Git.astro

Source: [`apps/blog/src/icons/tech/Git.astro`](../../apps/blog/src/icons/tech/Git.astro).

<a id="src-icons-tech-git-astro-note-1"></a>

### Overview

Icon: Git — rounded diamond (rotated square, inside the 2→22 live area;
the old sharp diamond ran to the canvas edge and clipped) holding the
logo's branch: an entry line from the upper-left edge into a node, a
stem down to a second node, and a branch out to a third node.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-icons-tech-linux-astro"></a>

## src/icons/tech/Linux.astro

Source: [`apps/blog/src/icons/tech/Linux.astro`](../../apps/blog/src/icons/tech/Linux.astro).

<a id="src-icons-tech-linux-astro-note-1"></a>

### Overview

Icon: Linux — Tux reduced to what survives at 16px: egg body, belly
oval, two eyes, beak, and flat feet. Redrawn: flippers and inner
contour lines from the previous version merged into noise when small.
Theme-aware via currentColor (see IconBase.astro).

<a id="src-layouts-basehead-astro"></a>

## src/layouts/BaseHead.astro

Source: [`apps/blog/src/layouts/BaseHead.astro`](../../apps/blog/src/layouts/BaseHead.astro).

<a id="src-layouts-basehead-astro-note-1"></a>

### Overview

Everything inside &lt;head&gt;, shared by every page (index, posts,
             tags, search, 404): charset/viewport, SEO + social metadata,
             structured data, anti-flash theme init, self-hosted fonts.

Copied from apps/portfolio/src/layouts/BaseHead.astro @ 091c7cf — fonts,
theme init and CSP ordering are byte-identical; keep those in sync.
BLOG ADAPTATION: an ARTICLE mode on top of the portfolio's WEBSITE mode.

SEO / SOCIAL (what each tag is for):

- &lt;link rel="canonical"&gt;: one URL per page; a post may override it with
  frontmatter `canonical` when it was first published elsewhere.

- Open Graph: `article` + published/modified time + one `article:tag`
  per tag for posts; `website` elsewhere. og:image is ABSOLUTE (crawlers
  don't resolve relative URLs) and 1200×630 — posts pass their cover
  (rendered to JPEG by the page, see pages/[slug].astro), others
  fall back to public/og.png.

- JSON-LD: WebSite on every page; BlogPosting + BreadcrumbList on posts (headline,
  description, image, dates, keywords, author → the portfolio's Person
  node `https://akibh.dev/#person`, so Google links blog + portfolio).

- `keywords` meta: ignored by Google, still read by Bing/aggregators —
  cheap, so emitted (plan19 §2.1 note).

- `noindex`: drafts in preview builds, the 404, thin tag pages.

CSP NOTE (from the portfolio): Astro writes its CSP &lt;meta&gt; AFTER this
head content, so the inline anti-flash script runs before the policy
applies. Keep it inline and first.

POC:
  &lt;BaseHead title="…" description="…" /&gt;
  &lt;BaseHead title={post.title} description={…} article={{ published, modified, tags }} image={ogUrl} /&gt;
  &lt;BaseHead title="404 — Not found" noindex /&gt;

<a id="src-layouts-layout-astro"></a>

## src/layouts/Layout.astro

Source: [`apps/blog/src/layouts/Layout.astro`](../../apps/blog/src/layouts/Layout.astro).

<a id="src-layouts-layout-astro-note-1"></a>

### Overview

Root shell — delta.dev's two-layer layout, identical to the
             portfolio (plan13.md):

  1. ONE-PAINT BACKGROUND — &lt;body&gt; paints --site-frame-background
     everywhere (+ the fixed brand watermark from global.css).
  2. FIXED CHROME — ViewportFrame (z-20): frame cells + the 6px
     SEGMENTED rail ([3/8 brand | 2/8 gray | 3/8 --delta-blue]).
  3. SCROLLING LAYER — z-0 grid mirroring the chrome grid: sidebar
     column + main column; main carries pt-rail + md:border-r so panels
     and seams scroll BENEATH the fixed rail.
  4. "=" SEAMS — pages compose &lt;SectionShell/&gt; panels joined by &lt;Seam/&gt;.

Copied from apps/portfolio/src/layouts/Layout.astro @ 091c7cf. Keep the
markup in sync. BLOG ADAPTATIONS:

- Props are forwarded to BaseHead (article SEO: image, dates, tags…);
  `toc` goes to SiteSidebar, which draws it as the git tree (plan22).

- Clean-URL in-page navigation, ported from the portfolio (plan24):
  `#home/#search/#tags/#posts` and TOC `#heading` clicks scroll without
  writing the hash into the address bar; arriving WITH a hash
  (/#tags from a post page, a shared /x/#setup) jumps there, then strips
  it. The arrival hash is kept on &lt;html data-arrived-hash&gt; for islands
  that care where the visitor was headed (search focus, TOC spy).

- SearchShortcut: `/` or ⌘K/Ctrl+K → /search/ from every page.
- A visually-hidden skip link to #main-content (a11y; posts are long
  and the sidebar comes first in DOM order).

POC:
  &lt;Layout title={post.data.title} description={post.data.description} article={{ … }}&gt;
    &lt;SectionShell id="intro"&gt;…&lt;/SectionShell&gt;
  &lt;/Layout&gt;

<a id="src-layouts-layout-astro-note-2"></a>

### Additional note 2

Clean-URL in-page navigation — the portfolio's Layout script
(apps/portfolio/src/layouts/Layout.astro @ 091c7cf), verbatim
except for `data-arrived-hash`.

WHY: anchors keep real `#id` hrefs (no-JS fallback, middle-click,
copy link, crawlers), but clicks scroll without writing `#tags`,
`#setup`, … into the address bar or piling up history entries.

- ONE delegated listener covers every in-page link (stations, TOC,
  heading anchors, mobile menu).

- Native scrollIntoView, so global.css `scroll-behavior: smooth`
  (auto under reduced motion) and `scroll-padding-block` (land
  below the fixed frame) still apply.

- Links inside the open mobile &lt;dialog&gt; wait until it has closed
  (its scroll lock would undo the scroll).

- Focus moves to the target (preventScroll), like native hash nav.
- Arriving WITH a hash still deep-links: read → stripped with
  replaceState (cancels the browser's own jump) → jump instantly
  once loaded. Recorded on &lt;html data-arrived-hash&gt; first.

<a id="src-pages-404-astro"></a>

## src/pages/404.astro

Source: [`apps/blog/src/pages/404.astro`](../../apps/blog/src/pages/404.astro).

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
/cv → the résumé (substring hit).
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

Copied from apps/portfolio/src/pages/404.astro @ 091c7cf. Keep the
markup/script in sync. BLOG ADAPTATION (data only, plan20 §4):

- routes = blog stations + every post slug + every tag, so a typo in a
  post URL (/playwrite-setup) suggests the real post. The matcher
  compares the LAST path segment with each key — the slug for posts.

- "Available routes" lists the site sections (stations) only; listing
  every post would turn the diagnostic into an archive page.

- Buttons: Home + Portfolio ↗ (the portfolio's 404 points at the blog).

<a id="src-pages-404-astro-note-2"></a>

### Additional note 2

Personalise the diagnostic: real path, caret span, nearest route.
Routes arrive as JSON in data-routes (not define:vars): define:vars
emits an inline script whose body changes per build, which Astro's
CSP can't hash, so the browser would refuse to run it.

<a id="src-pages-slug-astro"></a>

## src/pages/[slug].astro

Source: [`apps/blog/src/pages/[slug].astro`](../../apps/blog/src/pages/[slug].astro).

<a id="src-pages-slug-astro-note-1"></a>

### Overview

One post — composition (docs/ui-guide §5 "Post page"):

  Panel        PostHeader (eyebrow · h1 · description · meta) + AiBanner
  Panel (p-0)  cover in the PostCover proof frame
  Seam
  Panel        article.prose  (TOC = the sidebar's git tree on lg+,
                               an inline &lt;details&gt; above the article below lg)
  Seam
  Panel (p-0)  PostNav (older / newer)
  Seam
  Panel        Comments (giscus) — only once src/config/giscus.ts is set
  Seam         and the post doesn't say `comments: false`
  Footer

URL CONTRACT (plan24): /&lt;id&gt;/ — the slug right after the domain, since
the blog has no other content pages. id = frontmatter slug ?? folder name
(content.config.ts generateId) — the year folder is not in the URL.

OG IMAGE: the cover is rendered to a 1200×630 JPEG via getImage() at
build — social scrapers don't reliably accept AVIF/WebP (plan19 §2.1).
Posts without a cover get their own generated card, /og/&lt;slug&gt;.png
(lib/og.ts, plan28).

<a id="src-pages-slug-md-ts"></a>

## src/pages/[slug].md.ts

Source: [`apps/blog/src/pages/[slug].md.ts`](../../apps/blog/src/pages/[slug].md.ts).

<a id="src-pages-slug-md-ts-note-1"></a>

### Overview

/&lt;slug&gt;.md — the plain-Markdown copy of each post, for LLM
             answer engines (linked from /llms.txt, llmstxt.org) and as
             &lt;link rel="alternate" type="text/markdown"&gt; on the post page.

The source markdown straight from the notes repo, with a small header
(title, summary, canonical URL, date, tags) so the file stands alone.
Relative links/images (`./pic.png`) are made absolute against the post's
HTML URL, so they resolve outside the site. Drafts never get one.

<a id="src-pages-feed-page-astro"></a>

## src/pages/feed/[page].astro

Source: [`apps/blog/src/pages/feed/[page].astro`](../../apps/blog/src/pages/feed/[page].astro).

<a id="src-pages-feed-page-astro-note-1"></a>

### Overview

One lazy-load batch of the home page's post list, as a bare
             HTML FRAGMENT (`partial = true`: no &lt;html&gt;/&lt;head&gt;/layout) —
             /feed/2/, /feed/3/, … built at build time (plan26).

WHY PRE-RENDERED FRAGMENTS (not JSON + client templating): the cards are
Astro components (PostCover's optimized &lt;Image&gt;, the reading meter…).
Rendering them here, at build time, reuses that exact markup and the
images Astro already generated; the client only fetches and appends —
no card template duplicated in JS, nothing to keep in sync. The output is
still 100% static and deterministic (same notes commit → same files).

Batch 1 is NOT a fragment: it is in the home page HTML itself (first
paint, crawlers, no-JS). Each fragment carries `data-next` so LoadMore
knows the following URL without a manifest; the last one omits it.

Kept out of search results and indexes: no data-pagefind-body (Pagefind
skips it), excluded from the sitemap (astro.config) and robots.txt.

<a id="src-pages-index-astro"></a>

## src/pages/index.astro

Source: [`apps/blog/src/pages/index.astro`](../../apps/blog/src/pages/index.astro).

<a id="src-pages-index-astro-note-1"></a>

### Overview

Blog home — a ONE-PAGER like the portfolio (plan23):
             its sections ARE the sidebar stations (data/site.ts),
             marked by ScrollSpy as you scroll.

  #home    Panel   intro: wordmark h1, tagline, tag row (no eyebrow)
  Seam
  #search  Panel   SectionHeader + full-text search (Pagefind island)
  Seam
  #tags    Panel   SectionHeader + ruled topic list with counts
  Seam
  #posts   Panel   SectionHeader, then FEATURED grid (frontmatter
                   `featured: true`, newest first), then every other post
                   newest first: the first batch in this HTML, the rest
                   lazy-loaded from /feed/&lt;n&gt;/ as the reader scrolls
                   (islands/LoadMore, plan26)

HEADERS (plan25): portfolio Writings style — serif title + one short
mono line (ui/SectionHeader). No "NN. Label" eyebrows: the title names
the section and the sidebar stations already give the page order.
  Seam
  Footer   Square Kufic band (portfolio footer)

ORDER (plan24): search right under the intro — the fastest way to a
known post — then topics, then the full archive, which is the longest
panel and therefore last. Every panel is one station, so ScrollSpy
always has exactly one section to mark.

Other pages (posts, /tags/&lt;tag&gt;/) are "blog pages": separate routes,
stations link back here (/#tags …). Old /tags/ and /search/ URLs
redirect to these sections (public/_redirects). The URL stays clean
(no #section) — Layout's clean-URL script, as on the portfolio.

<a id="src-pages-llms-txt-ts"></a>

## src/pages/llms.txt.ts

Source: [`apps/blog/src/pages/llms.txt.ts`](../../apps/blog/src/pages/llms.txt.ts).

<a id="src-pages-llms-txt-ts-note-1"></a>

### Overview

/llms.txt — the blog's summary for LLM answer engines, in
             the llmstxt.org format (H1, blockquote summary, H2 link
             lists). The portfolio has the same file (akibh.dev/llms.txt)
             and links here.

WHY: AI search/answer agents (ChatGPT search, Claude, Perplexity) fetch a
page when a person asks about it; llms.txt gives them a clean map of the
site, and every post links to its plain-Markdown copy (/&lt;slug&gt;.md,
pages/[slug].md.ts) instead of HTML full of navigation. robots.txt still
disallows AI *training* crawlers — this is for answering, not training.
Posts are listed featured-first, then newest (same order as the home).

<a id="src-pages-og-slug-png-ts"></a>

## src/pages/og/[slug].png.ts

Source: [`apps/blog/src/pages/og/[slug].png.ts`](../../apps/blog/src/pages/og/[slug].png.ts).

<a id="src-pages-og-slug-png-ts-note-1"></a>

### Overview

Per-post Open Graph card, /og/&lt;slug&gt;.png (1200×630), built
             at build time by lib/og.ts — for posts WITHOUT a cover
             (posts with one use the cover, rendered to JPEG by
             pages/[slug].astro). Title, type/tags eyebrow, reading
             time + date, in the blog's own fonts and colors.

<a id="src-pages-og-png-ts"></a>

## src/pages/og.png.ts

Source: [`apps/blog/src/pages/og.png.ts`](../../apps/blog/src/pages/og.png.ts).

<a id="src-pages-og-png-ts-note-1"></a>

### Overview

The site's default Open Graph card, /og.png (1200×630) —
             home, tag pages, 404. Rendered at build by lib/og.ts.
             (Replaces the copy of the PORTFOLIO's og.png that used to
             sit in public/, which branded every blog share wrongly.)

<a id="src-pages-posts-json-ts"></a>

## src/pages/posts.json.ts

Source: [`apps/blog/src/pages/posts.json.ts`](../../apps/blog/src/pages/posts.json.ts).

<a id="src-pages-posts-json-ts-note-1"></a>

### Overview

Machine-readable post list for the portfolio's Writings
             section (plan20 §6 phase 8): replaces the dummy posts in
             apps/portfolio/src/data/portfolio.ts.

SHAPE = the portfolio's `BlogPost` interface (title, excerpt, date,
readingTime, tags, slug, url, banner?), so the portfolio can map it 1:1.
`banner` is an absolute URL of a 960px WebP rendered from the cover at
build time (same size the portfolio's PostCover requests).

Order: newest first (lib/posts getPosts). `featured` marks pinned posts.

This static file is ALSO the data source of GET /api/featured
(functions/api/featured.ts), which reads it through the Pages ASSETS
binding — one build artifact, so the page, the feed and the API can
never disagree. Cross-origin reads of this file itself are allowed for
the portfolio by public/_headers.

<a id="src-pages-rss-xml-ts"></a>

## src/pages/rss.xml.ts

Source: [`apps/blog/src/pages/rss.xml.ts`](../../apps/blog/src/pages/rss.xml.ts).

<a id="src-pages-rss-xml-ts-note-1"></a>

### Overview

RSS 2.0 feed of all published posts (@astrojs/rss).

WHY description-only items (no full HTML body): feed readers then show
the same summary search engines and social cards use, and readers click
through to the real page — where code frames, callouts and the TOC
actually work (a feed reader strips our CSS + scripts anyway).
Categories = tags, so readers can filter; drafts never appear
(lib/posts getPosts). Absolute links come from `site` in astro.config.

<a id="src-pages-tags-tag-astro"></a>

## src/pages/tags/[tag].astro

Source: [`apps/blog/src/pages/tags/[tag].astro`](../../apps/blog/src/pages/tags/[tag].astro).

<a id="src-pages-tags-tag-astro-note-1"></a>

### Overview

Posts for one tag: header panel (eyebrow, `#tag` h1, count,
             sibling tag pills) + the ruled PostGrid.

SEO: tag pages with a single post are thin duplicates of that post's
card, so they are `noindex, follow` (crawlers still follow to the post)
— plan19 §5. (They still appear in the sitemap; robots meta wins, and
they become indexable automatically once a second post uses the tag.)
