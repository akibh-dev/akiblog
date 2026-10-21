# Plan 19 — Static blog fed by the `notes` repo (supersedes plans 1, 2, 4, 8, 9 for the blog)

Analysis + decisions only, no code yet (AGENTS.md rule 3). The companion
design reference is `apps/blog/UI-GUIDE.md`, which pulls the portfolio's
current tokens, shell and components.

**Verdict:** rebuild `apps/blog` as a **fully static Astro site** whose posts
come from `../notes` at build time, deployed to **Cloudflare Pages**. A
static site fits Pages exactly, so no Worker is needed. The D1/R2/Editor.js/Access
stack is removed.

Decisions confirmed by the user (2026-10-20):

| Topic | Decision |
|---|---|
| Old SSR blog (D1, R2, Editor.js admin, Access, React) | **Replace fully** |
| Comments | **Giscus** (GitHub Discussions, zero backend) |
| Design system | **Copy** the portfolio files into `apps/blog` (no shared package yet) |
| Notes repo | **Jekyll/GitHub Pages stays live** until the blog is ready. Frontmatter must stay Jekyll-compatible |

---

## 1. Architecture

```
 ../notes  (github.com/akibh-dev/notes — still served by Jekyll on GH Pages)
   content/<year>/<slug>/index.md + co-located images
        │
        │  bun run deploy:blog   (run locally, occasionally)
        ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ 1 pull     git -C $NOTES_DIR pull --ff-only                  │
 │ 2 sync     notes/content/** → apps/blog/src/content/posts/   │  (gitignored)
 │            + write src/content/.source.json {sha, date}      │
 │ 3 validate astro check (Zod schema: bad frontmatter = fail)  │
 │ 4 build    astro build  (output: 'static', sharp images)     │
 │ 5 index    pagefind --site dist          (search, optional)  │
 │ 6 deploy   wrangler pages deploy dist --project-name=blog    │
 └──────────────────────────────────────────────────────────────┘
        ▼
 Cloudflare Pages "blog"  →  https://blog.akib35.dev
```

### Why Pages (not a Worker)
- Every page is pre-rendered, and nothing needs server code at request time.
  Giscus runs in an iframe on GitHub's side. Pagefind is a static index.
- It matches the portfolio, which already deploys with `wrangler pages deploy`
  (`.github/workflows/portfolio-deploy.yml`), so there is one deploy method
  for both sites.
- If a dynamic route is ever needed (view counter, etc.), a `functions/`
  directory adds Pages Functions without changing the platform.

### Why copy the content (not point Astro at `../notes` directly)
- Vite's `fs.allow` and the image pipeline expect files inside the project
  root. Relative images (`./github-up-time.png`) next to an `index.md`
  outside the root cause trouble.
- The build is reproducible: `.source.json` pins exactly which notes commit
  was built, and the footer can show `notes@ce77b44`.
- The sync step is the one place to skip non-post files (`_layouts`,
  `_includes`, `index.md`, `README.md`, `_config.yml`).

---

## 2. Content file format: Markdown + YAML frontmatter, one folder per post

**Chosen: `.md` (CommonMark + GFM) with YAML frontmatter, in
`content/<year>/<slug>/index.md`, with assets beside it.** This is the layout
the notes repo already uses.

| Option | Verdict | Reason |
|---|---|---|
| **`.md` + YAML** | ✅ | Renders on GitHub, in Jekyll, and in Astro unchanged. Jekyll reads the same frontmatter. It is the editor default everywhere. |
| `.mdx` | ❌ for now | Jekyll and GitHub render it as broken text. Embedding components only matters later. If a post ever needs it, Astro accepts `.mdx` in the same collection. |
| `.json` / Editor.js blocks | ❌ | Not human-writable, and it was the old admin-editor model. |
| TOML frontmatter (`+++`) | ❌ | Jekyll does not support it. |

**Folder-per-post** keeps the poster image and inline images next to the
text. Moving a post means moving one folder, and relative links work in all
three renderers (GitHub, Jekyll, Astro).

### 2.1 Frontmatter schema

Enforced by Zod in `apps/blog/src/content.config.ts` (via the `glob()` loader
and the `image()` helper). An invalid post **fails the build** with the file
name and field, so nothing broken gets deployed.

| Field | Type | Req. | Default | Used for |
|---|---|---|---|---|
| `title` | string ≤ 90 | ✅ | — | `<h1>`, `<title>`, og:title, JSON-LD headline |
| `description` | string 50–160 | ✅ | — | meta description, og/twitter description, card excerpt, RSS |
| `date` | date `YYYY-MM-DD` | ✅ | — | sorting, `datePublished`, URL-free |
| `updated` | date | | — | "Updated" meta, `dateModified`, sitemap `lastmod` |
| `slug` | kebab-case | | folder name | URL `/posts/<slug>/` and the giscus term. **Never change it after publishing.** |
| `tags` | string[] 1–6, lowercase | ✅ | — | `/tags/<tag>/`, eyebrow, JSON-LD `keywords` |
| `keywords` | string[] | | `tags` | `<meta name="keywords">` + JSON-LD (see note) |
| `type` | `guide` \| `note` \| `essay` \| `reference` | | `note` | type badge, index filter |
| `cover` | relative image path | | — | poster: PostCover frame, hero, og:image (resized at build) |
| `coverAlt` | string | if `cover` | — | alt text for the poster |
| `draft` | boolean | | `false` | excluded from production builds, RSS, sitemap |
| `ai` | `none` \| `assisted` \| `generated` | | `none` | AI disclosure banner (replaces `author: gemini`) |
| `series` | string | | — | "Part n of series" nav |
| `toc` | boolean | | `true` | sidebar TOC stations |
| `comments` | boolean | | `true` | giscus panel |
| `canonical` | URL | | own URL | when a post is cross-posted elsewhere first |
| `layout` | `post` | (Jekyll) | — | **ignored by Astro**, kept so Jekyll still renders |

Notes:
- **`keywords`**: Google ignores `<meta keywords>`. It is emitted because it's
  cheap, and Bing and some aggregators still read it, but SEO actually comes
  from `title`, `description`, headings, the canonical URL, JSON-LD and the
  sitemap. That's why `description` is required and limited in length.
- **`cover`** goes through `image()`. Astro checks that the file exists,
  creates AVIF/WebP for the page, and a **1200×630 JPEG** for `og:image`
  (social scrapers don't reliably accept AVIF/WebP). Source images should be
  at least 1200×630 (1.91:1). The 2:1 PostCover frame crops it slightly
  with object-cover. Posts without a cover get the typographic "document"
  thumbnail on the page and a default site OG image.
- **No `author` field needed.** It's a single-author blog. The existing
  `author: gemini` becomes `ai: generated`.
- Body: `# H1` in the body is **removed by the renderer** (the title comes from
  frontmatter). Current notes start with `# Title`, and Jekyll shows it twice
  as well. Authors should start the body at `##`.

### 2.2 Sample post (`content/2026/sample-post/index.md`)

```markdown
---
layout: post                      # Jekyll only — Astro ignores it
title: "Edge Caching Without Tears"
description: "How I cache Astro pages on Cloudflare Pages: headers, purge strategy, and the two mistakes that cost me a weekend."
date: 2026-10-20
updated: 2026-10-22
slug: edge-caching-without-tears  # optional, defaults to folder name
type: guide
tags: ["cloudflare", "caching", "astro"]
keywords: ["cloudflare pages cache", "cache-control", "astro static"]
cover: ./cover.jpg                # ≥1200×630, next to this file
coverAlt: "A stack of cache layers drawn as terminal windows"
series: "Edge Notes"
ai: none                          # none | assisted | generated
draft: false
toc: true
comments: true
---

Opening paragraph — the first lines readers see. No `# H1` here; the
title above is the H1.

## Why caching gets weird at the edge

Text with an inline image that works on GitHub, Jekyll **and** the blog:

![Cache hit ratio after the fix](./hit-ratio.png)

> [!NOTE]
> GitHub-style alerts render as callouts on GitHub *and* on the blog.

```ts title="src/middleware.ts"
export const onRequest = () => { /* … */ };
```

## Takeaways

- Short, scannable points.
```

```
content/2026/edge-caching-without-tears/
├── index.md
├── cover.jpg
└── hit-ratio.png
```

### 2.3 Migrating the three existing notes
| Post | Changes |
|---|---|
| `browser-rendering-reference` | `author: gemini` → `ai: generated`; remove body `# H1` |
| `github-cli-guide` | remove body `# H1`; optional `cover` |
| `playwright-setup` | remove body `# H1`; optional `cover` |
| `notes/index.md` | existing bug: `(.content/2026/browser-rendering-reference/)` is missing the `/`, so the link is broken on Jekyll |

`description` already exists on all three. Lengths should be checked
against the 50 character minimum (`"Initial steps of Playwright setup"` is 33).
The schema should either relax the minimum to a warning, or the
descriptions get expanded. **Recommendation: treat the minimum as a
build warning, and the maximum (160) as an error.**

---

## 3. Site map (static routes)

| Route | Content |
|---|---|
| `/` | intro panel → latest/featured post → ruled post grid (Writings pattern) → tags panel |
| `/posts/<slug>/` | header panel → cover → article → series/prev-next → giscus |
| `/tags/` , `/tags/<tag>/` | tag index / filtered grid |
| `/rss.xml` | `@astrojs/rss`, full description + cover enclosure |
| `/sitemap-index.xml` | `@astrojs/sitemap` (drafts excluded, `lastmod` from `updated`) |
| `/search/` | Pagefind UI, styled with tokens (Phase 6, optional) |
| `/posts.json` | slug/title/description/date/tags/cover/readingTime, consumed later by the portfolio's Writings section instead of `portfolio.ts` dummies |
| `/404` | — |

URL contract: `/posts/<slug>/`. The year in the folder does **not** appear in the URL,
so a post can move between year folders without breaking links.

---

## 4. Rendering pipeline (Markdown → page)

- **Shiki** dual themes (`themes: {light, dark}`, `defaultColor: false`) and
  CSS-variable switching under `.dark`, so code blocks follow the theme with no JS.
- Code block titles via ```` ```ts title="file.ts" ```` render as a Zed-style
  tab strip (see UI guide §6). Copy button is a vanilla custom element.
- `rehype-slug` + `rehype-autolink-headings` add heading anchors. `render()`
  returns `headings`, which feed the sidebar TOC stations.
- GitHub alerts (`> [!NOTE|TIP|WARNING|CAUTION|IMPORTANT]`) become a small
  remark plugin, so the same syntax renders on GitHub, in Jekyll (as a plain
  quote), and on the blog.
- Reading time: a remark plugin reusing the existing `lib/readingTime.ts` logic,
  written into `remarkPluginFrontmatter.minutes`.
- Body `h1` stripped (see §2.1).
- External links: `rel="noopener"` + external marker. Relative images
  are optimized by Astro with width/height set, so there's no CLS.

## 5. SEO checklist (per post, all from frontmatter)
- `<title>` = `{title} — akib's notes`, `<meta description>`, `<link rel=canonical>`
- Open Graph (`article`, `published_time`, `modified_time`, `tag`, image 1200×630) + Twitter `summary_large_image`
- JSON-LD `BlogPosting` (headline, description, image, dates, keywords, author → Person akib35.dev)
- `robots` noindex on drafts (dev preview) and on `/tags/*` pages with less than 2 posts
- sitemap + RSS + `<link rel=alternate type=application/rss+xml>`
- Semantic `<article>`, `<time datetime>`, a single `h1`, and headings in order

## 6. Comments (giscus)
- `data-mapping="specific"` + `data-term="<slug>"` instead of `pathname`, so
  threads stay attached when the URL moves from GH Pages to blog.akib35.dev.
- Theme: two custom giscus CSS files served from `/giscus/{light,dark}.css`
  built from the same tokens. On theme toggle, a `postMessage({giscus:{setConfig:{theme}}})`
  is sent to the iframe.
- `data-loading="lazy"`, loaded only when the comments panel scrolls into view.
- ⚠️ **Mismatch to fix:** `notes/_includes/giscus.html` says
  `data-repo="akib35/notes"` but the remote is `akibh-dev/notes`. Giscus needs
  the repo it points at to be **public** with Discussions and the giscus app
  enabled. One of the two must be confirmed and the repo-id regenerated if needed.

## 7. `deploy:blog` script

`bun run deploy:blog` at the repo root runs `scripts/deploy-blog.ts`:

| Flag | Effect |
|---|---|
| (none) | pull → sync → check → build → pagefind → `wrangler pages deploy` |
| `--no-pull` | build from the notes worktree as-is (local drafts preview) |
| `--dry-run` | everything except the deploy |
| `--drafts` | include `draft: true` (never with deploy) |
| `NOTES_DIR=…` | override `../notes` |

Guards: stop if `$NOTES_DIR` is missing, if `pull --ff-only` fails (diverged),
or if the akiblog worktree has uncommitted changes in `apps/blog`.
`--commit-message="notes@<sha>"` goes to Pages so the dashboard shows which notes
revision is live. Auth: `wrangler login` locally (or `CLOUDFLARE_API_TOKEN`
with **Account → Cloudflare Pages: Edit** only. The D1/R2/Workers permissions
from plans 5–7 are no longer needed).

Future option (not now): a GitHub Action in `notes` that triggers a
`repository_dispatch` here, so pushing a note publishes it.

## 8. Teardown list (old SSR blog)

Remove: `apps/blog/src/{components/admin,components/blocks,components/editor,
lib/services,lib/db.ts,lib/auth.ts,lib/storage.ts,lib/env.ts,pages/admin,
pages/api,editorjs.d.ts}`, `apps/blog/tests/{integration,helpers}` + the
auth/storage unit tests, `apps/blog/contents/` (old copies of notes),
`apps/blog/dist.tar.gz`, `apps/blog/scripts/dev.js`, `packages/db/`, root
`db:*` scripts, the blog half of `scripts/ship.js` and `.github/workflows/deploy.yml`,
and deps `@astrojs/cloudflare`, `@astrojs/react`, `@editorjs/*`, `drizzle-orm`,
`jose`, `react*`.
Keep (moved into the new code): `readingTime.ts`, `slugify.ts` and their unit tests.

Cloudflare side (manual, at cutover):
1. Create Pages project `blog` (the first `deploy:blog` does it, like the portfolio workflow).
2. Detach `blog.akib35.dev` from the **`blog` Worker** (Workers → blog →
   Domains), then attach it in Pages → blog → Custom domains.
3. Delete the old Worker, the `blog-db` D1 database, the `blog-media` R2 bucket
   and the Access application **only after** the new site is verified. Export
   any D1 posts first if they matter.

## 9. Phases

| # | Phase | Output |
|---|---|---|
| 1 | Teardown + static scaffold | Astro latest, `output:'static'`, Tailwind v4, sharp, no adapter |
| 2 | Design system copy | files from UI guide §2, Astro ThemeSwitch/CopyButton custom elements |
| 3 | Content collection | `content.config.ts` schema, sync step, `.source.json` |
| 4 | Pages + components | §3 routes, PostHeader, Prose, CodeBlock, Callout, TOC stations |
| 5 | SEO | §5 + OG image pipeline + RSS + sitemap |
| 6 | Giscus + Pagefind | §6, search page |
| 7 | `deploy:blog` + cutover | §7, §8 Cloudflare steps |
| 8 | Notes migration | §2.3 edits in `notes`, then retire Jekyll; portfolio Writings reads `/posts.json` |

## 10. Open questions (non-blocking)
1. Giscus repo: `akib35/notes` or `akibh-dev/notes`? Is it public?
2. Want Pagefind search in v1, or later?
3. Blog name/brand line: "akib's notes" (as on Jekyll) or something else?
4. Fonts: the portfolio hotlinks `cdn.delta.dev` (iA Writer Quattro is a
   commercial font). Self-hosting free equivalents in `public/fonts`
   would remove a third-party dependency and the licensing risk for both sites.
