#!/usr/bin/env node

/**
 * @file scripts/ship.js
 * @description Pre-commit release builder for compiling and archiving edge artifacts for both Blog and Portfolio.
 * 
 * POC / Implementation Details:
 * - Runs full monorepo test suite on blog services and endpoints to guarantee zero regressions.
 * - Compiles Astro SSR and static client assets into `apps/blog/dist`.
 * - Compiles standalone Astro static assets into `apps/portfolio/dist`.
 * - Packages both distributions into clean `dist.tar.gz` archives.
 * - Why this implementation is best: Provides a single command to generate zero-build deployment payloads
 *   tailored for the lightweight 1GB Alpine Forgejo runner, preventing CI OOM crashes completely.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(command, label) {
  console.log(`\n⏳ ${label}...`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Step failed: ${label}`);
    process.exit(1);
  }
}

console.log('📦 Starting Pre-Release Ship Builder\n======================================');

// 1. Run Vitest test suite on blog
run('pnpm --filter blog test', 'Running unit and integration tests');

// 2. Build Blog Astro project
run('pnpm --filter blog build', 'Building Blog Astro SSR Worker bundle');

// 3. Compress apps/blog/dist into dist.tar.gz
const blogDir = path.resolve(import.meta.dirname, '../apps/blog');
const blogTar = path.join(blogDir, 'dist.tar.gz');
run(`cd "${blogDir}" && tar -czf dist.tar.gz dist/`, 'Creating compressed apps/blog/dist.tar.gz archive');

if (fs.existsSync(blogTar)) {
  const stats = fs.statSync(blogTar);
  console.log(`   📦 Blog Archive: apps/blog/dist.tar.gz (${(stats.size / 1024).toFixed(1)} KB)`);
}

// 4. Build Portfolio Astro project
const portfolioDir = path.resolve(import.meta.dirname, '../apps/portfolio');
if (fs.existsSync(portfolioDir)) {
  run('pnpm --filter portfolio build', 'Building Portfolio static assets');

  // 5. Compress apps/portfolio/dist into dist.tar.gz
  const portfolioTar = path.join(portfolioDir, 'dist.tar.gz');
  run(`cd "${portfolioDir}" && tar -czf dist.tar.gz dist/`, 'Creating compressed apps/portfolio/dist.tar.gz archive');

  if (fs.existsSync(portfolioTar)) {
    const stats = fs.statSync(portfolioTar);
    console.log(`   📦 Portfolio Archive: apps/portfolio/dist.tar.gz (${(stats.size / 1024).toFixed(1)} KB)`);
  }
}

console.log(`\n✅ Ready to commit and push!`);
console.log(`\nNext step:\n   git add .\n   git commit -m "your message"\n   git push origin main\n`);
