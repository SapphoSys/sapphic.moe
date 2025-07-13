import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { LanyardStatusResponse, UseLanyardResult } from '$types/lanyard';

const useLanyard = (userId: string, refreshInterval = 5000): UseLanyardResult => {
  const [data, setData]: [
    LanyardStatusResponse | null,
    Dispatch<SetStateAction<LanyardStatusResponse | null>>,
  ] = useState<LanyardStatusResponse | null>(null);
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
  const [isRefreshing, setIsRefreshing]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  const [error, setError]: [Error | null, Dispatch<SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  useEffect(() => {
    let intervalId: number | null;

    const fetchLanyardData = async (isInitialFetch: boolean) => {
      if (isInitialFetch) {
        setLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      if (!userId) {
        const paramError = new Error('Discord user ID is required for Lanyard.');
        setError(paramError);
        setData(null);

        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);

        console.error(paramError.message);
        return;
      }

      try {
        const params = new URLSearchParams({ userId });
        const fetchUrl = `/api/lanyard?${params.toString()}`;

        const request = await fetch(fetchUrl);
        const result: LanyardStatusResponse | { error: string } | null = await request.json();

        if (!request.ok || (result && 'error' in result)) {
          const errorMessage =
            (result && 'error' in result && result.error) ||
            `API Route HTTP error: Status ${request.status}`;
          throw new Error(errorMessage);
        }

        if (result === null) {
          setData(null);
          setError(null);
        } else {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch Lanyard data from API route:', err);
        setError(err instanceof Error ? err : new Error(`An unexpected error occurred: ${err}`));
        setData(null);
      } finally {
        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);
      }
    };

    fetchLanyardData(true);

    if (refreshInterval > 0) {
      intervalId = window.setInterval(() => {
        fetchLanyardData(false);
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [userId, refreshInterval]);

  return { data, loading, isRefreshing, error };
};

export default useLanyard;
