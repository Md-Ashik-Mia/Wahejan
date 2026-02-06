import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Explicitly pass these to the server runtime
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  }
};

export default nextConfig;
