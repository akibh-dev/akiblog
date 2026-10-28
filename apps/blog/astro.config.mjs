/* For more details, see docs/blog/implementation-notes.md#astro-config-mjs-note-1. */

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
import postAssets from './src/lib/post-assets.ts';

// giscus.app is allowed ONLY once comments are configured (plan21 §3):
// its client script + the comments iframe.
const giscusSrc = giscus ? ['https://giscus.app'] : [];

export default defineConfig({
  output: 'static',
  site: 'https://blog.akibh.dev',
  // trailing slashes everywhere: /posts/<slug>/ is the URL contract (plan19 §3),
  // and Pages serves folder/index.html at exactly that path
  trailingSlash: 'always',
  // For more details, see docs/blog/implementation-notes.md#astro-config-mjs-note-2.
  integrations: [postAssets(), sitemap({ filter: (page) => !/\/(404|feed|tags)\//.test(new URL(page).pathname + '/') })],
  markdown: {
    // src/lib/markdown.ts (each plugin documented there), via Astro 7.4's
    // `processor: unified()` (top-level remark/rehypePlugins are deprecated).
    // rehypeHeadingIds runs FIRST so the anchor plugin can read the ids.
    processor: unified({
      remarkPlugins: [remarkStripTitle, remarkCodeLang, remarkAlerts],
      rehypePlugins: [rehypeHeadingIds, rehypeHeadingAnchors, rehypeExternalLinks(['blog.akibh.dev'])],
    }),
    // For more details, see docs/blog/implementation-notes.md#astro-config-mjs-note-3.
    shikiConfig: {
      themes: { light: 'light-plus', dark: 'one-dark-pro' },
      defaultColor: false,
      wrap: false,
      transformers: [shikiCodeFrame()],
    },
  },
  // For more details, see docs/blog/implementation-notes.md#astro-config-mjs-note-4.
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
