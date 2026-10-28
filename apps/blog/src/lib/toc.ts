/* For more details, see docs/blog/implementation-notes.md#src-lib-toc-ts-note-1. */
import type { MarkdownHeading } from "astro";

export interface TocRow {
  slug: string;
  text: string;
  lane: number;
  prevLane: number;
  nextLane: number;
}

/** deepest lane drawn (h4); deeper headings are not listed */
export const MAX_LANE = 2;

export function tocRows(headings: MarkdownHeading[]): TocRow[] {
  const items = headings.filter((h) => h.depth >= 2 && h.depth <= 2 + MAX_LANE);
  const lanes: number[] = [];
  items.forEach((h, i) => {
    const prev = i === 0 ? 0 : lanes[i - 1];
    lanes.push(Math.min(h.depth - 2, prev + 1));
  });
  return items.map((h, i) => ({
    slug: h.slug,
    text: h.text,
    lane: lanes[i],
    prevLane: i === 0 ? 0 : lanes[i - 1],
    nextLane: i === items.length - 1 ? 0 : lanes[i + 1],
  }));
}
