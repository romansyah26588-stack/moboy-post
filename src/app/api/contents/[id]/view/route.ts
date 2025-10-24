// File: src/app/api/contents/route.ts

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

// --- [ HANDLER POST: Membuat Content Baru ] ---
export async function POST(
    request: NextRequest,
    { env }: { env: Env } // <--- ARGUMEN KEDUA LANGSUNG UNTUK ENV (ROUTE STATIS)
) {
    try {
        const db = env.DB;

        // 1. Ambil data dari body request
        const body = await request.json();
        const { title, description, walletAddress } = body;

        // Validasi input sederhana
        if (!title || !walletAddress) {
            return NextResponse.json(
                { error: 'Title and walletAddress are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 2. Buat ID unik (misalnya menggunakan timestamp dan random string)
        const contentId = `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const now = new Date().toISOString();

        // 3. Lakukan INSERT ke tabel Content
        const result = await db.prepare(`
            INSERT INTO Content (id, title, description, walletAddress, createdAt, updatedAt, viewCount)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `).bind(
            contentId,
            title,
            description || null, // Gunakan null jika description tidak ada
            walletAddress,
            now,
            now
        ).run();

        // 4. Cek apakah insert berhasil
        if (result.success) {
            return NextResponse.json(
                { message: 'Content created successfully', contentId: contentId },
                { status: 201, headers: corsHeaders } // 201 Created
            );
        } else {
            throw new Error('Failed to insert content into database');
        }

    } catch (error: any) {
        console.error('Error creating content (D1):', error);
        return NextResponse.json(
            { error: 'Failed to create content', detail: error.message || 'Unknown Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// --- [ HANDLER GET: Mengambil Daftar Content ] ---
export async function GET(
    request: NextRequest,
    { env }: { env: Env } // <--- ARGUMEN KEDUA LANGSUNG UNTUK ENV (ROUTE STATIS)
) {
    try {
        const db = env.DB;

        // 1. Ambil semua content dari tabel
        const { results } = await db.prepare(`
            SELECT id, title, description, walletAddress, createdAt, viewCount
            FROM Content
            ORDER BY createdAt DESC
        `).all();

        return NextResponse.json(
            { contents: results || [] },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Error fetching contents (D1):', error);
        return NextResponse.json(
            { error: 'Failed to fetch contents', detail: error.message || 'Unknown Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
