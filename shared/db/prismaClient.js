import { PrismaClient } from '@prisma/client';

const PRISMA_GLOBAL_KEY = Symbol.for('ecomai-sentinel.prisma');

const getGlobal = () => {
  return globalThis[PRISMA_GLOBAL_KEY];
};

const setGlobal = (client) => {
  globalThis[PRISMA_GLOBAL_KEY] = client;
};

let prisma = getGlobal();

if (!prisma) {
  prisma = new PrismaClient();
  setGlobal(prisma);
}

export const getPrismaClient = () => prisma;
export default prisma;
