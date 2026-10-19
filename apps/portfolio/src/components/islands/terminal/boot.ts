/**
 * @file islands/terminal/boot.ts
 * @description Static boot scrollback — moved verbatim out of Terminal.tsx
 *              during the React → pure-Astro migration.
 *
 * WHY A SEPARATE MODULE: both renderers need it — Terminal.astro prints
 * the boot text on the SERVER (zero JS), and shell.ts re-runs it on the
 * client when `clear`/Ctrl+L resets the session. One function, two
 * runtimes, guaranteed identical output.
 *
 * `nextId` is vestigial (ids existed for React keys; the DOM renderer
 * never reads them) but kept so types.ts stays untouched.
 */
import { kv, t } from "./dsl";
import type { HistoryEntry, OutputLine, PortfolioData } from "./types";

/** Static boot scrollback. `clear` resets to exactly this. */
export function bootEntries(data: PortfolioData, nextId: () => number): HistoryEntry[] {
  const mk = (segments: OutputLine): HistoryEntry => ({ id: nextId(), kind: "output", segments });
  return [
    mk([t("akib35 portfolio shell", "accent"), t(" v2.0", "muted")]),
    mk([t("──────────────────────────────────", "muted")]),
    mk([t("● ", "success"), t(data.meta.statusText, "success")]),
    mk(kv("edu", t(`B.Sc. CSE · CUET '${String(data.education.year).slice(-2)}`))),
    mk(kv("loc", t(`${data.meta.location} (${data.meta.timezone})`))),
    mk([t("type ", "muted"), t("'help'", "accent"), t(" to see what this shell can do", "muted")]),
  ];
}
