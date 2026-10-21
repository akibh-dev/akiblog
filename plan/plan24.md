# Plan 24 — Clean URLs, root post slugs, home order, fixed TOC heading (owner decision, 2026-10-21)

Amends plan19 §3 (URL contract), plan22 (TOC header) and plan23 (home order, nav).

| # | Change | Where |
|---|---|---|
| 1 | **Clean URLs like the portfolio**: in-page clicks (`#search`, `#tags`, TOC headings…) scroll without writing the hash. Arriving with a hash (`/#tags` from a post) jumps and then strips it. The arrival hash is kept on `<html data-arrived-hash>` for search focus and the TOC spy | `layouts/Layout.astro` (portfolio script) |
| 2 | **Home order**: `#home` → `#search` → `#tags` → `#posts`. Stations are Home / Search / Tags / Posts / Portfolio ↗. Off home, **Posts** is marked active on post pages (`fallback`) and **Tags** on `/tags/<tag>/` | `pages/index.astro`, `data/site.ts` |
| 3 | **Less text**: the `notes@<sha>` stamp (and `lib/source.ts` / `.source.json`) is removed, along with the filler section subtitles. Section titles are kept as `sr-only` h2s for the outline | sidebar, home |
| 4 | **Posts at the root**: `blog.akib35.dev/<slug>/` (was `/posts/<slug>/`). Old shapes 301 via `public/_redirects` (`/posts/:slug/`, `/content/:year/:slug/`). `RESERVED_SLUGS` fails the build if a post would shadow a site route (`tags`, `rss.xml`, `posts.json`, `404`, …) | `pages/[slug].astro`, `lib/posts.ts` |
| 5 | **"On this page" is a fixed heading**, not a station or link: static mono uppercase `text-xs` with a hairline, rendered above the rail's scroll area, so it never scrolls away. The trunk starts below it at the first heading's commit | `SiteSidebar.astro`, `TocTree.astro` |
| 6 | **Active node no longer clipped**: the rail's scroll area clips x too (overflow-y:auto). The 1.4×-scaled node reached x≈-1.4px. Fixed with `-ml-2 pl-2` (wider clip box, no content shift) | `SiteSidebar.astro` |
