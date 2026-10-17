/**
 * @file islands/projects/ReadmePreview.tsx
 * @description The right dock: a project rendered as its README.md preview.
 *
 * POC / WHY THIS STRUCTURE: real READMEs open with a title, a badge row,
 * then prose sections — so the layout is H1 (site display serif, matching
 * how Zed's markdown preview swaps the buffer font for the UI font), a
 * shields-style badge row, an <hr>, then mono-eyebrow sections
 * (Overview / Highlights / Stack) and a links footer. Pure function of
 * props — no state — so it ports unchanged when real data replaces the
 * dummy highlights.
 */
import { getHighlights } from "./dummy";
import { STATUS_META, type ProjectFile } from "./types";

interface Props {
  project: ProjectFile;
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mt-8 mb-3 font-mono text-2xs uppercase tracking-widest text-muted">
      {children}
    </h2>
  );
}

export default function ReadmePreview({ project }: Props) {
  const meta = STATUS_META[project.status];
  const highlights = getHighlights(project);

  return (
    <article className="px-6 py-8 md:px-10 md:py-10 lg:pr-14">
      <h1 className="font-display text-[clamp(1.4rem,2vw+1rem,1.9rem)] leading-tight text-default">
        {project.title}
      </h1>

      {/* shields-style badge row */}
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-2xs">
        <span
          className={`flex items-center gap-1.5 rounded-sm border border-line-subtle bg-surface px-2.5 py-1 ${meta.textClass}`}
        >
          <span className={`size-1.5 rounded-full ${meta.dotClass}`} aria-hidden="true" />
          {meta.label}
        </span>
        {project.featured && (
          <span className="rounded-sm bg-accent-subtle px-2.5 py-1 uppercase tracking-wider text-accent">
            Featured
          </span>
        )}
        <span className="rounded-sm border border-line-subtle bg-surface px-2.5 py-1 text-subtle">
          README.md
        </span>
      </div>

      <hr className="my-6 border-line-subtle" />

      {/* Overview */}
      <p className="max-w-2xl text-sm leading-relaxed text-subtle">{project.description}</p>

      {/* Highlights */}
      <SectionHeading>Highlights</SectionHeading>
      <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-subtle marker:text-muted">
        {highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      {/* Stack */}
      <SectionHeading>Stack</SectionHeading>
      <ul className="flex flex-wrap gap-2">
        {project.techStack.map((t) => (
          <li
            key={t}
            className="rounded-sm border border-line-subtle bg-surface px-2.5 py-1 font-mono text-2xs text-subtle"
          >
            {t}
          </li>
        ))}
      </ul>

      {(project.githubUrl || project.liveUrl) && (
        <>
          <hr className="my-6 border-line-subtle" />
          <footer className="flex items-center gap-6 font-mono text-xs">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-subtle transition-colors hover:text-accent"
              >
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Live Site →
              </a>
            )}
          </footer>
        </>
      )}
    </article>
  );
}
