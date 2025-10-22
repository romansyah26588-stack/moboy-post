// src/app/api/contents/route.ts (Di dalam export async function POST)

// ... pastikan Anda memiliki impor ini di bagian atas:
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; 
interface Env {
    DB: D1Database;
}

// --- [ HANDLER POST: Membuat Konten ] ---
export async function POST(request: NextRequest, context: { env: Env }) {
    try {
        const db = context.env.DB;
        const body = await request.json();
        const { link, walletAddress } = body;

        if (!link || !walletAddress) {
            // ... (error 400)
        }
        
        // **PERBAIKAN KRITIS UNTUK INSERT:** Hasilkan ID unik.
        const newContentId = randomUUID(); // Menggunakan randomUUID

        // Log untuk debug
        console.log(`Attempting INSERT for new content ID: ${newContentId} by wallet: ${walletAddress}`);

        // Kueri INSERT yang membutuhkan ID
        await db.prepare(`
            INSERT INTO Content (id, link, userId, viewCount, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, 0, 1, datetime('now'), datetime('now'))
        `).bind(newContentId, link.trim(), walletAddress.trim()).run();

        return NextResponse.json(
            { message: "Content created successfully", id: newContentId },
            { status: 201, headers: corsHeaders }
        );

    } catch (error: any) {
        // Logging error yang rinci untuk membantu mengatasi Error 500
        console.error('D1 POST Content Query FAILED:', error.stack || error.message);
        return NextResponse.json(
            { error: 'Failed to create content', detail: error.message || 'Unknown D1 POST Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
