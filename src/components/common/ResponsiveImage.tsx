import React from 'react';
import Image, { ImageProps } from 'next/image';

// Pattern to detect Unsplash URLs
const UNSPLASH_PATTERN = /^https:\/\/images\.unsplash\.com/;

// Default local placeholder
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

interface ResponsiveImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * ResponsiveImage component that:
 * 1. Always adds sizes attribute when fill prop is true
 * 2. Provides fallback for Unsplash images 
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  fill,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  sizes,
  className = '',
  ...rest
}) => {
  // If fill is true but no sizes is provided, add a default sizes value
  const imageSizes = fill && !sizes 
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : sizes;
  
  // Special handling for Unsplash images to prevent 404s
  const actualSrc = typeof src === 'string' && UNSPLASH_PATTERN.test(src) && !src.includes('?')
    ? `${src}?q=80&w=800` // Append quality and width params
    : src;

  // Handle error fallback
  const [error, setError] = React.useState(false);

  return (
    <Image 
      src={error ? fallbackSrc : actualSrc}
      alt={alt || "Image"}
      fill={fill}
      sizes={imageSizes}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
};

export default ResponsiveImage; 