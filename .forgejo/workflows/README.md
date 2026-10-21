# No Forgejo Actions in this repo — on purpose

All CI/CD runs on **GitHub Actions** only (`.github/workflows/`), after the
Forgejo → GitHub push mirror syncs `main`:

- `.github/workflows/portfolio-deploy.yml` → Cloudflare Pages `portfolio`
- `.github/workflows/blog-deploy.yml` → Cloudflare Pages `akiblog`

## Why this folder exists

Forgejo Actions reads workflows from `.forgejo/workflows/`, and **falls back to
`.github/workflows/` when this folder does not exist**. Without it, every push or
merge on Forgejo would also try to run the GitHub deploy workflows on the Forgejo
runners. This folder exists (so the fallback never happens) but holds no workflow
files (so Forgejo runs nothing). Don't delete it, and don't add `.yml` files here.

Belt and braces: Actions can also be switched off for this repo in Forgejo under
Settings → Units → Actions.
