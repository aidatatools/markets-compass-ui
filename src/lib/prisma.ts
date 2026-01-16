import { PrismaClient } from '@prisma/client';

// Use a single PrismaClient instance for the entire application
// This prevents too many connections in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma client with explicit types
export const prisma = globalForPrisma.prisma ||
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  });

// In development, save the client to avoid multiple connections
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 