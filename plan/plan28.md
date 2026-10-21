# Plan 28 — SEO pass on the live blog (2026-10-21)

Audit of every sitemap URL on https://blog.akib35.dev (stdlib HTML parse of the live
pages) after go-live, and the fixes.

| Finding | Fix | Where |
|---|---|---|
| Home `<title>` 82 chars (Google truncates at ~60) | `akiblog — notes by Md Akib Hasan` (33). Tagline stays the meta description | `layouts/BaseHead.astro` |
| 9 `/tags/<tag>/` pages `noindex` **and** in the sitemap ("Submitted URL marked noindex") | sitemap = home + posts only. Tags stay crawlable via links | `astro.config.mjs` |
| `og.png` was a copy of the **portfolio's** card | generated cards (sharp + libvips text in the blog's own fonts): `/og.png` default + `/og/<slug>.png` per post without a cover (title, type/tags, reading time, date) | `lib/og.ts`, `pages/og.png.ts`, `pages/og/[slug].png.ts` |
| No `llms.txt` (portfolio has one) | `/llms.txt` (llmstxt.org) + plain-Markdown copy per post `/<slug>.md`, linked via `<link rel="alternate" type="text/markdown">` | `pages/llms.txt.ts`, `pages/[slug].md.ts` |
| No breadcrumbs in results | `BreadcrumbList` JSON-LD on posts (akiblog › title) | `BaseHead.astro` |
| Post descriptions 32–44 chars | **author's text, not rewritten**: build prints `[seo]` warnings (aim 50–160) | `lib/posts.ts` |
| Bug found on the way: `[this](./github-up-time.png)` was a live **404** (Astro ships only embedded images) | integration serving co-located post files at `/<slug>/<file>` (dev middleware + copy on build) | `lib/post-assets.ts` |

Font note: sharp's libvips/FreeType can't read WOFF2 and silently falls back to a system
font. The cards use TTF copies (`src/lib/og-fonts/`, decoded from `public/fonts/*.woff2`, OFL),
resolved from the project root, and a missing file fails the build.

Already in place before this pass: canonical, OG/Twitter (`article:*`), `BlogPosting`
JSON-LD with the portfolio's `Person` @id, RSS, robots.txt (AI-training crawlers
disallowed), 404 with `noindex`, a single h1, `<time datetime>`.

Owner follow-ups: register blog.akib35.dev in Google Search Console and Bing Webmaster
(the DNS TXT is easiest on Cloudflare), submit `sitemap-index.xml`, and lengthen the three
post descriptions in the notes repo.
