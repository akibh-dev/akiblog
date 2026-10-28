/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-terminal-registry-ts-note-1. */

import type { Command } from "./types";

export interface Registry {
  /** Canonical command list (no alias duplicates) — used by `help`. */
  all: readonly Command[];
  lookup: (name: string) => Command | undefined;
  /** Names + aliases starting with prefix, sorted, de-duplicated. */
  complete: (prefix: string) => string[];
}

export function createRegistry(commands: readonly Command[]): Registry {
  const byKey = new Map<string, Command>();
  const keys = new Set<string>();

  for (const cmd of commands) {
    for (const key of [cmd.name, ...(cmd.aliases ?? [])]) {
      byKey.set(key, cmd);
      keys.add(key);
    }
  }

  return {
    all: commands,
    lookup: (name) => byKey.get(name.toLowerCase()),
    complete: (prefix) =>
      [...keys].filter((k) => k.startsWith(prefix.toLowerCase())).sort(),
  };
}
