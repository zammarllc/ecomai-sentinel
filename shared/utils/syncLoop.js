import prismaDefault, { getPrismaClient } from '../db/prismaClient.js';

const STOCK_TAG = 'stock';
const DEFAULT_LOOKBACK_MINUTES = 30;
const DEFAULT_ALERT_THRESHOLD = 25;

const ensureDate = (value) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed;
    }
  }

  return null;
};

const normaliseSymbol = (query) => {
  if (!query) {
    return null;
  }

  if (typeof query.stockSymbol === 'string' && query.stockSymbol.trim().length > 0) {
    return query.stockSymbol.trim().toUpperCase();
  }

  if (typeof query.symbol === 'string' && query.symbol.trim().length > 0) {
    return query.symbol.trim().toUpperCase();
  }

  const meta = query.meta || query.metadata || query.payload;
  if (meta && typeof meta === 'object') {
    if (typeof meta.stockSymbol === 'string' && meta.stockSymbol.trim().length > 0) {
      return meta.stockSymbol.trim().toUpperCase();
    }

    if (typeof meta.symbol === 'string' && meta.symbol.trim().length > 0) {
      return meta.symbol.trim().toUpperCase();
    }
  }

  return null;
};

const extractSentiment = (query) => {
  const sources = [
    query.sentiment,
    query.sentimentScore,
    query.sentiment_index,
    query.metrics?.sentiment,
    query.metrics?.sentimentScore,
    query.meta?.sentiment,
    query.meta?.sentimentScore,
    query.metadata?.sentiment,
    query.metadata?.sentimentScore,
  ];

  for (const value of sources) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

const extractVolume = (query) => {
  const sources = [
    query.volume,
    query.tradeVolume,
    query.metrics?.volume,
    query.metadata?.volume,
    query.meta?.volume,
  ];

  for (const value of sources) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

export const syncLoop = async (options = {}) => {
  const {
    prisma = prismaDefault || getPrismaClient(),
    logger = console,
    lookbackMinutes = DEFAULT_LOOKBACK_MINUTES,
    alertThreshold = DEFAULT_ALERT_THRESHOLD,
    now = new Date(),
    forecastIdentifierField = 'symbol',
    alertHandler,
  } = options;

  if (!prisma) {
    throw new Error('A Prisma client instance is required to run the sync loop.');
  }

  const referenceTime = ensureDate(now) ?? new Date();
  const cutoff = new Date(referenceTime.getTime() - lookbackMinutes * 60 * 1000);

  let stockQueries = [];

  try {
    stockQueries = await prisma.query.findMany({
      where: {
        createdAt: {
          gte: cutoff,
        },
        tags: {
          has: STOCK_TAG,
        },
      },
    });
  } catch (error) {
    logger.error?.('syncLoop: unable to retrieve recent stock-tagged queries', error);
    throw error;
  }

  if (!stockQueries.length) {
    return {
      processedSymbols: [],
      alerts: [],
      lookbackMinutes,
      cutoff,
    };
  }

  const summaries = new Map();

  for (const query of stockQueries) {
    const symbol = normaliseSymbol(query);
    if (!symbol) {
      continue;
    }

    if (!summaries.has(symbol)) {
      summaries.set(symbol, {
        symbol,
        queryCount: 0,
        lastSeenAt: null,
        sentimentTotal: 0,
        sentimentSamples: 0,
        cumulativeVolume: 0,
      });
    }

    const summary = summaries.get(symbol);
    summary.queryCount += 1;

    const createdAt = ensureDate(query.createdAt);
    if (createdAt && (!summary.lastSeenAt || createdAt > summary.lastSeenAt)) {
      summary.lastSeenAt = createdAt;
    }

    const sentiment = extractSentiment(query);
    if (sentiment !== null) {
      summary.sentimentTotal += sentiment;
      summary.sentimentSamples += 1;
    }

    const volume = extractVolume(query);
    if (volume !== null) {
      summary.cumulativeVolume += volume;
    }
  }

  const operations = [];
  const processedSymbols = [];
  const alerts = [];

  for (const summary of summaries.values()) {
    const averageSentiment = summary.sentimentSamples
      ? summary.sentimentTotal / summary.sentimentSamples
      : null;

    const updatePayload = {
      lastSyncedAt: referenceTime,
      lastSignalAt: summary.lastSeenAt,
      queryCount: summary.queryCount,
      averageSentiment,
      cumulativeVolume: summary.cumulativeVolume || null,
    };

    const wherePayload = { [forecastIdentifierField]: summary.symbol };

    operations.push(
      prisma.forecast.upsert({
        where: wherePayload,
        update: updatePayload,
        create: {
          ...wherePayload,
          ...updatePayload,
        },
      })
    );

    processedSymbols.push(summary.symbol);

    if (alertThreshold && summary.queryCount >= alertThreshold) {
      const alert = {
        symbol: summary.symbol,
        queryCount: summary.queryCount,
        lastSeenAt: summary.lastSeenAt,
        averageSentiment,
        level: summary.queryCount >= alertThreshold * 2 ? 'critical' : 'warning',
      };
      alerts.push(alert);
    }
  }

  try {
    if (operations.length) {
      await prisma.$transaction(operations);
    }
  } catch (error) {
    logger.error?.('syncLoop: failed to persist forecast updates', error);
    throw error;
  }

  if (alerts.length) {
    if (typeof alertHandler === 'function') {
      try {
        await alertHandler(alerts, { logger, referenceTime });
      } catch (error) {
        logger.error?.('syncLoop: alert handler failed', error);
      }
    } else {
      for (const alert of alerts) {
        logger.warn?.('syncLoop alert', alert);
      }
    }
  }

  return {
    processedSymbols,
    alerts,
    lookbackMinutes,
    cutoff,
  };
};

export default syncLoop;
