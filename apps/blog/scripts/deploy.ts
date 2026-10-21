#!/usr/bin/env bun
/**
 * @file scripts/deploy.ts
 * @description `bun run deploy:blog` — publish the blog with the newest
 *              notes, by triggering the CI workflow (plan20 §3). Nothing
 *              is built or uploaded from this machine: one deploy path,
 *              one set of Cloudflare credentials (GitHub secrets).
 *
 * WHY TRIGGER CI (not `wrangler pages deploy` locally): CI checks out the
 * notes repo at its pushed HEAD, so what goes live is exactly what's on
 * GitHub — not whatever happens to be uncommitted in ../notes. Code
 * changes still deploy on push to main; this command covers "I pushed a
 * new note".
 *
 * WHY -R <repo>: this repo's `origin` is the Forgejo instance
 * (the self-hosted Forgejo instance); GitHub is the push mirror that runs Actions, so `gh`
 * can't infer it from the remotes. Override with GH_REPO=owner/name.
 *
 * Flow: warn if ../notes has unpushed commits → `gh workflow run` →
 * find the new run → `gh run watch` (exit code = run result).
 *
 * Requires: gh CLI logged in (`gh auth login`) with access to the repo.
 */
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
