/* For more details, see docs/blog/implementation-notes.md#functions-api-featured-ts-note-1. */

interface Env {
  ASSETS: { fetch(input: Request | string | URL): Promise<Response> };
}

interface Post {
  title: string;
  isoDate: string;
  featured?: boolean;
  [key: string]: unknown;
}

// akibh.dev = the portfolio
const ALLOWED_ORIGINS = new Set([
  "https://akibh.dev",
  "https://www.akibh.dev",
  "http://localhost:4322",
  "http://localhost:4323",
]);
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
