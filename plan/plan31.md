# Plan 31 — Privacy policy + Terms of use (owner request, 2026-10-23)

Owner decisions: **one policy for both sites, hosted on the portfolio** (`akibh.dev/privacy/`,
`akibh.dev/terms/`); blog content license **text © Md Akib Hasan, code snippets MIT**.

## What the sites actually process (audited before writing — the pages say only this)

| Where | Data | Who processes | Kept |
|---|---|---|---|
| Portfolio contact form | name, email, message | mailer Worker → Cloudflare Email Routing → owner's Gmail | in the owner's mailbox; no database |
| Contact form | IP (CF-Connecting-IP) | mailer: in-memory rate limit (10/min, per isolate) + Turnstile Siteverify `remoteip` | minutes, memory only |
| Turnstile (invisible, lazy: loads near the form) | browser/device signals | Cloudflare | Cloudflare's Turnstile privacy addendum |
| Both sites | aggregate page views | Cloudflare Web Analytics (edge-injected, cookieless) | Cloudflare |
| Both sites | IP + request metadata; possible `__cf_bm` security cookie (Bot Fight Mode) | Cloudflare Pages / CDN | Cloudflare |
| Blog comments | GitHub sign-in, public comments/reactions | giscus.app + GitHub Discussions (`akibh-dev/notes`); giscus session in giscus.app localStorage | until the commenter deletes |
| Both sites | `theme` key in localStorage | the visitor's browser only | until cleared |
| Blog search | query | Pagefind, in the browser — never sent | — |

Not used: own cookies, ads, trackers, Google Fonts (self-hosted), selling/sharing data.

## Changes
1. `apps/portfolio/src/layouts/LegalPage.astro` — standalone shell (BaseHead + 404-style panel;
   Layout's `#section` sidebar can't be used off the home page, same reason as the 404).
2. `apps/portfolio/src/pages/privacy.astro`, `terms.astro` — content; `updated` date shown.
3. Links: both sidebars (next to the ©), both mobile menus, a notice under the contact form's
   Send button, a line under the blog's comments box.
4. `_headers`: `no-transform` for `/privacy/` and `/terms/` (Bot Fight Mode JSD vs meta CSP,
   same as `/`). Sitemap: included (indexable, low priority by default).
