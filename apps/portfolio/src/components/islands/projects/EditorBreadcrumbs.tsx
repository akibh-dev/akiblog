/**
 * @file islands/projects/EditorBreadcrumbs.tsx
 * @description Breadcrumb fixed row: path segments on the left, file
 *              actions on the right (search / inline assist / code action /
 *              settings) — all actionless chrome for now.
 *
 * POC / LAYOUT (per user direction, matching Zed):
 *   akib35 › projects › {group} › {file}     [search] [✨] [💡] [⚙]
 * Segments are intentionally NOT links (read-only workspace metaphor);
 * the active file segment is emphasized like Zed does. The row is only
 * rendered when a buffer is open (the workspace guards it), so `file`
 * is required again.
 */
import { Fragment } from "react";
import { ChevronIcon, LightbulbIcon, SearchIcon, SettingsIcon, SparklesIcon } from "./icons";
import ChromeButton from "./ChromeButton";
import type { ProjectFile } from "./types";

interface Props {
  file: ProjectFile;
}

export default function EditorBreadcrumbs({ file }: Props) {
  const segments = ["akib35", "projects", file.group, file.file];
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-8 shrink-0 items-center border-b border-line-subtle px-4 font-mono text-2xs whitespace-nowrap text-muted"
    >
      {/* path — scrolls if it overflows, icons never get pushed out */}
      <span className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {segments.map((segment, i) => (
          <Fragment key={segment}>
            {i > 0 && <ChevronIcon className="size-2.5 shrink-0 opacity-60" />}
            <span className={i === segments.length - 1 ? "text-default" : undefined}>
              {segment}
            </span>
          </Fragment>
        ))}
      </span>

      {/* file actions — actionless for now */}
      <span className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
        <ChromeButton label="Search in file">
          <SearchIcon className="size-3" />
        </ChromeButton>
        <ChromeButton label="Inline assist">
          <SparklesIcon className="size-3" />
        </ChromeButton>
        <ChromeButton label="Code actions">
          <LightbulbIcon className="size-3" />
        </ChromeButton>
        <ChromeButton label="File settings">
          <SettingsIcon className="size-3" />
        </ChromeButton>
      </span>
    </nav>
  );
}
