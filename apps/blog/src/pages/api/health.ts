/**
 * @file apps/blog/src/pages/api/health.ts
 * @description Admin-only service health endpoint for D1, R2 and Cloudflare Access.
 *
 * - GET  /api/health -> passive checks (read-only; safe to poll).
 * - POST /api/health -> deep checks: R2 put/get/delete round-trip + Access JWKS fetch.
 *   POST because it writes (and removes) a probe object; GET must stay side-effect free.
 * - Protected by src/middleware.ts (`/api/health` is admin-only); the handler re-checks as
 *   defence-in-depth. Always `no-store`: health data must never be cached by the edge.
 */

import type { APIRoute } from 'astro';
import { authenticateRequest } from '../../lib/auth';
import { getRuntimeEnv } from '../../lib/env';
import { runHealthChecks } from '../../lib/health';

async function handle(request: Request, locals: App.Locals, deep: boolean) {
  const env = getRuntimeEnv(locals);
  const auth = (locals as any).auth ?? (await authenticateRequest(request, env));
  if (!auth.user) {
    return Response.json({ error: 'Unauthorized', reason: auth.reason }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const report = await runHealthChecks(env, auth, { deep });
  return Response.json(report, {
    status: report.status === 'down' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export const GET: APIRoute = ({ request, locals }) => handle(request, locals, false);
export const POST: APIRoute = ({ request, locals }) => handle(request, locals, true);
