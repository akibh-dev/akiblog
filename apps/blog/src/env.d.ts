/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/**
 * Worker bindings + vars (see wrangler.jsonc).
 * - DB: D1 blog data. BUCKET: R2 media assets. SESSION: KV for Astro sessions (adapter-managed).
 * - ADMIN_EMAILS (optional): comma-separated allowlist enforced by src/lib/auth.ts on top of
 *   the Cloudflare Access policy.
 */
type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

type Env = {
  DB: D1Database;
  BUCKET?: R2Bucket;
  SITE_URL?: string;
  DEV_MODE?: string;
  CLOUDFLARE_TEAM_DOMAIN?: string;
  CLOUDFLARE_ACCESS_AUD?: string;
  ADMIN_EMAILS?: string;
  R2_PUBLIC_DOMAIN?: string;
};

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts on admin-protected routes. */
    auth?: import('./lib/auth').AuthResult;
    /** Legacy runtime shape; only populated by the test harness. */
    runtime?: { env: Env };
  }
}
