import { NextResponse } from 'next/server';
import { fetchAndStoreHistoricalData } from '@/services/stockService';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

export async function GET() {
  try {
    const startDate = new Date('2020-01-01');
    const endDate = new Date();
    
    const data = await fetchAndStoreHistoricalData(SYMBOLS, startDate, endDate);
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Historical data fetched and stored successfully'
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical stock data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols = body.symbols || SYMBOLS;
    const startDate = new Date(body.startDate || '2020-01-01');
    const endDate = new Date(body.endDate || new Date());
    
    const data = await fetchAndStoreHistoricalData(symbols, startDate, endDate);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical stock data' },
      { status: 500 }
    );
  }
} 