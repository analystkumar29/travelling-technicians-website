import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { FaImage } from 'react-icons/fa';

// Pattern to detect Unsplash URLs
const UNSPLASH_PATTERN = /^https:\/\/images\.unsplash\.com/;

// Default local placeholder
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

// Props that need special handling to avoid React warnings
const FILTERED_PROPS = ['fetchPriority', 'fetchpriority'];

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  altText: string;
  sizes?: string;
  className?: string;
  // Support for the fill prop (will be converted to layout="fill")
  fill?: boolean;
  // Using layout instead of fill for Next.js 12.3.4
  layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
}

/**
 * SafeImage component adapted for Next.js 12.3.4
 * Uses layout="fill" instead of fill={true}
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fill,
  layout,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  fallbackComponent,
  altText,
  sizes,
  className = '',
  priority,
  width,
  height,
  ...restProps
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
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // In Next.js 12.3.4, we need to provide width/height if not using layout=fill
  const needsDimension = actualLayout !== 'fill' && !fill && (!width || !height);
  const imageWidth = width || (needsDimension ? 1920 : undefined);
  const imageHeight = height || (needsDimension ? 1080 : undefined);

  // Filter out any props that cause React warnings
  const imageProps: any = {};
  Object.keys(restProps).forEach(key => {
    if (!FILTERED_PROPS.includes(key)) {
      imageProps[key] = (restProps as any)[key];
    }
  });

  // If we have a fallback component and there was an error, render that
  if (error && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // If we have a fallback path and there was an error, use that
  if (error && fallbackSrc && fallbackSrc !== DEFAULT_PLACEHOLDER) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <Image 
          src={fallbackSrc} 
          alt={altText}
          layout={actualLayout}
          width={imageWidth}
          height={imageHeight}
          sizes={imageSizes}
          priority={priority}
          onError={() => {
            setError(true);
          }}
          onLoad={() => setIsLoading(false)}
          className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          {...imageProps}
        />
      </div>
    );
  }

  // If we've encountered an error and are using the default fallback
  if (error || !actualSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ 
          height: (actualLayout === 'fill' || fill) ? '100%' : '100px', 
          width: (actualLayout === 'fill' || fill) ? '100%' : '100%',
          minHeight: '100px' 
        }}
      >
        <div className="flex flex-col items-center text-gray-500">
          <FaImage className="text-4xl mb-2" />
          <span className="text-sm">{altText}</span>
        </div>
      </div>
    );
  }

  // Normal case - render image with error handler
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={error ? fallbackSrc : actualSrc}
        alt={alt || "Image"}
        layout={actualLayout}
        width={imageWidth}
        height={imageHeight}
        sizes={imageSizes}
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setError(true)}
        onLoad={() => setIsLoading(false)}
        {...imageProps}
      />
    </div>
  );
};

export default SafeImage; 