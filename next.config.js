/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use static export in production mode
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    // Base path for GitHub Pages - remove this for Vercel deployment
    // basePath: '/travelling-technicians-website',
    // assetPrefix: '/travelling-technicians-website/',
    // Trailing slash is required for static exports to work properly with links
    trailingSlash: true,
    // Images must be unoptimized for static export
    images: {
      domains: ['images.unsplash.com'],
      unoptimized: true,
    },
  } : {
    // Dev mode config (API routes will work here)
    images: {
      domains: ['images.unsplash.com'],
    },
  }),
}

module.exports = nextConfig 