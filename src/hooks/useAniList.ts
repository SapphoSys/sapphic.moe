import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { AniListData } from '$types/anilist';

const useAniList = (
  username: string,
  refreshInterval = 300000,
  limit = 8
): {
  data: AniListData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: Error | null;
} => {
  const [data, setData]: [AniListData | null, Dispatch<SetStateAction<AniListData | null>>] =
    useState<AniListData | null>(null);
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
  const [isRefreshing, setIsRefreshing]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  const [error, setError]: [Error | null, Dispatch<SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: number;

    const fetchAniList = async (isInitialFetch: boolean) => {
      if (isInitialFetch) {
        setLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      if (!username?.trim()) {
        const paramError = new Error('AniList username is required.');
        setError(paramError);
        setData(null);

        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);

        console.error(paramError.message);
        return;
      }

      try {
        const encodedUsername = encodeURIComponent(username.trim());
        const params = new URLSearchParams({
          username: encodedUsername,
          limit: limit.toString(),
        });
        const fetchUrl = `/api/anilist?${params.toString()}`;
        console.warn('Fetching from URL:', fetchUrl);

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
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch AniList data from API route:', err);
        setError(err instanceof Error ? err : new Error(`An unexpected error occurred: ${err}`));
        setData(null);
      } finally {
        if (isInitialFetch) setLoading(false);
        if (!isInitialFetch) setIsRefreshing(false);
      }
    };

    fetchAniList(true);

    if (refreshInterval > 0) {
      timeoutId = window.setInterval(() => {
        fetchAniList(false);
      }, refreshInterval);
    }

    return () => {
      if (timeoutId) {
        window.clearInterval(timeoutId);
      }
    };
  }, [username, refreshInterval, limit]);

  return { data, loading, isRefreshing, error };
};

export default useAniList;
