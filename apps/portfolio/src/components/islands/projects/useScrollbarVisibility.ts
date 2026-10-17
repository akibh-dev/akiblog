/**
 * @file islands/projects/useScrollbarVisibility.ts
 * @description Reveal the IDE scrollbar only while the user is scrolling.
 *
 * POC / WHY JS (not pure CSS): CSS can style a scrollbar but cannot know
 * WHEN scrolling is happening — there is no :scrolling pseudo-class. The
 * hook sets a `data-scrolling` attribute on the container on every scroll
 * event and removes it ~700ms after the last one; the `zed-scroll`
 * utility (global.css) renders a transparent thumb by default and paints
 * it only while the attribute is present. Passive listener + timeout
 * cleanup = zero layout work per event, no re-renders.
 */
import { useEffect, useRef } from "react";

const HIDE_DELAY_MS = 700;

export function useScrollbarVisibility<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: number | undefined;
    const reveal = () => {
      el.setAttribute("data-scrolling", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.removeAttribute("data-scrolling"), HIDE_DELAY_MS);
    };

    el.addEventListener("scroll", reveal, { passive: true });
    return () => {
      el.removeEventListener("scroll", reveal);
      window.clearTimeout(timer);
    };
  }, []);

  return ref;
}
