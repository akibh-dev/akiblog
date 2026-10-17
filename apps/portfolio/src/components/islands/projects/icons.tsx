/**
 * @file islands/projects/icons.tsx
 * @description React mirror of the canonical icon set in `src/icons/`.
 *
 * WHY THIS FILE EXISTS (and why it's thin):
 * `.astro` icon components cannot be imported into React (.tsx) islands, so
 * the editor-chrome glyphs used by this workspace are mirrored here as React
 * components. The CANONICAL versions live in `src/icons/ui/*.astro` —
 * same path data, same contract (24×24 grid, stroke-width 1.8, round caps,
 * `currentColor` → automatic dark/light via theme tokens).
 *
 * KEEP IN SYNC: when a ui glyph changes in `src/icons/`, update it here too.
 *
 * MAPPING (tsx export  →  canonical Astro component):
 *   FolderIcon       → ui/Folder.astro        ChevronIcon  → ui/ChevronRight.astro
 *   FileIcon         → ui/FileText.astro      XIcon        → ui/Close.astro
 *   BranchIcon       → ui/GitBranch.astro     CheckIcon    → ui/Check.astro
 *   WarningIcon      → ui/Warning.astro       ArrowLeftIcon/ArrowRightIcon/PlusIcon → ui/*
 *   SplitIcon        → ui/SplitPane.astro     MaximizeIcon → ui/Maximize.astro
 *   SearchIcon       → ui/Search.astro        SparklesIcon → ui/Sparkles.astro
 *   LightbulbIcon    → ui/Lightbulb.astro     SettingsIcon → ui/Settings.astro
 *   PanelLeftCloseIcon → ui/PanelLeftClose.astro
 *   UsersIcon        → ui/Users.astro         OutlineIcon  → ui/Outline.astro
 *   BracesIcon       → ui/Braces.astro        MessageSquareIcon → ui/MessageSquare.astro
 *   BotIcon          → ui/Bot.astro           CopilotIcon  → ui/Copilot.astro
 *   TerminalIcon     → ui/TerminalPrompt.astro (bare >_; tech/Terminal.astro = framed window)
 *   BugIcon          → concept/Bug.astro      (beetle — canonical debug/security glyph)
 *
 * All icons are aria-hidden; the parent button/panel provides the accessible
 * name. Sizing is the caller's job via `className` (e.g. "size-4").
 */

import type { ReactNode } from "react";

interface IconProps {
  className?: string;
}

/** Shared shell — single source of the icon contract on the React side
 *  (mirrors src/icons/IconBase.astro: 24×24, stroke 1.8, round caps/joins,
 *  currentColor, aria-hidden). */
function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

/** Markdown-ish file: folded corner + text lines. → ui/FileText.astro */
export function FileIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6 M9 17h6" />
    </Svg>
  );
}

/** Dismiss cross. → ui/Close.astro (NOT the X/Twitter social mark). */
export function XIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  );
}

/** Branch glyph. → ui/GitBranch.astro */
export function BranchIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 3v12" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </Svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m10.29 3.86-8.47 14.14a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

/* ---------------------------------------------------------------------------
 * Panel / tab-bar / status-bar glyphs
 * ------------------------------------------------------------------------- */

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Svg>
  );
}

/** Editor split: rectangle with a vertical divider. → ui/SplitPane.astro */
export function SplitIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M12 4v16" />
    </Svg>
  );
}

/** Fullscreen: four corner brackets. → ui/Maximize.astro */
export function MaximizeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

/** Inline assist: four-point sparkle. → ui/Sparkles.astro */
export function SparklesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </Svg>
  );
}

/** Code action: lightbulb. → ui/Lightbulb.astro */
export function LightbulbIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </Svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

/** Close sidebar: panel with a left-pointing chevron. → ui/PanelLeftClose.astro */
export function PanelLeftCloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </Svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

/** Outline panel: bulleted list. → ui/Outline.astro */
export function OutlineIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 6h13 M8 12h13 M8 18h13" />
      <path d="M3 6h.01 M3 12h.01 M3 18h.01" />
    </Svg>
  );
}

/** Language servers: braces. → ui/Braces.astro */
export function BracesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
      <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
    </Svg>
  );
}

/** Threads: message bubble. → ui/MessageSquare.astro */
export function MessageSquareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

/** Agent panel: bot. → ui/Bot.astro */
export function BotIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 8V4H8" />
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M2 14h2 M20 14h2" />
      <path d="M15 13v2 M9 13v2" />
    </Svg>
  );
}

/** Bare shell prompt (>_). → ui/TerminalPrompt.astro */
export function TerminalIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </Svg>
  );
}

/** Debug beetle. → concept/Bug.astro (canonical geometry, mirrored here). */
export function BugIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 7.6 A4.2 4.2 0 0 1 16.2 11.8 V14.6 A4.2 4.2 0 0 1 7.8 14.6 V11.8 A4.2 4.2 0 0 1 12 7.6 Z" />
      <path d="M8.2 11.8 h7.6" />
      <path d="M8.3 12.6 H5 M8.6 14.8 L5.6 17.2 M9 10 L6.8 7.6" />
      <path d="M15.7 12.6 H19 M15.4 14.8 L18.4 17.2 M15 10 L17.2 7.6" />
      <path d="M10 6.6 C9.2 5.2 8.2 4.6 7 4.2 M14 6.6 C14.8 5.2 15.8 4.6 17 4.2" />
    </Svg>
  );
}

/** Assistant helmet + visor eyes. → ui/Copilot.astro */
export function CopilotIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3c-4.4 0-8 1.4-8 3.2V13a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V6.2C20 4.4 16.4 3 12 3Z" />
      <path d="M9 9.5v3 M15 9.5v3" />
    </Svg>
  );
}
