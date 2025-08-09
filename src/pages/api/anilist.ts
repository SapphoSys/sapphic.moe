import type { APIRoute } from 'astro';

import type { AniListCacheEntry, AniListData, AniListEntry, AniListMedia } from '$types/anilist';
import { createForbiddenResponse, validateUsername } from '$utils/helpers/api';

const ANILIST_API = 'https://graphql.anilist.co';
const CACHE_DURATION_MS = 30 * 60 * 1000;
const anilistCache = new Map<string, AniListCacheEntry>();

const query = `
query ($username: String) {
  MediaListCollection(userName: $username, type: ANIME, status_in: [CURRENT, COMPLETED], sort: FINISHED_ON_DESC) {
    lists {
      status
      entries {
        media {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          format
          status
          episodes
          averageScore
        }
        progress
        status
        updatedAt
        completedAt {
          year
          month
          day
        }
      }
    }
  }
}`;

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const username = url.searchParams.get('username');

  if (!username) {
    console.error('[API Route] Username parameter is missing or empty.');
    return new Response(JSON.stringify({ error: 'Missing required parameter: username' }), {
      status: 400,
    });
  }

  if (!validateUsername('aniList', username)) {
    console.error(`[API Route] Invalid AniList username provided. (User provided: ${username})`);
    return createForbiddenResponse();
  }

  try {
    const limit = Number(url.searchParams.get('limit')) || 8;
    console.warn('Received username:', username);

    const cacheKey = `${username}_${limit}`;
    const cachedEntry = anilistCache.get(cacheKey);
    const now = Date.now();

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
      console.warn(`[API Route] Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cachedEntry.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
        },
      });
    }

    console.warn(`[API Route] Cache miss/expired for ${cacheKey}, fetching from AniList...`);

    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'sapphic.moe AniList API Proxy (Astro)',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) throw new Error(`AniList API responded with status ${response.status}`);

    const json = await response.json();

    if (json.errors) throw new Error(json.errors[0].message);

    const lists = json.data.MediaListCollection.lists;
    const result: AniListData = {
      currentlyWatching: [],
      recentlyCompleted: [],
    };

    for (const list of lists) {
      const entries = list.entries.map(
        (entry: AniListEntry): AniListMedia => ({
          id: entry.media.id,
          title: {
            romaji: entry.media.title.romaji,
            english: entry.media.title.english,
          },
          coverImage: {
            large: entry.media.coverImage.large,
          },
          format: entry.media.format,
          status: entry.status,
          episodes: entry.media.episodes,
          averageScore: entry.media.averageScore,
          progress: entry.progress,
          url: `https://anilist.co/anime/${entry.media.id}`,
          completedAt: entry.completedAt
            ? new Date(
                entry.completedAt.year,
                entry.completedAt.month - 1,
                entry.completedAt.day
              ).getTime() / 1000
            : undefined,
        })
      );

      if (list.status === 'CURRENT') result.currentlyWatching = entries;
      else if (list.status === 'COMPLETED') {
        const sortedEntries = entries.sort((a: AniListMedia, b: AniListMedia) => {
          if (!a.completedAt) return 1;
          if (!b.completedAt) return -1;
          return b.completedAt - a.completedAt;
        });

        result.recentlyCompleted = sortedEntries.slice(0, limit);
      }
    }

    anilistCache.set(cacheKey, { data: result, timestamp: now });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
      },
    });
  } catch (error) {
    console.error('AniList API Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
