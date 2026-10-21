# Plan 29 — Move to akibh.dev (portfolio) + blog.akibh.dev (2026-10-21)

`akibh.dev` matches the GitHub account (`akibh-dev`) and LinkedIn (`akibH`).
`akib35.dev` is **kept, renewed and 301-redirected path-by-path**: old links keep working,
SEO transfers, nobody can squat it, and `hello@akib35.dev` keeps working through Email Routing.

## Done
1. Bought via Cloudflare Registrar (owner). NS are Cloudflare's.
2. Email Routing on akibh.dev, MX + SPF present (owner).
3. Turnstile hostnames + the mailer's `TURNSTILE_HOSTNAMES` include akibh.dev (owner).
4. Code (branch `domain-akibh`):
   - site URLs: blog `site`/`data/site.ts` → blog.akibh.dev, portfolio `site`/`meta` → akibh.dev,
     email → hello@akibh.dev, robots sitemap lines, OG card text, llms.txt and docs comments.
   - brand handle `akib35` → `akibh`: wordmark "akibh.dev", terminal `visitor@akibh`,
     projects explorer root, OG site name. Competitive-programming handles stay `akib35`
     (those ARE the profile names).
   - GitHub links → `akibh-dev/*` (the `akib35` account is a separate live account now, so
     old links no longer redirect). `blackboard` → `akibh-dev/black-board`.
     `ecode-verifier` exists on neither account, so its link was a live 404 and was removed (card kept).
   - transitional, during the 301 period: the API CORS allow-list, the portfolio CSP `img-src` and the
     blog's internal-link hosts accept both domains. `/posts.json` ACAO → https://akibh.dev.
   - Untouched by design: `git.akib35.dev` (Forgejo), `akiblog.pages.dev` (the portfolio's API
     host, which never changes), giscus (`pathname` mapping, so threads follow the posts).

## Owner, after merging `domain-akibh` (order matters)
5. **Attach domains** *before* merging:
   - Pages → `portfolio` → Custom domains: add `akibh.dev` and `www.akibh.dev`.
   - Pages → `akiblog` → Custom domains: add `blog.akibh.dev`.
   - Keep the old `akib35.dev` / `blog.akib35.dev` attachments until step 6 is live.
   Merge → the blog deploys, then re-runs the portfolio deploy (post links → blog.akibh.dev).
6. **301 the old domain** (zone `akib35.dev` → Rules → Redirect Rules), one rule each,
   *dynamic*, **301**, preserve query string:
   - `http.host in {"akib35.dev" "www.akib35.dev"}` → `concat("https://akibh.dev", http.request.uri.path)`
   - `http.host eq "blog.akib35.dev"` → `concat("https://blog.akibh.dev", http.request.uri.path)`
   And on zone `akibh.dev`: `http.host eq "www.akibh.dev"` → `concat("https://akibh.dev", http.request.uri.path)`.
7. **Search engines**: Search Console → add Domain property `akibh.dev` (DNS TXT) → old
   property → Settings → **Change of address** → akibh.dev. Bing Webmaster → **Site Move**.
   Submit `https://akibh.dev/sitemap-index.xml` and `https://blog.akibh.dev/sitemap-index.xml`.
8. **Profiles + files**: GitHub/LinkedIn/X/coding-platform bios, the notes repo README
   (blog link), and `apps/portfolio/public/my-cv.pdf` (binary, regenerate it with the new URL/email).
9. **Later** (≥ 6 months after Change of Address): remove the transitional `akib35` entries
   (CORS list, CSP, internal-link hosts). Keep renewing akib35.dev and keep the 301s.
