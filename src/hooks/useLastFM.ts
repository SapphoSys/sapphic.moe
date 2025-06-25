import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { LastFMTrackData, UseLastFMTrackResult } from '$types/lastfm';

const useLastFMTrack = (username: string, refreshInterval = 30000): UseLastFMTrackResult => {
  const [data, setData]: [
    LastFMTrackData | null,
    Dispatch<SetStateAction<LastFMTrackData | null>>,
  ] = useState<LastFMTrackData | null>(null);
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
  const [isRefreshing, setIsRefreshing]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  const [error, setError]: [Error | null, Dispatch<SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  useEffect(() => {
    let intervalId: number | null;

    const fetchTrack = async (isInitialFetch: boolean) => {
      if (isInitialFetch) {
        setLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      if (!username) {
        const paramError = new Error('Last.fm username is required.');
        setError(paramError);
        setData(null);

        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);

        console.error(paramError.message);
        return;
      }

      try {
        const params = new URLSearchParams({ username });

        const fetchUrl = `/api/lastfm/recent?${params.toString()}`;
        const request = await fetch(fetchUrl);

        const result = await request.json();

        if (!request.ok || result.error) {
          const errorMessage = result.error || `API Route HTTP error: Status ${request.status}`;
          throw new Error(errorMessage);
        }

        if (result === null) {
          setData(null);
          setError(null);
        } else {
          const processedData: LastFMTrackData = result;
          setData(processedData);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch Last.fm data from API route:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isMaxRetries = errorMessage.includes('Max retries reached');

        setError(
          new Error(
            isMaxRetries
              ? 'Could not connect to Last.fm. Please refresh the page to try again.'
              : errorMessage
          )
        );
        setData(null);

        if (isMaxRetries && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } finally {
        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);
      }
    };

    fetchTrack(true);

    if (refreshInterval > 0) {
      intervalId = window.setInterval(() => {
        fetchTrack(false);
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [username, refreshInterval]);

  return { data, loading, isRefreshing, error };
};

export default useLastFMTrack;
