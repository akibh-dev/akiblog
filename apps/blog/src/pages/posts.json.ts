/* For more details, see docs/blog/implementation-notes.md#src-pages-posts-json-ts-note-1. */
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
