/**
 * @file islands/projects/EditorStatusBar.tsx
 * @description Bottom status bar — full Zed chrome (user-directed layout).
 *
 * POC / LAYOUT (per user direction, matching Zed's real bar):
 *   LEFT:  toggle sidebar (WIRED) · git branch icon(+dirty dot) · collab ·
 *          outline · project search · language servers · diagnostics
 *   RIGHT: position (25:1) · line ending (LF) · filetype (Markdown) ·
 *          encoding (UTF-8) · copilot · debug · terminal · agent · threads
 * File-dependent items (position/LF/Markdown/UTF-8) render ONLY when a
 * buffer is open. Icon clusters hide progressively below md/lg.
 *
 * POC / TEXT SIZING (the browser min-font saga): class-based font sizes
 * on <button> elements proved unreliable (UA button fonts, pipeline
 * edge cases), so ALL text sizing is INLINE via TEXT_STYLE — no CSS
 * pipeline can drop it, and it always wins over class rules. Every item
 * shares the same fixed box (h-5) with leading-none, so icons and text
 * sit on one center line. NOTE: no CSS can beat a browser-level minimum
 * font size — 9px + tracking-tight is the chosen floor; bump TEXT_STYLE
 * (one line) to change it everywhere.
 */
import ChromeButton from "./ChromeButton";
import {
  BotIcon,
  BracesIcon,
  BranchIcon,
  BugIcon,
  CheckIcon,
  CopilotIcon,
  MessageSquareIcon,
  OutlineIcon,
  PanelLeftCloseIcon,
  SearchIcon,
  TerminalIcon,
  UsersIcon,
  WarningIcon,
} from "./icons";
import { getHighlights } from "./dummy";
import type { ProjectFile } from "./types";

interface Props {
  file?: ProjectFile;
  hasDirty: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

/** Shared base for all text buttons — same box as ChromeButton (h-5). */
const ITEM =
  "inline-flex h-5 items-center gap-1 rounded-sm px-1.5 leading-none tracking-tight outline-none " +
  "transition-colors hover:bg-control-hover hover:text-subtle focus-visible:bg-control-hover";

/** Inline so no pipeline can drop it; beats every class-based rule. */
const TEXT_STYLE = { fontSize: 9 } as const;

function TextItem({
  label,
  title,
  className = "",
}: {
  label: string;
  title?: string;
  className?: string;
}) {
  return (
    <button type="button" title={title ?? label} style={TEXT_STYLE} className={`${ITEM} ${className}`}>
      {label}
    </button>
  );
}

export default function EditorStatusBar({ file, hasDirty, sidebarOpen, onToggleSidebar }: Props) {
  const lines = file ? 14 + getHighlights(file).length * 2 + file.techStack.length : null;

  return (
    <footer
      style={TEXT_STYLE}
      className="flex h-7 items-center gap-0.5 border-t border-line-subtle px-2 font-mono text-muted"
    >
      {/* ── left cluster ─────────────────────────────────────────── */}
      <ChromeButton label="Toggle Sidebar" pressed={sidebarOpen} onClick={onToggleSidebar}>
        <PanelLeftCloseIcon className="size-3" />
      </ChromeButton>

      {/* branch icon only — no label (user direction); dot = dirty */}
      <button
        type="button"
        title="Git branch: main"
        aria-label="Git branch: main"
        style={TEXT_STYLE}
        className={ITEM}
      >
        <BranchIcon className="size-3" />
        {hasDirty && (
          <span
            role="img"
            aria-label="uncommitted changes"
            title="Uncommitted changes"
            className="size-1.5 rounded-full bg-emerald-500"
          />
        )}
      </button>

      <ChromeButton label="Collaboration" className="hidden md:inline-flex">
        <UsersIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Outline" className="hidden md:inline-flex">
        <OutlineIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Project search" className="hidden md:inline-flex">
        <SearchIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Language servers" className="hidden md:inline-flex">
        <BracesIcon className="size-3" />
      </ChromeButton>

      <button type="button" title="Diagnostics" style={TEXT_STYLE} className={`${ITEM} gap-2`}>
        <span className="flex items-center gap-1">
          <CheckIcon className="size-2.5" /> 0
        </span>
        <span className="flex items-center gap-1">
          <WarningIcon className="size-2.5" /> 0
        </span>
      </button>

      {/* ── right cluster — position first, threads at the edge ──── */}
      <span className="ml-auto" />

      {/* file-dependent group — removed entirely when no buffer is open */}
      {file && (
        <>
          {lines !== null && (
            <TextItem
              label={`${lines}:1`}
              title={`Ln ${lines}, Col 1`}
              className="hidden sm:inline-flex"
            />
          )}
          <TextItem label="LF" className="hidden md:inline-flex" />
          <TextItem label="Markdown" />
          <TextItem label="UTF-8" className="hidden sm:inline-flex" />
        </>
      )}

      <ChromeButton label="GitHub Copilot" className="hidden lg:inline-flex">
        <CopilotIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Debug" className="hidden lg:inline-flex">
        <BugIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Terminal" className="hidden lg:inline-flex">
        <TerminalIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Agent panel" className="hidden lg:inline-flex">
        <BotIcon className="size-3" />
      </ChromeButton>
      <ChromeButton label="Threads" className="hidden lg:inline-flex">
        <MessageSquareIcon className="size-3" />
      </ChromeButton>
    </footer>
  );
}
