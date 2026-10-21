# Plan 25 — Section headers like the portfolio, no numbered eyebrows (owner decision, 2026-10-21)

- The hero (`#home`) has no eyebrow. It is just the `akiblog.` wordmark, tagline and tag pills.
- `#search`, `#tags`, `#posts` (and Comments on posts) use `ui/SectionHeader.astro`,
  the portfolio Writings header: serif `h2` title + one short mono description,
  with an optional right-side slot for the count (`9 tags`, `3 posts`).
- All `NN. Label` eyebrows are removed. The title names the section and the sidebar
  stations carry the page order. `Station.number` stays in `data/site.ts` as
  order metadata only and is not rendered.

| Section | Title | Description |
|---|---|---|
| Search | Search | Find any post by what's inside it — commands, errors, ideas. |
| Tags | Tags | Browse the notes by topic. |
| Posts | All posts | Guides, notes and references, newest first. |
| Comments | Comments | Questions, corrections and notes — via GitHub Discussions. |
