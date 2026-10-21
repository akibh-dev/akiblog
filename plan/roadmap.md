# Implementation Guide — Static Blog + Portfolio on Cloudflare Pages

> This is the complete, copy-paste-ready guide for v2.  
> Old plans archived at tag `v2.0.0` — recover with `git show v2.0.0:plan/plan5.md`.

---

## What We're Building

A personal portfolio + blog deployed to Cloudflare Pages:

- **Portfolio** — static pages (about, projects, contact)
- **Blog** — posts written in Markdown, stored in a separate public GitHub repo
- **Contact form** — one Astro Action that emails via Resend

**No Workers. No D1. No R2. No auth. No database. No CI runner.**

Just:
- Markdown files for content
- One Astro app for rendering
- Cloudflare Pages for hosting
- Resend for email

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR MACHINE                            │
│                                                                 │
│  blog-content/              portfolio-app/                      │
│  (Markdown posts)           (Astro app)                        │
│       │                          │                              │
│       │ push                     │ push                         │
│       ▼                          ▼                              │
│  ┌─────────┐              ┌──────────────┐                     │
│  │ GitHub  │              │   Forgejo    │                     │
│  │ (public)│              │  (your SSOT) │                     │
│  └─────────┘              └──────────────┘                     │
│       │                          │                              │
│       │                          │ push mirror                   │
│       │                          ▼                              │
│       │                   ┌──────────────┐                     │
│       │                   │   GitHub     │                     │
│       │                   │  (private)   │                     │
│       │                   └──────────────┘                     │
│       │                          │                              │
│       │                          │                              │
└──────│──────────────────────────│──────────────────────────────┘
       │                          │
       │ pulled at build time     │ triggers build
       │ (degit)                  │ (GitHub Actions)
       ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE PAGES                             │
│                                                                 │
│   Build: npm run build                                          │
│     1. degit pulls blog-content                                 │
│     2. astro build prerenders all pages                         │
│     3. output: dist/                                            │
│                                                                 │
│   Runtime:                                                      │
│     - All pages: static HTML                                    │
│     - Contact form: Astro Action runs on-demand                 │
│                                                                 │
│   Domain: akib35.dev                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why This Approach

| Decision | Reasoning |
|----------|-----------|
| **Content in separate repo** | Posts live in `blog-content` (public). Edit in any editor, push, and the site rebuilds. No admin UI, no database, no auth. Git *is* your CMS. |
| **Public content repo** | No credentials needed at build time — `degit` fetches from public GitHub without a token. Simpler, fewer secrets. |
| **Static-first** | Every page prerendered at build time. Instant load times, no cold starts, no database queries. The contact form is the ONLY dynamic code. |
| **Forgejo as source of truth** | You control your code. GitHub is just a deployment mirror — if GitHub disappears, you still have everything in Forgejo. |
| **GitHub Actions for CI/CD** | Full build, test, deploy pipeline in GitHub. Forgejo is storage only — no runner needed. |
| **Cloudflare Pages** | Free tier, global CDN, automatic HTTPS, built-in preview deployments for PRs. |
| **Resend for email** | Simple API, generous free tier, reliable delivery. |

---

## Prerequisites

- **Node.js 24** — latest stable
- **pnpm** (or npm/yarn)
- **GitHub account** — for repos + Actions
- **Forgejo instance** — your code host
- **Cloudflare account** — for Pages
- **Resend account** — for email

---

## Step 1 — Create Repositories

### 1.1 GitHub: `blog-content` (public)

This holds your Markdown posts and images.

```bash
# On GitHub, create: blog-content (public)
# Clone locally
git clone https://github.com/<you>/blog-content.git
cd blog-content
```

### 1.2 GitHub: `portfolio-app` (private)

This is the deployment target — GitHub Actions pushes here after tests pass.

```bash
# On GitHub, create: portfolio-app (private, empty)
```

### 1.3 Forgejo: `portfolio-app` (private)

This is your source of truth.

```bash
# In Forgejo, create: portfolio-app (private)
```

### 1.4 Forgejo → GitHub mirror

Keep them in sync automatically:

1. Create a GitHub Personal Access Token (classic) with `repo` scope
2. In Forgejo: `Settings → Repository → Mirror Settings → Push Mirrors`
3. Add mirror:
   - Target: `https://<github-user>:<PAT>@github.com/<you>/portfolio-app.git`
   - Enable **Sync On Push**

Now every push to Forgejo automatically mirrors to GitHub.

---

## Step 2 — Set Up Blog Content

Structure your posts by year. The year folder keeps things organized on disk; we'll strip it from URLs later.

```text
blog-content/
├── 2025/
│   └── hello-world/
│       ├── index.md
│       └── hero.png
└── 2026/
    └── my-first-post/
        ├── index.md
        └── cover.jpg
```

Each `index.md`:

```markdown
---
title: "My First Post"
description: "A brief description for SEO and social cards."
pubDate: 2025-01-15
coverImage: "./cover.jpg"
tags: ["astro", "cloudflare"]
draft: false
---

Your content here...
```

**Frontmatter fields:**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Max 100 chars |
| `description` | Yes | Max 160 chars, used in meta tags |
| `pubDate` | Yes | ISO date format |
| `coverImage` | No | Relative path to image in same folder |
| `tags` | No | Array of strings |
| `draft` | No | If `true`, excluded from build |

Push to GitHub:

```bash
git add .
git commit -m "initial content"
git push
```

---

## Step 3 — Create the Astro App

### 3.1 Scaffold

```bash
# Create outside the v1 monorepo
cd ~/dev  # or wherever you keep projects

npm create astro@latest portfolio-app -- --template minimal --no-install --no-ai
cd portfolio-app
npm install
```

The interactive prompts will ask about TypeScript — select **Strict**.

### 3.2 Install dependencies

```bash
# Cloudflare adapter for deployment
npx astro add cloudflare

# degit: pulls blog-content at build time
npm install -D degit

# sharp: image optimization (not bundled with Astro 7)
npm install sharp
```

### 3.3 Configure package.json

The `prebuild` script runs automatically before `build`:

```json
{
  "name": "portfolio-app",
  "type": "module",
  "scripts": {
    "dev": "npm run prebuild && astro dev",
    "prebuild": "degit <you>/blog-content#main src/content/blog --force",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest"
  },
  "dependencies": {
    "astro": "^7.0.0",
    "@astrojs/cloudflare": "^14.0.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "degit": "^2.8.0",
    "vitest": "^2.0.0"
  }
}
```

**What's happening:**

- `prebuild` — pulls latest `blog-content` into `src/content/blog/`
- `degit --force` — overwrites existing content each build
- `#main` — specifies the branch (use `#branch-name` for other branches)

### 3.4 Update .gitignore

The pulled content should never be committed:

```gitignore
# Pulled at build time
src/content/blog/

# Astro
dist/
.astro/

# Dependencies
node_modules/
```

---

## Step 4 — Astro Configuration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // Static output: all pages prerendered at build time
  // Exception: contact form (prerender = false in Step 8)
  output: 'static',
  
  // Adapter: enables on-demand rendering for specific routes
  adapter: cloudflare(),
  
  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
```

**Why `output: 'static'`:**

- Every page becomes HTML at build time
- No server needed for 99% of the site
- The adapter exists only for:
  - The contact form page (`export const prerender = false`)
  - The internal `/_actions` endpoint Astro creates

---

## Step 5 — Content Collection

Astro's Content Layer API validates frontmatter and provides type-safe queries.

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Load all index.md files recursively
  loader: glob({ 
    base: './src/content/blog', 
    pattern: '**/index.md' 
  }),
  
  // Validate frontmatter
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      coverImage: z.optional(image()),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
```

**How it works:**

- `glob` loader finds all `**/index.md` files
- Each file becomes an entry with an `id` like `2025/hello-world/index`
- `image()` validates cover images and enables optimization
- Schema errors fail the build — you catch typos early

---

## Step 6 — Blog Routes

### 6.1 Slug helper

Strip the year folder and `/index` suffix for clean URLs:

```ts
// src/lib/slug.ts

/**
 * "2025/hello-world/index" → "hello-world"
 * 
 * Posts are organized by year on disk, but URLs stay clean.
 * Warning: post folder names must be unique across years.
 */
export function cleanSlug(id: string): string {
  return id
    .replace(/^\d{4}\//, '')    // Remove year prefix
    .replace(/\/index$/, '');   // Remove /index suffix
}
```

### 6.2 Blog listing page

```astro
<!-- src/pages/blog/index.astro -->
---
import { getCollection } from 'astro:content';
import { cleanSlug } from '../../lib/slug';

// Fetch all non-draft posts, sorted by date (newest first)
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<html lang="en">
  <head>
    <title>Blog</title>
    <meta name="description" content="All posts" />
  </head>
  <body>
    <h1>Blog</h1>
    <ul>
      {posts.map((post) => (
        <li>
          <time datetime={post.data.pubDate.toISOString()}>
            {post.data.pubDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </time>
          {' — '}
          <a href={`/blog/${cleanSlug(post.id)}/`}>
            {post.data.title}
          </a>
        </li>
      ))}
    </ul>
  </body>
</html>
```

### 6.3 Individual post page

```astro
<!-- src/pages/blog/[...slug].astro -->
---
import { getCollection, render } from 'astro:content';
import { Image } from 'astro:assets';
import { cleanSlug } from '../../lib/slug';

// Generate a page for each post
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  
  return posts.map((post) => ({
    params: { slug: cleanSlug(post.id) },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const { title, description, pubDate, coverImage, tags } = post.data;
---

<html lang="en">
  <head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:type" content="article" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {coverImage && (
      <meta property="og:image" content={Astro.url.origin + coverImage.src} />
    )}
  </head>
  <body>
    <article>
      <header>
        <h1>{title}</h1>
        <time datetime={pubDate.toISOString()}>
          {pubDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </time>
        {tags.length > 0 && (
          <div>
            {tags.map((tag) => (
              <span>#{tag}</span>
            ))}
          </div>
        )}
      </header>

      {coverImage && (
        <Image 
          src={coverImage} 
          alt={title}
          widths={[400, 800, 1200]}
          sizes="(max-width: 800px) 100vw, 800px"
        />
      )}

      <Content />
    </article>
  </body>
</html>
```

---

## Step 7 — Contact Form with Astro Actions

Astro Actions let you define server functions called from forms or client code.

### 7.1 Define the action

```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';

export const server = {
  sendMessage: defineAction({
    // Accept form submissions (no JS required)
    accept: 'form',
    
    // Validate input
    input: z.object({
      name: z.string().trim().min(2).max(50),
      email: z.string().trim().email(),
      message: z.string().trim().min(10).max(2000),
    }),
    
    // Handler runs on the server
    handler: async (input) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Contact Form <noreply@yourdomain.com>',
          to: ['you@yourdomain.com'],
          reply_to: input.email,
          subject: `Contact: ${input.name}`,
          text: `
Name: ${input.name}
Email: ${input.email}

Message:
${input.message}
          `.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message. Please try again.');
      }

      return { success: true };
    },
  }),
};
```

**Key points:**

- `accept: 'form'` — works without JavaScript
- `z` from `'astro/zod'` — schema validation
- `env.RESEND_API_KEY` — Cloudflare binding (set in Step 10)
- `noreply@yourdomain.com` — requires domain verification in Resend

### 7.2 Contact form component

```astro
<!-- src/components/ContactForm.astro -->
---
import { actions } from 'astro:actions';

// Check result after form submission (PRG pattern)
const result = Astro.getActionResult(actions.sendMessage);
---

<form method="POST" action={actions.sendMessage}>
  {/* Success message */}
  {result?.data?.success && (
    <p role="alert">
      Message sent! I'll get back to you soon.
    </p>
  )}
  
  {/* Error message */}
  {result?.error && (
    <p role="alert">
      {result.error.message}
    </p>
  )}

  <div>
    <label for="name">Name</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      required 
      minlength="2"
      maxlength="50"
    />
  </div>

  <div>
    <label for="email">Email</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required 
    />
  </div>

  <div>
    <label for="message">Message</label>
    <textarea 
      id="message" 
      name="message" 
      rows="5" 
      required
      minlength="10"
      maxlength="2000"
    ></textarea>
  </div>

  <button type="submit">Send</button>
</form>
```

### 7.3 Contact page

```astro
<!-- src/pages/contact.astro -->
---
// REQUIRED: form-action pages must be on-demand rendered
export const prerender = false;

import ContactForm from '../components/ContactForm.astro';
---

<html lang="en">
  <head>
    <title>Contact</title>
  </head>
  <body>
    <h1>Contact</h1>
    <p>Have a question? Send me a message.</p>
    <ContactForm />
  </body>
</html>
```

**Why `prerender = false`:**

Astro requires pages using form actions to be rendered on-demand. The action result needs server-side state during the POST-redirect-GET cycle.

---

## Step 8 — GitHub Actions Workflow

Complete CI/CD pipeline: test → build → deploy.

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      
      - run: npm ci
      
      - run: npm test
        continue-on-error: true  # Remove once you have tests

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      
      - run: npm ci
      
      - run: npm run build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: portfolio-app
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Required secrets** (GitHub → Settings → Secrets):

| Secret | How to get |
|--------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Edit Cloudflare Workers) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → copy from URL or sidebar |

---

## Step 9 — Push to Forgejo

```bash
cd portfolio-app
git init
git remote add origin https://your-forgejo.dev/you/portfolio-app.git
git add .
git commit -m "initial commit"
git branch -M main
git push -u origin main
```

Verify the mirror: GitHub should have the same commit within seconds.

---

## Step 10 — Cloudflare Pages Setup

### 10.1 Create Pages project

Skip this if using GitHub Actions for deploy — it will create the project automatically.

Otherwise:

1. Cloudflare Dashboard → Workers & Pages → Create → Pages
2. Connect to Git → select `portfolio-app`
3. Configure:
   - Framework: `Astro`
   - Build: `npm run build`
   - Output: `dist`

### 10.2 Environment variables

In Pages → Settings → Environment variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `RESEND_API_KEY` | your-resend-api-key | Production (and Preview if you want) |

### 10.3 Custom domain

1. Pages → Settings → Custom domains
2. Add `akib35.dev`
3. Update DNS as instructed

If another project already uses that domain, remove it first.

---

## Step 11 — Content Update Workflow

When you write a new post:

```bash
# In blog-content repo
vim 2026/new-post/index.md
git add .
git commit -m "new post: ..."
git push
```

Then trigger a rebuild:

**Option A: Automatic (recommended)**

Add a workflow in `blog-content`:

```yaml
# blog-content/.github/workflows/trigger-build.yml
name: Trigger portfolio build
on: [push]

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.PORTFOLIO_TRIGGER_TOKEN }}" \
            "https://api.github.com/repos/<you>/portfolio-app/dispatches" \
            -d '{"event_type":"content-update"}'
```

Then in `portfolio-app`, add:

```yaml
# portfolio-app/.github/workflows/deploy.yml
on:
  push:
    branches: [main]
  repository_dispatch:
    types: [content-update]
```

**Option B: Manual**

1. Cloudflare Dashboard → Pages → portfolio-app
2. Deployments → Retry build

---

## Checklist Before Launch

- [ ] Blog content structure correct (`YYYY/post-slug/index.md`)
- [ ] All posts have required frontmatter
- [ ] Local build succeeds (`npm run build`)
- [ ] Local preview works (`npm run preview`)
- [ ] Contact form sends email
- [ ] Domain attached and DNS configured
- [ ] Resend domain verified (for production email)

---

## Notes

**Drafts:** Set `draft: true` to exclude posts from builds. They'll never appear on the site.

**Image optimization:** Astro processes images through sharp. Use `<Image>` component for automatic resizing and format conversion.

**Slug collisions:** Since years are stripped from URLs, `2025/my-post` and `2026/my-post` would both be `/blog/my-post/`. Keep folder names unique.

**Rate limits:** degit has no authentication, but GitHub limits unauthenticated requests to ~60/hour per IP. Your Pages build runs in Cloudflare's infrastructure, so this shouldn't be an issue.

**Local development:** `npm run dev` pulls fresh content each time. For faster iteration, you can comment out the `prebuild` line temporarily.

---

## Future Additions

These drop in without architecture changes:

- `@astrojs/sitemap` — generate sitemap.xml
- `@astrojs/rss` — RSS/Atom feed
- `@astrojs/mdx` — MDX support for complex posts
- Reading time calculator
- Syntax highlighting with Shiki
- Comments via webmentions or a third-party service
