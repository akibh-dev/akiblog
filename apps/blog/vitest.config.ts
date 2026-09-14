/**
 * @file vitest.config.ts
 * @description Vitest configuration for the blog application unit and integration test suite.
 * 
 * POC / Implementation Details:
 * - Environment: Node.js (with built-in node:sqlite for in-memory D1 emulation)
 * - Path Aliases: Maps @/*, @components/*, @ui/*, @lib/*, and @repo/db for seamless module resolution.
 * - Why this implementation is best: Eliminates external service mocks while enabling true relational
 *   SQLite integration testing for Drizzle ORM and Cloudflare Worker endpoints.
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      'cloudflare:workers': path.resolve(import.meta.dirname, './tests/helpers/cf-mock.ts'),
      '@': path.resolve(import.meta.dirname, './src'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@ui': path.resolve(import.meta.dirname, './src/components/ui'),
      '@lib': path.resolve(import.meta.dirname, './src/lib'),
      '@repo/db': path.resolve(import.meta.dirname, '../../packages/db/src/index.ts'),
    },
  },
});
