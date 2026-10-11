/**
 * تشغيل الـ API محلياً (نفس كود Vercel بالضبط)
 * يتطلب متغير MONGO_URI في ملف .env
 */
require('dotenv').config();
const app = require('../api/index');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GDG API تعمل على http://localhost:${PORT}`);
  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI غير موجود في .env — أضف رابط قاعدة بيانات MongoDB.');
  }
});
