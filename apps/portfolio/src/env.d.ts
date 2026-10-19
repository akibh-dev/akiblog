/**
 * @file src/env.d.ts
 * @description Astro client type references.
 *
 * WHY THIS FILE EXISTS: plain `tsc --noEmit` cannot resolve `.astro`
 * imports without it (e.g. src/icons/index.ts re-exporting every icon
 * component). `astro/client` provides the `declare module "*.astro"`
 * shim plus types for Astro.locals / import.meta.env. This is the
 * standard Astro scaffold file — tsconfig's `include: src/**` picks it
 * up automatically; zero runtime effect.
 */
/// <reference types="astro/client" />

/**
 * Plain-tsc shim for `.astro` imports (e.g. src/icons/index.ts).
 * Astro 7 type-checks .astro via its language server (`astro check`), so
 * `astro/client` no longer declares the module — without this shim plain
 * `tsc --noEmit` reports TS2307 on every `.astro` import. Same shape the
 * language server injects: default export is the component factory.
 */
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}
