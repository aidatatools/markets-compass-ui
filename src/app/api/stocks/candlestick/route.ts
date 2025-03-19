import { NextResponse } from 'next/server';
import { getCandlestickData } from '@/services/stockService';

export const revalidate = 60; // SWR: 60 seconds

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

    // Set end date to today at midnight UTC
    const end = endDate ? new Date(endDate) : new Date();
    end.setUTCHours(0, 0, 0, 0);

    // Set start date to exactly 12 months ago at midnight UTC
    const start = startDate ? new Date(startDate) : new Date(end);
    start.setMonth(start.getMonth() - 12);
    start.setUTCHours(0, 0, 0, 0);

    console.log('Candlestick API Request:', {
      symbol,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      useAdjusted,
      currentTime: new Date().toISOString(),
      monthsDiff: (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44) // Approximate months
    });

    const data = await getCandlestickData(symbol, start, end, useAdjusted);
    
    console.log('Candlestick API Response:', {
      symbol,
      dataPoints: data.length,
      firstDate: data[0] ? new Date(data[0].timestamp).toISOString() : null,
      lastDate: data[data.length - 1] ? new Date(data[data.length - 1].timestamp).toISOString() : null,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
    
    // Create response with cache headers
    const response = NextResponse.json({
      success: true,
      data: {
        symbol,
        candlesticks: data
      }
    });

    // Set cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
    response.headers.set('Expires', new Date(Date.now() + 3600 * 1000).toUTCString());

    return response;
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candlestick data' },
      { status: 500 }
    );
  }
} 