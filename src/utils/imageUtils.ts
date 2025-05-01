/**
 * Utility functions for image handling
 */

// Local fallback images for common categories
export const FALLBACK_IMAGES = {
  DEVICE_REPAIR: '/images/fallbacks/device-repair.jpg',
  MOBILE_REPAIR: '/images/fallbacks/mobile-repair.jpg',
  LAPTOP_REPAIR: '/images/fallbacks/laptop-repair.jpg',
  TECHNICIAN: '/images/fallbacks/technician.jpg',
  CUSTOMER: '/images/fallbacks/customer.jpg',
  SERVICE: '/images/fallbacks/service.jpg',
  GENERIC: '/images/fallbacks/placeholder.jpg',
};

// Working Unsplash image IDs that have been verified
export const VERIFIED_UNSPLASH_IMAGES = {
  DEVICE_REPAIR: [
    'photo-1589939705384-5185137a7f0f',
    'photo-1589793907316-f94025b46850',
    'photo-1585495976940-2420865c8d86',
  ],
  TECHNICIANS: [
    'photo-1544717305-2782549b5136',
    'photo-1530811761207-8d9d22f0a141',
    'photo-1560250097-0b93528c311a',
  ],
  CUSTOMERS: [
    'photo-1507003211169-0a1dd7228f2d',
    'photo-1573497019940-1c28c88b4f3e',
    'photo-1500648767791-00dcc994a43e',
  ],
  LAPTOPS: [
    'photo-1588872657578-7efd1f1555ed',
    'photo-1603302576837-37561b2e2302',
    'photo-1496181133206-80ce9b88a853',
  ],
  PHONES: [
    'photo-1546027658-7aa750153465',
    'photo-1580910051074-3eb694886505',
    'photo-1511707171634-5f897ff02aa9',
  ],
};

/**
 * Get a random verified Unsplash image URL from a specific category
 */
export const getRandomVerifiedImage = (category: keyof typeof VERIFIED_UNSPLASH_IMAGES): string => {
  const images = VERIFIED_UNSPLASH_IMAGES[category];
  const randomIndex = Math.floor(Math.random() * images.length);
  return `https://images.unsplash.com/${images[randomIndex]}?auto=format&fit=crop&w=1200&q=80`;
};

/**
 * Get appropriate fallback image path for a category
 */
export const getFallbackImage = (category: keyof typeof FALLBACK_IMAGES = 'GENERIC'): string => {
  return FALLBACK_IMAGES[category];
};

/**
 * Checks if a URL is an Unsplash URL
 */
export const isUnsplashUrl = (url: string): boolean => {
  return url.includes('images.unsplash.com');
};

/**
 * Process an image URL to ensure it's valid
 * - If it's an Unsplash URL but not in our verified list, replace with a verified one
 * - If it's a local URL, ensure it starts with /
 * - Otherwise return as is
 */
export const processImageUrl = (url: string, category: keyof typeof VERIFIED_UNSPLASH_IMAGES = 'DEVICE_REPAIR'): string => {
  if (!url) return getFallbackImage(category === 'DEVICE_REPAIR' ? 'GENERIC' : category as any);
  
  if (isUnsplashUrl(url)) {
    // Check if URL is in our verified list
    const imageId = url.split('/').pop()?.split('?')[0];
    const isVerified = Object.values(VERIFIED_UNSPLASH_IMAGES).some(
      imgs => imgs.includes(imageId || '')
    );
    
    return isVerified ? url : getRandomVerifiedImage(category);
  }
  
  // Handle local images
  if (url.startsWith('./') || (!url.startsWith('/') && !url.startsWith('http'))) {
    return `/${url.replace('./', '')}`;
  }
  
  return url;
}; 