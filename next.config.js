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
        // Ensure the manifest and favicon files are properly copied
        config.plugins.push(
          new (require('copy-webpack-plugin'))({
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
      }
      return config;
    },
    // Add trailing slashes for better compatibility
    trailingSlash: true,
    output: 'standalone',
    experimental: {
      // Only use experimental options that are supported in Next.js 12.3.4
      outputFileTracingRoot: '/',
      esmExternals: true
    }
  };

  return nextConfig;
};
