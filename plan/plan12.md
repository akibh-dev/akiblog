# Registry Correction (plan12.md)

plan11 §3 proposed `data/sections.ts` importing the five `.astro` panels
directly. Build evidence:

  [builtin:vite-transform] Unexpected token
      src/data/sections.ts:26 — import Hero from "../components/sections/Hero.astro"

Astro compiles `.astro` imports only through a component frontmatter (its
Vite plugins do not transform `.astro` modules imported from a plain `.ts`
file). Correct contract:

  • `data/sections.ts` stays the SINGLE data registry (id / label / number)
    feeding navigation (sidebar stations, mobile menu, ScrollSpy consumers).
  • `pages/index.astro` binds ids → panels with one static imports block and
    an id-keyed record, then maps the registry — the composition loop (and
    the auto-inserted Seams) still derive from the registry alone.

Extensibility (delta vs plan11): adding a section is ONE registry entry +
one import line + one record line in index.astro — all additive, no edits
to existing content. Content untouched, as the user instructed.
