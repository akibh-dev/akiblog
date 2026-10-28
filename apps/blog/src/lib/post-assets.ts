/* For more details, see docs/blog/implementation-notes.md#src-lib-post-assets-ts-note-1. */
import type { AstroIntegration } from "astro";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const POSTS = resolve(process.cwd(), "src/content/posts");

const TYPES: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
  ".avif": "image/avif", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json", ".zip": "application/zip", ".mp4": "video/mp4", ".webm": "video/webm",
};

/** slug → { folder, files[] } for every post folder under src/content/posts */
function scan(): Map<string, { dir: string; files: string[] }> {
  const map = new Map<string, { dir: string; files: string[] }>();
  if (!existsSync(POSTS)) return map;
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
    }
    const index = join(dir, "index.md");
    if (!existsSync(index)) return;
    const fm = /^---\n([\s\S]*?)\n---/.exec(readFileSync(index, "utf8"))?.[1] ?? "";
    const slug = /^slug:\s*["']?([a-z0-9-]+)["']?\s*$/m.exec(fm)?.[1] ?? dir.split("/").pop()!;
    const files = readdirSync(dir).filter((f) => !f.startsWith(".") && extname(f) !== ".md" && statSync(join(dir, f)).isFile());
    if (files.length) map.set(slug, { dir, files });
  };
  walk(POSTS);
  return map;
}

export default function postAssets(): AstroIntegration {
  return {
    name: "akiblog:post-assets",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const m = /^\/([a-z0-9-]+)\/([^/?#]+)$/.exec(decodeURIComponent((req.url ?? "").split("?")[0]));
          const hit = m && scan().get(m[1]);
          if (!m || !hit || !hit.files.includes(m[2])) return next();
          res.setHeader("Content-Type", TYPES[extname(m[2]).toLowerCase()] ?? "application/octet-stream");
          createReadStream(join(hit.dir, m[2])).pipe(res);
        });
      },
      "astro:build:done": ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        let n = 0;
        for (const [slug, { dir: src, files }] of scan()) {
          mkdirSync(join(out, slug), { recursive: true });
          for (const f of files) {
            copyFileSync(join(src, f), join(out, slug, f));
            n++;
          }
        }
        logger.info(`copied ${n} co-located post file(s) to /<slug>/`);
      },
    },
  };
}
