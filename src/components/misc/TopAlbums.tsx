import { Icon } from '@iconify/react';
import { type FC, useEffect, useState } from 'react';

import useLastFMTopAlbums from '$hooks/useAlbums';
import { getReducedMotionImage } from '$utils/helpers/image';
import { cn } from '$utils/helpers/misc';

export interface TopAlbumsProps {
  username: string;
  period?: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month';
  limit?: number;
}

const TopAlbums: FC<TopAlbumsProps> = ({ username, period = '12month', limit = 20 }) => {
  const {
    data: topAlbums,
    loading,
    error,
  } = useLastFMTopAlbums(username, period, Math.ceil(limit * 1.2));
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [albumStaticImages, setAlbumStaticImages] = useState<Record<string, string>>({});
  const [gifAlbums, setGifAlbums] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (topAlbums?.length) {
      const gifUrls: Record<string, boolean> = {};

      topAlbums.forEach((album) => {
        if (album.image) gifUrls[album.image] = album.image.toLowerCase().endsWith('.gif');
      });

      setGifAlbums(gifUrls);

      if (prefersReducedMotion) {
        const loadStaticImages = async () => {
          const staticImages: Record<string, string> = {};
          for (const album of topAlbums) {
            if (album.image && gifUrls[album.image]) {
              try {
                const staticUrl = await getReducedMotionImage(album.image, prefersReducedMotion);
                if (staticUrl) staticImages[album.image] = staticUrl;
              } catch (error) {
                console.error('Failed to convert GIF to static image:', error);
              }
            }
          }
          setAlbumStaticImages(staticImages);
        };
        loadStaticImages();
      }
    }
  }, [topAlbums, prefersReducedMotion]);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  if (loading || !initialLoadComplete) {
    return (
      <div
        className="not-prose flex flex-row items-center justify-center gap-2 rounded-md border-2 border-ctp-pink bg-ctp-mantle p-4 text-center"
        role="status"
        aria-live="polite"
      >
        <Icon
          icon="line-md:loading-loop"
          fontSize={30}
          aria-hidden={true}
          className="text-ctp-pink"
        />
        Loading top albums...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="not-prose flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-pink dark:border-ctp-pink"
        role="alert"
        aria-live="assertive"
      >
        <div className={cn('animate-fade-in-up')}>Error loading top albums: {error.message}</div>
      </div>
    );
  }

  if (!topAlbums?.length) {
    return (
      <div
        className="not-prose flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-subtext1 dark:border-ctp-pink"
        role="status"
        aria-live="polite"
      >
        <div className={cn('animate-fade-in-up')}>
          No albums found for {username} in the last {period}.
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose">
      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4',
          'animate-fade-in-up'
        )}
        role="region"
        aria-label={`Top ${limit} albums for ${username} in the last ${period}`}
      >
        {topAlbums.slice(0, limit).map((album) => (
          <a
            key={album.url}
            href={album.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group relative block aspect-square overflow-hidden rounded-md',
              'border-2 border-transparent',
              'hover:border-ctp-mauve hover:opacity-100 dark:hover:border-ctp-pink',
              'focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-base dark:focus:ring-ctp-pink'
            )}
            aria-label={`${album.name} by ${album.artist.name} - ${album.playcount} plays. View on Last.fm.`}
          >
            {album.image && (
              <img
                src={albumStaticImages[album.image] || album.image}
                alt={`Cover art for ${album.name} by ${album.artist.name}`}
                className={cn(
                  'h-full w-full object-cover',
                  'motion-safe:transition motion-safe:duration-300',
                  'group-hover:opacity-90',
                  'group-hover:blur-sm',
                  gifAlbums[album.image] ? 'gif-cover-art' : ''
                )}
                loading="lazy"
              />
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-ctp-mantle/60 p-4 text-center opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-300">
              <p className="line-clamp-1 w-full text-xl font-bold text-ctp-text sm:line-clamp-2 md:line-clamp-3">
                {album.name}
              </p>
              <p className="w-full text-base text-ctp-text">{album.artist.name}</p>
              <p className="text-sm text-ctp-text">{album.playcount} plays</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TopAlbums;
