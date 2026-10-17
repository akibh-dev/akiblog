/**
 * @file islands/projects/ChromeButton.tsx
 * @description Shared icon button for the editor chrome.
 *
 * POC / STATES: buttons are actionless BY DEFAULT (functionality decided
 * per-feature), but two real states exist for the buttons that ARE wired:
 * - `disabled` — e.g. history arrows at the start/end of the deque:
 *   dimmed and non-interactive ("active/inactive based on the situation").
 * - `pressed` — toggle buttons (sidebar toggle): renders aria-pressed and
 *   a persistent active fill so the state is visible without a tooltip.
 *
 * BOX: icon-only buttons share one fixed box — `h-5 w-5` with
 * `leading-none` — identical to the status bar's text-item height, so
 * icons and text sit on the same center line in every chrome row.
 */
import type { ReactNode } from "react";

interface Props {
  label: string; // tooltip + accessible name
  children: ReactNode; // the icon
  onClick?: () => void; // optional — unwired chrome is a no-op
  className?: string;
  disabled?: boolean;
  pressed?: boolean;
}

export default function ChromeButton({
  label,
  children,
  onClick,
  className = "",
  disabled = false,
  pressed,
}: Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm leading-none text-muted outline-none transition-colors hover:bg-control-hover hover:text-default focus-visible:bg-control-hover disabled:pointer-events-none disabled:opacity-40 ${
        pressed ? "bg-control-hover/60 text-default" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
