// Clear Favicon Cache Script
// This helps force browsers to load new favicon files
(function() {
  'use strict';
  
  function clearFaviconCache() {
    try {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
      
      // Add new favicon links with cache busting
      const faviconLinks = [
        { rel: 'icon', href: '/favicon.ico?v=2024&bust=' + Date.now() },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16x16.png?v=2024&bust=' + Date.now() },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32x32.png?v=2024&bust=' + Date.now() },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicons/favicon-192x192.png?v=2024&bust=' + Date.now() },
        { rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png?v=2024&bust=' + Date.now() }
      ];
      
      faviconLinks.forEach(linkData => {
        const link = document.createElement('link');
        Object.keys(linkData).forEach(key => {
          link.setAttribute(key, linkData[key]);
        });
        document.head.appendChild(link);
      });
      
      console.log('✅ Favicon cache cleared and new icons loaded');
      
      // Force a favicon refresh by creating a temporary link
      const tempLink = document.createElement('link');
      tempLink.rel = 'icon';
      tempLink.href = '/favicon.ico?v=2024&refresh=' + Math.random();
      document.head.appendChild(tempLink);
      
      setTimeout(() => {
        if (tempLink.parentNode) {
          tempLink.parentNode.removeChild(tempLink);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error clearing favicon cache:', error);
    }
  }
  
  // Run immediately
  clearFaviconCache();
  
  // Run again after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearFaviconCache);
  }
  
})(); 