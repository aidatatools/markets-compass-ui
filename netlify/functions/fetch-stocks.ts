import { Handler, HandlerEvent } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import yahooFinance from "yahoo-finance2";
import { format } from "date-fns";

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
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between requests

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

async function fetchAndSaveStockData() {
  console.log(`Starting stock data fetch at ${new Date().toISOString()}`);
  
  try {
    for (const symbol of SYMBOLS) {
      console.log(`Fetching data for ${symbol}...`);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
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
            timestamp: new Date(),
            open: Number(quote.regularMarketOpen),
            high: Number(quote.regularMarketDayHigh),
            low: Number(quote.regularMarketDayLow),
            close: Number(quote.regularMarketPrice),
            volume: Math.floor(Number(quote.regularMarketVolume)),
            adjClose: Number(quote.regularMarketPrice)
          }
        });
        
        console.log(`Successfully saved data for ${symbol}`);
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
      }
    }
    
    console.log('All stock data fetched and saved successfully');
  } catch (error) {
    console.error('Error in fetchAndSaveStockData:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function fetchHistoricalData() {
  console.log('Starting historical data fetch...');
  
  try {
    for (const symbol of SYMBOLS) {
      console.log(`Fetching historical data for ${symbol}...`);
      
      try {
        const queryOptions = {
          period1: new Date('2020-01-01'),
          period2: new Date('2025-03-15'),
          interval: '1d' as const,
        };
        
        const result = await yahooFinance.historical(symbol, queryOptions);
        
        for (const day of result) {
          await prisma.stockData.create({
            data: {
              symbol,
              timestamp: new Date(day.date),
              open: Number(day.open),
              high: Number(day.high),
              low: Number(day.low),
              close: Number(day.close),
              volume: Math.floor(Number(day.volume)),
              adjClose: Number(day.adjClose || day.close)
            }
          });
        }
        
        console.log(`Successfully saved historical data for ${symbol}`);
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error) {
        console.error(`Error processing historical data for ${symbol}:`, error);
      }
    }
    
    console.log('All historical data fetched and saved successfully');
  } catch (error) {
    console.error('Error in fetchHistoricalData:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    if (event.queryStringParameters?.historical === 'true') {
      await fetchHistoricalData();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Historical data fetched and saved successfully' }),
      };
    } else {
      await fetchAndSaveStockData();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Stock data fetched and saved successfully' }),
      };
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch and save stock data' }),
    };
  }
};

// To schedule this function, use the Netlify UI or netlify.toml configuration
// Example netlify.toml configuration:
// [functions.fetch-stocks]
// schedule = "30 18 * * 1-5" 