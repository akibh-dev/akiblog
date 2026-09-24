/**
 * @file apps/blog/src/pages/api/media/[...key].ts
 * @description Public read-through for R2 media: GET/HEAD /api/media/<key>.
 *
 * BUG FIXED: this route read `locals.runtime.env`, which no longer exists in Astro 6+/
 * @astrojs/cloudflare 13+. `env` was always undefined, so EVERY uploaded image returned 404 in
 * production even though the upload into R2 succeeded. It now uses the shared runtime-env
 * accessor (`cloudflare:workers` env).
 *
 * - Only `uploads/` keys are served (the `.health/` probe prefix and anything else stay private).
 * - ETag / If-None-Match support gives cheap 304s; objects are immutable (UUID keys), so a
 *   one-year immutable cache is safe. `nosniff` stops browsers from re-interpreting content.
 */

import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';

async function serve(params: Record<string, string | undefined>, request: Request, locals: App.Locals, headOnly: boolean) {
  const env = getRuntimeEnv(locals);
  const key = params.key;

  if (!key || !key.startsWith('uploads/') || key.includes('..')) {
    return new Response('Not Found', { status: 404 });
  }
  if (!env?.BUCKET) {
    return new Response('Media storage unavailable', { status: 503 });
  }

  try {
    const object = headOnly ? await env.BUCKET.head(key) : await env.BUCKET.get(key);
    if (!object) return new Response('Not Found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');

    if (request.headers.get('If-None-Match') === object.httpEtag) {
      return new Response(null, { status: 304, headers });
    }
    headers.set('Content-Length', String(object.size));

    const body = headOnly ? null : (object as { body: ReadableStream }).body;
    return new Response(body, { headers });
  } catch {
    return new Response('Error retrieving media', { status: 500 });
  }
}

export const GET: APIRoute = ({ params, request, locals }) => serve(params, request, locals, false);
export const HEAD: APIRoute = ({ params, request, locals }) => serve(params, request, locals, true);
