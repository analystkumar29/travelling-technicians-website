import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { FaImage } from 'react-icons/fa';

// Pattern to detect Unsplash URLs
const UNSPLASH_PATTERN = /^https:\/\/images\.unsplash\.com/;

// Default local placeholder
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  altText: string;
  sizes?: string;
  className?: string;
}

/**
 * SafeImage component that handles:
 * 1. Always adds sizes attribute when fill prop is true
 * 2. Provides fallback for external images (especially Unsplash)
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fill,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  fallbackComponent,
  altText,
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
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          fill={fill}
          sizes={imageSizes}
          onError={() => {
            setError(true);
          }}
          onLoad={() => setIsLoading(false)}
          className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          {...rest}
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
          height: fill ? '100%' : '100px', 
          width: fill ? '100%' : '100%',
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
        fill={fill}
        sizes={imageSizes}
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setError(true)}
        onLoad={() => setIsLoading(false)}
        {...rest}
      />
    </div>
  );
};

export default SafeImage; 