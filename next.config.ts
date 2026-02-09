import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Amplify handles SSR output automatically; 'standalone' can sometimes cause path issues in Gen 1 */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
