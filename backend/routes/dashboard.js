const express = require('express');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Dashboard route placeholder' });
});

module.exports = router;
