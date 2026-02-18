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
    ],
  },
}

module.exports = nextConfig
