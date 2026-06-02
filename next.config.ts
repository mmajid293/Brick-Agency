import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
  // Expose JWT_SECRET to Edge middleware (same value as .env)
  env: {
    JWT_SECRET:
      process.env.JWT_SECRET || "smart-bhatha-dev-secret-change-in-production-2026",
  },
};

export default nextConfig;
