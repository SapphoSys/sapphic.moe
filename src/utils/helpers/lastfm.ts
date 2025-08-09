interface ImageValidationCacheEntry {
  isValid: boolean;
  timestamp: number;
}

const imageValidationCache = new Map<string, ImageValidationCacheEntry>();
const IMAGE_VALIDATION_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const IMAGE_VALIDATION_TIMEOUT_MS = 5000; // 5 seconds

export const validateAlbumCover = async (url: string | null): Promise<string | null> => {
  if (!url || url === '#' || !url.trim()) return null;

  const now = Date.now();
  const cached = imageValidationCache.get(url);
  if (cached && now - cached.timestamp < IMAGE_VALIDATION_CACHE_DURATION_MS) {
    return cached.isValid ? url : null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_VALIDATION_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'sapphic.moe Last.fm API Proxy (Astro)',
      },
    });
    clearTimeout(timeoutId);

    const isValid = response.ok;
    imageValidationCache.set(url, { isValid, timestamp: now });
    return isValid ? url : null;
  } catch (error) {
    console.warn(`Failed to validate album cover URL ${url}:`, error);
    imageValidationCache.set(url, { isValid: false, timestamp: now });
    return null;
  }
};

export const validateAlbumCovers = async <T extends { image: string | null }>(
  albums: T[],
  batchSize = 5
): Promise<T[]> => {
  const validatedAlbums: T[] = [];

  for (let i = 0; i < albums.length; i += batchSize) {
    const batch = albums.slice(i, i + batchSize);
    const validatedBatch = await Promise.all(
      batch.map(async (album) => {
        const validImage = await validateAlbumCover(album.image);
        if (validImage) {
          return { ...album, image: validImage };
        }
        return null;
      })
    );
    validatedAlbums.push(...(validatedBatch.filter(Boolean) as T[]));
  }

  return validatedAlbums;
};
