/**
 * Image Optimization Utility
 *
 * Features:
 * - Automatic format conversion (WebP, AVIF)
 * - Responsive image loading
 * - Lazy loading with Intersection Observer
 * - Blur placeholder generation
 * - CDN integration
 * - Image compression
 *
 * Usage:
 * ```tsx
 * import { OptimizedImage } from '@/lib/performance/image-optimizer';
 *
 * <OptimizedImage
 *   src="/images/farm.jpg"
 *   alt="Farm photo"
 *   width={800}
 *   height={600}
 *   priority={false}
 * />
 * ```
 */

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, CSSProperties } from 'react';

/**
 * CDN configuration
 */
const CDN_CONFIG = {
  cloudflare: {
    enabled: Boolean(process.env.NEXT_PUBLIC_CLOUDFLARE_CDN),
    domain: process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_DOMAIN,
    transformations: {
      format: 'auto',
      quality: 'auto',
      fit: 'contain',
    },
  },
  cloudinary: {
    enabled: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
};

/**
 * Image loader for CDN
 */
function cdnImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // If absolute URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Cloudflare CDN
  if (CDN_CONFIG.cloudflare.enabled && CDN_CONFIG.cloudflare.domain) {
    const params = new URLSearchParams({
      width: width.toString(),
      quality: (quality || 75).toString(),
      format: 'auto',
    });
    return `${CDN_CONFIG.cloudflare.domain}${src}?${params.toString()}`;
  }

  // Cloudinary CDN
  if (CDN_CONFIG.cloudinary.enabled && CDN_CONFIG.cloudinary.cloudName) {
    const qualityParam = quality ? `q_${quality}` : 'q_auto';
    return `https://res.cloudinary.com/${CDN_CONFIG.cloudinary.cloudName}/image/upload/w_${width},${qualityParam},f_auto/${src}`;
  }

  // Default Next.js image optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}

/**
 * Optimized Image Component
 */
interface OptimizedImageProps extends Omit<ImageProps, 'loader'> {
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** Show blur placeholder while loading */
  showBlur?: boolean;
  /** Custom blur data URL */
  blurDataURL?: string;
  /** Use CDN for image delivery */
  useCDN?: boolean;
}

export function OptimizedImage({
  lazy = true,
  showBlur = true,
  useCDN = true,
  priority,
  ...props
}: OptimizedImageProps) {
  // If priority is true, disable lazy loading
  const shouldLazyLoad = !priority && lazy;

  return (
    <Image
      {...props}
      loader={useCDN ? cdnImageLoader : undefined}
      priority={priority}
      loading={shouldLazyLoad ? 'lazy' : 'eager'}
      placeholder={showBlur ? 'blur' : undefined}
      blurDataURL={
        props.blurDataURL ||
        (showBlur ? generateBlurDataURL(props.width as number, props.height as number) : undefined)
      }
      quality={props.quality || 75}
      sizes={props.sizes || generateSizes(props.width as number)}
    />
  );
}

/**
 * Responsive Image with multiple sources
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  breakpoints?: number[];
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  breakpoints = [640, 768, 1024, 1280, 1536],
  priority = false,
  ...props
}: ResponsiveImageProps) {
  const srcSet = breakpoints.map(bp => `${cdnImageLoader({ src, width: bp })} ${bp}w`).join(', ');

  const sizes = breakpoints
    .map((bp, index) => {
      if (index === breakpoints.length - 1) return `${bp}px`;
      return `(max-width: ${bp}px) ${bp}px`;
    })
    .join(', ');

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      {...props}
    />
  );
}

/**
 * Background Image with optimization
 */
interface BackgroundImageProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function BackgroundImage({
  src,
  alt = '',
  children,
  className = '',
  style = {},
  overlay = false,
  overlayOpacity = 0.5,
}: BackgroundImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const optimizedSrc = cdnImageLoader({ src, width: 1920, quality: 80 });

  return (
    <div
      className={`relative ${className}`}
      style={{
        ...style,
        backgroundImage: imageLoaded ? `url(${optimizedSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Preload image */}
      <Image
        src={src}
        alt={alt}
        fill
        style={{ display: 'none' }}
        onLoad={() => setImageLoaded(true)}
        priority
      />

      {/* Overlay */}
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

/**
 * Generate blur placeholder data URL
 */
function generateBlurDataURL(width: number, height: number): string {
  const aspectRatio = height / width;
  const blurWidth = 8;
  const blurHeight = Math.round(blurWidth * aspectRatio);

  // Simple SVG blur placeholder
  const svg = `
    <svg width="${blurWidth}" height="${blurHeight}" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)" />
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate responsive sizes attribute
 */
function generateSizes(width: number): string {
  const breakpoints = [
    { maxWidth: 640, size: '100vw' },
    { maxWidth: 768, size: '80vw' },
    { maxWidth: 1024, size: '70vw' },
    { maxWidth: 1280, size: '60vw' },
    { maxWidth: 1536, size: '50vw' },
  ];

  const sizes = breakpoints
    .filter(bp => bp.maxWidth < width)
    .map(bp => `(max-width: ${bp.maxWidth}px) ${bp.size}`)
    .join(', ');

  return sizes || `${width}px`;
}

/**
 * Lazy load image hook
 */
export function useLazyImage(src: string): [string | null, boolean] {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return [imageSrc, isLoaded];
}

/**
 * Preload critical images
 */
export function preloadImages(srcs: string[]): void {
  if (typeof window === 'undefined') return;

  srcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = cdnImageLoader({ src, width: 1920, quality: 75 });
    document.head.appendChild(link);
  });
}

/**
 * Image compression utility (client-side)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'jpg';

  // Check AVIF support
  const avifSupport =
    document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
  if (avifSupport) return 'avif';

  // Check WebP support
  const webpSupport =
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  if (webpSupport) return 'webp';

  return 'jpg';
}
