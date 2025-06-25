import type { APIRoute } from 'astro';
import { LASTFM_API_KEY } from 'astro:env/server';

import type { LastFMAlbum, LastFMTopAlbumsApiResponse } from '$types/lastfm';
import { createForbiddenResponse, validateUsername } from '$utils/helpers/api';
import { validateAlbumCovers } from '$utils/helpers/lastfm';

interface CacheEntry {
  data: LastFMAlbum[] | null;
  timestamp: number;
  error: string | null;
}

const albumsCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const ERROR_CACHE_DURATION_MS = 5 * 60 * 1000;

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const username = url.searchParams.get('username');
  const period = url.searchParams.get('period') || '12month';
  const limit = url.searchParams.get('limit') || '20';

  if (!LASTFM_API_KEY) {
    console.error('[API Route] Last.fm API key not configured.');
    return new Response(
      JSON.stringify({
        error: 'Last.fm API key not configured on the server.',
      }),
      { status: 500 }
    );
  }

  if (!username) {
    console.error('[API Route] Username parameter is missing or empty.');
    return new Response(JSON.stringify({ error: 'Missing required parameter: username' }), {
      status: 400,
    });
  }

  if (!validateUsername('lastFM', username)) {
    console.error(`[API Route] Invalid Last.fm username provided. (User provided: ${username})`);
    return createForbiddenResponse();
  }

  const validPeriods = ['overall', '7day', '1month', '3month', '6month', '12month'];
  if (!validPeriods.includes(period.toString())) {
    return new Response(
      JSON.stringify({
        error: `Invalid period parameter. Must be one of: ${validPeriods.join(', ')}`,
      }),
      { status: 400 }
    );
  }

  const cacheKey = `topalbums_${username}_${period}_${limit}`;
  const cachedEntry = albumsCache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry) {
    if (cachedEntry.error && now - cachedEntry.timestamp < ERROR_CACHE_DURATION_MS) {
      console.warn(`[API Route] Cached error for ${cacheKey}`);
      return new Response(JSON.stringify({ error: cachedEntry.error }), {
        status: 500,
      });
    }

    if (cachedEntry.data && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
      console.warn(`[API Route] Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cachedEntry.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${Math.floor((CACHE_DURATION_MS - (now - cachedEntry.timestamp)) / 1000)}`,
        },
      });
    }
  }

  console.warn(`[API Route] Cache miss/expired for ${cacheKey}, fetching from Last.fm...`);

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const params = new URLSearchParams({
        method: 'user.getTopAlbums',
        user: username,
        api_key: LASTFM_API_KEY,
        period: period.toString(),
        limit: limit.toString(),
        format: 'json',
      });

      const apiUrl = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;

      const apiRequest = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'sapphic.moe Last.fm API Proxy (Astro)',
        },
      });

      if (!apiRequest.ok) {
        const errorBody = await apiRequest.text();
        console.error(`[API Route] Last.fm API HTTP error ${apiRequest.status}: ${errorBody}`);

        if (attempt < MAX_RETRIES && apiRequest.status >= 500) {
          console.warn(
            `[API Route] Retrying Last.fm album fetch in ${RETRY_DELAY_MS}ms (Attempt ${attempt + 1}/${MAX_RETRIES})...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        } else {
          const errorMessage = `Last.fm API HTTP error: Status ${apiRequest.status}. Body: ${errorBody}`;
          albumsCache.set(cacheKey, {
            data: null,
            timestamp: now,
            error: errorMessage,
          });
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: apiRequest.status >= 400 ? apiRequest.status : 500,
          });
        }
      }

      const result: LastFMTopAlbumsApiResponse = await apiRequest.json();

      if (result.error || !result.topalbums?.album) {
        const apiErrorMessage = result.message || 'No top albums found or unknown API error';
        console.warn(
          `[API Route] Last.fm API returned: ${apiErrorMessage}`,
          result.error ? `Code: ${result.error}` : ''
        );

        if (result.error) {
          const errorMessage = `Last.fm API Error ${result.error}: ${apiErrorMessage}`;
          albumsCache.set(cacheKey, {
            data: null,
            timestamp: now,
            error: errorMessage,
          });
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
          });
        } else {
          albumsCache.set(cacheKey, { data: [], timestamp: now, error: null });
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
            },
          });
        }
      }

      const transformedAlbums = result.topalbums.album.map((album) => ({
        name: album.name,
        artist: {
          name: album.artist.name,
          url: album.artist.url,
        },
        image: album.image.find((img) => img.size === 'extralarge')?.['#text'] || null,
        playcount: Number.parseInt(album.playcount, 10),
        url: album.url,
      }));

      const topAlbumsData = await validateAlbumCovers(transformedAlbums);

      albumsCache.set(cacheKey, {
        data: topAlbumsData,
        timestamp: now,
        error: null,
      });
      console.warn(`[API Route] Cached data for ${cacheKey}`);

      return new Response(JSON.stringify(topAlbumsData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
        },
      });
    } catch (err) {
      console.error(`[API Route] Attempt ${attempt} failed for ${username}:`, err);

      if (attempt < MAX_RETRIES) {
        console.warn(
          `[API Route] Retrying fetch in ${RETRY_DELAY_MS}ms (Attempt ${attempt + 1}/${MAX_RETRIES})...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error(`[API Route] Max retries reached for ${username}.`);
        const errorMessage = `An unexpected server error occurred after retries: ${err instanceof Error ? err.message : String(err)}`;

        albumsCache.set(cacheKey, {
          data: null,
          timestamp: now,
          error: errorMessage,
        });

        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          { status: 500 }
        );
      }
    }
  }

  const finalErrorMessage = `An unexpected error occurred after all retries for ${username}.`;
  albumsCache.set(cacheKey, {
    data: null,
    timestamp: now,
    error: finalErrorMessage,
  });
  return new Response(JSON.stringify({ error: finalErrorMessage }), {
    status: 500,
  });
};
