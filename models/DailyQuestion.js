// models/DailyQuestion.js
const mongoose = require('mongoose');

const dailyQuestionSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  category: {
    type: String,
    required: true
  },
  questionId: {
    type: Number,
    required: true,
    ref: 'Question'
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Composite index for efficient queries
dailyQuestionSchema.index({ date: 1, category: 1, order: 1 });
dailyQuestionSchema.index({ date: 1, category: 1 });

// Composite unique index to prevent duplicates
dailyQuestionSchema.index({ date: 1, category: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('DailyQuestion', dailyQuestionSchema);