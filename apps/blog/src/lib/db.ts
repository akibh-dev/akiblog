import { env as cfEnv } from 'cloudflare:workers';
import { createDb, type Database } from '@repo/db';

export function getDb(locals?: App.Locals): Database {
  let d1: any = null;

  // 1. Astro v6/v7 native cloudflare:workers binding
  try {
    if (cfEnv && (cfEnv as any).DB) {
      d1 = (cfEnv as any).DB;
    }
  } catch {}

  // 2. Fallback to locals.runtime.env (test harness, custom adapters)
  if (!d1 && (locals as any)?.runtime?.env?.DB) {
    d1 = (locals as any).runtime.env.DB;
  }

  // 3. Fallback to global env
  if (!d1 && (globalThis as any).DB) {
    d1 = (globalThis as any).DB;
  }

  if (!d1) {
    throw new Error('D1 Database binding "DB" is not available on Cloudflare environment.');
  }
  return createDb(d1);
}
