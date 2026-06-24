 Here is a highly optimized, modern, and production-ready tech stack tailored specifically for the Cloudflare ecosystem. This stack prioritizes **developer experience, near-zero cost at scale, incredible performance, and long-term extensibility**.
 
 ---
 
 ## The Architecture Overview
 
 Instead of managing separate frontend and backend servers, we will use a **Monorepo** powered by **Astro** deployed on **Cloudflare Pages**. 
 
 Cloudflare Pages natively supports both static hosting and server-side rendering (SSR) via Cloudflare Workers under the hood. This means your frontend, backend API routes, database access, and storage access all live in a single unified project structure per app, reducing complexity.
 
 ```
                   ┌────────────────────────┐
                   │   Cloudflare DNS       │
                   └───────────┬────────────┘
                               │
                               
                ┌──────────────┴──────────────┐
                │      Cloudflare Access      │ (SSO Auth Protection)
                └──────────────┬──────────────┘
                               │
                ┌──────────────┴──────────────┐
                │      Cloudflare Pages       │ (Astro SSR / Edge Workers)
                └─┬─────────┬───────────────┬─┘
                  │         │               │
                  ▼         ▼               ▼
              ┌───────┐ ┌───────┐     ┌───────────┐
              │  D1   │ │  R2   │     │ Editor.js │ (Admin JSON payload)
              │ (SQL) │ │(Media)│     └───────────┘
              └───────┘ └───────┘
 ```
 
 ---
 
 ## The Tech Stack
 
 ### 1. Package Manager & Monorepo
 *   **Package Manager: `pnpm`**
     *   *Why:* Extremely fast, disk-space efficient, and has first-class support for monorepos (workspaces).
 *   **Monorepo Tool: Turborepo**
     *   *Why:* Keeps your code organized. You can share UI components, TypeScript configs, and database schemas between the Portfolio and the Blog seamlessly.
 
 ### 2. Frontend & Backend Framework: Astro
 *   **Astro (using Cloudflare SSR adapter)**
     *   *Why:* Astro is the absolute best framework for content-heavy sites. It ships **zero client-side JS** by default (perfect for your Portfolio and Public Blog), but allows you to opt-in to interactive JS (like React/Svelte for your Admin Panel and Editor.js).
     *   *Backend Capabilities:* Astro provides native file-based API routing (e.g., `src/pages/api/upload.ts`). It compiles directly to Cloudflare Pages Functions (Workers).
 
 ### 3. Database & ORM
 *   **Database: Cloudflare D1**
     *   *Why:* Cloudflare’s native serverless SQL database (built on SQLite). Zero cold starts, lightning-fast edge performance, and free for up to 5 million reads/day.
 *   **ORM: Drizzle ORM**
     *   *Why:* The fastest, most lightweight TypeScript ORM. It has native support for Cloudflare D1. Unlike Prisma, it has zero overhead and doesn't require a heavy query engine binary, making it perfect for edge environments.
 
 ### 4. Storage
 *   **Object Storage: Cloudflare R2**
     *   *Why:* S3-compatible object storage with **zero egress fees**. This is where your blog images, PDFs, and portfolio assets will live.
 
 ### 5. Authentication
 *   **Cloudflare Access (Zero Trust)**
     *   *Why:* No auth code, no database tables for passwords, and no third-party auth providers (like Auth0 or Clerk) required. You simply set a rule in Cloudflare Dashboard: *"Only allow my email to access `blog.com/admin/*`"*. Cloudflare handles the login (via magic link, Google, GitHub, etc.) and blocks everyone else at the edge before they even hit your server.
 
 ### 6. Rich Text Editor
 *   **Editor.js (with React wrapper)**
     *   *Why:* It outputs clean, structured JSON instead of messy HTML. This JSON is incredibly easy to store in a D1 text column, render as custom Tailwind components on the frontend, or parse for SEO metadata.
 
 ---
 
 ## Monorepo Directory Structure
 
 ```text
 my-project/
 ├── apps/
 │   ├── portfolio/            # Astro (Static site)
 │   └── blog/                 # Astro (Hybrid Static/SSR)
 │       ├── src/
 │       │   ├── pages/
 │       │   │   ├── index.astro       # Public blog list (Static/ISR)
 │       │   │   ├── posts/
 │       │   │   │   └── [slug].astro  # Public blog post (Static/ISR)
 │       │   │   ├── admin/            # Protected by Cloudflare Access
 │       │   │   │   ├── index.astro   # Post management dashboard
 │       │   │   │   └── write.astro   # Editor.js writing interface
 │       │   │   └── api/
 │       │   │       ├── posts.ts      # D1 CRUD endpoints
 │       │   │       └── upload.ts     # R2 Image upload endpoint
 │       │   └── components/
 │       │       └── Editor.tsx        # React Component wrapping Editor.js
 │       └── wrangler.toml             # Cloudflare bindings (D1, R2)
 ├── packages/
 │   ├── db/                   # Shared Drizzle schema and migrations
 │   └── tsconfig/             # Shared TypeScript configurations
 ├── package.json
 └── pnpm-workspace.yaml
 ```
 
 ---
 
 ## Technical Implementations & Code Snippets
 
 ### 1. Database Schema (`packages/db/schema.ts`)
 Store your post metadata and the structured JSON payload from Editor.js.
 
 ```typescript
 import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
 
 export const posts = sqliteTable('posts', {
   id: text('id').primaryKey(),
   title: text('title').notNull(),
   slug: text('slug').notNull().unique(),
   content: text('content').notNull(), // This stores the Editor.js JSON string
   coverImage: text('cover_image'),   // URL pointing to R2 storage
   publishedAt: integer('published_at', { mode: 'timestamp' }),
   createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
 });
 ```
 
 ### 2. Setting Up Cloudflare Bindings (`apps/blog/wrangler.toml`)
 Link your Cloudflare Pages project to D1 and R2.
 
 ```toml
 [[d1_databases]]
 binding = "DB"
 database_name = "blog-db"
 database_id = "your-d1-database-uuid"
 
 [[r2_buckets]]
 binding = "BUCKET"
 bucket_name = "blog-media"
 ```
 
 ### 3. Editor.js Integration with Image Upload to R2
 Create a dynamic Editor.js component in React (`apps/blog/src/components/Editor.tsx`). Astro will load this only in the `/admin` section.
 
 ```tsx
 import React, { useEffect, useRef } from 'react';
 import EditorJS from '@editorjs/editorjs';
 import ImageTool from '@editorjs/image';
 
 export default function Editor({ onSave, initialData }) {
   const ejInstance = useRef<EditorJS | null>(null);
 
   useEffect(() => {
     if (!ejInstance.current) {
       const editor = new EditorJS({
         holder: 'editorjs',
         data: initialData,
         tools: {
           image: {
             class: ImageTool,
             config: {
               endpoints: {
                 byFile: '/api/upload', // Points to your Astro R2 API route
               }
             }
           }
         },
         onChange: async () => {
           const content = await editor.save();
           onSave(content);
         }
       });
       ejInstance.current = editor;
     }
 
     return () => {
       if (ejInstance.current) {
         ejInstance.current.destroy();
         ejInstance.current = null;
       }
     };
   }, []);
 
   return <div id="editorjs" className="prose max-w-full min-h-[500px] border p-4 rounded-lg" />;
 }
 ```
 
 ### 4. R2 Upload API Route (`apps/blog/src/pages/api/upload.ts`)
 A clean Astro endpoint that processes images uploaded by Editor.js and drops them straight into Cloudflare R2.
 
 ```typescript
 import type { APIRoute } from 'astro';
 
 export const POST: APIRoute = async ({ request, locals }) => {
   try {
     const formData = await request.formData();
     const file = formData.get('image') as File;
     if (!file) return new Response('No file', { status: 400 });
 
     const key = `${Date.now()}-${file.name}`;
     
     // Upload directly to Cloudflare R2 using wrangler binding
     await locals.runtime.env.BUCKET.put(key, file.stream(), {
       httpMetadata: { contentType: file.type }
     });
 
     // Replace with your public R2 custom domain URL
     const imageUrl = `https://media.myblog.com/${key}`;
 
     return new Response(JSON.stringify({
       success: 1,
       file: { url: imageUrl }
     }), { status: 200 });
 
   } catch (error) {
     return new Response(JSON.stringify({ success: 0, error: error.message }), { status: 500 });
   }
 };
 ```
 
 ### 5. Securing the Admin Area (Cloudflare Access Setup)
 Instead of writing complex middleware, authentication is handled entirely in the **Cloudflare Dashboard (Zero Trust)**:
 
 1. Navigate to **Zero Trust** -> **Access** -> **Applications**.
 2. Click **Add an Application** -> Select **Self-Hosted**.
 3. Application URL: `blog.yourdomain.com/admin/*`
 4. Set up an authorization policy allowing only your email address.
 5. Cloudflare will now handle user authentication automatically. If you want to know *who* logged in, you can verify and parse the `Cf-Access-Jwt-Assertion` header sent by Cloudflare in your `/api` routes.
 
 ---
 
 ## Why this stack is perfect for your needs
 
 | Feature | Solution | Why it wins on Simplicity & Extensibility |
 | :--- | :--- | :--- |
 | **Monorepo** | `pnpm` + `Turborepo` | Keeps Portfolio and Blog close together, allows easy code reuse (e.g., shared UI styles or TypeScript models). |
 | **Routing & SSR** | Astro | Lightning-fast static delivery for SEO-sensitive blog posts, but fully capable of server-side actions inside `/admin` pages. |
 | **Database** | D1 + Drizzle ORM | Zero-setup SQL, zero cold starts, type-safe queries, migration system built right in. |
 | **Media Storage** | R2 | S3 compatible. Best part: You pay $0 for transferring images out to readers (No egress fees). |
 | **Auth** | Cloudflare Access | Zero code solution. Eliminates auth vulnerabilities completely. |
 | **Editor** | Editor.js | Storing clean block JSON makes future migrations or UI changes trivial compared to storing raw HTML. |