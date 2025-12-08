import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pino', 'thread-stream', '@stacks/connect'],
};

export default nextConfig;
