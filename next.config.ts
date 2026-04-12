import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Removed invalid keys (eslint and swcMinify)
};

export default nextConfig;