/**
 * @file pages/posts.json.ts
 * @description Machine-readable post list for the portfolio's Writings
 *              section (plan20 §6 phase 8): replaces the dummy posts in
 *              apps/portfolio/src/data/portfolio.ts.
 *
 * SHAPE = the portfolio's `BlogPost` interface (title, excerpt, date,
 * readingTime, tags, slug, url, banner?), so the portfolio can map it 1:1.
 * `banner` is an absolute URL of a 960px WebP rendered from the cover at
 * build time (same size the portfolio's PostCover requests).
 *
 * Order: newest first (lib/posts getPosts). `featured` marks pinned posts.
 *
 * This static file is ALSO the data source of GET /api/featured
 * (functions/api/featured.ts), which reads it through the Pages ASSETS
 * binding — one build artifact, so the page, the feed and the API can
 * never disagree. Cross-origin reads of this file itself are allowed for
 * the portfolio by public/_headers.
 */
import type { APIContext } from "astro";
import { getImage } from "astro:assets";
import { formatDate, getPosts, postUrl, readingMinutes } from "../lib/posts";

export async function GET(context: APIContext) {
  const site = context.site!;
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  const items = await Promise.all(
    posts.map(async (p) => ({
      title: p.data.title,
      excerpt: p.data.description,
      date: formatDate(p.data.date),
      isoDate: p.data.date.toISOString(),
      readingTime: `${readingMinutes(p.body)} min read`,
      tags: p.data.tags,
      type: p.data.type,
      featured: p.data.featured,
      slug: p.id,
      url: new URL(postUrl(p), site).href,
      banner: p.data.cover
        ? new URL((await getImage({ src: p.data.cover, width: 960, height: 480, fit: "cover", format: "webp" })).src, site).href
        : undefined,
    })),
  );
  return new Response(JSON.stringify({ posts: items }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
