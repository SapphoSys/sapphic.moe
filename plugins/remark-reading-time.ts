import { toString as convertToString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

import type { ArticlePluginData } from '$types/article';

const remarkReadingTime = () => {
  return (tree: Node, { data }: ArticlePluginData) => {
    const textOnPage = convertToString(tree);
    const readingTime = getReadingTime(textOnPage);

    data.astro.frontmatter.minutesRead = readingTime.text;
  };
};

export default remarkReadingTime;
