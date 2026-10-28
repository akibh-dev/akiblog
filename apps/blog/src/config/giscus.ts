/* For more details, see docs/blog/implementation-notes.md#src-config-giscus-ts-note-1. */
export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: "pathname" | "url" | "title" | "og:title" | "specific";
  /** only for mapping "specific" — defaults to the post slug */
  term?: string;
  reactionsEnabled?: boolean;
  inputPosition?: "top" | "bottom";
  lang?: string;
}

/* For more details, see docs/blog/implementation-notes.md#src-config-giscus-ts-note-2. */
export const giscus: GiscusConfig | null = {
  repo: "akibh-dev/notes",
  repoId: "R_kgDOSFUhMA",
  category: "Comments",
  categoryId: "DIC_kwDOSFUhMM4DGfRz",
  mapping: "pathname",
  reactionsEnabled: true,
  inputPosition: "top",
  lang: "en",
};
