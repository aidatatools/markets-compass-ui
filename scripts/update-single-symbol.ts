import { PrismaClient } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';
import 'dotenv/config';

yahooFinance.suppressNotices(['ripHistorical']);

const prisma = new PrismaClient();

// Get symbol from command line argument
const symbol = process.argv[2] || 'SPY';

async function updateSymbol() {
  console.log(`=== Updating ${symbol} ===\n`);

  // Get the latest date we have in the database for this symbol
  const latestRecord = await prisma.stockData.findFirst({
    where: { symbol },
    orderBy: { date: 'desc' },
  });

  console.log(`Current latest record: ${latestRecord?.date?.toISOString().split('T')[0]} - $${latestRecord?.close?.toFixed(2)}`);

  const startDate = latestRecord
    ? new Date(latestRecord.date.getTime() + 24 * 60 * 60 * 1000)
    : new Date('2020-01-01');

  const endDate = new Date();

  console.log(`Fetching from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

  if (startDate >= endDate) {
    console.log('Already up to date!');
    await prisma.$disconnect();
    return;
  }

  try {
    const result = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    const quotes = result.quotes;
    console.log(`Received ${quotes?.length || 0} quotes from Yahoo Finance`);

    if (!quotes || quotes.length === 0) {
      console.log('No new data available');
      await prisma.$disconnect();
      return;
    }

    // Show the data we received
    console.log('\nData received:');
    quotes.forEach((q: any) => {
      console.log(`  ${new Date(q.date).toISOString().split('T')[0]}: $${q.close?.toFixed(2)}`);
    });

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

    console.log(`\nAdded ${dbResult.count} new records to database`);

    // Verify
    const newLatest = await prisma.stockData.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' },
    });
    console.log(`New latest: ${newLatest?.date?.toISOString().split('T')[0]} - $${newLatest?.close?.toFixed(2)}`);

  } catch (error: any) {
    console.error('Error:', error.message || error);
  }

  await prisma.$disconnect();
}

updateSymbol().catch(console.error);
