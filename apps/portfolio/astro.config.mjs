/* For more details, see docs/portfolio/implementation-notes.md#astro-config-mjs-note-1. */

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://akibh.dev',
  // sitemap: emits sitemap-index.xml + sitemap-0.xml from `site` at build;
  // robots.txt points crawlers at it. The 404 page is filtered out.
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  // For more details, see docs/portfolio/implementation-notes.md#astro-config-mjs-note-2.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://blog.akibh.dev https://akiblog.pages.dev",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        "frame-src https://challenges.cloudflare.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://challenges.cloudflare.com", "https://static.cloudflareinsights.com"],
      },
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: "attribute" }],
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
