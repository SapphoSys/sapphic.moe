import type { APIRoute } from 'astro';
import Parser from 'rss-parser';

import { feedList } from '$data/feeds';
import type { FeedCacheEntry, FeedItem, FeedListEntry } from '$types/feeds';
import { FEEDS_MAX_ITEMS } from '$utils/constants';
import { mapFeedItems } from '$utils/helpers/feed';

const feedsCache = new Map<string, FeedCacheEntry>();
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000;

export const prerender = false;

export const GET: APIRoute = async () => {
  const cacheKey = 'latest-feeds';
  const cachedEntry = feedsCache.get(cacheKey);
  const now = Date.now();
  const cacheDurationSeconds = CACHE_DURATION_MS / 1000;

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    console.warn(`[API Route /api/feeds] Cache hit`);
    return new Response(JSON.stringify(cachedEntry.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheDurationSeconds}, must-revalidate`,
        Expires: new Date(now + CACHE_DURATION_MS).toUTCString(),
      },
    });
  }

  console.warn(`[API Route /api/feeds] Cache miss/expired, fetching feeds...`);

  const parser = new Parser();
  let allFeedItems: FeedItem[] = [];

  const feedPromises = feedList.map(async (feedInfo: FeedListEntry) => {
    let items: FeedItem[] = [];
    if (feedInfo.paginated) {
      let page = 1;
      let keepGoing = true;
      const seenLinks = new Set<string>();
      while (keepGoing && page <= feedInfo.paginated.maxPages) {
        const url = `${feedInfo.url}?${feedInfo.paginated.param}=${page}`;
        try {
          const feed = await parser.parseURL(url);
          const pageItems = mapFeedItems(feed, feedInfo);
          const newItems = pageItems.filter((i: FeedItem) => i.link && !seenLinks.has(i.link));
          newItems.forEach((i: FeedItem) => seenLinks.add(i.link!));
          items.push(...newItems);
          if (newItems.length === 0 || pageItems.length === 0) keepGoing = false;
        } catch (error) {
          console.error(
            `[API Route /api/feeds] Error fetching paged feed "${feedInfo.title}" (${url}):`,
            error
          );
          keepGoing = false;
        }
        page++;
      }
    } else {
      try {
        const feed = await parser.parseURL(feedInfo.url);
        items = mapFeedItems(feed, feedInfo);
      } catch (error) {
        console.error(
          `[API Route /api/feeds] Error fetching or parsing feed "${feedInfo.title}" (${feedInfo.url}):`,
          error
        );
        items = [];
      }
    }
    return items;
  });

  const results = await Promise.all(feedPromises);
  allFeedItems = results.flat();

  allFeedItems.sort((a, b) => {
    const dateA = a.isoDate
      ? new Date(a.isoDate).valueOf()
      : a.pubDate
        ? new Date(a.pubDate).valueOf()
        : 0;
    const dateB = b.isoDate
      ? new Date(b.isoDate).valueOf()
      : b.pubDate
        ? new Date(b.pubDate).valueOf()
        : 0;
    return dateB - dateA;
  });

  allFeedItems = allFeedItems.slice(0, FEEDS_MAX_ITEMS);

  feedsCache.set(cacheKey, { data: allFeedItems, timestamp: now });
  console.warn(`[API Route /api/feeds] Cached fetched data`);

  return new Response(JSON.stringify(allFeedItems), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${cacheDurationSeconds}, must-revalidate`,
      Expires: new Date(now + CACHE_DURATION_MS).toUTCString(),
    },
  });
};
