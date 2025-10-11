import { encode } from 'blurhash';
import sharp from 'sharp';

import type {
  ArchiveOrgImage,
  ArtistCredit,
  ListenBrainzResponse,
  ListenBrainzTrackData,
  MusicBrainzTrackInfoResult,
  MusicBrainzTrackQuery,
  Recording,
  Release,
} from '$types/listenbrainz';

export type MusicBrainzTrackInfoErrorResult = {
  error: string;
  details?: unknown;
};

async function generateBlurHash(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('[generateBlurHash] Failed to fetch image:', response.status);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const image = sharp(new Uint8Array(imageBuffer));
    const { data, info } = await image
      .resize(32, 32, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);

    return blurhash;
  } catch (err) {
    console.error('[generateBlurHash] Error generating BlurHash:', err);
    return null;
  }
}

async function fetchMusicBrainzTrackInfo(
  track: MusicBrainzTrackQuery,
  release_mbid?: string
): Promise<MusicBrainzTrackInfoResult | MusicBrainzTrackInfoErrorResult> {
  try {
    const recordings = await searchRecordings(track);
    if (!recordings || recordings.length === 0) {
      const msg = 'No recordings found for track query.';
      console.error(`[fetchMusicBrainzTrackInfo] ${msg}`, { track });
      return { error: msg, details: { track } };
    }

    const bestRecording = selectBestRecording(
      recordings,
      release_mbid,
      track.release_name,
      track.track_name
    );
    if (!bestRecording) {
      const msg = 'No suitable recording found.';
      console.error(`[fetchMusicBrainzTrackInfo] ${msg}`, { recordings, release_mbid });
      return { error: msg, details: { recordings, release_mbid } };
    }

    let bestRecordingReleaseMbid: string | undefined = release_mbid;
    if (bestRecording.releases && bestRecording.releases.length > 0) {
      bestRecordingReleaseMbid = bestRecording.releases[0].id;
    }

    // Fetch canonical title and artist-credit array from MusicBrainz using recording MBID
    let artistCredit: ArtistCredit[] | undefined;
    let canonicalTitle: string | undefined;
    if (bestRecording.id) {
      try {
        const details = await fetchRecordingDetails(bestRecording.id);
        artistCredit = details.artistCredit;
        canonicalTitle = details.canonicalTitle;
      } catch (err) {
        console.error('[fetchMusicBrainzTrackInfo] Error fetching recording details', err);
      }
    }

    // Fetch cover art from archive.org JSON
    let coverArtUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    let coverArtThumbnails: Record<string, string> | undefined;
    if (bestRecordingReleaseMbid) {
      try {
        const coverArt = await fetchCoverArt(bestRecordingReleaseMbid);
        coverArtUrl = coverArt.coverArtUrl;
        thumbnailUrl = coverArt.thumbnailUrl;
        coverArtThumbnails = coverArt.coverArtThumbnails;
      } catch (err) {
        console.error('[fetchMusicBrainzTrackInfo] Error fetching cover art', err);
      }
    }

    return {
      trackUrl: `https://musicbrainz.org/recording/${bestRecording.id}`,
      releaseMbid: bestRecordingReleaseMbid,
      recordingMbid: bestRecording.id,
      artistCredit,
      canonicalTitle,
      coverArtUrl,
      thumbnailUrl,
      coverArtThumbnails,
    };
  } catch (e) {
    const msg = 'Could not fetch track info.';
    console.error(`[fetchMusicBrainzTrackInfo] ${msg}`, e, { track, release_mbid });
    return { error: msg, details: { exception: e, track, release_mbid } };
  }
}

async function fetchReleaseMbid(
  artist: string,
  track: string,
  release?: string
): Promise<string | undefined> {
  try {
    const params = new URLSearchParams({
      artist_name: artist,
      recording_name: track,
    });
    if (release) params.append('release_name', release);
    const url = `https://api.listenbrainz.org/1/metadata/lookup/?${params.toString()}`;
    const res = await fetch(url);
    const result = await res.json();
    return result.release_mbid;
  } catch {
    return undefined;
  }
}

async function fetchMusicBrainzArtistUrl(artistName: string): Promise<string | undefined> {
  try {
    const artistSearchUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`;
    const artistRes = await fetch(artistSearchUrl, {
      headers: { 'User-Agent': 'sapphic.moe ListenBrainz API Proxy (Astro)' },
    });
    if (artistRes.ok) {
      const artistJson = await artistRes.json();
      if (artistJson.artists && artistJson.artists.length > 0) {
        return `https://musicbrainz.org/artist/${artistJson.artists[0].id}`;
      }
    }
  } catch (_e) {
    // Could not fetch artist MBID
  }
  return undefined;
}

async function searchRecordings(track: MusicBrainzTrackQuery): Promise<Recording[] | undefined> {
  const userAgent = 'sapphic.moe ListenBrainz API Proxy (Astro)';

  // Strip common DJ mix/live suffixes from track name for MusicBrainz search
  // MusicBrainz stores these variants as the base title with disambiguation
  const cleanTrackName = track.track_name
    .replace(/\s*\((Mixed|Live|Edit|Extended|Radio Edit|Remix)\)$/i, '')
    .trim();

  // Strategy 1: Try exact search with quotes for precise matching (best for DJ mixes with exact titles)
  if (track.release_name) {
    const exactQuery = `recording:"${cleanTrackName}" AND artist:"${track.artist_name}" AND release:"${track.release_name}"`;
    console.warn('[searchRecordings] Trying exact search:', exactQuery);
    const exactUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(exactQuery)}&fmt=json&limit=25`;
    try {
      const exactRes = await fetch(exactUrl, { headers: { 'User-Agent': userAgent } });
      if (exactRes.ok) {
        const exactJson = await exactRes.json();
        if (exactJson.recordings && exactJson.recordings.length > 0) {
          console.warn(
            `[searchRecordings] Found ${exactJson.recordings.length} recordings with exact search`
          );
          return exactJson.recordings;
        }
      }
    } catch (err) {
      console.error('[searchRecordings] Exact search failed', err);
    }
  }

  // Strategy 2: Try broader search without quotes (more fuzzy matching)
  const broadQuery = `recording:${cleanTrackName} AND artist:${track.artist_name}${track.release_name ? ` AND release:${track.release_name}` : ''}`;
  const broadUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(broadQuery)}&fmt=json&limit=25`;
  try {
    const broadRes = await fetch(broadUrl, { headers: { 'User-Agent': userAgent } });
    if (broadRes.ok) {
      const broadJson = await broadRes.json();
      if (broadJson.recordings && broadJson.recordings.length > 0) {
        console.warn(
          `[searchRecordings] Found ${broadJson.recordings.length} recordings with broad search`
        );
        return broadJson.recordings;
      }
    }
  } catch (err) {
    console.error('[searchRecordings] Broad search failed', err);
  }

  // Strategy 3: Fall back to just track and artist (no release filter)
  const minimalQuery = `recording:${cleanTrackName} AND artist:${track.artist_name}`;
  const minimalUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(minimalQuery)}&fmt=json&limit=25`;
  try {
    const minimalRes = await fetch(minimalUrl, { headers: { 'User-Agent': userAgent } });
    if (minimalRes.ok) {
      const minimalJson = await minimalRes.json();
      if (minimalJson.recordings && minimalJson.recordings.length > 0) {
        console.warn(
          `[searchRecordings] Found ${minimalJson.recordings.length} recordings with minimal search`
        );
        return minimalJson.recordings;
      }
    }
  } catch (err) {
    console.error('[searchRecordings] Minimal search failed', err);
  }

  console.warn('[searchRecordings] No recordings found with any search strategy');
  return undefined;
}

function selectBestRecording(
  recordings: Recording[],
  release_mbid?: string,
  releaseName?: string,
  trackName?: string
): Recording | undefined {
  if (!recordings || recordings.length === 0) return undefined;

  console.warn(`[selectBestRecording] Selecting from ${recordings.length} recordings`);
  console.warn(
    `[selectBestRecording] Criteria - release_mbid: ${release_mbid}, releaseName: ${releaseName}, trackName: ${trackName}`
  );

  // First priority: match by release MBID if provided
  // BUT ONLY if we don't have a specific release name (e.g., DJ Mix)
  // For DJ mixes, the release name is more reliable than the MBID from ListenBrainz
  if (release_mbid && !releaseName) {
    const candidates = recordings.filter(
      (rec: Recording) => rec.releases && rec.releases.some((r: Release) => r.id === release_mbid)
    );
    if (candidates.length > 0) {
      candidates.sort((a: Recording, b: Recording) => (b.score || 0) - (a.score || 0));
      console.warn(`[selectBestRecording] Selected by release MBID: ${candidates[0].id}`);
      return candidates[0];
    }
  }

  // Second priority: match by release name (critical for DJ mixes)
  // For DJ mixes, the release name is more reliable than track title matching
  if (releaseName) {
    const cleanReleaseName = releaseName
      .toLowerCase()
      .replace(/\s*\(dj mix\)$/i, '')
      .trim();
    const candidates = recordings.filter((rec: Recording) => {
      if (!rec.releases) return false;
      return rec.releases.some((r: Release) => {
        const releaseTitle = r.title
          ?.toLowerCase()
          .replace(/\s*\(dj mix\)$/i, '')
          .trim();
        return (
          releaseTitle?.includes(cleanReleaseName) || cleanReleaseName.includes(releaseTitle || '')
        );
      });
    });
    if (candidates.length > 0) {
      candidates.sort((a: Recording, b: Recording) => (b.score || 0) - (a.score || 0));
      console.warn(
        `[selectBestRecording] Selected by release name: ${candidates[0].id} (${candidates[0].title})`
      );
      return candidates[0];
    }
  }

  // Third priority: match by track title (strip common suffixes for comparison)
  if (trackName) {
    const cleanTrackName = trackName
      .replace(/\s*\((Mixed|Live|Edit|Extended|Radio Edit|Remix)\)$/i, '')
      .trim()
      .toLowerCase();
    const exactMatches = recordings.filter((rec: Recording) => {
      const recTitle = rec.title?.toLowerCase() || '';
      return recTitle === cleanTrackName || recTitle === trackName.toLowerCase();
    });
    if (exactMatches.length > 0) {
      exactMatches.sort((a: Recording, b: Recording) => (b.score || 0) - (a.score || 0));
      console.warn(
        `[selectBestRecording] Selected by track name: ${exactMatches[0].id} (${exactMatches[0].title})`
      );
      return exactMatches[0];
    }
  }

  // Fall back to highest score
  console.warn(
    `[selectBestRecording] Selected by highest score: ${recordings[0].id} (${recordings[0].title})`
  );
  return recordings[0];
}

async function fetchRecordingDetails(
  recordingId: string
): Promise<{ artistCredit?: ArtistCredit[]; canonicalTitle?: string }> {
  try {
    const recordingDetailUrl = `https://musicbrainz.org/ws/2/recording/${recordingId}?inc=artists&fmt=json`;
    const recordingDetailRes = await fetch(recordingDetailUrl, {
      headers: { 'User-Agent': 'sapphic.moe ListenBrainz API Proxy (Astro)' },
    });
    if (recordingDetailRes.ok) {
      const recordingDetailJson = await recordingDetailRes.json();
      return {
        artistCredit: Array.isArray(recordingDetailJson['artist-credit'])
          ? recordingDetailJson['artist-credit']
          : undefined,
        canonicalTitle:
          typeof recordingDetailJson['title'] === 'string'
            ? recordingDetailJson['title']
            : undefined,
      };
    }
  } catch (_e) {
    // Ignore errors
  }
  return {};
}

async function fetchCoverArt(releaseMbid: string): Promise<{
  coverArtUrl?: string;
  thumbnailUrl?: string;
  coverArtThumbnails?: Record<string, string>;
}> {
  try {
    const archiveUrl = `https://archive.org/download/mbid-${releaseMbid}/index.json`;
    const archiveRes = await fetch(archiveUrl);
    if (archiveRes.ok) {
      const archiveJson = await archiveRes.json();
      if (Array.isArray(archiveJson.images)) {
        const frontImage = archiveJson.images.find(
          (img: ArchiveOrgImage) => img.front && img.approved
        );
        if (frontImage) {
          return {
            coverArtUrl: frontImage.image,
            thumbnailUrl: frontImage.thumbnails?.['250'] || frontImage.thumbnails?.small,
            coverArtThumbnails: frontImage.thumbnails,
          };
        }
      }
    }
  } catch (_e) {
    // Ignore errors
  }
  return {};
}

export async function fetchListenBrainzData(username: string): Promise<ListenBrainzResponse> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const apiUrl = `https://api.listenbrainz.org/1/user/${encodeURIComponent(username)}/listens?count=1`;
      const apiRequest = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'sapphic.moe ListenBrainz API Proxy (Astro)',
        },
      });

      if (!apiRequest.ok) {
        const errorBody = await apiRequest.json().catch(() => ({ message: apiRequest.statusText }));
        if (attempt < MAX_RETRIES && apiRequest.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        } else {
          throw new Error(
            `ListenBrainz API HTTP error: Status ${apiRequest.status}. ${errorBody.message || apiRequest.statusText}`
          );
        }
      }

      return await apiRequest.json();
    } catch (_err) {
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        throw new Error(`Max retries reached. Unable to fetch ListenBrainz data at this time.`);
      }
    }
  }

  throw new Error(`An unexpected error occurred after all retries for ${username}.`);
}

export async function processTrackData(
  listens: NonNullable<ListenBrainzResponse['payload']>['listens']
): Promise<ListenBrainzTrackData | null> {
  if (!listens || listens.length === 0) {
    return null;
  }

  const track = listens[0].track_metadata;
  const info = track.additional_info || {};
  const mbidMapping = track.mbid_mapping;

  // Use mbid_mapping data if available (much faster)
  if (mbidMapping) {
    console.warn('[processTrackData] Using mbid_mapping data from ListenBrainz (fast path)');

    const recording_mbid = mbidMapping.recording_mbid || info.recording_mbid;
    const release_mbid = mbidMapping.release_mbid || info.release_mbid;
    const caa_release_mbid = mbidMapping.caa_release_mbid;

    // Build artist credits from mbid_mapping
    let artists: ArtistCredit[] = [];
    if (Array.isArray(mbidMapping.artists)) {
      artists = mbidMapping.artists.map((artist) => ({
        name: artist.artist_credit_name,
        joinphrase: artist.join_phrase || '',
        artist: {
          id: artist.artist_mbid,
          name: artist.artist_credit_name,
        },
      }));
    }

    // Build MusicBrainz URLs
    const musicbrainz_track_url = recording_mbid
      ? `https://musicbrainz.org/recording/${recording_mbid}`
      : undefined;

    // Use the first artist MBID for artist URL
    const firstArtistMbid = mbidMapping.artist_mbids?.[0] || artists[0]?.artist?.id;
    const musicbrainz_artist_url = firstArtistMbid
      ? `https://musicbrainz.org/artist/${firstArtistMbid}`
      : undefined;

    // Use Cover Art Archive data from mbid_mapping
    let coverArtUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    if (caa_release_mbid) {
      coverArtUrl = `https://coverartarchive.org/release/${caa_release_mbid}/front`;
      thumbnailUrl = `https://coverartarchive.org/release/${caa_release_mbid}/front-250`;
    } else if (release_mbid) {
      // Fallback to release_mbid if caa_release_mbid not available
      coverArtUrl = `https://coverartarchive.org/release/${release_mbid}/front`;
      thumbnailUrl = `https://coverartarchive.org/release/${release_mbid}/front-250`;
    }

    // Fetch BlurHash for the thumbnail
    let blurhash: string | undefined;
    if (thumbnailUrl) {
      try {
        blurhash = (await generateBlurHash(thumbnailUrl)) || undefined;
      } catch (err) {
        console.error('[processTrackData] Error fetching BlurHash:', err);
      }
    }

    return {
      track: track.track_name,
      originUrl: info.origin_url,
      musicService: info.music_service,
      artist_mbids: mbidMapping.artist_mbids || info.artist_mbids,
      recording_mbid,
      release_mbid,
      coverArtUrl,
      blurhash,
      musicbrainz_artist_url,
      musicbrainz_track_url,
      artists,
    };
  }

  // Fallback to old behavior if mbid_mapping is not available (slow path)
  console.warn(
    '[processTrackData] mbid_mapping not available, using slow path with MusicBrainz API calls'
  );

  let release_mbid = typeof info.release_mbid === 'string' ? info.release_mbid : undefined;

  if (!release_mbid && track.artist_name && track.track_name) {
    release_mbid =
      (await fetchReleaseMbid(track.artist_name, track.track_name, track.release_name)) ||
      undefined;
  }

  // Fetch MusicBrainz artist URL
  const musicbrainz_artist_url = await fetchMusicBrainzArtistUrl(track.artist_name);

  // Fetch MusicBrainz track info (track URL and release MBID)
  const mbTrackInfo = await fetchMusicBrainzTrackInfo(track, release_mbid);
  if ('error' in mbTrackInfo) {
    console.error(
      '[processTrackData] Error from fetchMusicBrainzTrackInfo:',
      mbTrackInfo.error,
      mbTrackInfo.details
    );
    return null;
  }

  const musicbrainz_track_url = mbTrackInfo.trackUrl;

  // Use cover art URLs from archive.org JSON
  const coverArtUrl =
    typeof mbTrackInfo.coverArtUrl === 'string' ? mbTrackInfo.coverArtUrl : undefined;
  const thumbnailUrl =
    typeof mbTrackInfo.thumbnailUrl === 'string' ? mbTrackInfo.thumbnailUrl : undefined;

  // Fetch BlurHash for the thumbnail (prefer thumbnail for faster generation)
  let blurhash: string | undefined;
  if (thumbnailUrl) {
    try {
      blurhash = (await generateBlurHash(thumbnailUrl)) || undefined;
    } catch (err) {
      console.error('[processTrackData] Error fetching BlurHash:', err);
    }
  }

  // Parse multiple artists from artistCredit
  let artists: ArtistCredit[] = [];
  if (Array.isArray(mbTrackInfo.artistCredit)) {
    artists = mbTrackInfo.artistCredit;
  }

  // Prefer the original track name from ListenBrainz (which reflects what's actually playing)
  // Only fall back to MusicBrainz canonical title if the original is unavailable
  const trackTitle = track.track_name ?? mbTrackInfo.canonicalTitle;

  // Use the release MBID from MusicBrainz if available (more accurate for DJ mixes)
  const finalReleaseMbid = mbTrackInfo.releaseMbid ?? release_mbid;

  return {
    track: trackTitle,
    originUrl: info.origin_url,
    musicService: info.music_service,
    artist_mbids: info.artist_mbids,
    recording_mbid: mbTrackInfo.recordingMbid ?? info.recording_mbid,
    release_mbid: finalReleaseMbid,
    coverArtUrl,
    blurhash,
    musicbrainz_artist_url,
    musicbrainz_track_url,
    artists,
  };
}
