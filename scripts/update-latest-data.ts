import { PrismaClient } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';

// Suppress deprecation notice
yahooFinance.suppressNotices(['ripHistorical']);

const prisma = new PrismaClient();
const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

// Helper to delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function updateLatestData() {
  console.log('=== Fetching Latest Stock Data ===\n');

  // Get the latest date we have in the database
  const latestRecord = await prisma.stockData.findFirst({
    where: { symbol: 'SPY' },
    orderBy: { date: 'desc' },
  });

  const startDate = latestRecord
    ? new Date(latestRecord.date.getTime() + 24 * 60 * 60 * 1000) // Day after latest
    : new Date('2020-01-01');

  const endDate = new Date(); // Today

  console.log(`Fetching data from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

  if (startDate >= endDate) {
    console.log('Database is already up to date!');
    await prisma.$disconnect();
    return;
  }

  for (const symbol of SYMBOLS) {
    try {
      console.log(`Fetching ${symbol}...`);

      // Use chart() instead of deprecated historical()
      const result = await yahooFinance.chart(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      });

      const quotes = result.quotes;

      if (!quotes || quotes.length === 0) {
        console.log(`  No new data for ${symbol}`);
        await delay(2000); // Wait 2 seconds between requests
        continue;
      }

      const dbResult = await prisma.stockData.createMany({
        data: quotes
          .filter((quote: any) => quote.close !== null) // Filter out null entries
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

      console.log(`  Added ${dbResult.count} new records for ${symbol}`);
      const lastQuote = quotes[quotes.length - 1];
      console.log(`  Latest: ${new Date(lastQuote.date).toISOString().split('T')[0]} - $${lastQuote.close?.toFixed(2)}`);

      // Wait 2 seconds between symbols to avoid rate limiting
      await delay(2000);
    } catch (error: any) {
      console.error(`  Error fetching ${symbol}:`, error.message || error);
      await delay(3000); // Wait longer after error
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
