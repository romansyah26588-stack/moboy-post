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

        // Kriteria validasi TLD (disimpan untuk referensi, tapi validasi URL standar lebih disarankan)
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

        // ⚠️ Menggunakan Kueri D1 untuk mengambil konten dan data pengguna
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
        const { link, walletAddress } = await request.json();

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

        // 3. Cari atau buat pengguna (menggunakan D1)
        let user = await db.prepare(`
            SELECT id FROM users WHERE walletAddress = ?
        `).bind(walletAddress).first();

        let userId: number;
        
        if (!user) {
            // Buat pengguna baru (mengasumsikan tabel users memiliki kolom id, walletAddress, dan name opsional)
            const result = await db.prepare(`
                INSERT INTO users (walletAddress, createdAt) VALUES (?, datetime('now')) 
                RETURNING id 
            `).bind(walletAddress).run(); 
            
            // D1 biasanya tidak langsung mengembalikan ID. Ini adalah workaround yang disederhanakan.
            // Metode yang lebih andal adalah menjalankan SELECT last_insert_rowid()
            const lastId = await db.prepare(`SELECT last_insert_rowid()`).first('last_insert_rowid');
            userId = lastId as number;
        } else {
            userId = user.id as number;
        }

        // 4. Buat konten (menggunakan D1)
        const contentResult = await db.prepare(`
            INSERT INTO contents (link, userId, walletAddress, createdAt) 
            VALUES (?, ?, ?, datetime('now'))
        `).bind(link.trim(), userId, walletAddress).run();

        // 5. Sukses
        return NextResponse.json(
            { message: "Content created successfully", result: contentResult }, 
            { status: 201, headers: corsHeaders }
        );

    } catch (error) {
        // ⚠️ PENTING: Log error detail ke Cloudflare Logs
        console.error('Error creating content (DETAIL):', error.message); 
        
        return NextResponse.json(
            { error: 'Failed to create content', detail: error.message }, // Detail error membantu debugging
            { status: 500, headers: corsHeaders }
        );
    }
}
