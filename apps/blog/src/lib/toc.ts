/**
 * @file lib/toc.ts
 * @description Turns a post's headings into git-graph rows for the
 *              sidebar TOC (layout/TocTree.astro, plan22).
 *
 * MODEL — the heading outline IS a commit graph:
 *   h2 → a commit on the TRUNK (lane 0, the sidebar's existing trunk line)
 *   h3 → a commit on a BRANCH forked from its h2 (lane 1)
 *   h4 → a commit on a branch forked from its h3 (lane 2)
 * A branch FORKS at its first child (45° diagonal out of the parent lane)
 * and MERGES back (45° diagonal into the parent lane) after its last
 * descendant — exactly how `git log --graph` draws a topic branch.
 *
 * Each row only needs three numbers to be drawn locally (no global
 * layout pass, rows can wrap to any height):
 *   lane      where this heading's node sits
 *   prevLane  lane of the row above  (prev < lane  → this row forks)
 *   nextLane  lane of the row below  (next < k     → lane k ends here and
 *                                     merges into k-1 in the bottom band)
 *
 * NORMALISATION: outlines can skip levels (h2 → h4). A lane can only be
 * one deeper than the row above (`lane ≤ prevLane + 1`), so a skipped
 * level renders as a plain child instead of a branch from nowhere. The
 * first row hangs off the trunk (prevLane 0) and the last row hands back
 * to the trunk (nextLane 0), which continues to the sidebar bottom.
 *
 * Example:
 *   tocRows([{depth:2,…}, {depth:3,…}, {depth:3,…}, {depth:2,…}])
 *   → lanes 0,1,1,0  (fork into 1 at row 2, merge back after row 3)
 */
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
