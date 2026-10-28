/* For more details, see docs/portfolio/implementation-notes.md#src-lib-theme-ts-note-1. */

export type ThemeMode = "light" | "dark";

export const THEME_MODES: readonly ThemeMode[] = ["light", "dark"] as const;

const STORAGE_KEY = "theme";
const DEFAULT_THEME: ThemeMode = "dark";

/** Runtime guard that narrows arbitrary user input to ThemeMode. */
export function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value);
}

/** Apply a theme to <html> and persist it. Client-only. */
export function applyTheme(mode: ThemeMode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem(STORAGE_KEY, mode);
}

/** Read the persisted theme, falling back to dark on missing/garbage data. */
export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null && isThemeMode(stored) ? stored : DEFAULT_THEME;
}
