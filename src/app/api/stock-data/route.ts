import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format, subMonths } from 'date-fns';

const prisma = new PrismaClient();

interface StockData {
  id: number;
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const startDate = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
    
    const allStockData = await prisma.stockData.findMany({
      where: {
        symbol: symbol.toUpperCase()
      }
    }) as StockData[];

    // Filter and sort the data in memory
    const stockData = allStockData
      .filter(item => format(item.timestamp, 'yyyy-MM-dd') >= startDate)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return NextResponse.json({
      message: `Successfully retrieved 3 months of data for ${symbol}`,
      data: stockData
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 