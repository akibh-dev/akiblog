# Plan 27 — Notes aligned, giscus live, deploy on push (2026-10-21)

## 1. Notes repo (`../notes`, edited on owner request, NOT committed)
| File | Change |
|---|---|
| `content/2026/*/index.md` (3 posts) | Frontmatter in template order. `type` unquoted. Explicit `featured: false` + `ai:` (`browser-rendering-reference`: `author: gemini` → `ai: generated`). Leading body `# H1` removed (the title is the H1 on the blog *and* on Jekyll). Prose and descriptions untouched |
| `_templates/sample.md` | The post template (from akiblog `docs/sample-post.md`) with `featured: false` as default. `_`-prefixed, so Jekyll doesn't publish it and the blog doesn't sync it |
| `README.md` | "Writing a post" section |
| `index.md` | Broken link fixed: `.content/…` → `./content/…` |
| `_includes/giscus.html` | `data-repo` → `akibh-dev/notes` (the ids are unchanged by the rename) |

Note: `playwright-setup` lost its playful H1 "Playwright or wrong" (it was the body H1). Move that line into the title or the intro if you want to keep it.

## 2. giscus (verified via GitHub GraphQL + giscus API)
- `src/config/giscus.ts`: repo `akibh-dev/notes`, repoId `R_kgDOSFUhMA`, category
  `Comments` (`DIC_kwDOSFUhMM4DGfRz`), mapping `pathname`, reactions on, input on top.
  The repo is public, Discussions are on, and the giscus app is installed.
- Themes `public/giscus/{light,dark}.css`: giscus base theme + the blog tokens resolved
  to rgb in a real browser + iA Writer/Lilex via relative `@font-face`. `_headers`:
  `/giscus/*` → `ACAO: https://giscus.app`, `/fonts/*` → `ACAO: *`.
- CSP (astro.config): `script-src` + `frame-src https://giscus.app`, emitted only when configured.
- **Dev limitation**: Chrome's Private Network Access stops the public giscus iframe from
  loading anything from localhost, so on localhost Comments uses the stock
  `light`/`dark` themes. Verified on the production origin (Playwright, site served
  as https://blog.akib35.dev): custom palette, borders, fonts and the live theme toggle all work.
- Discussions are new per blog URL (`/<slug>/`). The old Jekyll pathname threads don't carry over.
  There were none.

## 3. Deploy on push
`.github/workflows/blog-deploy.yml` (on `blog`, lands on `main` with the merge):
push to `main` touching `apps/blog/**` (or the workflow) builds and deploys to Pages project
`akiblog`. Plus `workflow_dispatch` (`bun run deploy:blog`) and `repository_dispatch`.
The GitHub mirror `akibh-dev/akiblog` already has `CLOUDFLARE_API_TOKEN` +
`CLOUDFLARE_ACCOUNT_ID`. CI was simulated locally: frozen install, notes clone, sync `--require`,
build, Pagefind.

## 4. Go-live order (owner)
1. **notes**: review + commit + push (so CI builds the aligned posts).
2. **akiblog `blog` branch**: commit the pending `main` merge, then the blog work. Push.
3. Merge `blog` → `main` and push (Forgejo → GitHub mirror) → `blog-deploy.yml` runs
   and creates the Pages project `akiblog` → check https://akiblog.pages.dev.
4. Cutover (dashboard): Workers → `blog` → Domains & Routes → remove `blog.akib35.dev`.
   Then Pages → `akiblog` → Custom domains → add `blog.akib35.dev`.
5. After about a week: delete the old `blog` Worker, D1 `blog-db`, R2 `blog-media` and the Access app.
