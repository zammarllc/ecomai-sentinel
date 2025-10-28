const requireSubscription = (_req, _res, next) => {
  next();
};

module.exports = { requireSubscription };
