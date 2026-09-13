# Cloudflare Worker Deployment & Custom Domain Architecture (plan4.md)

This plan details the migration to a native **Cloudflare Worker** (with Static Assets binding) routing directly to the custom domain **`blog.akib35.dev`** (or `akib35.dev/blog`).

---

## 1. Cloudflare Pages vs. Cloudflare Workers Decision

### Should you delete the Pages project?
**Yes**, you can delete the inactive/static Pages project named `blog` (or `blog-2i8`) in your Cloudflare Dashboard under **Compute (Workers & Pages) -> Pages**, as it is no longer needed. 

### Why Native Worker is Better:
- **Direct Edge Routing**: Runs directly on Cloudflare's core V8 isolate network.
- **Unified D1 & R2 Bindings**: Zero translation layer between Astro SSR and D1/R2.
- **Custom Domains**: Attaches directly to `blog.akib35.dev` or routes on `akib35.dev`.

---

## 2. Custom Domain Configuration (`blog.akib35.dev`)

In `apps/blog/wrangler.toml`, we configure the custom domain routes and environment variables for `akib35.dev`:

```toml
name = "blog"
compatibility_date = "2026-03-13"
compatibility_flags = ["nodejs_compat"]

# Custom Domain Route on Cloudflare
routes = [
  { pattern = "blog.akib35.dev", custom_domain = true }
]

[assets]
directory = "dist/client"
binding = "ASSETS"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "blog-db-local-id"

# R2 Bucket binding
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "blog-media"

[vars]
SITE_URL = "https://blog.akib35.dev"
DEV_MODE = "false"
CLOUDFLARE_TEAM_DOMAIN = ""
CLOUDFLARE_ACCESS_AUD = ""
R2_PUBLIC_DOMAIN = "/api/media"
```

---

## 3. Automated CI/CD Pipeline (`.forgejo/workflows/deploy.yml`)

The Alpine Forgejo workflow deploys directly via `wrangler deploy --config dist/server/wrangler.json`:
1. Injects the production D1 UUID from secret `CLOUDFLARE_DATABASE_ID`.
2. Applies remote D1 schema migrations idempotently.
3. Deploys the Worker and attaches it to `blog.akib35.dev`.
