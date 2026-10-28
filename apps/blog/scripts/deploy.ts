#!/usr/bin/env bun
/* For more details, see docs/blog/implementation-notes.md#scripts-deploy-ts-note-1. */
import { $ } from "bun";

const repo = process.env.GH_REPO ?? "akibh-dev/akiblog";
const workflow = "blog-deploy.yml";
const notesDir = new URL("../../../../notes", import.meta.url).pathname;

// CI publishes what's PUSHED to the notes repo — say so if local is ahead
const ahead = await $`git -C ${notesDir} rev-list --count @{u}..HEAD`.nothrow().quiet().text();
if (Number(ahead.trim()) > 0) {
  console.warn(`⚠ ../notes has ${ahead.trim()} unpushed commit(s) — CI deploys the pushed notes only. Push them first.`);
}

const startedAt = new Date().toISOString();
console.log(`▶ triggering ${workflow} on ${repo} (ref main)…`);
await $`gh workflow run ${workflow} --ref main -R ${repo}`;

// the run appears a moment after dispatch — poll for one created after us
let runId = "";
for (let i = 0; i < 20 && !runId; i++) {
  await Bun.sleep(1500);
  runId = (
    await $`gh run list -R ${repo} --workflow ${workflow} --event workflow_dispatch --limit 1 --json databaseId,createdAt -q ${`.[] | select(.createdAt >= "${startedAt.slice(0, 19)}") | .databaseId`}`
      .nothrow()
      .quiet()
      .text()
  ).trim();
}
if (!runId) {
  console.error(`✖ couldn't find the new run — check https://github.com/${repo}/actions`);
  process.exit(1);
}
console.log(`… watching run ${runId}: https://github.com/${repo}/actions/runs/${runId}`);
const res = await $`gh run watch ${runId} -R ${repo} --exit-status`.nothrow();
process.exit(res.exitCode);
