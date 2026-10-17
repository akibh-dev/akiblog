/**
 * @file islands/projects/types.ts
 * @description Shared types + pure mapping helpers for the Zed-workspace
 *              project browser.
 *
 * POC / WHY THIS FILE EXISTS:
 * The workspace renders each project as a *file* in a fake filesystem.
 * That mapping (title → slug → file name → tree group) is pure data
 * transformation, so it lives here as testable functions instead of being
 * scattered across components. `STATUS_META` is the single source of truth
 * for how a project status translates to editor signals (tab dirty dot,
 * tree git dot, README badge) — one data field, three UI signals, never
 * derived twice.
 */

export interface ProjectItem {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  status: "active" | "shipped" | "wip";
  /**
   * Optional real README bullets. When absent, the workspace falls back to
   * DUMMY_HIGHLIGHTS (see dummy.ts) — delete that file once real
   * `highlights` land in data/portfolio.ts.
   */
  highlights?: string[];
}

export type TreeGroup = "featured" | "archive";

/** A project adapted to its fake-filesystem representation. */
export interface ProjectFile extends ProjectItem {
  id: string; // slug — used as the Tabs value
  file: string; // "akiblog-edge-platform.md" — tree/tab/breadcrumb label
  group: TreeGroup; // tree folder the file lives under
}

/** title → file mapping. Deterministic so SSR and hydration always agree. */
export function toProjectFile(p: ProjectItem): ProjectFile {
  const slug = p.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return { ...p, id: slug, file: `${slug}.md`, group: p.featured ? "featured" : "archive" };
}

/** Folder render order in the project panel. */
export const GROUP_ORDER: { key: TreeGroup; label: string }[] = [
  { key: "featured", label: "featured" },
  { key: "archive", label: "archive" },
];

export interface StatusMeta {
  label: string;
  /** dirty = "uncommitted changes" → tab dot + tree git dot. */
  dirty: boolean;
  dotClass: string;
  textClass: string;
}

export const STATUS_META: Record<ProjectItem["status"], StatusMeta> = {
  active: {
    label: "active",
    dirty: true,
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  wip: {
    label: "wip",
    dirty: true,
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  shipped: {
    label: "shipped",
    dirty: false,
    dotClass: "bg-muted",
    textClass: "text-muted",
  },
};
