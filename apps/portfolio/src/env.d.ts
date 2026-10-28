/* For more details, see docs/portfolio/implementation-notes.md#src-env-d-ts-note-1. */
/// <reference types="astro/client" />

/* For more details, see docs/portfolio/implementation-notes.md#src-env-d-ts-note-2. */
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}
