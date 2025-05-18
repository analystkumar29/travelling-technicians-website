import React from 'react';
import Image, { ImageProps } from 'next/image';

interface UnsplashImageProps extends Omit<ImageProps, 'src'> {
  imageId: string;
  quality?: number;
  // Optional width and height for the Unsplash image query params
  imgWidth?: number;
  imgHeight?: number;
  // Support for the fill prop (will be converted to layout="fill")
  fill?: boolean;
  // Using layout instead of fill for Next.js 12.3.4
  layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
}

/**
 * UnsplashImage component adapted for Next.js 12.3.4
 * Uses layout="fill" instead of fill={true}
 */
const UnsplashImage: React.FC<UnsplashImageProps> = ({
  imageId,
  quality = 80,
  imgWidth = 1200,
  imgHeight,
  alt,
  fill,
  layout,
  width,
  height,
  sizes,
  className,
  ...rest
}) => {
  // If fill is true, use layout="fill"
  const actualLayout = fill ? 'fill' : layout;
  
  // Determine sizes based on layout
  const imageSizes = (actualLayout === 'fill' || fill) && !sizes
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : sizes;

  // Construct the Unsplash URL with appropriate query parameters
  const heightParam = imgHeight ? `&h=${imgHeight}` : '';
  const imageUrl = `https://images.unsplash.com/photo-${imageId}?q=${quality}&w=${imgWidth}${heightParam}`;

  // In Next.js 12.3.4, we need to provide width/height if not using layout=fill
  const needsDimension = actualLayout !== 'fill' && !fill && (!width || !height);
  const imageWidth = width || (needsDimension ? imgWidth : undefined);
  const imageHeight = height || (needsDimension ? imgHeight || Math.round(imgWidth * 0.75) : undefined);

  return (
    <Image
      src={imageUrl}
      alt={alt || "Unsplash Image"}
      layout={actualLayout}
      width={imageWidth}
      height={imageHeight}
      sizes={imageSizes}
      className={className}
      {...rest}
    />
  );
};

export default UnsplashImage; 