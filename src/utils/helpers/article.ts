import { type CollectionEntry, render } from 'astro:content';

import { compareDates } from '$utils/helpers/date';

export const getLatestArticle = async (articles: CollectionEntry<'articles'>[]) => {
  const sortedArticles = articles.sort((a, b) => compareDates(b.data.created, a.data.created));
  const latestArticle = sortedArticles[0];

  return latestArticle;
};

export const getMinutesRead = async (entry: CollectionEntry<'articles'>) => {
  const {
    remarkPluginFrontmatter: { minutesRead },
  } = await render(entry);

  return { minutesRead };
};
