const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['images.unsplash.com'],
    },
    // Enable asset copying from public folder to ensure manifest.json and favicons are properly included
    webpack: (config, { dev, isServer }) => {
      // Only run in production build
      if (!dev && !isServer) {
        try {
          // Try to load the copy-webpack-plugin
          const CopyWebpackPlugin = require('copy-webpack-plugin');
          
          // Ensure the manifest and favicon files are properly copied
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
          console.log('Added copy-webpack-plugin to webpack config');
        } catch (error) {
          console.warn('copy-webpack-plugin not available, skipping file copy:', error.message);
          // Continue with build even if the plugin is missing
        }
      }
      return config;
    },
    // Add trailing slashes for better compatibility
    trailingSlash: true,
    output: 'standalone',
    experimental: {
      // Only use experimental options that are supported in Next.js 12.3.4
      esmExternals: true
    }
  };

  return nextConfig;
};
