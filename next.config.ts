import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* Amplify Gen 1 handles SSR output automatically */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow the server to log more details for debugging Amplify failures
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
