const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const [queries, forecasts] = await Promise.all([
      prisma.customerQuery.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.forecast.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      userId,
      queryCount: queries.length,
      forecastCount: forecasts.length,
      queries: queries.map((query) => ({
        id: query.id,
        question: query.question,
        answer: query.answer,
        tag: query.tag,
        createdAt: query.createdAt,
        metadata: query.metadata
      })),
      forecasts: forecasts.map((forecast) => ({
        id: forecast.id,
        summary: forecast.summary,
        highlights: forecast.highlights,
        alerts: forecast.alerts,
        createdAt: forecast.createdAt,
        inputData: forecast.inputData
      }))
    });
  } catch (error) {
    console.error('[dashboard] Database error', error);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

module.exports = router;
