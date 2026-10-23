# Plan 32 — security.txt + security policy page (owner request, 2026-10-23)

Follows plan31 (privacy + terms). Owner: report by email to hello@akibh.dev; socials
(GitHub, LinkedIn, X) as other contacts.

- `/.well-known/security.txt` (RFC 9116) on **both hosts** (the file is per-host), generated at
  build (`src/pages/.well-known/security.txt.ts`) so the required `Expires` is always
  build time + 360 days. Fields: Contact (mailto first, then GitHub / LinkedIn / X), Expires,
  Preferred-Languages: en, Canonical (own host), Policy → `https://akibh.dev/security/`.
  `_headers`: text/plain, 1 h cache.
- `akibh.dev/security/` (LegalPage): how to report (email; socials only to ask for a private
  channel; never public comments/issues), what helps, scope (both sites, /api/contact + mailer,
  /api/featured), out of scope (third-party platforms, DoS/spam, social engineering, scanner-only
  findings), response promise (7 days reply, ~30 days fix, optional credit, no bounty),
  good-faith safe harbour.
- Links: LegalPage nav, both sidebars + mobile menus ("Privacy · Terms · Security").
- Keep fresh: Expires renews on every deploy; if a site goes a year without deploying, re-run
  its deploy workflow.
