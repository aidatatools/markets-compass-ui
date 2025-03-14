import { NextResponse } from 'next/server';
import { getCandlestickData } from '@/services/stockService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const useAdjusted = searchParams.get('adjusted') === 'true';

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Default to 1 year ago
    const end = endDate ? new Date(endDate) : new Date();

    const data = await getCandlestickData(symbol, start, end, useAdjusted);
    
    return NextResponse.json({
      success: true,
      data: {
        symbol,
        candlesticks: data
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candlestick data' },
      { status: 500 }
    );
  }
} 