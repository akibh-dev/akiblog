#!/usr/bin/env node

/**
 * @file scripts/dev.js
 * @description Robust development orchestrator for the blog app with automatic process cleanup.
 * 
 * POC / Implementation Details:
 * - Before starting, checks for and cleanly kills any lingering workerd or wrangler child processes on port 4321.
 * - Uses npx/pnpm exec to guarantee access to locally installed binaries (`astro`, `wrangler`).
 * - Handles SIGINT / SIGTERM / SIGHUP signals to ensure child workerd daemons are never orphaned when exiting.
 */

import { spawn, execSync } from 'node:child_process';
import process from 'node:process';

const PORT = 4321;

function killExistingPortProcess(port) {
  try {
    const stdout = execSync(`lsof -ti :${port} 2>/dev/null || true`, { encoding: 'utf8' }).trim();
    if (stdout) {
      const pids = stdout.split('\n').filter(Boolean);
      for (const pid of pids) {
        try {
          process.kill(Number(pid), 'SIGKILL');
        } catch {}
      }
    }
  } catch {}
}

// 1. Clean port before starting
killExistingPortProcess(PORT);

// 2. Build Astro server bundle
console.log('\n🚀 [1/2] Building Astro edge assets...');
try {
  execSync('pnpm exec astro build', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}

// 3. Spawn Wrangler dev server
console.log('\n⚡ [2/2] Starting Wrangler Cloudflare Workers runtime on http://localhost:4321 ...\n');
const wranglerProcess = spawn(
  'pnpm',
  [
    'exec',
    'wrangler',
    'dev',
    'dist/server/entry.mjs',
    '--config',
    'dist/server/wrangler.json',
    '--persist-to=.wrangler/state/v3',
    '--port',
    String(PORT),
  ],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

function cleanup() {
  if (wranglerProcess && !wranglerProcess.killed) {
    wranglerProcess.kill('SIGINT');
  }
  killExistingPortProcess(PORT);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
process.on('exit', cleanup);

wranglerProcess.on('close', (code) => {
  killExistingPortProcess(PORT);
  process.exit(code ?? 0);
});
