import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone output mode for Docker
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.com',
      },
    ],
  },
  // ลด overhead ของ server-side logging ใน dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
