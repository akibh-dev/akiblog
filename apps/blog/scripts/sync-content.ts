#!/usr/bin/env bun
/**
 * @file scripts/sync-content.ts
 * @description Copies posts from the notes repo into the blog's content
 *              collection: <NOTES_DIR>/content/** → src/content/posts/**.
 *
 * WHY COPY (not point Astro at ../notes directly) — plan19 §1:
 * - Vite's fs.allow + the image pipeline expect files inside the project
 *   root; relative images (`./github-up-time.png`) next to an index.md
 *   outside it break.
 * - Reproducible builds: the log line names the exact notes commit that
 *   was copied (CI also puts it in the Pages deploy message).
 * - One place that decides what is content: only `content/` is copied;
 *   Jekyll files (_layouts, _includes, index.md, _config.yml) never reach
 *   the blog.
 *
 * The notes repo is READ-ONLY here (plan20 §2) — this script never writes
 * to NOTES_DIR.
 *
 * USAGE
 *   bun scripts/sync-content.ts            one-shot sync (build, CI)
 *   bun scripts/sync-content.ts --watch    sync, then re-sync on every change
 *                                          (used by `bun run dev:blog`)
 *   NOTES_DIR=.notes bun scripts/…         CI checkout location
 *   --require                              fail if NOTES_DIR is missing (CI)
 *
 * WATCH MODE: a full re-sync per change (debounced). The notes tree is
 * small (a few MB), so mirroring it whole is simpler and can't drift,
 * unlike incremental copying (renames/deletes). Astro's dev server watches
 * src/content/ and hot-reloads the affected pages.
 */
import { cpSync, existsSync, mkdirSync, rmSync, watch } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const notesDir = resolve(appDir, process.env.NOTES_DIR ?? "../../../notes");
const sourceDir = join(notesDir, "content");
const destDir = join(appDir, "src/content/posts");

const args = new Set(process.argv.slice(2));
const log = (msg: string) => console.log(`[sync-content] ${msg}`);

/** git metadata of the notes checkout; empty values if it isn't a git repo */
function notesRevision() {
  const git = (...a: string[]) => {
    try {
      return execFileSync("git", ["-C", notesDir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {
      return "";
    }
  };
  return {
    sha: git("rev-parse", "HEAD"),
    dirty: git("status", "--porcelain", "--", "content").length > 0,
  };
}

function sync() {
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });

  if (!existsSync(sourceDir)) {
    const msg = `notes content not found at ${sourceDir} (set NOTES_DIR)`;
    if (args.has("--require")) {
      console.error(`[sync-content] ✖ ${msg}`);
      process.exit(1);
    }
    log(`⚠ ${msg} — building with zero posts`);
  } else {
    // skip dotfiles (.DS_Store, editor swap files) — everything else is content
    cpSync(sourceDir, destDir, {
      recursive: true,
      filter: (src) => !src.slice(sourceDir.length).split("/").some((part) => part.startsWith(".")),
    });
  }

  const rev = notesRevision();
  log(`✔ ${sourceDir} → src/content/posts${rev.sha ? ` (notes@${rev.sha.slice(0, 7)}${rev.dirty ? ", uncommitted changes" : ""})` : ""}`);
}

sync();

if (args.has("--watch") && existsSync(sourceDir)) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(sourceDir, { recursive: true }, (_event, file) => {
    if (file && file.split("/").some((part) => part.startsWith("."))) return;
    clearTimeout(timer);
    timer = setTimeout(sync, 150);
  });
  log(`watching ${sourceDir} for changes…`);
}
