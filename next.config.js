/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  experimental: {
    globalNotFound: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
