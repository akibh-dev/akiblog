# Agent Rules

To maintain the integrity of the project and ensure structured progress, all AI agents must strictly adhere to the following rules:

0. **Never edit the file `AGENTS.md` and always follow the `AGENTS.md`**
1. **Never edit any file in `docs/blog/`**: The previous blog project is read-only and serves as a reference. Do not modify, delete, or add any files in this directory.
2. **Never edit any plan in `plan/`**: Once a plan file (e.g., `plan0.md`, `plan1.md`) is created, it is immutable. To update or refine a plan, always create a new plan file with sequential numbering (e.g., `plan2.md`, etc.).
3. **Do not write any code unless explicitly asked**: Focus on planning, analysis, and coordination. Do not write, modify, or scaffold any application code or configuration files unless the user has explicitly requested you to do so.
4. **Always provide description or POC in written code**: When user asks to write/modify a code portion, always provide proper documentation, poc, why this method of implementation is best etc. at the begining of code.
5. **Islands are pure Astro (latest version) — no React**: Build every interactive component as an `.astro` component with vanilla TypeScript `<script>` (custom elements for stateful widgets). Never add React or any UI framework; keep Astro and integrations on the latest stable version. Legacy React islands (`islands/terminal/`, `islands/projects/`,`ThemeSwitch`, `MobileMenu`, `CopyButton`) must be migrated per `plan/plan17.md`, not extended.
