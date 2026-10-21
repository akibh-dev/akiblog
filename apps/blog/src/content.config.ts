/**
 * @file apps/blog/src/content.config.ts
 * @description Post schema (reference copy: docs/ui-guide/content.config.ts).
 *              Spec: plan/plan19.md §2.1 + plan/plan20.md. Template: docs/sample-post.md (copy in notes: _templates/sample.md).
 *
 * WHY THIS APPROACH (POC):
 * 1. Content Layer `glob()` loader over the folder-per-post layout that the
 *    notes repo already uses (content/<year>/<slug>/index.md). The deploy
 *    step syncs that tree into src/content/posts/, so the base stays inside
 *    the project root (Vite fs + image pipeline).
 * 2. `generateId` = frontmatter `slug` ?? folder name. The year folder is NOT
 *    part of the id, so `/<slug>/` survives moving a post between years.
 * 3. `image()` validates the cover exists at build and hands Astro an
 *    ImageMetadata (AVIF/WebP for the page, 1200×630 JPEG for og:image).
 * 4. Zod fails the build on bad frontmatter (file + field in the error), so
 *    a broken note can never be deployed. Only the description minimum is
 *    soft (a warning in the page builder), because existing notes are short.
 * 5. Jekyll-only keys (`layout`) pass through untouched: the object is not
 *    `.strict()`, so the same file keeps rendering on GitHub Pages.
 * 6. `author: gemini` (legacy notes) is mapped to `ai: "generated"` by the
 *    preprocess step instead of requiring an edit in the notes repo.
 * 7. `featured: true` pins a post: it leads the home page's post list and is
 *    what GET /api/featured (functions/api/featured.ts) serves the portfolio.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const posts = defineCollection({
  loader: glob({
    pattern: "**/index.md",
    base: "./src/content/posts",
    // "2026/github-cli-guide/index.md" → "github-cli-guide" (or frontmatter slug)
    generateId: ({ entry, data }) =>
      typeof data.slug === "string" ? data.slug : entry.split("/").at(-2)!,
  }),
  schema: ({ image }) =>
    z.preprocess(
      (raw: any) =>
        raw && raw.ai === undefined && typeof raw.author === "string" && /gemini|gpt|claude|ai/i.test(raw.author)
          ? { ...raw, ai: "generated" }
          : raw,
      z
        .object({
          title: z.string().min(1).max(90),
          description: z.string().min(1).max(160),
          date: z.coerce.date(),
          updated: z.coerce.date().optional(),
          slug: z.string().regex(slugRe, "slug must be kebab-case").optional(),
          type: z.enum(["guide", "note", "essay", "reference"]).default("note"),
          tags: z.array(z.string().regex(slugRe, "tags must be lowercase kebab-case")).min(1).max(6),
          keywords: z.array(z.string()).optional(),
          cover: image().optional(),
          coverAlt: z.string().optional(),
          series: z.string().optional(),
          /** pinned: shown first on the blog home + returned by /api/featured (plan26) */
          featured: z.boolean().default(false),
          ai: z.enum(["none", "assisted", "generated"]).default("none"),
          draft: z.boolean().default(false),
          toc: z.boolean().default(true),
          comments: z.boolean().default(true),
          canonical: z.string().url().optional(),
        })
        .refine((d) => !d.cover || !!d.coverAlt, { message: "coverAlt is required when cover is set", path: ["coverAlt"] })
        .refine((d) => !d.updated || d.updated >= d.date, { message: "updated must be on/after date", path: ["updated"] })
        .transform((d) => ({ ...d, keywords: d.keywords ?? d.tags })),
    ),
});

export const collections = { posts };
