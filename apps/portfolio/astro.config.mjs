/**
 * @file apps/portfolio/astro.config.mjs
 * @description Standalone Astro configuration for the minimalist personal portfolio.
 * 
 * POC / Implementation Architecture:
 * - Employs static output mode (`output: 'static'`) for optimal edge CDN caching and zero server runtime costs.
 * - Uses `passthrough` image service to eliminate native C++ Sharp binary dependencies, preventing runner OOM
 *   and platform compatibility issues on constrained Alpine runners.
 * - Integrates Tailwind CSS v4 via `@tailwindcss/vite` plugin for lightning-fast builds and utility-first styling.
 * - Deploys to Cloudflare Workers static assets routing directly to apex domain `akib35.dev`.
 */

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://akib35.dev',
  image: {
    service: {
      entrypoint: 'astro/assets/services/passthrough',
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
