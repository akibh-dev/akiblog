/**
 * @file apps/blog/src/lib/access-policy.ts
 * @description Pure route-protection policy used by src/middleware.ts.
 *
 * Kept separate from the middleware so it can be unit-tested without Astro's virtual
 * `astro:middleware` module. "Protected by default" for writes:
 *   - `/admin/**`                          -> admin
 *   - `/api/**` POST/PUT/PATCH/DELETE      -> admin, except PUBLIC_WRITE_ROUTES
 *   - `/api/**` GET `?admin=true`          -> admin
 *   - `/api/health`                        -> admin
 */

export const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Public write endpoints (method + exact path). Everything else that mutates is admin-only. */
export const PUBLIC_WRITE_ROUTES = new Set(['POST /api/comments']);

export function requiresAdmin(method: string, url: URL): boolean {
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/admin' || path.startsWith('/admin/')) return true;
  if (!path.startsWith('/api/')) return false;

  if (path === '/api/health') return true;
  if (MUTATING_METHODS.has(method)) return !PUBLIC_WRITE_ROUTES.has(`${method} ${path}`);
  return url.searchParams.get('admin') === 'true';
}

/**
 * CSRF guard for cookie-authenticated writes. Browsers send `Origin` on POST/PUT/DELETE and
 * `Sec-Fetch-Site` on modern engines; non-browser clients send neither and cannot ride a
 * victim's cookies, so they pass.
 */
export function isSameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin');
  if (origin) return origin === url.origin;
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite) return fetchSite === 'same-origin' || fetchSite === 'none';
  return true;
}
