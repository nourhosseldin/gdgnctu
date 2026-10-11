import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, BookOpen, CalendarDays, ShieldCheck, Users, Award,
  AlertTriangle, LogOut, Mail, Lock, User as UserIcon, Search, Bell,
  Trophy, Medal, CheckCircle2, Clock, PlayCircle, Download, Send, ClipboardList,
  ChevronDown, Sparkles, Flame, GraduationCap, MapPin, Filter, X, Menu, Rocket,
  ExternalLink, Layers, BarChart3, ShieldAlert, Building2, Phone, Quote,
  ArrowUpRight, BadgeCheck, Target, Loader2, RefreshCw, UserPlus, Plus, UsersRound,
} from 'lucide-react';
import { api, setToken, getToken, downloadFile, openCertificate } from './api';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ROLE_LABELS = {
  SuperAdmin: 'مدير عام', President: 'رئيس النشاط', HR: 'الموارد البشرية',
  TrackHead: 'مسؤول التراك', Student: 'عضو / طالب', CommitteeMember: 'عضو لجنة',
};
const STAFF = ['SuperAdmin', 'President', 'HR', 'TrackHead'];
const LEADERSHIP = ['SuperAdmin', 'President', 'HR'];
const TRACKS_LIST = ['Flutter', 'Web', 'Cyber', 'UI/UX', 'Embedded', 'HR', 'PR', 'General'];

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500', 'from-sky-500 to-cyan-500', 'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-fuchsia-500 to-purple-500',
];
function initials(name = '') {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length ? p.slice(0, 2).map((w) => w[0]).join('') : '؟';
}
function gradientFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}
function formatDate(d) {
  try { return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}
function shortDate(d) {
  try { return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }); }
  catch { return ''; }
}

function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((error) => active && setState({ loading: false, data: null, error }));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);
  return { ...state, reload: () => setNonce((n) => n + 1) };
}

/* ------------------------------------------------------------------ */
/*  UI primitives                                                      */
/* ------------------------------------------------------------------ */

function Avatar({ name, size = 40, ring = false }) {
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`shrink-0 rounded-2xl bg-gradient-to-br ${gradientFor(name)} text-white font-bold flex items-center justify-center shadow-soft ${ring ? 'ring-2 ring-white' : ''}`}>
      {initials(name)}
    </div>
  );
}

function Badge({ children, tone = 'slate', className = '' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600', indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600', sky: 'bg-sky-50 text-sky-600', violet: 'bg-violet-50 text-violet-600',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]} ${className}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, hint, tone = 'indigo', delay = 0 }) {
  const tones = {
    indigo: 'from-indigo-500 to-violet-600', emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-400 to-orange-500', rose: 'from-rose-500 to-pink-600', sky: 'from-sky-500 to-cyan-500',
  };
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-card border border-slate-100 animate-fadeInUp hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-soft`}><Icon size={22} /></div>
        {hint && <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500">{hint}</span>}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function Loader({ label = 'جارٍ التحميل...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 className="animate-spin" size={22} /> <span className="font-bold">{label}</span>
    </div>
  );
}

function ErrorBox({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-rose-100 bg-rose-50/60 py-14 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500"><AlertTriangle size={26} /></span>
      <div>
        <p className="font-extrabold text-slate-800">حدثت مشكلة</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{error?.message || 'خطأ غير معروف'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50">
          <RefreshCw size={16} /> إعادة المحاولة
        </button>
      )}
    </div>
  );
}

function Empty({ icon: Icon = BookOpen, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><Icon size={26} /></span>
      <p className="font-extrabold text-slate-700">{title}</p>
      {subtitle && <p className="text-sm font-semibold text-slate-400">{subtitle}</p>}
    </div>
  );
}

function Toasts({ toasts }) {
  const tones = { success: 'from-emerald-500 to-teal-600', error: 'from-rose-500 to-red-600', info: 'from-indigo-500 to-violet-600' };
  const icons = { success: CheckCircle2, error: AlertTriangle, info: Sparkles };
  return (
    <div className="fixed bottom-5 left-4 right-4 z-[100] flex flex-col items-start gap-3 sm:right-auto sm:left-6">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Sparkles;
        return (
          <div key={t.id} className="animate-scaleIn flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card border border-slate-100 sm:w-auto sm:min-w-[280px] sm:max-w-sm">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tones[t.type] || tones.info} text-white`}><Icon size={18} /></span>
            <p className="text-sm font-semibold text-slate-700 leading-snug">{t.msg}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Login                                                             */
/* ------------------------------------------------------------------ */

function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', track: 'Flutter' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbIssue, setDbIssue] = useState('');

  useEffect(() => {
    api.health().catch((e) => setDbIssue(e.message)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password.trim()) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    if (mode === 'register' && !form.name.trim()) { setError('يرجى إدخال الاسم الكامل'); return; }
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login({ email: form.email.trim(), password: form.password })
        : await api.register({ name: form.name.trim(), email: form.email.trim(), password: form.password, track: form.track });
      setToken(res.token);
      onAuth(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-11 pl-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100';

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-indigo-600/40 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-8rem] left-[-6rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/30 blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/3 h-[22rem] w-[22rem] rounded-full bg-cyan-500/20 blur-[120px] animate-blob" style={{ animationDelay: '6s' }} />
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-5 py-10 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex max-w-lg flex-col justify-center animate-fadeInUp">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur text-2xl font-extrabold">
              <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">D</span><span className="text-[#FBBC05]">G</span>
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
            {[{ i: Layers, l: 'تراكات', v: '8+' }, { i: Users, l: 'أعضاء', v: '240' }, { i: CalendarDays, l: 'إيفنتات', v: '36' }].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <s.i size={20} className="text-indigo-300" />
                <p className="mt-2 text-2xl font-extrabold text-white">{s.v}</p>
                <p className="text-xs font-semibold text-indigo-200/70">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md animate-scaleIn">
          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {mode === 'login' ? 'مرحباً بعودتك 👋 سعداء برؤيتك مجدداً' : 'انضم إلى فريق GDG وابدأ رحلتك التقنية'}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
              {[{ k: 'login', l: 'دخول' }, { k: 'register', l: 'حساب جديد' }].map((tab) => (
                <button key={tab.k} onClick={() => { setMode(tab.k); setError(''); }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${mode === tab.k ? 'bg-white text-indigo-600 shadow-soft' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab.l}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}
            {dbIssue && mode === 'login' && !error && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> <span>{dbIssue}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative animate-fadeIn">
                  <UserIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={field} placeholder="الاسم الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              )}
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={field} placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className={field} placeholder="كلمة المرور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {mode === 'register' && (
                <div className="relative animate-fadeIn">
                  <select className={field + ' appearance-none pl-10'} value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
                    {TRACKS_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              )}
              <button type="submit" disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-3.5 text-sm font-extrabold text-white shadow-glow transition hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] disabled:opacity-60">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} className="transition group-hover:-translate-y-0.5" />}
                {loading ? 'جارٍ المعالجة...' : mode === 'login' ? 'دخول إلى المنصة' : 'إنشاء الحساب'}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <BadgeCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
              <p className="text-xs font-semibold leading-relaxed text-slate-500">
                حساب المدير للتجربة: <span className="font-extrabold text-slate-700">admin@gdg.com</span> / كلمة المرور <span className="font-extrabold text-slate-700">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar + topbar                                                   */
/* ------------------------------------------------------------------ */

const NAV = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { key: 'tracks', label: 'مسار الدروس', icon: BookOpen },
  { key: 'calendar', label: 'التقويم والإيفنتات', icon: CalendarDays },
  { key: 'admin', label: 'لوحة الإدارة', icon: ShieldCheck, roles: STAFF },
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow text-lg font-extrabold text-white">G</div>
            <div>
              <p className="text-base font-extrabold text-slate-900 leading-tight">بوابة GDG</p>
              <p className="text-[11px] font-semibold text-slate-400">Google Developer Groups</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><X size={18} /></button>
        </div>

        <nav className="flex-1 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">القائمة الرئيسية</p>
          {items.map((item) => {
            const active = view === item.key;
            return (
              <button key={item.key} onClick={() => { onNavigate(item.key); onClose(); }}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-glow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}><item.icon size={18} /></span>
                {item.label}
                {active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-glow">
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
            <button onClick={onLogout} title="تسجيل الخروج" className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, user, onMenu, query, setQuery, notifications }) {
  const [bell, setBell] = useState(false);
  return (
    <header className="mb-6 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenu} className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-soft lg:hidden"><Menu size={18} /></button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-slate-900 sm:text-2xl">{title}</h1>
          <p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث..."
            className="w-52 rounded-2xl border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 lg:w-64" />
        </div>
        <div className="relative">
          <button onClick={() => setBell((b) => !b)} className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-soft transition hover:text-indigo-600">
            <Bell size={18} />
            {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
          </button>
          {bell && (
            <div className="animate-scaleIn absolute left-0 top-14 z-50 w-80 max-w-[85vw] rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
              <p className="mb-3 text-sm font-extrabold text-slate-800">الإشعارات</p>
              {notifications.length === 0 ? (
                <p className="py-4 text-center text-xs font-semibold text-slate-400">لا توجد إشعارات جديدة</p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white bg-gradient-to-br ${n.tone}`}><n.icon size={15} /></span>
                      <div><p className="text-xs font-bold text-slate-700">{n.title}</p><p className="text-[11px] font-semibold text-slate-400">{n.desc}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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

export default App;
function App() {
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(true);
  const [view, setView] = useState('dashboard');
  const [sidebar, setSidebar] = useState(false);
  const [query, setQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((msg, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const refreshUser = useCallback(async () => {
    try { const { user: u } = await api.me(); setUser(u); } catch (_) {}
  }, []);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setBoot(false); return; }
      try { const { user: u } = await api.me(); setUser(u); }
      catch (_) { setToken(''); }
      finally { setBoot(false); }
    })();
  }, []);

  const logout = () => { setToken(''); setUser(null); setView('dashboard'); setQuery(''); };

  if (boot) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><Loader label="جارٍ تحضير المنصة..." /></div>;
  }
  if (!user) {
    return <><LoginScreen onAuth={(u) => { setUser(u); setView('dashboard'); }} /><Toasts toasts={toasts} /></>;
  }

  const titles = {
    dashboard: { t: `أهلاً، ${user.name.split(' ')[0]} 👋`, s: 'نظرة سريعة على تقدمك ونشاطك داخل GDG' },
    tracks: { t: 'مسار الدروس', s: 'اختر تراكك، أكمل الدروس، وسلّم الحلول' },
    calendar: { t: 'التقويم والإيفنتات', s: 'سجّل في الورش واللقاءات القادمة' },
    admin: { t: 'لوحة الإدارة', s: 'إدارة الأعضاء، التسليمات، والمحتوى' },
    recruitment: { t: 'التقديم والشكاوي', s: 'تقدّم للانضمام أو أرسل ملاحظاتك بسرية' },
  };

  const notifications = [
    { icon: Award, title: `رصيدك ${user.points} نقطة`, desc: 'أكمل المزيد من الدروس لزيادة نقاطك', tone: 'from-amber-400 to-orange-500' },
    ...(user.events?.length ? [{ icon: CalendarDays, title: `مسجّل في ${user.events.length} إيفنت`, desc: 'راجع التقويم للتفاصيل', tone: 'from-sky-500 to-cyan-500' }] : []),
    { icon: ShieldCheck, title: `دورك: ${ROLE_LABELS[user.role]}`, desc: `تراك ${user.track}`, tone: 'from-indigo-500 to-violet-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 lg:flex">
      <Sidebar user={user} view={view} onNavigate={setView} onLogout={logout} open={sidebar} onClose={() => setSidebar(false)} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Topbar
          title={titles[view].t} subtitle={titles[view].s} user={user}
          onMenu={() => setSidebar(true)} query={query} setQuery={setQuery} notifications={notifications}
        />
        {view === 'dashboard' && <DashboardView user={user} onNavigate={setView} notify={notify} query={query} />}
        {view === 'tracks' && <TracksView user={user} notify={notify} query={query} refreshUser={refreshUser} />}
        {view === 'calendar' && <CalendarView user={user} notify={notify} query={query} refreshUser={refreshUser} />}
        {view === 'admin' && <AdminView user={user} notify={notify} refreshUser={refreshUser} />}
        {view === 'recruitment' && <RecruitmentView notify={notify} />}
      </main>
      <Toasts toasts={toasts} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function DashboardView({ user, onNavigate, notify, query }) {
  const stats = useAsync(() => api.stats(), []);
  const lb = useAsync(() => api.leaderboard(), []);
  const subs = useAsync(() => api.mySubmissions(), []);

  const mySubs = subs.data || [];
  const approved = mySubs.filter((s) => s.status === 'Approved').length;
  const pending = mySubs.filter((s) => s.status === 'Pending').length;
  const leaderboard = (lb.data || []).filter((u) => !query || u.name.includes(query));
  const maxPoints = Math.max(1, ...leaderboard.map((u) => u.points));
  const myRank = (lb.data || []).findIndex((u) => u._id === user.id) + 1;

  const byTrack = mySubs.reduce((acc, s) => {
    const k = s.trackName || 'أخرى';
    acc[k] = acc[k] || { total: 0, done: 0 };
    acc[k].total += 1;
    if (s.status === 'Approved') acc[k].done += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-white shadow-card sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-indigo-600/40 blur-[100px]" />
          <div className="absolute bottom-[-6rem] left-10 h-64 w-64 rounded-full bg-fuchsia-600/30 blur-[100px]" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Badge tone="indigo" className="!bg-white/10 !text-indigo-100"><Flame size={13} /> سيزون {user.season}</Badge>
            <h2 className="mt-4 text-2xl font-extrabold leading-snug sm:text-3xl">
              رحلتك في <span className="text-gradient">Google Developer Groups</span> مستمرة
            </h2>
            <p className="mt-2 text-sm font-semibold text-indigo-100/80">
              لديك <span className="font-extrabold text-white">{user.points}</span> نقطة و<span className="font-extrabold text-white">{approved}</span> مهمة مكتملة. {pending > 0 ? `و${pending} قيد المراجعة.` : 'واصل التقدم!'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => onNavigate('tracks')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 shadow-soft transition hover:-translate-y-0.5">
                <PlayCircle size={18} /> أكمل التعلّم
              </button>
              <button onClick={async () => { try { await openCertificate(); } catch (e) { notify(e.message, 'error'); } }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20">
                <GraduationCap size={18} /> شهادتي
              </button>
            </div>
          </div>
          <div className="relative flex items-center gap-4 rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <div className="relative grid h-24 w-24 place-items-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1, approved / 8))} />
                <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor="#e879f9" /></linearGradient></defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-xl font-extrabold">{approved}</p>
                <p className="text-[10px] font-bold text-indigo-200">مهمة</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold">ترتيبك الحالي</p>
              <p className="text-3xl font-extrabold text-gradient">#{myRank || '—'}</p>
              <p className="text-[11px] font-semibold text-indigo-200/80">من بين {stats.data?.members ?? '—'} عضو</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Award} label="إجمالي النقاط" value={user.points} tone="amber" hint="XP" delay={0} />
        <StatCard icon={CheckCircle2} label="مهام مكتملة" value={approved} tone="emerald" delay={60} />
        <StatCard icon={Clock} label="قيد المراجعة" value={pending} tone="rose" delay={120} />
        <StatCard icon={Trophy} label="ترتيبك" value={myRank ? `#${myRank}` : '—'} tone="indigo" delay={180} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">لوحة المتصدرين</h3>
              <p className="text-xs font-semibold text-slate-400">أعلى الأعضاء نقاطاً هذا السيزون</p>
            </div>
            <Trophy size={20} className="text-amber-500" />
          </div>
          {lb.loading ? <Loader /> : lb.error ? <ErrorBox error={lb.error} onRetry={lb.reload} /> : leaderboard.length === 0 ? (
            <Empty icon={Trophy} title="لا توجد بيانات بعد" />
          ) : (
            <div className="space-y-3">
              {leaderboard.slice(0, 6).map((u, i) => (
                <div key={u._id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                    {i < 3 ? <Medal size={15} /> : i + 1}
                  </span>
                  <Avatar name={u.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-800">{u.name}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{u.track}</p>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-violet-500" style={{ width: `${(u.points / maxPoints) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-14 text-left text-sm font-extrabold text-indigo-600">{u.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-extrabold text-slate-900">تقدمك حسب التراك</h3>
            {Object.keys(byTrack).length === 0 ? (
              <Empty icon={Target} title="لم تبدأ بعد" subtitle="ابدأ بتسليم أول مهمة" />
            ) : (
              <div className="space-y-4">
                {Object.entries(byTrack).map(([name, v]) => (
                  <div key={name}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{name}</span><span>{v.done}/{v.total}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-teal-500 transition-all" style={{ width: `${(v.done / v.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-glow">
            <GraduationCap size={28} className="mb-3" />
            <h3 className="text-lg font-extrabold">شهادة إتمام معتمدة</h3>
            <p className="mt-1 text-xs font-semibold text-white/85">اطبع شهادة إتمام مسارك بضغطة واحدة بتصميم احترافي.</p>
            <button onClick={async () => { try { await openCertificate(); } catch (e) { notify(e.message, 'error'); } }}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-indigo-700 transition hover:-translate-y-0.5">
              <Download size={16} /> تحميل الشهادة
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tracks                                                             */
/* ------------------------------------------------------------------ */

function TracksView({ user, notify, query, refreshUser }) {
  const tracks = useAsync(() => api.tracks(), []);
  const subs = useAsync(() => api.mySubmissions(), []);
  const [active, setActive] = useState(null);
  const [modal, setModal] = useState(null);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);

  const list = (tracks.data || []).filter((t) => !query || t.name.includes(query));
  const current = list.find((t) => t._id === active) || list[0];
  const mySubs = subs.data || [];

  useEffect(() => { if (list.length && !list.find((t) => t._id === active)) setActive(list[0]._id); }, [tracks.data]); // eslint-disable-line

  const statusFor = (lessonId) => mySubs.find((s) => String(s.lessonId) === String(lessonId));

  const totalLessons = current ? current.modules.reduce((a, m) => a + m.lessons.length, 0) : 0;
  const doneLessons = current ? current.modules.reduce((a, m) => a + m.lessons.filter((l) => statusFor(l._id)?.status === 'Approved').length, 0) : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!link.trim()) { notify('يرجى إدخال رابط الحل', 'error'); return; }
    setBusy(true);
    try {
      await api.submitTask({
        trackId: current._id, trackName: current.name,
        lessonId: modal._id, lessonTitle: modal.title, link: link.trim(),
      });
      notify('تم إرسال الحل بنجاح، بانتظار المراجعة ✅', 'success');
      setModal(null); setLink(''); subs.reload();
    } catch (err) { notify(err.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      {tracks.loading ? <Loader /> : tracks.error ? <ErrorBox error={tracks.error} onRetry={tracks.reload} /> : list.length === 0 ? (
        <Empty title="لا توجد تراكات" subtitle="سيتم إضافة المسارات قريباً" />
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {list.map((t) => (
              <button key={t._id} onClick={() => setActive(t._id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${current?._id === t._id ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-soft' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                <span className="text-lg">{t.icon}</span> {t.name}
              </button>
            ))}
          </div>

          {current && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-2xl">{current.icon}</span>
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-900">{current.name}</h2>
                          <p className="text-xs font-semibold text-slate-400">مسؤول التراك: {current.head || 'GDG Team'}</p>
                        </div>
                      </div>
                      <p className="mt-3 max-w-lg text-sm font-semibold leading-relaxed text-slate-500">{current.description}</p>
                    </div>
                    <Badge tone={current.type === 'Technical' ? 'indigo' : 'violet'}>{current.type === 'Technical' ? 'تقني' : 'غير تقني'}</Badge>
                  </div>
                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500"><span>تقدمك في التراك</span><span>{doneLessons}/{totalLessons}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-violet-500 transition-all" style={{ width: `${totalLessons ? (doneLessons / totalLessons) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                {current.modules.map((m, mi) => (
                  <div key={m._id || mi} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white">{mi + 1}</span>
                      <h3 className="text-base font-extrabold text-slate-900">{m.title}</h3>
                      <Badge tone="slate" className="mr-auto">{m.lessons.length} دروس</Badge>
                    </div>
                    <div className="space-y-3">
                      {m.lessons.map((l, li) => {
                        const sub = statusFor(l._id);
                        const st = sub?.status;
                        return (
                          <div key={l._id || li} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40 sm:flex-row sm:items-center">
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${st === 'Approved' ? 'bg-emerald-50 text-emerald-600' : st === 'Pending' ? 'bg-amber-50 text-amber-600' : st === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                              {st === 'Approved' ? <CheckCircle2 size={18} /> : st === 'Pending' ? <Clock size={18} /> : st === 'Rejected' ? <AlertTriangle size={18} /> : <PlayCircle size={18} />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-extrabold text-slate-800">{l.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
                                <span className="inline-flex items-center gap-1"><Clock size={12} /> {l.duration}</span>
                                <span className="inline-flex items-center gap-1"><Award size={12} /> {l.points} نقطة</span>
                                {st === 'Approved' && <span className="font-extrabold text-emerald-600">مكتمل ✓</span>}
                                {st === 'Pending' && <span className="font-extrabold text-amber-600">قيد المراجعة</span>}
                                {st === 'Rejected' && <span className="font-extrabold text-rose-600">مرفوض — أعد التسليم</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {l.video && <a href={l.video} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"><ExternalLink size={13} /> الدرس</a>}
                              <button onClick={() => { setModal(l); setLink(''); }}
                                className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${st === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500'}`}>
                                {st === 'Approved' ? <><CheckCircle2 size={13} /> مكتمل</> : <><Send size={13} /> {st === 'Rejected' ? 'إعادة تسليم' : 'تسليم الحل'}</>}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {m.lessons.length === 0 && <p className="py-3 text-center text-xs font-semibold text-slate-400">سيتم إضافة الدروس قريباً</p>}
                    </div>
                  </div>
                ))}
                {current.modules.length === 0 && <Empty icon={Layers} title="لا توجد وحدات بعد" subtitle="سيتم إضافة المحتوى قريباً" />}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                  <h3 className="mb-4 text-base font-extrabold text-slate-900">تسليماتي الأخيرة</h3>
                  {subs.loading ? <Loader /> : mySubs.length === 0 ? <Empty icon={ClipboardList} title="لا توجد تسليمات" /> : (
                    <div className="space-y-3">
                      {mySubs.slice(0, 6).map((s) => (
                        <div key={s._id} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                          <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${s.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : s.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            {s.status === 'Approved' ? <CheckCircle2 size={15} /> : s.status === 'Rejected' ? <X size={15} /> : <Clock size={15} />}
                          </span>
                          <div className="min-w-0"><p className="truncate text-xs font-extrabold text-slate-700">{s.lessonTitle}</p><p className="text-[11px] font-semibold text-slate-400">{s.trackName} · {shortDate(s.submittedAt)}</p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-glow">
                  <GraduationCap size={26} className="mb-2" />
                  <h3 className="text-base font-extrabold">أكملت التراك؟</h3>
                  <p className="mt-1 text-xs font-semibold text-white/85">احصل على شهادتك المطبوعة فوراً.</p>
                  <button onClick={async () => { try { await openCertificate(); } catch (e) { notify(e.message, 'error'); } }}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-indigo-700 transition hover:-translate-y-0.5">
                    <Download size={16} /> شهادتي
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="animate-scaleIn w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">تسليم الحل</h3>
                <p className="text-xs font-semibold text-slate-400">{modal.title}</p>
              </div>
              <button type="button" onClick={() => setModal(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <label className="mb-1.5 block text-xs font-extrabold text-slate-600">رابط الحل (GitHub / Drive / ...)</label>
            <div className="relative">
              <ExternalLink size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://github.com/..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-11 pl-4 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            </div>
            <button type="submit" disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-3 text-sm font-extrabold text-white transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} إرسال للمراجعة
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar                                                           */
/* ------------------------------------------------------------------ */

function CalendarView({ user, notify, query, refreshUser }) {
  const events = useAsync(() => api.events(), []);
  const [tab, setTab] = useState('All');
  const [busyId, setBusyId] = useState(null);

  const registered = new Set((user.events || []).map(String));
  const tabs = [{ k: 'All', l: 'الكل' }, { k: 'Upcoming', l: 'قادمة' }, { k: 'Workshop', l: 'ورش' }, { k: 'Past', l: 'سابقة' }];
  const list = (events.data || []).filter((e) => (tab === 'All' || e.type === tab) && (!query || e.title.includes(query)));

  const register = async (ev) => {
    setBusyId(ev._id);
    try {
      const res = await api.registerEvent(ev._id);
      notify(res.message || 'تم التسجيل', 'success');
      events.reload(); refreshUser();
    } catch (err) { notify(err.message, 'error'); }
    finally { setBusyId(null); }
  };

  const typeMeta = { Upcoming: { l: 'قادم', tone: 'indigo' }, Workshop: { l: 'ورشة', tone: 'violet' }, Past: { l: 'سابق', tone: 'slate' } };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${tab === t.k ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
              {t.l}
            </button>
          ))}
        </div>
        <Badge tone="emerald"><CalendarDays size={13} /> مسجّل في {registered.size} إيفنت</Badge>
      </div>

      {events.loading ? <Loader /> : events.error ? <ErrorBox error={events.error} onRetry={events.reload} /> : list.length === 0 ? (
        <Empty icon={CalendarDays} title="لا توجد إيفنتات" subtitle="تابعنا للإعلان عن الفعاليات القادمة" />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((ev) => {
            const meta = typeMeta[ev.type] || typeMeta.Upcoming;
            const isReg = registered.has(String(ev._id));
            const d = new Date(ev.date);
            return (
              <div key={ev._id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1">
                <div className="relative h-28 bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <Badge className="!bg-white/20 !text-white">{meta.l}</Badge>
                    <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur">
                      <p className="text-lg font-extrabold leading-none">{d.getDate()}</p>
                      <p className="text-[10px] font-bold">{d.toLocaleDateString('ar-EG', { month: 'short' })}</p>
                    </div>
                  </div>
                  <CalendarDays size={64} className="absolute -bottom-4 left-2 text-white/10" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-extrabold text-slate-900">{ev.title}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-xs font-semibold leading-relaxed text-slate-500">{ev.description}</p>
                  <div className="mt-4 space-y-1.5 text-[11px] font-bold text-slate-400">
                    <p className="inline-flex items-center gap-1.5"><UserIcon size={12} /> {ev.speaker}</p>
                    <p className="inline-flex items-center gap-1.5"><Clock size={12} /> {ev.time || 'يُعلن لاحقاً'}</p>
                    <p className="inline-flex items-center gap-1.5"><MapPin size={12} /> {ev.location}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{ev.attendees}/{ev.seats} مشارك</span>
                    <button onClick={() => register(ev)} disabled={isReg || busyId === ev._id}
                      className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${isReg ? 'bg-emerald-50 text-emerald-600' : 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60'}`}>
                      {busyId === ev._id ? <Loader2 size={14} className="animate-spin" /> : isReg ? <CheckCircle2 size={14} /> : <Rocket size={14} />}
                      {isReg ? 'مسجّل' : 'سجّل الآن'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */

const SUB_STATUS = { Pending: { l: 'قيد المراجعة', tone: 'amber' }, Approved: { l: 'مقبول', tone: 'emerald' }, Rejected: { l: 'مرفوض', tone: 'rose' } };

function AdminView({ user, notify, refreshUser }) {
  const [tab, setTab] = useState('overview');
  const stats = useAsync(() => api.stats(), []);
  const subs = useAsync(() => api.submissions(), []);
  const complaints = useAsync(() => api.complaints().catch(() => []), []);
  const apps = useAsync(() => api.recruitment().catch(() => []), []);
  const members = useAsync(() => api.users(), []);
  const events = useAsync(() => api.events(), []);
  const tracks = useAsync(() => api.tracks(), []);
  const seasons = useAsync(() => api.seasons().catch(() => []), []);

  const isLeader = LEADERSHIP.includes(user.role);
  const roleOpts = ['SuperAdmin', 'President', 'HR', 'TrackHead', 'Student', 'CommitteeMember'];

  const review = async (id, status) => {
    try { await api.reviewSubmission(id, status); notify(status === 'Approved' ? 'تمت الموافقة وإضافة النقاط ✅' : 'تم رفض التسليم', status === 'Approved' ? 'success' : 'info'); subs.reload(); stats.reload(); members.reload(); }
    catch (e) { notify(e.message, 'error'); }
  };
  const setRole = async (id, role) => {
    try { await api.setRole(id, role); notify('تم تحديث الدور', 'success'); members.reload(); if (id === user.id) refreshUser(); }
    catch (e) { notify(e.message, 'error'); }
  };
  const strike = async (id) => {
    try { await api.strike(id); notify('تم إضافة إنذار', 'info'); members.reload(); }
    catch (e) { notify(e.message, 'error'); }
  };
  const setAppStatus = async (id, status) => {
    try { await api.updateRecruitment(id, status); notify('تم تحديث حالة الطلب', 'success'); apps.reload(); }
    catch (e) { notify(e.message, 'error'); }
  };
  const exportType = async (type) => {
    try { await downloadFile(`/export/${type}`, `${type}.xlsx`); notify('تم تنزيل الملف', 'success'); }
    catch (e) { notify(e.message, 'error'); }
  };

  const tabs = [
    { k: 'overview', l: 'نظرة عامة', icon: BarChart3 },
    { k: 'submissions', l: 'التسليمات', icon: ClipboardList, badge: stats.data?.pending },
    { k: 'applicants', l: 'المتقدمون', icon: UserPlus, badge: (apps.data || []).length },
    { k: 'complaints', l: 'الشكاوي', icon: ShieldAlert },
    { k: 'members', l: 'الأعضاء', icon: UsersRound },
    { k: 'content', l: 'المحتوى', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${tab === t.k ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
            <t.icon size={15} /> {t.l}
            {t.badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="الأعضاء" value={stats.data?.members ?? '—'} tone="indigo" />
            <StatCard icon={Layers} label="التراكات" value={stats.data?.tracks ?? '—'} tone="sky" delay={60} />
            <StatCard icon={CalendarDays} label="الإيفنتات" value={stats.data?.events ?? '—'} tone="emerald" delay={120} />
            <StatCard icon={Clock} label="قيد المراجعة" value={stats.data?.pending ?? '—'} tone="amber" delay={180} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <button onClick={() => exportType('users')} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 text-right shadow-card transition hover:-translate-y-0.5">
              <div><p className="text-sm font-extrabold text-slate-800">تصدير الأعضاء</p><p className="text-xs font-semibold text-slate-400">ملف Excel</p></div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Download size={20} /></span>
            </button>
            <button onClick={() => exportType('submissions')} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 text-right shadow-card transition hover:-translate-y-0.5">
              <div><p className="text-sm font-extrabold text-slate-800">تصدير التسليمات</p><p className="text-xs font-semibold text-slate-400">ملف Excel</p></div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Download size={20} /></span>
            </button>
            <button onClick={() => exportType('recruitment')} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 text-right shadow-card transition hover:-translate-y-0.5">
              <div><p className="text-sm font-extrabold text-slate-800">تصدير المتقدمين</p><p className="text-xs font-semibold text-slate-400">ملف Excel</p></div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Download size={20} /></span>
            </button>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-base font-extrabold text-slate-900">السيزونات</h3>
            {(seasons.data || []).length === 0 ? <Empty icon={Flame} title="لا توجد سيزونات" /> : (
              <div className="flex flex-wrap gap-3">
                {(seasons.data || []).map((s) => (
                  <div key={s._id} className={`rounded-2xl border p-4 ${s.active ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-sm font-extrabold text-slate-800">سيزون {s.name}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{s.stats?.members || 0} عضو · {s.stats?.events || 0} إيفنت</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'submissions' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-base font-extrabold text-slate-900">مراجعة تسليمات الأعضاء</h3>
          {subs.loading ? <Loader /> : (subs.data || []).length === 0 ? <Empty icon={ClipboardList} title="لا توجد تسليمات" /> : (
            <div className="space-y-3">
              {(subs.data || []).map((s) => {
                const meta = SUB_STATUS[s.status] || SUB_STATUS.Pending;
                return (
                  <div key={s._id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center">
                    <Avatar name={s.student?.name || '؟'} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-slate-800">{s.student?.name} <span className="text-xs font-semibold text-slate-400">· {s.student?.track}</span></p>
                      <p className="truncate text-xs font-semibold text-slate-500">{s.trackName} — {s.lessonTitle}</p>
                      <a href={s.link} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:underline"><ExternalLink size={11} /> عرض الحل</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={meta.tone}>{meta.l}</Badge>
                      {s.status !== 'Approved' && <button onClick={() => review(s._id, 'Approved')} className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-600 transition hover:bg-emerald-100">قبول</button>}
                      {s.status !== 'Rejected' && <button onClick={() => review(s._id, 'Rejected')} className="rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100">رفض</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'applicants' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">طلبات الانضمام</h3>
            <button onClick={() => exportType('recruitment')} className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-500 hover:border-indigo-200 hover:text-indigo-600"><Download size={14} /> تصدير</button>
          </div>
          {apps.loading ? <Loader /> : (apps.data || []).length === 0 ? <Empty icon={UserPlus} title="لا توجد طلبات" /> : (
            <div className="space-y-3">
              {(apps.data || []).map((a) => (
                <div key={a._id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center">
                  <Avatar name={a.fullName} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-800">{a.fullName}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">{a.email} · {a.phone}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5"><Badge tone="slate">{a.track}</Badge><Badge tone={a.status === 'Accepted' ? 'emerald' : a.status === 'Rejected' ? 'rose' : 'amber'}>{a.status}</Badge></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setAppStatus(a._id, 'Accepted')} className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-600 hover:bg-emerald-100">قبول</button>
                    <button onClick={() => setAppStatus(a._id, 'Shortlisted')} className="rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-extrabold text-amber-600 hover:bg-amber-100">قائمة مختصرة</button>
                    <button onClick={() => setAppStatus(a._id, 'Rejected')} className="rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-100">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'complaints' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-base font-extrabold text-slate-900">الشكاوي والملاحظات (سرية)</h3>
          {complaints.loading ? <Loader /> : (complaints.data || []).length === 0 ? <Empty icon={ShieldAlert} title="لا توجد رسائل" /> : (
            <div className="space-y-3">
              {(complaints.data || []).map((c) => (
                <div key={c._id} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500"><Quote size={16} /></span>
                  <div><p className="text-sm font-semibold leading-relaxed text-slate-700">{c.message}</p><p className="mt-1 text-[11px] font-bold text-slate-400">{formatDate(c.submittedAt)}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">إدارة الأعضاء</h3>
            <button onClick={() => exportType('users')} className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-500 hover:border-indigo-200 hover:text-indigo-600"><Download size={14} /> تصدير</button>
          </div>
          {members.loading ? <Loader /> : (
            <div className="space-y-3">
              {(members.data || []).map((m) => (
                <div key={m._id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 lg:flex-row lg:items-center">
                  <Avatar name={m.name} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-800">{m.name} {m.strikes > 0 && <span className="text-[11px] font-bold text-rose-500">· {m.strikes} إنذار</span>}</p>
                    <p className="truncate text-xs font-semibold text-slate-400">{m.email} · {m.track}</p>
                  </div>
                  <Badge tone="amber"><Award size={12} /> {m.points}</Badge>
                  {isLeader ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select value={m.role} onChange={(e) => setRole(m._id, e.target.value)}
                          className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-8 text-xs font-extrabold text-slate-600 outline-none focus:border-indigo-400">
                          {roleOpts.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                        <ChevronDown size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <button onClick={() => strike(m._id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-100">إنذار</button>
                    </div>
                  ) : <Badge tone="indigo">{ROLE_LABELS[m.role]}</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'content' && <AdminContent tracks={tracks} events={events} notify={notify} />}
    </div>
  );
}

function AdminContent({ tracks, events, notify }) {
  const [evForm, setEvForm] = useState({ title: '', description: '', date: '', time: '', speaker: '', location: '', type: 'Upcoming', seats: 100 });
  const [trForm, setTrForm] = useState({ name: '', type: 'Technical', description: '', icon: '📘' });
  const [modForm, setModForm] = useState({ trackId: '', title: '' });
  const [busy, setBusy] = useState('');

  const createEvent = async (e) => {
    e.preventDefault();
    if (!evForm.title.trim()) { notify('عنوان الإيفنت مطلوب', 'error'); return; }
    setBusy('event');
    try { await api.createEvent(evForm); notify('تم إنشاء الإيفنت ✅', 'success'); setEvForm({ title: '', description: '', date: '', time: '', speaker: '', location: '', type: 'Upcoming', seats: 100 }); events.reload(); }
    catch (err) { notify(err.message, 'error'); } finally { setBusy(''); }
  };
  const createTrack = async (e) => {
    e.preventDefault();
    if (!trForm.name.trim()) { notify('اسم التراك مطلوب', 'error'); return; }
    setBusy('track');
    try { const t = await api.createTrack(trForm); notify('تم إنشاء التراك ✅', 'success'); setTrForm({ name: '', type: 'Technical', description: '', icon: '📘' }); tracks.reload(); setModForm((f) => ({ ...f, trackId: t._id })); }
    catch (err) { notify(err.message, 'error'); } finally { setBusy(''); }
  };
  const addModule = async (e) => {
    e.preventDefault();
    if (!modForm.trackId || !modForm.title.trim()) { notify('اختر التراك واكتب عنوان الوحدة', 'error'); return; }
    setBusy('module');
    try { await api.addModule(modForm.trackId, { title: modForm.title, lessons: [] }); notify('تمت إضافة الوحدة ✅', 'success'); setModForm({ trackId: modForm.trackId, title: '' }); tracks.reload(); }
    catch (err) { notify(err.message, 'error'); } finally { setBusy(''); }
  };

  const inp = 'w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <form onSubmit={createEvent} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-indigo-500" /><h3 className="text-base font-extrabold text-slate-900">إنشاء إيفنت جديد</h3></div>
        <div className="space-y-3">
          <input className={inp} placeholder="عنوان الإيفنت" value={evForm.title} onChange={(e) => setEvForm({ ...evForm, title: e.target.value })} />
          <textarea className={inp} rows={2} placeholder="الوصف" value={evForm.description} onChange={(e) => setEvForm({ ...evForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className={inp} value={evForm.date} onChange={(e) => setEvForm({ ...evForm, date: e.target.value })} />
            <input className={inp} placeholder="الوقت (مثال: 7:00 م)" value={evForm.time} onChange={(e) => setEvForm({ ...evForm, time: e.target.value })} />
            <input className={inp} placeholder="المتحدث" value={evForm.speaker} onChange={(e) => setEvForm({ ...evForm, speaker: e.target.value })} />
            <input className={inp} placeholder="المكان" value={evForm.location} onChange={(e) => setEvForm({ ...evForm, location: e.target.value })} />
            <select className={inp} value={evForm.type} onChange={(e) => setEvForm({ ...evForm, type: e.target.value })}>
              <option value="Upcoming">قادم</option><option value="Workshop">ورشة</option><option value="Past">سابق</option>
            </select>
            <input type="number" className={inp} placeholder="عدد المقاعد" value={evForm.seats} onChange={(e) => setEvForm({ ...evForm, seats: e.target.value })} />
          </div>
          <button disabled={busy === 'event'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-3 text-sm font-extrabold text-white transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60">
            {busy === 'event' ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} نشر الإيفنت
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <form onSubmit={createTrack} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2"><Layers size={18} className="text-indigo-500" /><h3 className="text-base font-extrabold text-slate-900">إنشاء تراك جديد</h3></div>
          <div className="space-y-3">
            <input className={inp} placeholder="اسم التراك" value={trForm.name} onChange={(e) => setTrForm({ ...trForm, name: e.target.value })} />
            <input className={inp} placeholder="الوصف" value={trForm.description} onChange={(e) => setTrForm({ ...trForm, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inp} placeholder="أيقونة (إيموجي)" value={trForm.icon} onChange={(e) => setTrForm({ ...trForm, icon: e.target.value })} />
              <select className={inp} value={trForm.type} onChange={(e) => setTrForm({ ...trForm, type: e.target.value })}>
                <option value="Technical">تقني</option><option value="Non-Technical">غير تقني</option>
              </select>
            </div>
            <button disabled={busy === 'track'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 py-3 text-sm font-extrabold text-white transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60">
              {busy === 'track' ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} إنشاء التراك
            </button>
          </div>
        </form>

        <form onSubmit={addModule} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2"><BookOpen size={18} className="text-indigo-500" /><h3 className="text-base font-extrabold text-slate-900">إضافة وحدة إلى تراك</h3></div>
          <div className="space-y-3">
            <select className={inp} value={modForm.trackId} onChange={(e) => setModForm({ ...modForm, trackId: e.target.value })}>
              <option value="">اختر التراك</option>
              {(tracks.data || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <input className={inp} placeholder="عنوان الوحدة" value={modForm.title} onChange={(e) => setModForm({ ...modForm, title: e.target.value })} />
            <button disabled={busy === 'module'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {busy === 'module' ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} إضافة الوحدة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recruitment + Complaints                                           */
/* ------------------------------------------------------------------ */

function RecruitmentView({ notify }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', track: 'Flutter', why: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const apply = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) { notify('يرجى إكمال الحقول المطلوبة', 'error'); return; }
    setBusy(true);
    try { const r = await api.apply(form); notify(r.message || 'تم تقديم طلبك', 'success'); setForm({ fullName: '', email: '', phone: '', track: 'Flutter', why: '' }); }
    catch (err) { notify(err.message, 'error'); } finally { setBusy(false); }
  };
  const complaint = async (e) => {
    e.preventDefault();
    if (!msg.trim()) { notify('اكتب رسالتك أولاً', 'error'); return; }
    setBusy(true);
    try { const r = await api.sendComplaint(msg.trim()); notify(r.message || 'تم الإرسال', 'success'); setMsg(''); }
    catch (err) { notify(err.message, 'error'); } finally { setBusy(false); }
  };

  const inp = 'w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><UserPlus size={20} /></span>
          <div><h3 className="text-base font-extrabold text-slate-900">التقديم للانضمام</h3><p className="text-xs font-semibold text-slate-400">انضم لفريق GDG وابدأ رحلتك</p></div>
        </div>
        <form onSubmit={apply} className="space-y-3">
          <input className={inp} placeholder="الاسم الكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className={inp} placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inp} placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className={inp} value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
            {TRACKS_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea className={inp} rows={3} placeholder="لماذا تريد الانضمام؟" value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} />
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-3 text-sm font-extrabold text-white transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} إرسال الطلب
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-500"><ShieldAlert size={20} /></span>
          <div><h3 className="text-base font-extrabold text-slate-900">الشكاوي والملاحظات</h3><p className="text-xs font-semibold text-slate-400">تُرسل بسرية تامة للإدارة</p></div>
        </div>
        <form onSubmit={complaint} className="space-y-3">
          <textarea className={inp} rows={6} placeholder="اكتب شكواك أو ملاحظتك..." value={msg} onChange={(e) => setMsg(e.target.value)} />
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-rose-600 to-pink-600 py-3 text-sm font-extrabold text-white transition hover:from-rose-500 hover:to-pink-500 disabled:opacity-60">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} إرسال بسرية
          </button>
        </form>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <BadgeCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
          <p className="text-xs font-semibold leading-relaxed text-slate-500">جميع الرسائل تُعرض للإدارة وحدها دون الكشف عن هوية المرسل لضمان الحرية الكاملة في التعبير.</p>
        </div>
      </div>
    </div>
  );
}
