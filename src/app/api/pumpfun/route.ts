// /src/app/api/pumpfun/route.ts
import { NextResponse, NextRequest } from 'next/server';

// WAJIB: Mengarahkan rute ke Edge Runtime Cloudflare.
export const runtime = 'edge'; 

// Ganti logika yang bermasalah (misalnya, SDK Node.js) dengan implementasi Edge-compatible (fetch)
async function fetchPumpFunDataFromExternalApi() {
    // Ganti URL placeholder ini dengan API eksternal Pump.fun yang sebenarnya
    const PUMPFUN_API_URL = 'https://api-eksternal-pumpfun.com/data'; 
    
    // Anda bisa menambahkan logic caching di sini menggunakan Cloudflare Cache API jika diperlukan
    const response = await fetch(PUMPFUN_API_URL, {
        // Pastikan semua opsi kompatibel dengan Edge Runtime
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Tambahkan header otorisasi jika API memerlukan kunci
            // 'Authorization': `Bearer ${process.env.PUMPFUN_API_KEY}` 
        },
    });

    if (!response.ok) {
        // Ambil pesan error dari respons eksternal jika tersedia
        let errorDetail = response.statusText;
        try {
            const errorJson = await response.json();
            errorDetail = errorJson.message || errorDetail;
        } catch {}
        
        throw new Error(`Gagal mengambil data dari API eksternal: ${response.status} - ${errorDetail}`);
    }

    return response.json();
}

export async function GET(request: NextRequest) {
    try {
        const data = await fetchPumpFunDataFromExternalApi();
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        console.error("Kesalahan API Pumpfun:", error);
        return NextResponse.json(
            { success: false, message: `Internal server error: ${error.message}` },
            { status: 500 }
        );
    }
}
