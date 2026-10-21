/**
 * @file islands/CopyButton.tsx
 * @description Clipboard button with transient feedback. Plain React —
 *              no Base UI primitive needed for a single button.
 *              Styling: site-wide default button (global.css `btn`); the
 *              "Copied!" state holds the hover look (`btn-hover`) for 2s.
 *              Legacy React island — restyled only; migration per plan17.
 */
import { useRef, useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="btn rounded-sm px-3 py-1.5 font-mono text-2xs data-[ok=true]:btn-hover data-[ok=true]:text-accent"
      data-ok={state === "copied"}
    >
      {state === "copied" ? "Copied!" : state === "failed" ? "Failed" : "Copy"}
    </button>
  );
}
