export interface AniListCacheEntry {
  data: AniListData;
  timestamp: number;
}

export interface AniListEntry {
  media: {
    id: number;
    title: {
      romaji: string;
      english: string | null;
    };
    coverImage: {
      large: string;
    };
    format: string;
    status: string;
    episodes: number | null;
    averageScore: number;
  };
  progress: number;
  status: string;
  updatedAt: number;
  completedAt: {
    year: number;
    month: number;
    day: number;
  };
}

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
  };
  coverImage: {
    large: string;
  };
  format: string;
  status: string;
  episodes: number | null;
  averageScore: number;
  progress: number;
  url: string;
  completedAt?: number;
}

export interface AniListData {
  currentlyWatching: AniListMedia[];
  recentlyCompleted: AniListMedia[];
}

export interface UseAniListResult {
  data: AniListData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: Error | null;
}
