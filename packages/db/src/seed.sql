-- Seed Tags
INSERT OR IGNORE INTO `tags` (`id`, `name`, `slug`, `color`, `created_at`) VALUES
('tag-1', 'Architecture', 'architecture', '#3B82F6', 1704067200000),
('tag-2', 'Cloudflare', 'cloudflare', '#F97316', 1704067200000),
('tag-3', 'Astro', 'astro', '#8B5CF6', 1704067200000),
('tag-4', 'TypeScript', 'typescript', '#0EA5E9', 1704067200000),
('tag-5', 'Performance', 'performance', '#10B981', 1704067200000);

-- Seed Blog Post 1: Building Edge-Native Applications with Astro and Cloudflare D1
INSERT OR REPLACE INTO `posts` (`id`, `slug`, `title`, `excerpt`, `content`, `cover_image`, `status`, `author_email`, `allow_comments`, `published_at`, `created_at`, `updated_at`) VALUES
(
  'post-1',
  'building-edge-native-applications-with-astro-and-cloudflare-d1',
  'Building Edge-Native Applications with Astro and Cloudflare D1',
  'A deep dive into architecting server-rendered, globally distributed web apps using Astro v5, Cloudflare D1, and Drizzle ORM with near-zero latency.',
  '{"time":1710000000000,"blocks":[{"type":"header","data":{"text":"The Edge Computing Revolution","level":2}},{"type":"paragraph","data":{"text":"Modern full-stack web development has reached an inflection point. Traditional multi-region server setups are costly and complex to maintain. By deploying Astro on Cloudflare Workers, our code runs in hundreds of cities worldwide within single-digit milliseconds of our users."}},{"type":"header","data":{"text":"Why Cloudflare D1 and Drizzle ORM?","level":3}},{"type":"paragraph","data":{"text":"Cloudflare D1 provides a serverless SQLite database replicated across the Cloudflare edge network. Combined with Drizzle ORM, we gain complete end-to-end type safety without heavy query engines or native binary bloat."}},{"type":"code","data":{"code":"import { drizzle } from \"drizzle-orm/d1\";\nimport { posts } from \"@repo/db\";\n\nexport const GET: APIRoute = async ({ locals }) => {\n  const db = drizzle(locals.runtime.env.DB);\n  const data = await db.select().from(posts).all();\n  return Response.json(data);\n};","language":"typescript"}},{"type":"quote","data":{"text":"The best backend code is the code you do not have to manage servers for.","caption":"Modern Edge Architecture Manifesto"}},{"type":"header","data":{"text":"Key Architectural Takeaways","level":3}},{"type":"list","data":{"style":"unordered","items":["Zero cold starts across global edge nodes","Cost predictability with near-zero idle compute overhead","Structured Editor.js blocks allow effortless UI refactoring without altering content models"]}}],"version":"2.30.0"}',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
  'published',
  'admin@akib35.me',
  1,
  1710000000000,
  1710000000000,
  1710000000000
);

-- Seed Blog Post 2: Why We Replaced Heavy Headless CMS with Structured Editor Blocks
INSERT OR REPLACE INTO `posts` (`id`, `slug`, `title`, `excerpt`, `content`, `cover_image`, `status`, `author_email`, `allow_comments`, `published_at`, `created_at`, `updated_at`) VALUES
(
  'post-2',
  'why-we-replaced-heavy-headless-cms-with-structured-editor-blocks',
  'Why We Replaced Heavy Headless CMS with Structured Editor Blocks',
  'How storing clean JSON blocks rather than unstructured HTML or heavy third-party CMS platforms makes your blog future-proof and redesign-ready.',
  '{"time":1710500000000,"blocks":[{"type":"header","data":{"text":"The Fragility of Storing Raw HTML","level":2}},{"type":"paragraph","data":{"text":"Storing pre-rendered HTML in a database couples your content directly to whatever classes or markup patterns were trendy the day you published. When you decide to redesign your site, you are left writing regular expressions or database migration scripts to rewrite markup."}},{"type":"header","data":{"text":"Structured JSON as the Universal Content Protocol","level":2}},{"type":"paragraph","data":{"text":"By persisting blocks as JSON data, our Astro frontend maintains complete control over rendering. Every block is an Astro component with isolated typography, dark mode styling, and semantic tags."}},{"type":"table","data":{"content":[["Storage Format","Portability","Security","Redesign Effort"],["Raw HTML","Low","Requires Sanitization","High"],["Markdown","Medium","Safe","Medium"],["Block JSON","High","Safe by Design","Effortless"]]}},{"type":"quote","data":{"text":"Separation of content and presentation is the foundational principle of longevity in software design.","caption":"Content Engineering"}},{"type":"list","data":{"style":"ordered","items":["Design your schema around semantic content types","Use custom block renderers to cleanly map data to UI components","Swap your UI components anytime without migrating data"]}}],"version":"2.30.0"}',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
  'published',
  'admin@akib35.me',
  1,
  1710500000000,
  1710500000000,
  1710500000000
);

-- Seed Blog Post 3: Zero-Trust Security with Cloudflare Access for Admin Dashboards
INSERT OR REPLACE INTO `posts` (`id`, `slug`, `title`, `excerpt`, `content`, `cover_image`, `status`, `author_email`, `allow_comments`, `published_at`, `created_at`, `updated_at`) VALUES
(
  'post-3',
  'zero-trust-security-with-cloudflare-access',
  'Zero-Trust Security with Cloudflare Access for Admin Dashboards',
  'Eliminating login forms, passwords, and sessions entirely by enforcing identity verification at the Cloudflare edge.',
  '{"time":1711000000000,"blocks":[{"type":"header","data":{"text":"Killing the Password","level":2}},{"type":"paragraph","data":{"text":"Traditional authentication requires session cookies, password hashing (bcrypt/argon2), rate limiting, and brute-force defenses. By placing the /admin path behind Cloudflare Access, identity is established before any traffic reaches your server."}},{"type":"code","data":{"code":"// Verified at the edge via Cf-Access-Jwt-Assertion\nconst user = await verifyAccessJWT(request, env);\nif (!user) {\n  return new Response(\"Unauthorized\", { status: 401 });\n}","language":"typescript"}},{"type":"paragraph","data":{"text":"This eliminates entire categories of authentication vulnerabilities and removes hundreds of lines of boilerplate code from your application."}}],"version":"2.30.0"}',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
  'published',
  'admin@akib35.me',
  1,
  1711000000000,
  1711000000000,
  1711000000000
);

-- Seed Post-Tag Relations
INSERT OR REPLACE INTO `post_tags` (`post_id`, `tag_id`) VALUES
('post-1', 'tag-1'),
('post-1', 'tag-2'),
('post-1', 'tag-3'),
('post-1', 'tag-4'),
('post-2', 'tag-1'),
('post-2', 'tag-5'),
('post-3', 'tag-2'),
('post-3', 'tag-4');

-- Seed Sample Comments
INSERT OR REPLACE INTO `comments` (`id`, `post_id`, `parent_id`, `author_name`, `author_email`, `content`, `is_approved`, `ip_address`, `user_agent`, `created_at`) VALUES
('comment-1', 'post-1', NULL, 'Sarah Connor', 'sarah@example.com', 'Great breakdown of edge D1 performance! Have you tested concurrent write throughput under high load?', 1, '127.0.0.1', 'Mozilla/5.0', 1710050000000),
('comment-2', 'post-1', 'comment-1', 'Md Akib Hasan', 'admin@akib35.me', 'Thanks Sarah! D1 handles writes through a primary SQLite leader instance. For write-heavy workloads, queueing writes via Cloudflare Queues works wonders.', 1, '127.0.0.1', 'Mozilla/5.0', 1710060000000),
('comment-3', 'post-2', NULL, 'Alex Rivera', 'alex@dev.to', 'Completely agree on block JSON. Being able to restyle block renderers without touching old articles is a superpower.', 1, '127.0.0.1', 'Mozilla/5.0', 1710520000000);
