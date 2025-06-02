// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nameEn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'quiz'
  },
  color: {
    type: String,
    default: '#2196F3'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);