import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const mdLoader = (collection: string) =>
  glob({
    pattern: ['**/[^_]*.{md,mdx}', '!**/*.draft.mdx'],
    base: `./src/content/${collection}`,
  });

const articlesCollection = defineCollection({
  loader: mdLoader('articles'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional().default(false),
    created: z.string().or(z.date()),
    modified: z.string().or(z.date()).optional(),
    tags: z.array(z.string()),
    comments: z.boolean().optional().default(true),
  }),
});

const infoCollection = defineCollection({
  loader: mdLoader('info'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    modified: z.string().or(z.date()).optional(),
    toc: z.boolean().optional().default(false),
  }),
});

export const collections = {
  articles: articlesCollection,
  info: infoCollection,
};
