// src/app/api/health/route.ts

import { NextResponse } from "next/server";

// Memastikan rute berjalan di Cloudflare Edge
export const runtime = 'edge';

/**
 * Handler GET untuk Health Check.
 * Berguna untuk memverifikasi bahwa Edge Function dapat merespons.
 */
export async function GET() {
    return NextResponse.json(
        { message: "Good Job!", status: "Operational" },
        { status: 200 }
    );
}
