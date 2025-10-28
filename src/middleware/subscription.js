const flatten = (values) => {
  return values.reduce((accumulator, value) => {
    if (Array.isArray(value)) {
      accumulator.push(...value);
    } else if (value !== undefined && value !== null) {
      accumulator.push(value);
    }

    return accumulator;
  }, []);
};

const allowTiers = (...allowedTiers) => {
  const tiers = flatten(allowedTiers)
    .map((tier) => String(tier).trim())
    .filter(Boolean);

  if (!tiers.length) {
    throw new Error('allowTiers middleware requires at least one permitted tier');
  }

  const allowedSet = new Set(tiers);

  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedSet.has(user.tier)) {
      return res.status(403).json({
        error: 'Insufficient subscription tier',
        allowedTiers: Array.from(allowedSet),
      });
    }

    return next();
  };
};

module.exports = { allowTiers };
