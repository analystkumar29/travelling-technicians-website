import Head from 'next/head';

interface PreloadHintsProps {
  criticalImages?: string[];
  fonts?: string[];
}

/**
 * PreloadHints component for critical resource optimization
 * Preloads LCP images and critical fonts for better performance
 */
export default function PreloadHints({ 
  criticalImages = [
    '/images/logo/logo-orange-optimized.webp',
    '/images/services/doorstep-repair-tech-optimized.webp'
  ],
  fonts = []
}: PreloadHintsProps) {
  return (
    <Head>
      {/* Preload critical images for LCP optimization */}
      {criticalImages.map((imageSrc, index) => {
        // Determine image type for proper preload
        const isWebP = imageSrc.includes('.webp');
        const isSVG = imageSrc.includes('.svg');
        const isPNG = imageSrc.includes('.png');
        
        let asType = 'image';
        let type = '';
        
        if (isWebP) type = 'image/webp';
        else if (isSVG) type = 'image/svg+xml';
        else if (isPNG) type = 'image/png';
        else type = 'image/jpeg';
        
        return (
          <link
            key={`preload-image-${index}`}
            rel="preload"
            href={imageSrc}
            as={asType}
            type={type}
          />
        );
      })}
      
      {/* Preload critical fonts */}
      {fonts.map((fontSrc, index) => (
        <link
          key={`preload-font-${index}`}
          rel="preload"
          href={fontSrc}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
}

// Specialized preload components for different page types
export function HomePagePreloads() {
  return (
    <PreloadHints
      criticalImages={[
        '/images/logo/logo-orange-optimized.webp',
        '/images/services/doorstep-repair-tech-optimized.webp',
        '/images/brands/apple.svg',
        '/images/brands/samsung.svg'
      ]}
    />
  );
}

export function BlogPagePreloads({ featuredImage }: { featuredImage?: string }) {
  const criticalImages = ['/images/logo/logo-orange-optimized.webp'];
  if (featuredImage) criticalImages.push(featuredImage);
  
  return <PreloadHints criticalImages={criticalImages} />;
}

export function ServicePagePreloads({ heroImage }: { heroImage?: string }) {
  const criticalImages = ['/images/logo/logo-orange-optimized.webp'];
  if (heroImage) criticalImages.push(heroImage);
  
  return <PreloadHints criticalImages={criticalImages} />;
}
