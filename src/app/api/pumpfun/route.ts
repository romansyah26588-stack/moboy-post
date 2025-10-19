// /src/app/api/pumpfun/route.ts

// Pastikan baris ini ADA. Ini yang mengarahkan rute ke Edge Runtime Cloudflare.
export const runtime = 'edge'; 

import { NextResponse } from 'next/server';

// Ganti logika yang bermasalah dengan implementasi Edge-compatible (misalnya, fetch)
async function fetchPumpFunDataFromExternalApi() {
  // Contoh: ganti panggilan ke z-ai-web-dev-sdk dengan fetch biasa
  const response = await fetch('https://api-eksternal-pumpfun.com/data', {
    // Pastikan semua opsi kompatibel dengan Edge Runtime
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data dari API eksternal');
  }

  return response.json();
}

export async function GET(request: Request) {
  try {
    const data = await fetchPumpFunDataFromExternalApi();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Kesalahan API Pumpfun:", error);
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

