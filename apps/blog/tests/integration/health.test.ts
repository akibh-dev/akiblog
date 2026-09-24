/**
 * @file tests/integration/health.test.ts
 * @description Health probes (src/lib/health.ts), the /api/health route, and the R2 media
 * read-through, run against the in-memory D1 (real SQLite) and R2 mocks.
 *
 * POC: proves the status panel reports real resource state (tables present, bucket writable)
 * rather than "binding is defined", and that uploaded media is actually served back.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { createTestDatabase, createTestD1, type TestDatabaseContext } from '../helpers/test-db';
import { checkD1, checkR2, checkAccess, runHealthChecks } from '../../src/lib/health';
import { GET as healthGet, POST as healthPost } from '../../src/pages/api/health';
import { GET as mediaGet } from '../../src/pages/api/media/[...key]';
import { POST as uploadRoute } from '../../src/pages/api/upload';

let ctx: TestDatabaseContext;
const env = () => (ctx.locals as any).runtime.env;

beforeEach(() => {
  ctx = createTestDatabase();
});

describe('checkD1()', () => {
  it('is ok on a migrated database and reports the post count', async () => {
    const result = await checkD1(env());
    expect(result.status).toBe('ok');
    expect(result.summary).toMatch(/Connected · 0 posts/);
    expect(typeof result.latencyMs).toBe('number');
  });

  it('is degraded when migrations have not been applied', async () => {
    const emptyD1 = createTestD1(new DatabaseSync(':memory:'));
    const result = await checkD1({ ...env(), DB: emptyD1 });
    expect(result.status).toBe('degraded');
    expect(result.summary).toContain('posts');
  });

  it('is down when the binding is missing', async () => {
    expect((await checkD1({ ...env(), DB: undefined })).status).toBe('down');
  });
});

describe('checkR2()', () => {
  it('passive check lists the bucket', async () => {
    expect((await checkR2(env())).summary).toBe('Reachable · empty');
  });

  it('deep check round-trips and cleans up the probe object', async () => {
    const result = await checkR2(env(), true);
    expect(result.status).toBe('ok');
    expect(result.summary).toBe('Write, read and delete verified');
    expect((await env().BUCKET.list({ prefix: '.health/' })).objects).toHaveLength(0);
  });

  it('is down when the binding is missing', async () => {
    expect((await checkR2({ ...env(), BUCKET: undefined })).status).toBe('down');
  });
});

describe('checkAccess()', () => {
  it('flags the dev bypass as degraded so it is never mistaken for production auth', async () => {
    const result = await checkAccess(env(), { user: { email: 'a@b.c' }, source: 'dev-bypass', reason: null });
    expect(result.status).toBe('degraded');
  });

  it('is down when Access is not configured', async () => {
    const result = await checkAccess({ ...env(), CLOUDFLARE_TEAM_DOMAIN: 'placeholder-team-domain', CLOUDFLARE_ACCESS_AUD: 'x' }, undefined);
    expect(result.status).toBe('down');
  });

  it('reports how the request authenticated', async () => {
    const result = await checkAccess(
      { ...env(), CLOUDFLARE_TEAM_DOMAIN: 't.cloudflareaccess.com', CLOUDFLARE_ACCESS_AUD: 'aud' },
      { user: { email: 'me@akib35.dev' }, source: 'cookie', reason: null }
    );
    expect(result).toMatchObject({ status: 'ok', summary: 'Verified via session cookie', detail: 'Signed in as me@akib35.dev' });
  });
});

describe('runHealthChecks()', () => {
  it('rolls up the worst state', async () => {
    const report = await runHealthChecks(env(), { user: { email: 'a' }, source: 'dev-bypass', reason: null });
    expect(report.services.map((s) => s.id)).toEqual(['d1', 'r2', 'access']);
    expect(report.status).toBe('degraded'); // dev bypass
  });
});

describe('/api/health', () => {
  it('GET returns a passive report, POST runs deep checks', async () => {
    const get = await healthGet({ request: new Request('http://localhost/api/health'), locals: ctx.locals } as any);
    expect(get.headers.get('Cache-Control')).toBe('no-store');
    expect((await get.json()).deep).toBe(false);

    const post = await healthPost({ request: new Request('http://localhost/api/health', { method: 'POST' }), locals: ctx.locals } as any);
    const report = await post.json();
    expect(report.deep).toBe(true);
    expect(report.services.find((s: any) => s.id === 'r2').summary).toBe('Write, read and delete verified');
  });

  it('rejects unauthenticated callers', async () => {
    const locals: any = { runtime: { env: { ...env(), DEV_MODE: 'false' } } };
    const res = await healthGet({ request: new Request('https://blog.akib35.dev/api/health'), locals } as any);
    expect(res.status).toBe(401);
  });
});

describe('R2 media pipeline (/api/upload -> /api/media)', () => {
  it('serves an uploaded image back with its content type and immutable caching', async () => {
    const form = new FormData();
    form.append('image', new File(['png-bytes'], 'cover.png', { type: 'image/png' }));
    const upload = await uploadRoute({ request: new Request('http://localhost/api/upload', { method: 'POST', body: form }), locals: ctx.locals } as any);
    const { file } = await upload.json();
    expect(file.url).toMatch(/^\/api\/media\/uploads\/\d{4}\/\d{2}\//);

    const key = file.url.replace('/api/media/', '');
    const res = await mediaGet({ params: { key }, request: new Request(`http://localhost${file.url}`), locals: ctx.locals } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('immutable');
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe('png-bytes');
  });

  it('refuses to serve non-upload keys such as health probes', async () => {
    const res = await mediaGet({ params: { key: '.health/probe-x' }, request: new Request('http://localhost/x'), locals: ctx.locals } as any);
    expect(res.status).toBe(404);
  });

  it('rejects unsupported upload types with 415', async () => {
    const form = new FormData();
    form.append('image', new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' }));
    const res = await uploadRoute({ request: new Request('http://localhost/api/upload', { method: 'POST', body: form }), locals: ctx.locals } as any);
    expect(res.status).toBe(415);
  });
});
