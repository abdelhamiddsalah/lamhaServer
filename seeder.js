const mongoose = require('mongoose');
const Question = require('./models/Question'); // عدل حسب مسار الموديل
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // قراءة الملف JSON
    const questionsData = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));

    // التاريخ اليومي بصيغة YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    // أضف التاريخ تلقائياً لكل سؤال
    const questionsWithDate = questionsData.map(q => ({
      ...q,
      date: today,
    }));

    // احذف كل الأسئلة القديمة لو حابب (اختياري)
    await Question.deleteMany({ date: today }); // تمسح أسئلة اليوم لو موجودة

    // إدخال البيانات في الداتابيس
    await Question.insertMany(questionsWithDate);

    console.log('Questions seeded successfully');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
 