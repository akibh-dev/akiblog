# Investigation Report — Admin 401 on "Save Article", D1/R2 health, Access auth hardening

- **Date:** 2026-09-24
- **Scope:** `apps/blog` (Astro 7 SSR on Cloudflare Workers, D1, R2, Cloudflare Access)
- **Symptom:** Signing in via Cloudflare Access works and `/admin` loads, but `POST https://blog.akib35.dev/api/posts` returns **401 Unauthorized**, so no post can be saved.
- **Status:** Root cause found and fixed. Verified with tests and a local workerd runtime. **Not yet deployed.** CI deploys the prebuilt `dist.tar.gz`, so it has to be rebuilt first (see §7).

---

## 1. Executive summary

| # | Finding | Severity | Effect in production |
|---|---------|----------|----------------------|
| 1 | `CF_Authorization` cookie parsed wrongly: the code dropped everything before the first `.`, which deleted the JWT header | **Critical** | Every admin API call (create/update/delete post, tags, comments moderation, image upload) returned 401 |
| 2 | Media route read `locals.runtime.env`, which Astro 6+/adapter 13+ no longer provides | **High** | Every uploaded R2 image returned **404** even though the upload succeeded |
| 3 | `scripts/dev.js` passed `--var DEV_MODE=true`; wrangler's syntax is `KEY:VALUE` | Medium (dev only) | Created a bogus var named `DEV_MODE=true`; the real `DEV_MODE` stayed `"false"`, so the local auth bypass broke after the move to `wrangler.jsonc` |
| 4 | Debug line added during triage referenced an undefined `cookieHeader` | High (uncommitted) | Would have turned every token-less request into a 500. Removed before shipping |
| 5 | Deploy step had been switched to `wrangler deploy dist/server/entry.mjs --config wrangler.jsonc` | High (uncommitted) | That config lacks the adapter's `SESSION` KV binding, `no_bundle` and the correct asset paths. Reverted to the proven `dist/server/wrangler.json` |
| 6 | Auth was checked separately in every route; no central gate; no CSRF check for cookie auth | Medium | A route that forgot the check would be open to anyone. Cookie-authenticated writes had no origin check |
| 7 | Upload fallback wrote base64 `data:` URLs into D1 when R2 was unbound; SVG uploads allowed | Medium | Could bloat D1 rows silently; SVG served same-origin is an XSS risk |
| 8 | Old auth tests only covered rejections plus an invented cookie format | Process | The suite was green while production rejected every valid session |

---

## 2. Evidence

### 2.1 Captured production request (DevTools)

```
POST https://blog.akib35.dev/api/posts      -> 401 Unauthorized
Response: Content-Type: text/plain; Content-Length: 24   ( = {"error":"Unauthorized"} )
Request Cookie:
  CF_AppSession=329e8dd26b18c271;
  CF_Authorization=eyJhbGciOiJSUzI1NiIsImtpZCI6IjNlZjRh...<payload>.<signature>
Request headers: no Cf-Access-Jwt-Assertion
```

What this shows:

1. The 401 comes from **our Worker**. The 24-byte body is exactly the JSON our route returns. Access itself did not block the request.
2. `/api/*` is **outside the Access application path**, so Cloudflare does not inject `Cf-Access-Jwt-Assertion`. The Worker's only credential is the cookie.
3. The cookie value starts with `eyJhbGci…`, which is `{"alg":"RS…`. It is a **raw compact JWT** with three segments and no `<key_id>.` prefix.

### 2.2 Decoded token (header and payload only; no secrets)

```json
header : {"alg":"RS256","kid":"3ef4a884…"}
payload: {"aud":["81f9a6cb…bdc88"],"iss":"https://akib35.cloudflareaccess.com","type":"app", "exp":…}
```

`aud` matches `CLOUDFLARE_ACCESS_AUD` and `iss` matches `CLOUDFLARE_TEAM_DOMAIN` in `wrangler.jsonc`. **The configuration was correct; only the parsing was wrong.**

### 2.3 The faulty code (commit `1445132`)

```ts
const dotIndex = cfAuth.indexOf('.');
const jwt = cfAuth.slice(dotIndex + 1);   // "eyJhbGci….PAYLOAD.SIG" -> "PAYLOAD.SIG"
```

This removes the JWS header, and `jose` rejects the remainder with `JWSInvalid: Invalid Compact JWS`.

**Reproduction:** the new regression test was run against the committed `auth.ts`. It fails with exactly that error, and passes with the fix.

### 2.4 Why `/admin` still worked

A page navigation to `/admin` passes through the Access application, so the edge injects `Cf-Access-Jwt-Assertion`. That header was parsed correctly. Only the cookie path was broken, and every `fetch()` from the studio uses the cookie path.

---

## 3. Fixes implemented

### 3.1 Authentication (`src/lib/auth.ts`, `src/middleware.ts`, `src/lib/access-policy.ts`)

- **Cookie parsing:** reads `CF_Authorization` as a raw JWT, accepts only well-formed three-segment tokens, and handles quoting and URL-encoding.
- **Verification** is the same for both sources: RS256 against the team JWKS, with `iss = https://<team>`, `aud = <AUD>`, exp/nbf, and 30 s clock tolerance. The header is tried first, then the cookie.
- **JWKS cache** per isolate, so there is one certs fetch rather than one per request. `jose` handles key rotation.
- **Structured result** from `authenticateRequest()`: `{ user, source: header|cookie|dev-bypass, reason }`. The reasons are `no_token`, `not_configured`, `token_expired`, `invalid_token` and `identity_not_allowed`. `verifyAccessJWT()` is kept as a thin wrapper, so existing call sites are unchanged.
- **Optional `ADMIN_EMAILS`** var (comma-separated), for defence in depth if the Access policy is ever widened.
- **Central middleware.** Writes are protected by default:
  - `/admin/**` → admin
  - `/api/**` `POST/PUT/PATCH/DELETE` → admin, except the public allowlist (`POST /api/comments`)
  - `GET …?admin=true` and `/api/health` → admin

  401s now return JSON with a `reason` and a human-readable `message`, plus `Cache-Control: no-store`. Route-level checks stay in place as a second layer.
- **CSRF:** a cookie-authenticated write must be same-origin (checked via `Origin` / `Sec-Fetch-Site`), otherwise it gets a 403.
- **Studio UX:** write/edit forms no longer crash on non-JSON error bodies. A 401/403 shows "session no longer valid, reload to sign in; your draft stays in this tab". A **Sign out** link (`/cdn-cgi/access/logout`) was added to the nav.

### 3.2 R2 assets (`src/lib/storage.ts`, `/api/upload`, `/api/media/[...key]`)

- **Media route** now uses the `cloudflare:workers` env, which fixes the 404 on every image. It adds `HEAD`, `ETag`/`304`, `nosniff` and immutable caching, and serves only the `uploads/` prefix.
- **Keys:** `uploads/YYYY/MM/<uuid>.<ext>`. The extension comes from the validated MIME type, never the filename. Older `uploads/<ts>-<uuid>.<ext>` objects are still served.
- **Validation:** PNG/JPEG/WebP/GIF/AVIF only (no SVG), max 10 MB, mapped to 415/413.
- **No silent fallback:** a missing `BUCKET` binding returns a 503 instead of writing base64 into D1.
- **Cover image field** (`CoverImageField.astro`) on write and edit pages: paste a URL or **Upload to R2**, with a preview. The input changed from `type="url"` to text because `type="url"` rejected relative `/api/media/...` URLs.

### 3.3 D1 blog data

The D1 schema and services were already correct. Once auth was fixed, post creation worked (verified locally, §5). The health panel now shows whether production migrations have been applied (see §3.4).

### 3.4 Service status panel (`/admin`)

`ServiceStatus.astro`, backed by `src/lib/health.ts` and `/api/health`, runs **real probes** rather than checking that a binding exists:

| Service | Passive check (page load, `GET /api/health`) | Full check (button, `POST /api/health`) |
|---|---|---|
| D1 | Required tables in `sqlite_master` (flags missing migrations) + post count, latency | same |
| R2 | `list({limit:1})` reachability | `put → get → delete` round-trip on a `.health/` key |
| Access | Configured? How this request authenticated (header / cookie) and as whom. **Dev bypass shows as "Degraded"** | + fetches the team JWKS and counts signing keys |

Each probe times out after 4 s. The overall state is the worst of the three. Rows carry text labels (Operational / Degraded / Down), so state is never shown by color alone.

### 3.5 Tooling

- `scripts/dev.js`: `--var DEV_MODE:true --var SITE_URL:http://localhost:4321`. Local D1/R2/KV are emulated by Miniflare and persisted under `.wrangler/state/v3`.
- `.forgejo/workflows/deploy.yml`: deploys with `--config dist/server/wrangler.json`. It **refuses to deploy** if that file is missing, contains `"DEV_MODE":"true"`, or still has the `blog-db-local-id` placeholder.

---

## 4. Files changed

| File | Change |
|---|---|
| `apps/blog/src/lib/auth.ts` | Rewritten: correct cookie parsing, structured result, JWKS cache, allowlist |
| `apps/blog/src/middleware.ts` | **New:** central auth gate and CSRF check |
| `apps/blog/src/lib/access-policy.ts` | **New:** pure route policy (unit-tested) |
| `apps/blog/src/lib/health.ts` | **New:** D1/R2/Access probes |
| `apps/blog/src/pages/api/health.ts` | **New:** admin health endpoint |
| `apps/blog/src/components/admin/ServiceStatus.astro` | **New:** status panel |
| `apps/blog/src/components/admin/CoverImageField.astro` | **New:** URL or R2 upload field |
| `apps/blog/src/lib/storage.ts` | Validation, key layout, no base64 fallback |
| `apps/blog/src/pages/api/upload.ts` | Uses `StorageError` status codes |
| `apps/blog/src/pages/api/media/[...key].ts` | Env fix (404 bug), HEAD/ETag, prefix guard |
| `apps/blog/src/pages/admin/index.astro` | Status panel; page survives D1 errors |
| `apps/blog/src/pages/admin/write.astro`, `edit/[id].astro` | Cover field, 401 messaging, safe JSON parsing |
| `apps/blog/src/components/admin/AdminNav.astro` | Sign out |
| `apps/blog/src/env.d.ts` | `locals.auth`, `ADMIN_EMAILS` |
| `apps/blog/scripts/dev.js` | `--var` syntax |
| `.forgejo/workflows/deploy.yml` | Proven config + safety rails |
| `apps/blog/tests/**` | New/rewritten suites (below) |

---

## 5. Verification

**Unit + integration:** `pnpm --filter blog test` → **10 files, 96 tests passing**.

- `tests/unit/auth.test.ts`: real RS256 keys and a stubbed JWKS endpoint. Covers the raw-cookie regression (the exact production shape, including `CF_AppSession`), header preference, fallback, and rejections: wrong key, wrong `aud`, wrong `iss`, expired, not configured, allowlist. Also checks the JWKS cache and that the dev bypass requires exactly `"true"`.
- `tests/unit/access-policy.test.ts`: full route protection matrix and CSRF origin guard.
- `tests/unit/storage.test.ts`: key layout, MIME-derived extension, 415/413/503.
- `tests/integration/health.test.ts`: D1 migrated vs un-migrated, R2 deep round-trip with cleanup, Access states, `/api/health` auth, and an upload → media round-trip.

**Local Workers runtime (`wrangler dev`, Miniflare D1/R2/KV):**

| Mode | Request | Result |
|---|---|---|
| dev bypass | `GET/POST /api/health` | D1 "Connected · 4 posts", R2 "Write, read and delete verified", Access "Dev bypass active" |
| dev bypass | `POST /api/upload` → `GET /api/media/…` | 200, `image/png` (was 404 before the fix) |
| dev bypass | `POST /api/posts` | 201 Created |
| **production mode** (`DEV_MODE=false`) | `POST /api/posts`, `/api/upload`, `GET /api/health`, `/admin`, `?admin=true` | 401 `no_token` |
| production mode | Forged `CF_Authorization` | 401 `invalid_token` (real JWKS fetched from `akib35.cloudflareaccess.com`) |
| production mode | `GET /`, `GET /api/posts`, `POST /api/comments` | Public, as intended (200 / 200 / 400 validation) |

**Not verified here:** a real production Access session end-to-end, since that needs a deploy. The captured production token was checked against the configured issuer/AUD (§2.2), and the regression test reproduces its exact shape.

---

## 6. Cloudflare Access configuration notes

- Keep the Access application on `blog.akib35.dev/admin*`. Do **not** put all of `/api/*` behind Access: public reads and reader comments must stay anonymous. The Worker now validates admin API calls with the same token, taken from the cookie.
- Recommended cookie settings on the Access application: **HttpOnly** on. **SameSite Lax** is compatible, because the studio's calls are same-origin.
- Optional: set `ADMIN_EMAILS` in `wrangler.jsonc` `vars` to the addresses the Access policy allows.
- After deploying, open `/admin`. The Access row should read **"Operational — Verified via Access header"**. Click **Run full check** and confirm R2 shows "Write, read and delete verified" and Access lists its signing keys. If D1 shows "Missing tables", run the workflow with *Apply pending D1 migrations* enabled.

## 7. Deployment steps (nothing was committed or pushed)

1. `pnpm ship`: runs the tests, rebuilds `apps/blog/dist`, and repacks `apps/blog/dist.tar.gz`. **Required**, because CI deploys the prebuilt tarball; without this, production keeps the old code.
2. Review and commit, then push to `main` / run the Forgejo workflow (`target: blog`).
3. Check the status panel as described in §6.

## 8. Known pre-existing issue (out of scope)

`pnpm exec tsc --noEmit` fails immediately on `apps/blog/tsconfig.json` `paths` entries: TypeScript 7 requires `./`-prefixed non-relative paths (TS5090). Typechecking therefore does not run at all today. Tests and `astro build` are unaffected. Fix separately by prefixing those paths with `./`.
