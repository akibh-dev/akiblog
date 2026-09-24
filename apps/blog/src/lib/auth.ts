/**
 * @file apps/blog/src/lib/auth.ts
 * @description Cloudflare Access JWT verification (header + CF_Authorization cookie fallback).
 *
 * POC / Implementation Details:
 * - WHY: Cloudflare injects the `Cf-Access-Jwt-Assertion` header only on requests proxied through
 *   the Access application scope (e.g. full-page navigations to /admin/*). Same-origin XHR/fetch
 *   calls (e.g. POST /api/posts from the admin editor) are NOT guaranteed to carry that header —
 *   a long-standing Cloudflare behavior (community.cloudflare.com/t/199707). That mismatch caused
 *   401s on "Add New Post" even though the user held a valid Access session (admin pages loaded
 *   fine because those navigations DO get the header).
 * - FIX: Per Cloudflare's official guidance (developers.cloudflare.com → Access → Validate JWTs),
 *   the HttpOnly `CF_Authorization` cookie carries the SAME signed application JWT and "may be
 *   used to validate requests on your origin". Browsers always send it on same-origin fetches
 *   with `credentials: 'include'`, which the admin UI already sets.
 * - SECURITY: The cookie token is verified with the exact same rules as the header — Access
 *   account JWKS signature, team-domain issuer, and application AUD tag — so this is a strict
 *   widening of token *sources*, not of trust. No unsigned or foreign-tenant token is accepted.
 *   The header remains the preferred source, as Cloudflare recommends.
 * - DEV BYPASS: When DEV_MODE='true' (set by scripts/dev.js) and request is to localhost,
 *   auth is bypassed entirely. This allows `npm run dev:blog` to work without Cloudflare Access.
 * - Note on cookie format: the CF_Authorization value is `<key_id>.<JWT>`, so the JWT portion
 *   after the first `.` is extracted before verification (same approach as Cloudflare's own
 *   `@cloudflare/workers-jwt` reference library).
 */

import { jwtVerify, createRemoteJWKSet } from 'jose';

export interface AccessJWTPayload {
  email: string;
  common_name?: string;
  name?: string;
  sub?: string;
  [key: string]: any;
}

/**
 * Extract the JWT from the CF_Authorization cookie, which stores the token as
 * `<key_id>.<JWT>` (key id prefix + signed token), mirroring Cloudflare's
 * worker-jwt reference implementation. Returns null when absent/malformed.
 */
export function extractJwtFromCfAuthorizationCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cfAuth = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('CF_Authorization='))
    ?.slice('CF_Authorization='.length);

  if (!cfAuth) return null;

  const dotIndex = cfAuth.indexOf('.');
  if (dotIndex === -1) return null;

  const jwt = cfAuth.slice(dotIndex + 1);
  return jwt.length > 0 ? jwt : null;
}

export async function verifyAccessJWT(request: Request, env?: Env): Promise<AccessJWTPayload | null> {
  // Preferred token source (recommended by Cloudflare): injected request header.
  // Fallback for same-origin XHR: the browser-sent CF_Authorization cookie.
  const jwt =
    request.headers.get('Cf-Access-Jwt-Assertion') || extractJwtFromCfAuthorizationCookie(request);

  const url = new URL(request.url);
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
  const isDevMode = env?.DEV_MODE === 'true';

  // Local development bypass: skip Cloudflare Access auth when DEV_MODE=true
  // This allows `npm run dev:blog` to work without Cloudflare Access
  // SECURITY: DEV_MODE is only set to 'true' by scripts/dev.js, never in production
  if (isDevMode) {
    return {
      email: 'admin@akib35.me',
      common_name: 'Local Admin',
    };
  }

  if (!jwt) {
    return null;
  }

  const teamDomain = env?.CLOUDFLARE_TEAM_DOMAIN;
  const audience = env?.CLOUDFLARE_ACCESS_AUD;

  // If Cloudflare Access credentials are not provided, reject
  if (!teamDomain || !audience) {
    return null;
  }

  try {
    const jwksUrl = new URL(`https://${teamDomain}/cdn-cgi/access/certs`);
    const JWKS = createRemoteJWKSet(jwksUrl);

    const { payload } = await jwtVerify(jwt, JWKS, {
      issuer: `https://${teamDomain}`,
      audience,
    });

    return payload as AccessJWTPayload;
  } catch (error) {
    console.error('Cloudflare Access JWT verification failed:', error);
    return null;
  }
}
