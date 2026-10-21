/**
 * @file islands/terminal/registry.ts
 * @description Command lookup + completion over the command list.
 *
 * A Map keyed by every name AND alias gives O(1) lookup; completion
 * operates over the de-duplicated key set.
 */

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
