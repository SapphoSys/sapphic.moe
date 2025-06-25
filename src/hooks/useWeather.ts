import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { ApiWeatherData } from '$types/weather';

export type WeatherData = ApiWeatherData;

export interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: Error | null;
}

const useWeather = (
  location: string,
  unit: 'metric' | 'imperial' = 'metric',
  refreshInterval = 600000
): UseWeatherResult => {
  const [data, setData]: [WeatherData | null, Dispatch<SetStateAction<WeatherData | null>>] =
    useState<WeatherData | null>(null);
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
  const [isRefreshing, setIsRefreshing]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  const [error, setError]: [Error | null, Dispatch<SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  useEffect(() => {
    let intervalId: number | null;

    const fetchWeather = async (isInitialFetch: boolean) => {
      if (isInitialFetch) {
        setLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      if (!location) {
        const paramError = new Error('Weather location is required.');
        setError(paramError);
        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);
        console.error(paramError.message);
        return;
      }

      try {
        const params = new URLSearchParams({
          location: location,
          unit: unit,
        });

        const fetchUrl = `/api/weather?${params.toString()}`;
        const request = await fetch(fetchUrl);

        const result = await request.json();

        if (!request.ok || result.error) {
          throw new Error(result.error || `API Route HTTP error: Status ${request.status}`);
        }

        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch weather from API route:', err);
        setError(err instanceof Error ? err : new Error(`An unexpected error occurred: ${err}`));
        setData(null);
      } finally {
        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);
      }
    };

    fetchWeather(true);

    if (refreshInterval > 0) {
      intervalId = window.setInterval(() => {
        fetchWeather(false);
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [location, unit, refreshInterval]);

  return { data, loading, isRefreshing, error };
};

export default useWeather;
