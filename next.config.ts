import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'thehackernews.com',  // Add your actual image domains
      'localhost',
      'your-api-domain.com'  // Replace with your API domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig