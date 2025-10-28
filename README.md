# AI Analytics Service

This project exposes a small Express API for customer support queries and demand forecasting. It integrates with OpenAI GPT-4o-mini for natural language answers and insights, persists data via Prisma, and surfaces combined dashboards per user.

## Prerequisites

- Node.js 18+
- npm (comes bundled with Node.js)
- SQLite (bundled with Prisma for local development)
- An OpenAI API key with access to `gpt-4o-mini`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in required values:

   ```bash
   cp .env.example .env
   ```

   - `OPENAI_API_KEY` must be set.
   - Optionally set `OPENAI_BASE_URL`/`OPENAI_ORG_ID` if your organisation uses them.
   - `SYNC_LOOP_URL` allows the service to notify downstream systems when stock issues are detected.

3. Generate the Prisma client and prepare the database:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   This creates a local SQLite database at `prisma/dev.db`.

4. Start the service:

   ```bash
   npm run dev
   ```

   The server listens on `http://localhost:3000` by default.

## Authentication

For simplicity, the API expects a user identifier to be supplied via the `x-user-id` header. Routes will respond with `401` if the header is missing. In a production system you can replace the `authenticate` middleware with your preferred authentication strategy.

## API Overview

### `POST /queries`

Accepts a customer question and returns an AI-generated answer. Responses always append the privacy disclaimer. The endpoint stores each interaction and, when the AI flags a stock-related issue, triggers the optional sync loop webhook.

Example request:

```http
POST /queries
x-user-id: user-123
Content-Type: application/json

{
  "query": "Do we have the blue sneakers in stock?",
  "metadata": {"channel": "chat"}
}
```

Example response:

```json
{
  "id": 1,
  "answer": "We are currently low on blue sneakers...\n\n⚠️ Privacy Notice: ...",
  "tag": "stock",
  "createdAt": "2025-10-28T15:30:00.000Z"
}
```

### `POST /forecasts`

Accepts sales and inventory data, forwards it to OpenAI for short-term forecasting, and persists the results alongside the privacy notice.

```http
POST /forecasts
x-user-id: user-123
Content-Type: application/json

{
  "sales": [{"date": "2025-10-01", "value": 1200}],
  "inventory": [{"sku": "A100", "onHand": 45}],
  "notes": "Holiday promo ongoing"
}
```

Response includes summarised insights, forecast highlights, and alerts returned by the model.

### `GET /dashboard`

Returns a combined view of the authenticated user's past queries and saved forecasts. Useful for Postman/httpie validation to ensure persistence works end-to-end.

## Privacy Notice

Every AI response includes the following disclosure appended verbatim:

> ⚠️ Privacy Notice: AI-generated content may include inaccuracies. Do not share personal, financial, or health information. Usage is logged for quality and safety.

## Error Handling

OpenAI and database errors are normalised into JSON error payloads with an `error` key. When an upstream provider is unavailable a 502 response is returned; validation problems result in 400 responses.

## Running Tests

This starter does not include automated tests. You can exercise endpoints via Postman/httpie as described above.
