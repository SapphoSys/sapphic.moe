import {
  FaSpinner,
  FaPlay,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaCompactDisc,
} from 'react-icons/fa';
import { SiMusicbrainz } from 'react-icons/si';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Blurhash } from 'react-blurhash';
import useListenBrainzTrack from '$hooks/useListenBrainzTrack';
import { cn } from '$utils/helpers/misc';
import Zoom from '$components/base/zoom/Zoom.tsx';

import '$styles/zoom.css';

export interface ListenBrainzTrackProps {
  username: string;
}

const ListenBrainzTrack: React.FC<ListenBrainzTrackProps> = ({ username }) => {
  // Track previous track to animate on change
  // Animation phase: 'initial' (first track), 'track-change' (subsequent), 'none' (no animation)
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'track-change' | 'none'>('none');
  const prevTrackRef = React.useRef<string | null>(null);
  const prevCoverArtUrlRef = React.useRef<string | null>(null);

  const { data, loading, isRefreshing, error } = useListenBrainzTrack(username);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showNoCoverFallback, setShowNoCoverFallback] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine cover art URL (proxy through API for caching)
  let coverArtUrl: string | null = null;

  // Prefer coverArtUrl from API, then construct from release_mbid, finally fall back to originUrl
  if (data?.coverArtUrl) {
    coverArtUrl = `/api/listenbrainz/cover?url=${encodeURIComponent(data.coverArtUrl)}`;
  } else if (data?.release_mbid) {
    coverArtUrl = `/api/listenbrainz/cover?url=${encodeURIComponent(`https://coverartarchive.org/release/${data.release_mbid}/front`)}`;
  } else if (data?.originUrl && data.originUrl.match(/(\.jpg$|\.png$|\.webp$|\.jpeg$)/i)) {
    coverArtUrl = `/api/listenbrainz/cover?url=${encodeURIComponent(data.originUrl)}`;
  }

  // Debug logging
  if (data && process.env.NODE_ENV === 'development') {
    console.log('ListenBrainz Debug:', {
      track: data.track,
      release_mbid: data.release_mbid,
      coverArtUrl,
      blurhash: data.blurhash,
      showNoCoverFallback,
      imageLoaded,
    });
  }

  useLayoutEffect(() => {
    // Check if coverArtUrl is available
    if (data) {
      const hasImages = coverArtUrl && coverArtUrl !== '';
      setShowNoCoverFallback(!hasImages);

      // Detect track change
      const trackChanged = data.track !== prevTrackRef.current;
      const coverArtChanged = coverArtUrl !== prevCoverArtUrlRef.current;

      // Reset loading states if cover art changed
      if (trackChanged && coverArtChanged) {
        console.log('Track and cover art changed, resetting image loading state');
        setImageLoaded(false);
      } else if (trackChanged && !coverArtChanged) {
        console.log('Track changed but cover art is the same, not resetting image loading state');
      }
    } else {
      setShowNoCoverFallback(true);
      setImageLoaded(false);
    }

    // Detect track change for animation
    if (data?.track) {
      if (prevTrackRef.current === null) {
        setAnimationPhase('initial');
      } else if (data.track !== prevTrackRef.current) {
        setAnimationPhase('track-change');
      }
      prevTrackRef.current = data.track;
      prevCoverArtUrlRef.current = coverArtUrl;
    }
  }, [data, coverArtUrl]);

  // Remove animation after one render cycle
  useEffect(() => {
    if (animationPhase !== 'none') {
      const timer = setTimeout(() => setAnimationPhase('none'), 800);
      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  useEffect(() => {
    // Only set initialLoadComplete after animationPhase is set
    if (!loading && !initialLoadComplete) {
      // If animationPhase is 'none', set to 'initial' first
      if (animationPhase === 'none' && data) {
        setAnimationPhase('initial');
        // Delay initialLoadComplete to next tick so animationPhase is set first
        setTimeout(() => setInitialLoadComplete(true), 0);
      } else {
        setInitialLoadComplete(true);
      }
    }
  }, [loading, initialLoadComplete, animationPhase, data]);

  if (loading && !initialLoadComplete) {
    return (
      <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
        <div className="animate-fade-in-up flex flex-row items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-ctp-crust">
            <FaSpinner className="animate-spin text-ctp-pink" size={40} aria-hidden={true} />
          </div>
          <div className="group flex w-full min-w-0 flex-col">
            <div className="flex grow flex-row items-center justify-between text-center">
              <h2 className="text-base text-ctp-subtext1">
                <div className="flex flex-row items-center gap-x-2">
                  <p>Loading track...</p>
                  <FaPlay size={10} aria-hidden={true} />
                </div>
              </h2>
              <span className="rounded">
                <SiMusicbrainz size={24} aria-hidden={true} />
              </span>
            </div>
            <p className="truncate text-lg font-semibold text-ctp-text md:text-xl">
              Loading name...
            </p>
            <div className="flex min-w-0 flex-row items-center justify-between gap-2">
              <p className="truncate text-lg text-ctp-text md:text-xl">Loading artist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
        <div
          className={cn(
            'flex flex-row items-center gap-4',
            initialLoadComplete && 'animate-fade-in-up'
          )}
        >
          <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-ctp-crust">
            <FaExclamationCircle size={40} aria-hidden={true} className="text-ctp-red" />
          </div>
          <div className="group flex w-full min-w-0 flex-col">
            <div className="flex grow flex-row items-center justify-between text-center">
              <h2 className="text-base text-ctp-subtext1">
                <div className="flex flex-row items-center gap-x-2">
                  <p>Error loading track</p>
                  <FaPlay size={10} aria-hidden={true} />
                </div>
              </h2>
              <span className="rounded">
                <SiMusicbrainz size={24} aria-hidden={true} />
              </span>
            </div>
            <p className="truncate text-lg font-semibold text-ctp-text md:text-xl">
              {error.message}
            </p>
            <div className="flex min-w-0 flex-row items-center justify-between gap-2">
              <p className="truncate text-lg text-ctp-text md:text-xl">Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoadComplete && !data) {
    return (
      <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
        <div
          className={cn(
            'flex flex-row items-center gap-4',
            initialLoadComplete && 'animate-fade-in-up'
          )}
        >
          <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-ctp-crust">
            <FaExclamationTriangle size={40} aria-hidden={true} className="text-ctp-yellow" />
          </div>
          <div className="group flex w-full min-w-0 flex-col">
            <div className="flex grow flex-row items-center justify-between text-center">
              <h2 className="text-base text-ctp-subtext1">
                <div className="flex flex-row items-center gap-x-2">
                  <p>Track unavailable</p>
                  <FaPlay size={10} aria-hidden={true} />
                </div>
              </h2>
              <span className="rounded">
                <SiMusicbrainz size={24} aria-hidden={true} />
              </span>
            </div>
            <p className="truncate text-lg font-semibold text-ctp-text md:text-xl">
              No track currently playing for {username}.
            </p>
            <div className="flex min-w-0 flex-row items-center justify-between gap-2">
              <p className="truncate text-lg text-ctp-text md:text-xl">No artist information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Build MusicBrainz track link (prefer direct links from API)
  let trackUrl: string;
  if (data.musicbrainz_track_url) {
    trackUrl = data.musicbrainz_track_url;
  } else if (data.recording_mbid) {
    trackUrl = `https://musicbrainz.org/recording/${data.recording_mbid}`;
  } else {
    trackUrl = `https://musicbrainz.org/search?query=${encodeURIComponent(data.track)}&type=recording`;
  }

  return (
    <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
      <div className="flex flex-row items-center gap-4">
        <div
          className={cn(
            'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ctp-crust',
            animationPhase === 'track-change'
              ? 'animate-fade-in'
              : animationPhase === 'initial'
                ? 'animate-fade-in-up'
                : ''
          )}
        >
          {!showNoCoverFallback && coverArtUrl ? (
            <div className="relative h-20 w-20">
              {/* BlurHash placeholder */}
              {data.blurhash && !imageLoaded && (
                <div className="absolute inset-0 h-20 w-20 overflow-hidden rounded-md">
                  <Blurhash
                    hash={data.blurhash}
                    width={80}
                    height={80}
                    resolutionX={32}
                    resolutionY={32}
                    punch={0.5}
                  />
                </div>
              )}

              {/* Cover art image */}
              {coverArtUrl && (
                <Zoom key={coverArtUrl}>
                  <img
                    src={coverArtUrl}
                    alt={`Cover art for the track \"${data.track}\" ${
                      data.artists &&
                      data.artists.length > 0 &&
                      `by ${data.artists
                        .map((response) => `${response.artist?.name}${response.joinphrase ?? ''}`)
                        .join('')}`
                    }`}
                    width={80}
                    height={80}
                    className={cn(
                      'absolute inset-0 h-20 w-20 rounded-md object-cover transition-opacity duration-700',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => {
                      setImageLoaded(true);
                    }}
                    onError={() => {
                      setShowNoCoverFallback(true);
                    }}
                    loading="eager"
                    fetchPriority="high"
                  />
                </Zoom>
              )}

              {/* Loading placeholder (only show if no blurhash) */}
              {!data.blurhash && !imageLoaded && (
                <div className="absolute inset-0 flex h-20 w-20 items-center justify-center">
                  <FaSpinner
                    size={40}
                    aria-hidden={true}
                    className="animate-pulse text-ctp-surface2"
                  />
                </div>
              )}
            </div>
          ) : (
            <FaCompactDisc size={40} aria-hidden={true} className="text-ctp-surface2" />
          )}
        </div>
        <div
          className={cn(
            'group flex w-full min-w-0 flex-col',
            animationPhase === 'track-change'
              ? 'animate-fade-in'
              : animationPhase === 'initial'
                ? 'animate-fade-in-up'
                : ''
          )}
        >
          <div className="flex grow flex-row items-center justify-between text-center">
            <h2 className="text-base text-ctp-subtext1">
              <div className="flex flex-row items-center gap-x-2">
                <p>Now playing</p>
                <FaPlay size={10} aria-hidden={true} />
              </div>
            </h2>

            <a
              href={`https://listenbrainz.org/user/${username}`}
              target="_blank"
              title="View ListenBrainz profile"
              aria-label="View ListenBrainz profile"
              className="rounded"
              rel="noreferrer"
              data-umami-event="ListenBrainz profile link click"
            >
              <SiMusicbrainz size={24} aria-hidden={true} />
            </a>
          </div>
          <p className="truncate text-lg font-semibold text-ctp-text md:text-xl">
            <a href={trackUrl} target="_blank" title={`View \"${data.track}\" on MusicBrainz`}>
              {data.track}
            </a>
          </p>
          <div className="flex min-w-0 flex-row items-center justify-between gap-2">
            <span className="truncate text-lg text-ctp-text md:text-xl">
              {/* Render all artists with joinphrases and MusicBrainz links */}
              {Array.isArray(data.artists) && data.artists.length > 0 ? (
                data.artists.map((response, idx) => (
                  <span key={response.artist?.id || response.artist?.name}>
                    <a
                      href={
                        response.artist?.id
                          ? `https://musicbrainz.org/artist/${response.artist?.id}`
                          : undefined
                      }
                      target="_blank"
                      title={`View ${response.artist?.name} on MusicBrainz`}
                      className="rounded"
                      rel="noreferrer"
                    >
                      {response.artist?.name}
                    </a>
                    {response.joinphrase ?? ''}
                  </span>
                ))
              ) : (
                <span>No artist info</span>
              )}
            </span>
            {isRefreshing && initialLoadComplete && (
              <FaSpinner
                size={20}
                aria-hidden={true}
                className="shrink-0 animate-spin text-ctp-pink motion-reduce:hidden"
              />
            )}
          </div>
          {data.originUrl && (
            <a
              href={data.originUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 text-xs text-ctp-mauve underline"
            >
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListenBrainzTrack;
