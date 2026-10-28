/* For more details, see docs/blog/implementation-notes.md#src-content-config-ts-note-1. */
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
