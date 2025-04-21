/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static site generation
  // Set the base path to the repository name for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/travelling-technicians-website' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/travelling-technicians-website/' : '',
  images: {
    domains: ['images.unsplash.com'], // For placeholder images
    unoptimized: true, // This is required for static export
  },
  // Trailing slash is recommended for static exports
  trailingSlash: true,
}

module.exports = nextConfig 