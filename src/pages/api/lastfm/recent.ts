import type { APIRoute } from 'astro';
import { LASTFM_API_KEY } from 'astro:env/server';

import type { LastFMApiResponse, LastFMRawTrack, LastFMTrackData } from '$types/lastfm';
import { createForbiddenResponse, validateUsername } from '$utils/helpers/api';

interface CacheEntry {
  data: LastFMTrackData | null;
  timestamp: number;
  error: string | null;
}
const lastFmCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 30 * 1000;

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const username = url.searchParams.get('username');

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

  const cacheKey = `recenttracks_${username}`;
  const cachedEntry = lastFmCache.get(cacheKey);
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

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const params = new URLSearchParams({
        method: 'user.getRecentTracks',
        user: username,
        api_key: LASTFM_API_KEY,
        limit: '1',
        format: 'json',
      });

      const apiUrl = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;

      const apiRequest = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'sapphic.moe Last.fm API Proxy (Astro)',
        },
      });

      if (!apiRequest.ok) {
        const errorBody = await apiRequest.json().catch(() => ({ message: apiRequest.statusText }));
        console.error(
          `[API Route] Last.fm API HTTP error ${apiRequest.status}: ${errorBody.message || apiRequest.statusText}`
        );

        if (attempt < MAX_RETRIES && apiRequest.status >= 500) {
          console.warn(
            `[API Route] Retrying Last.fm fetch in ${RETRY_DELAY_MS}ms (Attempt ${attempt + 1}/${MAX_RETRIES})...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        } else {
          const errorMessage = `Last.fm API HTTP error: Status ${apiRequest.status}. ${errorBody.message || apiRequest.statusText}`;
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: apiRequest.status >= 400 ? apiRequest.status : 500,
          });
        }
      }

      const result: LastFMApiResponse = await apiRequest.json();

      if (result.error || !result.recenttracks?.track?.[0]) {
        const apiErrorMessage = result.message || 'No recent track found or unknown API error';
        console.warn(
          `[API Route] Last.fm API returned: ${apiErrorMessage}`,
          result.error ? `Code: ${result.error}` : ''
        );

        if (result.error) {
          const errorMessage = `Last.fm API Error ${result.error}: ${apiErrorMessage}`;
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
          });
        } else {
          const processedData: LastFMTrackData | null = null;
          return new Response(JSON.stringify(processedData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
            },
          });
        }
      }

      const trackData: LastFMRawTrack = result.recenttracks.track[0];

      const albumName = trackData.album['#text'] ?? null;
      const artistName = trackData.artist['#text'];

      const albumUrl =
        albumName && artistName
          ? `https://www.last.fm/music/${encodeURIComponent(artistName)}/${encodeURIComponent(albumName)}`
          : null;

      const processedData: LastFMTrackData = {
        isPlaying: trackData['@attr']?.nowplaying === 'true',
        track: {
          name: trackData.name,
          artist: {
            name: artistName,
            url: trackData.artist.url,
          },
          album: {
            name: albumName,
            url: albumUrl,
          },
          image: trackData.image.find((img) => img.size === 'extralarge')?.['#text'] || null,
        },
        timestamp: trackData.date ? Number.parseInt(trackData.date.uts, 10) : undefined,
      };

      lastFmCache.set(cacheKey, { data: processedData, timestamp: now, error: null });
      console.warn(`[API Route] Cached data for ${cacheKey}`);

      return new Response(JSON.stringify(processedData), {
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
        const errorMessage = `Max retries reached. Unable to fetch Last.fm data at this time.`;
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
  return new Response(JSON.stringify({ error: finalErrorMessage }), {
    status: 500,
  });
};
