# Plan 30 — No code-level redirects, drop akib35 / my-cv references (owner decision, 2026-10-21)

Amends plan29 §4/§9 (transitional allowances "for ~6 months") and the CV rename.

- **CV:** `akib_s_resume.pdf` only. The `/my-cv.pdf` → résumé redirect (`apps/portfolio/public/_redirects`)
  is removed. Old CV links simply 404, by choice (low traffic, not worth maintaining).
- **Transitional akib35 allowances removed now** (not after 6 months): the blog API CORS list,
  the portfolio CSP `img-src`, and the blog's internal-link hosts accept only the akibh.dev hosts.
- **All other `akib35` text removed**: LICENSE holder → Md Akib Hasan, root package description,
  comments, `docs/ui-guide`. `docs/investigation-auth-401-d1-r2.md` deleted (it documented the
  removed SSR blog's Cloudflare Access bug).
- **Kept**: LeetCode / Codeforces / HackerRank / AtCoder profile URLs (`akib35` is the real
  username there), the blog's own path redirects (`/posts/<slug>/`, `/content/…`, `/tags/`,
  `/search/` in `apps/blog/public/_redirects`), and the 4 Cloudflare dashboard Redirect Rules
  akib35.dev → akibh.dev (owner's dashboard, not code).
- Plan files (`plan/*`) and `docs/blog/` still mention akib35: they are immutable / read-only by AGENTS.md.
