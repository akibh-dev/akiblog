/**
 * @file functions/api/contact.ts
 * @description Pages Function for POST /api/contact. Forwards the contact
 *              form to the private `mailer` Worker over the MAILER service
 *              binding (configured in wrangler.toml).
 *
 *   Browser ──POST /api/contact (same origin)──▶ this Function
 *                                                  │ env.MAILER.fetch(request)
 *                                                  ▼  (service binding, never public)
 *                                                mailer Worker → Turnstile → Email Routing
 *
 * WHY THIS IMPLEMENTATION (POC / rationale):
 * 1. PAGES FUNCTION, NOT A WORKER SCRIPT — the portfolio is deployed to
 *    Cloudflare Pages. Pages turns `functions/` into routes and generates
 *    _routes.json, so ONLY /api/contact runs code; every other path stays
 *    a static asset with no compute.
 * 2. HTTP ENTRYPOINT — Pages Functions call bindings via fetch(), and the
 *    mailer exposes an HTTP entrypoint that runs the same checks as its RPC
 *    `send()`. Forwarding the request unchanged keeps the Content-Type and
 *    Cloudflare's CF-Connecting-IP header, which the mailer prefers over
 *    any `ip` field in the body, so the per-IP rate limit can't be spoofed.
 * 3. NO SECRETS HERE — validation, the honeypot, the rate limit, Turnstile
 *    Siteverify (secret + hostname check) and sending all live in the mailer.
 * 4. SAME ORIGIN — the form posts to its own host, so there is no CORS, and
 *    the Turnstile token's hostname (akib35.dev) is in the mailer's
 *    TURNSTILE_HOSTNAMES.
 * 5. FAIL SAFE — if the binding is missing (not configured, or local
 *    `astro dev`), the visitor gets a JSON error they can read, not a crash page.
 *
 * Types are declared locally so this file needs no @cloudflare/workers-types
 * globals (which would clash with Astro's DOM types).
 */

interface Env {
  MAILER?: { fetch(request: Request): Promise<Response> };
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    if (!env.MAILER) throw new Error("MAILER binding missing");
    return await env.MAILER.fetch(request);
  } catch {
    return Response.json(
      { success: false, error: "Mail service unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
};
