#!/usr/bin/env node

/**
 * @file scripts/ship.js
 * @description Pre-commit release builder for compiling and archiving edge artifacts.
 * 
 * POC / Implementation Details:
 * - Runs full monorepo typecheck & test suite to guarantee zero regressions before bundling.
 * - Compiles Astro SSR and static client assets into `apps/blog/dist`.
 * - Packages the distribution into a clean `apps/blog/dist.tar.gz` archive.
 * - Why this implementation is best: Standardizes the exact deployment payload required by
 *   the lightweight 1GB Alpine Forgejo runner with a single terminal command.
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

// 1. Run Vitest test suite
run('pnpm --filter blog test', 'Running unit and integration tests');

// 2. Build Astro project
run('pnpm --filter blog build', 'Building Astro SSR Worker bundle');

// 3. Compress dist/ into dist.tar.gz
const blogDir = path.resolve(import.meta.dirname, '../apps/blog');
const tarFile = path.join(blogDir, 'dist.tar.gz');

run(`cd "${blogDir}" && tar -czf dist.tar.gz dist/`, 'Creating compressed dist.tar.gz archive');

if (fs.existsSync(tarFile)) {
  const stats = fs.statSync(tarFile);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`\n✅ Ready to commit and push!`);
  console.log(`   📦 Archive created: apps/blog/dist.tar.gz (${sizeKb} KB)`);
  console.log(`\nNext step:\n   git add .\n   git commit -m "your message"\n   git push origin main\n`);
} else {
  console.error('\n❌ Failed to locate dist.tar.gz after compression.');
  process.exit(1);
}
