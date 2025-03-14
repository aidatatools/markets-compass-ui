import { NextResponse } from 'next/server';
import { fetchAndStoreStockData } from '@/services/stockService';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

export async function GET() {
  try {
    const data = await fetchAndStoreStockData(SYMBOLS);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// Optional: Add a POST endpoint to fetch data for custom symbols
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols = body.symbols || SYMBOLS;
    const data = await fetchAndStoreStockData(symbols);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 