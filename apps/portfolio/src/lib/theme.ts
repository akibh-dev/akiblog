/**
 * @file lib/theme.ts
 * @description Single typed source of truth for theme state.
 *
 * WHY: Both <ThemeSwitch> (Base UI island) and the terminal's `theme`
 * command need identical apply/read/validate logic. Extracting it here
 * keeps one implementation, and the `isThemeMode` type guard gives
 * commands compile-time + runtime safety on user input.
 */

export type ThemeMode = "light" | "dark" | "system";

export const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"] as const;

const STORAGE_KEY = "theme";

/** Runtime guard that narrows arbitrary user input to ThemeMode. */
export function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value);
}

/** Apply a theme to <html> and persist it. Client-only. */
export function applyTheme(mode: ThemeMode): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    mode === "dark" || (mode === "system" && prefersDark),
  );
  localStorage.setItem(STORAGE_KEY, mode);
}

/** Read the persisted theme, falling back to "system" on garbage data. */
export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null && isThemeMode(stored) ? stored : "system";
}
