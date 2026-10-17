/**
 * @file islands/projects/PreviewMinimap.tsx
 * @description Decorative minimap — a right-edge strip of tiny colored
 *              bars representing the README's shape (headings, prose,
 *              bullets, chips), like Zed/VS Code's code minimap.
 *
 * POC / WHY DERIVED FROM DATA: every bar is computed deterministically
 * from the project's real fields (description length, highlights, tech
 * stack), so each file's minimap has a distinct, plausible "document
 * fingerprint" — zero runtime measurement, SSR-safe.
 *
 * Purely decorative: aria-hidden, pointer-events-none, hidden below lg.
 * It is rendered OUTSIDE the scroll container (absolute in the preview
 * wrapper) so it stays fixed on the right edge while content scrolls.
 */
import { getHighlights } from "./dummy";
import type { ProjectFile } from "./types";

type Tone = "accent" | "text" | "chip" | "faint";
interface Segment {
  w: number; // % of strip width
  tone: Tone;
}
type Row = Segment[]; // empty row = vertical gap (blank line)

const TONE_CLASS: Record<Tone, string> = {
  accent: "bg-accent/70", // headings, bullets, links
  text: "bg-muted/60", // section headings, subtitle
  chip: "bg-accent/35", // badges, tech chips
  faint: "bg-muted/35", // prose lines
};

/** Deterministic width variation so prose lines don't look uniform. */
function vary(seed: number, min: number, span: number) {
  return min + ((seed * 37 + 13) % span);
}

function buildRows(file: ProjectFile): Row[] {
  const rows: Row[] = [];

  // H1 + subtitle + badge row
  rows.push([{ w: 68, tone: "accent" }]);
  rows.push([{ w: 42, tone: "text" }]);
  rows.push([
    { w: 18, tone: "chip" },
    { w: 14, tone: "chip" },
    { w: 22, tone: "chip" },
  ]);
  rows.push([]);

  // Overview prose — line count follows description length
  const descLines = Math.min(6, Math.max(3, Math.round(file.description.length / 55)));
  for (let i = 0; i < descLines; i++) rows.push([{ w: vary(i, 55, 40), tone: "faint" }]);
  rows.push([]);

  // ## Highlights — accent bullet dot + line per highlight
  rows.push([{ w: 30, tone: "text" }]);
  getHighlights(file).forEach((h, i) =>
    rows.push([
      { w: 5, tone: "accent" },
      { w: vary(i + h.length, 45, 40), tone: "faint" },
    ])
  );
  rows.push([]);

  // ## Stack — one row of chips (capped widths so the row never overflows)
  rows.push([{ w: 20, tone: "text" }]);
  rows.push(
    file.techStack.slice(0, 5).map((t) => ({
      w: Math.min(22, 6 + t.length),
      tone: "chip" as const,
    }))
  );

  // links footer
  if (file.githubUrl || file.liveUrl) {
    rows.push([]);
    rows.push([
      { w: 16, tone: "accent" },
      { w: 16, tone: "accent" },
    ]);
  }

  return rows;
}

interface Props {
  file: ProjectFile;
}

export default function PreviewMinimap({ file }: Props) {
  const rows = buildRows(file);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-1.5 hidden w-10 select-none flex-col gap-[3px] overflow-hidden py-3 opacity-70 lg:flex"
    >
      {rows.map((row, i) =>
        row.length === 0 ? (
          <span key={i} className="h-[5px] shrink-0" />
        ) : (
          <span key={i} className="flex h-[3px] shrink-0 items-center gap-[2px]">
            {row.map((seg, j) => (
              <span
                key={j}
                className={`h-full rounded-[1px] ${TONE_CLASS[seg.tone]}`}
                style={{ width: `${seg.w}%` }}
              />
            ))}
          </span>
        )
      )}
    </div>
  );
}
