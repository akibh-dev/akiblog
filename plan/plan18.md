# Plan 18 — Projects island migration guide: React → pure Astro (zero functionality/UI change)

Companion to plan 17 (analysis) and the terminal guide (plan 17's Phase 1,
already executed). Same style: what changes, file layout, code, checks.

**Core insight:** the projects island needs **zero runtime data**. Every
dynamic surface (tabs, panels, breadcrumbs, minimap, status-bar line count,
dirty dot) is a function of the 5 projects — so every state is pre-rendered
at build time and the client only toggles `hidden` / classes / `aria-*`.
No JSON island, no data import in the controller. The controller is a pure
state machine + DOM toggles.

Only the React layer changes. `types.ts` and `dummy.ts` are pure TS and
stay **untouched** (same rule as the terminal's `commands.ts`/`registry.ts`).

## New file layout

```
islands/projects/
  types.ts                 (unchanged)
  dummy.ts                 (unchanged)
  controller.ts            (new — state machine, delegation, ARIA: tabs + menu + tree)
  scrollbars.ts            (new — vanilla port of useScrollbarVisibility)
  ProjectsIsland.astro     (new — root frame + grid; replaces ProjectWorkspace.tsx)
  chrome/
    TitleBar.astro         (ports EditorTitleBar.tsx — verbatim markup)
    MenuBar.astro          (ports EditorMenuBar.tsx + pre-rendered popup)
    TabBar.astro           (ports EditorTabs.tsx — ALL tabs pre-rendered)
    Breadcrumbs.astro      (ports EditorBreadcrumbs.tsx — one nav PER FILE)
    StatusBar.astro        (ports EditorStatusBar.tsx — line count via data-*)
    ProjectPanel.astro     (ports ProjectPanel.tsx — folders expanded, data hooks)
    ReadmePanel.astro      (ports ReadmePreview.tsx — one article PER FILE)
    Minimap.astro          (ports PreviewMinimap.tsx — buildRows moves to frontmatter)
    ChromeButton.astro     (ports ChromeButton.tsx — verbatim, props 1:1)
Deleted: ProjectWorkspace.tsx, Editor*.tsx, ProjectPanel.tsx,
ReadmePreview.tsx, PreviewMinimap.tsx, ChromeButton.tsx,
useScrollbarVisibility.ts, icons.tsx (the ?island-icon adapter — .astro
templates import src/icons/*.astro NATIVELY).
```

`Projects.astro` usage becomes (no `client:*`):

```astro
---
import ProjectsIsland from "../islands/projects/ProjectsIsland.astro";
---
<ProjectsIsland projects={projects} repoUrl={repoUrl} />
```

## The data-* contract (controller ↔ markup)

Pre-render everything; the controller reads/toggles only these hooks:

| Hook | On | Purpose |
|---|---|---|
| `data-projects-island` | root div | mount point |
| `data-grid` | grid container | sidebar-open class swap |
| `data-sidebar` | `<aside>` | toggle visibility (stays mounted) |
| `data-folder="akib35\|projects\|featured\|archive"` | folder button | collapse toggle + `aria-expanded` + chevron rotate |
| `data-folder-content="…"` | files wrapper | `hidden max-lg:contents` ↔ `contents` |
| `data-file-tab="ID"` | tree file button | activate(id); `aria-selected`, roving `tabindex` |
| `data-tab="ID"` | tab-bar tab | show/hide + active classes + `aria-current` |
| `data-tab-close="ID"` | tab × button | closeTab(id) |
| `data-dirty="1"` | tab element (if dirty) | hasDirty aggregation over OPEN tabs |
| `data-panel="ID"` + `data-lines="N"` | README article | show/hide; status-bar line count source |
| `data-crumbs="ID"` | breadcrumb nav | show/hide per active file |
| `data-minimap="ID"` | minimap div | show/hide per active file |
| `data-empty` | empty-state pane | show when no buffer open |
| `data-preview-scroll` | preview scroller | scroll-reset on switch + scrollbar reveal |
| `data-tree-scroll` | tree list | scrollbar reveal |
| `data-back` / `data-forward` | history arrows | walk deque; `disabled` at bounds |
| `data-status-file` | status-bar file group | hidden when no buffer open |
| `data-status-lines` | line-count button | textContent = active panel's `data-lines` |
| `data-branch-dirty` | branch dot span | hidden unless an open tab is dirty |
| `data-menu-trigger` / `data-menu-popup` | avatar + popup | menu open/close/keyboard |
| `data-menu-item` | menu items | roving highlight + typeahead |

## `scrollbars.ts` (complete)

```ts
/**
 * @file islands/projects/scrollbars.ts
 * @description Vanilla port of useScrollbarVisibility.ts — identical
 * behavior: set `data-scrolling` on scroll, remove 700ms after the last
 * event; the `zed-scroll` utility paints the thumb only while present.
 * Passive listener, no layout work per event.
 */
const HIDE_DELAY_MS = 700;

export function attachScrollbarReveal(el: HTMLElement) {
  let timer: number | undefined;
  el.addEventListener(
    "scroll",
    () => {
      el.setAttribute("data-scrolling", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.removeAttribute("data-scrolling"), HIDE_DELAY_MS);
    },
    { passive: true },
  );
}
```

## `controller.ts` (complete — the only logic file)

```ts
/**
 * @file islands/projects/controller.ts
 * @description State machine + ARIA for the pre-rendered workspace.
 *
 * POC / WHY PRE-RENDER + TOGGLE: the island's state space is enumerable
 * (N files), so ProjectsIsland.astro renders EVERY state at build time;
 * this controller only toggles hidden/classes/aria. No runtime data, no
 * JSON island, no re-render layer — one render() pass per interaction.
 *
 * ARIA PARITY (replaces Base UI, per WAI-ARIA APG):
 * - Tree files: tablist semantics — roving tabindex, ↑/↓ (and ←/→) move
 *   focus AND activate (Base UI activateOnFocus default), Home/End jump.
 * - Avatar menu: click toggle · ↓/↑ cycle · Home/End · typeahead (500ms
 *   buffer) · Enter/Space activates (actionless → close) · Esc closes +
 *   returns focus to trigger · outside pointerdown closes.
 * Everything else keeps the React version's exact behavior:
 * open-activate-close semantics, bounded history deque (8), neighbor
 * fallback on close, scroll-reset on buffer switch.
 */
import { attachScrollbarReveal } from "./scrollbars";

const HISTORY_LIMIT = 8; // parity with ProjectWorkspace.tsx
const TYPEAHEAD_MS = 500;

export function mountProjectsIsland(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) =>
    root.querySelector<T>(sel)!;
  const $$ = <T extends HTMLElement = HTMLElement>(sel: string) =>
    [...root.querySelectorAll<T>(sel)];

  const grid = $("[data-grid]");
  const previewScroll = $("[data-preview-scroll]");
  const backBtn = $<HTMLButtonElement>("[data-back]");
  const fwdBtn = $<HTMLButtonElement>("[data-forward]");

  const fileIds = $$("[data-file-tab]").map((el) => el.dataset.fileTab!);
  const firstId = fileIds[0] ?? "";

  // ── state (mirrors the React version 1:1) ──────────────────────
  let openTabs: string[] = firstId ? [firstId] : [];
  let activeTab = firstId;
  let sidebarOpen = true;
  let history: string[] = firstId ? [firstId] : [];
  let historyIndex = 0;
  const folders: Record<string, boolean> = {
    akib35: true, projects: true, featured: true, archive: true,
  };

  // ── history deque ──────────────────────────────────────────────
  function pushHistory(id: string) {
    const truncated = history.slice(0, historyIndex + 1);
    if (truncated[truncated.length - 1] === id) return;
    history = [...truncated, id].slice(-HISTORY_LIMIT);
    historyIndex = history.length - 1;
  }

  function activate(id: string, record = true) {
    if (!openTabs.includes(id)) openTabs = [...openTabs, id];
    activeTab = id;
    if (record) pushHistory(id);
    render();
  }

  function closeTab(id: string) {
    const idx = openTabs.indexOf(id);
    openTabs = openTabs.filter((t) => t !== id);
    if (id === activeTab) {
      activeTab = openTabs[idx] ?? openTabs[idx - 1] ?? "";
      if (activeTab) pushHistory(activeTab);
    }
    render();
  }

  function goBack() {
    if (historyIndex <= 0) return;
    const id = history[--historyIndex];
    if (id) activate(id, false);
  }
  function goForward() {
    if (historyIndex >= history.length - 1) return;
    const id = history[++historyIndex];
    if (id) activate(id, false);
  }

  // ── render = one toggle pass over pre-rendered DOM ─────────────
  function render() {
    const hasActive = activeTab !== "";
    const hasDirty = $$("[data-tab]").some(
      (el) => !el.hidden && el.dataset.dirty === "1",
    );

    // tree file tabs — selection + roving tabindex
    $$("[data-file-tab]").forEach((el) => {
      const sel = el.dataset.fileTab === activeTab;
      el.setAttribute("aria-selected", String(sel));
      el.tabIndex = sel ? 0 : -1;
    });

    // tab bar — visibility, active styling, current
    $$("[data-tab]").forEach((el) => {
      const id = el.dataset.tab!;
      const isOpen = openTabs.includes(id);
      const isActive = id === activeTab;
      el.hidden = !isOpen;
      el.classList.toggle("bg-canvas", isActive);
      el.classList.toggle("text-default", isActive);
      el.classList.toggle("text-muted", !isActive);
      el.querySelector("[data-tab-body]")?.setAttribute("aria-current", String(isActive));
    });

    // panels / breadcrumbs / minimap — exactly one visible
    $$("[data-panel]").forEach((el) => (el.hidden = el.dataset.panel !== activeTab));
    $$("[data-crumbs]").forEach((el) => (el.hidden = el.dataset.crumbs !== activeTab));
    $$("[data-minimap]").forEach((el) => (el.hidden = el.dataset.minimap !== activeTab));

    // chrome rows + empty state
    $("[data-tabbar]").hidden = !hasActive;
    $("[data-empty]").hidden = hasActive;

    // status bar — file group, line count, branch dirty dot
    $("[data-status-file]").hidden = !hasActive;
    if (hasActive) {
      const panel = $(`[data-panel="${activeTab}"]`);
      $("[data-status-lines]").textContent = `${panel.dataset.lines}:1`;
      $("[data-status-lines]").setAttribute("title", `Ln ${panel.dataset.lines}, Col 1`);
    }
    $("[data-branch-dirty]").hidden = !hasDirty;

    // history arrows
    backBtn.disabled = historyIndex <= 0;
    fwdBtn.disabled = historyIndex >= history.length - 1;

    // fresh scroll position per buffer (Zed lands at top for read-only)
    previewScroll.scrollTop = 0;
  }

  // ── sidebar toggle (panel stays MOUNTED; folder state survives) ─
  const OPEN_GRID = ["grid-rows-[auto_minmax(0,1fr)]", "lg:grid-cols-[14rem_minmax(0,1fr)]", "lg:grid-rows-none"];
  const SHUT_GRID = ["grid-cols-1", "grid-rows-[minmax(0,1fr)]"];
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    $("[data-sidebar]").classList.toggle("hidden", !sidebarOpen);
    $("[data-sidebar]").classList.toggle("flex", sidebarOpen);
    grid.classList.remove(...(sidebarOpen ? SHUT_GRID : OPEN_GRID));
    grid.classList.add(...(sidebarOpen ? OPEN_GRID : SHUT_GRID));
    $("[data-toggle-sidebar]").setAttribute("aria-pressed", String(sidebarOpen));
    // pressed fill (ChromeButton pressed state)
    $("[data-toggle-sidebar]").classList.toggle("bg-control-hover/60", sidebarOpen);
    $("[data-toggle-sidebar]").classList.toggle("text-default", sidebarOpen);
  }

  // ── folders (all collapse; nested cascade like the React version) ─
  function toggleFolder(key: string) {
    folders[key] = !folders[key];
    const rootsOpen = folders.akib35 && folders.projects;
    $$(`[data-folder]`).forEach((btn) => {
      const k = btn.dataset.folder!;
      const open =
        k === "akib35" || k === "projects" ? folders[k] : rootsOpen && folders[k];
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector("[data-chevron]")?.classList.toggle("rotate-90", open);
      // `projects` row hides with `akib35`; group rows hide with roots
      if (k === "projects") btn.closest("[data-folder-row]")!.toggleAttribute("hidden", !folders.akib35);
      if (k === "featured" || k === "archive") btn.closest("[data-folder-row]")!.toggleAttribute("hidden", !rootsOpen);
    });
    $$(`[data-folder-content]`).forEach((box) => {
      const k = box.dataset.folderContent!;
      const open = rootsOpen && folders[k];
      box.className = open ? "contents" : "hidden max-lg:contents";
    });
  }

  // ── tree keyboard: roving tabindex, activate-on-focus ─────────
  function focusFile(id: string) {
    $(`[data-file-tab="${id}"]`).focus();
    activate(id);
  }
  $("[data-tree-scroll]").addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = fileIds.indexOf(activeTab);
    const next =
      e.key === "Home" ? fileIds[0]
      : e.key === "End" ? fileIds[fileIds.length - 1]
      : fileIds[Math.min(Math.max(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1), 0), fileIds.length - 1)];
    if (next && next !== activeTab) focusFile(next);
  });

  // ── avatar menu (WAI-ARIA menu button pattern) ─────────────────
  const trigger = $("[data-menu-trigger]");
  const popup = $("[data-menu-popup]");
  const items = $$("[data-menu-item]");
  let menuOpen = false;
  let highlighted = -1;
  let typeBuffer = "";
  let typeTimer: number | undefined;

  function highlight(i: number) {
    highlighted = (i + items.length) % items.length;
    items.forEach((it, j) => {
      it.classList.toggle("bg-control-hover", j === highlighted);
      it.classList.toggle("text-default", j === highlighted);
      if (j === highlighted) it.focus();
    });
  }
  function openMenu() {
    menuOpen = true;
    popup.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    highlight(0);
  }
  function closeMenu(refocus = true) {
    menuOpen = false;
    popup.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    highlighted = -1;
    if (refocus) trigger.focus();
  }
  trigger.addEventListener("click", () => (menuOpen ? closeMenu(false) : openMenu()));
  popup.addEventListener("keydown", (e) => {
    if (e.key === "Escape") (e.preventDefault(), closeMenu());
    else if (e.key === "ArrowDown") (e.preventDefault(), highlight(highlighted + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), highlight(highlighted - 1));
    else if (e.key === "Home") (e.preventDefault(), highlight(0));
    else if (e.key === "End") (e.preventDefault(), highlight(items.length - 1));
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), closeMenu()); // actionless items
    else if (e.key === "Tab") closeMenu(false);
    else if (/^\w$/.test(e.key)) {
      // typeahead — jump to the next item starting with the buffer
      window.clearTimeout(typeTimer);
      typeBuffer += e.key.toLowerCase();
      typeTimer = window.setTimeout(() => (typeBuffer = ""), TYPEAHEAD_MS);
      const hit = items.findIndex((it) =>
        it.textContent!.trim().toLowerCase().startsWith(typeBuffer),
      );
      if (hit !== -1) highlight(hit);
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (menuOpen && !popup.contains(e.target as Node) && !trigger.contains(e.target as Node))
      closeMenu(false);
  });

  // ── event delegation (clicks) ──────────────────────────────────
  root.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-file-tab],[data-tab-body],[data-tab-close],[data-back],[data-forward],[data-toggle-sidebar],[data-folder]",
    );
    if (!el) return;
    if (el.dataset.fileTab) activate(el.dataset.fileTab);
    else if (el.dataset.tabBody) activate(el.dataset.tabBody);
    else if (el.dataset.tabClose) closeTab(el.dataset.tabClose);
    else if (el.hasAttribute("data-back")) goBack();
    else if (el.hasAttribute("data-forward")) goForward();
    else if (el.hasAttribute("data-toggle-sidebar")) toggleSidebar();
    else if (el.dataset.folder) toggleFolder(el.dataset.folder);
  });

  attachScrollbarReveal($("[data-tree-scroll]"));
  attachScrollbarReveal(previewScroll);
  render();
}
```

Mount script at the bottom of `ProjectsIsland.astro`:

```astro
<script>
  import { mountProjectsIsland } from "./controller";
  document.querySelectorAll<HTMLElement>("[data-projects-island]").forEach(mountProjectsIsland);
</script>
```

## The `.astro` ports (mechanical — JSX → Astro, classes verbatim)

Rules for every file: class strings copied byte-for-byte; `className` →
`class`; inline `style={{ fontSize: 9 }}` → `style="font-size: 9px"`;
icons imported natively (`import { FolderIcon } from "../../../icons"`;
delete `icons.tsx`); `onClick` etc. **removed** — wiring is by data hooks
only. Initial render = React's SSR state (first file open + active, all
folders expanded, sidebar open, arrows disabled per deque bounds).

Per component, only the dynamic wiring is listed:

- **ProjectsIsland.astro** — outer `px-5 py-14` wrapper + frame; grid div
  gets `data-grid` + the OPEN grid classes; renders TitleBar, MenuBar,
  ProjectPanel, right column (TabBar, Breadcrumbs, preview wrapper with
  `data-preview-scroll` + all ReadmePanels + all Minimaps + `data-empty`
  pane), StatusBar. Empty-state markup is the React "No file open" block,
  `hidden` initially.
- **TabBar.astro** — `data-tabbar` on the row (never hidden initially);
  one tab per file with `data-tab`, `data-dirty` (when
  `STATUS_META[f.status].dirty`), tab body `data-tab-body="{id}"`, × with
  `data-tab-close="{id}"`; arrows `data-back`/`data-forward`, both
  `disabled` initially (deque has one entry). Hidden tabs start `hidden`.
- **Breadcrumbs.astro** — loops files: one `<nav data-crumbs="{id}">` per
  file (`hidden` except first). Segments `akib35 › projects › group › file`.
- **StatusBar.astro** — verbatim port; toggle button gets
  `data-toggle-sidebar` + `aria-pressed="true"` + pressed classes; file
  group wrapper `data-status-file`; line-count TextItem gets
  `data-status-lines` with the first file's `14 + highlights.length*2 +
  techStack.length` precomputed; branch dot span gets `data-branch-dirty`.
  **Keep TEXT_STYLE inline (`style="font-size: 9px"`) — the min-font saga
  documented in the React header still applies.**
- **ProjectPanel.astro** — `<aside data-sidebar>`; tree list
  `data-tree-scroll` + `role="tablist"` + `aria-label="Project files"`;
  folder rows wrapped in `div[data-folder-row]` (hidden cascade target)
  with `button[data-folder]` + `data-chevron` on the chevron span; files
  wrapper `div[data-folder-content="{group}"]` starting as `contents`;
  file rows `role="tab"` `data-file-tab="{id}"` `aria-selected`,
  `tabindex` 0 on first / −1 elsewhere. Repo footer verbatim.
- **ReadmePanel.astro** — one `<article data-panel="{id}"
  data-lines="{N}" role="tabpanel">` per file, `hidden` except first;
  body is ReadmePreview's exact markup.
- **Minimap.astro** — `buildRows` moves to the frontmatter (pure
  function, runs at build); one `div[data-minimap="{id}"]` per file,
  `hidden` except first.
- **MenuBar.astro** — text menus verbatim; avatar trigger
  `data-menu-trigger` + `aria-haspopup="menu"` + `aria-expanded="false"`;
  popup `div[data-menu-popup] role="menu"` **inside a `relative` wrapper
  in the bar** (Base UI's Portal only existed to escape `overflow-hidden`;
  the popup opens downward INTO the frame, so absolute positioning inside
  the bar suffices — no clipping); items `role="menuitem"` `tabindex="-1"`
  `data-menu-item`; separator verbatim; starts `hidden`.
- **TitleBar.astro / ChromeButton.astro** — verbatim.

## Things to check

- **Keep the React dependencies.** `@astrojs/react`, `react`, `react-dom`,
  `@base-ui-components/react` stay until ThemeSwitch / MobileMenu /
  CopyButton migrate (plan 17 Phase 5). Delete only the projects `*.tsx`.
- **`?island-icon` plugin can go** once `icons.tsx` is deleted — no other
  consumer exists. Removing it shrinks the island chunk further.
- **Tailwind v4 scanning** picks up `controller.ts` class strings
  automatically (`bg-canvas`, `rotate-90`, `bg-control-hover/60`…). All
  toggled classes already exist in the markup or controller — no
  safelist needed, but grep one (`rotate-90`) in dist CSS to confirm.
- **Grid class swap** uses full literal class names in controller.ts —
  Tailwind sees them there; do NOT build them by string concatenation.
- **ARIA audit after port**: tablist arrow nav across folders (flat
  `fileIds` order = visual order incl. hidden folders — when a folder is
  collapsed, its files are `display:contents`-hidden on lg only, so
  `fileIds` still matches the mobile strip; arrow nav to a folder-hidden
  file should be a non-issue because collapsed rows keep mobile visibility;
  verify with keyboard walkthrough), menu focus return, `aria-expanded`/
  `aria-selected`/`aria-pressed` states, tab order = one tab stop in tree.
- **Pixel diff**: dist HTML before/after should differ only in React vs
  Astro scaffolding attrs; screenshot-compare open/close/sidebar states.
- **Base UI quirks not ported**: focus-visible ring styling is kept via
  the same `focus-visible:` classes; `Tabs.Panel` had no visual behavior
  beyond show/hide, replicated by `hidden`.
- **History limit is 8** (verified in source — not 20 as plan 17 said).
