import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Use a single PrismaClient instance for the entire application
// This prevents too many connections in development
const globalForPrisma = global as unknown as { prisma: any };

// Initialize Prisma client with Accelerate URL if available
if (!globalForPrisma.prisma) {
  const client = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  });

  globalForPrisma.prisma = client.$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma;