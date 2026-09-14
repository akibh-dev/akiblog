# Lightweight Forgejo / Alpine Linux CI/CD Deployment Architecture (plan3.md)

This document outlines the deployment strategy tailored specifically for resource-constrained Forgejo runners (Alpine Linux with 1GB RAM) hosted at `git.akib35.dev`.

---

## 1. Architectural Strategy: Solving the 1GB RAM Constraint

Building modern TypeScript/Astro applications (`astro build`, `vite`, `esbuild`, `react` chunking) typically requires **1.5GB - 2.5GB of peak memory**. On a 1GB RAM runner, running `pnpm build` will trigger the Linux Out-Of-Memory (OOM) killer (`SIGKILL`).

```
┌────────────────────────────────────────────────────────┐
│ Option A: Zero-Build Runner (Recommended for 1GB RAM)  │
│ 1. Local / Dev: Run `pnpm build`                       │
│ 2. Git Commit: Track or package `dist/` bundle         │
│ 3. Forgejo 1GB Runner: Executes pure deployment        │
│    - Memory consumption: <60MB                         │
│    - Duration: <15 seconds                             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Required Cloudflare Secrets & Tokens

You need to create a custom API Token in the Cloudflare Dashboard and add the following 3 secrets to your Forgejo repository settings (`git.akib35.dev` -> Repository -> Settings -> Secrets):

| Secret Name in Forgejo | Required Permissions | Purpose |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | • **Cloudflare Pages**: Edit<br>• **D1**: Edit<br>• **R2 Storage**: Edit | Authorizes Wrangler to create/execute D1 migrations, provision R2, and deploy to Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Account identifier (found in Cloudflare Dashboard right sidebar) | Identifies your Cloudflare account to Wrangler in headless CI |
| `CLOUDFLARE_DATABASE_ID` | D1 database UUID for `blog-db` | Specifies the exact production D1 database instance |

### How to generate the Cloudflare API Token:
1. Go to **Cloudflare Dashboard** -> **My Profile** -> **API Tokens** -> **Create Token**.
2. Select **Create Custom Token**.
3. Set Permissions:
   - `Account` -> `Cloudflare Pages` -> `Edit`
   - `Account` -> `D1` -> `Edit`
   - `Account` -> `R2 Storage` -> `Edit`
4. Set Account Resources to `Include` -> `All accounts` (or your specific account).
5. Click **Continue to summary** -> **Create Token** -> Copy the token.

---

## 3. Workflow File Specifications for Alpine Runner

The Forgejo workflow will run on lightweight Alpine Linux without compiling, performing only:
1. Installing `wrangler` and `pnpm`.
2. Applying remote D1 database migrations (`0000_initial.sql`).
3. Deploying the pre-built `apps/blog/dist/server` worker and assets to Cloudflare Pages.

### Memory Profile:
- Node / Alpine base: ~30MB
- Wrangler execution: ~50MB
- **Total Peak RAM**: **~80MB** (Leaves >900MB free on your 1GB instance).
