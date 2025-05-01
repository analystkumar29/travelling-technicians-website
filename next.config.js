/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Self-host Google fonts to avoid network issues
  optimizeFonts: true,
  // Configuration for handling static assets
  staticPageGenerationTimeout: 180,
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Use experimental configuration for network timeouts
  experimental: {
    timeoutMs: 60000, // 60 seconds for network requests
  },
};

module.exports = nextConfig;
