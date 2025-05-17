/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to prevent double rendering during development
  reactStrictMode: false,
  
  // Configure standalone output to include sharp
  output: 'standalone',
  experimental: {
    // Add packages to include in the standalone output
    outputFileTracingRoot: __dirname,
    outputFileTracingIncludes: {
      '/': ['node_modules/sharp/**/*'],
    },
  },
  
  // Update image configuration to use only remotePatterns and not deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },
  // Disable webpack disk cache and HMR to prevent ENOENT errors and continuous rebuilds
  webpack: (config, { dev, isServer }) => {
    // Disable persistent cache in development
    if (dev) {
      config.cache = false;
      
      // Disable HMR which is causing continuous reloads
      if (!isServer) {
        config.optimization.runtimeChunk = false;
        config.plugins = config.plugins.filter(
          (plugin) => !(plugin.constructor.name === 'HotModuleReplacementPlugin')
        );
      }
    }
    
    return config;
  },
  // Increase timeout for static page generation
  staticPageGenerationTimeout: 180,
  // Configure header for better caching
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
  // Prevent page reloads when encountering errors
  onDemandEntries: {
    // Keep the pages in memory longer between builds
    maxInactiveAge: 60 * 60 * 1000,
    // Increase the number of pages that should be kept in memory
    pagesBufferLength: 5,
  },
  // Disable fast refresh entirely to prevent constant reloading
  devIndicators: {
    buildActivity: false,
  },
};

module.exports = nextConfig;
