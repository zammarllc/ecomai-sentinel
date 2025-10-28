const express = require('express');
const { z } = require('zod');

const { client: openai, PRIVACY_NOTICE, AI_MODEL } = require('../lib/openai');
const { ensurePrivacyNotice } = require('../lib/privacy');
const { prisma } = require('../lib/prisma');

const router = express.Router();

const dataPointSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  value: z.number({ invalid_type_error: 'Value must be numeric.' })
});

const inventoryPointSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
  onHand: z.number({ invalid_type_error: 'onHand must be numeric.' }),
  restockLeadTimeDays: z.number().optional()
});

const requestSchema = z.object({
  sales: z.array(dataPointSchema).min(1, 'Provide at least one sales data point.'),
  inventory: z.array(inventoryPointSchema).min(1, 'Provide at least one inventory record.'),
  notes: z.string().optional()
});

function buildValidationError(error) {
  return error.flatten ? error.flatten() : error.message;
}

router.post('/', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body.', details: buildValidationError(parsed.error) });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  }

  const { sales, inventory, notes } = parsed.data;
  const userId = req.user.id;

  let aiPayload;
  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an analytics assistant producing sales and inventory forecasts. '
                + 'Given structured JSON input, respond with concise insights and alerts in JSON.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: JSON.stringify({ sales, inventory, notes })
            }
          ]
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ForecastResponse',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: {
                type: 'string',
                description: 'Short narrative summary. Must append the privacy notice verbatim.'
              },
              highlights: {
                type: 'array',
                description: 'Key bullet highlights from the analysis.',
                items: { type: 'string' }
              },
              alerts: {
                type: 'array',
                description: 'Potential risks or warnings for the user.',
                items: { type: 'string' }
              }
            },
            required: ['summary', 'highlights', 'alerts']
          }
        }
      },
      temperature: 0.35
    });

    const rawOutput = response.output_text;
    if (!rawOutput) {
      throw new Error('OpenAI returned an empty response.');
    }

    aiPayload = JSON.parse(rawOutput);
  } catch (error) {
    console.error('[forecasts] OpenAI error', error);

    if (error?.response?.status) {
      return res.status(502).json({
        error: 'OpenAI request failed.',
        details: error.response.data || error.response.statusText
      });
    }

    if (error instanceof SyntaxError) {
      return res.status(502).json({ error: 'Failed to parse OpenAI response payload.' });
    }

    return res.status(502).json({ error: 'Unable to fulfil OpenAI request.' });
  }

  const summary = ensurePrivacyNotice(aiPayload.summary);
  const highlights = Array.isArray(aiPayload.highlights) ? aiPayload.highlights : [];
  const alerts = Array.isArray(aiPayload.alerts) ? aiPayload.alerts : [];

  try {
    const record = await prisma.forecast.create({
      data: {
        userId,
        inputData: { sales, inventory, notes: notes || null },
        summary,
        highlights,
        alerts,
        privacyNotice: PRIVACY_NOTICE,
        model: AI_MODEL
      }
    });

    return res.status(201).json({
      id: record.id,
      summary: record.summary,
      highlights: record.highlights,
      alerts: record.alerts,
      createdAt: record.createdAt
    });
  } catch (error) {
    console.error('[forecasts] Database error', error);
    return res.status(500).json({ error: 'Failed to store forecast.' });
  }
});

module.exports = router;
