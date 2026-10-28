#!/usr/bin/env bun
/* For more details, see docs/blog/implementation-notes.md#scripts-dev-ts-note-1. */
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
