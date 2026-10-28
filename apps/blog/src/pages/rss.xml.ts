/* For more details, see docs/blog/implementation-notes.md#src-pages-rss-xml-ts-note-1. */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts, postUrl } from "../lib/posts";
import { site } from "../data/site";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.tagline,
    site: context.site ?? site.url,
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.tags,
      author: `${site.author.email} (${site.author.name})`,
    })),
    customData: `<language>en</language>`,
  });
}
