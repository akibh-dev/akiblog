/**
 * @file lib/posts.ts
 * @description The ONE place pages read posts from: draft filtering,
 *              ordering, reading time, tag index and prev/next.
 *
 * WHY A HELPER (not getCollection in every page): the rules "drafts never
 * ship", "newest first", "tags are counted the same way everywhere" must
 * be identical for the index, tag pages, RSS, sitemap-adjacent JSON and
 * the 404 matcher. One module = one definition.
 *
 * DRAFTS: included in `astro dev` (so you can preview them live from
 * ../notes), excluded from every production build — unless the build is
 * run with SHOW_DRAFTS=1 (local preview of unpublished posts).
 *
 * READING TIME: computed from the raw markdown body (code fences count at
 * half weight — readers skim code), 200 wpm, minimum 1 min. Pure, so it is
 * stable across builds and needs no remark plugin.
 *
 * POC:
 *   const posts = await getPosts();
 *   const { prev, next } = neighbours(posts, post.id);
 */
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === "1";

/** All publishable posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => showDrafts || !data.draft);
  const clash = posts.find((p) => RESERVED_SLUGS.has(p.id));
  if (clash) {
    throw new Error(`Post "${clash.id}" uses a reserved slug (it would shadow /${clash.id}/). Set a different \`slug:\` in its frontmatter.`);
  }
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Whole minutes to read `markdown` (≥ 1). */
export function readingMinutes(markdown = ""): number {
  let words = 0;
  const parts = markdown.split(/^```.*$/m);
  parts.forEach((part, i) => {
    const n = part.replace(/<[^>]+>|[#>*_`~\-|[\]()!]/g, " ").split(/\s+/).filter(Boolean).length;
    words += i % 2 === 1 ? n / 2 : n; // odd parts sit inside fences
  });
  return Math.max(1, Math.round(words / 200));
}

/** Tag → posts (newest first), tags sorted by count then name. */
export function tagIndex(posts: Post[]): { tag: string; posts: Post[] }[] {
  const map = new Map<string, Post[]>();
  for (const p of posts) for (const t of p.data.tags) map.set(t, [...(map.get(t) ?? []), p]);
  return [...map.entries()]
    .map(([tag, list]) => ({ tag, posts: list }))
    .sort((a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag));
}

/** Cards per lazy-loaded batch on the home page (2 rows of 3 on lg). */
export const FEED_PAGE_SIZE = 6;

/**
 * The home page's post list (plan26): featured posts first (newest first
 * among them), then every other post newest first — split into the batch
 * rendered in the HTML (`first`) and the batches served as /feed/<n>/
 * fragments (`pages`, n = 2, 3, …) that load as the reader scrolls.
 */
export function homeFeed(posts: Post[]) {
  const featured = posts.filter((p) => p.data.featured);
  const rest = posts.filter((p) => !p.data.featured);
  const pages: Post[][] = [];
  for (let i = 0; i < rest.length; i += FEED_PAGE_SIZE) pages.push(rest.slice(i, i + FEED_PAGE_SIZE));
  return { featured, rest, first: pages[0] ?? [], later: pages.slice(1) };
}

/** Older / newer neighbours of a post in the (newest-first) list. */
export function neighbours(posts: Post[], id: string): { prev?: Post; next?: Post } {
  const i = posts.findIndex((p) => p.id === id);
  return { prev: posts[i + 1], next: i > 0 ? posts[i - 1] : undefined };
}

/** Post URL = the slug straight after the domain (plan24): blog.akib35.dev/<slug>/ */
export const postUrl = (p: Post) => `/${p.id}/`;

/**
 * Slugs that would collide with the site's own routes/files at the root.
 * getPosts() fails the build if a post claims one — a post silently
 * shadowing /tags/ or /rss.xml would be much worse than a red build.
 */
export const RESERVED_SLUGS = new Set(["tags", "rss.xml", "posts.json", "404", "pagefind", "fonts", "_astro", "posts", "content", "search", "sitemap-index.xml"]);

/** "Oct 13, 2026" — en-US, UTC so the build machine's timezone can't shift dates. */
export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
