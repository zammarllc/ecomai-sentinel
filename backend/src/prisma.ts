import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const getPrismaClient = (): PrismaClient | undefined => {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
};

const prisma = getPrismaClient();

export { getPrismaClient };
export default prisma;
