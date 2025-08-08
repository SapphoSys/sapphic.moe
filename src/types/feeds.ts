export interface FeedCacheEntry {
  data: FeedItem[];
  timestamp: number;
}

export interface FeedItem {
  title: string;
  link: string | undefined;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  feedTitle: string;
  feedUrl: string;
  feedAvatar?: string;
  feedBaseUrl?: string;
}

export interface FeedListEntry {
  url: string;
  title: string;
  avatar?: string;
  paginated?: {
    param: string;
    maxPages: number;
  };
}
