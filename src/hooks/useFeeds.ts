import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { FeedItem } from '$types/feeds';

export interface UseFeedsResult {
  data: FeedItem[];
  loading: boolean;
  error: string | null;
}

const useFeeds = (apiUrl: string): UseFeedsResult => {
  const [data, setData]: [FeedItem[], Dispatch<SetStateAction<FeedItem[]>>] = useState<FeedItem[]>(
    []
  );
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
  const [error, setError]: [string | null, Dispatch<SetStateAction<string | null>>] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          const errorBody = await apiResponse
            .json()
            .catch(() => ({ message: apiResponse.statusText }));

          console.error(
            `[useFeeds] API Error ${apiResponse.status}:`,
            errorBody.message || apiResponse.statusText
          );

          setError(`Failed to load feeds: ${errorBody.message || apiResponse.statusText}`);
          setData([]);
        } else {
          const feedItems = (await apiResponse.json()) as FeedItem[];
          setData(feedItems);
          setError(null);
        }
      } catch (err) {
        console.error('[useFeeds] Network error fetching feeds:', err);
        setError('An error occurred while trying to fetch the feeds.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [apiUrl]);

  return { data, loading, error };
};

export default useFeeds;
