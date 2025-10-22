// src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';

// WAJIB ADA: Mengatur rute untuk berjalan di Cloudflare Edge Runtime
export const runtime = 'edge';

// Interface untuk mendapatkan akses ke D1 binding
interface Env {
    DB: D1Database;
}

// Headers CORS - Tambahkan GET dan POST
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ----------------------------------------------------------------------
// --- [ HANDLER OPTIONS: Pre-flight CORS ] ---
export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
    });
}
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// --- [ HANDLER GET: Mengambil Daftar Pengguna ] ---
// FUNGSI INI MEMPERBAIKI ERROR 405
export async function GET(request: NextRequest, context: { env: Env }) { 
    try {
        const db = context.env.DB; 
        
        // Log untuk debug di Cloudflare Pages Logs jika masih 500
        console.log('Attempting GET query on User table...');

        // Ambil data User.
        const { results } = await db.prepare("SELECT id, walletAddress, name, totalEarnings, createdAt FROM User").all();

        return NextResponse.json(
            { success: true, users: results || [] },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        // Logging error yang rinci untuk membantu mengatasi Error 500
        console.error('D1 GET User Query FAILED:', error.stack || error.message);
        return NextResponse.json(
            { error: 'Failed to fetch users', detail: error.message || 'Unknown D1 GET Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// --- [ HANDLER POST: Membuat/Memperbarui Pengguna (UPSERT) ] ---
// Kueri ini telah dimodifikasi untuk logging yang lebih baik.
export async function POST(request: NextRequest, context: { env: Env }) {
    try {
        const db = context.env.DB; 
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

        // Log untuk debug
        console.log(`Attempting UPSERT for wallet: ${trimmedWallet}`);

        // Logika UPSERT
        const result = await db.prepare(`
            INSERT INTO User (walletAddress, name, createdAt, updatedAt)
            VALUES (?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(walletAddress) DO UPDATE SET
                name = excluded.name,
                updatedAt = datetime('now')
        `).bind(trimmedWallet, trimmedName).run();
        
        // Log untuk hasil kueri
        console.log('UPSERT result:', result);

        return NextResponse.json(
            { message: "User registered/updated successfully", walletAddress: trimmedWallet },
            { status: 201, headers: corsHeaders }
        );

    } catch (error: any) {
        // Logging error yang rinci untuk membantu mengatasi Error 500
        console.error('D1 POST User Query FAILED:', error.stack || error.message);
        return NextResponse.json(
            { error: 'Failed to register/update user', detail: error.message || 'Unknown D1 POST Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
// ----------------------------------------------------------------------
