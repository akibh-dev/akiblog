/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-terminal-boot-ts-note-1. */
import { kv, t } from "./dsl";
import type { HistoryEntry, OutputLine, PortfolioData } from "./types";

/** Static boot scrollback. `clear` resets to exactly this. */
export function bootEntries(data: PortfolioData, nextId: () => number): HistoryEntry[] {
  const mk = (segments: OutputLine): HistoryEntry => ({ id: nextId(), kind: "output", segments });
  return [
    mk([t("akibh portfolio shell", "accent"), t(" v2.0", "muted")]),
    mk([t("──────────────────────────────────", "muted")]),
    mk([t("● ", "success"), t(data.meta.statusText, "success")]),
    mk(kv("edu", t(`B.Sc. CSE · CUET '${String(data.education.year).slice(-2)}`))),
    mk(kv("loc", t(`${data.meta.location} (${data.meta.timezone})`))),
    mk([t("type ", "muted"), t("'help'", "accent"), t(" to see what this shell can do", "muted")]),
  ];
}
