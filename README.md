# EcomAI Sentinel

Internal tooling for managing query intelligence and forecast synchronisation in the EcomAI Sentinel backend.

## Data Loop

The data loop tracks recently ingested queries that are tagged with the `stock` label and keeps the `forecast` table aligned with the latest activity.

1. Incoming queries persist through `api/queries/persistQuery`. When the payload includes the `stock` tag, the handler schedules a background run of the shared `syncLoop` utility without awaiting the result. This keeps the API response quick while still guaranteeing eventual synchronisation.
2. `shared/utils/syncLoop` looks back across a 30 minute window (configurable) for stock-tagged queries, aggregates them by symbol, and upserts the associated forecast rows through Prisma. Any symbol that exceeds the configured activity threshold raises an alert via the provided logger or optional alert handler.
3. The loop responds with the processed symbols and alerts so that callers can instrument their own monitoring pipelines if needed.

### Troubleshooting

- **Sync loop not firing**: Confirm that the persisted query includes the lower-cased `stock` tag. Queries without the tag short-circuit and skip the loop entirely.
- **Forecast rows missing**: Ensure the Prisma schema defines a unique field (default: `symbol`) on the `forecast` model. Override `forecastIdentifierField` when invoking the loop if your schema uses a different column name.
- **Alerts not visible**: Provide a custom `alertHandler` when calling `syncLoop` to forward alerts to your monitoring stack. Without a handler the loop will log them via the supplied logger.
- **Slow responses**: Because the sync executes in the background, response latency should remain unaffected. If delays occur, audit the Prisma connection and confirm there are no long-running transactions blocking query persistence.
# AI Analytics Service

This project exposes a small Express API for customer support queries and demand forecasting. It integrates with OpenAI GPT-4o-mini for natural language answers and insights, persists data via Prisma, and surfaces combined dashboards per user.
# Auth Service

A lightweight Express-based authentication service backed by Prisma, bcrypt, and JWT. It exposes registration and login endpoints, along with middleware that can be composed to protect downstream routes and enforce subscription tiers.

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
- npm

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and adjust values as needed:
   ```bash
   cp .env.example .env
   ```
3. Apply the Prisma schema and generate the client:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. Boot the API:
   ```bash
   npm start
   ```

## Project Structure

```
src/
  app.js                # Express application wiring
  server.js             # Entry point that boots the HTTP server
  lib/prisma.js         # Shared Prisma client instance
  routes/auth.js        # Registration & login endpoints
  middleware/
    auth.js             # Bearer token verification middleware
    subscription.js     # Tier-based access guard
prisma/
  schema.prisma         # Prisma data model
  migrations/           # SQL migrations
```

## Authentication

### Registration

Registers a new user, hashing the provided password and issuing a JWT in the response.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "email": "jane@example.com",
        "password": "PlaintextP@ssw0rd",
        "name": "Jane Doe",
        "tier": "pro"
      }'
```

**Successful response**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "jane@example.com",
    "name": "Jane Doe",
    "tier": "pro",
    "createdAt": "2023-10-28T15:07:00.000Z",
    "updatedAt": "2023-10-28T15:07:00.000Z"
  }
}
```

If the email is already registered you will receive a `409 Conflict` with a descriptive error.

### Login

Authenticates an existing user, validating the stored password hash and issuing a fresh JWT.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
        "email": "jane@example.com",
        "password": "PlaintextP@ssw0rd"
      }'
```

**Successful response**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "jane@example.com",
    "name": "Jane Doe",
    "tier": "pro",
    "createdAt": "2023-10-28T15:07:00.000Z",
    "updatedAt": "2023-10-28T15:07:00.000Z"
  }
}
```

Invalid credentials produce a `401 Unauthorized` status with the message `"Invalid email or password"`.

### Protecting Routes

Use the provided middleware to protect downstream routes and enforce subscription tiers:

```javascript
const express = require('express');
const { authenticate } = require('./middleware/auth');
const { allowTiers } = require('./middleware/subscription');

const router = express.Router();

router.get(
  '/reports',
  authenticate,
  allowTiers('pro', 'enterprise'),
  (req, res) => {
    res.json({ message: `Hello, ${req.user.email}!` });
  }
);
```

After logging in, supply the token in the `Authorization` header:

```bash
curl http://localhost:3000/api/reports \
  -H "Authorization: Bearer <jwt>"
```

Users with disallowed tiers will receive a `403 Forbidden` response containing the allowed tiers for that endpoint.
# Full-stack Vercel Deployment Template

This repository contains a minimal full-stack application prepared for Vercel deployment. The
frontend is a Vite + React single-page application and the backend is an Express API surfaced as a
Vercel serverless function. Prisma is used as the ORM layer with PostgreSQL, and optional OpenAI
integration is wired through the backend.

The goal of this ticket is to document the deployment process end to end so that another engineer
can provision the required infrastructure, run the stack locally, and push a production deployment
with confidence.

## Tech stack

- **Frontend:** Vite 5, React 18, TypeScript
- **Backend:** Node.js 18, Express 4, Prisma 5
- **Database:** PostgreSQL (local via Docker or remote provider)
- **AI integration:** OpenAI (configurable via environment variables)
- **Hosting:** Vercel (monorepo configuration via `vercel.json`)

## Repository layout

```
.
├── backend
│   ├── api/               # Vercel serverless entry point (maps to /api/*)
│   ├── prisma/            # Prisma schema and migrations
│   └── src/               # Express application (shared across local + serverless)
├── frontend               # Vite + React client application
├── vercel.json            # Deployment configuration for both apps
└── README.md
```

## Prerequisites

- Node.js **18.18.0** or later (`nvm install 18` recommended)
- npm 9 or later (bundled with Node 18)
- Docker Desktop (optional, for local PostgreSQL)
- Vercel CLI (`npm i -g vercel`) for one-click deploys from your terminal
- Access to an OpenAI API key if you plan to exercise AI-powered routes

Optional but recommended:

- PostgreSQL client (psql, TablePlus, etc.)
- Prisma Studio (`npx prisma studio`)

## Installation

1. Clone the repository and install workspace dependencies:

   ```bash
   git clone <repo-url>
   cd <repo-folder>
   npm install
   ```

   The root `package.json` is configured with npm workspaces. Running `npm install` installs and
   links dependencies for both the frontend and backend. A `postinstall` hook runs `prisma generate`
   so the Prisma Client is available immediately.

2. Copy environment templates and update the values for your machine or cloud resources:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. (Optional) Start a local PostgreSQL instance if you do not already have one. A simple Docker
   command is shown below, adjust credentials as needed:

   ```bash
   docker run --name fullstack-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
   ```

## Environment variables

### Backend (`backend/.env`)

| Variable          | Description                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `NODE_ENV`        | Execution environment (`development`, `production`, etc.).                                        |
| `PORT`            | Port used for local development. Vercel injects its own port when running serverless functions.   |
| `DATABASE_URL`    | PostgreSQL connection string used by Prisma.                                                      |
| `OPENAI_API_KEY`  | Secret key retrieved from the OpenAI dashboard.                                                   |
| `OPENAI_MODEL`    | The OpenAI model identifier to use (e.g. `gpt-4o-mini`).                                          |

### Frontend (`frontend/.env`)

| Variable           | Description                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`| Base URL for the backend when proxying is not available (e.g. during static builds or integration tests).     |

> **Note:** When running `npm run dev --workspace frontend`, the Vite development server proxies
> `/api/*` requests to `VITE_API_BASE_URL`. In production, the `vercel.json` routes send `/api/*`
> requests to the backend serverless function automatically.

## Database & Prisma workflow

Prisma files live under `backend/prisma/`. The default schema defines a simple `User` model to
illustrate migration generation. Typical commands (run from the `backend` directory unless
specified) include:

```bash
# Create your database schema via migration (development)
npm run migrate --workspace backend -- --name init

# Or directly with Prisma CLI
cd backend
npx prisma migrate dev --name init

# Apply migrations to production databases
npm run migrate:deploy --workspace backend

# For non-production experimentation only (overwrites data!)
npx prisma db push --force-reset

# Explore or edit data
npx prisma studio
```

A database URL **must** be present before running Prisma commands. For Vercel deployments, seed your
`DATABASE_URL` via the Vercel dashboard or CLI (`vercel env add DATABASE_URL`).

## OpenAI integration

- Store your OpenAI key in `backend/.env` as `OPENAI_API_KEY`.
- The backend can conditionally call OpenAI-powered routes. Keep limits in mind—Vercel serverless
  functions have a 10-second execution window on the free tier.
- When deploying, add the same key to Vercel (`vercel env add OPENAI_API_KEY`). If latency becomes an
  issue consider caching responses or using streaming completions.

## Running locally

Open two terminals (or use a process manager like `npm-run-all`/`concurrently`).

### Backend

```bash
npm run dev --workspace backend
```

- Loads environment variables from `backend/.env` via `dotenv/config`.
- Uses `process.env.PORT` if provided, defaulting to **4000**.
- Express app exposes:
  - `GET /api/health` – simple readiness probe.
  - `GET /api/db/health` – checks database connectivity when `DATABASE_URL` is configured.

### Frontend

```bash
npm run dev --workspace frontend
```

- Serves the Vite application on http://localhost:5173.
- Proxies `/api/*` to `http://localhost:4000` (or the value of `VITE_API_BASE_URL`).

### Type checking & builds

```bash
npm run lint --workspace backend   # tsc --noEmit
npm run lint --workspace frontend  # tsc --noEmit
npm run build                      # runs backend + frontend builds
```

Artifacts end up in `backend/dist` and `frontend/dist` respectively.

## Vercel deployment

### Key configuration (`vercel.json`)

```json
{
  "version": 2,
  "functions": {
    "backend/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 512,
      "maxDuration": 10
    }
  },
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/api/$1.ts" },
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "frontend/dist/index.html" }
  ],
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "env": {
    "DATABASE_URL": "@database-url",
    "OPENAI_API_KEY": "@openai-api-key",
    "OPENAI_MODEL": "@openai-model",
    "NODE_ENV": "production"
  }
}
```

- `frontend/package.json` is built with `@vercel/static-build`, outputting static assets from
  `frontend/dist`.
- `backend/api/index.ts` (and any additional handlers you add under `backend/api/`) are compiled into
  serverless functions via `@vercel/node`.
- The `routes` section ensures `/api/*` is routed to backend functions while all other paths serve
  the frontend SPA.
- Root-level `npm run build` first compiles the backend (`npm run build --workspace backend`) and
  then builds the frontend (`npm run build --workspace frontend`), which is exactly what the Vercel
  `buildCommand` executes.
- `backend/src/server.ts` reads `process.env.PORT`, so the same build works locally (default 4000) and
  inside Vercel’s serverless runtime where the port is injected dynamically.
- Environment variables marked with `@secret-name` expect you to provision matching secrets in the
  Vercel dashboard or CLI.
- Function constraints mirror the free-tier limits (512 MB memory, 10 second execution window).

### Deployment steps

1. **Login and link project**

   ```bash
   vercel login
   vercel link   # answer prompts to associate the repo with a Vercel project
   ```

2. **Configure environment variables**

   ```bash
   vercel env add DATABASE_URL
   vercel env add OPENAI_API_KEY
   vercel env add OPENAI_MODEL
   ```

   Deployments will receive the same variables defined in `vercel.json` when you assign them here.

3. **Trigger deployment**

   ```bash
   vercel        # preview deployment
   vercel --prod # production deployment
   ```

   CI pipelines connected to GitHub/GitLab/Bitbucket can deploy automatically on push. Vercel reads
   `vercel.json` so no additional UI configuration is required.

4. **Run migrations**

   Vercel serverless functions cannot execute long-lived migrations on deploy. Apply migrations
   manually from your machine or CI runner targeting the production database:

   ```bash
   cd backend
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```

   Alternatively, use Prisma Data Proxy/Accelerate to manage connection limits if you expect high
   concurrency.

### Serverless considerations

- **Port management:** `backend/src/server.ts` reads `process.env.PORT` so local development and
  Vercel’s serverless environments coexist without modification.
- **Connection pooling:** Prisma with PostgreSQL can exhaust connection limits in serverless
  environments. Consider using Prisma Accelerate, PgBouncer, or Neon serverless Postgres.
- **Cold starts:** Keep handlers lightweight; extract heavy initialization (e.g., OpenAI client) into
  shared modules so Vercel caches them between invocations.
- **Execution window:** Free tier offers 10 seconds max. For long-running OpenAI requests, enable
  streaming or offload to queued jobs (e.g., Vercel Queues or background workers).

## Troubleshooting

- **API requests fail locally**: Ensure the backend is running and `VITE_API_BASE_URL` matches the
  backend port.
- **Prisma unable to connect**: Verify `DATABASE_URL`, ensure the database is reachable from your
  network, and run `npx prisma migrate dev` to create tables.
- **OpenAI 401 errors**: Double-check the API key and model name. Keys beginning with `sk-` must be
  stored server-side and never committed.
- **Vercel build fails due to Prisma**: Confirm `prisma generate` ran (triggered by `postinstall`).
  You can run `vercel env pull .env.local` to hydrate local `.env` files before building.

## Next steps

- Expand `backend/api/` with additional serverless handlers as the application grows.
- Add authentication, caching, or background processing as required.
- Wire frontend components to real Prisma data once migrations are in place.

With these instructions and configurations, any engineer should be able to bootstrap the project,
understand the deployment topology, and launch production deployments to Vercel confidently.
# Backend Data Layer

This repository contains the backend data layer powered by Prisma and PostgreSQL. The project uses [Neon](https://neon.tech/) for managed Postgres in development and production environments.

## Prerequisites

- Node.js (version 18 or newer is recommended)
- npm
- A Neon (or compatible Postgres) connection string available as `DATABASE_URL`

## Getting Started

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Configure your environment:

   ```bash
   cp .env.example .env
   # Update DATABASE_URL with your Neon connection string
   ```

   A typical Neon connection string looks like:

   ```
   postgresql://<user>:<password>@<host>/<database>?sslmode=require
   ```

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

   This will generate the Prisma client and synchronise your database schema.

4. Seed the database with sample data:

   ```bash
   npm run prisma:seed
   ```

   The seed script inserts example users, queries, and forecasts to aid local development and testing.

## Prisma Tooling

The `backend/package.json` exposes the following convenience scripts:

- `npm run prisma:generate` – Generate the Prisma client based on the current schema.
- `npm run prisma:migrate` – Apply development migrations using `prisma migrate dev`.
- `npm run prisma:seed` – Execute the Prisma seed script (`prisma/seed.js`).

## Project Structure

```
backend/
  prisma/
    schema.prisma     # Prisma schema definition
    seed.js           # Seed script with sample data
  prismaClient.js     # Shared Prisma client singleton
  package.json        # Backend dependencies and scripts
```

With the environment variables set correctly, running `npx prisma migrate dev` followed by `npm run prisma:seed` will provision the database schema and populate it with demo data.
