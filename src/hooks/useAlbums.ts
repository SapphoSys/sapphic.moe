import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { LastFMAlbum, UseLastFMTopAlbumsResult } from '$types/lastfm';

const useLastFMTopAlbums = (
  username: string,
  period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = '12month',
  limit = 20
): UseLastFMTopAlbumsResult => {
  const [data, setData]: [LastFMAlbum[] | null, Dispatch<SetStateAction<LastFMAlbum[] | null>>] =
    useState<LastFMAlbum[] | null>(null);
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
  const [error, setError]: [Error | null, Dispatch<SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!username) {
        const paramError = new Error('Last.fm username is required.');
        setError(paramError);
        setLoading(false);
        console.error(paramError.message);
        return;
      }

      try {
        const params = new URLSearchParams({
          username,
          period,
          limit: limit.toString(),
        });

        const request = await fetch(`/api/lastfm/albums?${params.toString()}`);

        if (!request.ok) {
          let errorMessage = `API Route HTTP error: Status ${request.status}`;

          try {
            const errorResponse = await request.json();
            if (errorResponse.error) {
              errorMessage = errorResponse.error;
            }
          } catch (_e) {
            /* empty */
          }

          throw new Error(errorMessage);
        }

        const albums: LastFMAlbum[] = await request.json();
        setData(albums);
        setError(null);
      } catch (err) {
        console.error('Error fetching top albums:', err);
        setError(err instanceof Error ? err : new Error(`An unexpected error occurred: ${err}`));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, period, limit]);

  return { data, loading, error };
};

export default useLastFMTopAlbums;
