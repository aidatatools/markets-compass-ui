import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import 'dotenv/config';

const prisma = new PrismaClient({
  // Fallback to a dummy URL to bypass Prisma 7 constructor validation during build
  accelerateUrl: process.env.DATABASE_URL || "prisma+postgres://dummy.prisma-postgres.com/?api_key=dummy",
}).$extends(withAccelerate());

async function clearStockData() {
  try {
    const deleted = await prisma.stockData.deleteMany({});
    console.log(`Deleted ${deleted.count} records from StockData`);
  } catch (error) {
    console.error('Error clearing StockData:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearStockData(); 