/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  output: 'standalone',
  experimental: {
    // Only use experimental options that are supported in Next.js 12.3.4
    outputFileTracingRoot: '/',
    esmExternals: true
  }
}

module.exports = nextConfig
