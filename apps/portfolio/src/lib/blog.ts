/* For more details, see docs/portfolio/implementation-notes.md#src-lib-blog-ts-note-1. */
import type { BlogPost } from "../data/portfolio";

const API = (import.meta.env.BLOG_API_URL ?? process.env.BLOG_API_URL ?? "https://akiblog.pages.dev").replace(/\/$/, "");
const LIMIT = 3;
const TIMEOUT_MS = 10_000;

/** Shape served by the blog (pages/posts.json.ts → /api/featured). */
interface ApiPost {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  slug: string;
  url: string;
  banner?: string;
  featured?: boolean;
}

let cached: Promise<BlogPost[]> | undefined;

export function getBlogPosts(): Promise<BlogPost[]> {
  cached ??= (async () => {
    const endpoint = `${API}/api/featured?limit=${LIMIT}`;
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { posts } = (await res.json()) as { posts: ApiPost[] };
      return posts.map(({ title, excerpt, date, readingTime, tags, slug, url, banner }) => ({
        title,
        excerpt,
        date,
        readingTime,
        tags,
        slug,
        url,
        ...(banner ? { banner } : {}),
      }));
    } catch (err) {
      console.warn(`[blog] couldn't load posts from ${endpoint} (${(err as Error).message}) — Writings renders without posts`);
      return [];
    }
  })();
  return cached;
}
