# Auth Service

A lightweight Express-based authentication service backed by Prisma, bcrypt, and JWT. It exposes registration and login endpoints, along with middleware that can be composed to protect downstream routes and enforce subscription tiers.

## Prerequisites

- Node.js 18+
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
