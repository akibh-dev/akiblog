/**
 * @file islands/ThemeSwitch.tsx
 * @description Segmented Light / Dark theme control — dark is the default.
 *
 * WHY BASE UI: ToggleGroup gives us roving-tab-index keyboard navigation,
 * correct aria-pressed semantics, and focus rings for free — the same
 * primitive delta.dev's site is built on. Styling stays 100% in our
 * Tailwind token classes; Base UI ships zero styles.
 *
 * STATE (why `null` until mounted): the anti-flash script resolves the
 * page theme before first paint, but SSR can't read localStorage — so a
 * hardcoded initial mode always flashes the WRONG pressed state for
 * users who picked the non-default theme (dark pressed → light on
 * hydration). Rendering nothing-pressed until mount shows a brief
 * neutral state instead of the wrong one; SSR and the first client
 * render agree (both null), so there is no hydration mismatch either.
 */
import { useEffect, useState } from "react";
import { ToggleGroup } from "@base-ui-components/react/toggle-group";
import { Toggle } from "@base-ui-components/react/toggle";
import { applyTheme, getStoredTheme, THEME_MODES, type ThemeMode } from "../../lib/theme";

export default function ThemeSwitch() {
  // null = not mounted yet → nothing pressed (see header rationale)
  const [mode, setMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    setMode(getStoredTheme());
  }, []);

  return (
    <ToggleGroup
      aria-label="Color theme"
      value={mode ? [mode] : []}
      onValueChange={(next) => {
        const m = (next[0] as ThemeMode | undefined) ?? mode ?? "dark"; // prevent unselecting all
        setMode(m);
        applyTheme(m);
      }}
      className="grid grid-cols-2 gap-0.5 rounded-md border border-line-subtle bg-surface p-0.5"
    >
      {THEME_MODES.map((m) => (
        <Toggle
          key={m}
          value={m}
          className="rounded-sm px-2 py-1.5 font-mono text-2xs text-muted capitalize transition-colors outline-none hover:text-default focus-visible:ring-1 focus-visible:ring-accent aria-pressed:bg-canvas aria-pressed:text-accent aria-pressed:shadow-2xs"
        >
          {m}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
