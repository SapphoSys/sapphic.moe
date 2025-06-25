import { Icon } from '@iconify/react';
import { type FC, useEffect, useRef, useState } from 'react';

import Zoom from '$components/base/zoom/Zoom.tsx';
import useLastFMTrack from '$hooks/useLastFM';
import { LASTFM_PLACEHOLDER_IMAGE } from '$utils/constants';
import { getReducedMotionImage } from '$utils/helpers/image';
import { cn } from '$utils/helpers/misc';

import '$styles/zoom.css';

export interface LastFMTrackProps {
  username: string;
}

const LastFMTrack: FC<LastFMTrackProps> = ({ username }) => {
  const { data, loading, isRefreshing, error } = useLastFMTrack(username);
  const [showNoCoverFallback, setShowNoCoverFallback] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isGif, setIsGif] = useState(false);
  const [staticImageUrl, setStaticImageUrl] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (data?.track.image) {
      const isPlaceholder = data.track.image === LASTFM_PLACEHOLDER_IMAGE;
      setShowNoCoverFallback(isPlaceholder);

      if (!isPlaceholder) {
        setIsGif(data.track.image.toLowerCase().endsWith('.gif'));

        getReducedMotionImage(data.track.image, prefersReducedMotion)
          .then((url) => setStaticImageUrl(url))
          .catch(() => setStaticImageUrl(null));
      }
    } else {
      setShowNoCoverFallback(true);
    }
  }, [data, prefersReducedMotion]);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  if (loading && !initialLoadComplete) {
    return (
      <div
        className="flex flex-row items-center justify-center gap-2 rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-center dark:border-ctp-pink"
        role="status"
        aria-live="polite"
      >
        <Icon
          icon="line-md:loading-loop"
          fontSize={30}
          aria-hidden={true}
          className="text-ctp-mauve dark:text-ctp-pink"
        />
        Loading track...
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
        <div className={cn(initialLoadComplete && 'animate-fade-in-up')}>
          Error loading Last.fm track: {error.message}
        </div>
        <div className="h-0" />
      </div>
    );
  }

  if (initialLoadComplete && !data) {
    return (
      <div
        className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-subtext1 dark:border-ctp-pink"
        role="alert"
        aria-live="polite"
      >
        <div className={cn(initialLoadComplete && 'animate-fade-in-up')}>
          No recent Last.fm track found for {username}.
        </div>
        <div className="h-0" />
      </div>
    );
  }

  if (!data) return null;

  const { isPlaying, track } = data;

  return (
    <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
      <div
        className={cn(
          'flex flex-row items-center gap-4',
          initialLoadComplete && 'animate-fade-in-up'
        )}
      >
        <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-ctp-crust">
          {track.image !== null && !showNoCoverFallback && (
            <Zoom disableTooltip={true} key={track.image}>
              <img
                ref={imgRef}
                src={staticImageUrl || track.image}
                alt={`Cover art for the album "${track.album.name}" by ${track.artist.name}`}
                className={cn('h-full w-full rounded-md object-cover', isGif && 'gif-cover-art')}
                width={80}
                height={80}
                onError={() => setShowNoCoverFallback(true)}
                crossOrigin="anonymous"
              />
            </Zoom>
          )}
          {(track.image === null || showNoCoverFallback) && (
            <Icon icon="mdi:disc" fontSize={40} aria-hidden={true} className="text-ctp-surface2" />
          )}
        </div>
        <div className="group flex w-full min-w-0 flex-col">
          <div className="flex grow flex-row items-center justify-between text-center">
            <h2 className="text-base text-ctp-subtext1">
              {isPlaying ? (
                <div className="flex flex-row items-center gap-x-1">
                  <p>Now playing</p>
                  <Icon icon="mdi:play" fontSize={18} aria-hidden={true} />
                </div>
              ) : (
                <div className="flex flex-row items-center gap-x-1">
                  <p>Last played</p>
                  <Icon icon="mdi:pause" fontSize={18} aria-hidden={true} />
                </div>
              )}
            </h2>
            <a
              href={`https://www.last.fm/user/${username}`}
              target="_blank"
              title="View our Last.fm profile"
              aria-label="View our Last.fm profile"
              className="rounded"
              rel="noreferrer"
            >
              <Icon icon="mdi:lastfm" fontSize={24} aria-hidden={true} />
            </a>
          </div>
          <p className="truncate text-lg font-semibold text-ctp-text group-focus-within:overflow-visible group-focus-within:text-clip group-focus-within:whitespace-normal md:text-xl">
            <a
              href={`https://www.last.fm/music/${track.artist.name.replace(/ /g, '+')}/_/${track.name.replace(/ /g, '+')}`}
              target="_blank"
              title={`View "${track.name}" by "${track.artist.name}" on Last.fm`}
              className="rounded"
              rel="noreferrer"
            >
              {track.name}
            </a>
          </p>
          <div className="flex min-w-0 flex-row items-center justify-between gap-2">
            <p className="truncate text-lg text-ctp-text group-focus-within:overflow-visible group-focus-within:text-clip group-focus-within:whitespace-normal md:text-xl">
              <a
                href={`https://www.last.fm/music/${track.artist.name.replace(/ /g, '+')}`}
                target="_blank"
                title={`View "${track.artist.name}" on Last.fm`}
                className="rounded"
                rel="noreferrer"
              >
                {track.artist.name}
              </a>
            </p>
            {isRefreshing && initialLoadComplete && (
              <Icon
                icon="line-md:loading-loop"
                fontSize={20}
                aria-hidden={true}
                className="shrink-0 text-ctp-pink motion-reduce:hidden"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastFMTrack;
