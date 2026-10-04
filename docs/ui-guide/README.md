# Delta Blog Design & Configuration Reference System

This directory contains the complete design specifications, CSS rules, component templates, and configuration schemas reverse-engineered from **[Delta's Engineering Blog](https://delta.dev/blog/planning-together-in-delta)**.

When you decide to add an active blogging system to this portfolio, all files and blueprints here can be copied directly into `src/pages/blog/` and `src/content/blog/` without needing to rebuild or re-style anything.

---

## 1. Directory Structure

```
src/reference-blog-system/
├── README.md               # This architectural reference guide
├── blog.css                # Verbatim .markdown-content prose typography & styling
├── BlogLayout.astro        # Full-page layout (fixed frame + sidebar + article + TOC)
├── BlogHeader.astro        # Post hero header (eyebrow, title, author, date, divider)
├── TableOfContents.astro   # Interactive sticky right-hand TOC web component
├── ImageZoom.astro         # Dual light/dark image figure with zoom lightbox modal
├── MorePosts.astro         # Post-article footer recommendations list
├── content.config.ts       # Astro Content Collections Zod schema
└── sample-post.md          # Sample article showing all markdown features
```

---

## 2. Page & Grid Architecture

Delta's blog layout uses a precision 3-layer grid architecture:

### A. Outer Viewport Fixed Framing
- **Grid Layout**: `grid h-dvh grid-cols-[1fr_minmax(0,78rem)_1fr] grid-rows-[0.75rem_minmax(0,1fr)_0.75rem]`
- **Fixed Hatched Lines**:
  - Top & bottom hairline border bars (`bg-[var(--delta-canvas)] border-y border-delta`) filled with 45° diagonal hatch patterns (`defs/pattern` rotate 45°).
  - Left & right outer margins on extra-wide screens (`hidden xl:block`), framing the central 78rem channel.
  - The content column scrolls smoothly **underneath** this fixed frame.

### B. Left Desktop Sidebar (Sticky Rail)
- **Width**: `13rem` (md) / `14.5rem` (lg).
- **Sticky Position**: `sticky top-3 h-[calc(100vh-1.5rem)]`.
- **Components**:
  - Delta brand logo mark.
  - Vertical branch line connecting navigation items with circular nodes.
  - **Animated Git Commit Tree**: SVG with traveling data packet pulses and breathing commit nodes (`@keyframes node-breathe`).
  - Bottom 3-option theme segmented toggle (Light / Dark / System).

### C. Main Content & Right TOC Column
- **Wrapper**: `border-r border-delta bg-[var(--delta-canvas)]`.
- **Header**: `BlogHeader.astro` with full-width horizontal eyebrow divider line, `IBM Plex Serif` 4xl headline, and author avatar metadata.
- **Article & TOC Grid**:
  ```html
  <section class="border-b border-delta lg:grid lg:grid-cols-[minmax(0,1fr)_14rem]">
    <!-- Left Column: Article Body -->
    <div class="min-w-0 px-4 py-8 md:px-6 lg:p-8">
      <article class="markdown-content mx-auto max-w-3xl">
        <!-- Rendered markdown slot -->
      </article>
    </div>

    <!-- Right Column: Sticky Table of Contents -->
    <aside class="hidden border-l border-delta lg:block">
      <!-- TableOfContents.astro -->
    </aside>
  </section>
  ```

---

## 3. Right-Side Table of Contents (`TableOfContents.astro`)

The Table of Contents is implemented as a lightweight, zero-dependency custom Web Component (`<table-of-contents>`):
- **Sticky Offset**: `sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col`.
- **Observer Mechanism**:
  - Queries all `a[data-toc-link]` anchors and matches corresponding heading IDs in the DOM.
  - Calculates active headings on scroll using `getBoundingClientRect().top + window.scrollY - scrollMarginTop`.
  - Uses `requestAnimationFrame` for 60fps performance and zero scroll jank.
  - Temporarily suppresses scroll updates during user click transitions (`clickSettleTimeout = 150ms`).
  - Highlights active heading using `aria-[current=location]:text-[var(--delta-brand)]` and underlines it.

---

## 4. Markdown Formatting Specifications (`blog.css`)

### Headings
- Font: `IBM Plex Serif`, serif.
- Line height: `1.2`, letter spacing: `-0.025em`, `text-wrap: balance`.
- Bottom border: `1px solid var(--ui-border-subtle)`.
- Scroll offset: `scroll-margin-top: 5rem`.

### Code Blocks (`<pre><code>`)
- Background: `var(--ui-background-strong)` (`#f8f6f0` light / `#101316` dark).
- Font: `Lilex`, monospace, `font-size: 0.8125rem`, `line-height: 1.7`.
- Border: `1px solid var(--ui-border-subtle)`, `border-radius: 2px`.
- Dual Shiki syntax themes: `light-plus` / `one-dark-pro`.

### Inline Code (`:not(pre)>code`)
- Background: `var(--ui-control-background-active)`.
- Border: `1px solid var(--ui-border-subtle)`.
- Padding: `0.125rem 0.375rem`, `font-size: 0.875em`.

### Markdown Alerts (`> [!TIP]`, `> [!WARNING]`, etc.)
- Left accent border: `3px solid var(--markdown-callout-accent)`.
- Tip: Green accent (`#1a7f37` / `#3fb950`).
- Warning / Important: Gold/amber accent (`#9a6700` / `#d29922`).
- Caution: Red accent (`#cf222e` / `#f85149`).
- Title: Upper-case tracking-wider font-mono heading.

### Images & Figures (`ImageZoom.astro`)
- Border: `1px solid var(--ui-border-strong)`.
- Captions: `font-mono text-xs text-[var(--delta-text-subtle)]`.
- Dual images: `thumbnail-l.webp` (`dark:hidden`) and `thumbnail-d.webp` (`hidden dark:block`).
- Zoom trigger: Click to open full-resolution dialog lightbox modal.

### Tables
- Border: `1px solid var(--ui-border-subtle)` with `.table-scroll` container.
- Striped alternating row backgrounds: Canvas on odd rows, subtle tint on even rows.
- Table headers: Uppercase font-mono, letter-spacing `0.05em`.

---

## 5. How to Activate This Blog in Astro

When you want to turn this into live routes in your portfolio:

1. **Move Content Collection**:
   - Copy `src/reference-blog-system/content.config.ts` to `src/content/config.ts`.
   - Place markdown files in `src/content/blog/*.md`.

2. **Create Single Post Route (`src/pages/blog/[...slug].astro`)**:
   ```astro
   ---
   import { getCollection } from 'astro:content';
   import BlogLayout from '../../reference-blog-system/BlogLayout.astro';

   export async function getStaticPaths() {
     const posts = await getCollection('blog');
     return posts.map(post => ({
       params: { slug: post.slug },
       props: { post },
     }));
   }

   const { post } = Astro.props;
   const { Content, headings } = await post.render();
   ---

   <BlogLayout
     title={post.data.title}
     description={post.data.description}
     publishDate={post.data.publishDate.toISOString()}
     formattedDate={post.data.publishDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
     author={post.data.author}
     headings={headings}
   >
     <Content />
   </BlogLayout>
   ```

3. **Create Blog Index Route (`src/pages/blog/index.astro`)**:
   - Query all posts via `await getCollection('blog')`.
   - Render the 3-column cards list matching `BlogSection.astro`.
