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
      {
        protocol: "https",
        hostname: "iibuedltvdvyumntledk.supabase.co",
        pathname: "/storage/v1/object/public/pool/**",
      },
    ],
  },
};

export default nextConfig;