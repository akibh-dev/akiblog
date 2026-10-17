/**
 * @file data/sections.ts
 * @description SINGLE SOURCE OF TRUTH for page-section nav data
 *              (plan11 §3 + plan12 correction).
 *
 * WHY NOT import the .astro panels here: Astro's Vite pipeline compiles
 * `.astro` imports only through a component frontmatter — a plain .ts
 * module importing ".astro/*.astro" fails the build
 * ([builtin:vite-transform] Unexpected token). So this file holds the
 * serializable nav data, and pages/index.astro binds ids → components
 * with one import + one id-keyed record (plan12.md).
 *
 * EXTENSIBILITY CONTRACT — adding a section is three additive lines:
 *   1. src/components/sections/YourThing.astro — wrap content in
 *      <SectionShell id="…" index="NN" label="…">.
 *   2. Append one entry below (id = the SectionShell id; number = "06"…).
 *   3. index.astro: import the panel + add one `record` line.
 * Sidebar stations, mobile menu and the page composition all follow.
 */

export interface SectionEntry {
  /** DOM id of the <section> (must match its SectionShell id) */
  id: string;
  /** Sidebar / menu label */
  label: string;
  /** zero-padded ordinal ("01"…) shown in the eyebrow header */
  number: string;
}

export const sections: SectionEntry[] = [
  { id: "about", label: "About", number: "01" },
  { id: "projects", label: "Projects", number: "02" },
  { id: "writings", label: "Writings", number: "03" },
  { id: "skills", label: "Skills", number: "04" },
  { id: "contact", label: "Contact", number: "05" },
];
