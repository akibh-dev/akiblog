# Production D1 Migration & Database Management Architecture (plan9.md)

This document outlines the migration-only deployment strategy:
1. Complete removal of seed scripts from deployment pipelines (seed data is exclusively for local test suites and offline mock harnesses).
2. Automated execution of pending SQL migrations using D1's migration framework / idempotent migration scripts.
3. Clean zero-touch database maintenance in production.

---

## 1. Migration Strategy: Zero-Seed Production Deployment

Production databases must never be seeded automatically on deployment, as doing so can overwrite live data or create duplicate seed records.

```
┌────────────────────────────────────────────────────────┐
│ Continuous Deployment Pipeline                          │
│                                                        │
│ 1. Extract `dist.tar.gz` (Pre-compiled SSR artifacts)   │
│ 2. Inject `CLOUDFLARE_DATABASE_ID`                     │
│ 3. Execute Pending Migrations (`0000_initial.sql`...)  │
│    - All DDL uses `CREATE TABLE IF NOT EXISTS`          │
│    - Non-destructive & completely idempotent           │
│ 4. Deploy Cloudflare Worker (`wrangler deploy`)        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Updated Production CI Workflow Specifications

The workflow:
- **Removes** `wrangler d1 execute ... seed.sql`.
- **Applies** only SQL migration files located in `packages/db/migrations/` sequentially.
- **Deploys** the Worker and binds to the existing remote `blog-db`.
