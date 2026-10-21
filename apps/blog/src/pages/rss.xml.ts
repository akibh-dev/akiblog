/**
 * @file pages/rss.xml.ts
 * @description RSS 2.0 feed of all published posts (@astrojs/rss).
 *
 * WHY description-only items (no full HTML body): feed readers then show
 * the same summary search engines and social cards use, and readers click
 * through to the real page — where code frames, callouts and the TOC
 * actually work (a feed reader strips our CSS + scripts anyway).
 * Categories = tags, so readers can filter; drafts never appear
 * (lib/posts getPosts). Absolute links come from `site` in astro.config.
 */
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
