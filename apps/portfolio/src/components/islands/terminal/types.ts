/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-terminal-types-ts-note-1. */

import type { portfolioData } from "../../../data/portfolio";
import type { ThemeMode } from "../../../lib/theme";

/** Inferred straight from the data file — the terminal can't drift from content. */
export type PortfolioData = typeof portfolioData;

export type Tone =
  | "default"
  | "subtle"
  | "muted"
  | "accent"
  | "success"
  | "error"
  | "warning";

export interface Segment {
  text: string;
  tone?: Tone;
  /** Renders the segment as an anchor. mailto: opens directly, rest open in a new tab. */
  href?: string;
}

/** One rendered line in the scrollback. */
export type OutputLine = Segment[];

/** A line in the visible scrollback: either a typed command echo or output. */
export interface HistoryEntry {
  id: number;
  kind: "command" | "output";
  segments: OutputLine;
}

/** Everything a command may need at execution time. */
export interface CommandContext {
  /** argv after the command name, split on whitespace. */
  args: string[];
  /** Full portfolio content model. */
  data: PortfolioData;
  /** All registered commands (powers `help` and discoverability). */
  commands: readonly Command[];
  /** Apply + persist a theme (validated by the caller via isThemeMode). */
  setTheme: (mode: ThemeMode) => void;
}

export interface Command {
  name: string;
  description: string;
  /** Shown in `help` when present, e.g. "project <n|name>". */
  usage?: string;
  aliases?: readonly string[];
  /** Excluded from `help` (easter eggs). */
  hidden?: boolean;
  execute: (ctx: CommandContext) => OutputLine[];
}
