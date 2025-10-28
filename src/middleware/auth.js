const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');

const getTokenFromHeader = (authorizationHeader = '') => {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return null;
  }

  return match[1].trim();
};

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    const token = getTokenFromHeader(header);

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ error: 'Authentication service misconfigured' });
    }

    const payload = jwt.verify(token, secret);

    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    req.token = token;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    return res.status(500).json({ error: 'Unable to authenticate request' });
  }
};

module.exports = { authenticate };
