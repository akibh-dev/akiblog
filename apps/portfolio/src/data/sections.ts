/* For more details, see docs/portfolio/implementation-notes.md#src-data-sections-ts-note-1. */

export interface SectionEntry {
  /** DOM id of the <section> (must match its SectionShell id) */
  id: string;
  /** Sidebar / menu label */
  label: string;
  /** zero-padded ordinal ("01"…) shown in the eyebrow header */
  number: string;
}

export const sections: SectionEntry[] = [
  { id: "home", label: "Home", number: "01" },
  { id: "about", label: "About", number: "02" },
  { id: "projects", label: "Projects", number: "03" },
  { id: "writings", label: "Writings", number: "04" },
  { id: "skills", label: "Skills", number: "05" },
  { id: "contact", label: "Contact", number: "06" },
];
