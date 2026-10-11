import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, CalendarDays, ShieldCheck, Users, Award,
  AlertTriangle, LogOut, Mail, Lock, User as UserIcon, Search, Bell,
  TrendingUp, Flame, Trophy, Medal, CheckCircle2, Clock, PlayCircle,
  Download, Send, ClipboardList, ChevronDown, Sparkles, Zap, GraduationCap,
  MapPin, Star, Filter, X, Menu, Rocket, ExternalLink, Layers, BarChart3,
  ShieldAlert, Building2, Phone, Quote, ArrowUpRight, BadgeCheck, Target,
  CircleDot, Megaphone, HeartHandshake, Eye, Plus, PartyPopper
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ROLE_LABELS = {
  SuperAdmin: 'مدير عام',
  President: 'رئيس النشاط',
  HR: 'فريق الموارد البشرية',
  TrackHead: 'مسؤول التراك',
  Student: 'عضو / طالب',
  CommitteeMember: 'عضو لجنة',
};

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-fuchsia-500 to-purple-500',
];

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '؟';
  return parts.slice(0, 2).map((w) => w[0]).join('');
}

function gradientFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  UI primitives                                                      */
/* ------------------------------------------------------------------ */

function Avatar({ name, size = 40, ring = false }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`shrink-0 rounded-2xl bg-gradient-to-br ${gradientFor(name)} text-white font-bold flex items-center justify-center shadow-soft ${ring ? 'ring-2 ring-white' : ''}`}
    >
      {initials(name)}
    </div>
  );
}

function Badge({ children, tone = 'slate', className = '' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

function ProgressBar({ value = 0, tone = 'indigo', height = 8 }) {
  const tones = {
    indigo: 'from-indigo-500 to-violet-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  };
  return (
    <div className="w-full rounded-full bg-slate-100 overflow-hidden" style={{ height }}>
      <div
        className={`h-full rounded-full bg-gradient-to-l ${tones[tone]} transition-all duration-1000`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = 'indigo', delay = 0 }) {
  const tones = {
    indigo: { grad: 'from-indigo-500 to-violet-600', soft: 'bg-indigo-50 text-indigo-600', glow: 'shadow-glow' },
    emerald: { grad: 'from-emerald-500 to-teal-600', soft: 'bg-emerald-50 text-emerald-600', glow: 'shadow-glow-emerald' },
    amber: { grad: 'from-amber-400 to-orange-500', soft: 'bg-amber-50 text-amber-600', glow: '' },
    rose: { grad: 'from-rose-500 to-pink-600', soft: 'bg-rose-50 text-rose-600', glow: '' },
    sky: { grad: 'from-sky-500 to-cyan-500', soft: 'bg-sky-50 text-sky-600', glow: '' },
  };
  const t = tones[tone] || tones.indigo;
  return (
    <div
      className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-card border border-slate-100 animate-fadeInUp hover:-translate-y-1 transition-transform duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.06] blur-2xl group-hover:opacity-[0.14] transition-opacity"
        style={{ backgroundImage: 'linear-gradient(135deg,#6366f1,#a855f7)' }} />
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${t.grad} text-white shadow-soft`}>
          <Icon size={22} />
        </div>
        {hint && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function Toasts({ toasts }) {
  const tones = {
    success: 'from-emerald-500 to-teal-600',
    error: 'from-rose-500 to-red-600',
    info: 'from-indigo-500 to-violet-600',
  };
  const icons = { success: CheckCircle2, error: AlertTriangle, info: Sparkles };
  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Sparkles;
        return (
          <div
            key={t.id}
            className="animate-scaleIn flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card border border-slate-100 min-w-[260px] max-w-sm"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tones[t.type] || tones.info} text-white`}>
              <Icon size={18} />
            </span>
            <p className="text-sm font-semibold text-slate-700 leading-snug">{t.msg}</p>
          </div>
        );
      })}
    </div>
  );
}

function Logo({ size = 'md' }) {
  const s = size === 'lg' ? 'text-4xl' : 'text-2xl';
  return (
    <span className={`font-extrabold tracking-tight ${s} select-none`}>
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">D</span>
      <span className="text-[#FBBC05]">G</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const TRACKS = [
  {
    id: 't1',
    name: 'Flutter Development',
    type: 'Technical',
    icon: '📱',
    progress: 64,
    head: 'أحمد سمير',
    modules: [
      {
        title: 'الوحدة الأولى: أساسيات Dart',
        lessons: [
          { id: 'l1', title: 'مقدمة في لغة Dart', duration: '45 د', video: 'https://youtube.com' },
          { id: 'l2', title: 'البرمجة الكائنية OOP', duration: '60 د', video: 'https://youtube.com' },
        ],
      },
      {
        title: 'الوحدة الثانية: واجهات المستخدم',
        lessons: [
          { id: 'l3', title: 'الـ Widgets الأساسية', duration: '50 د', video: 'https://youtube.com' },
          { id: 'l4', title: 'إدارة الحالة State Management', duration: '75 د', video: 'https://youtube.com' },
        ],
      },
    ],
  },
  {
    id: 't2',
    name: 'Web Development',
    type: 'Technical',
    icon: '🌐',
    progress: 38,
    head: 'سارة خالد',
    modules: [
      {
        title: 'الوحدة الأولى: React',
        lessons: [
          { id: 'l5', title: 'مكونات JSX', duration: '55 د', video: 'https://youtube.com' },
          { id: 'l6', title: 'الخطافات Hooks', duration: '65 د', video: 'https://youtube.com' },
        ],
      },
    ],
  },
  {
    id: 't3',
    name: 'Cybersecurity',
    type: 'Technical',
    icon: '🛡️',
    progress: 20,
    head: 'محمود علي',
    modules: [
      {
        title: 'الوحدة الأولى: الشبكات',
        lessons: [{ id: 'l7', title: 'أساسيات الشبكات', duration: '40 د', video: 'https://youtube.com' }],
      },
    ],
  },
];

const EVENTS = [
  { id: 'e1', title: 'حفل افتتاح سيزون 2026', desc: 'لقاء تعريفي بجميع التركات والأعضاء الجدد.', type: 'Upcoming', date: '2026-10-20', time: '7:00 م', speaker: 'مجلس إدارة GDG', location: 'قاعة المؤتمرات الرئيسية', seats: 120 },
  { id: 'e2', title: 'ورشة Flutter عملية', desc: 'ابنِ تطبيقك الأول باستخدام Flutter من الصفر.', type: 'Workshop', date: '2026-10-27', time: '6:00 م', speaker: 'أحمد سمير', location: 'مبنى الكلية - قاعة 3', seats: 60 },
  { id: 'e3', title: 'جلسة UI/UX Design', desc: 'مبادئ تصميم تجربة المستخدم الحديثة.', type: 'Upcoming', date: '2026-11-03', time: '5:30 م', speaker: 'نور هاني', location: 'أونلاين - Google Meet', seats: 200 },
  { id: 'e4', title: 'هاكاثون الابتكار', desc: 'منافسة تطوير حلول تقنية على مدار 48 ساعة.', type: 'Past', date: '2026-09-15', time: '9:00 ص', speaker: 'GDG Team', location: 'حرم الجامعة', seats: 150 },
];

const LEADERBOARD = [
  { name: 'أحمد سمير', track: 'Flutter', points: 480 },
  { name: 'سارة خالد', track: 'Web', points: 435 },
  { name: 'نور هاني', track: 'UI/UX', points: 410 },
  { name: 'محمود علي', track: 'Cyber', points: 365 },
  { name: 'ياسمين فؤاد', track: 'Flutter', points: 330 },
  { name: 'عمر طارق', track: 'Embedded', points: 295 },
];

const INITIAL_SUBMISSIONS = [
  { id: 's1', student: 'محمد أحمد', email: 'mohamed@gdg.com', track: 'Flutter', lesson: 'مقدمة في لغة Dart', link: 'https://github.com/mohamed/task1', status: 'Pending', date: '2026-10-09' },
  { id: 's2', student: 'ياسمين فؤاد', email: 'yasmin@gdg.com', track: 'Web', lesson: 'مكونات JSX', link: 'https://github.com/yasmin/react-task', status: 'Pending', date: '2026-10-10' },
  { id: 's3', student: 'عمر طارق', email: 'omar@gdg.com', track: 'Cyber', lesson: 'أساسيات الشبكات', link: 'https://drive.google.com/omar', status: 'Approved', date: '2026-10-08' },
];

const INITIAL_COMPLAINTS = [
  { id: 'c1', message: 'أقترح تخصيص يوم إضافي للورش العملية بدلاً من يوم واحد فقط.', date: '2026-10-09' },
  { id: 'c2', message: 'نحتاج توفير محتوى مسجل حتى نتمكن من المراجعة في أي وقت.', date: '2026-10-07' },
];

const INITIAL_APPLICANTS = [
  { id: 'a1', name: 'خالد إبراهيم', email: 'khaled@gmail.com', phone: '010xxxxxxx', track: 'Flutter', status: 'Applied' },
  { id: 'a2', name: 'منة الله حسن', email: 'menna@gmail.com', phone: '011xxxxxxx', track: 'UI/UX', status: 'Shortlisted' },
];

/* ------------------------------------------------------------------ */
/*  Login screen                                                       */
/* ------------------------------------------------------------------ */

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', track: 'Flutter', role: 'Student' });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    const isAdmin = form.email.trim().toLowerCase() === 'admin@gdg.com';
    const role = isAdmin ? 'SuperAdmin' : form.role;
    const name = form.name.trim() || (isAdmin ? 'المدير العام' : form.email.split('@')[0]);
    onLogin({
      id: 'usr_' + Date.now(),
      name,
      email: form.email.trim(),
      role,
      track: isAdmin ? 'All' : form.track,
      points: isAdmin ? 150 : 60,
      strikes: 0,
      joined: '2026-09-01',
    });
  };

  const field = 'w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-11 pl-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100';

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-indigo-600/40 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-8rem] left-[-6rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/30 blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/3 h-[22rem] w-[22rem] rounded-full bg-cyan-500/20 blur-[120px] animate-blob" style={{ animationDelay: '6s' }} />
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:items-stretch lg:justify-between">
        {/* Brand / hero side */}
        <div className="flex max-w-lg flex-col justify-center animate-fadeInUp">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Logo size="md" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">بوابة أعضاء GDG</p>
              <p className="text-xs font-semibold text-indigo-200/80">Master PRD v3.0</p>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.25] text-white sm:text-5xl">
            منصة <span className="text-gradient">Google Developer Groups</span> المتكاملة
          </h1>
          <p className="mt-5 text-base leading-relaxed text-indigo-100/80">
            إدارة التراكات، السيزونات، الإيفنتات، الأعضاء، النقاط والشهادات — كل ذلك في مكان واحد بتجربة عصرية وسلسة.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Layers, label: 'تراكات', value: '8+' },
              { icon: Users, label: 'أعضاء', value: '240' },
              { icon: CalendarDays, label: 'إيفنتات', value: '36' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <s.icon size={20} className="text-indigo-300" />
                <p className="mt-2 text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs font-semibold text-indigo-200/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md animate-scaleIn">
          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {mode === 'login' ? 'مرحباً بعودتك 👋 سعداء برؤيتك مجدداً' : 'انضم إلى فريق GDG وابدأ رحلتك التقنية'}
              </p>
            </div>

            {/* segmented control */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
              {[
                { key: 'login', label: 'دخول' },
                { key: 'register', label: 'حساب جديد' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setMode(tab.key); setError(''); }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${mode === tab.key ? 'bg-white text-indigo-600 shadow-soft' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative animate-fadeIn">
                  <UserIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={field} placeholder="الاسم الكامل" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              )}

              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={field} placeholder="البريد الإلكتروني" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className={field} placeholder="كلمة المرور" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div className="relative">
                    <select className={field + ' appearance-none pl-4'} value={form.track}
                      onChange={(e) => setForm({ ...form, track: e.target.value })}>
                      {['Flutter', 'Web', 'Cyber', 'UI/UX', 'Embedded', 'HR'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <div className="relative">
                    <select className={field + ' appearance-none pl-4'} value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      {['Student', 'TrackHead', 'HR', 'SuperAdmin'].map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-3.5 text-sm font-extrabold text-white shadow-glow transition hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99]"
              >
                <Rocket size={18} className="transition group-hover:-translate-y-0.5" />
                {mode === 'login' ? 'دخول إلى المنصة' : 'إنشاء الحساب'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <BadgeCheck size={18} className="shrink-0 text-indigo-500" />
              <p className="text-xs font-semibold leading-relaxed text-slate-500">
                للتجربة كمدير عام استخدم <span className="font-extrabold text-slate-700">admin@gdg.com</span> مع أي كلمة مرور.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar + shell                                                    */
/* ------------------------------------------------------------------ */

const NAV = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { key: 'tracks', label: 'مسار الدروس', icon: BookOpen },
  { key: 'calendar', label: 'التقويم والإيفنتات', icon: CalendarDays },
  { key: 'admin', label: 'لوحة الإدارة', icon: ShieldCheck, roles: ['SuperAdmin', 'President', 'HR', 'TrackHead'] },
  { key: 'recruitment', label: 'التقديم والشكاوي', icon: Users },
];

function Sidebar({ user, view, onNavigate, onLogout, open, onClose }) {
  const items = NAV.filter((n) => !n.roles || n.roles.includes(user.role));
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-slate-200 bg-white p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-1 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
              <span className="text-lg font-extrabold text-white">G</span>
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 leading-tight">بوابة GDG</p>
              <p className="text-[11px] font-semibold text-slate-400">Google Developer Groups</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">القائمة الرئيسية</p>
          {items.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); onClose(); }}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                  active
                    ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-glow'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                  <item.icon size={18} />
                </span>
                {item.label}
                {active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-glow">
            <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <Sparkles size={20} className="mb-2 text-white/90" />
            <p className="text-sm font-extrabold leading-snug">أكمل مسارك واحصل على شهادتك 🎓</p>
            <p className="mt-1 text-xs font-semibold text-white/80">تتبّع تقدمك في التراك تلقائياً.</p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-3">
            <Avatar name={user.name} size={44} ring />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-slate-800">{user.name}</p>
              <p className="truncate text-[11px] font-bold text-slate-400">{ROLE_LABELS[user.role]} · {user.track}</p>
            </div>
            <button onClick={onLogout} title="تسجيل الخروج" className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Topbar                                                             */
/* ------------------------------------------------------------------ */

function Topbar({ title, subtitle, user, onMenu }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-soft lg:hidden">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h1>
          <p className="text-xs font-semibold text-slate-400 sm:text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="ابحث عن درس، عضو، إيفنت..."
            className="w-64 rounded-2xl border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        <button className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-soft transition hover:text-indigo-600">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pr-1.5 pl-3 shadow-soft sm:flex">
          <Avatar name={user.name} size={36} />
          <div className="leading-tight">
            <p className="text-xs font-extrabold text-slate-800">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-400">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Views                                                              */
/* ------------------------------------------------------------------ */

function DashboardView({ user, notify }) {
  const [range, setRange] = useState('week');
  const activity = useMemo(() => {
    const sets = {
      week: [40, 65, 52, 80, 70, 95, 60],
      month: [55, 70, 48, 85, 60, 78, 90],
    };
    return sets[range];
  }, [range]);
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const max = Math.max(...activity);
  const rank = LEADERBOARD.findIndex((l) => l.name === user.name) + 1 || 4;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-7 text-white shadow-glow animate-fadeInUp sm:p-9">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-24 -top-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl animate-floaty" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Badge tone="indigo" className="!bg-white/15 !text-white">
              <Sparkles size={12} /> سيزون 2026 / 2027 نشط الآن
            </Badge>
            <h2 className="mt-4 text-3xl font-extrabold leading-snug sm:text-4xl">
              أهلاً بك، {user.name.split(' ')[0]} 👋
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-indigo-100/90 sm:text-base">
              جاهز تكمل رحلتك النهاردة؟ عندك دروس مستنية، وإيفنتات قادمة في انتظارك.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => notify('تم فتح مسار الدروس', 'info')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 shadow-lg transition hover:-translate-y-0.5">
                <PlayCircle size={18} /> أكمل التعلم
              </button>
              <button onClick={() => notify('تم تحميل الشهادة بنجاح 🎓')} className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25">
                <Download size={18} /> تحميل الشهادة
              </button>
            </div>
          </div>
          <div className="relative hidden shrink-0 lg:block">
            <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <div className="text-center">
                <p className="text-4xl font-extrabold">{user.points}</p>
                <p className="text-xs font-bold text-indigo-100">نقطة هذا السيزون</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Trophy} label="مجموع النقاط" value={user.points} hint="+40 هذا الأسبوع" tone="indigo" delay={0} />
        <StatCard icon={Medal} label="ترتيبك" value={`#${rank}`} hint="من 240 عضو" tone="amber" delay={80} />
        <StatCard icon={Flame} label="سلسلة الإنجاز" value="12 يوم" hint="مستمر 🔥" tone="rose" delay={160} />
        <StatCard icon={AlertTriangle} label="الإنذارات" value={user.strikes} hint={user.strikes === 0 ? 'سجل نظيف' : 'تحتاج مراجعة'} tone="emerald" delay={240} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Activity chart */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card animate-fadeInUp xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <BarChart3 size={20} className="text-indigo-500" /> نشاطك التعليمي
              </h3>
              <p className="text-xs font-semibold text-slate-400">عدد الدروس والدقائق المنجزة خلال الأسبوع</p>
            </div>
            <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
              {[{ k: 'week', l: 'أسبوع' }, { k: 'month', l: 'شهر' }].map((r) => (
                <button key={r.k} onClick={() => setRange(r.k)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${range === r.k ? 'bg-white text-indigo-600 shadow-soft' : 'text-slate-500'}`}>
                  {r.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-52 items-end justify-between gap-3">
            {activity.map((v, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <span className="absolute -top-1 opacity-0 transition group-hover:opacity-100 rounded-lg bg-ink-900 px-2 py-0.5 text-[10px] font-bold text-white">
                    {v}%
                  </span>
                  <div
                    className="w-full max-w-[42px] origin-bottom rounded-t-2xl bg-gradient-to-t from-indigo-500 to-violet-400 transition-all duration-500 group-hover:from-indigo-600 group-hover:to-fuchsia-500 animate-growBar"
                    style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * 70}ms` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-400">{days[i]}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
            {[
              { icon: BookOpen, label: 'دروس مكتملة', value: '18', tone: 'text-indigo-500' },
              { icon: Clock, label: 'ساعات التعلم', value: '24س', tone: 'text-emerald-500' },
              { icon: Target, label: 'معدل الإنجاز', value: '72%', tone: 'text-amber-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <s.icon size={20} className={s.tone} />
                <div>
                  <p className="text-lg font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-[11px] font-bold text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card animate-fadeInUp">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <Trophy size={20} className="text-amber-500" /> لوحة المتصدرين
            </h3>
            <Badge tone="amber">Top 6</Badge>
          </div>
          <div className="space-y-2">
            {LEADERBOARD.map((item, i) => (
              <div key={item.name}
                className={`flex items-center gap-3 rounded-2xl p-2.5 transition ${i < 3 ? 'bg-gradient-to-l from-amber-50/70 to-transparent' : 'hover:bg-slate-50'}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                  i === 0 ? 'bg-amber-400 text-white shadow-soft'
                  : i === 1 ? 'bg-slate-300 text-white'
                  : i === 2 ? 'bg-orange-400 text-white'
                  : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </span>
                <Avatar name={item.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-800">{item.name}</p>
                  <p className="text-[11px] font-bold text-slate-400">{item.track}</p>
                </div>
                <span className="text-sm font-extrabold text-indigo-600">{item.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate banner */}
      <div className="flex flex-col items-center justify-between gap-5 overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-l from-emerald-50 to-teal-50 p-7 sm:flex-row">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-emerald">
            <GraduationCap size={30} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">شهادة إتمام التراك</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              أكمل 100% من دروس التراك لتحصل على شهادتك المعتمدة من GDG.
            </p>
            <div className="mt-3 w-64 max-w-full">
              <ProgressBar value={72} tone="emerald" />
              <p className="mt-1 text-[11px] font-bold text-emerald-600">72% مكتمل</p>
            </div>
          </div>
        </div>
        <button onClick={() => notify('تم توليد الشهادة وتنزيلها 🎉')}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-glow-emerald transition hover:-translate-y-0.5">
          <Download size={18} /> تنزيل الشهادة PDF
        </button>
      </div>
    </div>
  );
}

function TracksView({ notify, user }) {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [link, setLink] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!selectedTrack || !selectedLesson || !link.trim()) {
      notify('حدّد التراك والدرس وأدخل رابط الحل', 'error');
      return;
    }
    notify('تم إرسال الحل بنجاح وسيراجعه مسؤول التراك ✅');
    setLink('');
    setSelectedLesson(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {TRACKS.map((track, idx) => (
          <div key={track.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card animate-fadeInUp" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15">{track.icon}</span>
                  <div>
                    <h3 className="text-lg font-extrabold">{track.name}</h3>
                    <p className="text-[11px] font-bold text-slate-300">مسؤول التراك: {track.head}</p>
                  </div>
                </div>
                <Badge tone={track.type === 'Technical' ? 'indigo' : 'violet'} className="!bg-white/15 !text-white">
                  {track.type === 'Technical' ? 'تقني' : 'غير تقني'}
                </Badge>
              </div>
              <div className="relative mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>التقدم</span><span>{track.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-l from-indigo-400 to-fuchsia-400 transition-all duration-1000" style={{ width: `${track.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {track.modules.map((mod, mi) => (
                <div key={mi}>
                  <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-700">
                    <Layers size={15} className="text-indigo-500" /> {mod.title}
                  </p>
                  <div className="space-y-2">
                    {mod.lessons.map((les) => {
                      const active = selectedLesson === les.id && selectedTrack === track.id;
                      return (
                        <div key={les.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${active ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-soft'}`}>
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500 shadow-soft'}`}>
                            <PlayCircle size={17} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-700">{les.title}</p>
                            <p className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                              <Clock size={11} /> {les.duration}
                            </p>
                          </div>
                          <button
                            onClick={() => { setSelectedTrack(track.id); setSelectedLesson(les.id); }}
                            className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-extrabold transition ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300'}`}
                          >
                            {active ? 'محدد ✓' : 'تسليم'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTrack && selectedLesson && (
        <div className="animate-fadeInUp rounded-3xl border border-indigo-100 bg-white p-6 shadow-card">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <ClipboardList size={20} className="text-indigo-500" /> تسليم التاسك
          </h3>
          <p className="mb-4 text-sm font-semibold text-slate-400">
            ألصق رابط الحل (GitHub / Google Drive / Vercel) وسيقوم مسؤول التراك بمراجعته.
          </p>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://github.com/username/task"
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-3 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5">
              <Send size={17} /> إرسال الحل
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function CalendarView({ notify }) {
  const [filter, setFilter] = useState('All');
  const filters = [
    { k: 'All', l: 'الكل' },
    { k: 'Upcoming', l: 'قادم' },
    { k: 'Workshop', l: 'ورش عمل' },
    { k: 'Past', l: 'سابق' },
  ];
  const list = EVENTS.filter((e) => filter === 'All' || e.type === filter || (filter === 'Upcoming' && e.type === 'Upcoming'));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 text-sm font-extrabold text-slate-500"><Filter size={16} /> تصفية:</span>
        {filters.map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition ${filter === f.k ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-glow' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-indigo-300'}`}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((ev, idx) => {
          const isPast = ev.type === 'Past';
          return (
            <div key={ev.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: `${idx * 70}ms` }}>
              <div className={`relative h-28 bg-gradient-to-br ${isPast ? 'from-slate-500 to-slate-700' : 'from-indigo-500 via-violet-600 to-fuchsia-500'} p-5 text-white`}>
                <div className="absolute inset-0 grid-pattern opacity-25" />
                <div className="relative flex items-start justify-between">
                  <Badge className="!bg-white/20 !text-white">
                    {ev.type === 'Workshop' ? 'ورشة عمل' : ev.type === 'Past' ? 'انتهى' : 'قادم'}
                  </Badge>
                  <div className="rounded-2xl bg-white/15 px-3 py-1.5 text-center ring-1 ring-white/20 backdrop-blur">
                    <p className="text-lg font-extrabold leading-none">{new Date(ev.date).getDate()}</p>
                    <p className="text-[10px] font-bold">{new Date(ev.date).toLocaleDateString('ar-EG', { month: 'short' })}</p>
                  </div>
                </div>
                <h3 className="relative mt-3 text-lg font-extrabold">{ev.title}</h3>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm font-semibold leading-relaxed text-slate-500">{ev.desc}</p>
                <div className="mt-4 space-y-2 text-xs font-bold text-slate-500">
                  <p className="flex items-center gap-2"><UserIcon size={14} className="text-indigo-500" /> {ev.speaker}</p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-rose-500" /> {ev.location}</p>
                  <p className="flex items-center gap-2"><Clock size={14} className="text-emerald-500" /> {ev.time} · {formatDate(ev.date)}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                    <Users size={13} /> {ev.seats} مقعد
                  </span>
                  {isPast ? (
                    <span className="text-xs font-bold text-slate-400">انتهى الحدث</span>
                  ) : (
                    <button onClick={() => notify(`تم تسجيلك في: ${ev.title} 🎉`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 px-4 py-2 text-xs font-extrabold text-white shadow-glow transition hover:-translate-y-0.5">
                      سجّل الآن <ArrowUpRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminView({ notify }) {
  const [subs, setSubs] = useState(INITIAL_SUBMISSIONS);
  const [complaints] = useState(INITIAL_COMPLAINTS);

  const setStatus = (id, status) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    notify(status === 'Approved' ? 'تم قبول التاسك وإضافة +15 نقطة للعضو ✅' : 'تم رفض التاسك', status === 'Approved' ? 'success' : 'error');
  };

  const pending = subs.filter((s) => s.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="تاسكات للمراجعة" value={pending} tone="amber" hint="تحتاج إجراء" />
        <StatCard icon={Users} label="إجمالي الأعضاء" value="240" tone="indigo" hint="+12 هذا الشهر" />
        <StatCard icon={MessageSquareIcon} label="شكاوي جديدة" value={complaints.length} tone="rose" hint="سرية" />
        <StatCard icon={CalendarDays} label="إيفنتات قادمة" value="3" tone="emerald" hint="هذا الشهر" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => notify('تم تصدير بيانات المستخدمين (Excel) 📊')}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 px-5 py-3 text-sm font-extrabold text-white shadow-glow-emerald transition hover:-translate-y-0.5">
          <Download size={17} /> تصدير الأعضاء (Excel)
        </button>
        <button onClick={() => notify('تم تصدير بيانات المتقدمين (Excel) 📊')}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 px-5 py-3 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5">
          <Download size={17} /> تصدير المتقدمين
        </button>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <ClipboardList size={20} className="text-indigo-500" /> مراجعة تسليمات التاسكات
        </h3>
        <div className="space-y-3">
          {subs.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={s.student} size={44} />
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{s.student}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{s.track} · {s.lesson}</p>
                  <a href={s.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline">
                    <ExternalLink size={11} /> {s.link}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.status === 'Pending' ? (
                  <>
                    <button onClick={() => setStatus(s.id, 'Approved')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 px-4 py-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5">
                      <CheckCircle2 size={14} /> قبول
                    </button>
                    <button onClick={() => setStatus(s.id, 'Rejected')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50">
                      <X size={14} /> رفض
                    </button>
                  </>
                ) : (
                  <Badge tone={s.status === 'Approved' ? 'emerald' : 'rose'}>
                    {s.status === 'Approved' ? <><CheckCircle2 size={12} /> مقبول</> : <><X size={12} /> مرفوض</>}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <ShieldAlert size={20} className="text-rose-500" /> صندوق الشكاوي والاقتراحات السرية
        </h3>
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <Quote size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold leading-relaxed text-slate-700">{c.message}</p>
                <p className="mt-1.5 text-[11px] font-bold text-slate-400">مرسل anonymously · {formatDate(c.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// small alias so icon import list stays tidy
function MessageSquareIcon(props) {
  return <ShieldAlert {...props} />;
}

function RecruitmentView({ notify }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', track: 'Flutter', why: '' });
  const [msg, setMsg] = useState('');
  const [applicants] = useState(INITIAL_APPLICANTS);

  const input = 'w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100';

  const submitApp = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone) { notify('يرجى إكمال الحقول المطلوبة', 'error'); return; }
    notify('تم تقديم طلبك بنجاح! سيتم التواصل معك قريباً 🎉');
    setForm({ fullName: '', email: '', phone: '', track: 'Flutter', why: '' });
  };

  const submitMsg = (e) => {
    e.preventDefault();
    if (!msg.trim()) { notify('اكتب رسالتك أولاً', 'error'); return; }
    notify('تم إرسال رسالتك بسرية تامة 🔒', 'info');
    setMsg('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card xl:col-span-2">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow">
            <HeartHandshake size={22} />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">استمارة الانضمام لفريق GDG</h3>
            <p className="text-xs font-semibold text-slate-400">قدّم الآن وانضم لرحلة تقنية ملهمة</p>
          </div>
        </div>
        <form onSubmit={submitApp} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input className={input} placeholder="الاسم الكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className={input} placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="relative">
            <select className={input + ' appearance-none'} value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
              {['Flutter', 'Web', 'Cyber', 'UI/UX', 'Embedded', 'HR'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <textarea rows={3} className={input + ' sm:col-span-2'} placeholder="لماذا تريد الانضمام إلينا؟" value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5 sm:col-span-2">
            <Rocket size={18} /> إرسال الطلب
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-soft">
              <ShieldAlert size={22} />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">صندوق سري</h3>
              <p className="text-xs font-semibold text-slate-400">شكاوى واقتراحات مجهولة الهوية</p>
            </div>
          </div>
          <form onSubmit={submitMsg} className="space-y-3">
            <textarea rows={4} className={input} placeholder="اكتب شكواك أو اقتراحك بسرية تامة..." value={msg} onChange={(e) => setMsg(e.target.value)} />
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-rose-600 to-pink-600 px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5">
              <Send size={17} /> إرسال بسرية
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Building2 size={18} className="text-indigo-500" /> أحدث المتقدمين
          </h3>
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <Avatar name={a.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-800">{a.name}</p>
                  <p className="text-[11px] font-bold text-slate-400">{a.track}</p>
                </div>
                <Badge tone={a.status === 'Shortlisted' ? 'emerald' : 'indigo'}>
                  {a.status === 'Shortlisted' ? 'قائمة مختصرة' : 'متقدم'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

const VIEW_META = {
  dashboard: { title: 'لوحة التحكم', subtitle: 'نظرة شاملة على نشاطك وتقدمك في السيزون' },
  tracks: { title: 'مسار الدروس', subtitle: 'استعرض التراكات والدروس وسلّم المهام' },
  calendar: { title: 'التقويم والإيفنتات', subtitle: 'تابع الورش والإيفنتات القادمة وسجّل حضورك' },
  admin: { title: 'لوحة الإدارة', subtitle: 'إدارة الأعضاء، التاسكات، والشكاوي' },
  recruitment: { title: 'التقديم والشكاوي', subtitle: 'انضم للفريق أو أرسل ملاحظاتك بسرية' },
};

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gdg_session') || 'null'); } catch { return null; }
  });
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const notify = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };

  const login = (u) => {
    setSession(u);
    localStorage.setItem('gdg_session', JSON.stringify(u));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('gdg_session');
    setView('dashboard');
  };

  useEffect(() => {
    if (session) {
      const role = session.role;
      const canAdmin = ['SuperAdmin', 'President', 'HR', 'TrackHead'].includes(role);
      if (view === 'admin' && !canAdmin) setView('dashboard');
    }
  }, [session, view]);

  if (!session) return <LoginScreen onLogin={login} />;

  const meta = VIEW_META[view] || VIEW_META.dashboard;

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">
      <Toasts toasts={toasts} />

      <Sidebar
        user={session}
        view={view}
        onNavigate={setView}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-9">
        <Topbar title={meta.title} subtitle={meta.subtitle} user={session} onMenu={() => setSidebarOpen(true)} />

        <div key={view} className="animate-fadeIn">
          {view === 'dashboard' && <DashboardView user={session} notify={notify} />}
          {view === 'tracks' && <TracksView notify={notify} user={session} />}
          {view === 'calendar' && <CalendarView notify={notify} />}
          {view === 'admin' && ['SuperAdmin', 'President', 'HR', 'TrackHead'].includes(session.role) && <AdminView notify={notify} />}
          {view === 'recruitment' && <RecruitmentView notify={notify} />}
        </div>
      </main>
    </div>
  );
}
