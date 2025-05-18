import React from 'react';
import Image, { ImageProps } from 'next/image';

// Pattern to detect Unsplash URLs
const UNSPLASH_PATTERN = /^https:\/\/images\.unsplash\.com/;

// Default local placeholder
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

// In Next.js 12.3.4, fill is not supported
interface ResponsiveImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  // Support for the fill prop (will be converted to layout="fill")
  fill?: boolean;
  // Using layout instead of fill in Next.js 12.3.4
  layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
}

/**
 * ResponsiveImage component adapted for Next.js 12.3.4
 * Uses layout="fill" instead of fill={true}
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  fill,
  layout,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  sizes,
  className = '',
  width,
  height,
  ...rest
}) => {
  // If fill is true, use layout="fill"
  const actualLayout = fill ? 'fill' : layout;

  // If layout is fill but no sizes is provided, add a default sizes value
  const imageSizes = (actualLayout === 'fill' || fill) && !sizes 
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : sizes;
  
  // Special handling for Unsplash images to prevent 404s
  const actualSrc = typeof src === 'string' && UNSPLASH_PATTERN.test(src) && !src.includes('?')
    ? `${src}?q=80&w=800` // Append quality and width params
    : src;

  // Handle error fallback
  const [error, setError] = React.useState(false);

  // In Next.js 12.3.4, we need to provide width/height if not using layout=fill
  const needsDimension = actualLayout !== 'fill' && !fill && (!width || !height);
  const imageWidth = width || (needsDimension ? 1920 : undefined);
  const imageHeight = height || (needsDimension ? 1080 : undefined);

  // Filter out fill prop to avoid passing it to the Image component
  const restProps = {...rest};
  if ('fill' in restProps) {
    delete (restProps as any).fill;
  }

  return (
    <Image 
      src={error ? fallbackSrc : actualSrc}
      alt={alt || "Image"}
      layout={actualLayout}
      sizes={imageSizes}
      className={className}
      width={imageWidth}
      height={imageHeight}
      onError={() => setError(true)}
      {...restProps}
    />
  );
};

export default ResponsiveImage; 