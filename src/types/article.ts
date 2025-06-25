import type { CollectionEntry } from 'astro:content';

export interface ArticlePluginData {
  data: {
    astro: {
      frontmatter: CollectionEntry<'articles'> & {
        minutesRead?: string;
      };
    };
  };
}
