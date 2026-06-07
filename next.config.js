/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Inject PROJECT_ROOT so Turbopack workers can find content files
  // regardless of which directory is detected as workspace root
  env: {
    PROJECT_ROOT: path.resolve(__dirname),
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

module.exports = nextConfig