import { Handler, HandlerEvent } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import alpha from "alphavantage";

const prisma = new PrismaClient({
  // Fallback to a dummy IP-based URL to bypass Prisma 7 constructor validation 
  // and avoid ENOTFOUND during build-time static analysis
  accelerateUrl: process.env.DATABASE_URL || "prisma+postgres://127.0.0.1/?api_key=dummy",
}).$extends(withAccelerate());

// Initialize Alpha Vantage with API key
const alphaVantage = alpha({ key: process.env.ALPHA_VANTAGE_API_KEY || '' });

// Define the stock data type
type StockQuote = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];
const MAX_RETRIES = 3;
const DELAY_BETWEEN_REQUESTS = 15000; // 15 seconds between requests (Alpha Vantage free tier: 5 calls/min)

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch current quote from Alpha Vantage
async function fetchQuote(symbol: string, retries = 0): Promise<StockQuote> {
  try {
    const data = await alphaVantage.data.quote(symbol);

    // Alpha Vantage returns data in "Global Quote" format
    const quote = data['Global Quote'];

    if (!quote || !quote['05. price']) {
      throw new Error(`No quote data returned for ${symbol}`);
    }

    return {
      open: parseFloat(quote['02. open'] || '0'),
      high: parseFloat(quote['03. high'] || '0'),
      low: parseFloat(quote['04. low'] || '0'),
      close: parseFloat(quote['05. price'] || '0'),
      volume: parseInt(quote['06. volume'] || '0', 10),
    };
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retry ${retries + 1} for ${symbol} after error:`, error);
      await sleep(DELAY_BETWEEN_REQUESTS * (retries + 1));
      return fetchQuote(symbol, retries + 1);
    }
    throw error;
  }
}

// Fetch historical data from Alpha Vantage for backfill
async function fetchHistoricalData(symbol: string): Promise<any[]> {
  try {
    const data = await alphaVantage.data.daily(symbol, 'compact'); // 'compact' returns last 100 data points

    const timeSeries = data['Time Series (Daily)'];

    if (!timeSeries) {
      console.log(`No historical data returned for ${symbol}`);
      return [];
    }

    // Convert to array format
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date: new Date(date),
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'], 10),
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
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

    // Fetch historical data from Alpha Vantage
    const historicalData = await fetchHistoricalData(symbol);

    if (historicalData.length === 0) {
      console.log(`No backfill data available for ${symbol}`);
      return 0;
    }

    // Filter to only dates after our last record
    const newData = historicalData.filter(item => item.date > lastDate);

    if (newData.length === 0) {
      console.log(`No new data to backfill for ${symbol}`);
      return 0;
    }

    const dbResult = await prisma.stockData.createMany({
      data: newData.map((quote) => ({
        symbol: symbol,
        date: quote.date,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
        adjClose: quote.close, // Alpha Vantage compact doesn't include adjusted close
        timestamp: quote.date,
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
  console.log(`Using Alpha Vantage API`);

  try {
    // Step 1: Check for and backfill any missing historical data
    console.log('\n=== Checking for missing data to backfill ===');
    for (const symbol of SYMBOLS) {
      await backfillMissingData(symbol);
      await sleep(DELAY_BETWEEN_REQUESTS); // Wait between symbols to avoid rate limiting
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
        const quote = await fetchQuote(symbol);

        if (!quote.open || !quote.high || !quote.low || !quote.close) {
          throw new Error(`Missing required data for ${symbol}`);
        }

        // Create the stock data object matching our schema
        await prisma.stockData.create({
          data: {
            symbol,
            date: today,
            timestamp: today,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            volume: quote.volume,
            adjClose: quote.close
          }
        });

        console.log(`Successfully saved data for ${symbol}: $${quote.close.toFixed(2)}`);
        await sleep(DELAY_BETWEEN_REQUESTS);
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
      body: JSON.stringify({ message: 'Stock data fetched and saved successfully using Alpha Vantage' }),
    };
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch and save stock data' }),
    };
  }
};
