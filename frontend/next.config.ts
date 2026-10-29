import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (Vercel ignores this).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    if (process.env.NODE_ENV === "production" && !process.env.API_PROXY_URL) return [];
    const origin = process.env.API_PROXY_URL || "http://127.0.0.1:4000";
    return [{ source: "/api/:path*", destination: `${origin}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
