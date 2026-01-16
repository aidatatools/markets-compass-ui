import { PrismaClient } from "@prisma/client";
import yahooFinance from "yahoo-finance2";
import 'dotenv/config';

const prisma = new PrismaClient();
const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];
const DELAY_BETWEEN_REQUESTS = 2000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHistoricalData() {
  console.log('Starting historical data fetch...');

  try {
    for (const symbol of SYMBOLS) {
      console.log(`Fetching historical data for ${symbol}...`);

      try {
        const queryOptions = {
          period1: new Date('2020-01-01'),
          period2: new Date('2025-03-17T23:59:59.999Z'),
          interval: '1d' as const,
          includeAdjustedClose: true,
          return: 'object' as const
        };

        const result = await yahooFinance.chart(symbol, queryOptions);
        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0];
        const adjClose = result.indicators.adjclose?.[0]?.adjclose || [];

        console.log(`Got ${timestamps.length} days of data for ${symbol}`);
        console.log(`Date range: ${new Date(timestamps[0] * 1000).toISOString()} to ${new Date(timestamps[timestamps.length - 1] * 1000).toISOString()}`);

        for (let i = 0; i < timestamps.length; i++) {
          if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i] && quotes.volume[i]) {
            const timestamp = new Date(timestamps[i] * 1000);
            timestamp.setUTCHours(0, 0, 0, 0);

            const existingData = await prisma.stockData.findFirst({
              where: {
                symbol,
                timestamp: {
                  gte: timestamp,
                  lt: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000)
                }
              }
            });

            if (!existingData) {
              await prisma.stockData.create({
                data: {
                  symbol,
                  date: timestamp,
                  open: Number(quotes.open[i]),
                  high: Number(quotes.high[i]),
                  low: Number(quotes.low[i]),
                  close: Number(quotes.close[i]),
                  volume: Math.floor(Number(quotes.volume[i])),
                  adjClose: Number(adjClose[i] || quotes.close[i]),
                  timestamp: timestamp
                }
              });
            }
          }
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

// Run the script
fetchHistoricalData()
  .catch(console.error); 