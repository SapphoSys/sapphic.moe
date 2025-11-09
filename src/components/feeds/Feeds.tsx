import { type FC, useEffect, useState } from 'react';

import { feedList } from '$data/feeds';
import useFeeds from '$hooks/useFeeds';
import type { FeedItem } from '$types/feeds';
import { formatDate } from '$utils/helpers/date';
import { cn } from '$utils/helpers/misc';

const formatFeedDate = (dateString: string | undefined): string => {
  if (!dateString) return 'No date';
  return formatDate(dateString);
};

interface FeedsProps {
  apiUrl?: string;
}

const Feeds: FC<FeedsProps> = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: allFeedItems, loading, error: fetchError } = useFeeds(
    isMounted ? '/api/feeds' : ''
  );
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  const totalFeeds = feedList.length;

  return (
    <section className="flex flex-col gap-6">
      {loading && !initialLoadComplete && (
        <div className="animate-pulse" data-guestbook-loading>
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-6">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="flex gap-4">
                  <div className="size-12 shrink-0 rounded-full bg-ctp-surface1" />
                  <div className="flex grow flex-col gap-y-2 overflow-auto">
                    <div className="flex flex-row flex-wrap gap-x-2">
                      <div
                        className="h-6 rounded bg-ctp-surface1"
                        style={{ width: `${Math.floor(Math.random() * (16 - 8 + 1)) + 8}rem` }}
                      />
                      <div
                        className="h-6 w-6 rounded bg-ctp-surface1"
                        style={{ width: `${Math.floor(Math.random() * (20 - 16 + 1)) + 12}rem` }}
                      />
                    </div>
                    <div
                      className="h-8 rounded bg-ctp-surface1"
                      style={{ width: `${Math.floor(Math.random() * (40 - 24 + 1)) + 24}rem` }}
                    />
                    <div
                      className="h-16 rounded bg-ctp-surface1"
                      style={{ height: `${Math.floor(Math.random() * (6 - 4 + 1)) + 2}rem` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {fetchError && initialLoadComplete && (
        <div
          className={cn(
            'rounded-md border border-ctp-red p-4 text-ctp-text',
            initialLoadComplete && 'animate-fade-in'
          )}
          role="alert"
          aria-live="assertive"
        >
          <p>{fetchError}</p>
        </div>
      )}

      {!loading && !fetchError && allFeedItems.length > 0 && (
        <div className={cn(initialLoadComplete && 'animate-fade-in', 'flex flex-col gap-6')}>
          {allFeedItems.map((item: FeedItem) => (
            <article key={`${item.feedTitle}-${item.title}-${item.pubDate}`} className="flex gap-4">
              {item.feedAvatar && item.feedBaseUrl ? (
                <a
                  href={item.feedBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block size-12 shrink-0"
                  aria-label={`Visit ${item.feedTitle}`}
                  data-umami-event={`${item.feedTitle} avatar feed link click`}
                >
                  <img
                    src={item.feedAvatar}
                    alt={`${item.feedTitle} avatar`}
                    width="48"
                    height="48"
                    className="size-12 rounded-full object-cover"
                    loading="lazy"
                  />
                </a>
              ) : item.feedAvatar ? (
                <img
                  src={item.feedAvatar}
                  alt={`${item.feedTitle} avatar`}
                  width="48"
                  height="48"
                  className="size-12 shrink-0 rounded-full object-cover"
                  loading="lazy"
                />
              ) : null}

              <div className="flex grow flex-col overflow-auto">
                <p className="flex flex-row flex-wrap gap-x-2">
                  <span className="font-medium">{item.feedTitle}</span>

                  <time className="text-ctp-subtext0" dateTime={item.isoDate || item.pubDate}>
                    {formatDate(formatFeedDate(item.isoDate || item.pubDate), 'relative')}
                  </time>
                </p>

                <h2 className="text-2xl font-bold">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-umami-event={`${item.feedTitle} article link click`}
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h2>

                {item.contentSnippet && (
                  <p className="line-clamp-3 text-base italic text-ctp-text">
                    {item.contentSnippet}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !fetchError && allFeedItems.length === 0 && initialLoadComplete && (
        <div className={cn(initialLoadComplete && 'animate-fade-in')}>
          <p>No feed items found.</p>
        </div>
      )}
    </section>
  );
};

export default Feeds;
