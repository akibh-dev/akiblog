# Rail inset + sidebar border (plan15.md) — the "||" fix

Screenshot-verified: the left side must read `||` (two vertical lines). Delta's
verbatim nesting (re-extracted from their DOM):

    chrome middle cell — grid-cols-(--site-columns)
      ├─ header (sidebar): border-x + zds-bg-subtle     → the OUTER line
      └─ div.col-(--site-main-column)
             grid-cols-[var(--site-section-inset) 1fr var(--site-section-inset)]
             md:pr-px                                    ← INSET wrapper
           └─ div.col-start-2 grid-rows-[rail,1fr]
              └─ band grid-cols-8 border-x               → the INNER line

plan14 placed the band flush against main's edge and the sidebar had no
border — hence a single line. Two corrections:

1. ViewportFrame: wrap the band in delta's inset wrapper so the band's
   border-x aligns exactly with the panels' border-x (`mx-(--site-section-inset)`
   in SectionShell) and the seams' inset lines — continuous top-to-bottom.
2. SiteSidebar: add `border-x border-line` (delta's sidebar carries border-x;
   content untouched — chrome only).

Result: outer line = sidebar's right border at the track boundary; inner line
= band/panel/seam inset line; they read as `||` at the left edge for the full
column height.
