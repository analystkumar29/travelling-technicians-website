/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration based on environment
  ...(process.env.NODE_ENV === 'production' ? 
    // PRODUCTION CONFIG - For Vercel deployment
    {
      // For GitHub Pages deployment (enable static export)
      // output: 'export',
      // For Vercel deployment with API routes (remove output:'export')
      
      // Trailing slash for URL consistency
      trailingSlash: true,
      
      // Images must be properly configured
      images: {
        domains: ['images.unsplash.com'],
        // Only needed for static export
        // unoptimized: true,
      },
    } : 
    // DEVELOPMENT CONFIG
    {
      // Dev mode config (API routes will work here)
      images: {
        domains: ['images.unsplash.com'],
      },
    }
  ),
}

module.exports = nextConfig 