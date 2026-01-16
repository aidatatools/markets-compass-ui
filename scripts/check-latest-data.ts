import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkLatestData() {
  const symbols = ['SPY', 'QQQ', 'DIA', 'GLD'];

  console.log('=== Checking Latest Data in Database ===\n');

  for (const symbol of symbols) {
    const latest = await prisma.stockData.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' },
    });

    const count = await prisma.stockData.count({
      where: { symbol },
    });

    const oldest = await prisma.stockData.findFirst({
      where: { symbol },
      orderBy: { date: 'asc' },
    });

    console.log(`${symbol}:`);
    console.log(`  Total records: ${count}`);
    console.log(`  Oldest date: ${oldest?.date?.toISOString().split('T')[0] || 'N/A'}`);
    console.log(`  Latest date: ${latest?.date?.toISOString().split('T')[0] || 'N/A'}`);
    console.log(`  Latest close: $${latest?.close?.toFixed(2) || 'N/A'}`);
    console.log('');
  }

  // Check for gaps - find missing dates in last 30 days
  console.log('=== Gap Check (Last 30 Trading Days) ===\n');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 45); // 45 calendar days to cover ~30 trading days

  const recentData = await prisma.stockData.findMany({
    where: {
      symbol: 'SPY',
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  console.log(`SPY records in last 45 calendar days: ${recentData.length}`);
  if (recentData.length > 0) {
    console.log(`Most recent: ${recentData[0].date.toISOString().split('T')[0]}`);
    console.log(`Oldest in range: ${recentData[recentData.length - 1].date.toISOString().split('T')[0]}`);
  }

  await prisma.$disconnect();
}

checkLatestData().catch(console.error);
