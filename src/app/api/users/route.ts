// File: src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';

// WAJIB ADA: Mengatur rute untuk berjalan di Cloudflare Edge Runtime
export const runtime = 'edge';

// Interface untuk mendapatkan akses ke D1 binding
interface Env {
    DB: D1Database;
}

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
// --- [ HANDLER GET: Uji Koneksi dan Kueri Dasar User ] ---
export async function GET(
    request: NextRequest,
    { env }: { env: Env } // <--- ROUTE STATIS: env ada di argumen kedua
) {
    // 1. Pengecekan Binding D1
    if (!env || !env.DB) {
        return NextResponse.json(
            { error: 'FATAL_BINDING_ERROR_USER', detail: 'D1 binding (DB) is missing. Check Cloudflare Pages settings.' },
            { status: 500, headers: corsHeaders }
        );
    }

    const db = env.DB;
    
    try {
        // 2. Kueri Paling Dasar: Menguji keberadaan tabel User
        const { results } = await db.prepare("SELECT id, walletAddress, name FROM User LIMIT 1").all();
        
        // JIKA BERHASIL, kembalikan 200 dengan status sukses
        return NextResponse.json(
            { success: true, test: 'QUERY_SUCCESS_TEST', users: results || [] },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        // 3. Tangani SQL Error (jika kueri dasar gagal)
        return NextResponse.json(
            { 
                error: 'SQL_EXECUTION_FAILED_USER', 
                sql_detail: error.message || 'Unknown D1 GET Error',
                tip: 'Tabel User mungkin salah nama atau belum dimigrasi dengan benar.'
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
// ----------------------------------------------------------------------
