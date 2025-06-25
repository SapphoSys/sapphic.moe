import db from '@astrojs/db';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import a11yEmoji from '@fec/remark-a11y-emoji';
import { defineConfig } from 'astro/config';
import autoImport from 'astro-auto-import';
import expressiveCode from 'astro-expressive-code';
import icon from 'astro-icon';
import metaTags from 'astro-meta-tags';
import showTailwindcssBreakpoint from 'astro-show-tailwindcss-breakpoint';
import autolinkHeadings from 'rehype-autolink-headings';
import externalLinks from 'rehype-external-links';
import slug from 'rehype-slug';
import arrayBuffer from 'vite-plugin-arraybuffer';

import readingTime from '$plugins/remark-reading-time';
import { expressiveCodeOptions } from '$utils/code';
import { blog, site } from '$utils/config';
import { schema } from '$utils/env';

// https://astro.build/config
export default defineConfig({
  site: site.url,

  adapter: node({
    mode: 'standalone',
  }),

  env: {
    schema,
  },

  integrations: [
    tailwind(),
    db(),
    autoImport({ imports: blog.autoImportComponents }),
    react(),
    expressiveCode(expressiveCodeOptions),
    mdx(),
    icon({
      include: {
        mdi: ['*'],
      },
    }),
    sitemap(),
    showTailwindcssBreakpoint(),
    metaTags(),
  ],

  markdown: {
    remarkPlugins: [a11yEmoji, readingTime],
    rehypePlugins: [
      slug,
      [
        autolinkHeadings,
        {
          behavior: 'append',
          content: {
            type: 'text',
            value: '#',
          },
        },
      ],
      [
        externalLinks,
        {
          target: '_blank',
        },
      ],
    ],
  },

  vite: {
    plugins: [arrayBuffer()],
  },
});
