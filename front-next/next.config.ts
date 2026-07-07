import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/quality/**'
      },
      {
        protocol: 'http',
        hostname: 'vminforfish2d.promopesca.com.ec',
        port: '9000',
        pathname: '/quality/**'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ]
  }
  /* config options here */
}

export default nextConfig
