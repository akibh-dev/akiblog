/**
 * @file apps/blog/src/lib/env.ts
 * @description Cloudflare environment accessor supporting Astro v6/v7 and legacy fallbacks.
 * 
 * POC / Implementation Details:
 * - In Astro v6/v7 with `@astrojs/cloudflare` v14+, Cloudflare bindings are exported via `cloudflare:workers` (env).
 * - This accessor safely inspects `cloudflare:workers` env first, falling back to `locals.runtime.env` (for test harnesses).
 */

import { env as cfEnv } from 'cloudflare:workers';

export function getRuntimeEnv(locals?: App.Locals): Env {
  let combined: any = {};

  try {
    if (cfEnv && typeof cfEnv === 'object') {
      combined = { ...cfEnv };
    }
  } catch {}

  try {
    const runtimeEnv = (locals as any)?.runtime?.env;
    if (runtimeEnv && typeof runtimeEnv === 'object') {
      combined = { ...runtimeEnv, ...combined };
    }
  } catch {}

  return combined as Env;
}
