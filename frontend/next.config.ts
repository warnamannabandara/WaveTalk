import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  turbopack: {
    root: "./",
  },
} as any;

export default nextConfig;
