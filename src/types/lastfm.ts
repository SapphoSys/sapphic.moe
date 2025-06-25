export interface LastFMImage {
  '#text': string;
  size: string;
}

export interface LastFMAttr {
  nowplaying?: string;
}

interface LastFMRawTrackAlbum {
  '#text': string | undefined;
  mbid?: string;
  url?: string;
}

interface LastFMRawTrackArtist {
  '#text': string;
  mbid?: string;
  url: string;
}

export interface LastFMRawTrack {
  name: string;
  mbid?: string;
  url?: string;
  image: LastFMImage[];
  '@attr'?: LastFMAttr;
  artist: LastFMRawTrackArtist;
  album: LastFMRawTrackAlbum;
  date?: LastFMDate;
}

export interface LastFMDate {
  uts: string;
  '#text': string;
}

export interface LastFMRecentTracks {
  track: LastFMRawTrack[];
  '@attr': {
    page: string;
    perPage: string;
    user: string;
    total: string;
    totalPages: string;
  };
}

export interface LastFMApiResponse {
  recenttracks?: LastFMRecentTracks;
  error?: number;
  message?: string;
}

export interface LastFMTrackData {
  isPlaying: boolean;
  track: {
    name: string;
    artist: { name: string; url: string };
    album: { name: string | null; url: string | null };
    image: string | null;
  };
  timestamp?: number;
}

export interface UseLastFMTrackResult {
  data: LastFMTrackData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: Error | null;
}

export interface LastFMRawAlbum {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  artist: {
    name: string;
    mbid?: string;
    url: string;
  };
  image: LastFMImage[];
  '@attr': {
    rank: string;
  };
}

export interface LastFMTopAlbums {
  album: LastFMRawAlbum[];
  '@attr': {
    user: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}

export interface LastFMTopAlbumsApiResponse {
  topalbums?: LastFMTopAlbums;
  error?: number;
  message?: string;
}

export interface LastFMAlbum {
  name: string;
  artist: {
    name: string;
    url: string;
  };
  image: string | null;
  playcount: number;
  url: string;
}

export interface UseLastFMTopAlbumsResult {
  data: LastFMAlbum[] | null;
  loading: boolean;
  error: Error | null;
}
