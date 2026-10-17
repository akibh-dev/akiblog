/**
 * @file islands/projects/EditorMenuBar.tsx
 * @description Application menu bar — "Zed File Edit Selection Go Run
 *              Window Help" + user avatar with a working dropdown
 *              (Settings / Keymap / Themes / Icon Themes / Extensions /
 *              Sign Out).
 *
 * POC / WHY ONLY THE AVATAR MENU WORKS: per user direction, the text
 * menus are hover-only chrome; ONLY the avatar opens a real menu, and
 * its items are actionless for now (functionality decided later).
 * Base UI Menu provides outside-click close, Esc, arrow-key navigation
 * and correct menuitem semantics for free; Portal escapes the frame's
 * overflow-hidden so the popup is never clipped.
 *
 * AVATAR: shows the real photo (/my-pic.png) layered over the "AH"
 * initials — if the image ever fails to load, onError hides it and the
 * initials remain as the fallback (no broken-image glyph).
 *
 * RESPONSIVE: menus from "selection" onward hide below sm — a real menu
 * bar overflows a phone, so it degrades to the essentials.
 */
import { Menu } from "@base-ui-components/react/menu";

const MENUS = ["Zed", "File", "Edit", "Selection", "Go", "Run", "Window", "Help"];
const USER_MENU_ITEMS = ["Settings", "Keymap", "Themes", "Icon Themes", "Extensions"];

export default function EditorMenuBar() {
  return (
    <div className="flex h-8 shrink-0 items-center gap-0.5 border-b border-line-subtle px-2 font-mono text-xs">
      {MENUS.map((m, i) => (
        <button
          key={m}
          type="button"
          className={`rounded-sm px-2 py-1 outline-none transition-colors hover:bg-control-hover focus-visible:bg-control-hover ${
            i === 0 ? "font-medium text-default" : "text-muted hover:text-subtle"
          } ${i >= 3 ? "hidden sm:block" : ""}`}
        >
          {m}
        </button>
      ))}

      {/* user avatar — the one WORKING menu (items still actionless) */}
      <div className="ml-auto">
        <Menu.Root>
          <Menu.Trigger
            aria-label="User menu"
            title="User menu"
            className="relative flex size-6 items-center justify-center overflow-hidden rounded-full bg-accent-subtle font-mono text-[9px] font-medium text-accent outline-none ring-line transition-shadow hover:ring-2 focus-visible:ring-2"
          >
            <span aria-hidden="true">AH</span>
            <img
              src="/my-pic.png"
              alt="Md Akib Hasan"
              className="absolute inset-0 size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="end" sideOffset={6}>
              <Menu.Popup className="min-w-44 rounded-md border border-line-subtle bg-surface p-1 shadow-lg">
                {USER_MENU_ITEMS.map((item) => (
                  <Menu.Item
                    key={item}
                    className="flex cursor-default select-none items-center rounded-sm px-2.5 py-1.5 font-mono text-xs text-subtle outline-none data-highlighted:bg-control-hover data-highlighted:text-default"
                  >
                    {item}
                  </Menu.Item>
                ))}
                <Menu.Separator className="mx-1 my-1 h-px bg-line-subtle" />
                <Menu.Item className="flex cursor-default select-none items-center rounded-sm px-2.5 py-1.5 font-mono text-xs text-subtle outline-none data-highlighted:bg-control-hover data-highlighted:text-default">
                  Sign Out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </div>
  );
}
