/**
 * @file functions/api/featured.ts
 * @description Pages Function for GET /api/featured — the posts the
 *              portfolio's Writings section shows (plan26).
 *
 *   portfolio ──GET https://blog.akib35.dev/api/featured?limit=3──▶ this Function
 *                                                      │ env.ASSETS.fetch("/posts.json")
 *                                                      ▼  (the build's own static file)
 *                                        featured first, filled with the newest
 *
 * RESPONSE  { posts: Post[] }  — exactly `limit` items when the blog has
 * that many posts: every `featured: true` post (newest first), then the
 * newest non-featured posts to fill the remaining slots, so a 3-column
 * Writings row is always full. Item shape = /posts.json (the portfolio's
 * BlogPost interface + isoDate/type/featured). `limit` 1–6, default 4.
 *
 * WHY A PAGES FUNCTION (POC / rationale):
 * 1. Everything else on the blog is static. Pages turns `functions/` into
 *    routes and auto-generates _routes.json so ONLY /api/* runs code —
 *    every page, image and /posts.json stays a free static request
 *    (developers.cloudflare.com/pages/functions/routing).
 * 2. NO SECOND SOURCE OF TRUTH: the data is the build artifact
 *    /posts.json, read through the ASSETS binding (Pages' own static
 *    asset server — no network hop, no KV/D1). What the blog renders and
 *    what the API returns come from the same notes commit.
 * 3. A real API surface the portfolio can rely on: `?limit=`, featured
 *    ordering + fill, CORS for the portfolio origin, explicit caching —
 *    things a raw static file can't negotiate.
 * 4. CHEAP: responses are CDN-cacheable (s-maxage) and the portfolio is
 *    static too, so it calls this at ITS build/deploy time, not per visit.
 *
 * CORS: GET is a "simple" request, so browsers need only the
 * Access-Control-Allow-Origin on the response; OPTIONS is answered anyway
 * for clients that pre-flight. Allowed: the portfolio + its local dev
 * servers. Server-side callers (the portfolio build) ignore CORS.
 *
 * Types are declared locally (as in the portfolio's functions/api/contact.ts)
 * so this file needs no @cloudflare/workers-types globals.
 *
 * Local test: `bun run preview:pages` → http://localhost:4332/api/featured?limit=3
 */

interface Env {
  ASSETS: { fetch(input: Request | string | URL): Promise<Response> };
}

interface Post {
  title: string;
  isoDate: string;
  featured?: boolean;
  [key: string]: unknown;
}

const ALLOWED_ORIGINS = new Set(["https://akib35.dev", "https://www.akib35.dev", "http://localhost:4322", "http://localhost:4323"]);
const DEFAULT_LIMIT = 4;
const MAX_LIMIT = 6;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  return origin && ALLOWED_ORIGINS.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, OPTIONS", Vary: "Origin" }
    : { Vary: "Origin" };
}

/** featured (newest first), then the newest others, `limit` in total */
function pickFeatured(posts: Post[], limit: number): Post[] {
  const byDate = [...posts].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  const featured = byDate.filter((p) => p.featured);
  const rest = byDate.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(raw) ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(raw))) : DEFAULT_LIMIT;

  try {
    const res = await env.ASSETS.fetch(new URL("/posts.json", url));
    if (!res.ok) throw new Error(`posts.json → ${res.status}`);
    const { posts } = (await res.json()) as { posts: Post[] };
    return Response.json(
      { posts: pickFeatured(posts, limit) },
      {
        headers: {
          ...corsHeaders(request),
          // browsers 5 min, Cloudflare's edge 1 h; a deploy publishes new
          // posts.json, so stale edge copies are bounded by one hour
          "Cache-Control": "public, max-age=300, s-maxage=3600",
        },
      },
    );
  } catch {
    return Response.json(
      { posts: [], error: "Posts unavailable" },
      { status: 502, headers: { ...corsHeaders(request), "Cache-Control": "no-store" } },
    );
  }
};

export const onRequestOptions = async ({ request }: { request: Request }) =>
  new Response(null, { status: 204, headers: { ...corsHeaders(request), "Access-Control-Max-Age": "86400" } });
