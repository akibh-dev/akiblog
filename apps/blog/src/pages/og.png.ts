/**
 * @file pages/og.png.ts
 * @description The site's default Open Graph card, /og.png (1200×630) —
 *              home, tag pages, 404. Rendered at build by lib/og.ts.
 *              (Replaces the copy of the PORTFOLIO's og.png that used to
 *              sit in public/, which branded every blog share wrongly.)
 */
import type { APIRoute } from "astro";
import { renderOgCard } from "../lib/og";
import { site } from "../data/site";

export const GET: APIRoute = async () => {
  const png = await renderOgCard({ title: site.tagline, eyebrow: "notes  /  guides  /  references", meta: "by Md Akib Hasan" });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
