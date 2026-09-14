/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

type Env = {
  DB: D1Database;
  BUCKET?: R2Bucket;
  SITE_URL?: string;
  DEV_MODE?: string;
  CLOUDFLARE_TEAM_DOMAIN?: string;
  CLOUDFLARE_ACCESS_AUD?: string;
  R2_PUBLIC_DOMAIN?: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
