# Plan: Zed-Editor-Style Experience Section

## Overview

Transform the Experience section to look like Zed editor's interface:
- **Left sidebar**: Project/company names as a file-tree list
- **Right panel**: README-style content display for each experience

## Zed Editor UI Characteristics (from research)

Based on Zed's [Project Panel documentation](https://zed.dev/docs/project-panel):

1. **File Tree Design**:
   - Tree view with files and directories
   - Sticky scroll for ancestor directories
   - Directory folding for nested paths
   - Git status indicators (colored badges)
   - Monospace font for file names
   - Hover states on entries
   - Left border accent on selected item

2. **Layout**:
   - Two-column grid: `[sidebar] [main-content]`
   - Thin left column (~12rem min)
   - Main content takes remaining space
   - Vertical orientation with arrow-key navigation

3. **Visual Style**:
   - Clean, minimal chrome
   - Subtle borders between panels
   - Status indicators as colored text/badges
   - Monospace typography for "file names"

## Implementation Plan

### 1. Data Model (portfolio.ts)

Add `Experience` type:

```typescript
export interface Experience {
  id: string;           // "company-name"
  company: string;
  role: string;
  period: string;       // "Jan 2023 - Present"
  location: string;
  type: "work" | "education" | "project";
  status?: "current" | "completed";
  description: string;  // README markdown content
  highlights: string[];
  techStack?: string[];
  links?: { label: string; url: string }[];
}
```

### 2. Components

#### Experience.astro (New Section)
- Shell wrapper using SectionShell
- Passes experience data to ExperienceBrowser island

#### ExperienceBrowser.tsx (New Island)
Based on existing `ProjectBrowser.tsx` pattern:

```tsx
// Layout: grid with file-tree sidebar + content pane
<Tabs.Root orientation="vertical">
  {/* Left: File Tree */}
  <div class="border-r border-line-subtle">
    {/* Header with icon */}
    <div class="px-4 py-3 font-mono text-xs text-muted">
      <FolderIcon /> experience/
    </div>
    
    <Tabs.List>
      {experiences.map(exp => (
        <Tabs.Tab value={exp.id}>
          <FileIcon />
          <span>{exp.company}</span>
          <StatusBadge status={exp.status} />
        </Tabs.Tab>
      ))}
    </Tabs.List>
  </div>
  
  {/* Right: README content */}
  <Tabs.Panel value={exp.id}>
    <ReadmeView experience={exp} />
  </Tabs.Panel>
</Tabs.Root>
```

#### ReadmeView.tsx (Sub-component)
README-style content display:

```tsx
<article class="prose">
  {/* Header */}
  <h1>{company}</h1>
  <p class="text-subtle">{role} · {period}</p>
  
  {/* Status badge */}
  <span class="badge">Current</span>
  
  {/* Description - rendered markdown */}
  <section>{description}</section>
  
  {/* Highlights as bullet list */}
  <ul>
    {highlights.map(h => <li>{h}</li>)}
  </ul>
  
  {/* Tech stack as badges */}
  <div class="flex gap-2">
    {techStack.map(t => <span class="tech-badge">{t}</span>)}
  </div>
  
  {/* Links */}
  <footer class="flex gap-4">
    {links.map(link => <a href={link.url}>{link.label}</a>)}
  </footer>
</article>
```

### 3. Styling Approach

Reuse existing design tokens from the portfolio:
- `text-accent` for selected state
- `text-muted` for secondary info
- `text-subtle` for descriptions
- `font-mono` for file names
- `border-line-subtle` for panel separators

### 4. Key Differences from ProjectBrowser

| Aspect | ProjectBrowser (Current) | ExperienceBrowser (New) |
|--------|--------------------------|------------------------|
| Sidebar header | None | `experience/` folder header |
| Item icons | Generic folder | Company-specific icons |
| Status badge | `[status]` text | Git-style colored badge |
| Content layout | Card-style | README markdown style |
| Typography | Mixed | More prose-like |

### 5. File Structure

```
apps/portfolio/src/
├── components/
│   ├── sections/
│   │   └── Experience.astro      # New section shell
│   └── islands/
│       └── ExperienceBrowser.tsx # New interactive island
└── data/
    └── portfolio.ts              # Add experiences array
```

### 6. Integration

Update `index.astro`:
```astro
<Layout>
  <Hero />
  <Experience />   <!-- New -->
  <Projects />
  <Writings />
  <Skills />
  <Contact />
</Layout>
```

## Sample Experience Data

```typescript
experiences: [
  {
    id: "cuet",
    company: "CUET",
    role: "B.Sc. Computer Science & Engineering",
    period: "2020 - 2024",
    location: "Chittagong, Bangladesh",
    type: "education",
    status: "completed",
    description: `
## Focus Areas

Studied core computer science fundamentals with emphasis on:
- Software Engineering principles
- Distributed Systems architecture  
- Algorithm design and analysis

## Notable Coursework

- Data Structures & Algorithms
- Database Management Systems
- Computer Networks
- Operating Systems
    `,
    highlights: [
      "Graduated with honors",
      "Led multiple team projects",
      "Active in competitive programming club"
    ],
    techStack: ["C++", "Python", "Java", "SQL"],
    links: [
      { label: "Transcript", url: "#" },
      { label: "Projects", url: "#" }
    ]
  },
  // ... more experiences
]
```

## Accessibility

- Arrow key navigation (inherited from Base UI Tabs)
- Proper ARIA attributes
- Focus visible states
- Screen reader announcements

## Mobile Considerations

- Horizontal scroll on mobile (same as ProjectBrowser)
- Stacked layout option for very small screens

## Questions for User

1. Should experiences be ordered chronologically or alphabetically?
2. Do you want ability to filter by type (work/education/project)?
3. Should there be a "download resume" action?
4. Any specific companies/experiences you want to include?
