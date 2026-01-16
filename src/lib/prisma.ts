import { PrismaClient } from '@prisma/client';

// Use a single PrismaClient instance for the entire application
// This prevents too many connections in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma client with Accelerate URL if available
if (!globalForPrisma.prisma) {
  const options: any = {};

  // Only add accelerateUrl if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    options.accelerateUrl = process.env.DATABASE_URL;
  }

  globalForPrisma.prisma = new PrismaClient(options);
}

export const prisma = globalForPrisma.prisma; 