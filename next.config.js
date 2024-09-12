/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['backend-admin-sdk'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = nextConfig
