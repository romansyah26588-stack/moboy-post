import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function validateContentLink(link: string): boolean {
  try {
    const url = new URL(link.trim().toLowerCase());
    
    // Check if the protocol is http or https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    
    // Check if it has a valid domain
    if (!url.hostname || url.hostname.length < 3) {
      return false;
    }
    
    // Allow any valid TLD
    const validTLDs = [
      'com', 'org', 'net', 'io', 'co', 'app', 'dev', 'tech', 'ai',
      'xyz', 'me', 'site', 'online', 'store', 'shop', 'blog', 'news',
      'info', 'biz', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'kr',
      'cn', 'in', 'br', 'mx', 'es', 'it', 'nl', 'se', 'no', 'fi',
      'ru', 'tr', 'sa', 'ae', 'eg', 'za', 'ng', 'ke', 'gh', 'ph',
      'th', 'vn', 'my', 'sg', 'id', 'pk', 'bd', 'lk', 'np', 'mm'
    ];
    
    const domainParts = url.hostname.split('.');
    const tld = domainParts[domainParts.length - 1];
    
    return validTLDs.includes(tld);
    
  } catch (error) {
    return false;
  }
}
export const runtime = 'edge';
export async function GET() {
  try {
    const contents = await db.content.findMany({
      include: {
        user: {
          select: {
            walletAddress: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error fetching contents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { link, walletAddress } = await request.json();

    if (!link || !walletAddress) {
      return NextResponse.json(
        { error: 'Link and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate the link
    if (!validateContentLink(link)) {
      return NextResponse.json(
        { error: 'Failed To Submit (Not Content Link)' },
        { status: 400 }
      );
    }

    // Check for duplicate link
    const existingContent = await db.content.findFirst({
      where: {
        link: link.trim().toLowerCase()
      }
    });

    if (existingContent) {
      return NextResponse.json(
        { error: 'Failed To Submit (Content Link Already Exists)' },
        { status: 409 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          walletAddress,
        }
      });
    }

    // Create content
    const content = await db.content.create({
      data: {
        link: link.trim(),
        userId: user.id,
        walletAddress,
      },
      include: {
        user: {
          select: {
            walletAddress: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
