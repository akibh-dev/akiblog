import { defineCollection, z } from 'astro:content';

/**
 * Delta Blog Content Collection Configuration
 *
 * Put this in `src/content/config.ts` or `src/content.config.ts` when ready to activate blogs.
 */
export const collections = {
  blog: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.date(),
      updatedDate: z.date().optional(),
      category: z.string().default('Engineering'),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      author: z.object({
        name: z.string(),
        avatar: z.string(),
        handle: z.string().optional(),
        github: z.string().optional(),
      }),
      coverImage: z.object({
        light: z.string(),
        dark: z.string().optional(),
        alt: z.string(),
        caption: z.string().optional(),
      }).optional(),
      tags: z.array(z.string()).default([]),
    }),
  }),
};
