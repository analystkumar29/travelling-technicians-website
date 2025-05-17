import React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

// Omit fetchPriority from the props to prevent the warning
type SafeImageProps = Omit<NextImageProps, 'fetchPriority'> & {
  // You can add any additional props here if needed
};

/**
 * SafeImage component
 * 
 * A wrapper around Next.js Image that prevents the fetchPriority warning
 * by ensuring we only pass valid props to the underlying Image component.
 * 
 * Use this component instead of directly using next/image when you need
 * to avoid the fetchPriority warning.
 */
export default function SafeImage(props: SafeImageProps) {
  // Pass all props except fetchPriority to the Next.js Image component
  return <NextImage {...props} />;
} 