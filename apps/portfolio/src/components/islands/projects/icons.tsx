/**
 * @file islands/projects/icons.tsx
 * @description Inline stroke icons for the editor chrome.
 *
 * WHY INLINE SVGs (no dependency): the site ships zero icon libraries and
 * the workspace only needs seven glyphs. Each is a feather-style icon —
 * 24×24 viewBox, `stroke="currentColor"`, sized by the caller through the
 * `className` prop. All are `aria-hidden`; where an icon carries meaning
 * (status dots), the parent provides the accessible name.
 */

import type { ReactNode } from "react";

interface IconProps {
  className?: string;
}

/** Shared wrapper for the chrome-expansion glyphs below — keeps stroke
 *  width, viewBox and aria-hidden consistent without repeating the <svg>
 *  boilerplate for every icon. */
function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Markdown-ish file: folded corner + text lines. */
export function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12" />
    </svg>
  );
}

/** feather git-branch. */
export function BranchIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v12" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.29 3.86-8.47 14.14a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Chrome-expansion glyphs (menu bar / tab-bar actions / breadcrumb actions /
 * status-bar panels). Lucide-style paths, all decorative + actionless.
 * ------------------------------------------------------------------------- */

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 19-7-7 7-7" />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 5 7 7-7 7" />
    </Svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" />
    </Svg>
  );
}

/** Split pane: rectangle with a vertical divider. */
export function SplitIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" />
    </Svg>
  );
}

/** Fullscreen: four corner brackets. */
export function MaximizeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
    </Svg>
  );
}

/** Inline assist: four-point sparkle. */
export function SparklesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"
      />
    </Svg>
  );
}

/** Code action: lightbulb. */
export function LightbulbIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 22h4" />
    </Svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

/** Close sidebar: panel with a left-pointing chevron. */
export function PanelLeftCloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 15-3-3 3-3" />
    </Svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

/** Outline panel: bulleted list. */
export function OutlineIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 18h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h.01" />
    </Svg>
  );
}

/** Language servers: braces. */
export function BracesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
    </Svg>
  );
}

/** Threads: message bubble. */
export function MessageSquareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

/** Agent panel: bot. */
export function BotIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V4H8" />
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 14h2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 14h2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13v2" />
    </Svg>
  );
}

export function TerminalIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 6-6-6-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19h8" />
    </Svg>
  );
}

/** Debug: bug. */
export function BugIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 2 1.9 1.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.1 3.9 16 2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 13H2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 13h-4" />
    </Svg>
  );
}

/** GitHub Copilot (simplified): helmet head + visor eyes. */
export function CopilotIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c-4.4 0-8 1.4-8 3.2V13a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V6.2C20 4.4 16.4 3 12 3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.5v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.5v3" />
    </Svg>
  );
}
