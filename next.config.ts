import type { NextConfig } from "next";

// eslint-ignore-next-line is acceptable; NextConfig type varies by Next.js version
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
} satisfies NextConfig;

export default nextConfig;
