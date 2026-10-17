# Rail scope correction (plan14.md)

plan13 §"page-scroll adaptation" placed the segmented rail in the chrome
grid's middle track (`col-start-2` of `[page-left | 1fr | page-right]`) —
but that track spans sidebar + content. User-verified delta.dev behavior:
the colored bar covers ONLY the scrollable main column, the sidebar column
stays bare.

Cause: delta's rail wrapper is `col-start-2` **within** the content-level
grid that uses `grid-cols-(--site-columns)` (sidebar | main) — not within
the 3-track chrome grid. Correct echo:

```
chrome row-2, middle track:
  <div grid-cols-(--site-columns)>          ← same 2 tracks as the content grid
    <div col-start-2 row-start-1 h-rail …>  ← band lands over main only
      3/8 brand · 2/8 neutral-800 · 3/8 delta-blue
    </div>
  </div>
```

The nested wrapper's width equals the content grid's exactly (both start at
`--site-page-left` and clamp to `--site-max-width`), so `col-start-2` there
is geometrically identical to main — including its `md:border-r` alignment.
Sidebar/main content untouched.
