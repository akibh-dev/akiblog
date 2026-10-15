/**
 * @file islands/terminal/Terminal.tsx
 * @description Interactive portfolio shell — the hero's centerpiece.
 *
 * WHY THIS DESIGN:
 * - Commands are pure functions (see commands.ts); this component is the
 *   only stateful piece — scrollback, input draft, history pointer.
 * - `clear` mutates shell state, so it's intercepted before dispatch
 *   rather than leaking state access into the command layer.
 * - Boot text is fully static → SSR and hydration render identically.
 * - Keyboard contract: Enter run · ↑/↓ history (with draft restore) ·
 *   Tab complete · Ctrl+L clear · Ctrl+C abort line.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { applyTheme } from "../../../lib/theme";
import { buildCommands } from "./commands";
import { kv, t } from "./dsl";
import { createRegistry } from "./registry";
import type { HistoryEntry, OutputLine, PortfolioData, Segment, Tone } from "./types";

const TONE_CLASS: Record<Tone, string> = {
  default: "text-default",
  subtle: "text-subtle",
  muted: "text-muted",
  accent: "text-accent",
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-500 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
};

function Prompt() {
  return (
    <span className="mr-2 shrink-0 select-none">
      <span className="text-accent">visitor@akib35</span>
      <span className="text-muted">:~$</span>
    </span>
  );
}

function SegmentView({ segment }: { segment: Segment }) {
  const cls = TONE_CLASS[segment.tone ?? "default"];
  if (segment.href) {
    const external = !segment.href.startsWith("mailto:");
    return (
      <a
        href={segment.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${cls} underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-75`}
      >
        {segment.text}
      </a>
    );
  }
  return <span className={cls}>{segment.text}</span>;
}

/** Static boot scrollback — identical on server and client.
 *  `clear` resets to exactly this state: a fresh session. */
function bootEntries(data: PortfolioData, nextId: () => number): HistoryEntry[] {
  const mk = (segments: OutputLine): HistoryEntry => ({ id: nextId(), kind: "output", segments });
  return [
    mk([t("akib35 portfolio shell", "accent"), t(" v2.0", "muted")]),
    mk([t("──────────────────────────────────", "muted")]),
    mk([t("● ", "success"), t(data.meta.statusText, "success")]),
    mk(kv("edu", t(`B.Sc. CSE · CUET '${String(data.education.year).slice(-2)}`))),
    mk(kv("loc", t(`${data.meta.location} (${data.meta.timezone})`))),
    mk([t("type ", "muted"), t("'help'", "accent"), t(" to see what this shell can do", "muted")]),
  ];
}

export default function Terminal({ data }: { data: PortfolioData }) {
  const registry = useMemo(() => createRegistry(buildCommands()), []);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const [entries, setEntries] = useState<HistoryEntry[]>(() => bootEntries(data, nextId));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1); // -1 = editing draft
  const draftRef = useRef("");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const append = (items: HistoryEntry[]) => setEntries((prev) => [...prev, ...items]);
  /** Fresh session: wipe scrollback, re-run boot. */
  const resetToBoot = () => setEntries(bootEntries(data, nextId));
  const echo = (raw: string, extra: Segment[] = []): HistoryEntry => ({
    id: nextId(),
    kind: "command",
    segments: [t(raw), ...extra],
  });
  const out = (lines: OutputLine[]): HistoryEntry[] =>
    lines.map((segments) => ({ id: nextId(), kind: "output" as const, segments }));

  function run(raw: string) {
    const value = raw.trim();
    setInput("");
    setHistIdx(-1);
    draftRef.current = "";

    if (!value) {
      append([echo("")]);
      return;
    }

    setHistory((h) => [...h, value]);
    const [name, ...args] = value.split(/\s+/);
    const cmd = registry.lookup(name);

    if (cmd?.name === "clear") {
      resetToBoot();
      return;
    }

    if (!cmd) {
      append([
        echo(value),
        ...out([
          [t(`command not found: ${name}`, "error")],
          [t("type ", "muted"), t("'help'", "accent"), t(" to list commands", "muted")],
        ]),
      ]);
      return;
    }

    const lines = cmd.execute({ args, data, commands: registry.all, setTheme: applyTheme });
    append([echo(value), ...out(lines)]);
  }

  function navigateHistory(dir: 1 | -1) {
    if (history.length === 0) return;
    const next = Math.min(Math.max(histIdx + dir, -1), history.length - 1);
    if (next === histIdx) return;
    if (histIdx === -1) draftRef.current = input;
    setHistIdx(next);
    setInput(next === -1 ? draftRef.current : history[history.length - 1 - next]);
  }

  function complete() {
    const parts = input.split(/\s+/);
    if (parts.length > 1 || !parts[0]) return; // only complete command names
    const matches = registry.complete(parts[0]);
    if (matches.length === 1) {
      setInput(`${matches[0]} `);
    } else if (matches.length > 1) {
      append([echo(input), ...out([[t(matches.join("   "), "subtle")]])]);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") run(input);
    else if (e.key === "ArrowUp") (e.preventDefault(), navigateHistory(1));
    else if (e.key === "ArrowDown") (e.preventDefault(), navigateHistory(-1));
    else if (e.key === "Tab") (e.preventDefault(), complete());
    else if (e.ctrlKey && e.key.toLowerCase() === "l") (e.preventDefault(), resetToBoot());
    else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      append([echo(input, [t("^C", "muted")])]);
      setInput("");
      setHistIdx(-1);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-line-subtle bg-surface shadow-2xs">
      {/* window chrome — macOS traffic lights, decorative by design */}
      <div className="relative flex items-center border-b border-line-subtle px-4 py-2.5">
        <span className="flex items-center gap-2" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
          <span className="size-3 rounded-full bg-[#ffbd2e] ring-1 ring-black/10" />
          <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
        </span>
        <span className="absolute inset-x-0 text-center font-mono text-[9px] text-muted">
          visitor@akib35: ~
        </span>
      </div>

      {/* shell body — click anywhere to focus */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="h-[19rem] cursor-text overflow-y-auto px-4 py-4 font-mono text-xs leading-relaxed md:h-[21rem]"
      >
        <div role="log" aria-live="polite" className="whitespace-pre-wrap break-words">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-baseline">
              {entry.kind === "command" && <Prompt />}
              <span className="min-w-0">
                {entry.segments.map((s, i) => (
                  <SegmentView key={i} segment={s} />
                ))}
              </span>
            </div>
          ))}
        </div>

        {/* input row */}
        <div className="flex items-baseline">
          <Prompt />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal input — type a command, 'help' to begin"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            className="min-w-0 flex-1 bg-transparent text-default caret-accent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
