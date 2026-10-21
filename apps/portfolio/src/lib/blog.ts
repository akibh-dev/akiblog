/**
 * @file lib/blog.ts
 * @description The portfolio's blog posts, fetched from the blog's API AT
 *              BUILD TIME: GET <BLOG_API_URL>/api/featured?limit=3
 *              (apps/blog/functions/api/featured.ts — the blog's featured
 *              posts first, filled with its newest, always `limit` items).
 *
 * WHY BUILD TIME (not in the browser): the portfolio is static — Writings,
 * the terminal's `blog` command and llms.txt are all rendered at build, so
 * the page ships no extra request, no loading state and no extra JS, and
 * the CSP needs no blog origin in connect-src. Freshness comes from the
 * blog's deploy workflow, which re-runs the portfolio deploy after every
 * blog deploy (.github/workflows/blog-deploy.yml) — a new or newly
 * featured post appears here about a minute after it's published.
 *
 * ONE FETCH PER BUILD: the promise is cached at module level, so the three
 * consumers share a single request.
 *
 * FAIL SOFT: if the API is unreachable (offline dev, blog outage) the build
 * still succeeds with an EMPTY list and a warning — Writings then shows a
 * plain "read the blog" state instead of fake posts. Placeholder posts were
 * removed from data/portfolio.ts on purpose: never ship invented content.
 *
 * HOST: `BLOG_API_URL` env, default https://akiblog.pages.dev — the Pages
 * project's permanent hostname, valid before AND after blog.akib35.dev is
 * moved to it. The post `url`s themselves come from the blog
 * (https://blog.akib35.dev/<slug>/).
 *
 * POC:
 *   const posts = await getBlogPosts();   // BlogPost[] (data/portfolio.ts)
 */
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
