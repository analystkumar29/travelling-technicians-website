const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Domain redirects and headers
    async redirects() {
      return [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'travelling-technicians.ca',
            },
          ],
          destination: 'https://www.travelling-technicians.ca',
          permanent: true,
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            }
          ],
        },
      ];
    },
    // Disable Fast Refresh in development
    webpack: (config, { dev, isServer }) => {
      if (dev) {
        // Disable Fast Refresh
        config.plugins = config.plugins.filter(
          (plugin) => 
            plugin.constructor.name !== 'HotModuleReplacementPlugin' &&
            plugin.constructor.name !== 'ReactFreshWebpackPlugin'
        );
      }
      return config;
    },
    // Optimize compilation
    compiler: {
      // Suppress non-error logs
      removeConsole: process.env.NODE_ENV === 'production',
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    // Enable asset copying from public folder to ensure manifest.json and favicons are properly included
    webpack: (config, { dev, isServer }) => {
      // Development optimizations
      if (dev) {
        // Optimize Fast Refresh
        config.watchOptions = {
          aggregateTimeout: 200, // Delay rebuild
          poll: false, // Use filesystem events
          ignored: ['**/node_modules', '**/.git', '**/.next']
        };
        
        // Reduce compilation output
        config.infrastructureLogging = {
          level: 'error',
        };
        
        // Optimize development performance
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };
      }
      
      // Production optimizations
      if (!dev && !isServer) {
        try {
          // Copy static assets
          const CopyWebpackPlugin = require('copy-webpack-plugin');
          config.plugins.push(
            new CopyWebpackPlugin({
              patterns: [
                {
                  from: 'public/manifest.json',
                  to: '../public/manifest.json',
                },
                {
                  from: 'public/favicons',
                  to: '../public/favicons',
                },
              ],
            })
          );
        } catch (error) {
          console.warn('copy-webpack-plugin not available:', error.message);
        }
      }
      
      return config;
    },
    // Remove trailing slash to fix API routing
    trailingSlash: false,
    output: 'standalone',
    experimental: {
      // Only use experimental options that are supported in Next.js 12.3.4
      esmExternals: true
    }
  };

  return nextConfig;
};
