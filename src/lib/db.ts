// src/lib/db.ts (Dibuat agar dapat menerima D1 binding secara eksplisit)

import { PrismaClient } from '@prisma/client/edge';
import { PrismaD1 } from '@prisma/adapter-d1';

// Catatan: Interface ini mungkin perlu Anda definisikan di tempat lain (misalnya types/bindings.ts)
// D1Database adalah tipe global di Cloudflare Worker.
interface Env {
    // Ganti 'DB' jika nama binding Anda berbeda di wrangler.toml
    DB: D1Database;
}

// Global cache for PrismaClient (optional, but good practice)
let cachedPrisma: PrismaClient;

export function getPrismaClient(env: Env) {
    if (cachedPrisma) {
        return cachedPrisma;
    }

    // Menggunakan D1 adapter secara eksplisit
    const adapter = new PrismaD1(env.DB);
    
    // Inisialisasi Prisma Client dengan adapter
    const prisma = new PrismaClient({
        adapter,
        log: ['query'],
    });

    // Cache the client for subsequent calls
    cachedPrisma = prisma;
    
    return prisma;
}

// Catatan: Karena ini fungsi, Anda harus mengimpor dan memanggilnya di setiap API route.
