import type { APIRoute } from 'astro';
import { LANYARD_API_URL } from 'astro:env/server';

import type { LanyardApiResponse, LanyardData } from '$types/lanyard';
import { createForbiddenResponse, validateUsername } from '$utils/helpers/api';

interface CacheEntry {
  data: LanyardData | null;
  timestamp: number;
  failureCount: number;
}

const lanyardCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 30 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000;

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const userId = url.searchParams.get('userId');

  if (!userId) {
    console.error('[API Route] Lanyard user ID parameter is missing or empty.');
    return new Response(JSON.stringify({ error: 'Missing required parameter: userId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!validateUsername('discordID', userId)) {
    console.error(`[API Route] Invalid Discord ID provided. (User provided: ${userId})`);
    return createForbiddenResponse();
  }

  const cacheKey = `lanyard_${userId}`;
  const cachedEntry = lanyardCache.get(cacheKey);
  const now = Date.now();

  if (
    cachedEntry &&
    cachedEntry.failureCount >= MAX_RETRIES &&
    now - cachedEntry.timestamp < FAILURE_COOLDOWN_MS
  ) {
    console.warn(`[API Route] Using cached data for ${cacheKey} due to previous failures`);
    return new Response(
      JSON.stringify({ discord_status: cachedEntry.data?.discord_status ?? 'offline' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    console.warn(`[API Route] Cache hit for ${cacheKey}`);
    return new Response(
      JSON.stringify({ discord_status: cachedEntry.data?.discord_status ?? 'offline' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const API_URL = `${LANYARD_API_URL}/v1/users/${userId}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const apiRequest = await fetch(API_URL, {
        headers: {
          'User-Agent': 'sapphic.moe Lanyard API Proxy (Astro)',
        },
      });

      if (!apiRequest.ok) {
        const errorBody = await apiRequest.text();
        console.error(
          `[API Route] Lanyard API HTTP error ${apiRequest.status} for user ${userId}: ${errorBody}`
        );

        if (attempt < MAX_RETRIES && apiRequest.status >= 500) {
          console.warn(
            `[API Route] Retrying Lanyard fetch in ${RETRY_DELAY_MS}ms (Attempt ${attempt + 1}/${MAX_RETRIES})...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        } else {
          lanyardCache.set(cacheKey, {
            data: cachedEntry?.data ?? null,
            timestamp: now,
            failureCount: (cachedEntry?.failureCount ?? 0) + 1,
          });

          if (cachedEntry?.data) {
            console.warn(`[API Route] Returning cached data for ${cacheKey} after failure`);
            return new Response(
              JSON.stringify({ discord_status: cachedEntry.data.discord_status ?? 'offline' }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }

          const errorMessage = `Lanyard API HTTP error: Status ${apiRequest.status}. ${errorBody || apiRequest.statusText}`;
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: apiRequest.status >= 400 ? apiRequest.status : 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      const result: LanyardApiResponse = await apiRequest.json();

      if (!result.success) {
        const apiErrorMessage = result.error || 'Unknown Lanyard API error';
        console.warn(
          `[API Route] Lanyard API returned success: false for user ${userId}. Error: ${apiErrorMessage}`
        );

        lanyardCache.set(cacheKey, {
          data: cachedEntry?.data ?? null,
          timestamp: now,
          failureCount: (cachedEntry?.failureCount ?? 0) + 1,
        });

        if (cachedEntry?.data) {
          console.warn(`[API Route] Returning cached data for ${cacheKey} after API error`);
          return new Response(
            JSON.stringify({ discord_status: cachedEntry.data.discord_status ?? 'offline' }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            data: null,
            error: apiErrorMessage,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      lanyardCache.set(cacheKey, {
        data: result.data,
        timestamp: now,
        failureCount: 0,
      });

      return new Response(
        JSON.stringify({ discord_status: result.data?.discord_status ?? 'offline' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      console.error(`[API Route] Attempt ${attempt} failed for user ${userId}:`, err);

      if (attempt < MAX_RETRIES) {
        console.warn(
          `[API Route] Retrying fetch in ${RETRY_DELAY_MS}ms (Attempt ${attempt + 1}/${MAX_RETRIES})...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error(`[API Route] Max retries reached for user ${userId}.`);

        lanyardCache.set(cacheKey, {
          data: cachedEntry?.data ?? null,
          timestamp: now,
          failureCount: (cachedEntry?.failureCount ?? 0) + 1,
        });

        if (cachedEntry?.data) {
          console.warn(`[API Route] Returning cached data for ${cacheKey} after max retries`);
          return new Response(
            JSON.stringify({ discord_status: cachedEntry.data.discord_status ?? 'offline' }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const errorMessage = `An unexpected server error occurred after retries: ${err instanceof Error ? err.message : String(err)}`;
        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  if (cachedEntry?.data) {
    console.warn(`[API Route] Returning cached data for ${cacheKey} at end of retries`);
    return new Response(
      JSON.stringify({ discord_status: cachedEntry.data.discord_status ?? 'offline' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const finalErrorMessage = `An unexpected error occurred after all retries for user ${userId}.`;
  return new Response(JSON.stringify({ error: finalErrorMessage }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};
