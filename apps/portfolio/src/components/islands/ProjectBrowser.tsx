/**
 * @file islands/ProjectBrowser.tsx
 * @description Zed-IDE-style project browser: a file-list on the left,
 *              detail pane on the right — real tab switching, not anchors.
 *
 * WHY BASE UI TABS: vertical orientation + arrow-key navigation +
 * aria tablist semantics are built in. The previous anchor-stack version
 * couldn't actually "switch" projects; this behaves like an editor.
 *
 * Data arrives as plain JSON props from Astro (serializable), so the whole
 * panel renders in typed TSX.
 */
import { Tabs } from "@base-ui-components/react/tabs";

export interface ProjectItem {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  status: "active" | "shipped" | "wip";
}

interface Props {
  projects: ProjectItem[];
  repoUrl?: string;
}

const tabClass =
  "group flex w-full items-center gap-2.5 border-l-2 border-transparent px-5 py-2.5 text-left transition-colors outline-none hover:bg-surface focus-visible:bg-surface aria-selected:border-accent aria-selected:bg-surface";

export default function ProjectBrowser({ projects, repoUrl }: Props) {
  return (
    <Tabs.Root
      defaultValue="0"
      orientation="vertical"
      className="grid lg:grid-cols-[minmax(12rem,1fr)_minmax(0,3fr)]"
    >
      {/* ── file list ─────────────────────────────────────────── */}
      <div className="border-b border-line-subtle lg:border-r lg:border-b-0">
        <div className="lg:sticky lg:top-[var(--site-content-top)]">
          <Tabs.List
            aria-label="Projects"
            className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:py-3 lg:px-0"
          >
            {projects.map((p, i) => (
              <Tabs.Tab key={p.title} value={String(i)} className={tabClass}>
                <svg
                  className="size-3.5 shrink-0 text-muted transition-colors group-aria-selected:text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  />
                </svg>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-xs whitespace-nowrap text-default lg:whitespace-normal">
                    {p.title}
                  </span>
                  <span className="hidden font-mono text-[9px] text-muted lg:block">[{p.status}]</span>
                </span>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {repoUrl && (
            <div className="hidden border-t border-line-subtle px-5 py-4 lg:block">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-2xs text-muted transition-colors hover:text-accent"
              >
                All repositories ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── detail panes ──────────────────────────────────────── */}
      <div className="min-w-0">
        {projects.map((p, i) => (
          <Tabs.Panel
            key={p.title}
            value={String(i)}
            className="px-5 py-8 outline-none md:px-8 md:py-10"
          >
            <div className="mb-4 flex items-center gap-3 font-mono text-2xs">
              <span className="text-muted">[{p.status}]</span>
              {p.featured && (
                <span className="rounded-sm bg-accent-subtle px-2 py-0.5 uppercase tracking-wider text-accent">
                  Featured
                </span>
              )}
            </div>

            <h3 className="font-display text-[clamp(1.4rem,2vw+1rem,1.9rem)] text-default">
              {p.title}
            </h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-subtle">{p.description}</p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {p.techStack.map((t) => (
                <li
                  key={t}
                  className="rounded-sm border border-line-subtle bg-surface px-2.5 py-1 font-mono text-2xs text-subtle"
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-6 font-mono text-xs">
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-subtle transition-colors hover:text-accent"
                >
                  View Code
                </a>
              )}
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Live Site →
                </a>
              )}
            </div>
          </Tabs.Panel>
        ))}
      </div>
    </Tabs.Root>
  );
}
