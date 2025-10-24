// next.config.ts
import { setupDevPlatform } from '@opennextjs/cloudflare';

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan konfigurasi Next.js Anda yang lain di sini
  // Contoh:
  // images: {
  //   domains: ['example.com'],
  // },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
