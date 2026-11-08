import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.com",
      },
      {
        protocol: "https",
        hostname: "grupocls.com.br",
      },
      {
        protocol: "https",
        hostname: "*.grupocls.com.br",
      },
    ],
    // Allow unoptimized local images served from /public
    unoptimized: false,
  },
};

export default nextConfig;
