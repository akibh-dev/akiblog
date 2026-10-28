/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-projects-scrollbars-ts-note-1. */
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
