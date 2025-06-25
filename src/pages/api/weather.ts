import type { APIRoute } from 'astro';
import { OWM_API_KEY } from 'astro:env/server';

import type { ApiWeatherData, OpenWeatherMapApiResponse, WeatherCacheEntry } from '$types/weather';
import { createForbiddenResponse, validateLocation } from '$utils/helpers/api';

const weatherCache = new Map<string, WeatherCacheEntry>();

const CACHE_DURATION_MS = 30 * 60 * 1000;

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const location = url.searchParams.get('location');
  const fetchUnit = 'metric';

  if (!location) {
    console.error('[API Route] Location parameter is missing or empty.');
    return new Response(JSON.stringify({ error: 'Missing required parameter: location' }), {
      status: 400,
    });
  }

  if (!validateLocation(location)) {
    console.error(`[API Route] Invalid location provided. (User provided: ${location})`);
    return createForbiddenResponse('Forbidden: Location does not match configured value');
  }

  const cacheKey = `${location}_${fetchUnit}`;

  const cachedEntry = weatherCache.get(cacheKey);
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

  console.warn(`[API Route] Cache miss/expired for ${cacheKey}, fetching from OWM (metric)...`);

  if (!OWM_API_KEY) {
    console.error('[API Route] OpenWeatherMap API key not configured.');
    return new Response(
      JSON.stringify({
        error: 'OpenWeatherMap API key not configured on the server.',
      }),
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      q: location,
      appid: OWM_API_KEY,
      units: fetchUnit,
    });

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;

    const apiRequest = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Sapphic.moe Weather API Proxy (Astro)' },
    });

    if (!apiRequest.ok) {
      const errorBody = await apiRequest.json().catch(() => ({ message: apiRequest.statusText }));
      console.error(
        `[API Route] OWM HTTP error ${apiRequest.status}: ${errorBody.message || apiRequest.statusText}`
      );
      return new Response(
        JSON.stringify({
          error: `Weather API error from OWM: ${errorBody.message || apiRequest.statusText}`,
        }),
        { status: apiRequest.status }
      );
    }

    const result: OpenWeatherMapApiResponse = await apiRequest.json();

    if (result.cod !== 200) {
      console.error(
        `[API Route] OWM API error ${result.cod}: ${result.message || 'Unknown API error'}`
      );
      return new Response(
        JSON.stringify({
          error: `Weather API Error from OWM ${result.cod}: ${result.message || 'Unknown API error'}`,
        }),
        { status: 500 }
      );
    }

    if (!result.weather?.[0] || !result.main || !result.name || !result.sys?.country) {
      console.error('[API Route] OWM API returned incomplete data.');
      return new Response(
        JSON.stringify({
          error: 'Weather data received from OWM was incomplete.',
        }),
        { status: 500 }
      );
    }

    const processedData: ApiWeatherData = {
      city: result.name,
      country: result.sys.country,
      temperature: Math.round(result.main.temp),
      description: result.weather[0].description,
      iconCode: result.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png`,
      feelsLike: Math.round(result.main.feels_like),
      windSpeed: result.wind.speed,
      unit: fetchUnit,
    };

    weatherCache.set(cacheKey, { data: processedData, timestamp: now });
    console.warn(`[API Route] Cached data for ${cacheKey}`);

    return new Response(JSON.stringify(processedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION_MS / 1000)}`,
      },
    });
  } catch (err) {
    console.error('[API Route] Unexpected error during fetch or processing:', err);
    return new Response(
      JSON.stringify({
        error: `An unexpected server error occurred: ${err instanceof Error ? err.message : String(err)}`,
      }),
      { status: 500 }
    );
  }
};
