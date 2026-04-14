import type { NextConfig } from "next";

const FRAMER_FALLBACK_ORIGIN = "https://your-goodspeed-origin.framer.app";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return {
      fallback: [
        {
          source: "/:path*",
          destination: `${FRAMER_FALLBACK_ORIGIN}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
