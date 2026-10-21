/**
 * @file config/giscus.ts
 * @description Comments configuration — PASTE YOUR GISCUS VALUES HERE.
 *              While this is `null` the blog renders no comments panel and
 *              the CSP does not allow giscus.app (plan21 §3).
 *
 * HOW TO FILL IT (owner):
 *   1. github.com/akibh-dev/notes → Settings → enable Discussions; create a
 *      category (e.g. "Comments", type Announcements recommended).
 *   2. Install the giscus app on that repo: https://github.com/apps/giscus
 *   3. Open https://giscus.app, enter `akibh-dev/notes`, pick the category
 *      and mapping. Copy the values from the generated <script> tag:
 *        data-repo          → repo
 *        data-repo-id       → repoId
 *        data-category      → category
 *        data-category-id   → categoryId
 *        data-mapping       → mapping   (pathname is fine: /<slug>/ is stable)
 *   4. Replace `null` below with the object (example in the comment).
 * Nothing else needs changing: islands/Comments.astro renders the panel,
 * matches the site theme (and follows the toggle), and astro.config adds
 * giscus.app to the CSP automatically.
 *
 * Per post, `comments: false` in frontmatter hides the panel.
 *
 * Example:
 *   export const giscus: GiscusConfig | null = {
 *     repo: "akibh-dev/notes",
 *     repoId: "R_kgDO…",
 *     category: "Comments",
 *     categoryId: "DIC_kwDO…",
 *     mapping: "pathname",
 *   };
 */
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

/* filled 2026-10-21 — ids verified via the GitHub GraphQL API + giscus.app
   (akibh-dev/notes is public, Discussions on, giscus app installed; the
   repo id survived the GitHub username rename, so it matches the
   Jekyll site's _includes/giscus.html) */
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
