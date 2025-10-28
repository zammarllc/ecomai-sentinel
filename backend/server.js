require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const queryRoutes = require('./routes/queries');
const forecastRoutes = require('./routes/forecasts');
const dashboardRoutes = require('./routes/dashboard');
const { authenticate } = require('./middleware/authMiddleware');
const { requireSubscription } = require('./middleware/subscriptionMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/queries', authenticate, queryRoutes);
app.use('/forecasts', authenticate, forecastRoutes);
app.use('/dashboard', authenticate, requireSubscription, dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
