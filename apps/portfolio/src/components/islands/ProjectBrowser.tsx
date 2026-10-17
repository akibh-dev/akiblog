/**
 * @file islands/ProjectBrowser.tsx
 * @description Compatibility wrapper — keeps `sections/Projects.astro`
 *              untouched while the implementation lives in ./projects/.
 *
 * WHY A WRAPPER (instead of editing Projects.astro): the section composes
 * this module by path, so preserving the path means the Zed-workspace swap
 * changes nothing outside islands/. The component is defined locally (not
 * re-exported) so Astro's island hydration resolution stays trivial.
 * Design rationale: plan/plan10.md.
 */
import ProjectWorkspace from "./projects/ProjectWorkspace";
import type { ProjectItem } from "./projects/types";

interface Props {
  projects: ProjectItem[];
  repoUrl?: string;
}

export default function ProjectBrowser(props: Props) {
  return <ProjectWorkspace {...props} />;
}
