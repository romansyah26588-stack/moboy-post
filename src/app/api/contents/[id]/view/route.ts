// File: src/app/api/contents/[id]/view/route.ts

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- [ HANDLER OPTIONS ] ---
export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
    });
}

// Fungsi GET tidak diimplementasikan, bisa dibiarkan kosong atau dihapus jika tidak perlu.
// export async function GET(request: NextRequest, context: { env: Env }) {
//     return NextResponse.json({ message: "Not implemented" }, { status: 200, headers: corsHeaders });
// }

// --- [ HANDLER POST: Menambah View Count ] ---
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }, // Argumen kedua UNTUK PARAMS
    context: { env: Env }                   // Argumen ketiga UNTUK ENV
) {
    try {
        const db = context.env.DB;          // Tetap sama
        const contentId = params.id;         // Mengambil ID dari params

        if (!contentId) {
             return NextResponse.json(
                { error: 'Content ID is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Lakukan INCREMENT viewCount menggunakan SQL D1
        const updateResult = await db.prepare(`
            UPDATE Content 
            SET viewCount = viewCount + 1, updatedAt = datetime('now')
            WHERE id = ?
        `).bind(contentId).run();

        // 2. Jika update gagal (ID tidak ditemukan)
        if (updateResult.changes === 0) {
            // Perlu dicek apakah ID ditemukan, jika 0 artinya tidak ada row yang terpengaruh
             // Jika ingin mendapatkan viewCount terbaru, lakukan SELECT setelah UPDATE.
             return NextResponse.json(
                { error: 'Content not found or update failed' },
                { status: 404, headers: corsHeaders }
            );
        }
        
        // 3. Ambil viewCount yang baru (perlu kueri terpisah di D1/SQLite)
        const content = await db.prepare(`
            SELECT viewCount FROM Content WHERE id = ?
        `).bind(contentId).first<{ viewCount: number }>();


        return NextResponse.json(
            { viewCount: content ? content.viewCount : null, message: "View count incremented" },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Error incrementing view count (D1):', error);
        return NextResponse.json(
            { error: 'Failed to increment view count', detail: error.message || 'Unknown Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
