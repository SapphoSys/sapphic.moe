import type { APIRoute } from 'astro';

import type { ListenBrainzTrackData } from '$types/listenbrainz';
import { fetchListenBrainzData, processTrackData } from '$utils/helpers/listenbrainz';

interface CacheEntry {
  data: ListenBrainzTrackData | null;
  timestamp: number;
  error: string | null;
}

const listenBrainzCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 30 * 1000;

export const prerender = false;

function getCacheKey(username: string): string {
  return `recenttrack_${username}`;
}

function getCachedData(username: string): { data: ListenBrainzTrackData | null; isValid: boolean } {
  const cacheKey = getCacheKey(username);
  const cachedEntry = listenBrainzCache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    console.warn(`[API Route] Cache hit for ${cacheKey}`);
    return { data: cachedEntry.data, isValid: true };
  }

  return { data: null, isValid: false };
}

function setCachedData(username: string, data: ListenBrainzTrackData | null): void {
  const cacheKey = getCacheKey(username);
  const now = Date.now();
  listenBrainzCache.set(cacheKey, { data, timestamp: now, error: null });
  console.warn(`[API Route] Cached data for ${cacheKey}`);
}

export const GET: APIRoute = async ({ url }) => {
  const username = url.searchParams.get('username');

  if (!username) {
    console.error('[API Route] Username parameter is missing or empty.');
    return new Response(JSON.stringify({ error: 'Missing required parameter: username' }), {
      status: 400,
    });
  }

  // Check cache first
  const cached = getCachedData(username);
  if (cached.isValid) {
    return new Response(JSON.stringify({ data: cached.data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
      },
    });
  }

  try {
    // Fetch data from ListenBrainz API
    const result = await fetchListenBrainzData(username);
    const listens = result?.payload?.listens ?? [];

    // Process the track data
    const processedData = await processTrackData(listens);

    // Cache the result
    setCachedData(username, processedData);

    // Return the processed data
    return new Response(JSON.stringify({ data: processedData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
};
