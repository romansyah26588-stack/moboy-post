// 3. src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// WAJIB ADA: Mengatur rute untuk berjalan di Cloudflare Edge Runtime
export const runtime = 'edge';

// Interface untuk mendapatkan akses ke D1 binding
// PERBAIKAN: Ganti 'db_moboy' dengan tipe data global Cloudflare D1Database
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

        const trimmedWallet = walletAddress.trim();
        const trimmedName = name.trim();

        // Logika UPSERT (INSERT OR REPLACE INTO)
        // Perintah ON CONFLICT DO UPDATE ini adalah sintaks SQLite (D1) yang tepat.
        await db.prepare(`
            INSERT INTO User (walletAddress, name, createdAt, updatedAt)
            VALUES (?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(walletAddress) DO UPDATE SET
                name = excluded.name,
                updatedAt = datetime('now')
        `).bind(trimmedWallet, trimmedName).run();

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
