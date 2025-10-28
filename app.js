require('dotenv').config();

const express = require('express');
const { authenticate } = require('./middleware/auth');

const queriesRouter = require('./routes/queries');
const forecastsRouter = require('./routes/forecasts');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(authenticate);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/queries', queriesRouter);
app.use('/forecasts', forecastsRouter);
app.use('/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.status) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Unexpected server error.' });
});

module.exports = app;
