/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: '/',
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/@swc/core-win32-x64-msvc',
        'node_modules/@swc/core-win32-ia32-msvc',
        'node_modules/@swc/core-darwin-x64',
        'node_modules/@swc/core-linux-arm-gnueabihf',
        'node_modules/@swc/core-linux-arm64-gnu',
        'node_modules/@swc/core-linux-arm64-musl',
      ],
    },
  },
}

module.exports = nextConfig
