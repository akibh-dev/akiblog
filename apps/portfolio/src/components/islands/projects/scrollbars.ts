/**
 * @file islands/projects/scrollbars.ts
 * @description Vanilla port of useScrollbarVisibility.ts — identical
 *              behavior: set `data-scrolling` on scroll, remove it 700ms
 *              after the last event; the `zed-scroll` utility paints the
 *              thumb only while the attribute is present.
 *
 * WHY A FUNCTION (not a hook): the island no longer re-renders — the
 * listener attaches once at mount. Passive listener + timeout = zero
 * layout work per event, same as the React version.
 */
const HIDE_DELAY_MS = 700;

export function attachScrollbarReveal(el: HTMLElement) {
  let timer: number | undefined;
  el.addEventListener(
    "scroll",
    () => {
      el.setAttribute("data-scrolling", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.removeAttribute("data-scrolling"), HIDE_DELAY_MS);
    },
    { passive: true }
  );
}
