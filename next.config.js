const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Domain redirects and headers
    async redirects() {
      return [
        // Redirect non-www to www (canonical domain)
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'travelling-technicians.ca',
            },
          ],
          destination: 'https://www.travelling-technicians.ca/:path*',
          permanent: true,
        },
        // Archive redirects - static pages to dynamic equivalents
        {
          source: '/mobile-screen-repair',
          destination: '/services/mobile-repair',
          permanent: true,
        },
        {
          source: '/laptop-screen-repair',
          destination: '/services/laptop-repair',
          permanent: true,
        },
        {
          source: '/mobile-repair-near-me',
          destination: '/repair',
          permanent: true,
        },
        // Fix Google 404s: old /locations/:city URLs → canonical /repair/:city
        {
          source: '/locations/:city',
          destination: '/repair/:city',
          permanent: true,
        },
        // Fix Google 404s: old screen-replacement (no suffix) → screen-replacement-mobile
        {
          source: '/repair/:city/screen-replacement/:model',
          destination: '/repair/:city/screen-replacement-mobile/:model',
          permanent: true,
        },
        // Fix Google 404s: old /service-areas/:city URLs → canonical /repair/:city
        {
          source: '/service-areas/:city',
          destination: '/repair/:city',
          permanent: true,
        },
        // Fix Google 404s: old /doorstep-repair page consolidated into /repair
        {
          source: '/doorstep-repair',
          destination: '/repair',
          permanent: true,
        },
        {
          source: '/doorstep',
          destination: '/repair',
          permanent: true,
        },
        // Brand pages → /repair/{brand}-devices (trademark compliance)
        {
          source: '/brands/apple',
          destination: '/repair/apple-devices',
          permanent: true,
        },
        {
          source: '/brands/samsung',
          destination: '/repair/samsung-devices',
          permanent: true,
        },
        {
          source: '/brands/google',
          destination: '/repair/google-devices',
          permanent: true,
        },
        // Fix GSC 404s: sub-service slugs → parent service pages
        {
          source: '/services/screen-replacement-mobile',
          destination: '/services/mobile-repair',
          permanent: true,
        },
        {
          source: '/services/battery-replacement-mobile',
          destination: '/services/mobile-repair',
          permanent: true,
        },
        {
          source: '/services/screen-replacement-laptop',
          destination: '/services/laptop-repair',
          permanent: true,
        },
        {
          source: '/services/battery-replacement-laptop',
          destination: '/services/laptop-repair',
          permanent: true,
        },
        {
          source: '/services/charging-port-repair',
          destination: '/repair',
          permanent: true,
        },
        {
          source: '/services/water-damage-repair',
          destination: '/repair',
          permanent: true,
        },
        // Fix GSC 404s: inactive city-service routes → city pages
        {
          source: '/repair/:city/charging-port-repair',
          destination: '/repair/:city',
          permanent: true,
        },
        {
          source: '/repair/:city/water-damage-repair',
          destination: '/repair/:city',
          permanent: true,
        },
        // Catch-all for old /services/mobile/... and /services/laptop/... patterns
        {
          source: '/services/mobile/:path*',
          destination: '/services/mobile-repair',
          permanent: true,
        },
        {
          source: '/services/laptop/:path*',
          destination: '/services/laptop-repair',
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
    // Optimize compilation
    compiler: {
      // Remove console.log in production for performance (debug completed)
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
    // Single merged webpack config (previously two configs — second overwrote first)
    webpack: (config, { dev, isServer }) => {
      if (dev) {
        // Disable Fast Refresh
        config.plugins = config.plugins.filter(
          (plugin) =>
            plugin.constructor.name !== 'HotModuleReplacementPlugin' &&
            plugin.constructor.name !== 'ReactFreshWebpackPlugin'
        );

        // Optimize Fast Refresh
        config.watchOptions = {
          aggregateTimeout: 200,
          poll: false,
          ignored: ['**/node_modules', '**/.git', '**/.next']
        };

        config.infrastructureLogging = {
          level: 'error',
        };

        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };
      }

      // Production client-side: copy static assets
      if (!dev && !isServer) {
        try {
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
    // NOTE: 'output: standalone' was removed to enable getStaticPaths
    // to pre-generate all 3,224+ dynamic routes at build time.
    // Standalone mode skips static generation when fallback: 'blocking' is used.
    // If Docker deployment is needed later, use FORCE_STATIC_GENERATION env var.
    experimental: {
      // Only use experimental options that are supported in Next.js 12.3.4
      esmExternals: true
    }
  };

  return nextConfig;
};
