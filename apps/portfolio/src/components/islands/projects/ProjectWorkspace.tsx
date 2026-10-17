/**
 * @file islands/projects/ProjectWorkspace.tsx
 * @description Zed-editor workspace — full chrome version.
 *
 * POC / FRAME STRUCTURE (user-directed, top to bottom):
 *   TitleBar   — traffic lights + window title
 *   MenuBar    — zed file edit selection go run window help + user avatar
 *   Grid       — left sidebar (project panel) | right section
 *     Right section rows (FIXED, invisible when no buffer is open):
 *       TabBar    — history arrows · open buffer tabs · new/split/full
 *       Breadcrumbs — path segments · search/assist/actions/settings
 *       Preview   — README pane (or the "no editor" empty state)
 *   StatusBar  — panel/git/diagnostics left · agent/term/encoding right
 *
 * STATE MODEL (mirrors a real editor):
 * - `openTabs: string[]` — open buffers, in open order (append on open,
 *   × removes). Multiple projects can be open at once.
 * - `activeTab: string` — the focused buffer; "" when every tab is closed.
 *
 * INTERACTION CONTRACT:
 * - Clicking a file in the tree = "open buffer" (idempotent) + focus it.
 * - Clicking a tab body = focus that buffer.
 * - Clicking a tab's × = close it; closing the ACTIVE buffer activates
 *   its right neighbor, else its left neighbor, else none (empty pane).
 * - The status-bar sidebar toggle hides/shows the project panel (the
 *   panel stays MOUNTED so folder open-state survives toggles).
 * - The ←/→ arrows walk a bounded HISTORY DEQUE of visited buffers
 *   (max 20 entries, forward entries truncated on new navigation);
 *   arrows are disabled at the deque's start/end.
 * - All other chrome icons are actionless by design (functionality later).
 *
 * WHY Base UI Tabs.Root STILL WRAPS TREE + PANELS: the tree keeps its
 * full keyboard contract (arrow-key nav, roving tabindex, aria wiring)
 * for free. The tab bar is a second *view* onto the same controlled
 * state via plain buttons — see EditorTabs' doc header.
 */
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "@base-ui-components/react/tabs";
import EditorTitleBar from "./EditorTitleBar";
import EditorMenuBar from "./EditorMenuBar";
import EditorTabs from "./EditorTabs";
import EditorBreadcrumbs from "./EditorBreadcrumbs";
import EditorStatusBar from "./EditorStatusBar";
import ProjectPanel from "./ProjectPanel";
import ReadmePreview from "./ReadmePreview";
import PreviewMinimap from "./PreviewMinimap";
import { FileIcon } from "./icons";
import { useScrollbarVisibility } from "./useScrollbarVisibility";
import { STATUS_META, toProjectFile, type ProjectItem } from "./types";

interface Props {
  projects: ProjectItem[];
  repoUrl?: string;
}

/** Back/forward deque capacity — oldest entries drop off beyond this. */
const HISTORY_LIMIT = 8;

export default function ProjectWorkspace({ projects, repoUrl }: Props) {
  const files = useMemo(() => projects.map(toProjectFile), [projects]);
  const firstId = files[0]?.id ?? "";

  // Deterministic initial state (first file open + focused) — SSR and
  // hydration always agree.
  const [openTabs, setOpenTabs] = useState<string[]>(() => (firstId ? [firstId] : []));
  const [activeTab, setActiveTab] = useState<string>(firstId);

  /** Sidebar visibility — status-bar toggle; panel stays mounted. */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /** Back/forward navigation deque (bounded; forward entries are
   *  truncated whenever a NEW navigation is recorded). */
  const [history, setHistory] = useState<string[]>(() => (firstId ? [firstId] : []));
  const [historyIndex, setHistoryIndex] = useState(0);

  /** Open buffers resolved to full file objects, in tab order. */
  const openFiles = useMemo(
    () =>
      openTabs
        .map((id) => files.find((f) => f.id === id))
        .filter((f): f is NonNullable<typeof f> => Boolean(f)),
    [openTabs, files]
  );
  const activeFile = files.find((f) => f.id === activeTab);
  /** Aggregated "uncommitted changes" — shown next to the branch name. */
  const hasDirty = openFiles.some((f) => STATUS_META[f.status].dirty);

  /** Preview scroll container — also reveals its scrollbar only while scrolling. */
  const previewRef = useScrollbarVisibility<HTMLDivElement>();

  // Buffer switch = fresh scroll position. (Zed restores per-buffer scroll;
  // for read-only previews, the top is always the right place to land.)
  useEffect(() => {
    previewRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  /** Record a navigation in the deque (no-op for repeat navigations). */
  function pushHistory(id: string) {
    const truncated = history.slice(0, historyIndex + 1);
    if (truncated[truncated.length - 1] === id) return;
    const next = [...truncated, id].slice(-HISTORY_LIMIT);
    setHistory(next);
    setHistoryIndex(next.length - 1);
  }

  /** Open (if needed) + focus a buffer. History arrows call with
   *  record=false so walking the deque doesn't re-push entries. */
  function activate(id: string, record = true) {
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    setActiveTab(id);
    if (record) pushHistory(id);
  }

  /** Tree click = open buffer (idempotent) + focus it. */
  function openFile(id: string) {
    activate(id);
  }

  /** × on a tab: remove buffer; if it was focused, activate a neighbor. */
  function closeTab(id: string) {
    const idx = openTabs.indexOf(id);
    const next = openTabs.filter((t) => t !== id);
    setOpenTabs(next);
    if (id === activeTab) {
      const nextActive = next[idx] ?? next[idx - 1] ?? "";
      setActiveTab(nextActive);
      if (nextActive) pushHistory(nextActive);
    }
  }

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  function goBack() {
    if (!canGoBack) return;
    const id = history[historyIndex - 1];
    setHistoryIndex(historyIndex - 1);
    if (id) activate(id, false);
  }

  function goForward() {
    if (!canGoForward) return;
    const id = history[historyIndex + 1];
    setHistoryIndex(historyIndex + 1);
    if (id) activate(id, false);
  }

  if (files.length === 0) return null;

  return (
    <div className="px-5 py-14 md:px-8 md:py-20">
      <div className="overflow-hidden rounded-md border border-line bg-surface shadow-2xs">
        <EditorTitleBar title="akib35 — projects (read-only)" />
        <EditorMenuBar />

        <Tabs.Root
          value={activeTab}
          onValueChange={(v) => openFile(String(v))}
          orientation="vertical"
        >
          <div
            className={`grid h-[34rem] md:h-[38rem] ${
              sidebarOpen
                ? "grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)] lg:grid-rows-none"
                : "grid-cols-1 grid-rows-[minmax(0,1fr)]"
            }`}
          >
            <ProjectPanel files={files} repoUrl={repoUrl} hidden={!sidebarOpen} />

            {/* right section — tab bar + breadcrumbs are fixed rows INSIDE
                the editor column; both invisible when no buffer is open */}
            <div className="flex min-h-0 min-w-0 flex-col">
              {activeFile && (
                <>
                  <EditorTabs
                    openFiles={openFiles}
                    activeTabId={activeTab}
                    onTabFocus={(id) => activate(id)}
                    onTabClose={closeTab}
                    canGoBack={canGoBack}
                    canGoForward={canGoForward}
                    onBack={goBack}
                    onForward={goForward}
                  />
                  <EditorBreadcrumbs file={activeFile} />
                </>
              )}

              {/* relative wrapper: minimap overlays the scroll container
                  so it stays pinned to the right edge while scrolling */}
              <div className="relative min-h-0 flex-1">
                <div ref={previewRef} className="zed-scroll h-full overflow-y-auto bg-canvas">
                  {openFiles.length === 0 ? (
                    /* Zed's "no editor" pane */
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                      <FileIcon className="size-8 text-muted/40" />
                      <p className="font-mono text-xs text-muted">No file open</p>
                      <p className="font-mono text-2xs text-muted">
                        Select a file from the project panel
                      </p>
                    </div>
                  ) : (
                    openFiles.map((f) => (
                      <Tabs.Panel key={f.id} value={f.id} className="outline-none">
                        <ReadmePreview project={f} />
                      </Tabs.Panel>
                    ))
                  )}
                </div>
                {activeFile && <PreviewMinimap file={activeFile} />}
              </div>
            </div>
          </div>
        </Tabs.Root>

        <EditorStatusBar
          file={activeFile}
          hasDirty={hasDirty}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
      </div>
    </div>
  );
}
