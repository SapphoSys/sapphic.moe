import type { APIRoute } from 'astro';
import { encode } from 'blurhash';
import sharp from 'sharp';

export const prerender = false;

// Cache for BlurHash values to avoid regenerating them
const blurhashCache = new Map<string, string>();

async function generateBlurHash(imageBuffer: ArrayBuffer): Promise<string | null> {
  try {
    // Use sharp to resize and get pixel data
    const image = sharp(new Uint8Array(imageBuffer));
    const { data, info } = await image
      .resize(32, 32, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Generate BlurHash
    const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);

    return blurhash;
  } catch (err) {
    console.error('[generateBlurHash] Error generating BlurHash:', err);
    return null;
  }
}

// Example: /api/listenbrainz/cover?url=https://coverartarchive.org/release/xxx/front
export const GET: APIRoute = async ({ url }) => {
  const imageUrl = url.searchParams.get('url');
  const wantBlurhash = url.searchParams.get('blurhash') === 'true';

  // Only allow Cover Art Archive URLs
  const coverArtArchivePattern = /^https?:\/\/(?:[^.]+\.)?coverartarchive\.org\//i;
  if (!imageUrl || !coverArtArchivePattern.test(imageUrl)) {
    return new Response('Missing or invalid url parameter', { status: 400 });
  }

  try {
    const remoteRes = await fetch(imageUrl);
    if (!remoteRes.ok) {
      return new Response('Failed to fetch remote image', { status: remoteRes.status });
    }
    const contentType = remoteRes.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await remoteRes.arrayBuffer();

    // If BlurHash is requested, generate and return it as JSON
    if (wantBlurhash) {
      // Check cache first
      let blurhash = blurhashCache.get(imageUrl);

      if (!blurhash) {
        const hash = await generateBlurHash(imageBuffer);
        if (hash) {
          blurhash = hash;
          blurhashCache.set(imageUrl, hash);
        }
      }

      return new Response(JSON.stringify({ blurhash: blurhash || null }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=604800', // 7 days
        },
      });
    }

    // Otherwise return the image as before
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800', // 7 days
      },
    });
  } catch (_err) {
    return new Response('Error proxying image', { status: 500 });
  }
};
