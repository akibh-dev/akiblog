/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-projects-controller-ts-note-1. */
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
  if (!firstId) return;

  // ── state (mirrors the React version 1:1) ─────────────────────────
  let openTabs: string[] = [firstId];
  let activeTab = firstId;
  let sidebarOpen = true;
  let history: string[] = [firstId];
  let historyIndex = 0;
  const folders: Record<string, boolean> = {
    akibh: true,
    projects: true,
    featured: true,
    archive: true,
  };

  // ── history deque (bounded; forward entries truncated on new nav) ──
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

  // ── render = one toggle pass over pre-rendered DOM ────────────────
  function render() {
    const hasActive = activeTab !== "";
    const hasDirty = $$("[data-tab]").some((el) => !el.hidden && el.dataset.dirty === "1");

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
      const lines = $(`[data-panel="${activeTab}"]`).dataset.lines ?? "0";
      $("[data-status-lines]").textContent = `${lines}:1`;
      $("[data-status-lines]").setAttribute("title", `Ln ${lines}, Col 1`);
    }
    $("[data-branch-dirty]").hidden = !hasDirty;

    // history arrows
    backBtn.disabled = historyIndex <= 0;
    fwdBtn.disabled = historyIndex >= history.length - 1;

    // fresh scroll position per buffer (read-only previews land at top)
    previewScroll.scrollTop = 0;
  }

  // ── sidebar toggle (panel stays MOUNTED; folder state survives) ────
  const OPEN_GRID = [
    "grid-rows-[auto_minmax(0,1fr)]",
    "lg:grid-cols-[14rem_minmax(0,1fr)]",
    "lg:grid-rows-none",
  ];
  const SHUT_GRID = ["grid-cols-1", "grid-rows-[minmax(0,1fr)]"];
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    const aside = $("[data-sidebar]");
    aside.classList.toggle("hidden", !sidebarOpen);
    aside.classList.toggle("flex", sidebarOpen);
    grid.classList.remove(...(sidebarOpen ? SHUT_GRID : OPEN_GRID));
    grid.classList.add(...(sidebarOpen ? OPEN_GRID : SHUT_GRID));
    const toggle = $("[data-toggle-sidebar]");
    toggle.setAttribute("aria-pressed", String(sidebarOpen));
    toggle.classList.toggle("bg-control-hover/60", sidebarOpen);
    toggle.classList.toggle("text-default", sidebarOpen);
  }

  // ── folders (all collapse; nested cascade like the React version) ──
  function toggleFolder(key: string) {
    folders[key] = !folders[key];
    const rootsOpen = folders.akibh && folders.projects;
    $$("[data-folder]").forEach((btn) => {
      const k = btn.dataset.folder!;
      const open =
        k === "akibh" || k === "projects" ? folders[k] : rootsOpen && folders[k];
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector("[data-chevron]")?.classList.toggle("rotate-90", open);
      // `projects` row hides with `akibh`; group rows hide with roots
      if (k === "projects")
        btn.closest("[data-folder-row]")!.toggleAttribute("hidden", !folders.akibh);
      if (k === "featured" || k === "archive")
        btn.closest("[data-folder-row]")!.toggleAttribute("hidden", !rootsOpen);
    });
    $$("[data-folder-content]").forEach((box) => {
      const k = box.dataset.folderContent!;
      const open = rootsOpen && folders[k];
      box.className = open ? "contents" : "hidden max-lg:contents";
    });
  }

  // ── tree keyboard: roving tabindex, activate-on-focus ──────────────
  function focusFile(id: string) {
    $(`[data-file-tab="${id}"]`).focus();
    activate(id);
  }
  $("[data-tree-scroll]").addEventListener("keydown", (e) => {
    // parity: folder buttons are NOT tabs — Base UI's composite ignored
    // them, so arrow keys only act from a focused file tab.
    if (!(e.target as HTMLElement).hasAttribute("data-file-tab")) return;
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
      return;
    e.preventDefault();
    const i = fileIds.indexOf(activeTab);
    const next =
      e.key === "Home"
        ? fileIds[0]
        : e.key === "End"
          ? fileIds[fileIds.length - 1]
          : fileIds[
              Math.min(
                Math.max(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1), 0),
                fileIds.length - 1
              )
            ];
    if (next && next !== activeTab) focusFile(next);
  });

  // ── avatar menu (WAI-ARIA menu button pattern) ─────────────────────
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
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), closeMenu()); // actionless
    else if (e.key === "Tab") closeMenu(false);
    else if (/^\w$/.test(e.key)) {
      // typeahead — jump to the next item starting with the buffer
      window.clearTimeout(typeTimer);
      typeBuffer += e.key.toLowerCase();
      typeTimer = window.setTimeout(() => (typeBuffer = ""), TYPEAHEAD_MS);
      const hit = items.findIndex((it) =>
        it.textContent!.trim().toLowerCase().startsWith(typeBuffer)
      );
      if (hit !== -1) highlight(hit);
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (menuOpen && !popup.contains(e.target as Node) && !trigger.contains(e.target as Node))
      closeMenu(false);
  });

  // ── avatar image fallback (ports the React onError hide): if the
  //    photo is missing/broken, the "AH" initials remain. Checked both
  //    ways — the error may have fired before this module ran. ────────
  const avatarImg = $<HTMLImageElement>("[data-avatar-img]");
  const hideAvatar = () => (avatarImg.style.display = "none");
  if (avatarImg.complete && avatarImg.naturalWidth === 0) hideAvatar();
  else avatarImg.addEventListener("error", hideAvatar);

  // ── event delegation (clicks) ──────────────────────────────────────
  root.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-file-tab],[data-tab-body],[data-tab-close],[data-back],[data-forward],[data-toggle-sidebar],[data-folder]"
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
