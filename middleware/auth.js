function authenticate(req, res, next) {
  const userId = req.header('x-user-id');

  if (!userId) {
    return res.status(401).json({ error: 'Missing x-user-id header.' });
  }

  req.user = { id: userId };
  next();
}

module.exports = { authenticate };
