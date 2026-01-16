import { Handler, HandlerEvent } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import alpha from "alphavantage";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL || "prisma+postgres://127.0.0.1/?api_key=dummy",
}).$extends(withAccelerate());

const alphaVantage = alpha({ key: process.env.ALPHA_VANTAGE_API_KEY || '' });

type StockQuote = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];
const DELAY_BETWEEN_REQUESTS = 6000; // 6 seconds between requests to fit within 30s timeout

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchQuote(symbol: string): Promise<StockQuote> {
  const data = await alphaVantage.data.quote(symbol);
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
}

async function fetchAndSaveStockData() {
  console.log(`Starting stock data fetch at ${new Date().toISOString()}`);

  try {
    for (const symbol of SYMBOLS) {
      console.log(`Fetching ${symbol}...`);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Check if we already have data for today
      const existingData = await prisma.stockData.findFirst({
        where: {
          symbol,
          timestamp: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingData) {
        console.log(`${symbol} already exists for today, skipping`);
        continue;
      }

      const quote = await fetchQuote(symbol);

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

      console.log(`Saved ${symbol}: $${quote.close.toFixed(2)}`);

      // Wait before next request (except for last symbol)
      if (symbol !== SYMBOLS[SYMBOLS.length - 1]) {
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
    }

    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
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
