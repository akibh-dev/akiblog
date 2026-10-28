/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-terminal-render-ts-note-1. */
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
  wrap.append(el("span", "text-accent", "visitor@akibh"), el("span", "text-muted", ":~$"));
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
