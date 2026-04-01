'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  onError?: () => void;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  fallbackSrc = '/banner_website.jpg',
  onError,
}: SafeImageProps) {
  const [failedPrimarySrc, setFailedPrimarySrc] = useState<string | null>(null);
  const [regularImgSrc, setRegularImgSrc] = useState<string | null>(null);
  const primaryFailed = failedPrimarySrc === src;
  const imageSrc = primaryFailed ? fallbackSrc : src;
  const useRegularImg = regularImgSrc === src;

  const handleImageError = () => {
    onError?.();

    if (!primaryFailed && src !== fallbackSrc) {
      // Try fallback first
      setFailedPrimarySrc(src);
    } else {
      // If fallback also fails, use regular img tag
      setRegularImgSrc(src);
    }
  };

  const isExternalUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  };

  // For external URLs that might not be in next.config.js, use regular img tag
  if (useRegularImg || isExternalUrl(imageSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          fill
            ? 'absolute inset-0 box-border max-h-full max-w-full min-h-0 min-w-0 h-full w-full object-cover'
            : '',
          className,
        )}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  // For internal or configured external URLs, use Next.js Image
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      onError={handleImageError}
    />
  );
}
