/**
 * @file apps/blog/src/middleware.ts
 * @description Central authentication gate for the admin studio and every write API.
 *
 * WHY A MIDDLEWARE:
 * - Before this, each page/route called `verifyAccessJWT()` on its own. One forgotten call means
 *   an unauthenticated write endpoint. A single gate makes "protected by default" the rule:
 *     - `/admin/**`                          -> always requires an admin identity
 *     - `/api/**` with POST/PUT/PATCH/DELETE -> requires an admin identity, except the explicit
 *                                              public allowlist (reader comments)
 *     - `/api/**` GET with `?admin=true`, and `/api/health` -> admin only
 *   Route handlers keep their own checks as defence-in-depth (cheap: JWKS is cached).
 *
 * CSRF:
 * - Admin API calls may authenticate with the `CF_Authorization` cookie, which the browser
 *   attaches automatically. For cookie-authenticated state-changing requests we require the
 *   request to be same-origin (`Origin` / `Sec-Fetch-Site`). JSON bodies already force a CORS
 *   preflight cross-site; this also covers multipart uploads.
 *
 * OUTPUT:
 * - `locals.auth` carries the structured AuthResult (user, token source, failure reason) for
 *   pages, API routes, and the admin status panel.
 * - Failures return JSON (API) or a short HTML page (admin) with `Cache-Control: no-store`.
 */

import { defineMiddleware } from 'astro:middleware';
import { authenticateRequest } from './lib/auth';
import { getRuntimeEnv } from './lib/env';
import { requiresAdmin, isSameOrigin, MUTATING_METHODS } from './lib/access-policy';

const REASON_MESSAGES: Record<string, string> = {
  no_token: 'No Cloudflare Access session found. Sign in again.',
  not_configured: 'Cloudflare Access is not configured on this Worker.',
  token_expired: 'Your Cloudflare Access session has expired. Reload the page to sign in again.',
  invalid_token: 'Your Cloudflare Access token could not be verified. Reload the page to sign in again.',
  identity_not_allowed: 'This account is not allowed to manage the blog.',
  cross_origin: 'Cross-site request blocked.',
};

function deny(isApi: boolean, status: 401 | 403, reason: string) {
  const message = REASON_MESSAGES[reason] || (status === 403 ? 'Forbidden' : 'Unauthorized');
  const headers = { 'Cache-Control': 'no-store' };

  if (isApi) {
    return Response.json({ error: status === 403 ? 'Forbidden' : 'Unauthorized', reason, message }, { status, headers });
  }
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${status}</title>` +
      `<body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1.5rem;line-height:1.5">` +
      `<h1 style="font-size:1.25rem">Studio access required</h1><p>${message}</p>` +
      `<p><a href="/admin">Try again</a></p></body>`,
    { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, locals } = context;
  if (!requiresAdmin(request.method, url)) return next();

  const isApi = url.pathname.startsWith('/api/');
  const auth = await authenticateRequest(request, getRuntimeEnv(locals));
  locals.auth = auth;

  if (!auth.user) return deny(isApi, 401, auth.reason || 'invalid_token');

  if (auth.source === 'cookie' && MUTATING_METHODS.has(request.method) && !isSameOrigin(request, url)) {
    return deny(isApi, 403, 'cross_origin');
  }

  return next();
});
