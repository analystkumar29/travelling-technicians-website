/**
 * Image SEO and Optimization Helpers
 * Provides utilities for alt text generation, optimization, and SEO
 */

import { logger } from './logger';

const imageLogger = logger.createModuleLogger('imageHelpers');

export interface ImageMetadata {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
}

export interface ImageSEOData {
  url: string;
  caption?: string;
  title?: string;
  description?: string;
  location?: string;
  license?: string;
}

/**
 * Context-aware alt text generation based on image path and context
 */
export function generateImageAlt(imagePath: string, context?: string): string {
  const fileName = imagePath.split('/').pop()?.replace(/\.(jpg|jpeg|png|webp|svg)$/i, '') || '';
  const directory = imagePath.split('/').slice(-2, -1)[0] || '';
  
  // Brand logos
  if (directory === 'brands') {
    const brandName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    return `${brandName} brand logo for device repair services`;
  }
  
  // Service areas
  if (directory === 'service-areas') {
    const cityName = fileName.replace(/-optimized$/, '').replace(/-/g, ' ');
    const formattedCity = cityName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${formattedCity} repair service area - Mobile and laptop repair technicians available`;
  }
  
  // Blog images
  if (directory === 'blog') {
    const blogTopicMap: { [key: string]: string } = {
      'data-recovery': 'Professional data recovery service for damaged devices',
      'doorstep-service': 'Mobile technician providing doorstep repair services',
      'iphone-repair': 'iPhone screen and component repair service',
      'laptop-battery': 'Laptop battery replacement and maintenance service',
      'laptop-maintenance': 'Professional laptop maintenance and cleaning service',
      'phone-repair-signs': 'Common phone repair signs indicating device needs professional repair',
      'screen-protection': 'Screen protection and damage prevention for mobile devices',
      'water-damage-repair': 'Water damage repair process for electronic devices'
    };
    
    const baseFileName = fileName.replace(/-optimized$/, '');
    return blogTopicMap[baseFileName] || `${baseFileName.replace(/-/g, ' ')} - Professional device repair guide`;
  }
  
  // Services
  if (directory === 'services') {
    if (fileName.includes('mobile-hero')) {
      return 'Mobile phone repair services - Professional technician fixing smartphone';
    }
    if (fileName.includes('laptop-hero')) {
      return 'Laptop repair services - Expert technician repairing computer';
    }
    if (fileName.includes('tablet-hero')) {
      return 'Tablet repair services - Professional iPad and Android tablet repair';
    }
    if (fileName.includes('mobile-service')) {
      const serviceNumber = fileName.match(/\d+/)?.[0] || '';
      return `Mobile phone repair service illustration ${serviceNumber} - Screen replacement and component repair`;
    }
    if (fileName.includes('laptop-service')) {
      const serviceNumber = fileName.match(/\d+/)?.[0] || '';
      return `Laptop repair service illustration ${serviceNumber} - Hardware and software repair`;
    }
    if (fileName.includes('tablet-service')) {
      const serviceNumber = fileName.match(/\d+/)?.[0] || '';
      return `Tablet repair service illustration ${serviceNumber} - iPad and Android tablet repair`;
    }
    if (fileName.includes('doorstep-repair-tech')) {
      return 'Doorstep repair technician - Mobile service bringing repairs to your location';
    }
  }
  
  // Team photos
  if (directory === 'team') {
    const roleMap: { [key: string]: string } = {
      'founder': 'Company founder and lead technician - Expert in mobile and laptop repair',
      'mobile-tech': 'Mobile phone repair specialist - Expert in iPhone and Android repair',
      'laptop-tech': 'Laptop repair technician - Specialist in MacBook and PC repair',
      'operations': 'Operations manager - Coordinating repair services and customer support'
    };
    return roleMap[fileName] || `Team member - ${fileName.replace(/-/g, ' ')} specialist`;
  }
  
  // About section
  if (directory === 'about') {
    if (fileName.includes('repair-process')) {
      return 'Professional device repair process - Quality assurance and testing procedures';
    }
    if (fileName.includes('team-meeting')) {
      return 'Team meeting - Coordinating repair services and quality standards';
    }
  }
  
  // Certifications
  if (directory === 'certifications') {
    const certMap: { [key: string]: string } = {
      'apple': 'Technical certification for Apple device repair - Professional training for iPhone iPad MacBook services',
      'samsung': 'Technical certification for Samsung device repair - Professional training for Galaxy device services', 
      'comptia': 'CompTIA A+ certification - Industry-standard computer hardware and software repair qualification'
    };
    return certMap[fileName] || `${fileName.charAt(0).toUpperCase() + fileName.slice(1)} technical certification - Professional training for device repair services`;
  }
  
  // Logo
  if (directory === 'logo' || fileName.includes('logo')) {
    return 'The Travelling Technicians logo - Professional mobile and laptop repair services';
  }
  
  // Fallback with context
  if (context) {
    return `${context} - ${fileName.replace(/-/g, ' ')}`;
  }
  
  // Generic fallback
  return fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

/**
 * Optimize image loading configuration based on image importance
 */
export function optimizeImageLoading(
  imagePath: string, 
  isAboveFold: boolean = false,
  isCritical: boolean = false
): Partial<ImageMetadata> {
  const isLogo = imagePath.includes('logo');
  const isHero = imagePath.includes('hero') || imagePath.includes('main');
  const isBrandIcon = imagePath.includes('brands/');
  
  // Critical images (logos, hero images, above-fold content)
  if (isCritical || isLogo || (isHero && isAboveFold)) {
    return {
      priority: true,
      loading: 'eager',
      quality: 90,
      sizes: isLogo ? '(max-width: 300px) 300px, 300px' : 
             isHero ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' :
             '(max-width: 768px) 100vw, 50vw'
    };
  }
  
  // Brand icons (small, frequently used)
  if (isBrandIcon) {
    return {
      priority: false,
      loading: 'lazy',
      quality: 85,
      sizes: '(max-width: 48px) 48px, 48px'
    };
  }
  
  // Service illustrations (medium priority)
  if (imagePath.includes('services/') && imagePath.includes('service-')) {
    return {
      priority: false,
      loading: 'lazy',
      quality: 80,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
    };
  }
  
  // Blog images (lower priority, lazy load)
  if (imagePath.includes('blog/')) {
    return {
      priority: false,
      loading: 'lazy',
      quality: 80,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw'
    };
  }
  
  // Service area images (lazy load)
  if (imagePath.includes('service-areas/')) {
    return {
      priority: false,
      loading: 'lazy',
      quality: 75,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    };
  }
  
  // Team photos (lazy load)
  if (imagePath.includes('team/')) {
    return {
      priority: false,
      loading: 'lazy',
      quality: 85,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw'
    };
  }
  
  // Default optimization
  return {
    priority: false,
    loading: 'lazy',
    quality: 80,
    sizes: '(max-width: 768px) 100vw, 50vw'
  };
}

/**
 * Generate WebP source path with fallback
 */
export function getOptimizedImageSrc(imagePath: string): { webp?: string; fallback: string } {
  const basePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
  const extension = imagePath.match(/\.(jpg|jpeg|png|svg)$/i)?.[0] || '';
  
  // SVGs don't need WebP conversion
  if (extension.toLowerCase() === '.svg') {
    return { fallback: imagePath };
  }
  
  // Check if optimized version exists
  const optimizedWebP = `${basePath}-optimized.webp`;
  const optimizedJpg = `${basePath}-optimized.jpg`;
  
  return {
    webp: optimizedWebP,
    fallback: optimizedJpg || imagePath
  };
}

/**
 * Create image sitemap data for SEO
 */
export function createImageSitemapData(images: string[]): ImageSEOData[] {
  return images.map(imagePath => {
    const alt = generateImageAlt(imagePath);
    const url = `https://travelling-technicians.ca${imagePath}`;
    
    // Extract location from service area images
    let location;
    if (imagePath.includes('service-areas/')) {
      const cityName = imagePath.split('/').pop()?.replace(/-optimized\.(jpg|webp)$/i, '').replace(/-/g, ' ');
      location = cityName ? `${cityName}, BC, Canada` : undefined;
    }
    
    return {
      url,
      caption: alt,
      title: alt,
      description: alt,
      location
    };
  });
}

/**
 * Generate blur data URL for loading placeholder
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  // Create a simple gray gradient blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Get image dimensions from common image ratios
 */
export function getImageDimensions(imagePath: string): { width: number; height: number } {
  // Logo images
  if (imagePath.includes('logo')) {
    return { width: 300, height: 60 };
  }
  
  // Brand icons
  if (imagePath.includes('brands/')) {
    return { width: 48, height: 48 };
  }
  
  // Hero images
  if (imagePath.includes('hero')) {
    return { width: 800, height: 600 };
  }
  
  // Service illustrations
  if (imagePath.includes('services/') && imagePath.includes('service-')) {
    return { width: 400, height: 300 };
  }
  
  // Blog images
  if (imagePath.includes('blog/')) {
    return { width: 800, height: 500 };
  }
  
  // Service area images
  if (imagePath.includes('service-areas/')) {
    return { width: 600, height: 400 };
  }
  
  // Team photos
  if (imagePath.includes('team/')) {
    return { width: 400, height: 400 };
  }
  
  // Default
  return { width: 600, height: 400 };
}

/**
 * Image performance audit
 */
export function auditImagePerformance(images: string[]): {
  critical: string[];
  optimized: string[];
  needsOptimization: string[];
  recommendations: string[];
} {
  const critical: string[] = [];
  const optimized: string[] = [];
  const needsOptimization: string[] = [];
  const recommendations: string[] = [];
  
  images.forEach(imagePath => {
    // Check for critical images
    if (imagePath.includes('logo') || imagePath.includes('hero')) {
      critical.push(imagePath);
    }
    
    // Check if already optimized
    if (imagePath.includes('-optimized') || imagePath.endsWith('.webp') || imagePath.endsWith('.svg')) {
      optimized.push(imagePath);
    } else {
      needsOptimization.push(imagePath);
      recommendations.push(`Convert ${imagePath} to WebP format for better compression`);
    }
  });
  
  return {
    critical,
    optimized,
    needsOptimization,
    recommendations
  };
}

const imageHelpers = {
  generateImageAlt,
  optimizeImageLoading,
  getOptimizedImageSrc,
  createImageSitemapData,
  generateBlurDataURL,
  getImageDimensions,
  auditImagePerformance
};

export default imageHelpers;
