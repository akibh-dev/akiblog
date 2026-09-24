/**
 * @file apps/blog/src/lib/auth.ts
 * @description Cloudflare Access (Zero Trust) authentication for the admin studio and write APIs.
 *
 * ROOT CAUSE OF THE PRODUCTION 401 (see docs/investigation-auth-401-d1-r2.md):
 * - The previous implementation assumed the `CF_Authorization` cookie was `<key_id>.<JWT>` and
 *   sliced off everything before the first `.`. The real cookie (verified against a production
 *   request capture) is the RAW JWT: `CF_Authorization=eyJhbGciOiJSUzI1NiIs...<payload>.<sig>`.
 *   Slicing removed the JWT *header*, so every cookie-authenticated request (all admin `fetch()`
 *   calls to /api/*, which sit outside the Access application path and therefore never receive
 *   the `Cf-Access-Jwt-Assertion` header) failed signature verification -> 401.
 *
 * DESIGN / POC:
 * - Token sources, in priority order (both are the same Access-signed application token):
 *     1. `Cf-Access-Jwt-Assertion` request header — injected by Cloudflare's edge on requests
 *        that pass through the Access application (e.g. page navigations to /admin/*).
 *     2. `CF_Authorization` cookie — set by Access on login, sent by the browser on every
 *        same-origin request, including `fetch('/api/posts', { credentials: 'include' })`.
 *   Cloudflare documents both as valid for origin-side validation.
 * - Verification (identical for both sources): RS256 signature against the team JWKS
 *   (`https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`), `iss` = team domain,
 *   `aud` = the Access application AUD tag, plus exp/nbf. Nothing unsigned is ever trusted.
 * - JWKS is cached per isolate (module scope). `createRemoteJWKSet` handles key rotation and
 *   cooldown internally, so we avoid one certs fetch per request.
 * - Optional defence-in-depth: `ADMIN_EMAILS` (comma-separated) restricts the identities the
 *   Worker accepts even if the Access policy is later widened by mistake.
 * - `authenticateRequest()` returns a structured result (user, token source, failure reason) so
 *   middleware can return precise 401s and the admin status panel can show how auth resolved.
 *   `verifyAccessJWT()` is kept as the thin, backwards-compatible "user or null" wrapper.
 * - DEV BYPASS: only when `DEV_MODE === 'true'`. The committed `wrangler.jsonc` pins it to
 *   "false"; only `scripts/dev.js` overrides it via `--var DEV_MODE:true`. A hostname check is
 *   NOT usable here because `wrangler dev` rewrites the request URL to the configured route
 *   (`blog.akib35.dev`). The deploy workflow additionally refuses to ship DEV_MODE=true.
 */

import { jwtVerify, createRemoteJWKSet, errors as joseErrors } from 'jose';

export interface AccessJWTPayload {
  email: string;
  common_name?: string;
  name?: string;
  sub?: string;
  [key: string]: any;
}

export type TokenSource = 'header' | 'cookie' | 'dev-bypass';

export type AuthFailureReason =
  | 'no_token' // Neither the Access header nor the CF_Authorization cookie was present
  | 'not_configured' // CLOUDFLARE_TEAM_DOMAIN / CLOUDFLARE_ACCESS_AUD missing
  | 'token_expired'
  | 'invalid_token' // Bad signature, wrong issuer/audience, malformed
  | 'identity_not_allowed'; // Valid token, but identity not in ADMIN_EMAILS

export interface AuthResult {
  user: AccessJWTPayload | null;
  source: TokenSource | null;
  reason: AuthFailureReason | null;
}

const DEV_USER: AccessJWTPayload = { email: 'admin@akib35.me', common_name: 'Local Admin' };

/** Accepts `team.cloudflareaccess.com`, `https://team.cloudflareaccess.com/`, etc. */
export function normalizeTeamDomain(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  let jwks = jwksCache.get(teamDomain);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
    jwksCache.set(teamDomain, jwks);
  }
  return jwks;
}

/** A compact JWS is exactly three non-empty base64url segments. */
function looksLikeJwt(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 3 && parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p));
}

/**
 * Read the Access token from the `CF_Authorization` cookie.
 * The cookie value IS the JWT (no prefix). Returns null when absent or not JWT-shaped.
 */
export function extractJwtFromCfAuthorizationCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (!trimmed.startsWith('CF_Authorization=')) continue;

    let value = trimmed.slice('CF_Authorization='.length).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    try {
      value = decodeURIComponent(value);
    } catch {
      // Keep the raw value; looksLikeJwt() decides.
    }
    return looksLikeJwt(value) ? value : null;
  }
  return null;
}

function parseAllowlist(raw?: string): string[] {
  return (raw || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function authenticateRequest(request: Request, env?: Env): Promise<AuthResult> {
  if (env?.DEV_MODE === 'true') {
    return { user: DEV_USER, source: 'dev-bypass', reason: null };
  }

  const candidates: Array<{ token: string; source: TokenSource }> = [];
  const headerToken = request.headers.get('Cf-Access-Jwt-Assertion')?.trim();
  if (headerToken) candidates.push({ token: headerToken, source: 'header' });
  const cookieToken = extractJwtFromCfAuthorizationCookie(request);
  if (cookieToken && cookieToken !== headerToken) candidates.push({ token: cookieToken, source: 'cookie' });

  if (candidates.length === 0) {
    return { user: null, source: null, reason: 'no_token' };
  }

  const teamDomain = env?.CLOUDFLARE_TEAM_DOMAIN ? normalizeTeamDomain(env.CLOUDFLARE_TEAM_DOMAIN) : '';
  const audience = env?.CLOUDFLARE_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) {
    return { user: null, source: null, reason: 'not_configured' };
  }

  let lastReason: AuthFailureReason = 'invalid_token';
  for (const { token, source } of candidates) {
    try {
      const { payload } = await jwtVerify(token, getJwks(teamDomain), {
        issuer: `https://${teamDomain}`,
        audience,
        algorithms: ['RS256'],
        clockTolerance: 30,
      });

      const user = payload as AccessJWTPayload;
      const allowlist = parseAllowlist(env?.ADMIN_EMAILS);
      const identity = (user.email || user.common_name || '').toLowerCase();
      if (allowlist.length > 0 && !allowlist.includes(identity)) {
        return { user: null, source, reason: 'identity_not_allowed' };
      }
      return { user, source, reason: null };
    } catch (error) {
      lastReason = error instanceof joseErrors.JWTExpired ? 'token_expired' : 'invalid_token';
      console.warn(`[auth] Access token from ${source} rejected: ${(error as Error)?.message ?? error}`);
    }
  }

  return { user: null, source: null, reason: lastReason };
}

/** Backwards-compatible helper used by pages and API routes: the verified user or null. */
export async function verifyAccessJWT(request: Request, env?: Env): Promise<AccessJWTPayload | null> {
  return (await authenticateRequest(request, env)).user;
}

/** Test hook: drop cached JWKS resolvers (used when tests swap the certs endpoint). */
export function __resetJwksCacheForTests() {
  jwksCache.clear();
}
