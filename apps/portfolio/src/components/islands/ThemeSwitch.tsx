/**
 * @file islands/ThemeSwitch.tsx
 * @description Segmented Light / Dark / System theme control.
 *
 * WHY BASE UI: ToggleGroup gives us roving-tab-index keyboard navigation,
 * correct aria-pressed semantics, and focus rings for free — the same
 * primitive delta.dev's site is built on. Styling stays 100% in our
 * Tailwind token classes; Base UI ships zero styles.
 */
import { useEffect, useState } from "react";
import { ToggleGroup } from "@base-ui-components/react/toggle-group";
import { Toggle } from "@base-ui-components/react/toggle";
import { applyTheme, getStoredTheme, THEME_MODES, type ThemeMode } from "../../lib/theme";

export default function ThemeSwitch() {
  // "system" until hydration reads localStorage — markup matches SSR either way
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    setMode(getStoredTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <ToggleGroup
      aria-label="Color theme"
      value={[mode]}
      onValueChange={(next) => {
        const m = (next[0] as ThemeMode | undefined) ?? mode; // prevent unselecting all
        setMode(m);
        applyTheme(m);
      }}
      className="grid grid-cols-3 gap-0.5 rounded-md border border-line-subtle bg-surface p-0.5"
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
