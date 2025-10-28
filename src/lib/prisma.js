const { PrismaClient } = require('@prisma/client');

const globalKey = Symbol.for('auth-service.prisma');
const globalCache = globalThis[globalKey];

const prisma = globalCache || new PrismaClient();

if (!globalCache) {
  globalThis[globalKey] = prisma;
}

module.exports = { prisma };
