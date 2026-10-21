# Plan 21 — Owner decisions (2026-10-21): name, domains, search in v1, giscus deferred

Analysis only. Amends plan19 + plan20. Implementation starts in a later session.

## 1. Decisions

| Topic | Decision |
|---|---|
| Blog name | **akiblog**: BrandLogo text, `<title>{post} — akiblog`, `og:site_name`, RSS title, 404 heading domain |
| Domains | `akib35.dev` = portfolio (live, unchanged). `blog.akib35.dev` = new blog. **It currently serves the old SSR blog Worker** → cutover in §4 |
| Search | **Pagefind in v1** (§2) |
| Comments | **Giscus is set up later by the owner**, who pastes the config. The blog ships with a ready slot that stays hidden until it's filled in (§3) |

## 2. Search (Pagefind, v1)

- **Index**: `pagefind --site dist` runs after `astro build`, both in the CI workflow
  (plan20 §3, step 6 becomes mandatory) and in `preview:blog`. Static output
  goes in `dist/pagefind/`, with no server and no third party.
- **What is indexed**: only `<article data-pagefind-body>` on post pages. Sidebar, footer
  and TOC are excluded automatically because nothing else carries `data-pagefind-body`.
  Filters: `data-pagefind-filter="tag"` per tag, `type`. Meta: `title`, `date`, `cover` thumbnail.
- **UI**: a custom `<blog-search>` element (islands/Search.astro) built on the
  Pagefind **JS API** (`import('/pagefind/pagefind.js')`), not Pagefind's
  default UI. The reasons:
  - Results render with our tokens (PostCard-style rows: title, excerpt with `<mark>`
    in `bg-accent-subtle`, tags, date), and there are no foreign styles to override.
  - The default UI injects inline styles, which conflict with the hash-based CSP.
- **Entry points**:
  - the `/search/` page, which works with `?q=` (shareable links, no-JS form fallback).
  - a sidebar station `Search` with a `⌘K` / `Ctrl+K` / `/` shortcut, which opens the same element in a
    native `<dialog>` (MobileMenu pattern). Stations become: Home, Posts, Tags, Search, Portfolio ↗, RSS.
- **Behavior**: 150 ms debounce, ↑/↓/Enter keyboard navigation, `aria-live` result count,
  tag filter chips, and an empty state that suggests tags.
- **CSP**: Pagefind runs WebAssembly, so `script-src` needs **`'wasm-unsafe-eval'`**, along with
  `'self'` for `/pagefind/*.js`. Fetches are same-origin, so `connect-src 'self'` is enough.
- **`_headers`**: `/pagefind/*` gets `Cache-Control: public, max-age=3600` (not immutable,
  since filenames are only partly hashed and each deploy replaces the index).
- **Dev**: `astro dev` has no index, so the element shows "Search is available in
  preview/production builds" instead of failing.

## 3. Giscus slot (owner pastes config later)

- `apps/blog/src/config/giscus.ts` exports `null` until filled. The owner pastes the
  `data-*` values from giscus.app (`repo: "akibh-dev/notes"`, `repoId`, `category`,
  `categoryId`, `mapping`) as an object, with no code change elsewhere.
- `null` hides the Comments panel and its seam. The CSP entries for `giscus.app` are added
  only when the config is non-null (computed in `astro.config.mjs`).
- Mapping: whatever giscus.app generates works. `pathname` is fine because
  `/posts/<slug>/` is stable. A post-level `comments: false` hides the panel for one post.
- Theme sync (light/dark postMessage) and lazy mount ship ready in islands/Comments.astro.

## 4. Cutover of `blog.akib35.dev` (zero-surprise order)

1. Pages project name: **`akiblog`** (not `blog`). `blog.pages.dev` is almost certainly
   taken globally, and plan4 mentions an old `blog-2i8` project. A preview URL like
   `akiblog.pages.dev` also matches the brand. Update plan20 §3 `--project-name` to match.
2. The first CI deploy creates the project. Verify on `akiblog.pages.dev` (search, 404,
   redirects, RSS, both themes).
3. Cloudflare dashboard: Workers → `blog` → Domains & Routes → **remove**
   `blog.akib35.dev`. Then Pages → `akiblog` → Custom domains → **add**
   `blog.akib35.dev`. Same zone, so DNS and the certificate are automatic, with a few minutes of gap.
4. Keep the old Worker, `blog-db` (D1), `blog-media` (R2) and the Access app for
   about a week as a rollback. Export D1 if any post there matters, then delete them.

## 5. Next session starts with
Phase 1 (plan20 §6): teardown of the old SSR blog and a static scaffold, on branch `blog`,
with no commits by the agent.
