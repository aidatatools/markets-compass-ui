import { PrismaClient } from '@prisma/client';
import alpha from 'alphavantage';
import 'dotenv/config';

const prisma = new PrismaClient();
const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

// Initialize Alpha Vantage with API key
const alphaVantage = alpha({ key: process.env.ALPHA_VANTAGE_API_KEY || '' });

// Helper to delay between requests (Alpha Vantage free tier: 5 calls/min)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function updateLatestData() {
  console.log('=== Fetching Latest Stock Data (Alpha Vantage) ===\n');

  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    console.error('Error: ALPHA_VANTAGE_API_KEY not found in environment variables');
    await prisma.$disconnect();
    return;
  }

  // Get the latest date we have in the database
  const latestRecord = await prisma.stockData.findFirst({
    where: { symbol: 'SPY' },
    orderBy: { date: 'desc' },
  });

  console.log(`Current latest record: ${latestRecord?.date?.toISOString().split('T')[0]} - $${latestRecord?.close?.toFixed(2)}\n`);

  for (const symbol of SYMBOLS) {
    try {
      console.log(`Fetching ${symbol}...`);

      // Fetch daily data from Alpha Vantage (compact = last 100 days)
      const data = await alphaVantage.data.daily(symbol, 'compact');
      const timeSeries = data['Time Series (Daily)'];

      if (!timeSeries) {
        console.log(`  No data returned for ${symbol}`);
        await delay(15000);
        continue;
      }

      // Convert to array and filter for new records
      const quotes = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date: new Date(date),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'], 10),
        }))
        .filter(quote => !latestRecord || quote.date > latestRecord.date);

      if (quotes.length === 0) {
        console.log(`  No new data for ${symbol}`);
        await delay(15000);
        continue;
      }

      const dbResult = await prisma.stockData.createMany({
        data: quotes.map((quote) => ({
          symbol: symbol,
          date: quote.date,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume,
          adjClose: quote.close,
          timestamp: quote.date,
        })),
        skipDuplicates: true,
      });

      console.log(`  Added ${dbResult.count} new records for ${symbol}`);
      const lastQuote = quotes.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      console.log(`  Latest: ${lastQuote.date.toISOString().split('T')[0]} - $${lastQuote.close.toFixed(2)}`);

      // Wait 15 seconds between symbols to respect rate limit (5 calls/min)
      console.log(`  Waiting 15s before next request...`);
      await delay(15000);
    } catch (error: any) {
      console.error(`  Error fetching ${symbol}:`, error.message || error);
      await delay(20000); // Wait longer after error
    }
  }

  // Verify the update
  console.log('\n=== Verification ===\n');

  for (const symbol of SYMBOLS) {
    const latest = await prisma.stockData.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' },
    });

    const count = await prisma.stockData.count({
      where: { symbol },
    });

    console.log(`${symbol}: ${count} total records, latest: ${latest?.date?.toISOString().split('T')[0]} - $${latest?.close?.toFixed(2)}`);
  }

  await prisma.$disconnect();
}

updateLatestData().catch(console.error);
