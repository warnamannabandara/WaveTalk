import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from attempting to bundle/SSR the MediaPipe WASM package
  serverExternalPackages: ['@mediapipe/tasks-vision'],
};

export default nextConfig;