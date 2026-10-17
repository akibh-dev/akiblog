/**
 * @file islands/projects/EditorTitleBar.tsx
 * @description Window chrome — macOS traffic lights + centered workspace title.
 *
 * WHY: this is deliberately the same chrome language as the hero Terminal,
 * so the two "apps" on the page read as windows from the same OS. Purely
 * decorative; the title text is the only meaningful content.
 */

interface Props {
  title: string;
}

export default function EditorTitleBar({ title }: Props) {
  return (
    <div className="relative flex h-10 items-center border-b border-line-subtle px-4">
      <span className="flex items-center gap-2" aria-hidden="true">
        <span className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
        <span className="size-3 rounded-full bg-[#ffbd2e] ring-1 ring-black/10" />
        <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
      </span>
      <span className="absolute inset-x-0 text-center font-mono text-[9px] text-muted">
        {title}
      </span>
    </div>
  );
}
