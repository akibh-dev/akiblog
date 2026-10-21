# Plan 26 — Featured posts, /api/featured Pages Function, lazy-loaded home feed (2026-10-21)

## Is there server-side code?
The blog itself has none: pages, RSS, sitemap, `/posts.json` and the Pagefind
index are all built at build time, and comments are GitHub's iframe. It deploys to
Pages as plain files. This plan adds **one optional Pages Function**, for the portfolio.

## 1. `featured` flag
Frontmatter `featured: true` (schema default `false`; template
`docs/ui-guide/sample-post.md`). A featured post:
- leads the blog home's **All posts** section in a ★ Featured grid (newest first), and
- is returned first by `GET /api/featured`.

## 2. `GET /api/featured?limit=N` — `apps/blog/functions/api/featured.ts`
- Pages Function. Pages auto-generates `_routes.json` so **only `/api/*`
  invokes code**. Every other request stays a free static asset
  (developers.cloudflare.com/pages/functions/routing).
- Data = the build's own `/posts.json`, read via the built-in **ASSETS** binding.
  There is no second source of truth and no KV/D1.
- Response `{ posts }`: every featured post (newest first), then the newest others
  to fill, exactly `limit` items (1–6, default 4). Item shape = `/posts.json`
  (the portfolio's `BlogPost` + `isoDate`, `type`, `featured`).
- CORS: `https://akib35.dev`, `www.`, and `localhost:4322/4323` (portfolio dev).
  `OPTIONS` answered with 204.
- Cache: `public, max-age=300, s-maxage=3600`. Errors return 502 with `no-store`.
- Local: `bun run preview:blog:pages` (build + `wrangler pages dev`, :4332).
  `astro dev` does not run Functions.
- Portfolio integration (next step, portfolio branch): fetch
  `https://blog.akib35.dev/api/featured?limit=3` at the portfolio's build and map
  onto `BlogPost`, replacing the dummies in `data/portfolio.ts`.

## 3. Home feed: featured first, then newest first, loaded as you scroll
- `lib/posts.ts homeFeed()`: `featured`, then `rest` (newest first) split into
  batches of `FEED_PAGE_SIZE = 6`.
- Batch 1 is in the home HTML (first paint, crawlers, no-JS).
- Batches 2…n are **pre-built HTML fragments** `/feed/<n>/`
  (`pages/feed/[page].astro`, `export const partial = true`): a
  `<template data-feed-batch data-next>` of ready `<li>` cards. They are deterministic
  and static, and reuse the exact Astro card markup and generated images.
- `islands/LoadMore.astro`: an IntersectionObserver with an 800px look-ahead fetches the next
  fragment and appends its `<li>`s. After each batch it measures the sentinel on the next
  frame and continues while it's in range, because an IO alone stalls on tall screens.
  There is a "Load older posts" button (keyboard / retry), an aria-live count, and a no-JS note
  pointing to tags and RSS. Covers stay `loading="lazy"`.
- `PostGrid` hairline rules are global `.post-grid` nth-child CSS, so appended
  cards are ruled correctly.
- Fragments are excluded from the sitemap and `robots.txt` (`/feed/`, `/api/`) and carry no
  `data-pagefind-body` (not in search).

## 4. Verified (real Chromium via Playwright, 15-post fixture, 2 featured)
On load 6 cards. After scrolling, all 13 non-featured cards, oldest last, and the loader
removed. A 9000px viewport loads all 13 with no scroll. The featured grid shows `[fx9, fx3]`.
The API returns featured first + fill, CORS for akib35.dev, and clamps `limit=99` to 6.
