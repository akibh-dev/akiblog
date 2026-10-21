# Plan 23 — Home one-pager, sidebar mode switch, nav transition (owner decision, 2026-10-21)

Amends plan22 (TOC position in the rail) and plan21 §2 (search entry points).

## 1. Two kinds of pages
| Page | What it is | Sidebar rail |
|---|---|---|
| `/` | **One-pager**, like the portfolio: sections `#home` (intro + all posts), `#tags` (topic list), `#search` (Pagefind) | **Stations** Home / Tags / Search / Portfolio ↗ as in-page anchors, ScrollSpy + hop connector (portfolio verbatim) |
| `/posts/<slug>/` | blog page | **lg+: "On this page" + the git-tree TOC replaces the stations.** Below lg: stations (`/#tags` …) + inline TOC above the article |
| `/tags/<tag>/` | blog page | stations as `/#…` links, Tags marked active at build time |

- Standalone `/tags/` and `/search/` are removed. `public/_redirects` sends
  them (301) to `/#tags` and `/#search`.
- Search: the form GETs `/?q=…`. A shared `/?q=` link fills the box, runs the
  search and scrolls to `#search`. The box focuses only on `?q=`, `#search` or
  the `/` ⌘K shortcut, and never on a plain visit to the home page.

## 2. "On this page" header
Drawn as a station (7px node scaled 1.4×, filled accent + outlined accent
pill, the station label type). It is the first row of the rail on post
pages, so the trunk starts at its node like it starts at HOME's.

## 3. Transition
Cross-document View Transitions (`@view-transition { navigation: auto }`,
global.css §9). Pure CSS: no router, no JS, CSP-neutral, and a plain
navigation where unsupported.
- `sidebar-nav` (stations on one page, TOC on the other): the old list lifts
  up and fades with a slight blur (220ms), and the new one rises in 100ms later (420ms).
  The group morph is disabled so lists of different heights don't squash.
- `root`: a fast 200ms cross-fade. The frame, brand and utility zone are
  pixel-identical on both pages, so they look still.
- `prefers-reduced-motion: reduce` turns it off.
