import prismaDefault, { getPrismaClient } from '../../shared/db/prismaClient.js';
import { syncLoop } from '../../shared/utils/syncLoop.js';

const STOCK_TAG = 'stock';

const normaliseTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).toLowerCase());
  }

  if (typeof tags === 'string') {
    return [tags.toLowerCase()];
  }

  return [];
};

const triggerBackgroundSync = (prisma, logger) => {
  const task = async () => {
    try {
      await syncLoop({ prisma, logger });
    } catch (error) {
      logger.error?.('api/queries: sync loop failed', error);
    }
  };

  if (typeof setImmediate === 'function') {
    setImmediate(task);
    return;
  }

  queueMicrotask(task);
};

export const persistQuery = async (input = {}) => {
  const {
    payload = {},
    prisma = prismaDefault || getPrismaClient(),
    logger = console,
  } = input;

  if (!prisma) {
    throw new Error('A Prisma client instance is required to persist a query.');
  }

  const tags = normaliseTags(payload.tags);
  const stockSymbol = payload.stockSymbol || payload.symbol || payload.ticker || null;

  const data = {
    text: payload.text ?? payload.prompt ?? '',
    tags,
    stockSymbol,
    metadata: payload.metadata || payload.meta || null,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
  };

  const record = await prisma.query.create({
    data,
  });

  if (tags.includes(STOCK_TAG)) {
    triggerBackgroundSync(prisma, logger);
  }

  return record;
};

export default persistQuery;
