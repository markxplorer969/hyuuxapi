import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Optimize chunk loading
  experimental: { 
    optimizePackageImports: ['lucide-react', 'firebase', 'react'],
  },
  images: {
    domains: ['152.42.229.232:1041'],
  },
};

export default nextConfig;