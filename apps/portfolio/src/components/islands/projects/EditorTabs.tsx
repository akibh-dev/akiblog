/**
 * @file islands/projects/EditorTabs.tsx
 * @description Multi-buffer tab bar — the "file name" fixed row.
 *
 * POC / LAYOUT (per user direction, matching Zed):
 *   [←] [→]  |  [tab] [tab] [tab…]  |  [+] [split] [fullscreen]
 * - History arrows are WIRED: the workspace keeps a bounded deque of
 *   visited buffers; the arrows walk it and are disabled (dimmed,
 *   non-interactive) at the start/end of the deque.
 * - Middle: every open buffer gets a tab (focus body + working × close).
 * - Right: new / split / fullscreen — actionless chrome for now.
 * - The whole row is INVISIBLE when no buffer is open (handled by the
 *   workspace, which only renders this component when a file is active).
 *
 * WHY NOT Base UI Tabs HERE: the tree (ProjectPanel) already owns the
 * Tabs.List semantics for the preview panels (arrow-key nav + aria
 * wiring). This bar is a second *view* onto the same controlled state, so
 * it uses plain buttons calling the workspace's setActiveTab/closeTab —
 * two competing tablists controlling the same panels would confuse AT.
 */
import { ArrowLeftIcon, ArrowRightIcon, FileIcon, MaximizeIcon, PlusIcon, SplitIcon, XIcon } from "./icons";
import ChromeButton from "./ChromeButton";
import { STATUS_META, type ProjectFile } from "./types";

interface Props {
  openFiles: ProjectFile[];
  activeTabId: string;
  onTabFocus: (id: string) => void;
  onTabClose: (id: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

export default function EditorTabs({
  openFiles,
  activeTabId,
  onTabFocus,
  onTabClose,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: Props) {
  return (
    <div className="flex h-9 shrink-0 items-stretch border-b border-line-subtle">
      {/* buffer history — wired to the workspace's navigation deque;
          disabled at the start/end of the deque */}
      <div className="flex items-center gap-0.5 border-r border-line-subtle px-1.5">
        <ChromeButton label="Go back" disabled={!canGoBack} onClick={onBack}>
          <ArrowLeftIcon className="size-3" />
        </ChromeButton>
        <ChromeButton label="Go forward" disabled={!canGoForward} onClick={onForward}>
          <ArrowRightIcon className="size-3" />
        </ChromeButton>
      </div>

      {/* open buffers */}
      <div aria-label="Open buffers" className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto">
        {openFiles.map((file) => {
          const isActive = file.id === activeTabId;
          const meta = STATUS_META[file.status];
          return (
            <div
              key={file.id}
              className={`group flex min-w-0 shrink-0 items-center gap-1.5 border-r border-line-subtle pr-1.5 pl-3 font-mono text-xs transition-colors ${
                isActive
                  ? "bg-canvas text-default"
                  : "text-muted hover:bg-control-hover/40 hover:text-subtle"
              }`}
            >
              {/* tab body — focuses the buffer */}
              <button
                type="button"
                onClick={() => onTabFocus(file.id)}
                aria-current={isActive}
                title={file.file}
                className="flex min-w-0 items-center gap-2 py-1 outline-none"
              >
                <FileIcon className="size-3 shrink-0 text-muted" />
                <span className="truncate">{file.file}</span>
                {meta.dirty && (
                  <span
                    role="img"
                    aria-label={`status: ${meta.label}`}
                    className={`size-1.5 shrink-0 rounded-full ${meta.dotClass}`}
                  />
                )}
              </button>

              {/* close */}
              <button
                type="button"
                onClick={() => onTabClose(file.id)}
                aria-label={`Close ${file.file}`}
                className="rounded-sm p-0.5 text-muted outline-none transition-colors hover:bg-control-hover hover:text-default focus-visible:bg-control-hover"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* pane actions — actionless for now */}
      <div className="hidden items-center gap-0.5 border-l border-line-subtle px-1.5 sm:flex">
        <ChromeButton label="New file">
          <PlusIcon className="size-3" />
        </ChromeButton>
        <ChromeButton label="Split pane">
          <SplitIcon className="size-3" />
        </ChromeButton>
        <ChromeButton label="Fullscreen">
          <MaximizeIcon className="size-3" />
        </ChromeButton>
      </div>
    </div>
  );
}
