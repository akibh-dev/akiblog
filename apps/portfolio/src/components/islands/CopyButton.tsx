/**
 * @file islands/CopyButton.tsx
 * @description Clipboard button with transient feedback. Plain React —
 *              no Base UI primitive needed for a single button.
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
      className="rounded-sm border border-line-subtle bg-canvas px-3 py-1.5 font-mono text-2xs text-subtle transition-colors outline-none hover:border-accent hover:text-accent focus-visible:ring-1 focus-visible:ring-accent data-[ok=true]:border-accent data-[ok=true]:text-accent"
      data-ok={state === "copied"}
    >
      {state === "copied" ? "Copied!" : state === "failed" ? "Failed" : "Copy"}
    </button>
  );
}
