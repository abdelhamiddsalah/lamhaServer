const mongoose = require('mongoose');
const Question = require('./models/Question');
const questionsData = require('./questions');
const dotenv = require('dotenv');

dotenv.config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    const today = new Date().toISOString().slice(0, 10);

    // إضافة correctAnswerIndex قبل الإدخال
    const questionsWithDate = questionsData.map(q => {
      const index = q.options.indexOf(q.correct_answer);
      if (index === -1) {
        throw new Error(`❌ الإجابة الصحيحة للسؤال '${q.question}' غير موجودة في الخيارات.`);
      }
      return {
        ...q,
        correctAnswerIndex: index,
        date: today
      };
    });

    // حذف الأسئلة القديمة لهذا اليوم (اختياري)
    await Question.deleteMany({ date: today });

    // إضافة البيانات
    await Question.insertMany(questionsWithDate);

    console.log('✅ Questions seeded successfully');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
