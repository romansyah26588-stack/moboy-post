// File: src/app/api/contents/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface Env {
    DB: D1Database;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function POST(
    request: NextRequest,
    { env }: { env: Env }
) {
    try {
        const db = env.DB;
        const body = await request.json();
        const { title, description, walletAddress } = body;

        if (!title || !walletAddress) {
            return NextResponse.json(
                { error: 'Title and walletAddress are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const contentId = `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const now = new Date().toISOString();

        const result = await db.prepare(`
            INSERT INTO Content (id, title, description, walletAddress, createdAt, updatedAt, viewCount)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `).bind(
            contentId,
            title,
            description || null,
            walletAddress,
            now,
            now
        ).run();

        if (result.success) {
            return NextResponse.json(
                { message: 'Content created successfully', contentId: contentId },
                { status: 201, headers: corsHeaders }
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

export async function GET(
    request: NextRequest,
    { env }: { env: Env }
) {
    try {
        const db = env.DB;
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
