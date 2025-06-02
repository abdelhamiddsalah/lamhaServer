// utils/dailyQuestions.js
const Question = require('../models/Question');
const DailyQuestion = require('../models/DailyQuestion');
const Category = require('../models/category');

// Select 10 random questions for each category daily
async function selectDailyQuestions() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    // Check if questions already selected for today
    const existingDailyQuestions = await DailyQuestion.findOne({ date: today });
    if (existingDailyQuestions) {
      console.log('Daily questions already selected for', today);
      return;
    }

    // Get all active categories
    const categories = await Category.find({ isActive: true });
    
    for (const category of categories) {
      // Get all questions for this category
      const allQuestions = await Question.find({ 
        category: category.name, 
        isActive: true 
      });

      if (allQuestions.length === 0) {
        console.log(`No questions found for category: ${category.name}`);
        continue;
      }

      // Select 10 random questions (or all if less than 10)
      const questionsToSelect = Math.min(10, allQuestions.length);
      const selectedQuestions = getRandomQuestions(allQuestions, questionsToSelect);

      // Save daily questions
      const dailyQuestions = selectedQuestions.map((question, index) => ({
        date: today,
        category: category.name,
        questionId: question.id,
        order: index + 1
      }));

      await DailyQuestion.insertMany(dailyQuestions);
      console.log(`Selected ${questionsToSelect} questions for category: ${category.name}`);
    }

    console.log('Daily questions selection completed for', today);
  } catch (error) {
    console.error('Error selecting daily questions:', error);
    throw error;
  }
}

// Fisher-Yates shuffle algorithm to get random questions
function getRandomQuestions(questions, count) {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// Get today's questions for a specific category
async function getTodayQuestions(category) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    const dailyQuestions = await DailyQuestion.find({
      date: today,
      category: category
    }).sort({ order: 1 });

    if (dailyQuestions.length === 0) {
      return [];
    }

    const questionIds = dailyQuestions.map(dq => dq.questionId);
    const questions = await Question.find({ id: { $in: questionIds } });

    // Sort questions according to daily question order
    const sortedQuestions = dailyQuestions.map(dq => 
      questions.find(q => q.id === dq.questionId)
    ).filter(q => q); // Remove any null values

    return sortedQuestions;
  } catch (error) {
    console.error('Error getting today questions:', error);
    throw error;
  }
}

module.exports = {
  selectDailyQuestions,
  getTodayQuestions,
  getRandomQuestions
};