import { Icon } from '@iconify/react';
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
  const { data: allFeedItems, loading, error: fetchError } = useFeeds('/api/feeds');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  const totalFeeds = feedList.length;

  return (
    <section className="flex flex-col gap-6">
      {loading && !initialLoadComplete && (
        <div
          className="flex flex-col items-center justify-center rounded-md border-2 border-ctp-pink bg-ctp-mantle p-4 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-row gap-x-3">
            <Icon
              icon="line-md:loading-loop"
              fontSize={30}
              aria-hidden={true}
              className="text-ctp-pink"
            />
            <p>Fetching posts from {totalFeeds} RSS feeds...</p>
          </div>
          <p className="italic text-ctp-subtext1">Should take no more than 5 seconds!</p>
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
