import React from 'react';
import Image, { ImageProps } from 'next/image';

interface UnsplashImageProps extends Omit<ImageProps, 'src'> {
  imageId: string;
  quality?: number;
  // Optional width and height for the Unsplash image query params
  imgWidth?: number;
  imgHeight?: number;
}

/**
 * UnsplashImage component that properly formats Unsplash URLs with query parameters
 * to optimize loading and prevent 404 errors
 */
const UnsplashImage: React.FC<UnsplashImageProps> = ({
  imageId,
  quality = 80,
  imgWidth = 1200,
  imgHeight,
  alt,
  fill,
  sizes = fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined,
  className,
  ...rest
}) => {
  // Construct the Unsplash URL with appropriate query parameters
  const heightParam = imgHeight ? `&h=${imgHeight}` : '';
  const imageUrl = `https://images.unsplash.com/photo-${imageId}?q=${quality}&w=${imgWidth}${heightParam}`;

  return (
    <Image
      src={imageUrl}
      alt={alt || "Unsplash Image"}
      fill={fill}
      sizes={sizes}
      className={className}
      {...rest}
    />
  );
};

export default UnsplashImage; 