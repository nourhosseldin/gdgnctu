# GDG Portal — Master PRD v3.0

منصة Google Developer Groups (GDG) الإلكترونية الشاملة لإدارة التراكات، السيزونات، الإيفنتات، الأعضاء، النقاط، والشهادات.

> ✅ **هذا المشروع يعمل بباك إند حقيقي (Express + MongoDB) وليس بيانات وهمية.** تسجيل الدخول يتحقق فعلياً من كلمة المرور، وكل الأزرار مربوطة بنقاط API حقيقية ويتم حفظ البيانات في قاعدة بيانات MongoDB.

## 🌐 رابط الموقع المنشور

- **Production:** https://gdgnctu.vercel.app

## 🏗️ البنية التقنية (MERN)

- **Frontend:** React 19 + Vite + Tailwind CSS (دعم كامل للعربية RTL).
- **Backend:** Node.js + Express (يعمل كـ **Vercel Serverless Function** في `api/index.js`).
- **Database:** MongoDB عبر **Mongoose**.
- **Auth:** bcrypt لتشفير كلمات المرور + JWT للجلسات + صلاحيات مبنية على الدور (RBAC).
- **Export:** تصدير Excel حقيقي (xlsx) + شهادة إتمام قابلة للطباعة (PDF عبر المتصفح).

## 📂 أين يعيش الباك إند؟

| المسار | الوصف |
|--------|-------|
| `api/index.js` | كل نقاط الـ API الحقيقية (auth, tracks, events, submissions, complaints, recruitment, users, exports, certificate). |
| `server/index.js` | تشغيل نفس الـ API محلياً على المنفذ 5000 (نفس الكود تماماً). |
| `client/src/api.js` | طبقة الاتصال بالـ API من الواجهة (fetch + JWT). |
| `client/src/App.jsx` | الواجهة الكاملة (Login/Register, Dashboard, Tracks, Calendar, Admin, Recruitment). |

## 🔌 نقاط الـ API

```
POST   /api/auth/register            إنشاء حساب (طالب فقط — الدور يُرقّى بواسطة الإدارة)
POST   /api/auth/login               تسجيل الدخول (يرفض البيانات الخاطئة 401)
GET    /api/auth/me                  بيانات المستخدم الحالي
GET    /api/leaderboard              لوحة المتصدرين
GET    /api/tracks                   قائمة التراكات
POST   /api/tracks                   إنشاء تراك            (موظفون)
POST   /api/tracks/:id/modules       إضافة وحدة            (موظفون)
GET    /api/events                   قائمة الإيفنتات
POST   /api/events                   إنشاء إيفنت            (موظفون)
POST   /api/events/:id/register      تسجيل حضور في إيفنت
GET    /api/submissions              كل التسليمات           (موظفون)
GET    /api/submissions/mine         تسليماتي
POST   /api/submissions              تسليم مهمة
PATCH  /api/submissions/:id          قبول/رفض تسليم (+نقاط) (موظفون)
POST   /api/complaints               إرسال شكوى (سرية)
GET    /api/complaints               قراءة الشكاوي          (قيادة)
POST   /api/recruitment              التقديم للانضمام
GET    /api/recruitment              قائمة المتقدمين        (موظفون)
PATCH  /api/recruitment/:id          تحديث حالة الطلب       (موظفون)
GET    /api/users                    قائمة الأعضاء          (موظفون)
PATCH  /api/users/:id/role           تغيير الدور            (قيادة)
PATCH  /api/users/:id/strike         إضافة إنذار            (قيادة)
GET    /api/stats                    إحصائيات عامة
GET    /api/seasons                  السيزونات
POST   /api/seasons                  إنشاء سيزون            (قيادة)
GET    /api/certificate              شهادة إتمام قابلة للطباعة
GET    /api/export/:type             تصدير Excel (users|submissions|recruitment)
```

## 🔑 بيانات الدخول من البذرة التلقائية (Seed)

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|-------------------|-------------|
| Super Admin | `admin@gdg.com` | `admin123` |

> عند أول تشغيل، يقوم الخادم تلقائياً بإنشاء حساب المدير + تراكات وإيفنتات وسيزون تجريبية.

## 🚀 خطوات النشر على Vercel (مطلوبة مرة واحدة)

الباك إند حقيقي ويحتاج **قاعدة بيانات MongoDB سحابية مجانية**. الخطوات:

1. اعمل حساب مجاني على [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. أنشئ **Cluster** مجاني (M0 Free).
3. من **Database Access** أنشئ مستخدم قاعدة بيانات (اسم + كلمة مرور) وتذكّرها.
4. من **Network Access** اضغط *Add IP Address* واختر **Allow access from anywhere** (`0.0.0.0/0`) — لأن Vercel بلا IP ثابت.
5. اضغط **Connect → Drivers** وانسخ رابط الاتصال، مثال:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/gdg_portal?retryWrites=true&w=majority
   ```
   (استبدل `USERNAME` و `PASSWORD` ببياناتك)
6. في **Vercel → مشروعك → Settings → Environment Variables** أضف:
   | الاسم | القيمة |
   |------|--------|
   | `MONGO_URI` | رابط الاتصال من الخطوة السابقة |
   | `JWT_SECRET` | أي نص عشوائي طويل (سرّي) |
7. اعمل **Redeploy** من Vercel (أو ادفع أي تعديل على `main`).

بعدها سيعمل الموقع بالكامل: دخول حقيقي، حفظ بيانات دائم، وكل الأزرار فعّالة.

## 💻 التشغيل المحلي

```bash
# 1) أنشئ ملف .env في جذر المشروع وضع فيه:
#    MONGO_URI=رابط_قاعدة_البيانات
#    JWT_SECRET=أي_نص_سري

# 2) تثبيت الحزم
npm install && cd client && npm install && cd ..

# 3) تشغيل الواجهة + الباك إند معاً
npm run dev
# الواجهة:  http://localhost:5173   (توجّه /api تلقائياً إلى المنفذ 5000)
# API:      http://localhost:5000
```

## ✨ الميزات

- **دخول/تسجيل حقيقي:** كلمة مرور خاطئة ⇒ خطأ واضح (401)، بدون دخول وهمي.
- **لوحة تحكم:** النقاط، المهام المكتملة، الترتيب، تقدم حسب التراك، لوحة المتصدرين.
- **مسار الدروس:** استعراض الوحدات والدروس، فتح الدرس، وتسليم الحل (رابط) ومتابعة حالته.
- **التقويم:** الإيفنتات والورش، وتفعيل التسجيل الفعلي (يرفع عدد الحضور ويُسجَّل في حسابك).
- **لوحة الإدارة:** مراجعة التسليمات (قبول/رفض يُضاف للنقاط)، المتقدمون، الشكاوي، إدارة الأعضاء (تغيير الدور/إنذار)، إنشاء إيفنت/تراك/وحدة، وتصدير Excel.
- **بوابة التقديم:** استمارة انضمام + شكاوي سرية.
- **الشهادات:** شهادة إتمام احترافية قابلة للطباعة/الحفظ كـ PDF.
- **تصميم متجاوب (Responsive):** يشتغل على الموبايل والتابلت والديسكتوب.

## 🛠️ النشر

- Frontend + API: **Vercel** (واجهة ثابتة + دوال Serverless من مجلد `api/`).
- Database: **MongoDB Atlas** (مجاني).
