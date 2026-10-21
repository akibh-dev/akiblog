# Portfolio Icon Set

Custom, hand-drawn stroke icons for the portfolio — designed to match the
delta.dev-inspired theme in `src/styles/global.css`.

## Why `src/icons/` (Astro components) instead of `public/icons/` (SVG files)?

| Concern | `public/*.svg` + `<img>` | `src/icons/*.astro` (this set) |
| --- | --- | --- |
| Dark/light theming | ❌ static colors baked in | ✅ `currentColor` inherits theme tokens |
| Hover/accent states | ❌ impossible | ✅ `group-hover:text-accent` just works |
| Network requests | 1 per icon | 0 — inlined at build time |
| Tree-shaking | ❌ | ✅ only used icons ship |
| Type safety / props | ❌ | ✅ `class`, `title`, any SVG attr |

Use `public/` only for assets that need a stable external URL (favicons, OG
images, `akib_s_resume.pdf`…). UI icons belong in components.

## Design contract

- **24×24 grid**, stroke-only: `stroke-width: 1.8`, round caps & joins.
- **`currentColor` everywhere** — zero hardcoded colors. This is what makes
  dark/light automatic: the icon takes the text color of its parent, and the
  `.dark` class flips the semantic tokens (`--ui-text`, `--ui-text-muted`,
  `--ui-accent`) from `global.css`.
- Filled accent dots (eyes, nucleus, pulse) use `fill="currentColor"` so they
  follow the same rule.
- Every icon wraps `IconBase.astro`, which owns the shared `<svg>` shell and
  accessibility behavior.

## Usage

```astro
---
import { GitHubIcon, DockerIcon, TypeScriptIcon } from "../../icons";
---

<!-- decorative (aria-hidden automatically) -->
<GitHubIcon class="size-4 text-subtle transition-colors group-hover:text-accent" />

<!-- standalone link: pass `title` for an accessible label -->
<a href="https://github.com/akibh-dev" aria-label="GitHub profile">
  <GitHubIcon class="size-5 text-default" title="GitHub" />
</a>

<!-- skill pill with icon -->
<li class="flex items-center gap-1.5 rounded-sm border border-line-subtle px-2.5 py-1.5 font-mono text-2xs text-subtle hover:border-accent hover:text-default">
  <DockerIcon class="size-3.5" />
  Docker
</li>
```

Any extra attribute is forwarded to the `<svg>` (e.g. `stroke-width={2}`,
`width`, `height`, `data-*`), overriding the defaults.

### Works in both themes — nothing to do

```html
<!-- light: renders in --delta-neutral-950 (near-black)
     dark:  renders in near-white — same markup -->
<TypeScriptIcon class="size-4 text-default" />
```

Verify live: `bun run dev` → http://localhost:4322/icons (built-in gallery
with a light/dark toggle).

## Inventory (82 exports · 81 unique glyphs — `SqlIcon` aliases `Database`)

| Group | Icons |
| --- | --- |
| `social/` | GitHub, LinkedIn, X, Facebook, Mail, Rss |
| `lang/` | C, Cpp, Python, TypeScript, JavaScript, Go, Java, Rust (+ `SqlIcon` alias) |
| `tech/` | AstroIcon, React, Django, NodeJs, Flutter, Tailwind, Cloudflare, Database, Bucket, Docker, PostgreSql, Linux, Git, Sqlite, Redis, Kubernetes, Graphql, Terminal, Markdown, Vim, Bun, Vercel, Aws, Gcp, MongoDb |
| `concept/` | Api, WebSocket, Shield (Zero-Trust), Layers (Clean Arch), Tdd, Key (SSH/Auth), Lambda (Serverless), WebSecurity, Certificate, GradCap, Bug (Sec Testing/QA), DevOps (CI-CD), Network, Microservices |
| `platform/` | LeetCode, Codeforces, HackerRank, AtCoder |
| `ui/` | Folder, ChevronRight, FileText, Close, GitBranch, Check, Warning, ArrowLeft, ArrowRight, Plus, SplitPane, Maximize, Search, Sparkles, Lightbulb, Settings, PanelLeftClose, Users, Outline, Braces, MessageSquare, Bot, TerminalPrompt, Copilot |

**Using icons in React islands?** `.astro` components can't be imported in
`.tsx`. The `ui/` glyphs are mirrored as React components in
`src/components/islands/projects/icons.tsx` — same path data, same contract.
If you add a ui glyph that an island needs, mirror it there.

**Want to draw your own?** See [GUIDE.md](./GUIDE.md) — the full creation
manual: SVG path math, arc recipes, design process, pattern library, QA
checklist.

## Adding a new icon

Read **[GUIDE.md](./GUIDE.md)** first. Short version:

1. Create `src/icons/<group>/<Name>.astro` wrapping `IconBase.astro`.
2. Draw on the 24×24 grid (live area 2→22), strokes only, `currentColor`.
3. Export it from `src/icons/index.ts` with the `Icon` suffix.
4. Check it in `/icons` in both themes, then run the QA checklist in the guide.
