/**
 * @file apps/blog/astro.config.mjs
 * @description Astro configuration for akiblog (blog.akib35.dev).
 *
 * POC / Implementation Architecture (plan19–21):
 * - `output: 'static'` — every page is pre-rendered; Cloudflare Pages serves
 *   dist/ from its CDN. No adapter, no Worker, no runtime (the old SSR blog
 *   with D1/R2/Access is gone). Search is Pagefind (a static index built
 *   after `astro build`), comments will be giscus (an iframe).
 * - Posts come from the notes repo, synced into src/content/posts/ by
 *   scripts/sync-content.ts before dev/build (see src/content.config.ts).
 * - Image service: Astro's default (sharp) — covers and inline images are
 *   resized to AVIF/WebP at BUILD time, og:image JPEGs too.
 * - Same design system as the portfolio: Tailwind v4 via @tailwindcss/vite,
 *   tokens in src/styles/global.css (copied from apps/portfolio @ 091c7cf).
 * - No UI framework integration: every island is a pure .astro component
 *   with a vanilla custom element (AGENTS.md / plan 17).
 * - security.csp: the portfolio's hash-based Content-Security-Policy, with
 *   Turnstile + picsum removed and Pagefind added (see inline notes).
 */

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import {
  remarkStripTitle,
  remarkCodeLang,
  remarkAlerts,
  rehypeHeadingAnchors,
  rehypeExternalLinks,
  shikiCodeFrame,
} from './src/lib/markdown.ts';
import { giscus } from './src/config/giscus.ts';

// giscus.app is allowed ONLY once comments are configured (plan21 §3):
// its client script + the comments iframe.
const giscusSrc = giscus ? ['https://giscus.app'] : [];

export default defineConfig({
  output: 'static',
  site: 'https://blog.akib35.dev',
  // trailing slashes everywhere: /posts/<slug>/ is the URL contract (plan19 §3),
  // and Pages serves folder/index.html at exactly that path
  trailingSlash: 'always',
  // sitemap: emits sitemap-index.xml from `site`; the 404 and the /feed/<n>/
  // lazy-load fragments (plan26) are not pages, so they're filtered out
  integrations: [sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/feed/') })],
  markdown: {
    // src/lib/markdown.ts (each plugin documented there), via Astro 7.4's
    // `processor: unified()` (top-level remark/rehypePlugins are deprecated).
    // rehypeHeadingIds runs FIRST so the anchor plugin can read the ids.
    processor: unified({
      remarkPlugins: [remarkStripTitle, remarkCodeLang, remarkAlerts],
      rehypePlugins: [rehypeHeadingIds, rehypeHeadingAnchors, rehypeExternalLinks('blog.akib35.dev')],
    }),
    // Shiki dual themes (light-plus / one-dark-pro, from docs/ui-guide). With
    // defaultColor:false every token carries BOTH colors as CSS variables
    // (--shiki-light / --shiki-dark); global.css picks one under `.dark`, so
    // code blocks follow the theme toggle with zero JS and no flash.
    shikiConfig: {
      themes: { light: 'light-plus', dark: 'one-dark-pro' },
      defaultColor: false,
      wrap: false,
      transformers: [shikiCodeFrame()],
    },
  },
  // Content-Security-Policy — Astro hashes every <script>/<style> it renders
  // and writes a <meta http-equiv> CSP into each page. No 'unsafe-inline'
  // for scripts. Allowed extras, and why:
  //   'wasm-unsafe-eval'          Pagefind compiles its search core from
  //                               WebAssembly (plan21 §2); this permits
  //                               WASM compilation ONLY, not JS eval()
  //   static.cloudflareinsights.com / cloudflareinsights.com
  //                               Cloudflare Web Analytics beacon (edge-injected)
  //   https://giscus.app          comments script + iframe + the small
  //                               default.css its client.js injects into
  //                               the page (iframe sizing) — only when
  //                               src/config/giscus.ts is filled in
  // style-src-attr 'unsafe-inline': Shiki emits per-token style="" attributes
  // (the dual-theme CSS variables); attributes can't be hashed one by one.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        ...(giscus ? ['frame-src https://giscus.app'] : []),
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'", 'https://static.cloudflareinsights.com', ...giscusSrc],
      },
      styleDirective: {
        resources: ["'self'", ...giscusSrc, { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/.wrangler/**'],
      },
    },
  },
});
