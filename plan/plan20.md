# Plan 20 — Amendments to plan 19: identity, CI deploy on push, 404, guide location

Analysis only, no app code (AGENTS.md rule 3). **plan19 stays valid except
where this file overrides it.** For the blog, both supersede `plan/plan2.md`
(v2 guide) wherever they conflict: the author object, light/dark cover pairs,
Resend and Forgejo mirror for the blog, and `/blog/<slug>` URLs.

## 1. Changes at a glance

| # | plan19 said | Now |
|---|---|---|
| 1 | GitHub `akib35`, giscus repo unclear | GitHub account is **`akibh-dev`** → giscus `data-repo="akibh-dev/notes"`. Sources: `github.com/akibh-dev/notes` |
| 2 | Local `deploy:blog` runs wrangler from the laptop | **CI deploys, like the portfolio**: push to `main` touching `apps/blog/**` → GitHub Actions builds and runs `wrangler pages deploy` (§3) |
| 3 | No 404 spec | **Port the portfolio's 404** (`portfolio` @ `091c7cf`, rustc diagnostic + "did you mean") with blog routes (§4) |
| 4 | UI guide in `apps/blog/UI-GUIDE.md`, synced from `b9ebe63` | Guide lives in **`docs/ui-guide/README.md`** (the existing guide, now rewritten), synced from **`091c7cf`**. `apps/blog/UI-GUIDE.md` removed |
| 5 | "Rewrite ThemeSwitch/CopyButton as Astro" | Already done in the portfolio (`091c7cf`). **Copy, don't rewrite** |
| 6 | Fonts on `cdn.delta.dev` (open question) | Resolved: the portfolio self-hosts all OFL fonts in `public/fonts`. Copy them |
| 7 | TOC as sidebar stations | **Right-hand TOC column** inside the article panel (Delta reference), sidebar = site nav (§5) |
| 8 | Description min 50 = warning | Schema: `max(160)` hard, min is a build **warning** (keeps the existing notes valid without editing them) |
| 9 | `author: gemini` → edit note to `ai: generated` | **No edits to the notes repo.** The schema preprocess maps `author: <ai name>` → `ai: generated`, and the renderer strips the body `# H1` |

## 2. Repo & git rules for this work

- **The notes repo is read-only for agents.** It is only read (cloned in CI, or
  `../notes` locally). Its known issues are reported to the owner, not fixed:
  - `index.md`: `(.content/2026/browser-rendering-reference/)` is missing the `/`
  - `_includes/giscus.html`: `data-repo="akib35/notes"`, which needs to move to `akibh-dev/notes` (repo-id regenerated on giscus.app)
- Blog work happens on branch **`blog`**. Portfolio files are read from the
  **`portfolio`** branch via `git show portfolio:<path>`. The `blog` branch
  has no portfolio changes after `b9ebe63`.
- **Agents never commit or push.** The owner commits under their own identity
  (`akib35` git user / `akibh-dev` on GitHub) and merges `blog` → `main`.
- `.github/workflows/` does not exist on `blog` (only `.forgejo/`). The new
  `blog-deploy.yml` is added under `.github/workflows/` on `blog` and lands
  on `main` with the merge, alongside the existing `portfolio-deploy.yml`.

## 3. CI deploy: `.github/workflows/blog-deploy.yml`

Modeled on `portfolio-deploy.yml` (bun, build in CI, `wrangler pages deploy
--branch=main`, ensure-project step, concurrency group).

```yaml
on:
  push:
    branches: [main]
    paths: ["apps/blog/**", ".github/workflows/blog-deploy.yml"]
  workflow_dispatch:            # "publish new notes" button / gh workflow run
  repository_dispatch:
    types: [notes-updated]      # optional future hook from the notes repo
concurrency: { group: blog-deploy, cancel-in-progress: true }
```

Steps:
1. `actions/checkout@v4` (akiblog).
2. `actions/checkout@v4` with `repository: akibh-dev/notes`, `path: .notes`.
   Public repo → no token. If it's ever made private: `token: ${{ secrets.NOTES_TOKEN }}`
   (fine-grained PAT, Contents: read on notes only). Note that giscus requires it
   to stay public.
3. `oven-sh/setup-bun@v2` and `bun install --frozen-lockfile`.
4. `NOTES_DIR=.notes bun --filter blog sync-content`: copies `content/**`
   → `apps/blog/src/content/posts/` and writes `.source.json {notesSha, notesDate}`.
5. `bun --filter blog build` (`astro check && astro build`). Schema errors fail here.
6. (optional) `bunx pagefind --site apps/blog/dist`.
7. Ensure Pages project **`blog`** exists (same snippet as the portfolio).
8. `bunx wrangler pages deploy dist --project-name=blog --branch=main
   --commit-hash=$GITHUB_SHA --commit-message="blog@<sha7> · notes@<notesSha7>"`.

Secrets: the **same two** as the portfolio (`CLOUDFLARE_API_TOKEN` with
Pages: Edit, `CLOUDFLARE_ACCOUNT_ID`). No new secrets unless notes goes private.

Publishing a new note, with no code change in akiblog:
- `bun run deploy:blog` at the repo root runs
  `gh workflow run blog-deploy.yml --ref main && gh run watch`. It is the
  "occasionally run deploy-blog" command, and it deploys **through CI**, so there
  is one deploy path and one set of credentials.
- `bun run preview:blog` (local) runs the same sync from `../notes` + build +
  `astro preview`, including `--drafts`. It never deploys.
- Future, owner's choice: a 10-line workflow in the notes repo sending
  `repository_dispatch: notes-updated` would make pushing a note publish it.

Housekeeping noticed:
- `portfolio-deploy.yml` pins bun `1.3.14` while root `packageManager` is
  `bun@1.4.3`. The blog workflow should use the same version the portfolio's
  workflow does, and both should be aligned in one go.
- Old blog deploy (`.forgejo/workflows/deploy.yml`, `apps/blog/dist.tar.gz`,
  `apps/blog/wrangler.jsonc` Worker config, the blog half of `scripts/ship.js`)
  is removed in the plan19 §8 teardown. The blog's `wrangler.toml` becomes a
  Pages config (`pages_build_output_dir = "dist"`, no bindings).

## 4. 404 page

Copy `portfolio:apps/portfolio/src/pages/404.astro`, changing only the data:
- `routes`: `/`, `/tags/`, `/rss.xml`, every `/tags/<tag>/` and
  **every `/posts/<slug>/`** (built from the collection). The Levenshtein matcher
  then fixes post typos (`/posts/playwrite-setup` → `/posts/playwright-setup/`).
  The matcher must compare the **last path segment against slugs** (already its behavior).
- Old URL shapes from GH Pages: `/content/2026/<slug>/` (and `/notes/content/…`)
  get real redirects in `public/_redirects` → `/posts/<slug>/ 301`, generated
  at build from the collection. They don't rely on the 404 suggestion.
- Text: `blog.akib35.dev`. Buttons: `cd ~ → Home` (`/`), `Portfolio ↗`.
  Report link stays `mailto:` (address from shared site meta).
- `noindex`, excluded from the sitemap, CSP-safe (data via `data-routes`), same as the portfolio.

## 5. TOC placement (decision)

Right-hand sticky TOC column (`xl+`), with a `<details>` fallback above the article
below `xl`. Sidebar stations stay site navigation. Why not stations:
- SiteSidebar's geometry is derived for short labels (22px pill rows,
  `TREE_TOP` from count). Article h2s are long and numerous, and would truncate
  or push the git tree off-screen.
- The sidebar should mean the same thing on every page (where am I on the
  site). The TOC means where am I in this article. Delta's own blog
  separates them the same way.

## 6. Updated phase list (replaces plan19 §9)

| # | Phase | Output |
|---|---|---|
| 1 | Teardown + static scaffold | plan19 §8 teardown. Astro latest, `output:'static'`, Tailwind v4, sharp, sitemap, CSP |
| 2 | Port design system | `docs/ui-guide/README.md` §2 copy list from `portfolio@091c7cf` (incl. 404, BaseHead, fonts, `_headers`, robots) |
| 3 | Content | `content.config.ts` (from `docs/ui-guide/`), `sync-content` script, `.source.json` |
| 4 | Pages + components | index, post, tags, 404, `_redirects`, guide §5/§9 |
| 5 | SEO | BaseHead article mode, OG JPEG from cover, RSS, sitemap, JSON-LD, `/posts.json` |
| 6 | Giscus (+ Pagefind) | `akibh-dev/notes`, mapping `specific` = slug, themed CSS, CSP entries |
| 7 | CI + cutover | `blog-deploy.yml`, `deploy:blog` / `preview:blog` scripts, detach `blog.akib35.dev` from the old Worker → attach to Pages `blog` |
| 8 | Follow-ups (owner) | notes fixes listed in §2, then retire Jekyll; portfolio Writings reads `/posts.json` |

## 7. Still open
1. Pagefind search in v1 or later?
2. Blog display name: keep "akib's notes"?
3. Domains stay `akib35.dev` / `blog.akib35.dev`, with only the GitHub account changing? (assumed yes)
