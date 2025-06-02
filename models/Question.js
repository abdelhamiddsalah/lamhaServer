// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'يجب أن يحتوي السؤال على 4 خيارات بالضبط'
    }
  },
  correct_answer: {
    type: String,
    required: true
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['سهل', 'متوسط', 'صعب'],
    default: 'متوسط'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate correctAnswerIndex
questionSchema.pre('save', function(next) {
  if (this.options && this.correct_answer) {
    this.correctAnswerIndex = this.options.indexOf(this.correct_answer);
    if (this.correctAnswerIndex === -1) {
      return next(new Error('الإجابة الصحيحة غير موجودة في الخيارات المتاحة'));
    }
  }
  next();
});

// Index for better performance
questionSchema.index({ category: 1, isActive: 1 });
questionSchema.index({ id: 1 });

module.exports = mongoose.model('Question', questionSchema);