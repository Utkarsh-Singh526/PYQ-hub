/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,        // ← Yeh line important hai
  },
  eslint: {
    ignoreDuringBuilds: true,       // Extra safety
  },
};

export default nextConfig;