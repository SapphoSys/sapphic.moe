import type { Item, Output } from 'rss-parser';

import type { FeedItem, FeedListEntry } from '$types/feeds';

const cleanFeedTitle = (title: string): string => {
  return title
    .replace(/^[A-Z][a-z]+ \d+(?:st|nd|rd|th), \d{4}: /, '')
    .replace(/^\d{4}-\d{2}-\d{2}: /, '')
    .replace(/^\d{2}\/\d{2}\/\d{4}: /, '')
    .trim();
};

const getFeedBaseUrl = (
  baseUrl: string | undefined,
  feedInfo: { title: string }
): string | undefined => {
  if (!baseUrl) return undefined;

  try {
    const urlObject = new URL(baseUrl);
    return urlObject.origin;
  } catch (e) {
    console.warn(`Failed to parse base URL "${baseUrl}" for feed "${feedInfo.title}":`, e);
    return undefined;
  }
};

const processFeedContentSnippet = (
  contentSnippet: string | undefined,
  maxLength: number = 200
): string | undefined => {
  if (!contentSnippet) return undefined;

  let processedSnippet = contentSnippet;

  if (processedSnippet.length > maxLength) {
    const plainTextSnippet = processedSnippet.replace(/<[^>]*>/g, '');

    if (plainTextSnippet.length > maxLength) {
      const lastSpaceIndex = plainTextSnippet.lastIndexOf(' ', maxLength);
      if (lastSpaceIndex !== -1) {
        processedSnippet = plainTextSnippet.substring(0, lastSpaceIndex) + '...';
      } else {
        processedSnippet = plainTextSnippet.substring(0, maxLength) + '...';
      }
    } else {
      processedSnippet = plainTextSnippet;
    }
  } else {
    processedSnippet = processedSnippet.replace(/<[^>]*>/g, '');
  }

  return processedSnippet;
};

const resolveFeedItemLink = (
  itemLink: string | undefined,
  baseUrl: string | undefined,
  feedInfo: { title: string }
): string | undefined => {
  if (!itemLink?.trim()) return undefined;

  try {
    const urlObject = new URL(itemLink.trim());
    return urlObject.href;
  } catch (_) {
    const seemsLikeSchemeLessAbsolute =
      /^[a-zA-Z0-9]/.test(itemLink) &&
      !itemLink.startsWith('/') &&
      !itemLink.startsWith('./') &&
      !itemLink.startsWith('../');

    if (seemsLikeSchemeLessAbsolute && baseUrl) {
      try {
        const baseScheme = new URL(baseUrl).protocol;
        const potentialAbsoluteLink = `${baseScheme}//${itemLink}`;
        const urlObject = new URL(potentialAbsoluteLink);
        return urlObject.href;
      } catch (eScheme) {
        console.warn(
          `Failed to resolve scheme-less link "${itemLink}" using base scheme from "${baseUrl}":`,
          eScheme
        );
        return undefined;
      }
    } else if (baseUrl) {
      try {
        const urlObject = new URL(itemLink, baseUrl);
        return urlObject.href;
      } catch (e2) {
        console.warn(`Failed to construct URL for link "${itemLink}" from base "${baseUrl}":`, e2);
        return undefined;
      }
    } else {
      console.warn(
        `Item link "${itemLink}" is relative or malformed and base URL is missing for feed "${feedInfo.title}". Cannot construct full URL.`
      );
      return undefined;
    }
  }
};

export const mapFeedItems = (feed: Output<unknown>, feedInfo: FeedListEntry): FeedItem[] => {
  const baseUrl = feed.link;
  return feed.items.map((item: Item): FeedItem => {
    const fullLink = resolveFeedItemLink(item.link, baseUrl, feedInfo);
    const feedBaseUrl = getFeedBaseUrl(baseUrl, feedInfo);
    const truncatedContentSnippet = processFeedContentSnippet(item.contentSnippet);
    return {
      title: cleanFeedTitle(item.title || 'Untitled'),
      link: fullLink,
      pubDate: item.pubDate,
      isoDate: item.isoDate,
      content: item.content,
      contentSnippet: truncatedContentSnippet,
      feedTitle: feedInfo.title,
      feedUrl: feedInfo.url,
      feedAvatar: feedInfo.avatar,
      feedBaseUrl: feedBaseUrl,
    };
  });
};
