/**
 * @file islands/terminal/shell.ts
 * @description The shell's stateful core — replaces Terminal.tsx's React
 *              state (scrollback, input draft, history pointer) with a
 *              vanilla mount function.
 *
 * POC / WHY DIRECT DATA IMPORT (not a JSON script island): the terminal
 * is single-purpose — Hero always passes `portfolioData`, and
 * `PortfolioData = typeof portfolioData` (types.ts) makes the import
 * type-identical to the prop. Importing here skips HTML-embedded JSON,
 * the \u003c escaping dance and the runtime parse. SSR (Terminal.astro)
 * still renders boot from the prop; both read the same module, so they
 * cannot diverge.
 *
 * KEYBOARD CONTRACT (unchanged): Enter run · ↑/↓ history (draft restore)
 * · Tab complete · Ctrl+L clear · Ctrl+C abort line.
 *
 * DOCUMENTED DEVIATION from the React version: Ctrl+C now also resets
 * the draft (the React version left draftRef stale, so ↑→Ctrl+C→↓ could
 * resurrect pre-abort text). Resetting is the saner fresh-line semantic.
 */
import { portfolioData } from "../../../data/portfolio";
import { applyTheme } from "../../../lib/theme";
import { bootEntries } from "./boot";
import { buildCommands } from "./commands";
import { t } from "./dsl";
import { createRegistry } from "./registry";
import { renderEntry } from "./render";
import type { HistoryEntry, OutputLine, PortfolioData, Segment } from "./types";

export function mountTerminal(root: HTMLElement) {
  // blog posts are build-time API data, delivered on the element by
  // Terminal.astro (data-blog-posts); everything else is the static module
  const blogPosts = JSON.parse(root.dataset.blogPosts ?? "[]") as PortfolioData["blogPosts"];
  const data: PortfolioData = { ...portfolioData, blogPosts };
  const scroller = root.querySelector<HTMLElement>("[data-scroller]")!;
  const log = root.querySelector<HTMLElement>("[data-log]")!;
  const input = root.querySelector<HTMLInputElement>("[data-input]")!;

  const registry = createRegistry(buildCommands());

  let id = 0;
  const nextId = () => ++id;
  const history: string[] = [];
  let histIdx = -1; // -1 = editing draft
  let draft = "";

  const append = (items: HistoryEntry[]) => {
    log.append(...items.map(renderEntry));
    scroller.scrollTop = scroller.scrollHeight;
  };
  const resetToBoot = () => {
    log.replaceChildren();
    append(bootEntries(data, nextId));
  };
  const echo = (raw: string, extra: Segment[] = []): HistoryEntry => ({
    id: nextId(),
    kind: "command",
    segments: [t(raw), ...extra],
  });
  const out = (lines: OutputLine[]): HistoryEntry[] =>
    lines.map((segments) => ({ id: nextId(), kind: "output" as const, segments }));

  const resetInput = () => {
    input.value = "";
    histIdx = -1;
    draft = "";
  };

  function run(raw: string) {
    const value = raw.trim();
    resetInput();

    if (!value) return append([echo("")]);

    history.push(value);
    const [name, ...args] = value.split(/\s+/);
    const cmd = registry.lookup(name);

    if (cmd?.name === "clear") return resetToBoot();

    if (!cmd) {
      return append([
        echo(value),
        ...out([
          [t(`command not found: ${name}`, "error")],
          [t("type ", "muted"), t("'help'", "accent"), t(" to list commands", "muted")],
        ]),
      ]);
    }

    const lines = cmd.execute({ args, data, commands: registry.all, setTheme: applyTheme });
    append([echo(value), ...out(lines)]);
  }

  function navigateHistory(dir: 1 | -1) {
    if (history.length === 0) return;
    const next = Math.min(Math.max(histIdx + dir, -1), history.length - 1);
    if (next === histIdx) return;
    if (histIdx === -1) draft = input.value;
    histIdx = next;
    input.value = next === -1 ? draft : history[history.length - 1 - next];
  }

  function complete() {
    const parts = input.value.split(/\s+/);
    if (parts.length > 1 || !parts[0]) return; // only complete command names
    const matches = registry.complete(parts[0]);
    if (matches.length === 1) {
      input.value = `${matches[0]} `;
    } else if (matches.length > 1) {
      append([echo(input.value), ...out([[t(matches.join("   "), "subtle")]])]);
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run(input.value);
    else if (e.key === "ArrowUp") (e.preventDefault(), navigateHistory(1));
    else if (e.key === "ArrowDown") (e.preventDefault(), navigateHistory(-1));
    else if (e.key === "Tab") (e.preventDefault(), complete());
    else if (e.ctrlKey && e.key.toLowerCase() === "l") (e.preventDefault(), resetToBoot());
    else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      append([echo(input.value, [t("^C", "muted")])]);
      resetInput();
    }
  });

  // click anywhere in the shell body to focus
  scroller.addEventListener("click", () => input.focus());
}
