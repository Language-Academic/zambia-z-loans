import { PrismaClient } from '@prisma/client';

/**
 * Zambia Z - Prisma Singleton Client
 * Prevents multiple instances of Prisma Client in development.
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Only log queries in development to keep production logs clean
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Use the existing instance if it exists, or create a new one
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

// If we're not in production, save the instance to globalThis
// to survive hot-reloads during development.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
