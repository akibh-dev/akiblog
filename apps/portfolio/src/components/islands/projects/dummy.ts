/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-projects-dummy-ts-note-1. */
import type { ProjectItem } from "./types";

export const DUMMY_HIGHLIGHTS: Record<string, string[]> = {
  "Akiblog Edge Platform": [
    "Sub-millisecond SSR responses from Cloudflare's V8 isolate network",
    "Zero-Trust SSO admin gate — no session database, no password flows",
    "D1 SQLite + R2 media bindings wired through Drizzle ORM",
  ],
  "Black Board Collaborative Engine": [
    "Simultaneous shared-canvas rendering across connected clients",
    "High-throughput event synchronization over Gorilla WebSockets",
    "Zero-build frontend: HTML5 Canvas + vanilla JavaScript",
  ],
  "University Management System": [
    "Enrollment, courses and grade records in a normalized schema",
    "Secure REST endpoints for administrative operations",
    "Fully containerized deployment with Docker",
  ],
  "E-Code Verifier Mobile": [
    "Barcode + E-Code scanning with ingredient safety profiles",
    "Two-step cryptographic verification flow",
    "Single Flutter codebase shipping to iOS and Android",
  ],
  "SmartHaat Agricultural Marketplace": [
    "Catalog filtering, shopping carts and administrative panels",
    "Connects farmers directly with enterprise buyers",
    "Django REST API consumed by a Vue.js SPA",
  ],
};

/** Real data wins; dummy map second; generic line as the last resort. */
export function getHighlights(p: ProjectItem): string[] {
  if (p.highlights?.length) return p.highlights;
  return (
    DUMMY_HIGHLIGHTS[p.title] ?? [
      "Documentation in progress — see the repository for details.",
    ]
  );
}
