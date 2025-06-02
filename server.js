const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const questionsRoutes = require('./routes/questions');
const categoriesRoutes = require('./routes/categories');
const statisticsRoutes = require('./routes/statistics');

app.use('/api/questions', questionsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/statistics', statisticsRoutes);

// Daily questions scheduler - runs at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Starting daily questions selection...');
  try {
    const { selectDailyQuestions } = require('./utils/dailyQuestions');
    await selectDailyQuestions();
    console.log('Daily questions selected successfully');
  } catch (error) {
    console.error('Error selecting daily questions:', error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Select daily questions on server start if none exist for today
      const { selectDailyQuestions } = require('./utils/dailyQuestions');
      selectDailyQuestions().catch(console.error);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));