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
