import { PrismaClient } from '@prisma/client';

// Use a single PrismaClient instance for the entire application
// This prevents too many connections in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma client with Accelerate URL
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  });
}

export const prisma = globalForPrisma.prisma; 