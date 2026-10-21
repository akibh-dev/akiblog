/**
 * @file apps/portfolio/astro.config.mjs
 * @description Standalone Astro configuration for the minimalist personal portfolio.
 * 
 * POC / Implementation Architecture:
 * - Employs static output mode (`output: 'static'`) for optimal edge CDN caching and zero server runtime costs.
 * - Image service: Astro's default (sharp, a devDependency). Images under src/assets go through
 *   astro:assets <Image>/<Picture> and are resized + converted to AVIF/WebP AT BUILD TIME, so the
 *   static output ships small files and no runtime image service is needed on Cloudflare.
 *   (Previously `passthrough` to keep sharp off constrained Alpine CI runners; switched by request
 *   so the hero portrait is optimized — the build host must be able to install sharp.)
 * - Integrates Tailwind CSS v4 via `@tailwindcss/vite` plugin for lightning-fast builds and utility-first styling.
 * - Deploys to Cloudflare Workers static assets routing directly to apex domain `akib35.dev`.
 */

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  site: 'https://akib35.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/.wrangler/**'],
      },
    },
  },
});
