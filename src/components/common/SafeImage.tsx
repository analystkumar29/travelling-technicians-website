import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { FaImage } from 'react-icons/fa';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  altText: string;
}

const defaultFallbackSrc = '/images/placeholder-image.jpg';

const SafeImage = ({
  src,
  fallbackSrc = defaultFallbackSrc,
  fallbackComponent,
  altText,
  ...props
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    setImgSrc(fallbackSrc);
  };

  // If we have a fallback component and there was an error, render that
  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // If we have a fallback path and there was an error, use that
  if (hasError && !fallbackSrc.includes('/images/placeholder-image.jpg')) {
    return <Image src={fallbackSrc} {...props} alt={altText} />;
  }

  // If we've encountered an error and are using the default fallback
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${props.className || ''}`}
        style={{ 
          height: props.height ? `${props.height}px` : '100%', 
          width: props.width ? `${props.width}px` : '100%',
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
    <Image
      src={imgSrc}
      {...props}
      alt={altText}
      onError={handleError}
    />
  );
};

export default SafeImage; 