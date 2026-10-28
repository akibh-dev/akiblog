/* For more details, see docs/blog/implementation-notes.md#src-pages-og-png-ts-note-1. */
import type { APIRoute } from "astro";
import { renderOgCard } from "../lib/og";
import { site } from "../data/site";

export const GET: APIRoute = async () => {
  const png = await renderOgCard({ title: site.tagline, eyebrow: "notes  /  guides  /  references", meta: "by Md Akib Hasan" });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
