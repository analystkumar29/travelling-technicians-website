import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

// Pattern to detect Unsplash URLs
const UNSPLASH_PATTERN = /^https:\/\/images\.unsplash\.com/;

// Default local placeholder
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

// Props that shouldn't be passed to the Image component
const FILTERED_PROPS = ['fallbackSrc', 'fallbackComponent', 'altText', 'fill'];

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  altText: string;
  sizes?: string;
  className?: string;
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
  // Special handling for Unsplash images to prevent 404s
  const actualSrc = typeof src === 'string' && UNSPLASH_PATTERN.test(src) && !src.includes('?')
    ? `${src}?q=80&w=800` // Append quality and width params
    : src;

  // If layout is fill but no sizes is provided, add a default sizes value
  const imageSizes = layout === 'fill' && !sizes 
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : sizes;
  
  // Handle error fallback
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // In Next.js 12.3.4, we need to provide width/height if not using layout=fill
  const needsDimension = layout !== 'fill' && (!width || !height);
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
          layout={layout}
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
        style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
      >
        <div className="text-gray-400 text-center p-4">
          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p>{altText}</p>
        </div>
      </div>
    );
  }

  // Otherwise, render the image
  return (
    <div className={`relative ${className}`}>
      <Image 
        src={actualSrc} 
        alt={altText}
        layout={layout}
        width={imageWidth}
        height={imageHeight}
        sizes={imageSizes}
        priority={priority}
        onError={() => {
          setError(true);
        }}
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        {...imageProps}
      />
    </div>
  );
};

export default SafeImage; 