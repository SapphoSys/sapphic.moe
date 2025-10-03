import { FaSpinner } from 'react-icons/fa';
import { type FC, useEffect, useState } from 'react';

import AnimeCard from '$components/misc/AniListCard.tsx';
import useAniList from '$hooks/useAniList';
import { cn } from '$utils/helpers/misc';

export interface RecentlyCompletedAnimeProps {
  username: string;
  limit?: number;
}

const AniListCompleted: FC<RecentlyCompletedAnimeProps> = ({ username, limit = 8 }) => {
  const { data, loading, isRefreshing, error } = useAniList(username, 300000, limit);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  if (loading && !initialLoadComplete) {
    return (
      <div
        className="flex flex-row items-center justify-center gap-2 rounded-md border-2 border-ctp-pink bg-ctp-mantle p-4 text-center"
        role="status"
        aria-live="polite"
      >
        <FaSpinner size={30} aria-hidden={true} className="animate-spin text-ctp-pink" />
        Loading recently completed anime...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-mauve dark:border-ctp-pink dark:text-ctp-pink"
        role="alert"
        aria-live="assertive"
      >
        <div className={cn('animate-fade-in-up')}>Error loading anime data: {error.message}</div>
      </div>
    );
  }

  if (!data?.recentlyCompleted || data.recentlyCompleted.length === 0) {
    return (
      <div
        className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-subtext1 dark:border-ctp-pink"
        role="alert"
        aria-live="polite"
      >
        <div className={cn('animate-fade-in-up')}>No recently completed anime found.</div>
      </div>
    );
  }

  return (
    <div className="not-prose">
      <div
        className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4', 'animate-fade-in-up')}
        role="region"
        aria-label="Recently completed anime"
      >
        {data.recentlyCompleted.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} showProgress={false} />
        ))}
      </div>
      {isRefreshing && initialLoadComplete && (
        <div className="flex justify-center">
          <FaSpinner
            size={20}
            aria-hidden={true}
            className="animate-spin text-ctp-pink motion-reduce:hidden"
          />
        </div>
      )}
    </div>
  );
};

export default AniListCompleted;
