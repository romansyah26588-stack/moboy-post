import type { NextConfig } from "next";

// Setup untuk development dengan Cloudflare Pages
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  
  // === CLOUDFLARE PAGES CONFIGURATIONS ===
  // Export static HTML files untuk Cloudflare Pages
  output: 'export',
  
  // Tambahkan trailing slash untuk routing yang benar
  trailingSlash: true,
  
  // Non-aktifkan image optimization (Cloudflare Pages tidak mendukung)
  images: {
    unoptimized: true,
  },
  
  // Environment variables untuk production
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
