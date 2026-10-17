/**
 * @file islands/projects/ProjectPanel.tsx
 * @description Zed project panel: collapsible workspace roots
 *              (akib35 → projects), collapsible group folders
 *              (featured/ archive/), file rows (= tabs), repo footer.
 *
 * POC / KEY DECISIONS:
 * 1. ONE Tabs.List contains every file tab — arrow-key navigation flows
 *    across folders for free. Folder headers are interleaved as
 *    role="presentation" rows with real <button>s inside.
 * 2. Selection is a FULL-ROW FILL (bg-control-hover), not a left accent
 *    bar — the accent bar is VS Code's language; Zed fills the row.
 * 3. EVERY directory collapses, with correct nesting: closing `akib35`
 *    hides `projects` (and everything under it); closing `projects`
 *    hides the group folders; closing a group hides only its files.
 *    ALL folders load EXPANDED (user direction). Hidden folders use the
 *    `hidden max-lg:contents` cascade so the mobile strip (which has no
 *    folders) always shows every file.
 * 4. Git-status dot maps `status` to editor language: active/wip =
 *    "uncommitted changes" (emerald/amber), shipped = clean tree (no dot).
 * 5. The whole sidebar can be toggled from the status bar — the workspace
 *    passes `hidden` and keeps this component MOUNTED so folder
 *    open-state survives toggles.
 */
import { Fragment, useState } from "react";
import { Tabs } from "@base-ui-components/react/tabs";
import { ChevronIcon, FileIcon, FolderIcon } from "./icons";
import { useScrollbarVisibility } from "./useScrollbarVisibility";
import { GROUP_ORDER, STATUS_META, type ProjectFile, type TreeGroup } from "./types";

type FolderKey = "akib35" | "projects" | TreeGroup;

interface Props {
  files: ProjectFile[];
  repoUrl?: string;
  /** Status-bar sidebar toggle — hidden but MOUNTED (state survives). */
  hidden?: boolean;
}

/**
 * Mobile: horizontal chip in a scroll strip (bordered, rounded).
 * Desktop (lg): full-width tree row with file indent, no chrome.
 * `relative` anchors the indent-guide rail; `title` (set at usage) gives
 * the full file name on truncated rows.
 */
const fileTabClass =
  "group relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm border border-line-subtle px-3 py-1.5 font-mono text-xs text-subtle outline-none transition-colors hover:bg-control-hover/60 focus-visible:bg-control-hover aria-selected:border-accent aria-selected:bg-control-hover aria-selected:text-default lg:h-7 lg:w-full lg:rounded-none lg:border-0 lg:py-0 lg:pr-3 lg:pl-[2.625rem]";

const folderButtonClass =
  "flex h-7 w-full items-center gap-1.5 pr-3 font-mono text-xs text-subtle outline-none transition-colors hover:bg-control-hover/60 focus-visible:bg-control-hover";

export default function ProjectPanel({ files, repoUrl, hidden = false }: Props) {
  // ALL folders load expanded (user direction) — and every one collapses.
  const [open, setOpen] = useState<Record<FolderKey, boolean>>({
    akib35: true,
    projects: true,
    featured: true,
    archive: true,
  });
  /** Reveal the IDE scrollbar only while the tree is being scrolled. */
  const listRef = useScrollbarVisibility<HTMLDivElement>();

  const toggle = (key: FolderKey) => setOpen((o) => ({ ...o, [key]: !o[key] }));
  /** Both workspace roots must be open for the group folders to show. */
  const rootsOpen = open.akib35 && open.projects;

  return (
    <aside
      className={`${hidden ? "hidden" : "flex"} min-h-0 flex-col border-b border-line-subtle lg:border-r lg:border-b-0`}
    >
      <Tabs.List
        ref={listRef}
        aria-label="Project files"
        className="flex shrink-0 gap-1.5 overflow-x-auto p-2 max-lg:no-scrollbar lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:zed-scroll lg:p-0 lg:py-1"
      >
        {/* workspace roots — collapsible like any directory */}
        <div role="presentation" className="hidden lg:block">
          <button
            type="button"
            aria-expanded={open.akib35}
            onClick={() => toggle("akib35")}
            className={`${folderButtonClass} pl-2`}
          >
            <ChevronIcon
              className={`size-3 shrink-0 text-muted transition-transform ${open.akib35 ? "rotate-90" : ""}`}
            />
            <FolderIcon className="size-3 shrink-0 text-muted" /> akib35
          </button>
          {open.akib35 && (
            <button
              type="button"
              aria-expanded={open.projects}
              onClick={() => toggle("projects")}
              className={`${folderButtonClass} pl-5`}
            >
              <ChevronIcon
                className={`size-3 shrink-0 text-muted transition-transform ${open.projects ? "rotate-90" : ""}`}
              />
              <FolderIcon className="size-3 shrink-0 text-muted" /> projects
            </button>
          )}
        </div>

        {GROUP_ORDER.map((group) => {
          const groupFiles = files.filter((f) => f.group === group.key);
          if (groupFiles.length === 0) return null;
          const isOpen = rootsOpen && open[group.key];
          return (
            <Fragment key={group.key}>
              {/* group folder — sticky like Zed's sticky_scroll; hidden
                  entirely when a workspace root above it is collapsed */}
              {rootsOpen && (
                <div
                  role="presentation"
                  className="hidden lg:sticky lg:top-0 lg:z-10 lg:block lg:bg-surface"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggle(group.key)}
                    className={`${folderButtonClass} pl-8`}
                  >
                    <ChevronIcon
                      className={`size-3 shrink-0 text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                    <FolderIcon className="size-3 shrink-0 text-muted" />
                    {group.label}/
                  </button>
                </div>
              )}

              {/* files — `contents` keeps tabs as flat flex items of the
                  list; hidden groups collapse only on lg (the mobile
                  strip has no folders, so it always shows every file). */}
              <div role="presentation" className={isOpen ? "contents" : "hidden max-lg:contents"}>
                {groupFiles.map((f) => {
                  const meta = STATUS_META[f.status];
                  return (
                    <Tabs.Tab key={f.id} value={f.id} title={f.file} className={fileTabClass}>
                      {/* indent-guide rail under the folder chevron */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-[2.375rem] hidden border-l border-line-subtle lg:block"
                      />
                      <FileIcon className="size-3 shrink-0 text-muted transition-colors group-aria-selected:text-accent" />
                      <span className="min-w-0 truncate">{f.file}</span>
                      {meta.dirty && (
                        <span
                          role="img"
                          aria-label={`status: ${meta.label}`}
                          className={`ml-auto size-1.5 shrink-0 rounded-full ${meta.dotClass}`}
                        />
                      )}
                    </Tabs.Tab>
                  );
                })}
              </div>
            </Fragment>
          );
        })}
      </Tabs.List>

      {repoUrl && (
        <div className="hidden shrink-0 border-t border-line-subtle px-4 py-3 lg:block">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-2xs text-muted transition-colors hover:text-accent"
          >
            All repositories ↗
          </a>
        </div>
      )}
    </aside>
  );
}
