import { NextRequest, NextResponse } from 'next/server';

// WAJIB ADA: Mengatur rute untuk berjalan di Cloudflare Edge Runtime
export const runtime = 'edge';

// Headers CORS untuk memungkinkan komunikasi dari frontend
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Ganti dengan domain frontend Anda jika perlu
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Interface untuk mendapatkan akses ke D1 binding
interface Env {
    DB: D1Database;
}

/**
 * Fungsi untuk menangani Pre-flight Request (OPTIONS)
 */
export function OPTIONS() {
    return new NextResponse(null, { 
        status: 204, 
        headers: corsHeaders 
    });
}

/**
 * Fungsi utilitas untuk memvalidasi format link konten
 */
function validateContentLink(link: string): boolean {
    try {
        const url = new URL(link.trim().toLowerCase());
        
        // Memeriksa protokol dan hostname dasar
        if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.hostname.length < 3) {
            return false;
        }

        return true; 
    } catch (error) {
        return false;
    }
}

/**
 * Handler GET: Mengambil daftar konten
 */
export async function GET(request: NextRequest, { env }: { env: Env }) {
    try {
        const db = env.DB;

        // Menggunakan Kueri D1 untuk mengambil konten dan data pengguna
        const contents = await db.prepare(`
            SELECT 
                c.link, 
                c.walletAddress, 
                c.createdAt, 
                u.name AS userName 
            FROM contents c
            JOIN users u ON c.userId = u.id
            ORDER BY c.createdAt DESC
        `).all();

        return NextResponse.json(contents.results, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching contents:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch contents', detail: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * Handler POST: Membuat konten baru
 */
export async function POST(request: NextRequest, { env }: { env: Env }) {
    try {
        const db = env.DB;
        const body = await request.json();
        const { link, walletAddress } = body; // Pastikan menggunakan body yang sudah di-parse

        if (!link || !walletAddress) {
            return NextResponse.json(
                { error: 'Link and wallet address are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Validasi Link
        if (!validateContentLink(link)) {
            return NextResponse.json(
                { error: 'Failed To Submit (Invalid Content Link Format)' },
                { status: 400, headers: corsHeaders }
            );
        }
        
        const normalizedLink = link.trim().toLowerCase();
        const normalizedWalletAddress = walletAddress.trim();
        
        // 2. Cek duplikat link
        const existingContent = await db.prepare(`
            SELECT id FROM contents WHERE link = ?
        `).bind(normalizedLink).first();

        if (existingContent) {
            return NextResponse.json(
                { error: 'Failed To Submit (Content Link Already Exists)' },
                { status: 409, headers: corsHeaders }
            );
        }

        // 3. Cari atau buat pengguna (Perbaikan utama di sini untuk keandalan D1)
        let user = await db.prepare(`
            SELECT id FROM users WHERE walletAddress = ?
        `).bind(normalizedWalletAddress).first<{ id: number }>();

        let userId: number;
        
        if (!user) {
            // 3a. Buat pengguna baru
            const insertResult = await db.prepare(`
                INSERT INTO users (walletAddress, createdAt) VALUES (?, datetime('now')) 
            `).bind(normalizedWalletAddress).run();
            
            if (!insertResult.success) {
                console.error("Failed to insert new user:", insertResult.error);
                return NextResponse.json(
                    { error: 'Failed To Submit (DB Error: Cannot create user)', detail: insertResult.error },
                    { status: 500, headers: corsHeaders }
                );
            }
            
            // 3b. Ambil ID yang baru dibuat (Metode yang paling andal di D1)
            const lastIdResult = await db.prepare(`SELECT last_insert_rowid() as id`).first<{ id: number }>();
            
            if (lastIdResult && lastIdResult.id) {
                userId = lastIdResult.id;
            } else {
                console.error("Failed to retrieve last_insert_rowid after user creation.");
                return NextResponse.json(
                    { error: 'Failed To Submit (Internal DB Error: Cannot get user ID)' },
                    { status: 500, headers: corsHeaders }
                );
            }
        } else {
            userId = user.id;
        }

        // 4. Buat konten (menggunakan D1)
        const contentResult = await db.prepare(`
            INSERT INTO contents (link, userId, walletAddress, createdAt) 
            VALUES (?, ?, ?, datetime('now'))
        `).bind(normalizedLink, userId, normalizedWalletAddress).run();

        if (!contentResult.success) {
            // Jika INSERT konten gagal (misalnya karena skema tabel)
            console.error("Failed to insert new content:", contentResult.error);
            return NextResponse.json(
                { error: 'Failed To Submit (DB Error: Cannot create content)', detail: contentResult.error },
                { status: 500, headers: corsHeaders }
            );
        }

        // 5. Sukses
        return NextResponse.json(
            { message: "Content created successfully" }, 
            { status: 201, headers: corsHeaders }
        );

    } catch (error) {
        // PENTING: Log error detail ke Cloudflare Logs
        console.error('Error creating content (DETAIL):', error.message); 
        
        // Error 500 generik untuk kasus lain (misalnya masalah koneksi JSON/DB yang tidak tertangkap)
        return NextResponse.json(
            { error: 'Failed to create content', detail: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
