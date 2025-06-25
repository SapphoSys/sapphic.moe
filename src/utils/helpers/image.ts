import type { ImageMetadata } from 'astro';

import { isProduction } from '$utils/helpers/misc';

export const loadImage = async (path: string) => {
  const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*');

  const imagePath = `/src/assets${path}`;
  if (!images[imagePath]) {
    throw new Error(`File "${path}" does not exist in the "/src/assets/" folder.`);
  }

  const resolvedImage = (await images[imagePath]()).default;

  return resolvedImage;
};

export const processOgImage = (
  ogImage: { src?: string; alt?: string } | undefined,
  defaultImageLink: string,
  defaultImageAlt: string,
  siteUrl: URL | undefined
) => {
  const imageSrc = ogImage?.src ?? defaultImageLink;
  const imageAlt = ogImage?.alt ?? defaultImageAlt;

  const absoluteImageUrl = isProduction && siteUrl ? new URL(imageSrc, siteUrl).href : imageSrc;

  return {
    src: absoluteImageUrl,
    alt: imageAlt,
  };
};

export const convertGifToStatic = async (gifUrl: string) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Failed to get canvas context');

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');

        if (!dataUrl) throw new Error('Failed to convert image to data URL');

        resolve(dataUrl);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    img.onerror = (error) =>
      reject(error instanceof Error ? error : new Error('Failed to load image'));

    img.src = gifUrl;
  });
};

export const getReducedMotionImage = async (
  imageUrl: string | null,
  prefersReducedMotion: boolean
) => {
  if (!imageUrl) return null;

  const isGif = imageUrl.toLowerCase().endsWith('.gif');
  if (!isGif || !prefersReducedMotion) return imageUrl;

  try {
    return await convertGifToStatic(imageUrl);
  } catch (error) {
    console.error('Failed to convert GIF to static image:', error);
    return imageUrl;
  }
};
