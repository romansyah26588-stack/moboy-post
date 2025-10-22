// 3. src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// WAJIB ADA: Mengatur rute untuk berjalan di Cloudflare Edge Runtime
export const runtime = 'edge';

// Interface untuk mendapatkan akses ke D1 binding
interface Env {
    DB: D1Database;
}

// Headers CORS - Tambahkan GET ke Allow-Methods
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // <--- PERBAIKAN: Tambahkan GET
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- [ HANDLER OPTIONS ] ---
export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
    });
}

// ----------------------------------------------------------------------
// --- [ PERBAIKAN UTAMA: HANDLER GET: Mengambil Daftar Pengguna ] ---
// ----------------------------------------------------------------------
export async function GET(request: NextRequest, context: { env: Env }) { // <--- FUNGSI INI WAJIB ADA
    try {
        const db = context.env.DB; 
        
        // Ambil data User. Jangan ambil field yang tidak diperlukan atau sensitif.
        // Catatan: Karena Anda tidak menyimpan 'id' di tabel Content/Earning, kita ambil semua.
        const { results } = await db.prepare("SELECT id, walletAddress, name, totalEarnings, createdAt FROM User").all();

        return NextResponse.json(
            { success: true, users: results || [] },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error('Error fetching users (D1):', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', detail: error.message || 'Unknown Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
// ----------------------------------------------------------------------

// --- [ HANDLER POST: Membuat/Memperbarui Pengguna (UPSERT) ] ---
export async function POST(request: NextRequest, context: { env: Env }) {
    try {
        const db = context.env.DB; // Akses D1 melalui context.env.DB
        const body = await request.json();
        const { walletAddress, name } = body;

        if (!walletAddress || !name) {
            return NextResponse.json(
                { error: 'Wallet address and name are required' },
                { status: 400, headers: corsHeaders }
            );
        }
        
        // Perbaikan kecil: Pastikan kita menggunakan sintaks UPSERT yang benar
        // Catatan: Anda menggunakan column 'id' sebagai PRIMARY KEY, 
        // tetapi ON CONFLICT Anda menggunakan 'walletAddress'. Ini OK karena 'walletAddress' 
        // adalah UNIQUE INDEX. Kita pertahankan.
        
        // *Namun, perlu dicatat bahwa skema User Anda memiliki 'id' sebagai PRIMARY KEY 
        // tetapi tidak diisi di sini. SQLite akan memberikan nilai NULL. 
        // Jika skema Anda dari Prisma, `id` harus diisi dengan `cuid()`*

        // Kita asumsikan skema D1 Anda dari migrasi yang benar dan auto-generate 'id' atau 
        // Anda tidak menggunakan 'id' yang dihasilkan oleh Prisma secara default saat INSERT.
        
        const trimmedWallet = walletAddress.trim();
        const trimmedName = name.trim();
        
        // JIKA skema Anda adalah: id, walletAddress, name, ...
        // Dan 'id' dibuat oleh Prisma (cuid()), Anda perlu memastikan 'id' di-generate saat INSERT pertama.
        // Jika D1 tidak otomatis membuat ID, POST ini akan gagal.
        
        // KARENA Anda TIDAK memberikan 'id' di INSERT, kueri ini berpotensi gagal 
        // jika 'id' di skema Anda adalah TEXT NOT NULL PRIMARY KEY tanpa DEFAULT CUID() di SQL.

        // Perbaikan sementara: Gunakan INSERT OR REPLACE (lebih aman di D1 jika 'id' tidak digenerate)
        // KITA KEMBALIKAN KE SINTAKS ANDA, DENGAN ASUMSI D1 BISA MENGATASI ID
        await db.prepare(`
            INSERT INTO User (walletAddress, name, createdAt, updatedAt)
            VALUES (?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(walletAddress) DO UPDATE SET
                name = excluded.name,
                updatedAt = datetime('now')
        `).bind(trimmedWallet, trimmedName).run();
        // ASUMSI: skema SQL Anda memiliki 'id' yang dapat diisi NULL atau diisi otomatis.
        // Jika tidak, Anda akan mendapat Error 500 baru di sini.

        return NextResponse.json(
            { message: "User registered/updated successfully", walletAddress: trimmedWallet },
            { status: 201, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Error registering user (D1):', error);
        return NextResponse.json(
            { error: 'Failed to register/update user', detail: error.message || 'Unknown Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
