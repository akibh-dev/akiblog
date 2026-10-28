#!/usr/bin/env bun
/* For more details, see docs/blog/implementation-notes.md#scripts-sync-content-ts-note-1. */
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
