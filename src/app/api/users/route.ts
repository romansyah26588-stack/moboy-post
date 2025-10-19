import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        contents: {
          select: {
            viewCount: true,
          }
        },
        earnings: {
          select: {
            amount: true,
          }
        }
      },
      orderBy: {
        totalEarnings: 'desc'
      }
    });

    const leaderboard = users.map(user => ({
      id: user.id,
      walletAddress: user.walletAddress,
      name: user.name,
      totalEarnings: user.totalEarnings,
      contentCount: user.contents.length,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, name } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const user = await db.user.upsert({
      where: { walletAddress },
      update: { name },
      create: {
        walletAddress,
        name,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}