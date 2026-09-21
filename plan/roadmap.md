# Project Roadmap

This roadmap tracks the progress of the refined blog and portfolio monorepo project. It serves as the single source of truth for completed milestones, current work, and upcoming tasks.

---

## Status Overview

| Phase | Description | Status | Progress |
| :--- | :--- | :---: | :---: |
| **Phase 1** | Monorepo Setup & Configuration | **Done** | 100% |
| **Phase 2** | Shared Database Package (`packages/db`) | **Done** | 100% |
| **Phase 3** | Blog Application Migration (`apps/blog`) | **Done** | 100% |
| **Phase 4** | Security, API, & Editor.js Integration | **Done** | 100% |
| **Phase 5** | Portfolio Setup & Deployment | **Done** | 100% |

---

## Detailed Phase Breakdown

### Phase 1: Monorepo Setup & Configuration ✅
Set up the workspace structure, package manager, and shared configurations.
*   [x] Initialize root `package.json` with workspace settings <!-- id: 1.1 -->
*   [x] Create `pnpm-workspace.yaml` and `turbo.json` <!-- id: 1.2 -->
*   [x] Scaffold `packages/tsconfig` with shared TypeScript configurations <!-- id: 1.3 -->
*   [x] Create `apps/` and `packages/` directories <!-- id: 1.4 -->

### Phase 2: Shared Database Package (`packages/db`) ✅
Set up Drizzle ORM and generate the initial database migrations.
*   [x] Scaffold `packages/db` package structure <!-- id: 2.1 -->
*   [x] Define schema in `packages/db/src/schema.ts` (Posts, Tags, Comments, Junctions) <!-- id: 2.2 -->
*   [x] Configure `drizzle.config.ts` for D1 compatibility <!-- id: 2.3 -->
*   [x] Generate initial SQL migrations using Drizzle Kit <!-- id: 2.4 -->
*   [x] Create a database seeding script for local development <!-- id: 2.5 -->

### Phase 3: Blog Application Migration (`apps/blog`) ✅
Migrate the previous blog project into the monorepo and refactor it to use the new architecture.
*   [x] Move previous blog files to `apps/blog` (excluding auth/session-related code) <!-- id: 3.1 -->
*   [x] Configure `apps/blog/astro.config.mjs` with Cloudflare SSR adapter <!-- id: 3.2 -->
*   [x] Integrate the shared `packages/db` package into `apps/blog` <!-- id: 3.3 -->
*   [x] Build the server-side `BlockRenderer.astro` component to render Editor.js JSON <!-- id: 3.4 -->
*   [x] Refactor public pages (`index.astro`, `[slug].astro`) to fetch data from D1 via Drizzle <!-- id: 3.5 -->

### Phase 4: Security, API, & Editor.js Integration ✅
Implement Cloudflare Access JWT verification, API endpoints, and the rich text editor.
*   [x] Implement JWT verification helper in `apps/blog/src/lib/auth.ts` <!-- id: 4.1 -->
*   [x] Build the React `Editor.tsx` component wrapping Editor.js with required plugins <!-- id: 4.2 -->
*   [x] Create the R2 upload API endpoint `/api/upload` <!-- id: 4.3 -->
*   [x] Create the posts API endpoints `/api/posts/index.ts` and `/api/posts/[id].ts` <!-- id: 4.4 -->
*   [x] Create the comments API endpoints `/api/comments/index.ts` and `/api/comments/[id].ts` <!-- id: 4.5 -->
*   [x] Build the admin dashboard pages (`/admin/index.astro`, `/admin/write.astro`, `/admin/edit/[id].astro`) <!-- id: 4.6 -->

### Phase 5: Portfolio Setup & Deployment ✅
Scaffold the portfolio app and deploy everything to Cloudflare.
*   [x] Scaffold `apps/portfolio` static Astro site <!-- id: 5.1 -->
*   [x] Configure Cloudflare Workers deployment for both `blog` and `portfolio` <!-- id: 5.2 -->
*   [x] Configure Cloudflare Access (Zero Trust) policies for `/admin/*` and write APIs <!-- id: 5.3 -->
*   [x] Run production D1 migrations <!-- id: 5.4 -->

---

## Completed Milestones

*   **[2026-06-24]** Created initial plan (`plan0.md`) outlining the Cloudflare-native tech stack.
*   **[2026-06-24]** Created refined strategy plan (`plan1.md`) detailing architecture, schemas, API routes, and block rendering.
*   **[2026-06-24]** Created `roadmap.md` to track project progress.
*   **[2026-06-24]** Updated `AGENTS.md` with strict project rules.
*   **[2026-09-14]** Released blog v0.1.1 with edge-native architecture, Alpine CI/CD pipeline.
*   **[2026-09-17]** Built minimalist Zed.dev-inspired portfolio (`apps/portfolio`) with one-page design.
*   **[2026-09-17]** Updated CI workflows with `workflow_dispatch` for targeted deployments.
*   **[2026-09-17]** Integrated Cloudflare Access secrets injection via Forgejo CI.

---

## Project Complete

All phases completed. The monorepo now consists of:

1. **`apps/blog`** — Edge-native Astro SSR blog with Cloudflare Workers, D1, R2, Zero Trust admin
2. **`apps/portfolio`** — Minimalist static portfolio inspired by Zed.dev design
3. **`packages/db`** — Shared Drizzle ORM schema and migrations
4. **`packages/tsconfig`** — Shared TypeScript configurations

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Forgejo CI (1GB Alpine Runner)                          │
│                                                         │
│  1. Extract dist.tar.gz (pre-built artifacts)           │
│  2. Inject secrets:                                     │
│     - CLOUDFLARE_DATABASE_ID                            │
│     - CLOUDFLARE_TEAM_DOMAIN                            │
│     - CLOUDFLARE_ACCESS_AUD                             │
│  3. Apply D1 migrations                                 │
│  4. Deploy Workers via wrangler                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Cloudflare Edge Network                                 │
│                                                         │
│  • blog.akib35.dev (SSR Worker + Zero Trust Admin)      │
│  • akib35.dev (Portfolio static assets)                 │
│  • D1: blog-db (SQLite edge database)                   │
│  • R2: blog-media (zero-egress storage)                 │
└─────────────────────────────────────────────────────────┘
```
