# Missing Zone-Level Permission for Custom Domain Routes (plan7.md)

This document explains why the Cloudflare API failed with `Authentication error on /zones/9790f1bf5ad6f845f72d5e440de133da/workers/routes` and provides the exact steps to resolve it.

---

## 1. Root Cause of Error

In your token summary:
```text
Permission policies:
Entire Akib@cdda.io's Account account
- Account DNS Settings Write
- D1 Write
- Workers R2 Storage Write
- Workers KV Storage Write
- Workers Scripts Write
- Account Settings Read
```

Notice that all permissions are at the **Account level**. 

However, when configuring a route or custom domain on `akib35.dev` (e.g., `blog.akib35.dev`), Wrangler queries the Zone API:
`/zones/9790f1bf5ad6f845f72d5e440de133da/workers/routes`

Because the token does not have **Zone-level Workers Routes permission**, Cloudflare rejects the request with `[code: 10000]`.

---

## 2. The Fix: Add Zone-Level Permissions to Token

In the Cloudflare Token Editor (**My Profile -> API Tokens -> token-for-akiblog -> Edit**):

1. Scroll down to **Permissions**.
2. Click **Add another policy**.
3. In the new policy row:
   - Change the first dropdown from **Account** to **Zone**.
   - In the second dropdown, select **All zones from an account** -> `Akib@cdda.io's Account` (or select `akib35.dev` specifically).
   - In the permissions dropdown, select:
     * **`Workers Routes`** -> **`Edit`**
     * **`DNS`** -> **`Edit`**
4. Click **Continue to summary** and save the token.

---

## 3. Alternative Option: Remove Route from Wrangler & Attach via Dashboard

If you prefer to keep the token strictly scoped to Account level without Zone permissions:
1. Remove the `routes` block from `apps/blog/wrangler.toml`.
2. Deploy the Worker.
3. In Cloudflare Dashboard, go to **Workers & Pages -> blog -> Settings -> Triggers -> Add Custom Domain** -> Enter `blog.akib35.dev`.
