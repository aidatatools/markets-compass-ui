import yahooFinance from 'yahoo-finance2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CandlestickData {
  timestamp: number;  // Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type StockDataSelect = {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
};

export async function getCandlestickData(
  symbol: string,
  startDate: Date,
  endDate: Date,
  useAdjusted: boolean = true
): Promise<CandlestickData[]> {
  try {
    const data = await prisma.stockData.findMany({
      where: {
        symbol,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
        open: true,
        high: true,
        low: true,
        close: true,
        adjClose: true,
        volume: true,
      },
    });

    return data.map(item => ({
      timestamp: item.timestamp.getTime(),
      open: useAdjusted ? (item.open * item.adjClose / item.close) : item.open,
      high: useAdjusted ? (item.high * item.adjClose / item.close) : item.high,
      low: useAdjusted ? (item.low * item.adjClose / item.close) : item.low,
      close: useAdjusted ? item.adjClose : item.close,
      volume: item.volume,
    }));
  } catch (error) {
    console.error('Error fetching candlestick data:', error);
    throw error;
  }
}

export async function fetchAndStoreHistoricalData(symbols: string[], startDate: Date, endDate: Date) {
  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const historical = await yahooFinance.historical(symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d'
        });

        const stockData = await prisma.stockData.createMany({
          data: historical.map(quote => ({
            symbol: symbol,
            date: quote.date,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            volume: quote.volume,
            adjClose: quote.adjClose || quote.close, // Use close price if adjClose is undefined
            timestamp: quote.date
          })),
          skipDuplicates: true
        });

        return { symbol, recordsCreated: stockData.count };
      })
    );

    return results;
  } catch (error) {
    console.error('Error fetching historical stock data:', error);
    throw error;
  }
}

export async function fetchAndStoreStockData(symbols: string[]) {
  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await yahooFinance.quote(symbol);
        const price = quote.regularMarketPrice || 0;
        const now = new Date();
        
        const stockData = await prisma.stockData.create({
          data: {
            symbol: symbol,
            date: now,
            open: quote.regularMarketOpen || price,
            high: quote.regularMarketDayHigh || price,
            low: quote.regularMarketDayLow || price,
            close: price,
            volume: quote.regularMarketVolume || 0,
            adjClose: price, // For current day, adj close is same as close
            timestamp: now
          },
        });

        return stockData;
      })
    );

    return results;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
} 