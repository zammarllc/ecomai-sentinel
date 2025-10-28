const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../lib/prisma');

const router = express.Router();
const BCRYPT_ROUNDS = 10;

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const createToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error('JWT secret not configured');
    error.code = 'NO_JWT_SECRET';
    throw error;
  }

  return jwt.sign(
    {
      userId: user.id,
      tier: user.tier,
    },
    secret,
    { expiresIn: '1h' }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tier } = req.body ?? {};

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !rawPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);

    const normalizedTier = typeof tier === 'string' ? tier.trim() : tier;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name ? name.trim() : null,
        tier: normalizedTier || undefined,
      },
    });

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 'NO_JWT_SECRET') {
      return res.status(500).json({ error: 'Authentication service misconfigured' });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    return res.status(500).json({ error: 'Unable to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !rawPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const matches = await bcrypt.compare(rawPassword, user.password);

    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user);

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 'NO_JWT_SECRET') {
      return res.status(500).json({ error: 'Authentication service misconfigured' });
    }

    return res.status(500).json({ error: 'Unable to login user' });
  }
});

module.exports = router;
