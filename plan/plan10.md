# Plan 10 — Experience Section as a Zed Editor Workspace

> **Status:** Detailed design, ready to implement. Supersedes the sketch in
> `/plan2.md` (repo root — that file was created outside `plan/` by mistake;
> this document is the canonical version).

---

## 1. Goal & Core Insight

Render the **Experience** section as a recognizable Zed editor window:

- **Left dock** = project panel with a file tree of roles (`{role}@{company}.md`)
- **Right dock** = markdown preview of the selected role's `README.md`
- Wrapped in full editor chrome: **title bar → tab bar → breadcrumbs → status bar**

**Core insight that elevates this beyond plan2:** plan2 only proposed
"sidebar + content pane" — which is what `ProjectBrowser` already does. What
makes Zed *look like Zed* is the **chrome around the panes**: the tab with a
dirty dot, the breadcrumb path, the status bar with branch/language/cursor
position, and the panel header. We build the whole window, not just the split.

---

## 2. Zed Anatomy → Our Component Map

```
┌──────────────────────────────────────────────────────────────────┐
│ ● ● ●            akib35 — experience (read-only)                 │ ← TitleBar
├──────────────────────────────────────────────────────────────────┤
│ [📄 bsc-cse@cuet.md  ●  ×]                                       │ ← TabBar
├──────────────────────────────────────────────────────────────────┤
│ akib35 › experience › education › bsc-cse@cuet.md                │ ← Breadcrumbs
├───────────────┬──────────────────────────────────────────────────┤
│ PROJECT       │  # Chittagong University of Engineering & Tech   │
│ ▾ akib35      │  B.Sc. Computer Science & Engineering            │
│   ▾ experience│  [completed] [Chittagong, BD] [2020 – 2024]      │
│     ▾ work    │  ─────────────────────────────                   │
│       se@acme │  ## Overview                                     │
│     ▾ education│ …prose…                                        │
│   ● bsc@cuet  │  ## Highlights                                   │
│               │  • …                                             │
│ (scrollable,  │  ## Stack                                        │
│  sticky dirs) │  [C++] [Python] …                                │
│               │  ───                                             │
│               │  🔗 Transcript · Website                         │
│               │  (scrollable markdown preview)                   │
├───────────────┴──────────────────────────────────────────────────┤
│  main   ✓ 0 ⚠ 0        Markdown · Ln 24, Col 1 · UTF-8 ·  AH ○  │ ← StatusBar
└──────────────────────────────────────────────────────────────────┘
```

| Zed part | Our component | Source of truth |
|---|---|---|
| Title bar (traffic lights) | `TitleBar` (inline in Workspace) | reuse Terminal.tsx chrome pattern |
| Tab bar (open buffer) | `TabBar.tsx` | active experience |
| Dirty dot on tab | ● shown when `status === "current"` | data |
| Breadcrumbs | `Breadcrumbs.tsx` | `type` folder + file name |
| Project panel header | "PROJECT" label + decorative icons | static |
| File tree | `ProjectPanel.tsx` (= `Tabs.List`) | `experiences[]` grouped by `type` |
| Git status tint | green text/dot for `current` | data |
| Sticky folder rows | CSS `sticky top-0` inside tree scroll | Zed's sticky_scroll |
| Markdown preview | `ReadmePreview.tsx` (= `Tabs.Panel`) | experience fields |
| Status bar | `StatusBar.tsx` | derived (branch static, Ln from content) |

---

## 3. Layout & Dimensions Spec

**The single biggest behavioral difference from `ProjectBrowser`:** the editor
frame has a **fixed height with internal scrolling** in both docks — like a
real editor window embedded in the page — instead of flowing with page height.

```
frame:        rounded-md border border-line bg-surface shadow-2xs
              height: h-[32rem] md:h-[36rem]   (internal scroll, not page flow)
title bar:    h-10  px-4      (traffic lights + centered title, muted 9px mono)
tab bar:      h-9   border-b border-line-subtle
breadcrumbs:  h-8   px-4      (mono 2xs, chevron separators)
body grid:    grid-cols-[15rem_minmax(0,1fr)] on lg; stacked on mobile
tree rows:    h-7   px-3, font-mono text-xs, gap-2
panel header: h-9, label font-mono text-2xs uppercase tracking-widest text-muted
status bar:   h-7   px-4, font-mono text-[10px], border-t border-line-subtle
```

Width rationale: `15rem` (vs ProjectBrowser's 12rem) because file names like
`software-engineer@acme.md` are ~26 mono chars; truncate with `title=` tooltip
beyond that.

**Mobile (<lg):** tree collapses to a horizontal scroll strip *above* the
preview (same pattern ProjectBrowser uses: `overflow-x-auto no-scrollbar`),
breadcrumbs stay, status bar keeps only branch + language. Frame height drops
to `h-[36rem]` so preview stays usable.

---

## 4. Color & Token Mapping (zero new tokens)

Everything reuses the existing delta-token system (`global.css`):

| UI element | Token classes |
|---|---|
| Frame / docks | `bg-surface`, separators `border-line-subtle` |
| Preview area | `bg-canvas` (subtle contrast against surface docks) |
| Selected file row | `bg-control-hover` + `text-default` (Zed uses full-row fill, **not** a left accent bar — that's VS Code) |
| Hover row | `hover:bg-control-hover/60` |
| Dirty dot / git "current" | `text-emerald-600 dark:text-emerald-400` (matches Terminal's success tone) |
| Tab (active) | `bg-canvas` + `text-default`, inactive `text-muted hover:text-subtle` |
| Badges (status/location) | `border border-line-subtle bg-surface text-subtle` |
| H1 in preview | `font-display text-default` (site serif — like Zed's markdown preview using UI font) |
| Links | `text-accent` + dotted underline (matches Terminal `SegmentView`) |

---

## 5. Typography Spec

| Element | Class |
|---|---|
| All chrome (tree, tabs, breadcrumb, status) | `font-mono` |
| Tree rows / tabs | `text-xs` |
| Panel header / breadcrumb / badges | `text-2xs` |
| Status bar | `text-[10px]` |
| Preview H1 | `font-display text-[clamp(1.4rem,2vw+1rem,1.9rem)]` |
| Preview body | `font-body text-sm leading-relaxed text-subtle` |

---

## 6. Interaction & Behavior Spec

**Base:** `@base-ui-components/react` `Tabs.Root orientation="vertical"`,
identical a11y contract to `ProjectBrowser` (arrow-key nav, `aria-selected`,
roving tabindex). The tree *is* the `Tabs.List`; each file row is a `Tabs.Tab`.

1. **Default selection:** first `status === "current"` experience, else first
   in list. Deterministic for SSR/hydration match.
2. **Tab switching:** instant, no transition (Zed buffers swap instantly —
   motion would feel wrong). Exception: preview pane scrolls to top on change
   (`ref.scrollTop = 0` in an effect on active value).
3. **Sticky directories in tree:** folder rows (`work/`, `education/`) use
   `sticky top-0 z-10 bg-surface` inside the scrollable tree — Zed's
   `sticky_scroll` behavior, authentic touch.
4. **Indent guides:** 1px `border-l border-line-subtle` rails at each depth.
5. **Chevrons:** folder rows show `▸/▾`, rotate with `group-data-[open]`;
   folders are collapsible (local `useState`, default all open).
6. **Preview scroll:** `overflow-y-auto` with the site's 6px scrollbar
   (already styled globally).
7. **Reduced motion:** nothing animates anyway except the section-level
   reveal (handled by `SectionShell`).
8. **Links** open in new tab with `rel="noopener noreferrer"`.

**Explicitly out of scope for v1** (see §11 stretch): multi-open accumulating
tabs, quick switcher, zen mode, type filtering.

---

## 7. Data Model (`apps/portfolio/src/data/portfolio.ts`)

```typescript
/**
 * POC / WHY THIS SHAPE:
 * - `file` is the literal tree/tab label — decoupling it from `company`
 *   lets the UI stay "filesystem-true" while headings stay human.
 * - `overview` is prose (markdown-preview paragraph), `highlights` are
 *   bullets: keeps the ReadmePreview renderer a pure function of data,
 *   no markdown parser dependency.
 * - `status` drives TWO UI signals (tab dirty dot + tree git tint), so it
 *   must be a single source of truth — never derive it from `period`.
 */
export interface Experience {
  id: string;                    // "cuet" — tab value, keys
  file: string;                  // "bsc-cse@cuet.md" — tree/tab label
  company: string;               // H1 of the README
  role: string;                  // subtitle
  type: "work" | "education";    // tree folder + breadcrumb segment
  status: "current" | "past";    // ● dirty dot + green git tint
  period: string;                // "2020 – 2024"
  location: string;              // badge
  overview: string;              // README prose paragraph
  highlights: string[];          // README bullets (lead with metrics)
  techStack: string[];           // chip row
  links?: { label: string; url: string }[];
}
```

Ordering: `current` first, then reverse-chronological within each type group.
Tree folder order: `work/` before `education/`.

**Sample seed data (user must confirm real work history — see §12):**

```typescript
experiences: [
  {
    id: "cuet",
    file: "bsc-cse@cuet.md",
    company: "Chittagong University of Engineering & Technology",
    role: "B.Sc. in Computer Science & Engineering",
    type: "education",
    status: "past",
    period: "2020 – 2024",
    location: "Chittagong, Bangladesh",
    overview:
      "Graduated with a focus on software engineering, distributed systems and algorithms. Grounded day-to-day engineering practice in disciplined complexity analysis through 200+ competitive programming problems.",
    highlights: [
      "200+ algorithmic problems solved (LeetCode, Codeforces, AtCoder)",
      "Coursework: Data Structures, DBMS, Networks, Operating Systems",
      "Led multiple team projects through full lifecycle"
    ],
    techStack: ["C++", "Python", "Java", "SQL"],
    links: [{ label: "University", url: "https://www.cuet.ac.bd" }]
  },
  // TODO(user): work entries — placeholder until confirmed:
  // {
  //   id: "…", file: "role@company.md", type: "work", status: "current", …
  // },
] as Experience[]
```

---

## 8. Component Architecture

New island directory (mirrors `islands/terminal/` multi-file pattern):

```
apps/portfolio/src/
├── components/
│   ├── sections/
│   │   └── Experience.astro               # SectionShell wrapper + data wiring
│   └── islands/
│       └── experience/
│           ├── ExperienceWorkspace.tsx    # default export; frame + Tabs.Root + grid
│           ├── TitleBar.tsx               # (inline in Workspace if <20 lines)
│           ├── TabBar.tsx                 # open buffer tab + dirty dot + decorative ×
│           ├── Breadcrumbs.tsx            # akib35 › experience › {type} › {file}
│           ├── ProjectPanel.tsx           # header + sticky folders + Tabs.List tree
│           ├── ReadmePreview.tsx          # Tabs.Panel markdown-preview article
│           ├── StatusBar.tsx              # branch · diagnostics · Ln/Col · lang
│           └── icons.tsx                  # inline SVGs: folder, chevron, file-md,
│                                          #   git-branch, dot, x, check, warn
└── data/portfolio.ts                      # + Experience interface, + experiences[]
```

**Responsibility split (each file small, pure where possible):**

- `ExperienceWorkspace` — owns `Tabs.Root`, the frame div, grid; composes the
  six children; holds folder-open state and preview scroll ref.
- `ProjectPanel` — groups `experiences` by `type`, renders folder rows
  (`<button>` + local open state, **not** tabs) and file rows (`Tabs.Tab`).
- `ReadmePreview` — pure render of one `Experience`; no state.
- `StatusBar` — pure render; derives `Ln` from `overview.length`-ish charm
  value (e.g. `Ln {highlights.length * 6 + 12}, Col 1`) — static per file,
  so SSR-safe.
- `icons.tsx` — stroke-1.5 SVGs, `aria-hidden`, sized via `className` prop.

**POC — frame skeleton (ExperienceWorkspace.tsx):**

```tsx
/**
 * POC / WHY FIXED-HEIGHT FRAME:
 * ProjectBrowser flows with page height; an editor window does not.
 * A fixed frame with overflow-y-auto inside each dock is what makes the
 * brain read this as "embedded Zed window" rather than "tabs on a page".
 * WHY Base UI Tabs (not hand-rolled): vertical orientation + arrow-key
 * nav + aria tablist semantics come free — same contract as ProjectBrowser.
 */
import { Tabs } from "@base-ui-components/react/tabs";

export default function ExperienceWorkspace({ experiences }: { experiences: Experience[] }) {
  const defaultValue = experiences.find((e) => e.status === "current")?.id
    ?? experiences[0]?.id;

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-2xs">
      {/* title bar — same chrome language as the hero Terminal */}
      <TitleBar title="akib35 — experience (read-only)" />

      <Tabs.Root defaultValue={defaultValue} orientation="vertical">
        <TabBar experiences={experiences} />   {/* active tab + ● + × */}
        <BreadcrumbsBar experiences={experiences} />

        <div className="grid h-[32rem] md:h-[36rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
          <ProjectPanel experiences={experiences} />
          <div className="min-w-0 overflow-y-auto bg-canvas">
            {experiences.map((e) => (
              <Tabs.Panel key={e.id} value={e.id} className="outline-none">
                <ReadmePreview experience={e} />
              </Tabs.Panel>
            ))}
          </div>
        </div>

        <StatusBar experiences={experiences} />
      </Tabs.Root>
    </div>
  );
}
```

**POC — tree file row (inside ProjectPanel):**

```tsx
/**
 * POC / WHY full-row fill (bg-control-hover) and NOT a left accent bar:
 * Zed's project panel marks selection with a full-row background fill;
 * the left accent bar is VS Code's language. Small authenticity details
 * are what sell the homage. Green git tint = status "current" (A)dded.
 */
<Tabs.Tab
  value={exp.id}
  className="group flex h-7 w-full items-center gap-2 px-3 font-mono text-xs
    text-subtle outline-none transition-colors
    hover:bg-control-hover/60
    aria-selected:bg-control-hover aria-selected:text-default"
>
  <FileMdIcon className="size-3.5 shrink-0 text-muted" />
  <span className="truncate" title={exp.file}>{exp.file}</span>
  {exp.status === "current" && (
    <span aria-label="current role" className="ml-auto size-1.5 rounded-full
      bg-emerald-500" />
  )}
</Tabs.Tab>
```

**POC — status bar:**

```tsx
/**
 * POC / WHY a status bar: it's the cheapest, highest-signal "this is Zed"
 * cue — one 7px-tall row carries branch, diagnostics, language and cursor.
 * Ln/Col is derived from content length so each file shows a plausible
 * different value without any runtime measurement (SSR-safe).
 */
<footer className="flex h-7 items-center gap-4 border-t border-line-subtle
  px-4 font-mono text-[10px] text-muted">
  <span className="flex items-center gap-1.5"><BranchIcon /> main</span>
  <span className="flex items-center gap-1.5">✓ 0&nbsp;&nbsp;⚠ 0</span>
  <span className="ml-auto hidden sm:block">Ln {lines}, Col 1</span>
  <span className="hidden sm:block">UTF-8</span>
  <span>Markdown</span>
</footer>
```

**POC — README preview header:**

```tsx
/**
 * POC / WHY shields-style badge row: real READMEs open with badges; the
 * status/location/period trio mimics that instantly. H1 uses the site's
 * display serif — matching how Zed's markdown preview swaps buffer font
 * for UI font.
 */
<article className="px-6 py-8 md:px-10">
  <h1 className="font-display text-[clamp(1.4rem,2vw+1rem,1.9rem)] text-default">
    {exp.company}
  </h1>
  <p className="mt-1 text-sm text-subtle">{exp.role}</p>
  <div className="mt-4 flex flex-wrap gap-2 font-mono text-2xs">
    <Badge tone={exp.status === "current" ? "success" : "neutral"}>{exp.status}</Badge>
    <Badge>{exp.period}</Badge>
    <Badge>{exp.location}</Badge>
  </div>
  <hr className="my-6 border-line-subtle" />
  {/* ## Overview · ## Highlights · ## Stack · 🔗 links footer */}
</article>
```

---

## 9. Integration & Renumbering

`index.astro` gains `<Experience />` between Hero and Projects. **All section
indexes shift** (they're the `NN.` in each eyebrow):

| Section | Old | New |
|---|---|---|
| Hero | 01 | 01 |
| **Experience** | — | **02** |
| Projects | 02 | 03 |
| Writings | 03 | 04 |
| Skills | 04 | 05 |
| Contact | 05 | 06 |

Check `SiteSidebar.astro` / `ScrollSpy.astro` for hard-coded nav entries —
the sidebar station list likely needs an `Experience` stop added (spy works
off `data-spy-section`, but the *labels/hrefs* may be explicit markup).

**Section padding:** like Projects, use `pad="px-0 py-0 md:py-0"` so the
editor frame controls its own rhythm, then give the frame
`mx-5 md:mx-8 my-14 md:my-20` (or keep standard pad and drop the frame's
outer margins — pick whichever keeps the frame full-bleed-consistent with
Projects; verify visually).

---

## 10. Accessibility

- Tabs contract from Base UI: `role=tablist/tab/tabpanel`, vertical arrow
  nav, Home/End, roving tabindex.
- Folder collapse buttons: real `<button aria-expanded>` (not Tabs).
- Dirty dots / git tints always paired with `aria-label` ("current role") —
  color is never the only signal.
- `title={exp.file}` on truncated rows.
- Focus visible: `focus-visible:bg-control-hover` on rows (matches existing).
- Frame is not keyboard-trapping: single Tab stop into tablist, out to links.

---

## 11. Stretch Goals (explicitly NOT v1)

1. **Accumulating open tabs** — clicking files *opens* tabs (max ~5, × to
   close) like a real editor. Requires replacing Base UI Tabs with a custom
   state machine (`openIds[]`, `activeId`) and hand-rolled ARIA. High charm,
   medium complexity, real a11y cost — defer.
2. **Breadcrumb type-segment click** → collapse/filter tree to that type.
3. **Zen/expand button** on tab bar right → frame goes `fixed inset-4 z-50`.
4. **`Ctrl+K` quick-open** listing experiences — cute but duplicates tree.

---

## 12. Open Questions (block data seeding, not structure)

1. **What is the real work history?** Current `portfolio.ts` has education +
   projects only. Need: company, role, period, location, 3–4 highlights,
   stack per role. (Seed ships with CUET entry + clearly-marked TODO.)
2. Any freelance/contract/internship entries, or a `type: "freelance"`
   third folder?
3. Resume link placement: status bar right side (`my-cv.pdf ↓`) or README
   links footer per entry? (Recommendation: README links; status bar stays
   pure chrome.)
4. Chronological within folders confirmed OK (current first)?

---

## 13. Build Order

1. `portfolio.ts` — `Experience` interface + `experiences[]` (CUET real,
   work TODO-marked).
2. `icons.tsx` — all SVGs.
3. `ReadmePreview.tsx` (pure, testable in isolation).
4. `ProjectPanel.tsx`, `TabBar.tsx`, `Breadcrumbs.tsx`, `StatusBar.tsx`.
5. `ExperienceWorkspace.tsx` composition.
6. `Experience.astro` + `index.astro` + section renumbering + sidebar nav.
7. Visual pass: dark mode, mobile strip, long-name truncation, scrollbar.

## 14. Test Checklist

- [ ] SSR/CSR markup identical (default tab deterministic)
- [ ] Arrow keys move through file rows; Enter/Space activates
- [ ] Folder collapse buttons work with mouse + keyboard
- [ ] Sticky folder headers pin while tree scrolls
- [ ] Preview scrolls internally; resets to top on tab switch
- [ ] Dirty dot + green tint appear only on `status: "current"`
- [ ] Dark mode: all chrome readable (tokens only, no raw hex)
- [ ] Mobile: horizontal file strip scrolls; status bar condenses
- [ ] 26+ char file names truncate with tooltip
- [ ] Empty `links`/`techStack` render nothing (no orphan headers)
- [ ] ScrollSpy highlights "Experience" stop in sidebar
