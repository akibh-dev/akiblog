# Delta.dev Chrome Rebuild — post-merge restore (plan13.md)

The plan11/plan12 restructure was lost in the merge-conflict resolution (it was
never committed; the remote versions won). `plan/plan10–12.md` on disk are the
Zed-workspace plans, not this contract, so the spec is re-derived here from
delta.dev's **live** HTML/CSS (`/_astro/global.2kd6PBXL.css`, fetched fresh).

## What delta.dev actually ships (verified today)

```
body.relative.bg-(--site-frame-background)          ← ONE paint, no body-level structure
├─ fixed inset-0 z-20 grid pointer-events-none       ← CHROME LAYER
│   grid-cols-[page-left 1fr page-right]
│   grid-rows-[frame-top 1fr inset-bottom]
│   before:border-y md:before:hidden                 ← mobile-only hairlines
│   ├─ col-span-full row-start-1   bg-frame-background md:border-b   ← top bar (+noise+hatch)
│   ├─ header  mr/ml-page … h-header-height md:hidden                ← mobile header cell
│   ├─ col-start-1 row-start-2     bg-frame-background               ← left gutter (+noise+hatch)
│   ├─ col-start-2 row-start-2     grid-rows-[rail-height 1fr]       ← RAIL cell:
│   │    └─ pointer-events-auto grid grid-cols-8 border-x
│   │       col-span-3 bg-brand-500 | col-span-2 bg-neutral-800 | col-span-3 bg-delta-blue
│   ├─ col-start-3 row-start-2     bg-frame-background               ← right gutter (+noise+hatch)
│   └─ col-span-full row-start-3   bg-frame-background md:border-t   ← bottom bar
└─ relative z-0 grid grid-cols-(--site-columns)
    mr-ml-(--site-page-left/right) pt-(--site-frame-top) pb-(--site-content-bottom)
    ├─ sidebar  (border-x, bg-subtle, pointer-events-auto)
    └─ main col-(--site-main-column) pt-(--site-rail-height) md:border-r
         └─ sections: mx/px-(--site-section-inset) border-x  + <Seam/> between them
```

Token deltas vs. the reverted build (all verbatim from delta CSS):
- `--site-columns: minmax(0,1fr) minmax(0,4fr)` (no gap track), `--site-main-column: 1/2`
- `--site-section-inset: 0rem → 1rem` (desktop)
- `--site-rail-height: .375rem` (6px segmented rail — three solid spans, NO border)
- `--delta-blue: #346dae`; rail middle segment = `--delta-neutral-800`
- NEW `--site-frame-background` (light: cream-100 ⊕ 40% white; dark: neutral ⊕ black 90%;
  forced-colors: Canvas) painted by `html`/`body` + every chrome cell
- DELETED inventions: `--site-column-gap`, `--site-accent-line` (confirmed absent from delta CSS)

## Page-scroll adaptation (ours)

delta scrolls content internally (fixed grid + `--site-content-height`); we keep
document scroll — the verified adaptation: sidebar stays **sticky**, the rail is
painted in the chrome cell (sections scroll beneath it via `main pt-rail`), the
z-0 grid scrolls the page normally. Geometry is identical because content-top =
frame-top + rail. Seams (h-4 border-y hatch band) already match delta verbatim
and survived the merge; keep them.

## Rules honored
- Sidebar/section/terminal **content untouched** — only design plumbing rewrites.
- plan11 fixes preserved: explicit `border-line` colors (Tailwind preflight makes
  bare border-y/border-b inherit currentColor → the "black line" bug), and no
  pointer-trapping fixed layer over the sidebar.
- Registry (`data/sections.ts`) extensibility survives untouched.
