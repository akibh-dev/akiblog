# Plan 16 — match delta's top-left corner exactly (comparison verified)

Delta screenshot comparison shows three remaining deviations:

1. **Sidebar starts below the colored bar in ours.** Delta's sidebar column
   begins at `--site-frame-top` (the topbar's bottom edge) — its border-x runs
   from there. Ours anchored `sticky top-(--site-content-top)` = frame-top +
   6px rail → both borders started just under the band. Fix: aside top
   → `--site-frame-top`, height `calc(100dvh - frame-top - content-bottom)`.

2. **No background between the `| |` lines.** Delta shows hatch/noise texture
   in the 1rem strip between the sidebar's right border and the band's inner
   line — because delta paints that texture across ALL of main (`absolute
   inset-0 z-0` noise + 45° hatch inside main, behind thepanels). Ours had no
   main-level texture → flat. Fix: add the same bg layer as main's first child;
   sections (positioned, later in DOM) paint above it; seams show it.

3. **Sidebar surface.** Delta's sidebar is `zds-bg-subtle` (visible color
   difference against the textured strip). Ours is transparent (flat bg).
   Fix: `bg-surface` on the aside (chrome only — content untouched).

The 6px rail band itself already starts at frame-top (chrome row 2) ✅.
Content (logo/nav/socials/sections) untouched — all three are positioning/background fixes.
