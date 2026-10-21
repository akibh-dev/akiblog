#!/usr/bin/env bun
/**
 * @file scripts/dev.ts
 * @description `bun run dev:blog` entry: live notes sync + Astro dev server
 *              in ONE terminal, one Ctrl+C.
 *
 * WHY A SCRIPT (not `a & b` in package.json): `bun --filter` runs scripts
 * through its own shell; backgrounding with `&` leaves an orphaned watcher
 * when the dev server exits. Spawning both here ties their lifetimes
 * together: if either dies, the other is stopped, and Ctrl+C reaches both.
 *
 * Flow:
 *   1. sync-content --watch   copies ../notes/content → src/content/posts,
 *                             then re-syncs on every save in ../notes
 *   2. astro dev              serves http://localhost:4321 and hot-reloads
 *                             when src/ or src/content/ changes
 * Extra args are forwarded to astro (e.g. `bun run dev -- --port 4400`).
 */
import { spawn } from "bun";

const sync = spawn(["bun", "scripts/sync-content.ts", "--watch"], { stdout: "inherit", stderr: "inherit" });
// give the first sync a moment so astro starts with content in place
await Bun.sleep(400);
const astro = spawn(["bunx", "astro", "dev", "--port", "4321", "--host", ...process.argv.slice(2)], {
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

const stop = () => {
  sync.kill();
  astro.kill();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await Promise.race([sync.exited, astro.exited]);
stop();
