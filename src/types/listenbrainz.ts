export type MusicBrainzTrackQuery = {
  track_name: string;
  artist_name: string;
  release_name?: string;
};
export interface ListenBrainzResponse {
  payload?: {
    listens?: Array<{
      track_metadata: {
        artist_name: string;
        track_name: string;
        release_name?: string;
        additional_info?: {
          origin_url?: string;
          music_service?: string;
          artist_mbids?: string[];
          recording_mbid?: string;
          release_mbid?: string;
        };
      };
    }>;
  };
}

export interface ArchiveOrgImage {
  approved: boolean;
  back: boolean;
  front: boolean;
  comment: string;
  edit: number;
  id: number;
  image: string;
  thumbnails: Record<string, string>;
  types: string[];
}
export type Release = { id: string; title?: string };
export type Recording = { id: string; score?: number; releases?: Release[]; title?: string };

export type MusicBrainzTrackInfoArgs = {
  track_name: string;
  artist_name: string;
  release_name?: string;
};

export type MusicBrainzTrackInfoResult = {
  trackUrl?: string;
  releaseMbid?: string;
  recordingMbid?: string;
  artistCredit?: ArtistCredit[];
  canonicalTitle?: string;
  coverArtUrl?: string;
  thumbnailUrl?: string;
  coverArtThumbnails?: Record<string, string>;
};
export type ArtistCredit = {
  name: string;
  joinphrase?: string;
  artist?: {
    id?: string;
    name?: string;
  };
};

export interface ListenBrainzTrackData {
  track: string;
  originUrl?: string;
  musicService?: string;
  artist_mbids?: string[];
  recording_mbid?: string;
  release_mbid?: string;
  coverArtUrl?: string;
  blurhash?: string;
  musicbrainz_artist_url?: string;
  musicbrainz_track_url?: string;
  artists?: ArtistCredit[];
}
