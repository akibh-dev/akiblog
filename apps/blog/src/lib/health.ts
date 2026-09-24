/**
 * @file apps/blog/src/lib/health.ts
 * @description Live connectivity checks for the blog's Cloudflare resources (D1, R2, Access).
 *
 * WHY REAL PROBES (not "is the binding defined?"):
 * - A binding can exist while the resource is broken: D1 bound to an un-migrated database,
 *   an R2 bucket the account can no longer reach, Access vars left as placeholders. Checking
 *   `env.DB !== undefined` would show green for all of those. Each check here touches the
 *   resource and reports what it saw, with latency.
 *
 * CHECKS:
 * - D1:     required tables exist in sqlite_master (catches missing migrations) + post count.
 * - R2:     `list({ limit: 1 })` proves the bucket is reachable. Deep mode additionally runs a
 *           put -> get -> delete round-trip on a throwaway `.health/` key (proves write access).
 * - Access: team domain + AUD configured, how this request authenticated, and in deep mode a
 *           fetch of the team JWKS (proves the Worker can reach the signing keys).
 * - Every probe is time-boxed so one hung service cannot stall the admin page.
 */

import type { AuthResult } from './auth';
import { normalizeTeamDomain } from './auth';

export type ServiceState = 'ok' | 'degraded' | 'down';

export interface ServiceCheck {
  id: 'd1' | 'r2' | 'access';
  label: string;
  status: ServiceState;
  summary: string;
  detail?: string;
  latencyMs?: number;
}

export interface HealthReport {
  status: ServiceState;
  checkedAt: string;
  deep: boolean;
  services: ServiceCheck[];
}

const REQUIRED_TABLES = ['posts', 'tags', 'post_tags', 'comments'];
const PROBE_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${PROBE_TIMEOUT_MS} ms`)), PROBE_TIMEOUT_MS)
    ),
  ]);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function checkD1(env?: Env): Promise<ServiceCheck> {
  const base = { id: 'd1' as const, label: 'D1 database' };
  if (!env?.DB) {
    return { ...base, status: 'down', summary: 'Binding "DB" missing', detail: 'Add the d1_databases binding in wrangler.jsonc.' };
  }

  const started = Date.now();
  try {
    const tables = await withTimeout(
      env.DB.prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${REQUIRED_TABLES.map(() => '?').join(',')})`
      )
        .bind(...REQUIRED_TABLES)
        .all<{ name: string }>(),
      'D1 query'
    );
    const found = new Set((tables.results || []).map((r) => r.name));
    const missing = REQUIRED_TABLES.filter((t) => !found.has(t));
    if (missing.length > 0) {
      return {
        ...base,
        status: 'degraded',
        summary: `Missing tables: ${missing.join(', ')}`,
        detail: 'Connected, but migrations have not been applied. Run the deploy workflow with migrations enabled.',
        latencyMs: Date.now() - started,
      };
    }

    const count = await withTimeout(env.DB.prepare('SELECT COUNT(*) AS n FROM posts').first<{ n: number }>(), 'D1 query');
    const n = Number(count?.n ?? 0);
    return {
      ...base,
      status: 'ok',
      summary: `Connected · ${n} ${n === 1 ? 'post' : 'posts'}`,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return { ...base, status: 'down', summary: 'Query failed', detail: errorMessage(error), latencyMs: Date.now() - started };
  }
}

export async function checkR2(env?: Env, deep = false): Promise<ServiceCheck> {
  const base = { id: 'r2' as const, label: 'R2 media bucket' };
  if (!env?.BUCKET) {
    return { ...base, status: 'down', summary: 'Binding "BUCKET" missing', detail: 'Add the r2_buckets binding in wrangler.jsonc.' };
  }

  const started = Date.now();
  try {
    const listing = await withTimeout(env.BUCKET.list({ limit: 1 }), 'R2 list');
    const hasObjects = listing.objects.length > 0;

    if (!deep) {
      return {
        ...base,
        status: 'ok',
        summary: hasObjects ? 'Reachable · has media' : 'Reachable · empty',
        latencyMs: Date.now() - started,
      };
    }

    const key = `.health/probe-${crypto.randomUUID()}`;
    const body = `probe:${Date.now()}`;
    await withTimeout(env.BUCKET.put(key, body, { httpMetadata: { contentType: 'text/plain' } }), 'R2 put');
    const object = await withTimeout(env.BUCKET.get(key), 'R2 get');
    const readBack = object ? await object.text() : null;
    await withTimeout(env.BUCKET.delete(key), 'R2 delete');

    if (readBack !== body) {
      return { ...base, status: 'degraded', summary: 'Write succeeded, read-back mismatch', latencyMs: Date.now() - started };
    }
    return { ...base, status: 'ok', summary: 'Write, read and delete verified', latencyMs: Date.now() - started };
  } catch (error) {
    return { ...base, status: 'down', summary: 'Bucket unreachable', detail: errorMessage(error), latencyMs: Date.now() - started };
  }
}

export async function checkAccess(env: Env | undefined, auth: AuthResult | undefined, deep = false): Promise<ServiceCheck> {
  const base = { id: 'access' as const, label: 'Cloudflare Access' };

  if (auth?.source === 'dev-bypass') {
    return {
      ...base,
      status: 'degraded',
      summary: 'Dev bypass active',
      detail: 'DEV_MODE=true: Access is not enforced. This must never appear in production.',
    };
  }

  const teamDomain = env?.CLOUDFLARE_TEAM_DOMAIN ? normalizeTeamDomain(env.CLOUDFLARE_TEAM_DOMAIN) : '';
  const audience = env?.CLOUDFLARE_ACCESS_AUD?.trim();
  if (!teamDomain || !audience || teamDomain.startsWith('placeholder') || audience.startsWith('placeholder')) {
    return { ...base, status: 'down', summary: 'Not configured', detail: 'Set CLOUDFLARE_TEAM_DOMAIN and CLOUDFLARE_ACCESS_AUD.' };
  }

  const identity = auth?.user?.email || auth?.user?.common_name;
  const via = auth?.source === 'header' ? 'Access header' : auth?.source === 'cookie' ? 'session cookie' : 'unknown source';
  const summary = identity ? `Verified via ${via}` : 'Configured';

  if (!deep) return { ...base, status: 'ok', summary, detail: identity ? `Signed in as ${identity}` : undefined };

  const started = Date.now();
  try {
    const res = await withTimeout(fetch(`https://${teamDomain}/cdn-cgi/access/certs`), 'JWKS fetch');
    const json = res.ok ? ((await res.json()) as { keys?: unknown[] }) : null;
    const keyCount = json?.keys?.length ?? 0;
    if (!res.ok || keyCount === 0) {
      return { ...base, status: 'degraded', summary: 'Signing keys unavailable', detail: `JWKS responded ${res.status}`, latencyMs: Date.now() - started };
    }
    return {
      ...base,
      status: 'ok',
      summary: `${summary} · ${keyCount} signing ${keyCount === 1 ? 'key' : 'keys'}`,
      detail: identity ? `Signed in as ${identity}` : undefined,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return { ...base, status: 'degraded', summary: 'JWKS unreachable', detail: errorMessage(error), latencyMs: Date.now() - started };
  }
}

export async function runHealthChecks(env: Env | undefined, auth: AuthResult | undefined, options: { deep?: boolean } = {}): Promise<HealthReport> {
  const deep = Boolean(options.deep);
  const services = await Promise.all([checkD1(env), checkR2(env, deep), checkAccess(env, auth, deep)]);
  const status: ServiceState = services.some((s) => s.status === 'down')
    ? 'down'
    : services.some((s) => s.status === 'degraded')
      ? 'degraded'
      : 'ok';
  return { status, checkedAt: new Date().toISOString(), deep, services };
}
