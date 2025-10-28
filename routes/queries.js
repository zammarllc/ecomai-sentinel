const express = require('express');
const { z } = require('zod');

const { client: openai, PRIVACY_NOTICE, AI_MODEL } = require('../lib/openai');
const { ensurePrivacyNotice } = require('../lib/privacy');
const { prisma } = require('../lib/prisma');
const { triggerSyncLoop } = require('../lib/syncLoop');

const router = express.Router();

const requestSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty.'),
  metadata: z.record(z.any()).optional()
});

function buildValidationError(error) {
  return error.flatten ? error.flatten() : error.message;
}

router.post('/', async (req, res) => {
  const parseResult = requestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request body.', details: buildValidationError(parseResult.error) });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  }

  const { query, metadata } = parseResult.data;
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
              text: 'You are a retail customer support assistant. Answer succinctly using the available information. '
                + 'Classify whether the conversation relates to stock or inventory availability. '
                + 'Return a JSON object matching the schema.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Customer query: ${query}`
            }
          ]
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'CustomerSupportResponse',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              answer: {
                type: 'string',
                description: 'Spoken answer for the customer including the privacy disclaimer appended verbatim.'
              },
              tag: {
                type: 'string',
                enum: ['stock', 'general'],
                description: 'Classification for whether the question involved stock or inventory availability.'
              }
            },
            required: ['answer', 'tag']
          }
        }
      },
      temperature: 0.3
    });

    const rawOutput = response.output_text;
    if (!rawOutput) {
      throw new Error('OpenAI returned an empty response.');
    }

    aiPayload = JSON.parse(rawOutput);
  } catch (error) {
    console.error('[queries] OpenAI error', error);

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

  const safeAnswer = ensurePrivacyNotice(aiPayload.answer);
  const tag = aiPayload.tag === 'stock' ? 'stock' : 'general';

  try {
    const record = await prisma.customerQuery.create({
      data: {
        userId,
        question: query,
        answer: safeAnswer,
        tag,
        privacyNotice: PRIVACY_NOTICE,
        model: AI_MODEL,
        metadata: metadata || null
      }
    });

    if (tag === 'stock') {
      await triggerSyncLoop({
        queryId: record.id,
        userId,
        question: query,
        answer: safeAnswer,
        tag
      });
    }

    return res.status(201).json({
      id: record.id,
      answer: record.answer,
      tag: record.tag,
      createdAt: record.createdAt
    });
  } catch (error) {
    console.error('[queries] Database error', error);
    return res.status(500).json({ error: 'Failed to store query.' });
  }
});

module.exports = router;
