import Image from 'next/image';
import { useState } from 'react';
import { 
  generateImageAlt, 
  optimizeImageLoading, 
  getOptimizedImageSrc, 
  generateBlurDataURL, 
  getImageDimensions 
} from '@/utils/imageHelpers';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  isAboveFold?: boolean;
  isCritical?: boolean;
  context?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  priority,
  fill = false,
  width,
  height,
  quality,
  sizes,
  loading,
  isAboveFold = false,
  isCritical = false,
  context,
  fallbackSrc,
  onError
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate alt text if not provided
  const imageAlt = alt || generateImageAlt(src, context);
  
  // Get optimization settings
  const optimization = optimizeImageLoading(src, isAboveFold, isCritical);
  
  // Get optimized image sources
  const { webp, fallback } = getOptimizedImageSrc(src);
  
  // Get dimensions if not provided
  const dimensions = getImageDimensions(src);
  const finalWidth = width || dimensions.width;
  const finalHeight = height || dimensions.height;
  
  // Merge props with optimization settings
  const finalPriority = priority !== undefined ? priority : optimization.priority;
  const finalLoading = loading || optimization.loading;
  const finalQuality = quality || optimization.quality || 80;
  const finalSizes = sizes || optimization.sizes;
  
  // Error fallback source
  const errorFallback = fallbackSrc || '/images/logo/logo-orange.png';
  
  // Generate blur placeholder
  const blurDataURL = generateBlurDataURL(40, 30);

  const handleImageError = () => {
    setImgError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // SVG images don't need WebP optimization
  if (src.endsWith('.svg')) {
    return (
      <Image
        src={imgError ? errorFallback : src}
        alt={imageAlt}
        className={className}
        priority={finalPriority}
        fill={fill}
        width={!fill ? finalWidth : undefined}
        height={!fill ? finalHeight : undefined}
        quality={finalQuality}
        sizes={finalSizes}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
  }

  // For raster images, use picture element with WebP support
  return (
    <picture className={isLoading ? 'opacity-0 transition-opacity duration-300' : 'opacity-100 transition-opacity duration-300'}>
      {webp && (
        <source 
          srcSet={imgError ? undefined : webp} 
          type="image/webp" 
          sizes={finalSizes}
        />
      )}
      <source 
        srcSet={imgError ? errorFallback : (fallback || src)} 
        type="image/jpeg" 
        sizes={finalSizes}
      />
      <Image
        src={imgError ? errorFallback : (fallback || src)}
        alt={imageAlt}
        className={className}
        priority={finalPriority}
        fill={fill}
        width={!fill ? finalWidth : undefined}
        height={!fill ? finalHeight : undefined}
        quality={finalQuality}
        sizes={finalSizes}
        loading={finalLoading}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </picture>
  );
}

// Specialized components for common use cases
export function LogoImage({ src, alt, className, ...props }: Omit<OptimizedImageProps, 'isCritical' | 'priority'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt || 'Company logo'}
      className={className}
      isCritical={true}
      priority={true}
      {...props}
    />
  );
}

export function HeroImage({ src, alt, className, ...props }: Omit<OptimizedImageProps, 'isAboveFold' | 'isCritical'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      isAboveFold={true}
      isCritical={true}
      {...props}
    />
  );
}

export function LazyImage({ src, alt, className, ...props }: Omit<OptimizedImageProps, 'loading' | 'priority'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      priority={false}
      {...props}
    />
  );
} 