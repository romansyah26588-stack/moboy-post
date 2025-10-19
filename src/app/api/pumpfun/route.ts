import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'edge';
const PUMP_FUN_CONTRACT = '6aUG5S4YCyy4MWH6rtkDuF8fmYwwwPyKq4MypCCQpump';

export async function GET() {
  try {
    const zai = await ZAI.create();

    // Search for information about the meme coin
    const searchResult = await zai.functions.invoke("web_search", {
      query: `pump.fun meme coin contract ${PUMP_FUN_CONTRACT}`,
      num: 5
    });

    return NextResponse.json({
      contractAddress: PUMP_FUN_CONTRACT,
      searchResults: searchResult,
      platform: 'pump.fun',
      type: 'meme_coin'
    });

  } catch (error) {
    console.error('Error fetching pump.fun data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pump.fun data',
        contractAddress: PUMP_FUN_CONTRACT,
        platform: 'pump.fun',
        type: 'meme_coin'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    let response;

    switch (action) {
      case 'check_balance':
        // Simulate checking balance for the meme coin
        response = {
          walletAddress,
          contractAddress: PUMP_FUN_CONTRACT,
          balance: (Math.random() * 1000).toFixed(2),
          symbol: 'MOBOY',
          action: 'balance_check'
        };
        break;

      case 'get_token_info':
        // Get token information
        response = {
          contractAddress: PUMP_FUN_CONTRACT,
          name: 'MoBoy Token',
          symbol: 'MOBOY',
          decimals: 9,
          totalSupply: '1000000000',
          platform: 'pump.fun',
          action: 'token_info'
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in pump.fun API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
