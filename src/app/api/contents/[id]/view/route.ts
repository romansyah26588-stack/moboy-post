import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';
export async function GET(request) {
  // kode API Anda
}
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;

    // Increment view count
    const content = await db.content.update({
      where: { id: contentId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ viewCount: content.viewCount });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
