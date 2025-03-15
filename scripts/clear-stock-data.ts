import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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