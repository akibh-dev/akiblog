# Plan 11 — Multi-Tab Zed Workspace (Detailed Modifications)

> **Parent:** plan/plan10.md (initial Zed workspace implementation)
> **Status:** Detailed specification for modifying the existing components
> **Scope:** Projects section only — no other sections touched

---

## 1. Visual Reference Analysis (from screenshot)

The screenshot shows Zed's actual interface with these key elements that our current implementation needs to match:

### Top Bar (Title Bar + Tab Bar)
```
┌──────────────────────────────────────────────────────────────────┐
│ ● ● ●  ●  zed#getting-started                                    │ ← Title bar: traffic lights + window title
├──────────────────────────────────────────────────────────────────┤
│ [📄 README.md ●] [📄 zed_key_bindings.md ●]                      │ ← Tab bar: MULTIPLE tabs, each with file icon + name + dot + ×
└──────────────────────────────────────────────────────────────────┘
```

**Key differences from current implementation:**
- **Multiple tabs** — currently we show only ONE tab at a time
- **Each tab has its own ×** — currently × is decorative only
- **Tabs are clickable** — clicking switches focus (Zed uses active-tab highlight)
- **Dirty dot on EVERY tab** — the ● appears when file is "active"/"wip" status

### Status Bar (Bottom Bar)
```
├──────────────────────────────────────────────────────────────────┤
│ ○ zed                          ✓ 0  ⚠ 0        Markdown          │ ← Status bar
│ main ●                         W Ln 1, Col 1    UTF-8            │
└──────────────────────────────────────────────────────────────────┘
```

**Key elements:**
- **Left side:** Project/workspace name (◦ zed) + git branch (main) + dirty indicator (● for uncommitted)
- **Center:** Diagnostics (✓ 0 ⚠ 0) — currently we have these
- **Right side:** Mode indicator (W = width mode?), cursor position, encoding, language
- **Project name** is clickable/selectable in the status bar

### Project Panel (Left Sidebar)
```
├───────────────┐
│ EXPLORE       │ ← Panel header (not "PROJECT" — Zed uses "EXPLORE" in newer versions)
├───────────────┤
│ ▾ zed         │ ← Workspace root with chevron (EXPANDED by default)
│   ▸ config    │ ← Collapsed folder (chevron points right)
│   ▾ src       │ ← Expanded folder (chevron points down)
│     ▾ app     │
│       ● file  │ ← File with dirty status dot
│   README.md   │ ← File at root level (no dot = clean status)
│   zed.md      │
└───────────────┘
```

**Key differences from current implementation:**
- **akib35 and projects are NOT collapsible** — they are static decoration
- **Only featured/ and archive/ FOLDERS are collapsible**
- **Folders show trailing slash** — `featured/` not `featured`
- **All items load EXPANDED by default**
- **Project panel header shows "EXPLORE" not "PROJECT"**

---

## 2. Data Model Changes

### 2.1 New State: Open Tabs

Current implementation: single selection state (`value`)

New implementation: **array of open tab IDs** + **active tab ID**

```typescript
// ProjectWorkspace.tsx state
const [openTabs, setOpenTabs] = useState<string[]>(() => [files[0]?.id ?? ""]);
const [activeTab, setActiveTab] = useState<string>(() => files[0]?.id ?? "");

// Actions:

interface OpenTabAction {
  type: "OPEN";
  fileId: string;
}

interface CloseTabAction {
  type: "CLOSE";
  fileId: string;
}

interface FocusTabAction {
  type: "FOCUS";
  fileId: string;
}

interface CloseAllAction {
  type: "CLOSE_ALL";
}
```

### 2.2 Tab State Behavior

| Action | Zed Behavior | Our Implementation |
|--------|--------------|-------------------|
| Click file in tree | Opens tab if not open; focuses if already open | `openTabs.includes(fileId) ? setActiveTab(fileId) : setOpenTabs([...openTabs, fileId]), setActiveTab(fileId)` |
| Click tab | Focuses that tab | `setActiveTab(fileId)` |
| Click × on tab | Closes tab; if it was active, focus moves to previous/next tab | Remove from array, update activeTab if needed |
| Middle-click file in tree | Opens in NEW tab (permanent, not preview) | — N/A for web, same as click |
| Keyboard navigation | Arrow keys in tree, Tab cycles tabs | Arrow in tree, we won't add Tab cycling in v1 |

---

## 3. Component Modifications

### 3.1 EditorTabBar.tsx — MULTI-TAB SUPPORT

**Current:** Single tab, decorative ×, no interaction
**New:** Multi-tab bar with close functionality

```
Props:
  - openTabs: ProjectFile[]      // ordered list of open tabs
  - activeTabId: string          // which tab is focused
  - onTabClick: (id: string) => void    // focus tab
  - onTabClose: (id: string) => void    // close tab
```

**Render logic:**
```tsx
<div className="no-scrollbar flex h-9 items-stretch overflow-x-auto border-b">
  {openTabs.map((file) => {
    const isActive = file.id === activeTabId;
    const meta = STATUS_META[file.status];
    return (
      <button
        key={file.id}
        onClick={() => onTabClick(file.id)}
        className={`
          flex min-w-0 items-center gap-2 border-r px-3 font-mono text-xs
          ${isActive ? "bg-canvas text-default" : "text-muted hover:text-subtle"}
        `}
      >
        <FileIcon className="size-3.5 shrink-0" />
        <span className="truncate">{file.file}</span>
        {meta.dirty && <span className={`size-1.5 rounded-full ${meta.dotClass}`} />}
        <XIcon
          className="size-3 shrink-0 text-muted hover:text-subtle"
          onClick={(e) => { e.stopPropagation(); onTabClose(file.id); }}
        />
      </button>
    );
  })}
</div>
```

**Accessibility:**
- Role: `tablist` for the container
- Role: `tab` for each tab button
- `aria-selected={isActive}` on each tab
- Keyboard: ←→ arrow keys to move focus between tabs (add if time permits)

### 3.2 EditorStatusBar.tsx — PROJECT NAME + PROPER LEFT SECTION

**Current:** Branch icon + "main" + diagnostics + Ln/Col + UTF-8 + Markdown
**New:** Project name ○ zed-style + branch + dirty + rest unchanged

```
Left section changes:
- ○ akib35              <- project name (circle+diamond icon, plain text)
- main                   <- git branch (branch icon)
- ● (if any open tab has dirty status)  <- aggregated dirty indicator

Rest unchanged:
- ✓ 0  ⚠ 0              <- diagnostics
- Ln N, Col 1           <- cursor position
- UTF-8                 <- encoding
- Markdown              <- language
```

**Implementation:**
```tsx
<footer className="flex h-7 items-center gap-4 border-t px-4 font-mono text-[10px] text-muted">
  {/* Left: project + branch */}
  <span className="flex items-center gap-1.5">
    <span className="text-muted">○</span>
    <span>akib35</span>
  </span>
  <span className="flex items-center gap-1.5">
    <BranchIcon className="size-3" />
    <span>main</span>
    {hasDirty && <span className="size-1.5 rounded-full bg-emerald-500" title="Uncommitted changes" />}
  </span>

  {/* Diagnostics */}
  <span className="flex items-center gap-1"><CheckIcon className="size-3" /> 0</span>
  <span className="flex items-center gap-1"><WarningIcon className="size-3" /> 0</span>

  {/* Right: position + encoding + language */}
  <span className="ml-auto hidden sm:block">Ln {lines}, Col 1</span>
  <span className="hidden sm:block">UTF-8</span>
  <span>Markdown</span>
</footer>
```

### 3.3 ProjectPanel.tsx — NON-COLLAPSIBLE DIRS + SLASH

**Current:**
- akib35 and projects are static decoration
- featured/archive folders are collapsible WITH chevron buttons
- Folders show `{group.label}/`

**Changes needed:**
1. **Panel header:** Change "PROJECT" → "EXPLORE"
2. **Workspace roots (akib35, projects):** Add chevron pointing down (expanded state) but NO button — purely decorative
3. **Group folders (featured, archive):**
   - Keep collapse functionality
   - Add trailing slash: `featured/` not `featured`
   - Default state: OPEN (already done)
4. **Indent guide rail:** Already present, keep

```
Visual structure:
EXPLORE
├── ▾ akib35           ← decorative chevron-down, NOT clickable
│   └── ▾ projects     ← decorative chevron-down, NOT clickable
│       ├── ▾ featured/   ← clickable, chevron rotates, has slash
│       │   └── file.md
│       └── ▾ archive/    ← clickable, chevron rotates, has slash
│           └── file.md
```

**Implementation changes:**
```tsx
// Header
<span className="font-mono text-2xs uppercase tracking-widest text-muted">EXPLORE</span>

// Workspace roots — add decorative chevron-down
<div role="presentation" className="hidden lg:block">
  <div className="flex h-7 items-center gap-1.5 pr-3 pl-2 font-mono text-xs text-subtle">
    <ChevronIcon className="size-3 shrink-0 rotate-90 text-muted" />
    <FolderIcon className="size-3.5 shrink-0 text-muted" />
    akib35
  </div>
  <div className="flex h-7 items-center gap-1.5 pr-3 pl-5 font-mono text-xs text-subtle">
    <ChevronIcon className="size-3 shrink-0 rotate-90 text-muted" />
    <FolderIcon className="size-3.5 shrink-0 text-muted" />
    projects
  </div>
</div>

// Group folders — keep collapsible, ensure slash
<button ...>
  <ChevronIcon className={`size-3 transition-transform ${isOpen ? "rotate-90" : ""}`} />
  <FolderIcon className="size-3.5" />
  {group.label}/   {/* ← ensure trailing slash */}
</button>
```

---

## 4. New Component: EditorTabs.tsx

Split from EditorTabBar to handle multi-tab complexity:

```
apps/portfolio/src/components/islands/projects/
├── EditorTabs.tsx        # NEW — multi-tab bar with close
├── EditorTabBar.tsx     # DELETE — merged into EditorTabs
├── EditorTitleBar.tsx   # KEEP unchanged
├── EditorBreadcrumbs.tsx # KEEP unchanged
├── EditorStatusBar.tsx  # MODIFY — add project name, dirty indicator
├── ProjectPanel.tsx     # MODIFY — header + decorative chevrons + slash
├── ProjectWorkspace.tsx # MODIFY — multi-tab state management
└── ...
```

### EditorTabs.tsx Structure

```tsx
/**
 * @file islands/projects/EditorTabs.tsx
 * @description Multi-tab bar showing all open project files.
 *
 * POC / WHY MULTI-TAB: Zed's tab bar shows ALL open buffers, not just the
 * active one. This is the single most authentic Zed detail — it transforms
 * the section from "file viewer with tabs" to "real editor workspace."
 * Each tab has: file icon + name + dirty dot + close button.
 *
 * ACCESSIBILITY: Uses role="tablist" + role="tab" for proper AT semantics.
 * Tab focus circles via arrow keys (optional v1 enhancement).
 */
import { FileIcon, XIcon } from "./icons";
import { STATUS_META, type ProjectFile } from "./types";

interface Props {
  openTabs: ProjectFile[];
  activeTabId: string;
  onTabFocus: (id: string) => void;
  onTabClose: (id: string) => void;
}

export default function EditorTabs({ openTabs, activeTabId, onTabFocus, onTabClose }: Props) {
  if (openTabs.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Open project files"
      className="no-scrollbar flex h-9 items-stretch overflow-x-auto border-b border-line-subtle"
    >
      {openTabs.map((file) => {
        const isActive = file.id === activeTabId;
        const meta = STATUS_META[file.status];

        return (
          <button
            key={file.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabFocus(file.id)}
            className={`
              group flex min-w-0 items-center gap-2 border-r border-line-subtle
              px-3 font-mono text-xs outline-none transition-colors
              ${isActive
                ? "bg-canvas text-default"
                : "text-muted hover:bg-control-hover/40 hover:text-subtle"
              }
            `}
          >
            <FileIcon className="size-3.5 shrink-0 text-muted transition-colors group-hover:text-subtle" />
            <span className="truncate" title={file.file}>{file.file}</span>
            {meta.dirty && (
              <span
                role="img"
                aria-label={`${meta.label} status`}
                className={`size-1.5 shrink-0 rounded-full ${meta.dotClass}`}
              />
            )}
            <XIcon
              className="size-3 shrink-0 text-muted transition-colors hover:text-subtle"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(file.id);
              }}
              aria-label={`Close ${file.file}`}
            />
          </button>
        );
      })}
    </div>
  );
}
```

---

## 5. ProjectWorkspace.tsx — State Management

### 5.1 State Shape

```tsx
// Open tabs array — ordered by open time (most recent at end)
const [openTabs, setOpenTabs] = useState<string[]>([]);

// Active tab — which tab has focus
const [activeTab, setActiveTab] = useState<string>("");

// Derived: full ProjectFile objects for open tabs
const openFiles = useMemo(
  () => openTabs.map((id) => files.find((f) => f.id === id)).filter(Boolean),
  [openTabs, files]
);

// Derived: active ProjectFile
const activeFile = useMemo(
  () => files.find((f) => f.id === activeTab),
  [activeTab, files]
);

// Derived: does any open tab have dirty status?
const hasDirty = openFiles.some((f) => STATUS_META[f.status].dirty);
```

### 5.2 Actions

```tsx
// Open a file (from tree click)
function openFile(fileId: string) {
  if (!openTabs.includes(fileId)) {
    setOpenTabs((tabs) => [...tabs, fileId]);
  }
  setActiveTab(fileId);
}

// Close a tab (from × click)
function closeTab(fileId: string) {
  setOpenTabs((tabs) => tabs.filter((id) => id !== fileId));

  // If closing the active tab, move focus
  if (fileId === activeTab) {
    const idx = openTabs.indexOf(fileId);
    const newTabs = openTabs.filter((id) => id !== fileId);

    // Prefer next tab, else previous, else none
    const nextActive = newTabs[idx] ?? newTabs[idx - 1] ?? "";
    setActiveTab(nextActive);
  }
}

// Focus a tab (from tab click)
function focusTab(fileId: string) {
  setActiveTab(fileId);
}

// Close all tabs
function closeAllTabs() {
  setOpenTabs([]);
  setActiveTab("");
}
```

### 5.3 Tree → Tab Click Behavior

When a user clicks a file in the ProjectPanel tree:

```tsx
// In ProjectPanel, pass handleTreeClick down
function handleTreeClick(fileId: string) {
  openFile(fileId);
}

// ProjectPanel tabs open files — they don't "select" in the Base UI sense
// Clicking a file always calls openFile(id)
```

**Key insight:** The tree is NOT a `Tabs.List` anymore — it's a navigation panel that triggers `openFile()`. The `Tabs.Root` manages ONLY the preview panels.

### 5.4 Tabs.Root for Preview Only

```tsx
<Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(String(v))}>
  {/* Tab bar is NOT inside Tabs.Root — it's a separate component */}
  <EditorTabs ... />

  {/* Preview pane — only renders Panels for open tabs */}
  <div className="...">
    {openFiles.map((file) => (
      <Tabs.Panel key={file.id} value={file.id}>
        <ReadmePreview project={file} />
      </Tabs.Panel>
    ))}
  </div>

  {/* Status bar receives hasDirty for the indicator */}
  <EditorStatusBar file={activeFile} hasDirty={hasDirty} />
</Tabs.Root>
```

---

## 6. File Structure After Changes

```
apps/portfolio/src/components/islands/projects/
├── ProjectWorkspace.tsx   # MODIFY — multi-tab state, open/close logic
├── EditorTabs.tsx         # NEW — multi-tab bar
├── EditorTabBar.tsx       # DELETE — replaced by EditorTabs
├── EditorTitleBar.tsx     # KEEP — no changes
├── EditorBreadcrumbs.tsx  # KEEP — no changes
├── EditorStatusBar.tsx    # MODIFY — project name + dirty indicator
├── ProjectPanel.tsx       # MODIFY — "EXPLORE" header, decorative chevrons, trailing slash
├── ReadmePreview.tsx      # KEEP — no changes
├── types.ts               # KEEP — no changes
├── dummy.ts               # KEEP — no changes
└── icons.tsx              # KEEP — no changes
```

---

## 7. Visual Comparison

### Before (plan10)

```
┌──────────────────────────────────────────────────────────────────┐
│ ● ● ●            akib35 — projects (read-only)                 │
├──────────────────────────────────────────────────────────────────┤
│ [📄 akiblog-edge-platform.md ●  ×]                              │ ← SINGLE tab
├──────────────────────────────────────────────────────────────────┤
│ akib35 › projects › featured › akiblog-edge-platform.md         │
├───────────────┬──────────────────────────────────────────────────┤
│ PROJECT       │  # Akiblog Edge Platform                       │
│   akib35      │  [shipped] [README.md]                         │
│   projects    │  ─────────────────────────────                 │
│   ▾ featured  │  ## Overview                                    │
│     ● file.md │  Edge-native developer publishing system...     │
│   ▾ archive   │  ## Highlights                                  │
│     file.md   │  • Sub-millisecond SSR...                      │
│               │  ## Stack                                        │
│               │  [Astro v5] [Cloudflare Workers]...            │
├───────────────┴──────────────────────────────────────────────────┤
│  main   ✓ 0 ⚠ 0        Markdown · Ln 24, Col 1 · UTF-8 · AH ○  │
└──────────────────────────────────────────────────────────────────┘
```

### After (plan11)

```
┌──────────────────────────────────────────────────────────────────┐
│ ● ● ●            akib35 — projects (read-only)                 │
├──────────────────────────────────────────────────────────────────┤
│ [📄 akiblog-edge-platform.md ●  ×] [📄 black-board.md ●  ×]      │ ← MULTI tabs
├──────────────────────────────────────────────────────────────────┤
│ akib35 › projects › featured › akiblog-edge-platform.md         │
├───────────────┬──────────────────────────────────────────────────┤
│ EXPLORE       │  # Akiblog Edge Platform                       │
│   ▾ akib35    │  [shipped] [README.md]                         │
│     ▾ projects│  ─────────────────────────────                 │
│       ▾ featured/ │  ## Overview                                 │
│         ● file.md│  Edge-native developer publishing system...  │
│       ▾ archive/ │  ## Highlights                                │
│         file.md  │  • Sub-millisecond SSR...                    │
│               │  ## Stack                                       │
│               │  [Astro v5] [Cloudflare Workers]...             │
│               │  ───                                            │
│               │  View Code · Live Site →                         │
├───────────────┴──────────────────────────────────────────────────┤
│ ○ akib35  main ●   ✓ 0 ⚠ 0        Ln 24, Col 1 · UTF-8 · Markdown│
└──────────────────────────────────────────────────────────────────┘
```

Key changes visible:
1. **Multiple tabs** `[📄 ... ● ×][📄 ... ● ×]`
2. **"EXPLORE"** header instead of "PROJECT"
3. **akib35 and projects** have chevron but are NOT collapsible
4. **featured/** and **archive/** have trailing slash
5. **Status bar left:** `○ akib35 main ●` (project name + branch + dirty)

---

## 8. Accessibility Considerations

| Element | ARIA Role | Attributes |
|---------|-----------|------------|
| Tab bar container | `tablist` | `aria-label="Open project files"` |
| Tab buttons | `tab` | `aria-selected={isActive}` |
| Close button on tab | `button` | `aria-label="Close {filename}"` |
| Tree folder rows | `button` | `aria-expanded={isOpen}` |
| Tree file rows | `button` | `aria-label="Open {filename}"` |
| Status bar | `contentinfo` or none | — |

**Keyboard:**
- Arrow keys in tree: navigate files/folders (Base UI provides)
- Enter/Space on tree file: opens file (calls `openFile()`)
- Arrow keys on tabs: OPTIONAL — cycle tab focus (skip if time-constrained)
- Enter on tab: focuses that tab (already implicit from click)

---

## 9. Implementation Order

1. **types.ts** — no changes needed
2. **icons.tsx** — verify all icons present (ChevronIcon, FileIcon, FolderIcon, XIcon, BranchIcon, CheckIcon, WarningIcon already exist)
3. **EditorTabs.tsx** — NEW component (copy from EditorTabBar, extend to multi)
4. **EditorTabBar.tsx** — DELETE (replace imports with EditorTabs)
5. **ProjectWorkspace.tsx** — ADD multi-tab state, pass props to EditorTabs and ProjectPanel
6. **EditorStatusBar.tsx** — MODIFY left section (project name + dirty)
7. **ProjectPanel.tsx** — MODIFY header + decorative chevrons + trailing slash
8. **Build and test** — SSR match, click-to-open, close-tab behavior, dirty indicator aggregation

---

## 10. Test Checklist

- [ ] SSR and hydration render the same tab state (first file open + active by default)
- [ ] Clicking a file in tree opens it in a new tab
- [ ] Clicking an already-open file focuses its tab
- [ ] Clicking × closes the tab
- [ ] Closing active tab moves focus to sibling
- [ ] Closing last tab leaves empty preview area
- [ ] Tab order matches open order (most recent at end)
- [ ] "EXPLORE" header shows correctly
- [ ] akib35 and projects rows show chevron-down but are not clickable
- [ ] featured/ and archive/ have trailing slash
- [ ] Status bar left shows "○ akib35 main" + dirty dot if any tab is dirty
- [ ] Dark mode: all chrome readable
- [ ] Mobile: tab bar scrolls horizontally; tree collapses to chip strip
- [ ] Keyboard navigation in tree still works (arrow keys + Enter)
