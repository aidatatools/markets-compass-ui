import { Handler, HandlerEvent } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

// Suppress the deprecation warning for util._extend
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' &&
      warning.message.includes('util._extend')) {
    return;
  }
  console.warn(warning);
});

import yahooFinance from "yahoo-finance2";

// Suppress yahoo-finance2 deprecation notices
yahooFinance.suppressNotices(['ripHistorical']);

const prisma = new PrismaClient();

// Define the stock data type
type StockQuote = {
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPrice: number;
  regularMarketVolume: number;
};

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];
const MAX_RETRIES = 3;
const DELAY_BETWEEN_REQUESTS = 3000; // 3 seconds between requests (increased for rate limiting)
const DELAY_BETWEEN_SYMBOLS = 5000; // 5 seconds between symbols

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(symbol: string, retries = 0): Promise<StockQuote> {
  try {
    const quoteResponse = await yahooFinance.quote(symbol);

    // Create a properly typed object from the response
    const quote: StockQuote = {
      regularMarketOpen: Number(quoteResponse.regularMarketOpen || 0),
      regularMarketDayHigh: Number(quoteResponse.regularMarketDayHigh || 0),
      regularMarketDayLow: Number(quoteResponse.regularMarketDayLow || 0),
      regularMarketPrice: Number(quoteResponse.regularMarketPrice || 0),
      regularMarketVolume: Number(quoteResponse.regularMarketVolume || 0)
    };

    return quote;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retry ${retries + 1} for ${symbol} after error:`, error);
      await sleep(DELAY_BETWEEN_REQUESTS * (retries + 1));
      return fetchWithRetry(symbol, retries + 1);
    }
    throw error;
  }
}

// Backfill missing historical data for a symbol
async function backfillMissingData(symbol: string): Promise<number> {
  try {
    // Find the latest date we have for this symbol
    const latestRecord = await prisma.stockData.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' },
    });

    if (!latestRecord) {
      console.log(`No existing data for ${symbol}, skipping backfill`);
      return 0;
    }

    const lastDate = new Date(latestRecord.date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // If we're missing more than 1 day, try to backfill
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      console.log(`${symbol} data is current (last: ${lastDate.toISOString().split('T')[0]})`);
      return 0;
    }

    console.log(`${symbol} is missing ${daysDiff} days, attempting backfill...`);

    // Fetch historical data from Yahoo Finance using chart() API
    const startDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000); // Day after last record

    const result = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: today,
      interval: '1d',
    });

    const quotes = result.quotes;

    if (!quotes || quotes.length === 0) {
      console.log(`No backfill data available for ${symbol}`);
      return 0;
    }

    const dbResult = await prisma.stockData.createMany({
      data: quotes
        .filter((quote: any) => quote.close !== null)
        .map((quote: any) => ({
          symbol: symbol,
          date: new Date(quote.date),
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: Math.round(quote.volume || 0),
          adjClose: quote.adjclose || quote.close,
          timestamp: new Date(quote.date),
        })),
      skipDuplicates: true,
    });

    console.log(`Backfilled ${dbResult.count} records for ${symbol}`);
    return dbResult.count;
  } catch (error) {
    console.error(`Backfill error for ${symbol}:`, error);
    return 0;
  }
}

async function fetchAndSaveStockData() {
  console.log(`Starting stock data fetch at ${new Date().toISOString()}`);

  try {
    // Step 1: Check for and backfill any missing historical data
    console.log('\n=== Checking for missing data to backfill ===');
    for (const symbol of SYMBOLS) {
      await backfillMissingData(symbol);
      await sleep(DELAY_BETWEEN_SYMBOLS); // Wait between symbols to avoid rate limiting
    }

    // Step 2: Fetch today's data
    console.log('\n=== Fetching today\'s data ===');
    for (const symbol of SYMBOLS) {
      console.log(`Fetching data for ${symbol}...`);

      // Get today's date in UTC
      const today = new Date();
      // Set time to midnight UTC
      today.setUTCHours(0, 0, 0, 0);

      // Check if we already have data for today
      const existingData = await prisma.stockData.findFirst({
        where: {
          symbol,
          timestamp: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
          }
        }
      });

      if (existingData) {
        console.log(`Data for ${symbol} on ${today.toISOString()} already exists, skipping...`);
        continue;
      }

      try {
        const quote = await fetchWithRetry(symbol);

        if (!quote.regularMarketOpen || !quote.regularMarketDayHigh ||
            !quote.regularMarketDayLow || !quote.regularMarketPrice ||
            !quote.regularMarketVolume) {
          throw new Error(`Missing required data for ${symbol}`);
        }

        // Create the stock data object matching our schema
        await prisma.stockData.create({
          data: {
            symbol,
            date: today,
            timestamp: today,
            open: Number(quote.regularMarketOpen),
            high: Number(quote.regularMarketDayHigh),
            low: Number(quote.regularMarketDayLow),
            close: Number(quote.regularMarketPrice),
            volume: Math.floor(Number(quote.regularMarketVolume)),
            adjClose: Number(quote.regularMarketPrice)
          }
        });

        console.log(`Successfully saved data for ${symbol} with date ${today.toISOString()}`);
        await sleep(DELAY_BETWEEN_SYMBOLS);
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
      }
    }

    console.log('\nAll stock data fetched and saved successfully');
  } catch (error) {
    console.error('Error in fetchAndSaveStockData:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export const handler: Handler = async (_event: HandlerEvent) => {
  try {
    await fetchAndSaveStockData();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Stock data fetched and saved successfully' }),
    };
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch and save stock data' }),
    };
  }
}; 