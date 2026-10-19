/**
 * @file islands/terminal/render.ts
 * @description DOM renderer for terminal entries — replaces the React
 *              JSX rendering (Prompt / SegmentView / entries.map).
 *
 * POC / WHY textContent-ONLY RENDERING: command output is data, not
 * markup. Building nodes with `textContent` (never innerHTML) makes HTML
 * injection structurally impossible — the same guarantee JSX gave us,
 * kept after the migration.
 *
 * TONE_CLASS / LINK_CLASS are exported so Terminal.astro's server-side
 * boot render uses the IDENTICAL class strings (single source of truth
 * between SSR and the client renderer).
 */
import type { HistoryEntry, Segment, Tone } from "./types";

export const TONE_CLASS: Record<Tone, string> = {
  default: "text-default",
  subtle: "text-subtle",
  muted: "text-muted",
  accent: "text-accent",
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-500 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
};

export const LINK_CLASS =
  "underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-75";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text; // textContent: no HTML injection
  return node;
}

export function renderSegment(s: Segment): HTMLElement {
  const cls = TONE_CLASS[s.tone ?? "default"];
  if (!s.href) return el("span", cls, s.text);

  const a = el("a", `${cls} ${LINK_CLASS}`, s.text);
  a.href = s.href;
  if (!s.href.startsWith("mailto:")) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}

export function renderPrompt(): HTMLElement {
  const wrap = el("span", "mr-2 shrink-0 select-none");
  wrap.append(el("span", "text-accent", "visitor@akib35"), el("span", "text-muted", ":~$"));
  return wrap;
}

export function renderEntry(entry: HistoryEntry): HTMLElement {
  const row = el("div", "flex items-baseline");
  if (entry.kind === "command") row.append(renderPrompt());
  const body = el("span", "min-w-0");
  body.append(...entry.segments.map(renderSegment));
  row.append(body);
  return row;
}
