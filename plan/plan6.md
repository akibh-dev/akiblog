# Exact Cloudflare API Token Permission Matrix (plan6.md)

Based on the Cloudflare Dashboard permission groups shown in your screen, here is the exact permission configuration required for deploying the **Worker**, **D1 Database**, **KV/R2 Bindings**, and **Custom Domain Routing (`blog.akib35.dev`)**.

---

## 1. Permission Group 1: Account Level Permissions

In your Cloudflare API Token Policy, set Scope: `Account` -> `All Accounts` (or select `Akib@cdda.io's Account`), and enable **Edit** on these exact groups:

| UI Group in Dashboard | Sub-Group | Permission Level | Purpose |
| :--- | :--- | :---: | :--- |
| **Developer Platform** | `Workers Scripts` | **Edit** | Uploads & updates the Worker bundle (`blog`) |
| **Developer Platform** | `Workers KV Storage` | **Edit** | Manages session KV storage |
| **Developer Platform** | `D1` | **Edit** | Executes SQL queries and migrations on `blog-db` |
| **Developer Platform** | `Workers R2 Storage` | **Edit** | Stores and uploads media to `blog-media` |
| **Account & Billing** | `Account Settings` | **Read** | Allows Wrangler to read account membership info |

---

## 2. Permission Group 2: Zone Level Permissions (For Custom Domain `blog.akib35.dev`)

To allow Wrangler to register and route `blog.akib35.dev` automatically under your `akib35.dev` domain, click **Add another policy** (or scroll to Zone permissions in the token editor):

Set Scope: `Zone` -> `All Zones` (or select `akib35.dev`), and enable:

| UI Category | Sub-Group | Permission Level | Purpose |
| :--- | :--- | :---: | :--- |
| **DNS & Zones** | `DNS` | **Edit** | Creates the DNS CNAME record for `blog.akib35.dev` |
| **Developer Platform** (or Rules) | `Workers Routes` | **Edit** | Attaches custom domain worker route to the zone |

*(Note: If Zone-level custom domain attachment is not preferred via token, you can also bind `blog.akib35.dev` in the Cloudflare Dashboard under **Workers & Pages -> blog -> Settings -> Triggers -> Add Custom Domain**).*
