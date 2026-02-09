import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* IMPORTANT: Amplify Gen 1 Next.js 15 requires standalone output for SSR */
  output: 'standalone',
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
