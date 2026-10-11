/**
 * GDG Portal — Real Backend API (Vercel Serverless Function)
 * Stack: Express + Mongoose (MongoDB) + JWT + bcrypt
 *
 * جميع المسارات تبدأ بـ /api/... ويتم توجيهها إلى هذه الدالة عبر vercel.json
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const XLSX = require('xlsx');

const JWT_SECRET = process.env.JWT_SECRET || 'gdg_portal_secret_change_me';
const STAFF = ['SuperAdmin', 'President', 'HR', 'TrackHead'];
const LEADERSHIP = ['SuperAdmin', 'President', 'HR'];

/* ------------------------------------------------------------------ */
/*  Mongoose schemas                                                   */
/* ------------------------------------------------------------------ */

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  video: { type: String, default: '' },
  duration: { type: String, default: '30 د' },
  points: { type: Number, default: 15 },
});
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema],
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SuperAdmin', 'President', 'HR', 'TrackHead', 'Student', 'CommitteeMember'], default: 'Student' },
  track: { type: String, default: 'Flutter' },
  season: { type: String, default: '2026-2027' },
  points: { type: Number, default: 0 },
  strikes: { type: Number, default: 0 },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  createdAt: { type: Date, default: Date.now },
});

const TrackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Technical', 'Non-Technical'], default: 'Technical' },
  description: { type: String, default: '' },
  icon: { type: String, default: '📘' },
  head: { type: String, default: 'GDG Team' },
  modules: [ModuleSchema],
  season: { type: String, default: '2026-2027' },
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  time: { type: String, default: '' },
  speaker: { type: String, default: 'GDG Team' },
  location: { type: String, default: 'Online' },
  type: { type: String, enum: ['Upcoming', 'Workshop', 'Past'], default: 'Upcoming' },
  seats: { type: Number, default: 100 },
  attendees: { type: Number, default: 0 },
});

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
  trackName: String,
  lessonId: { type: mongoose.Schema.Types.ObjectId },
  lessonTitle: String,
  link: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  points: { type: Number, default: 15 },
  submittedAt: { type: Date, default: Date.now },
});

const ComplaintSchema = new mongoose.Schema({
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const RecruitmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  track: { type: String, default: 'Flutter' },
  why: { type: String, default: '' },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Interviewed', 'Accepted', 'Rejected'], default: 'Applied' },
  appliedAt: { type: Date, default: Date.now },
});

const SeasonSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  stats: {
    members: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    trainingHours: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Track = mongoose.models.Track || mongoose.model('Track', TrackSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
const Recruitment = mongoose.models.Recruitment || mongoose.model('Recruitment', RecruitmentSchema);
const Season = mongoose.models.Season || mongoose.model('Season', SeasonSchema);

/* ------------------------------------------------------------------ */
/*  DB connection (cached across serverless invocations)               */
/* ------------------------------------------------------------------ */

let connPromise = null;
let seeded = false;

function connectDB() {
  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI_MISSING'));
  }
  if (!connPromise) {
    connPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, bufferCommands: false })
      .catch((err) => {
        connPromise = null;
        throw err;
      });
  }
  return connPromise;
}

async function ensureSeed() {
  if (seeded) return;
  const adminEmail = 'admin@gdg.com';
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({
      name: 'المدير العام',
      email: adminEmail,
      password: await bcrypt.hash('admin123', 10),
      role: 'SuperAdmin',
      track: 'All',
      points: 150,
    });
  }
  if ((await Track.countDocuments()) === 0) {
    await Track.create([
      {
        name: 'Flutter Development', type: 'Technical', icon: '📱', head: 'أحمد سمير',
        description: 'تطوير تطبيقات الموبايل متعددة المنصات باستخدام Flutter.',
        modules: [
          { title: 'الوحدة الأولى: أساسيات Dart', lessons: [
            { title: 'مقدمة في لغة Dart', video: 'https://youtube.com', duration: '45 د', points: 15 },
            { title: 'البرمجة الكائنية OOP', video: 'https://youtube.com', duration: '60 د', points: 20 },
          ]},
          { title: 'الوحدة الثانية: واجهات المستخدم', lessons: [
            { title: 'الـ Widgets الأساسية', video: 'https://youtube.com', duration: '50 د', points: 15 },
            { title: 'إدارة الحالة State Management', video: 'https://youtube.com', duration: '75 د', points: 25 },
          ]},
        ],
      },
      {
        name: 'Web Development', type: 'Technical', icon: '🌐', head: 'سارة خالد',
        description: 'بناء تطبيقات ويب حديثة باستخدام React.',
        modules: [
          { title: 'الوحدة الأولى: React', lessons: [
            { title: 'مكونات JSX', video: 'https://youtube.com', duration: '55 د', points: 15 },
            { title: 'الخطافات Hooks', video: 'https://youtube.com', duration: '65 د', points: 20 },
          ]},
        ],
      },
      {
        name: 'Cybersecurity', type: 'Technical', icon: '🛡️', head: 'محمود علي',
        description: 'أساسيات الأمن السيبراني وحماية الشبكات.',
        modules: [
          { title: 'الوحدة الأولى: الشبكات', lessons: [
            { title: 'أساسيات الشبكات', video: 'https://youtube.com', duration: '40 د', points: 15 },
          ]},
        ],
      },
    ]);
  }
  if ((await Event.countDocuments()) === 0) {
    await Event.create([
      { title: 'حفل افتتاح سيزون 2026', description: 'لقاء تعريفي بجميع التركات والأعضاء الجدد.', date: new Date('2026-10-20T19:00:00'), time: '7:00 م', speaker: 'مجلس إدارة GDG', location: 'قاعة المؤتمرات الرئيسية', type: 'Upcoming', seats: 120 },
      { title: 'ورشة Flutter عملية', description: 'ابنِ تطبيقك الأول باستخدام Flutter من الصفر.', date: new Date('2026-10-27T18:00:00'), time: '6:00 م', speaker: 'أحمد سمير', location: 'مبنى الكلية - قاعة 3', type: 'Workshop', seats: 60 },
      { title: 'هاكاثون الابتكار', description: 'منافسة تطوير حلول تقنية على مدار 48 ساعة.', date: new Date('2026-09-15T09:00:00'), time: '9:00 ص', speaker: 'GDG Team', location: 'حرم الجامعة', type: 'Past', seats: 150 },
    ]);
  }
  if ((await Season.countDocuments()) === 0) {
    await Season.create({ name: '2026-2027', active: true, stats: { members: 240, events: 36, completedTasks: 350, trainingHours: 320 } });
  }
  seeded = true;
}

/* ------------------------------------------------------------------ */
/*  App + middleware                                                   */
/* ------------------------------------------------------------------ */

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Route reconstruction:
//  - على Vercel: /api/(.*) -> /api?__path=auth/login
//  - محلياً: /api/auth/login -> /auth/login
app.use((req, _res, next) => {
  try {
    const url = new URL(req.url, 'http://internal');
    const p = url.searchParams.get('__path');
    if (p != null) {
      url.searchParams.delete('__path');
      const qs = url.searchParams.toString();
      req.url = '/' + p + (qs ? '?' + qs : '');
    } else if (req.url === '/api') {
      req.url = '/';
    } else if (req.url.startsWith('/api/')) {
      req.url = req.url.slice(4);
    }
  } catch (_) {}
  next();
});

// DB guard
app.use(async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await connectDB();
    await ensureSeed();
    next();
  } catch (err) {
    if (err.message === 'MONGO_URI_MISSING') {
      return res.status(503).json({ message: 'قاعدة البيانات غير مهيأة. أضف MONGO_URI في إعدادات Vercel.' });
    }
    console.error('DB error:', err.message);
    return res.status(503).json({ message: 'تعذّر الاتصال بقاعدة البيانات. حاول لاحقاً.' });
  }
});

const auth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'غير مصرح بالدخول' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'الجلسة منتهية' });
    req.user = user;
    next();
  } catch (_) {
    return res.status(401).json({ message: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً' });
  }
};
const staffOnly = (req, res, next) => (STAFF.includes(req.user.role) ? next() : res.status(403).json({ message: 'صلاحيات غير كافية' }));
const leaderOnly = (req, res, next) => (LEADERSHIP.includes(req.user.role) ? next() : res.status(403).json({ message: 'صلاحيات غير كافية' }));

const sign = (user) => jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, track: u.track, points: u.points, strikes: u.strikes, season: u.season, events: u.events });

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

app.get('/health', async (_req, res) => {
  try {
    await connectDB();
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
  } catch (e) {
    // نرجع تفاصيل الخطأ لتسهيل التشخيص
    res.status(503).json({
      ok: false,
      reason: e.message === 'MONGO_URI_MISSING' ? 'no_db_uri' : 'db_error',
      detail: String(e.message || '').slice(0, 300),
    });
  }
});

// ---- Auth ----
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, track } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'يرجى إكمال جميع الحقول المطلوبة' });
    if (password.length < 6) return res.status(400).json({ message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'هذا البريد الإلكتروني مسجل بالفعل' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), track: track || 'Flutter', role: 'Student' });
    res.status(201).json({ token: sign(user), user: safeUser(user) });
  } catch (e) {
    res.status(500).json({ message: 'تعذّر إنشاء الحساب، حاول مرة أخرى' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    res.json({ token: sign(user), user: safeUser(user) });
  } catch (e) {
    res.status(500).json({ message: 'تعذّر تسجيل الدخول، حاول مرة أخرى' });
  }
});

app.get('/auth/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));

// ---- Leaderboard ----
app.get('/leaderboard', auth, async (req, res) => {
  try {
    const filter = req.query.track && req.query.track !== 'All' ? { track: req.query.track } : {};
    const users = await User.find(filter).sort({ points: -1 }).limit(20).select('name points track role');
    res.json(users);
  } catch (e) { res.status(500).json({ message: 'تعذّر تحميل لوحة المتصدرين' }); }
});

// ---- Tracks ----
app.get('/tracks', auth, async (_req, res) => {
  try { res.json(await Track.find().sort({ createdAt: 1 })); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل التركات' }); }
});

app.post('/tracks', auth, staffOnly, async (req, res) => {
  try {
    const { name, type, description, icon } = req.body || {};
    if (!name) return res.status(400).json({ message: 'اسم التراك مطلوب' });
    const track = await Track.create({ name, type, description, icon });
    res.status(201).json(track);
  } catch (e) { res.status(500).json({ message: 'تعذّر إنشاء التراك' }); }
});

app.post('/tracks/:id/modules', auth, staffOnly, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'التراك غير موجود' });
    const { title, lessons } = req.body || {};
    if (!title) return res.status(400).json({ message: 'عنوان الوحدة مطلوب' });
    track.modules.push({ title, lessons: lessons || [] });
    await track.save();
    res.status(201).json(track);
  } catch (e) { res.status(500).json({ message: 'تعذّر إضافة الوحدة' }); }
});

// ---- Events ----
app.get('/events', auth, async (_req, res) => {
  try { res.json(await Event.find().sort({ date: 1 })); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل الإيفنتات' }); }
});

app.post('/events', auth, staffOnly, async (req, res) => {
  try {
    const ev = await Event.create(req.body || {});
    res.status(201).json(ev);
  } catch (e) { res.status(500).json({ message: 'تعذّر إنشاء الإيفنت' }); }
});

app.post('/events/:id/register', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'الإيفنت غير موجود' });
    if (!req.user.events.map(String).includes(String(ev._id))) {
      req.user.events.push(ev._id);
      await req.user.save();
      ev.attendees += 1;
      await ev.save();
    }
    res.json({ message: 'تم تسجيل حضورك بنجاح', event: ev, user: safeUser(req.user) });
  } catch (e) { res.status(500).json({ message: 'تعذّر التسجيل في الإيفنت' }); }
});

// ---- Submissions ----
app.get('/submissions', auth, staffOnly, async (_req, res) => {
  try {
    const subs = await Submission.find().populate('student', 'name email track').sort({ submittedAt: -1 });
    res.json(subs);
  } catch (e) { res.status(500).json({ message: 'تعذّر تحميل التسليمات' }); }
});

app.get('/submissions/mine', auth, async (req, res) => {
  try { res.json(await Submission.find({ student: req.user._id }).sort({ submittedAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل تسليماتك' }); }
});

app.post('/submissions', auth, async (req, res) => {
  try {
    const { trackId, lessonId, lessonTitle, trackName, link } = req.body || {};
    if (!link) return res.status(400).json({ message: 'رابط الحل مطلوب' });
    const sub = await Submission.create({ student: req.user._id, trackId, lessonId, lessonTitle, trackName, link });
    res.status(201).json(sub);
  } catch (e) { res.status(500).json({ message: 'تعذّر إرسال الحل' }); }
});

app.patch('/submissions/:id', auth, staffOnly, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) return res.status(400).json({ message: 'حالة غير صحيحة' });
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'التسليم غير موجود' });
    const wasApproved = sub.status === 'Approved';
    sub.status = status;
    await sub.save();
    if (status === 'Approved' && !wasApproved) {
      await User.findByIdAndUpdate(sub.student, { $inc: { points: sub.points || 15 } });
    }
    res.json(sub);
  } catch (e) { res.status(500).json({ message: 'تعذّر تحديث الحالة' }); }
});

// ---- Complaints (anonymous) ----
app.post('/complaints', auth, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || !message.trim()) return res.status(400).json({ message: 'الرسالة فارغة' });
    await Complaint.create({ message });
    res.status(201).json({ message: 'تم إرسال رسالتك بسرية تامة' });
  } catch (e) { res.status(500).json({ message: 'تعذّر إرسال الرسالة' }); }
});

app.get('/complaints', auth, leaderOnly, async (_req, res) => {
  try { res.json(await Complaint.find().sort({ submittedAt: -1 }).limit(100)); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل الشكاوي' }); }
});

// ---- Recruitment ----
app.post('/recruitment', async (req, res) => {
  try {
    const { fullName, email, phone, track, why } = req.body || {};
    if (!fullName || !email || !phone) return res.status(400).json({ message: 'يرجى إكمال الحقول المطلوبة' });
    await Recruitment.create({ fullName, email, phone, track, why });
    res.status(201).json({ message: 'تم تقديم طلبك بنجاح' });
  } catch (e) { res.status(500).json({ message: 'تعذّر إرسال الطلب' }); }
});

app.get('/recruitment', auth, staffOnly, async (_req, res) => {
  try { res.json(await Recruitment.find().sort({ appliedAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل المتقدمين' }); }
});

app.patch('/recruitment/:id', auth, staffOnly, async (req, res) => {
  try {
    const { status } = req.body || {};
    const r = await Recruitment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!r) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json(r);
  } catch (e) { res.status(500).json({ message: 'تعذّر تحديث الطلب' }); }
});

// ---- Members management ----
app.get('/users', auth, staffOnly, async (_req, res) => {
  try { res.json(await User.find().select('-password').sort({ points: -1 })); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل الأعضاء' }); }
});

app.patch('/users/:id/role', auth, leaderOnly, async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!['SuperAdmin', 'President', 'HR', 'TrackHead', 'Student', 'CommitteeMember'].includes(role)) {
      return res.status(400).json({ message: 'دور غير صحيح' });
    }
    const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!u) return res.status(404).json({ message: 'العضو غير موجود' });
    res.json(u);
  } catch (e) { res.status(500).json({ message: 'تعذّر تحديث الدور' }); }
});

app.patch('/users/:id/strike', auth, leaderOnly, async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { $inc: { strikes: 1 } }, { new: true }).select('-password');
    if (!u) return res.status(404).json({ message: 'العضو غير موجود' });
    res.json(u);
  } catch (e) { res.status(500).json({ message: 'تعذّر إضافة الإنذار' }); }
});

app.get('/me/points', auth, async (req, res) => res.json({ points: req.user.points, strikes: req.user.strikes, events: req.user.events }));

// ---- Stats (for dashboard/admin) ----
app.get('/stats', auth, async (_req, res) => {
  try {
    const [members, tracks, events, pending, complaints, applicants] = await Promise.all([
      User.countDocuments(),
      Track.countDocuments(),
      Event.countDocuments(),
      Submission.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments(),
      Recruitment.countDocuments(),
    ]);
    res.json({ members, tracks, events, pending, complaints, applicants });
  } catch (e) { res.status(500).json({ message: 'تعذّر تحميل الإحصائيات' }); }
});

// ---- Seasons ----
app.get('/seasons', auth, async (_req, res) => {
  try { res.json(await Season.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'تعذّر تحميل السيزونات' }); }
});

app.post('/seasons', auth, leaderOnly, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'اسم السيزون مطلوب' });
    const s = await Season.create({ name, stats: { members: await User.countDocuments(), events: await Event.countDocuments(), completedTasks: await Submission.countDocuments({ status: 'Approved' }), trainingHours: 0 } });
    res.status(201).json(s);
  } catch (e) { res.status(500).json({ message: 'تعذّر إنشاء السيزون' }); }
});

// ---- Certificate (printable HTML, renders Arabic correctly) ----
app.get('/certificate', auth, async (req, res) => {
  try {
    const u = req.user;
    const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>شهادة إتمام - ${u.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Cairo',sans-serif;background:#eef2f7;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .cert{position:relative;width:900px;max-width:100%;background:#fff;border-radius:24px;padding:56px;box-shadow:0 30px 80px -30px rgba(15,23,42,.35);border:1px solid #e2e8f0;overflow:hidden}
  .bar{position:absolute;inset:0 0 auto 0;height:14px;background:linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)}
  .badge{width:84px;height:84px;border-radius:24px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;margin:0 auto 18px}
  h1{font-size:34px;text-align:center;color:#0f172a}
  .sub{text-align:center;color:#64748b;font-weight:700;margin-top:8px}
  .name{text-align:center;font-size:44px;font-weight:900;margin:34px 0 6px;background:linear-gradient(120deg,#4f46e5,#7c3aed,#db2777);-webkit-background-clip:text;background-clip:text;color:transparent}
  .line{height:2px;width:200px;margin:14px auto;background:linear-gradient(90deg,transparent,#c7d2fe,transparent)}
  .body{text-align:center;font-size:18px;color:#334155;line-height:1.9;max-width:640px;margin:0 auto}
  .foot{display:flex;justify-content:space-between;margin-top:64px;gap:24px}
  .foot div{flex:1;text-align:center;border-top:2px dashed #cbd5e1;padding-top:10px;color:#64748b;font-weight:700}
  .print{margin:24px auto 0;display:block;text-align:center}
  .print button{font-family:inherit;cursor:pointer;border:0;border-radius:16px;background:linear-gradient(90deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;font-weight:900;font-size:15px}
  @media print{body{background:#fff;padding:0}.print{display:none}.cert{box-shadow:none;border-radius:0}}
</style></head>
<body><div>
  <div class="cert">
    <div class="bar"></div>
    <div class="badge">G</div>
    <h1>شهادة إتمام مسار تدريبي</h1>
    <p class="sub">Google Developer Groups — سيزون ${u.season}</p>
    <div class="name">${u.name}</div>
    <div class="line"></div>
    <p class="body">تشهد منصة GDG بأن المذكور/ة أعلاه قد أتم/ت بنجاح متطلبات مسار <strong>${u.track}</strong>، وأثبت/ت التزاماً واستحقاقاً خلال فترة التدريب.</p>
    <div class="foot">
      <div>رئيس النشاط</div>
      <div>مسؤول التدريب</div>
      <div>تاريخ الإصدار<br>${new Date().toLocaleDateString('ar-EG')}</div>
    </div>
  </div>
  <div class="print"><button onclick="window.print()">طباعة / حفظ PDF</button></div>
</div></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) { res.status(500).send('تعذّر توليد الشهادة'); }
});

// ---- Export (Excel) ----
app.get('/export/:type', auth, staffOnly, async (req, res) => {
  try {
    const { type } = req.params;
    let rows = [];
    let sheet = 'data';
    if (type === 'users') {
      const users = await User.find().select('name email role track points strikes');
      rows = users.map((u) => ({ الاسم: u.name, البريد: u.email, الدور: u.role, التراك: u.track, النقاط: u.points, الإنذارات: u.strikes }));
      sheet = 'الأعضاء';
    } else if (type === 'recruitment') {
      const list = await Recruitment.find();
      rows = list.map((r) => ({ الاسم: r.fullName, البريد: r.email, الهاتف: r.phone, التراك: r.track, الحالة: r.status }));
      sheet = 'المتقدمون';
    } else if (type === 'submissions') {
      const subs = await Submission.find().populate('student', 'name email');
      rows = subs.map((s) => ({ الطالب: s.student?.name || '', البريد: s.student?.email || '', التراك: s.trackName || '', الدرس: s.lessonTitle || '', الحالة: s.status, الرابط: s.link }));
      sheet = 'التسليمات';
    } else {
      return res.status(400).json({ message: 'نوع تصدير غير مدعوم' });
    }
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ لا_توجد_بيانات: true }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-export.xlsx"`);
    res.send(buf);
  } catch (e) { res.status(500).json({ message: 'تعذّر تصدير البيانات' }); }
});

// 404 for unknown API routes
app.use((_req, res) => res.status(404).json({ message: 'المسار غير موجود' }));

module.exports = app;
