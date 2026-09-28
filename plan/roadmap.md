# Roadmap v2 — Blog + Portfolio, Static-First on Cloudflare Pages

> **This is the single implementation guide for v2.** It replaces all v1 plans
> (`plan0.md` – `plan9.md`), which are archived at git tag **`v2.0.0`**
> (recover any old plan with `git show v2.0.0:plan/plan5.md`, etc.).
>
> Follow it top to bottom. Every command and file below is complete —
> copy/paste-able.

## 0. Context — why v2

v1 (releases `v0.1.1` → baseline tag `v2.0.0`) ran the blog as an Astro SSR
Cloudflare Worker backed by **D1** (posts/comments/tags via Drizzle + a
migration pipeline), **R2** media uploads, a Cloudflare Access admin area,
an Editor.js editing UI, and a Forgejo CI runner that deployed everything.
Powerful — but for a personal blog it is overkill: every one of those moving
parts (auth quirks, migrations, seeds, runner maintenance — see
`docs/investigation-auth-401-d1-r2.md`) is permanent upkeep for a site whose
content changes are just "new Markdown file".

**v2 principles:**

1. **Content-as-code** — posts are Markdown + images living in a *public*
   GitHub repo (`blog-content`). No database, no editor UI, no auth. Drafts
   and history are native git features.
2. **Static-first** — one Astro app (portfolio + blog + contact form) on
   **Cloudflare Pages**. Every page is prerendered at build time. The only
   dynamic code in the entire site is one Astro Action (contact form →
   Resend email). No Workers, no D1, no R2, no CI runner, no wrangler.
3. **Write where you want, deploy where it runs** — Forgejo remains the
   origin of app code; a **push mirror** syncs it to a private GitHub repo;
   Cloudflare Pages builds from GitHub. Blog content updates flow straight
   from the public repo into each build.

```
 blog-content (public, GitHub)            portfolio-app (private)
 Markdown + images                         Astro app code
        │                                        ▲
        │ pulled at build time (degit)           │ push mirror (Forgejo → GitHub)
        └──────────────► Cloudflare Pages ◄──────┘
                          (build: npm run build)
                                 │
                                 ▼
              akib35.dev — static pages + ONE on-demand
              route: the contact-form action (_actions)
```

### Progress

| # | Step | Status |
| :- | :--- | :--- |
| 1 | Repositories & Forgejo → GitHub mirror | Not started |
| 2 | `blog-content`: structure + first post | Not started |
| 3 | Init the Astro app (`portfolio-app`) | Not started |
| 4 | `astro.config.mjs` | Not started |
| 5 | Content collection (`src/content.config.ts`) | Not started |
| 6 | Blog routes (listing, clean slugs, post page) | Not started |
| 7 | Contact form (Astro Action + Resend) | Not started |
| 8 | Push to Forgejo, verify mirror | Not started |
| 9 | Cloudflare Pages project | Not started |
| 10 | End-to-end verification | Not started |

> ⚠️ The code below is written for **current Astro (v7) + `@astrojs/cloudflare`
> (v14)** — what `npm create astro@latest` gives you today. It deliberately
> differs from the first draft of this plan, which used Astro-4-era APIs that
> no longer exist. See **Appendix A** for the exact deviations and why.

---

## Step 1 — Repositories & Forgejo → GitHub mirror

1. **GitHub — create two repositories:**
   * `blog-content` — **public** (Markdown posts + images).
   * `portfolio-app` — **private** (deployment target only; it exists so
     Cloudflare Pages can build from GitHub).

2. **Forgejo — create a private repo `portfolio-app`, then mirror to GitHub:**
   * In GitHub, create a fine-grained Personal Access Token with
     **Contents: Read and write**, scoped to the single `portfolio-app` repo.
   * In Forgejo: `Settings → Repository → Mirror Settings → Push Mirrors`:
     * Target URL:
       `https://<github-username>:<github-pat>@github.com/<github-username>/portfolio-app.git`
     * Enable **Sync On Push**.

   > Why: you keep authoring in Forgejo (your origin of truth), GitHub is a
   > dumb deployment mirror, and the PAT is scoped to one repo so a leak can
   > only ever expose that mirror.
   > 🔒 The PAT lives inside the mirror URL — regenerate it if you ever see
   > unexpected mirror activity.

---

## Step 2 — `blog-content`: structure + first post

1. Clone `blog-content` locally and create the post structure. The **year
   folder keeps content chronological on disk**; the site later strips it
   from URLs so links never rot:

   ```text
   blog-content/
   └── 2026/
       └── my-first-post/
           ├── index.md
           └── hero.png
   ```

2. `2026/my-first-post/index.md`:

   ```markdown
   ---
   title: "First Post in 2026"
   description: "Setting up a decoupled blog with Astro and Cloudflare."
   pubDate: 2026-09-27
   coverImage: "./hero.png"
   tags: ["astro", "cloudflare", "typescript"]
   draft: false
   ---

   # Hello World

   This post and image live inside a dedicated content repo.
   ```

3. Commit and push:

   ```bash
   git add .
   git commit -m "add initial post"
   git push origin main
   ```

---

## Step 3 — Init the Astro app (`portfolio-app`)

Create the project **outside** this v1 monorepo (e.g. `~/dev/portfolio-app`).

1. Scaffold (the old `--typescript` CLI flag no longer exists — the
   interactive prompt defaults to strict TypeScript; pick it if asked):

   ```bash
   npm create astro@latest portfolio-app -- --template minimal --no-install --no-ai
   cd portfolio-app
   npm install
   ```

2. Cloudflare adapter + content puller + image optimizer
   (`sharp` is no longer bundled with Astro, `<Image>` needs it):

   ```bash
   npx astro add cloudflare
   npm install -D degit
   npm install sharp
   ```

   > `--no-ai` skips create-astro's agent files; drop it if you want them.
   > Astro 7 requires **Node ≥ 22.12** (`node -v` to check).

3. `package.json` — pull `blog-content` fresh before every build/dev run:

   ```json
   {
     "name": "portfolio-app",
     "type": "module",
     "scripts": {
       "dev": "npm run prebuild && astro dev",
       "prebuild": "degit <github-username>/blog-content#main src/content/blog --force",
       "build": "astro build",
       "preview": "astro preview"
     }
   }
   ```

   > Why this works: npm automatically runs `prebuild` before `build` —
   > that's the hook that makes the Cloudflare Pages build fetch fresh
   > content. `--force` lets degit overwrite the previous pull.

4. Append to `.gitignore` so the pulled content is **never committed** to
   the app repo (it's a build artifact, like `node_modules`):

   ```gitignore
   src/content/blog/
   ```

---

## Step 4 — `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 'static' is the default: every page is prerendered at build time.
  // The adapter exists ONLY for routes that opt out with
  // `export const prerender = false` (Step 7: the contact page and the
  // auto-generated /_actions endpoint).
  output: 'static',
  adapter: cloudflare(),
});
```

> Why not `output: 'hybrid'` (from the original draft): `hybrid` was
> deprecated in Astro 5 and removed since v6. The current model is
> "static by default, opt out per route" — which is exactly what a
> blog + tiny contact form wants.

---

## Step 5 — Content collection (`src/content.config.ts`)

> File name and location matter: **`src/content.config.ts`** at the `src/`
> root (NOT `src/content/config.ts` — that legacy location, `type: 'content'`
> collections, `entry.slug` and `entry.render()` were all removed in
> Astro 6). The `glob()` loader is the current Content Layer API.

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Matches the repo layout from Step 2: <year>/<post-slug>/index.md
  loader: glob({ base: './src/content/blog', pattern: '**/index.md' }),
  // Type-checks frontmatter; `image()` validates the relative cover image
  // and turns it into optimized <Image> metadata at build time.
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

Entries come out with an `id` like `2026/my-first-post/index` (the glob
loader derives ids from the file path, extension stripped).

---

## Step 6 — Blog routes, clean slugs, rendering

1. `src/lib/post.ts` — one shared slug helper. "2026/my-first-post/index"
   → `my-first-post` (year stripped from the URL, so links survive
   year-folder reorganization):

   ```ts
   /** "2026/my-first-post/index" -> "my-first-post" */
   export const cleanSlug = (id: string) =>
     id.replace(/^20\d{2}\//, '').replace(/\/index$/, '');
   ```

   > ⚠️ Because the year is stripped, **post folder names must be unique
   > across years**. If you'd rather keep the year in URLs (and allow
   > same-name posts), simply use `post.id` directly and skip `cleanSlug`.

2. `src/pages/blog/index.astro` — listing:

   ```astro
   ---
   import { getCollection } from 'astro:content';
   import { cleanSlug } from '../../lib/post';

   const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
     (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
   );
   ---

   <html>
     <head><title>Blog</title></head>
     <body>
       <h1>All Posts</h1>
       <ul>
         {posts.map((post) => (
           <li>
             <a href={`/blog/${cleanSlug(post.id)}/`}>{post.data.title}</a>
             {' — '}
             {post.data.pubDate.toISOString().slice(0, 10)}
           </li>
         ))}
       </ul>
     </body>
   </html>
   ```

   > The `getCollection` filter excludes drafts at build time — drafts stay
   > visible only where you write them (the content repo / your editor),
   > never on the site.

3. `src/pages/blog/[...slug].astro` — dynamic renderer with SEO meta tags:

   ```astro
   ---
   import { getCollection, render } from 'astro:content';
   import { Image } from 'astro:assets';
   import { cleanSlug } from '../../lib/post';

   export async function getStaticPaths() {
     const posts = await getCollection('blog', ({ data }) => !data.draft);
     return posts.map((post) => ({
       params: { slug: cleanSlug(post.id) },
       props: { post },
     }));
   }

   const { post } = Astro.props;
   const { Content } = await render(post);
   const { title, description, pubDate, coverImage } = post.data;
   ---

   <html lang="en">
     <head>
       <title>{title}</title>
       <meta name="description" content={description} />
       <meta property="og:type" content="article" />
       <meta property="og:title" content={title} />
       <meta property="og:description" content={description} />
     </head>
     <body>
       <article>
         <h1>{title}</h1>
         <p>Published: {pubDate.toISOString().slice(0, 10)}</p>

         {coverImage && (
           <Image src={coverImage} alt={title} width={800} height={400} />
         )}

         <Content />
       </article>
     </body>
   </html>
   ```

   > `render(post)` (the current API, replaces the old `post.render()`)
   > also returns `headings` if you want to build a TOC later.

4. Sanity check locally:

   ```bash
   npm run dev
   # open http://localhost:4321/blog — your first post should be listed,
   # clicking it renders title, date, hero image and body.
   ```

---

## Step 7 — Contact form: Astro Action + Resend

1. `src/actions/index.ts` — validation, sanitization, Resend dispatch:

   ```ts
   import { defineAction } from 'astro:actions';
   import { z } from 'astro/zod';
   import { env } from 'cloudflare:workers';

   export const server = {
     sendMessage: defineAction({
       accept: 'form',
       input: z.object({
         name: z.string().trim().min(2, 'Name is too short').max(50),
         email: z.string().trim().email('Invalid email address'),
         message: z
           .string()
           .trim()
           .min(10, 'Message must be at least 10 characters')
           .max(1000),
       }),
       handler: async (input) => {
         // The email body is plain text; escaping is belt-and-braces for
         // any mail client that ever renders it as HTML.
         const escape = (s: string) =>
           s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

         const res = await fetch('https://api.resend.com/emails', {
           method: 'POST',
           headers: {
             Authorization: `Bearer ${env.RESEND_API_KEY}`,
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             from: 'Portfolio <onboarding@resend.dev>',
             to: ['your-actual-email@domain.com'],
             reply_to: input.email,
             subject: `Contact Form: Message from ${input.name}`,
             text: `Name: ${escape(input.name)}\nEmail: ${input.email}\n\nMessage:\n${escape(input.message)}`,
           }),
         });

         if (!res.ok) {
           throw new Error('Failed to dispatch email.');
         }
         return { success: true };
       },
     }),
   };
   ```

   > Why `import { env } from 'cloudflare:workers'` and not
   > `context.locals.runtime.env`: adapter v13+ **removed**
   > `Astro.locals.runtime`; Cloudflare bindings/env are imported directly.
   > `env.RESEND_API_KEY` resolves to the Pages env var set in Step 9.

2. `src/components/ContactForm.astro` — zero-JS form (works without client
   JavaScript, POST/redirect/GET handled by the action):

   ```astro
   ---
   import { actions } from 'astro:actions';

   const result = Astro.getActionResult(actions.sendMessage);
   ---

   <form method="POST" action={actions.sendMessage}>
     {result?.data?.success && <p style="color: green;">Message sent successfully!</p>}
     {result?.error && <p style="color: red;">{result.error.message}</p>}

     <div>
       <label for="name">Name</label>
       <input type="text" id="name" name="name" required />
     </div>

     <div>
       <label for="email">Email</label>
       <input type="email" id="email" name="email" required />
     </div>

     <div>
       <label for="message">Message</label>
       <textarea id="message" name="message" rows="5" required></textarea>
     </div>

     <button type="submit">Send Message</button>
   </form>
   ```

3. **The page that embeds the form must render on demand** — pages using
   form actions cannot be prerendered. E.g. `src/pages/contact.astro`:

   ```astro
   ---
   export const prerender = false; // REQUIRED for form-action pages

   import ContactForm from '../components/ContactForm.astro';
   ---

   <html lang="en">
     <head><title>Contact</title></head>
     <body>
       <h1>Contact</h1>
       <ContactForm />
     </body>
   </html>
   ```

   > Everything else on the site stays static. `prerender = false` +
   > the adapter means this one page (and the internal `/_actions`
   > endpoint) run on the Pages Function runtime.

**Resend notes:**

* `onboarding@resend.dev` can **only deliver to the email address of the
  Resend account owner** — fine for testing, not for production.
* For production: verify your domain in Resend and send from
  `Portfolio <noreply@yourdomain.com>`.
* `reply_to: input.email` lets you hit Reply in your mail client to answer
  the sender directly.
* The action is publicly reachable at `/_actions/sendMessage` (all actions
  are). The Zod caps (length limits) are your first line of abuse defense;
  if spam ever becomes a problem, add Cloudflare Turnstile to the form.

---

## Step 8 — Push app code to Forgejo

```bash
git init
git remote add origin https://your-forgejo-domain.com/username/portfolio-app.git
git add .
git commit -m "initial commit"
git branch -M main
git push -u origin main
```

Then verify the push mirror: the private GitHub `portfolio-app` should
contain the same commit within seconds (Sync On Push).

> v2 needs **no CI configuration at all** — no `.forgejo/workflows`, no
> wrangler, no runner. Cloudflare Pages is the only thing that builds.

---

## Step 9 — Cloudflare Pages project

1. **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to
   Git** (the Cloudflare GitHub App can access private repos) → select
   `portfolio-app`.
2. Build configuration:
   * **Framework preset:** `Astro`
   * **Build command:** `npm run build` (this auto-runs `prebuild` → degit)
   * **Build output directory:** `dist`
3. **Settings → Environment variables:**
   * `RESEND_API_KEY` = your Resend API token
   * `NODE_VERSION` = `22` (Astro 7 requires Node ≥ 22.12; don't rely on
     the runner's default)
4. Trigger the first deployment and watch the build log — you should see
   degit pull `blog-content`, then `astro build` prerender the pages.
5. **Domain:** attach your domain (e.g. `akib35.dev`) under
   *Custom domains*. Remember a zone hostname can only be attached to one
   Pages project — remove any old Worker route / custom domain binding the
   v1 deployment holds on that hostname first. Additional hostnames on
   the same zone can be served via a Worker route in front of the Pages
   project, as usual.

---

## Step 10 — End-to-end verification

1. **Content update flow:** add a post in `blog-content` → push to GitHub →
   trigger a rebuild. Two ways:
   * Manual: Cloudflare Pages project → *Deployments → Retry build*, or
   * Automatic: create a **Build hook** (Pages → Settings → Builds &
     deployments → Build hooks), then add this workflow to `blog-content`
     and store the hook URL as the `PAGES_DEPLOY_HOOK_URL` secret:

     ```yaml
     # .github/workflows/trigger-pages.yml  (in blog-content)
     name: Trigger Cloudflare Pages build
     on: [push]
     jobs:
       trigger:
         runs-on: ubuntu-latest
         steps:
           - run: curl -fsS -X POST "${{ secrets.PAGES_DEPLOY_HOOK_URL }}"
     ```
2. **App update flow:** edit UI code locally → push to Forgejo → mirror
   syncs to GitHub → Cloudflare Pages rebuilds automatically.
3. **Form verification:** submit a test message on the deployed contact
   page → confirm delivery in your mailbox → confirm *Reply* goes to the
   address you typed in the form.
4. **Draft verification:** set `draft: true` on a post, push content, rebuild
   → the post must not appear anywhere on the site.
5. **Slug check:** post lives at `/2026/my-first-post/` on disk, site
   serves it at `/blog/my-first-post/`.

---

## Appendix A — What changed from the original draft (and why)

The draft this guide replaces was written against Astro-4-era APIs. Since
you'll scaffold with current tooling (`create astro@latest` → Astro 7,
`@astrojs/cloudflare` 14), these changes are required, not stylistic:

| Original draft | This guide | Why |
| :--- | :--- | :--- |
| `npm create astro ... --typescript strict` | flag dropped | `--typescript` no longer exists in create-astro; the prompt defaults to strict TS |
| `output: 'hybrid'` | `output: 'static'` + `prerender = false` per route | `hybrid` deprecated in Astro 5, removed since v6; static-with-opt-out is the current model |
| `src/content/config.ts`, `type: 'content'`, `post.slug`, `post.render()` | `src/content.config.ts`, `glob()` loader, `post.id`, `render(post)` | legacy Content Collections API fully removed in Astro 6 (Content Layer API is mandatory) |
| `z` imported from `astro:schema` | `z` from `astro/zod` | `astro:schema` was never a real module; `astro/zod` is the documented import |
| `context.locals.runtime?.env` | `import { env } from 'cloudflare:workers'` | `Astro.locals.runtime` was removed in adapter v13+; bindings are imported directly |
| Contact page prerendered (implicit in draft) | `export const prerender = false` on the contact page | pages that call actions via form `action=` **must** be rendered on demand (documented requirement) |
| — | `sharp` installed explicitly | Astro no longer bundles sharp; `<Image>` optimization needs it |
| — | `src/content/blog/` in `.gitignore` | degit output is a build artifact; committing it would duplicate content between repos |
| — | `NODE_VERSION=22` on Pages | Astro 7 requires Node ≥ 22.12; Pages default may be older |
| — | slug uniqueness caveat (year stripped from URLs) | two posts named identically in different years would collide at `/blog/<name>/` |

## Appendix B — Notes

* **degit:** pulls a tarball of `blog-content#main` — the repo being
  **public** is what makes this work with no token. `--force` overwrites
  the previous pull on every build.
* **Drafts:** the `getCollection` filter hides `draft: true` posts from both
  listing and post pages, so drafts are safe to push to the public repo.
* **Local dev:** `npm run dev` runs the content pull first; blog authoring
  loop = edit Markdown in `blog-content`, push, Pages rebuild hook fires.
* **Where things live:** this repo (`akiblog`) stays frozen as the v1
  archive (tag `v2.0.0`); `portfolio-app` is a brand-new standalone repo;
  `blog-content` is the public content repo. Nothing from v1 (Workers, D1,
  R2, Access, CI runner) carries over.
* **Optional later:** `@astrojs/sitemap`, `@astrojs/rss`, and a reading-time
  helper all drop into this structure without architectural changes.
