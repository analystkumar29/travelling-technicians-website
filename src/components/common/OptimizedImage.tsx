import Image from 'next/image';

interface OptimizedImageProps {
  webpSrc: string;
  jpegSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  webpSrc,
  jpegSrc,
  alt,
  className = '',
  priority = false,
  fill = false,
  width,
  height
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <source srcSet={jpegSrc} type="image/jpeg" />
      <Image
        src={jpegSrc}
        alt={alt}
        className={className}
        priority={priority}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
      />
    </picture>
  );
} 