# Project Roadmap

This roadmap tracks the progress of the refined blog and portfolio monorepo project. It serves as the single source of truth for completed milestones, current work, and upcoming tasks.

---

## Status Overview

| Phase | Description | Status | Progress |
| :--- | :--- | :---: | :---: |
| **Phase 1** | Monorepo Setup & Configuration | **Todo** | 0% |
| **Phase 2** | Shared Database Package (`packages/db`) | **Todo** | 0% |
| **Phase 3** | Blog Application Migration (`apps/blog`) | **Todo** | 0% |
| **Phase 4** | Security, API, & Editor.js Integration | **Todo** | 0% |
| **Phase 5** | Portfolio Setup & Deployment | **Todo** | 0% |

---

## Detailed Phase Breakdown

### Phase 1: Monorepo Setup & Configuration
Set up the workspace structure, package manager, and shared configurations.
*   [ ] Initialize root `package.json` with workspace settings <!-- id: 1.1 -->
*   [ ] Create `pnpm-workspace.yaml` and `turbo.json` <!-- id: 1.2 -->
*   [ ] Scaffold `packages/tsconfig` with shared TypeScript configurations <!-- id: 1.3 -->
*   [ ] Create `apps/` and `packages/` directories <!-- id: 1.4 -->

### Phase 2: Shared Database Package (`packages/db`)
Set up Drizzle ORM and generate the initial database migrations.
*   [ ] Scaffold `packages/db` package structure <!-- id: 2.1 -->
*   [ ] Define schema in `packages/db/src/schema.ts` (Posts, Tags, Comments, Junctions) <!-- id: 2.2 -->
*   [ ] Configure `drizzle.config.ts` for D1 compatibility <!-- id: 2.3 -->
*   [ ] Generate initial SQL migrations using Drizzle Kit <!-- id: 2.4 -->
*   [ ] Create a database seeding script for local development <!-- id: 2.5 -->

### Phase 3: Blog Application Migration (`apps/blog`)
Migrate the previous blog project into the monorepo and refactor it to use the new architecture.
*   [ ] Move previous blog files to `apps/blog` (excluding auth/session-related code) <!-- id: 3.1 -->
*   [ ] Configure `apps/blog/astro.config.mjs` with Cloudflare SSR adapter <!-- id: 3.2 -->
*   [ ] Integrate the shared `packages/db` package into `apps/blog` <!-- id: 3.3 -->
*   *   [ ] Build the server-side `BlockRenderer.astro` component to render Editor.js JSON <!-- id: 3.4 -->
*   [ ] Refactor public pages (`index.astro`, `[slug].astro`) to fetch data from D1 via Drizzle <!-- id: 3.5 -->

### Phase 4: Security, API, & Editor.js Integration
Implement Cloudflare Access JWT verification, API endpoints, and the rich text editor.
*   [ ] Implement JWT verification helper in `apps/blog/src/lib/auth.ts` <!-- id: 4.1 -->
*   [ ] Build the React `Editor.tsx` component wrapping Editor.js with required plugins <!-- id: 4.2 -->
*   [ ] Create the R2 upload API endpoint `/api/upload` <!-- id: 4.3 -->
*   [ ] Create the posts API endpoints `/api/posts/index.ts` and `/api/posts/[id].ts` <!-- id: 4.4 -->
*   [ ] Create the comments API endpoints `/api/comments/index.ts` and `/api/comments/[id].ts` <!-- id: 4.5 -->
*   [ ] Build the admin dashboard pages (`/admin/index.astro`, `/admin/write.astro`, `/admin/edit/[id].astro`) <!-- id: 4.6 -->

### Phase 5: Portfolio Setup & Deployment
Scaffold the portfolio app and deploy everything to Cloudflare.
*   [ ] Scaffold `apps/portfolio` static Astro site <!-- id: 5.1 -->
*   [ ] Configure Cloudflare Pages deployment for both `blog` and `portfolio` <!-- id: 5.2 -->
*   [ ] Configure Cloudflare Access (Zero Trust) policies for `/admin/*` and write APIs <!-- id: 5.3 -->
*   [ ] Run production D1 migrations and seed initial data <!-- id: 5.4 -->

---

## Completed Milestones

*   **[2026-06-24]** Created initial plan (`plan0.md`) outlining the Cloudflare-native tech stack.
*   **[2026-06-24]** Created refined strategy plan (`plan1.md`) detailing architecture, schemas, API routes, and block rendering.
*   **[2026-06-24]** Created `roadmap.md` to track project progress.
*   **[2026-06-24]** Updated `AGENTS.md` with strict project rules.

---

## Next Immediate Steps

1.  **Phase 1 Task 1.1**: Initialize root `package.json` with workspace settings.
2.  **Phase 1 Task 1.2**: Create `pnpm-workspace.yaml` and `turbo.json`.
3.  **Phase 1 Task 1.3**: Scaffold `packages/tsconfig` with shared TypeScript configurations.
