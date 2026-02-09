import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Amplify Gen 1 handles SSR output automatically; 'standalone' is usually for Docker/Vercel */
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
