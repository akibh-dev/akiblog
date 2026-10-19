/**
 * @file islands/MobileMenu.tsx
 * @description Mobile navigation drawer built on Base UI Dialog.
 *
 * WHY BASE UI DIALOG: focus trap, Esc-to-close, backdrop light-dismiss,
 * scroll-locking and aria-modal are all handled — behavior that took
 * hand-rolled JS + popover hacks before. `Dialog.Close render={<a/>}`
 * merges close-on-nav into the anchor itself: one element, both jobs.
 */
import { Dialog } from "@base-ui-components/react/dialog";
import ThemeSwitch from "./ThemeSwitch";

export interface MenuSection {
  id: string;
  label: string;
  number: string;
}

interface Props {
  sections: MenuSection[];
  brand: string;
}

export default function MobileMenu({ sections, brand }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md border border-line-subtle bg-canvas px-3 py-1.5 font-mono text-2xs text-subtle transition-colors outline-none hover:text-default focus-visible:ring-1 focus-visible:ring-accent">
        Menu
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-canvas/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-x-3 top-[calc(var(--site-inset-top)+var(--site-header-height)+0.5rem)] z-50 rounded-md border border-line-subtle bg-canvas shadow-lg outline-none">
          <Dialog.Title className="sr-only">{brand} — navigation</Dialog.Title>

          <nav aria-label="Mobile">
            <ul className="p-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <Dialog.Close
                    render={<a href={`#${s.id}`} />}
                    className="flex items-center gap-3 rounded-md px-4 py-3 font-mono text-sm text-default transition-colors outline-none hover:bg-surface focus-visible:bg-surface"
                  >
                    <span className="text-2xs text-muted">{s.number}.</span>
                    {s.label}
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-line-subtle p-3">
            <ThemeSwitch />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
