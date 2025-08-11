import { useEffect, useState, useRef } from 'react';
import { getReducedMotionImage } from '$utils/helpers/image';

interface ButtonImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const ButtonImage: React.FC<ButtonImageProps> = ({
  src,
  alt,
  width = 88,
  height = 31,
  className,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [staticImageUrl, setStaticImageUrl] = useState<string | null>(null);
  const [_isGif, setIsGif] = useState(false);
  const [_isWebp, setIsWebp] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!src) return;

    const lowerSrc = src.toLowerCase();
    setIsGif(lowerSrc.endsWith('.gif'));
    setIsWebp(lowerSrc.endsWith('.webp'));
    getReducedMotionImage(src, prefersReducedMotion)
      .then((url) => setStaticImageUrl(url))
      .catch(() => setStaticImageUrl(null));
  }, [src, prefersReducedMotion]);

  if (showFallback) {
    return <span className={className}>{alt}</span>;
  }

  return (
    <img
      ref={imgRef}
      src={staticImageUrl || src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setShowFallback(true)}
      crossOrigin="anonymous"
    />
  );
};

export default ButtonImage;
