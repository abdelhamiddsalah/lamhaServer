// routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const DailyQuestion = require('../models/DailyQuestion');
const { getTodayQuestions } = require('../utils/dailyQuestions');

// GET /api/questions/today?category=التاريخ
router.get('/today', async (req, res) => {
  try {
    const category = req.query.category;
    
    if (!category) {
      return res.status(400).json({ 
        error: 'يجب تحديد الفئة', 
        message: 'Category parameter is required' 
      });
    }

    const questions = await getTodayQuestions(category);
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        error: 'لا توجد أسئلة لهذه الفئة اليوم',
        message: 'No questions found for this category today'
      });
    }

    // Remove correct answer from response for security
    const questionsForClient = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      data: questionsForClient,
      count: questionsForClient.length,
      category: category,
      date: new Date().toISOString().slice(0, 10)
    });
  } catch (err) {
    console.error('Error fetching today questions:', err);
    res.status(500).json({ 
      error: 'خطأ في الخادم', 
      message: err.message 
    });
  }
});

// POST /api/questions/check - Check answer
router.post('/check', async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!questionId || selectedOption === undefined) {
      return res.status(400).json({
        error: 'بيانات غير مكتملة',
        message: 'Question ID and selected option are required'
      });
    }

    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      return res.status(404).json({
        error: 'السؤال غير موجود',
        message: 'Question not found'
      });
    }

    const isCorrect = selectedOption === question.correctAnswerIndex;
    
    res.json({
      success: true,
      isCorrect: isCorrect,
      correctAnswer: question.correct_answer,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation || null
    });
  } catch (err) {
    console.error('Error checking answer:', err);
    res.status(500).json({ 
      error: 'خطأ في الخادم', 
      message: err.message 
    });
  }
});

// GET /api/questions/category/:categoryName - Get all questions by category
router.get('/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const questions = await Question.find({ 
      category: categoryName, 
      isActive: true 
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Question.countDocuments({ 
      category: categoryName, 
      isActive: true 
    });

    res.json({
      success: true,
      data: questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuestions: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching questions by category:', err);
    res.status(500).json({ 
      error: 'خطأ في الخادم', 
      message: err.message 
    });
  }
});

// POST /api/questions - Add new question
router.post('/', async (req, res) => {
  try {
    const questionData = req.body;
    
    // Generate new ID if not provided
    if (!questionData.id) {
      const lastQuestion = await Question.findOne().sort({ id: -1 });
      questionData.id = lastQuestion ? lastQuestion.id + 1 : 1;
    }

    const newQuestion = new Question(questionData);
    await newQuestion.save();
    
    res.status(201).json({ 
      success: true,
      message: 'تمت إضافة السؤال بنجاح',
      data: newQuestion 
    });
  } catch (err) {
    console.error('Error adding question:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'رقم السؤال موجود مسبقاً',
        message: 'Question ID already exists'
      });
    }
    
    res.status(400).json({ 
      error: 'خطأ في البيانات المدخلة', 
      message: err.message 
    });
  }
});

// PUT /api/questions/:id - Update question
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedQuestion = await Question.findOneAndUpdate(
      { id: parseInt(id) },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        error: 'السؤال غير موجود',
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث السؤال بنجاح',
      data: updatedQuestion
    });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(400).json({ 
      error: 'خطأ في تحديث السؤال', 
      message: err.message 
    });
  }
});

// DELETE /api/questions/:id - Delete question (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedQuestion = await Question.findOneAndUpdate(
      { id: parseInt(id) },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedQuestion) {
      return res.status(404).json({
        error: 'السؤال غير موجود',
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف السؤال بنجاح'
    });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ 
      error: 'خطأ في حذف السؤال', 
      message: err.message 
    });
  }
});

module.exports = router;