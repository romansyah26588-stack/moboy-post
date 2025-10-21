import { NextRequest, NextResponse } from 'next/server';

// WAJIB ADA: Mengatur rute untuk berjalan di Cloudflare Edge Runtime
export const runtime = 'edge';

// Interface untuk mendapatkan akses ke D1 binding
// Pastikan nama binding D1 di Cloudflare Pages Anda adalah 'DB'
interface Env {
    DB: D1Database;
}

// Headers CORS untuk memungkinkan komunikasi dari frontend
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- [ UTILITY FUNCTIONS ] ---

function validateContentLink(link: string): boolean {
    try {
        const url = new URL(link.trim().toLowerCase());
        if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.hostname.length < 3) {
            return false;
        }
        return true; 
    } catch (error) {
        return false;
    }
}

export function OPTIONS() {
    return new NextResponse(null, { 
        status: 204, 
        headers: corsHeaders 
    });
}

// --- [ HANDLER GET: Mengambil daftar konten ] ---

export async function GET(request: NextRequest, { env }: { env: Env }) {
    try {
        const db = env.DB;

        // Kueri D1 untuk mengambil konten dan data pengguna
        const contents = await db.prepare(`
            SELECT 
                c.link, 
                u.walletAddress, -- Mengambil walletAddress dari tabel users
                c.createdAt, 
                u.name AS userName 
            FROM Content c
            JOIN User u ON c.userId = u.walletAddress -- RELASI DENGAN WALLETADDRESS DI SINI
            ORDER BY c.createdAt DESC
        `).all();

        return NextResponse.json(contents.results, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching contents (D1):', error); 
        return NextResponse.json(
            { error: 'Failed to fetch contents', detail: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

// --- [ HANDLER POST: Membuat konten baru ] ---

export async function POST(request: NextRequest, { env }: { env: Env }) {
    try {
        const db = env.DB;
        const body = await request.json();
        const { link, walletAddress } = body; 

        if (!link || !walletAddress) {
            return NextResponse.json(
                { error: 'Link and wallet address are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!validateContentLink(link)) {
            return NextResponse.json(
                { error: 'Failed To Submit (Invalid Content Link Format)' },
                { status: 400, headers: corsHeaders }
            );
        }
        
        const normalizedLink = link.trim().toLowerCase();
        const normalizedWalletAddress = walletAddress.trim();
        
        // Cek duplikat link
        const existingContent = await db.prepare(`
            SELECT id FROM Content WHERE link = ?
        `).bind(normalizedLink).first();

        if (existingContent) {
            return NextResponse.json(
                { error: 'Failed To Submit (Content Link Already Exists)' },
                { status: 409, headers: corsHeaders }
            );
        }

        // Cek pengguna (Asumsi: Pengguna sudah dibuat/di-upsert melalui rute /api/users)
        let user = await db.prepare(`
            SELECT walletAddress FROM User WHERE walletAddress = ?
        `).bind(normalizedWalletAddress).first<{ walletAddress: string }>();
        
        if (!user) {
            // Jika user belum ada, dianggap gagal. Rute ini TIDAK membuat user.
            return NextResponse.json(
                { error: 'Failed To Submit: User wallet not found. Please register first.' },
                { status: 403, headers: corsHeaders }
            );
        }

        // Buat konten (menggunakan walletAddress sebagai FK karena schema Prisma Anda)
        await db.prepare(`
            INSERT INTO Content (link, userId, createdAt) 
            VALUES (?, ?, datetime('now'))
        `).bind(normalizedLink, normalizedWalletAddress).run(); 
        // Catatan: Di sini userId = walletAddress, sesuai dengan relasi di schema Anda

        return NextResponse.json(
            { message: "Content created successfully" }, 
            { status: 201, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Error creating content (DETAIL):', error); 
        
        return NextResponse.json(
            { error: 'Failed to create content', detail: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
