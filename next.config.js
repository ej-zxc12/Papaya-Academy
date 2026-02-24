/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/papayaacademy-system.appspot.com/o/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/papayaacademy-system.firebasestorage.app/o/**',
      },
      {
        protocol: 'https',
        hostname: 'papayaacademy-system.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
