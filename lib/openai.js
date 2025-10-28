const OpenAI = require('openai');

const { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID } = process.env;

if (!OPENAI_API_KEY) {
  // Defer throwing until the client is actually used. This allows commands like
  // `npx prisma generate` to run without requiring the key.
  console.warn('[openai] OPENAI_API_KEY is not set. API calls will fail until configured.');
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL || undefined,
  organization: OPENAI_ORG_ID || undefined
});

const PRIVACY_NOTICE = '⚠️ Privacy Notice: AI-generated content may include inaccuracies. Do not share personal, financial, or health information. Usage is logged for quality and safety.';
const AI_MODEL = 'gpt-4o-mini';

module.exports = {
  client,
  PRIVACY_NOTICE,
  AI_MODEL
};
