# Implementation Plan v2 — Static Blog + Portfolio on Cloudflare Pages

> **Based on:** Delta Blog Design System (`docs/ui-guide/`)  
> **Supersedes:** `plan/roadmap.md` (v1 static-only plan)  
> **Status:** Ready for implementation

---

## What We're Building

A **two-app monorepo** deployed to Cloudflare Pages:

| App | Type | Purpose |
|-----|------|---------|
| `apps/portfolio` | Static Astro + Tailwind v4 | Personal portfolio (About, Projects, Contact) |
| `apps/blog` | **Static Astro + Content Collections** | Technical blog with Delta-inspired design system |

**Shared design system** from `docs/ui-guide/` — reverse-engineered from [Delta's Engineering Blog](https://delta.dev/blog/planning-together-in-delta).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           YOUR MACHINE                                      │
│                                                                             │
│  apps/blog/                    apps/portfolio/                              │
│  (Astro + Content Layer)       (Astro + Tailwind v4)                       │
│       │                            │                                        │
│       │ pnpm build                 │ pnpm build                            │
│       ▼                            ▼                                        │
│  ┌──────────────────────────────────────────────┐                          │
│  │              FORGEJO (source of truth)       │                          │
│  │         akiblog-monorepo (private)           │                          │
│  └──────────────────────────────────────────────┘                          │
│       │                                                                   │
│       │ push mirror (auto-sync)                                           │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────┐                          │
│  │           GITHUB (private mirror)            │                          │
│  │         akiblog-monorepo (private)           │                          │
│  └──────────────────────────────────────────────┘                          │
│       │                                                                   │
│       │ triggers GitHub Actions                                           │
│       ▼                                                                   │
└──────┬────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GITHUB ACTIONS CI/CD                                  │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Lint      │───▶│   Test      │───▶│   Build     │───▶│   Deploy    │ │
│  │   (tsc)     │    │  (vitest)   │    │ (turbo)     │    │  (CF Pages) │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                                             │
│  Build outputs:                                                             │
│  - apps/blog/dist/        → Cloudflare Pages project: "akiblog-blog"     │
│  - apps/portfolio/dist/   → Cloudflare Pages project: "akiblog-portfolio"│
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE PAGES (Runtime)                             │
│                                                                             │
│  - Static HTML/CSS/JS served from global CDN                               │
│  - Zero server code, zero cold starts                                      │
│  - Contact form: Astro Action → Resend email (only dynamic endpoint)       │
│  - Custom domains: akib35.dev (portfolio), blog.akib35.dev (blog)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Design System — `docs/ui-guide/`

All blog styling comes from the Delta reference system. Key files:

| File | Purpose |
|------|---------|
| `blog.css` | Complete prose typography: headings, code, alerts, tables, figures |
| `BlogLayout.astro` | Fixed viewport frame (hatched borders), left sidebar, article + TOC grid |
| `BlogHeader.astro` | Post hero: eyebrow category, IBM Plex Serif title, author avatar, date |
| `TableOfContents.astro` | Custom `<table-of-contents>` web component with scroll-spy |
| `ImageZoom.astro` | Light/dark mode images + click-to-zoom lightbox modal |
| `MorePosts.astro` | Post-footer recommendation list with author avatars |
| `content.config.ts` | Zod schema for Astro Content Collections |
| `sample-post.md` | Demonstrates all markdown features |

### Design Tokens (CSS Custom Properties)

```css
/* Light mode (from blog.css :root) */
--ui-font-display: 'IBM Plex Serif', Georgia, serif;
--ui-font-interface: 'Lilex', ui-monospace, SFMono-Regular, Menlo, monospace;
--ui-accent: #d5462b;                    /* Delta brand orange-red */
--ui-text: #201e13;
--ui-text-subtle: #5e6066;
--ui-border-subtle: #eae9e4;
--ui-border-strong: #dfdfe0;
--ui-background-canvas: #fbfaf7;
--ui-background-subtle: #f3f1ea;
--ui-background-strong: #f8f6f0;         /* Code blocks */
--ui-control-background-active: rgba(0,0,0,0.04);
--ui-success: #1a7f37;
--ui-warning: #9a6700;
--ui-error: #cf222e;

/* Dark mode (.dark) overrides all above */
```

### Fonts Required

| Font | Weight/Style | Source |
|------|--------------|--------|
| IBM Plex Serif | Variable (100-700) | Google Fonts / self-hosted |
| Lilex | Regular, Medium | Self-hosted (or fallback to `ui-monospace`) |
| iA Writer Quattro | Optional, for UI chrome | Self-hosted |

---

## Step-by-Step Implementation

### Phase 0: Monorepo Foundation (Already Done)

- ✅ pnpm workspace with `apps/*` and `packages/*`
- ✅ Turbo config for build pipeline
- ✅ Shared `@repo/tsconfig`
- ✅ `packages/db` (Drizzle) — **keep for future, not used in v2**

### Phase 1: Portfolio App (Static, Tailwind v4)

**Current state:** `apps/portfolio` exists with minimal Astro 7 + Tailwind v4 setup.

**Tasks:**
1. Build out portfolio pages: `/`, `/about`, `/projects`, `/contact`
2. Implement contact form using **Astro Action** → Resend email
3. Use Tailwind v4 with design tokens matching blog (or minimal subset)
4. Configure `wrangler.jsonc` for Cloudflare Pages deployment
5. Add GitHub Actions workflow for CI/CD

**Contact form action:**
```ts
// apps/portfolio/src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';

export const server = {
  sendMessage: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2).max(50),
      email: z.string().email(),
      message: z.string().min(10).max(2000),
    }),
    handler: async (input) => {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <noreply@akib35.dev>',
          to: ['akib@akib35.dev'],
          reply_to: input.email,
          subject: `Portfolio: ${input.name}`,
          text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
        }),
      });
      return { success: true };
    },
  }),
};
```

### Phase 2: Blog App — Delta Design System Integration

**Create new** `apps/blog` as a **static** Astro 7 app (no SSR, no D1, no R2, no auth).

#### 2.1 Scaffold Blog App
```bash
cd apps
npm create astro@latest blog -- --template minimal --no-install --no-ai
cd blog
npm install
npx astro add tailwind  # Tailwind v4
npm install -D @tailwindcss/typography  # for prose, but we'll use custom blog.css instead
```

#### 2.2 Copy Design System from `docs/ui-guide/`

```
apps/blog/
├── src/
│   ├── content/
│   │   └── config.ts          ← copy from docs/ui-guide/content.config.ts
│   ├── components/
│   │   ├── BlogHeader.astro   ← copy from docs/ui-guide/
│   │   ├── BlogLayout.astro   ← copy from docs/ui-guide/
│   │   ├── TableOfContents.astro ← copy from docs/ui-guide/
│   │   ├── ImageZoom.astro    ← copy from docs/ui-guide/
│   │   └── MorePosts.astro    ← copy from docs/ui-guide/
│   ├── styles/
│   │   └── blog.css           ← copy from docs/ui-guide/
│   ├── layouts/
│   │   └── BaseLayout.astro   ← minimal wrapper for portfolio pages
│   └── pages/
│       ├── blog/
│       │   ├── index.astro    ← blog listing
│       │   └── [...slug].astro ← single post (uses BlogLayout)
│       ├── index.astro        ← portfolio home (redirect or merge)
│       └── rss.xml.js         ← RSS feed
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

#### 2.3 Configure Astro Content Collections

```ts
// apps/blog/src/content/config.ts (from docs/ui-guide/content.config.ts)
import { defineCollection, z } from 'astro:content';

export const collections = {
  blog: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.date(),
      updatedDate: z.date().optional(),
      category: z.string().default('Engineering'),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      author: z.object({
        name: z.string(),
        avatar: z.string(),
        handle: z.string().optional(),
        github: z.string().optional(),
      }),
      coverImage: z.object({
        light: z.string(),
        dark: z.string().optional(),
        alt: z.string(),
        caption: z.string().optional(),
      }).optional(),
      tags: z.array(z.string()).default([]),
    }),
  }),
};
```

#### 2.4 Single Post Route — Uses `BlogLayout`

```astro
<!-- apps/blog/src/pages/blog/[...slug].astro -->
---
import { getCollection, render } from 'astro:content';
import BlogLayout from '../../components/BlogLayout.astro';
import ImageZoom from '../../components/ImageZoom.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
const { title, description, publishDate, category, author, coverImage, tags } = post.data;
const formattedDate = publishDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
---

<BlogLayout
  title={title}
  description={description}
  publishDate={publishDate.toISOString()}
  formattedDate={formattedDate}
  author={author}
  headings={headings}
>
  {coverImage && (
    <ImageZoom
      srcLight={coverImage.light}
      srcDark={coverImage.dark ?? coverImage.light}
      alt={coverImage.alt}
      caption={coverImage.caption}
    />
  )}
  <Content />
</BlogLayout>
```

#### 2.5 Blog Index Route

```astro
<!-- apps/blog/src/pages/blog/index.astro -->
---
import { getCollection } from 'astro:content';
import BlogLayout from '../../components/BlogLayout.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
---

<BlogLayout
  title="Blog"
  description="Technical writing on distributed systems, AI agents, and software craft."
  publishDate={new Date().toISOString()}
  formattedDate="—"
  author={{ name: "Akib", avatar: "https://unavatar.io/github/akib35", handle: "@akib35" }}
  headings={[]}
>
  <section class="markdown-content mx-auto max-w-3xl">
    <ul class="list-none p-0 space-y-8">
      {posts.map(post => (
        <li class="py-4 border-b border-delta last:border-0">
          <time class="font-mono text-xs text-[var(--delta-text-subtle)] block mb-1">
            {post.data.publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
          <h2 class="font-serif text-xl leading-snug tracking-tight text-[var(--delta-text)] m-0">
            <a href={`/blog/${post.slug}/`} class="no-underline hover:text-[var(--delta-brand)] transition-colors">
              {post.data.title}
            </a>
          </h2>
          <p class="mt-2 text-[var(--delta-text-subtle)]">{post.data.description}</p>
          {post.data.tags.length > 0 && (
            <div class="mt-2 flex flex-wrap gap-1.5">
              {post.data.tags.map(tag => (
                <span class="px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border border-delta text-[var(--delta-text-subtle)] rounded-[1px]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  </section>
</BlogLayout>
```

#### 2.6 Global CSS Import

In `BlogLayout.astro`, the `blog.css` is already imported. Ensure `global.css` defines the root design tokens:

```css
/* apps/blog/src/styles/global.css */
@import 'tailwindcss';

@theme {
  /* Map Delta tokens to Tailwind v4 theme */
  --color-delta-canvas: #fbfaf7;
  --color-delta-surface: #f3f1ea;
  --color-delta-border: #dfdfe0;
  --color-delta-border-subtle: #eae9e4;
  --color-delta-brand: #d5462b;
  --color-delta-text: #201e13;
  --color-delta-text-muted: #5e6066;
  --color-delta-code-bg: #f8f6f0;
  --font-display: 'IBM Plex Serif', Georgia, serif;
  --font-interface: 'Lilex', ui-monospace, SFMono-Regular, Menlo, monospace;
}

.dark {
  --color-delta-canvas: #14171a;
  --color-delta-surface: #1a1e22;
  --color-delta-border: #292c32;
  --color-delta-border-subtle: #202329;
  --color-delta-brand: #e05238;
  --color-delta-text: #eceae5;
  --color-delta-text-muted: #9ba0aa;
  --color-delta-code-bg: #101316;
}
```

#### 2.7 Font Loading

Add to `BlogLayout.astro` `<head>` (already present in reference):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@100..700&display=swap" as="style">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@100..700&display=swap" media="print" onload="this.media='all'">
<!-- Lilex: self-host from /public/fonts/Lilex-Regular.woff2 -->
```

#### 2.8 Astro Config

```js
// apps/blog/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  integrations: [],
  vite: {
    plugins: [tailwind()],
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

### Phase 3: Content Population

Create sample posts in `apps/blog/src/content/blog/`:

```
src/content/blog/
├── 2026/
│   ├── planning-distributed-agents/
│   │   ├── index.md          ← from sample-post.md
│   │   ├── cover-light.webp
│   │   └── cover-dark.webp
│   └── beyond-pass-rate/
│       ├── index.md
│       ├── cover-light.webp
│       └── cover-dark.webp
```

Each `index.md` follows the Zod schema (see `sample-post.md`).

### Phase 4: GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '24'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          name: blog
          path: apps/blog/dist
      - uses: actions/upload-pages-artifact@v3
        with:
          name: portfolio
          path: apps/portfolio/dist

  deploy-blog:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/deploy-pages@v4
        with:
          artifact_name: blog
          project_name: akiblog-blog

  deploy-portfolio:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/deploy-pages@v4
        with:
          artifact_name: portfolio
          project_name: akiblog-portfolio
```

**Required GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN` (Pages deploy permission)
- `CLOUDFLARE_ACCOUNT_ID`
- `RESEND_API_KEY` (for contact form)

### Phase 5: Cloudflare Pages Setup

1. **Create two Pages projects:**
   - `akiblog-blog` → connected to GitHub `akiblog-monorepo`, build output: `apps/blog/dist`
   - `akiblog-portfolio` → connected to GitHub `akiblog-monorepo`, build output: `apps/portfolio/dist`

2. **Environment variables (both projects):**
   - `RESEND_API_KEY` = your Resend API key

3. **Custom domains:**
   - `akiblog-portfolio` → `akib35.dev`
   - `akiblog-blog` → `blog.akib35.dev`

4. **Build configuration (auto-detected):**
   - Framework: Astro
   - Build command: `pnpm build`
   - Output directory: `apps/blog/dist` or `apps/portfolio/dist`

### Phase 6: Forgejo → GitHub Mirror

1. In Forgejo: `Settings → Repository → Mirror Settings → Push Mirrors`
2. Target: `https://<github-user>:<PAT>@github.com/<you>/akiblog-monorepo.git`
3. Enable **Sync On Push**

---

## Content Authoring Workflow

**Writing a new post:**
```bash
# 1. Create post folder
mkdir -p apps/blog/src/content/blog/2026/my-new-post

# 2. Write index.md with frontmatter
cat > apps/blog/src/content/blog/2026/my-new-post/index.md << 'EOF'
---
title: "My New Post"
description: "Brief description for SEO and social cards."
publishDate: 2026-01-15
category: "Engineering"
featured: false
draft: false
author:
  name: "Akib"
  avatar: "https://unavatar.io/github/akib35"
  handle: "@akib35"
  github: "akib35"
coverImage:
  light: "./cover-light.webp"
  dark: "./cover-dark.webp"
  alt: "Descriptive alt text"
  caption: "Optional caption"
tags: ["tag1", "tag2"]
---

Content here...
EOF

# 3. Add cover images (light/dark variants)
# 4. Commit and push to Forgejo
git add .
git commit -m "blog: new post - my new post"
git push
```

**Auto-deploy:** Forgejo mirror → GitHub → GitHub Actions → Cloudflare Pages.

---

## Checklist

### Portfolio App
- [ ] Home page with hero, projects preview, skills
- [ ] About page
- [ ] Projects page (filterable grid)
- [ ] Contact page with Astro Action form → Resend
- [ ] Tailwind v4 config with design tokens
- [ ] Dark mode toggle (persisted in localStorage)
- [ ] Responsive, mobile-first
- [ ] `wrangler.jsonc` for Pages config
- [ ] GitHub Actions workflow passes

### Blog App
- [ ] `apps/blog` scaffolded with Astro 7 + Tailwind v4
- [ ] All `docs/ui-guide/` components copied to `src/components/`
- [ ] `blog.css` imported in `BlogLayout.astro`
- [ ] Content collection config in `src/content/config.ts`
- [ ] Single post route `[...slug].astro` using `BlogLayout`
- [ ] Blog index route `index.astro`
- [ ] RSS feed (`rss.xml.js`)
- [ ] Sitemap (`@astrojs/sitemap`)
- [ ] Fonts loaded (IBM Plex Serif, Lilex)
- [ ] Dark mode works (CSS variables + anti-flash script)
- [ ] Table of Contents scroll-spy works
- [ ] Image zoom lightbox works
- [ ] Code blocks styled with Shiki (dual themes: `light-plus` / `one-dark-pro`)
- [ ] Markdown alerts (Tip, Warning, Caution) render correctly
- [ ] Sample posts render without errors
- [ ] Build succeeds locally (`pnpm build`)
- [ ] GitHub Actions CI/CD passes
- [ ] Cloudflare Pages deploy succeeds
- [ ] Custom domain `blog.akib35.dev` resolves

### Cross-Cutting
- [ ] Forgejo → GitHub mirror configured
- [ ] Both apps deploy independently on push to main
- [ ] Preview deployments work for PRs
- [ ] Contact form emails received

---

## Notes & Decisions

| Decision | Rationale |
|----------|-----------|
| **Static-only blog** | No server costs, infinite scale, instant loads, no auth complexity |
| **Delta design system** | Proven, developer-focused, excellent typography, accessible |
| **Content Collections** | Type-safe frontmatter, automatic validation, `getCollection` API |
| **Two separate Pages projects** | Independent deploys, custom domains, separate build outputs |
| **Forgejo as source of truth** | You own the code; GitHub is only a CI/CD trigger |
| **Astro Actions for contact** | Only dynamic code needed; runs on-demand on Cloudflare Workers |
| **No D1/R2/KV** | Removes entire class of infra complexity; images in repo or CDN |
| **Tailwind v4 + custom CSS** | Design tokens in CSS variables; `blog.css` handles all prose |

---

## Future Enhancements (Post-Launch)

- `@astrojs/mdx` for interactive components in posts
- Reading time calculation
- Syntax highlighting with Shiki (already in `blog.css` via dual themes)
- Search (Pagefind or Algolia)
- Webmentions / comments
- Newsletter signup (Buttondown/ConvertKit)
- Archive page with year grouping
- Tag pages
- Open Graph image generation per post

---

## Migration from v1 (Old Blog)

**Do not migrate** the old `apps/blog` (SSR + D1 + R2 + Access). It's archived. The new `apps/blog` is a clean static implementation. Old content can be manually converted to markdown files in `src/content/blog/`.