import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  // Optimize chunk loading
  experimental: { 
    optimizePackageImports: ['lucide-react', 'firebase', 'react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '152.42.229.232',
        port: '1041',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;