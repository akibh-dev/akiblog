# Cloudflare Access Zero Trust Admin Protection Guide (plan8.md)

This document provides step-by-step instructions for securing and accessing the Admin Panel on `https://blog.akib35.dev/admin` using **Cloudflare Zero Trust Access (SSO)**.

---

## 1. Why Cloudflare Access for Admin?

Instead of storing passwords, managing sessions, and maintaining 2FA verification code tables in the database, **Cloudflare Zero Trust** intercepts all requests to `blog.akib35.dev/admin/*` at the Cloudflare edge.

```
┌────────────────────────────────────────────────────────┐
│ 1. Visitor goes to https://blog.akib35.dev/admin       │
│ 2. Cloudflare Edge intercepts request                  │
│ 3. Identity Provider prompt (Google / GitHub / Pin)    │
│ 4. If email matches (e.g. your email):                 │
│    -> Edge forwards request with JWT Header            │
│    -> Worker grants access to Admin Studio             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Setup in Cloudflare Dashboard

### Step 1: Open Cloudflare Zero Trust
1. In your Cloudflare Dashboard, click **Zero Trust** in the left sidebar (or go to `https://one.dash.cloudflare.com`).

---

### Step 2: Create a Self-Hosted Access Application
1. In Zero Trust Dashboard, navigate to **Access -> Applications**.
2. Click **Add an application** -> Select **Self-Hosted**.
3. Fill in the **Application Configuration**:
   - **Application name**: `Akiblog Admin Studio`
   - **Session Duration**: `24 hours` (or your choice)
   - **Application domain**:
     * Subdomain: `blog`
     * Domain: `akib35.dev`
     * Path: `admin` *(and you can add another path for `api/posts` if desired)*

---

### Step 3: Add an Access Policy (Allow Only Your Email)
1. Click **Next** to proceed to the **Policies** tab.
2. Click **Add a policy**:
   - **Policy name**: `Allow Admin Email`
   - **Action**: `Allow`
3. Under **Configure rules**:
   - **Selector**: `Emails`
   - **Value**: Enter your email address (e.g., `admin@akib35.me` or your personal Google/GitHub email).
4. Click **Next** -> Click **Add application**.

---

### Step 4: Get your Application AUD Tag & Team Domain
1. On the application you just created, click **Edit** (or view Overview).
2. Look for **Application Audience (AUD) Tag** (a long hexadecimal string like `a1b2c3d4e5...`).
3. Note your **Team Domain** (e.g. `yourteam.cloudflareaccess.com` found under **Settings -> Custom Pages / Team Domain**).

---

### Step 5: Add AUD & Team Domain to Cloudflare Worker Variables
In Cloudflare Dashboard:
1. Go to **Workers & Pages -> blog -> Settings -> Variables and Secrets**.
2. Set the following environment variables:
   - `CLOUDFLARE_TEAM_DOMAIN`: `yourteam.cloudflareaccess.com`
   - `CLOUDFLARE_ACCESS_AUD`: `<YOUR_APPLICATION_AUD_TAG>`
   - `DEV_MODE`: `false`
3. Click **Deploy / Save**.

---

## 3. How to Login to the Admin Panel

1. Open your browser and navigate to:
   **`https://blog.akib35.dev/admin`**
2. Cloudflare Access will present an SSO login page (e.g. One-time pin sent to your email or Google/GitHub OAuth).
3. Authenticate with your authorized email.
4. You will be redirected directly into the **Studio Dashboard**:
   - **`https://blog.akib35.dev/admin`** — Overview of all posts, publication states, and comment moderation.
   - **`https://blog.akib35.dev/admin/write`** — Write new articles with the rich block editor.
   - **`https://blog.akib35.dev/admin/comments`** — Review, approve, and delete reader comments.
   - **`https://blog.akib35.dev/admin/tags`** — Manage tags and category badge colors.
