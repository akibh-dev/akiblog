/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-terminal-dsl-ts-note-1. */

import type { OutputLine, Segment, Tone } from "./types";

/** Plain (optionally toned) text segment. */
export const t = (text: string, tone?: Tone): Segment => ({ text, tone });

/** Link segment — accent-toned, dotted underline in the renderer. */
export const link = (text: string, href: string): Segment => ({
  text,
  href,
  tone: "accent",
});

/** Empty output line. */
export const blank = (): OutputLine => [];

/**
 * Key/value line with the key padded for monospace alignment.
 * The scrollback renders with `whitespace-pre-wrap`, so padding holds.
 */
export const kv = (key: string, ...value: Segment[]): OutputLine => [
  t(`${key}:`.padEnd(14), "muted"),
  ...value,
];

/** Strip protocol for display: "https://github.com/x" → "github.com/x". */
export const shortUrl = (url: string): string => url.replace(/^https?:\/\//, "");
