import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  lowQualitySrc?: string;
  blurAmount?: number;
}

/**
 * Progressive Image Component
 * Shows low-quality placeholder while loading full image for better perceived performance
 */
export default function ProgressiveImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  quality = 80,
  sizes,
  lowQualitySrc,
  blurAmount = 10
}: ProgressiveImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLowQuality, setShowLowQuality] = useState(true);

  // Generate low quality placeholder if not provided
  const lowQualityPlaceholder = lowQualitySrc || generateLowQualityUrl(src);

  useEffect(() => {
    // Preload the high-quality image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Delay hiding low quality to create smooth transition
      setTimeout(() => setShowLowQuality(false), 300);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Low quality placeholder */}
      {showLowQuality && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            filter: `blur(${blurAmount}px)`,
            transform: 'scale(1.1)', // Slight scale to hide blur edges
          }}
        >
          <OptimizedImage
            src={lowQualityPlaceholder}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            quality={20} // Very low quality for fast loading
            sizes={sizes}
            loading="eager" // Load immediately
            className="object-cover"
          />
        </div>
      )}

      {/* High quality image */}
      <div
        className={`transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <OptimizedImage
          src={src}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          quality={quality}
          sizes={sizes}
          className="object-cover"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    </div>
  );
}

// Generate low quality URL (simplified - in production would use actual image processing)
function generateLowQualityUrl(src: string): string {
  // For WebP images, try to find a lower quality version
  if (src.includes('-optimized.webp')) {
    return src.replace('-optimized.webp', '-thumb.webp');
  }
  
  // For regular images, we'd typically use a CDN parameter
  // For now, return the same image (would be processed server-side)
  return src;
}

// Specialized progressive components
export function ProgressiveHeroImage({ src, alt, className, ...props }: Omit<ProgressiveImageProps, 'lowQualitySrc'>) {
  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      className={className}
      quality={90} // Higher quality for hero images
      blurAmount={15} // More blur for dramatic effect
      {...props}
    />
  );
}

export function ProgressiveBlogImage({ src, alt, className, ...props }: Omit<ProgressiveImageProps, 'lowQualitySrc'>) {
  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      className={className}
      quality={80}
      blurAmount={8}
      {...props}
    />
  );
}
