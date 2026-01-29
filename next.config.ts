import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bernardmarr.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "quark.house",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;