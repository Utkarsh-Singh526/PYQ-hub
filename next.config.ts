import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,     // TypeScript errors ignore karo
  },
  eslint: {
    ignoreDuringBuilds: true,    // ESLint errors ignore karo
  },
  // Extra performance settings for Vercel
  swcMinify: true,
};

export default nextConfig;