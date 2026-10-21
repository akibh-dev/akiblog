# Plan 22 — Sidebar git tree IS the table of contents (owner decision, 2026-10-21)

Overrides plan20 §5 (right-hand TOC column) and docs/ui-guide §4.2 ("TOC
not in the sidebar"). Implemented in this session.

## Decision
On post pages, the sidebar's git tree below the site stations is the post's
outline drawn as a commit graph:

| Heading | Graph element |
|---|---|
| `h2` | commit on the **trunk** (lane 0, the existing trunk line under the stations) |
| `h3` | commit on a **branch** forked from its `h2` (lane 1) |
| `h4` | commit on a branch forked from its `h3` (lane 2) |

A branch **forks** at 45° from the parent lane at its first child and
**merges** back at 45° after its last descendant, like `git log --graph`. A
skipped level (h2 → h4) is normalised to one level deeper (lane ≤ previous + 1).

## States
- Reading position (scroll-spy) → `aria-current="location"`: filled accent node
  scaled 1.4× (same as the active station) + accent label.
- Ancestors of the active heading → `data-trail`: accent-outlined nodes, so the
  path from trunk to the current commit lights up.
- The active row is kept visible inside the sidebar's own scroll area. The window
  is never scrolled by the spy.

## Implementation
| File | Role |
|---|---|
| `apps/blog/src/lib/toc.ts` | headings → rows `{lane, prevLane, nextLane}` (pure, no layout pass) |
| `apps/blog/src/components/layout/TocTree.astro` | per-row segments: CSS verticals + fixed-size 45° SVG fork/merge bands. Lane 0 is never repainted (single trunk paint, no alpha stacking) |
| `apps/blog/src/components/islands/TocSpy.astro` | shared scroll-spy custom element (from the Delta TOC logic) + trail + in-rail reveal |
| `SiteSidebar.astro` | `toc` prop. Scrollable rail. Decorative tree moved into the spacer below the last row |
| `islands/TableOfContents.astro` | inline `<details>` TOC **below `lg`** only (phones have no sidebar; the md rail is ~108px) |

Geometry: lane x = 3.5 + 16·L (16px lanes so three levels + labels fit the
lg rail), node center 15px from row top, fork band 15px, merge band 16px.
