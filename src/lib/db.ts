// Ganti seluruh isi file src/lib/db.ts Anda dengan kode di bawah ini:

// 1. Ganti impor dari '@prisma/client' ke '@prisma/client/edge'
import { PrismaClient } from '@prisma/client/edge';

// 2. Tambahkan impor untuk D1 Adapter
// Pastikan Anda sudah menjalankan: npm install @prisma/adapter-d1
// import { PrismaD1 } from '@prisma/adapter-d1'; 
// Catatan: Next-on-Pages sering kali bekerja lebih baik tanpa adapter eksplisit
// selama konfigurasi DATABASE_URL di bawah sudah diatur.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Konfigurasi sumber data agar Prisma mencari DATABASE_URL
    datasources: {
      db: {
        // Cloudflare Pages/Wrangler akan secara implisit
        // mengisi DATABASE_URL dari binding D1 Anda.
        url: process.env.DATABASE_URL, 
      },
    },
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Ekspor default
export default db;
