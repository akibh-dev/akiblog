# Cloudflare Worker API Token Permissions & Artifact Packaging (plan5.md)

This plan details:
1. The exact Cloudflare API Token permissions required for **Cloudflare Workers**, **D1**, and **Custom Domains**.
2. Packaging the build as a compressed zip archive (`dist.tar.gz` or `dist.zip`), ignoring raw `dist/` in `.gitignore` to avoid checking in thousands of loose files.

---

## 1. Cloudflare API Token Permissions Checklist

When using `wrangler deploy` for a Cloudflare Worker on a custom domain, the token needs the following permissions:

| Category | Resource | Permission Level | Why It Is Needed |
| :--- | :--- | :--- | :--- |
| **Account** | `Workers Scripts` | **Edit** | To create, upload, and update the Worker code (`blog`) |
| **Account** | `Workers KV Storage` | **Edit** | To bind the session KV namespace |
| **Account** | `Workers Routes` / `Workers Custom Domains` | **Edit** | To attach `blog.akib35.dev` custom domain |
| **Account** | `D1` | **Edit** | To bind and execute migrations on `blog-db` |
| **Account** | `R2 Storage` | **Edit** | To bind the `blog-media` bucket |
| **Zone** | `Workers Routes` | **Edit** | To route `blog.akib35.dev` on your zone `akib35.dev` |
| **Account** | `Account Settings` / `Memberships` | **Read** | Recommended for Wrangler user settings check |

### How to update your Token in Cloudflare:
1. Go to **Cloudflare Dashboard** -> **My Profile** -> **API Tokens**.
2. Click **Edit** on your existing token (or Create Custom Token).
3. Under **Permissions**, add:
   - `Account` -> `Workers Scripts` -> `Edit`
   - `Account` -> `Workers KV Storage` -> `Edit`
   - `Account` -> `Workers Routes` -> `Edit`
   - `Account` -> `D1` -> `Edit`
   - `Account` -> `R2 Storage` -> `Edit`
   - `Zone` -> `Workers Routes` -> `Edit` -> All Zones (or `akib35.dev`)
4. Save the token and ensure it is updated in your Forgejo repository secrets as `CLOUDFLARE_API_TOKEN`.

---

## 2. Artifact Strategy: Compressed Archive & Gitignore

To keep the repository clean and avoid committing thousands of loose build files:
1. Add `dist/` to `.gitignore`.
2. Add a local build script `pnpm pack:dist` that builds and bundles `dist/` into a single compressed `dist.tar.gz` archive (~450KB).
3. The Forgejo CI workflow unpacks `dist.tar.gz` during deployment before running `wrangler deploy`.
