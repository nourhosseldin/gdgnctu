import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, Shield, Users, 
  Award, AlertTriangle, FileText, Send, LogOut, CheckCircle, ChevronRight, Download, Plus, BarChart2
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('gdg_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('gdg_user') || 'null'));
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login/Register Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [track, setTrack] = useState('Flutter');
  const [role, setRole] = useState('Student');
  const [authError, setAuthError] = useState('');

  // Portal Data States
  const [tracks, setTracks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [recruitmentList, setRecruitmentList] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [seasons, setSeasons] = useState([]);

  // Form inputs for portal
  const [newSubLink, setNewSubLink] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  
  // Recruitment form
  const [recForm, setRecForm] = useState({ fullName: '', email: '', phone: '', trackPreference: 'Flutter', whyJoin: '' });
  const [anonymousMsg, setAnonymousMsg] = useState('');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [tracksRes, lbRes, eventsRes, seasonsRes] = await Promise.all([
        fetch(`${API_URL}/portal/tracks`),
        fetch(`${API_URL}/portal/leaderboard`),
        fetch(`${API_URL}/portal/events`),
        fetch(`${API_URL}/portal/seasons`)
      ]);

      setTracks(await tracksRes.json());
      setLeaderboard(await lbRes.json());
      setEvents(await eventsRes.json());
      setSeasons(await seasonsRes.json());

      if (user && ['SuperAdmin', 'President', 'HR', 'TrackHead'].includes(user.role)) {
        const subsRes = await fetch(`${API_URL}/portal/submissions`, { headers });
        if (subsRes.ok) setSubmissions(await subsRes.json());

        const recRes = await fetch(`${API_URL}/portal/recruitment`, { headers });
        if (recRes.ok) setRecruitmentList(await recRes.json());

        const compRes = await fetch(`${API_URL}/portal/complaints`, { headers });
        if (compRes.ok) setComplaints(await compRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, track, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('gdg_token', data.token);
      localStorage.setItem('gdg_user', JSON.stringify(data.user));
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('gdg_token');
    localStorage.removeItem('gdg_user');
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!selectedTrackId || !selectedLesson || !newSubLink) return alert('Please fill all fields');
    try {
      const res = await fetch(`${API_URL}/portal/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ trackId: selectedTrackId, lessonId: selectedLesson, linkOrFile: newSubLink })
      });
      if (res.ok) {
        alert('Task submitted successfully!');
        setNewSubLink('');
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gdg-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gdg-dark flex items-center justify-center gap-2">
              <span className="text-gdg-blue">GDG</span> Portal
            </h1>
            <p className="text-gdg-gray text-sm mt-2">Master PRD v3.0 - المنصة الإلكترونية الشاملة</p>
          </div>

          {authError && <div className="bg-red-50 text-gdg-red p-3 rounded-lg mb-4 text-sm text-center">{authError}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gdg-dark mb-1">الاسم الكامل</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gdg-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gdg-dark mb-1">التراك المفضل</label>
                  <select value={track} onChange={e => setTrack(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gdg-blue outline-none">
                    <option value="Flutter">Flutter</option>
                    <option value="Web">Web</option>
                    <option value="Cyber">Cyber</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Embedded">Embedded</option>
                    <option value="HR">HR</option>
                    <option value="PR">PR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gdg-dark mb-1">الدور</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gdg-blue outline-none">
                    <option value="Student">Student / Member</option>
                    <option value="TrackHead">Track Head</option>
                    <option value="HR">HR Team</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gdg-dark mb-1">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gdg-blue outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gdg-dark mb-1">كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gdg-blue outline-none" />
            </div>

            <button type="submit" className="w-full bg-gdg-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gdg-blue hover:underline">
              {isLogin ? 'ليس لديك حساب؟ انضم إلينا الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gdg-light flex">
      {/* Sidebar / Navigation */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 px-4 py-3 mb-6 border-b">
            <span className="text-2xl font-bold text-gdg-blue">GDG</span>
            <span className="text-lg font-semibold text-gdg-dark">Portal</span>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-gdg-blue' : 'text-gdg-gray hover:bg-gray-50'}`}>
              <LayoutDashboard size={20} /> لوحة التحكم (Dashboard)
            </button>
            <button onClick={() => setActiveTab('tracks')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'tracks' ? 'bg-blue-50 text-gdg-blue' : 'text-gdg-gray hover:bg-gray-50'}`}>
              <BookOpen size={20} /> مسار الدروس (Tracks Hub)
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'calendar' ? 'bg-blue-50 text-gdg-blue' : 'text-gdg-gray hover:bg-gray-50'}`}>
              <CalendarIcon size={20} /> التقويم والإيفنتات (Calendar)
            </button>
            {['SuperAdmin', 'President', 'HR', 'TrackHead'].includes(user.role) && (
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'admin' ? 'bg-blue-50 text-gdg-blue' : 'text-gdg-gray hover:bg-gray-50'}`}>
                <Shield size={20} /> لوحة التحكم الإدارية (HR & Admin)
              </button>
            )}
            <button onClick={() => setActiveTab('recruitment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'recruitment' ? 'bg-blue-50 text-gdg-blue' : 'text-gdg-gray hover:bg-gray-50'}`}>
              <Users size={20} /> بوابة التقديم والشكاوي
            </button>
          </nav>
        </div>

        <div className="border-t pt-4">
          <div className="px-4 mb-3">
            <p className="font-bold text-gdg-dark">{user.name}</p>
            <p className="text-xs text-gdg-gray capitalize">{user.role} - {user.track}</p>
            <p className="text-xs text-gdg-green mt-1 font-semibold">نقاط البوينتس: {user.points || 0} pts</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-gdg-red hover:bg-red-50 rounded-lg transition text-sm font-medium">
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gdg-blue to-blue-600 rounded-2xl p-8 text-white shadow-lg">
              <h1 className="text-3xl font-bold mb-2">أهلاً بك، {user.name} 👋</h1>
              <p className="text-blue-100">منصة GDG الإلكترونية المتكاملة لإدارة الأنشطة والتراكات والسيزونات.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
                <div>
                  <p className="text-sm text-gdg-gray font-medium">مجموع نقاطك</p>
                  <h3 className="text-2xl font-bold text-gdg-dark mt-1">{user.points || 0}</h3>
                </div>
                <Award className="text-gdg-yellow" size={32} />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
                <div>
                  <p className="text-sm text-gdg-gray font-medium">الإنذارات (Strikes)</p>
                  <h3 className="text-2xl font-bold text-gdg-red mt-1">{user.strikes || 0}</h3>
                </div>
                <AlertTriangle className="text-gdg-red" size={32} />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
                <div>
                  <p className="text-sm text-gdg-gray font-medium">التراك الحالي</p>
                  <h3 className="text-2xl font-bold text-gdg-blue mt-1">{user.track}</h3>
                </div>
                <BookOpen className="text-gdg-blue" size={32} />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
                <div>
                  <p className="text-sm text-gdg-gray font-medium">السيزون النشط</p>
                  <h3 className="text-xl font-bold text-gdg-green mt-1">2026-2027</h3>
                </div>
                <BarChart2 className="text-gdg-green" size={32} />
              </div>
            </div>

            {/* Leaderboard & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-bold text-gdg-dark mb-4 flex items-center gap-2">
                  <Award className="text-gdg-yellow" /> لوحة المتصدرين (Leaderboard)
                </h3>
                <div className="space-y-3">
                  {leaderboard.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gdg-gray'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gdg-dark">{item.name}</p>
                          <p className="text-xs text-gdg-gray">{item.track}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gdg-blue">{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-bold text-gdg-dark mb-4 flex items-center gap-2">
                  <FileText className="text-gdg-blue" /> شهادات الإنجاز
                </h3>
                <p className="text-sm text-gdg-gray mb-4">قم بتحميل شهادة إتمام التراك الخاصة بك بصيغة PDF فور اجتياز المتطلبات.</p>
                <a href={`${API_URL}/portal/certificate/${user.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-gdg-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                  <Download size={18} /> تحميل الشهادة (PDF)
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gdg-dark">مسار الدروس والروادماپ (Curriculum & Roadmap)</h1>
            <div className="grid grid-cols-1 gap-6">
              {tracks.map(track => (
                <div key={track._id} className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gdg-dark">{track.name}</h3>
                      <p className="text-xs text-gdg-gray">نوع التراك: {track.type}</p>
                    </div>
                    <button onClick={() => setSelectedTrackId(track._id)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${selectedTrackId === track._id ? 'bg-gdg-green text-white' : 'bg-gray-100 text-gdg-dark'}`}>
                      {selectedTrackId === track._id ? 'التراك المحدد' : 'اختر للتسليم'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {track.modules && track.modules.map((mod, mIndex) => (
                      <div key={mIndex} className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold text-gdg-blue mb-2">{mod.title}</h4>
                        <div className="space-y-2">
                          {mod.lessons && mod.lessons.map((les, lIndex) => (
                            <div key={lIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div>
                                <p className="font-semibold text-gdg-dark text-sm">{les.title}</p>
                                {les.videoUrl && <a href={les.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-gdg-blue hover:underline">رابط الفيديو</a>}
                              </div>
                              <button onClick={() => setSelectedLesson(les._id)} className={`text-xs px-3 py-1.5 rounded font-medium ${selectedLesson === les._id ? 'bg-gdg-blue text-white' : 'bg-gray-100 text-gdg-dark'}`}>
                                {selectedLesson === les._id ? 'تم اختيار الدرس' : 'حدد للتسليم'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedTrackId && selectedLesson && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border mt-6">
                <h3 className="text-lg font-bold text-gdg-dark mb-4">تسليم التاسك للدرس المحدد</h3>
                <form onSubmit={submitTask} className="flex gap-4">
                  <input type="text" placeholder="رابط الحل (GitHub / Google Drive / Vercel)" value={newSubLink} onChange={e => setNewSubLink(e.target.value)} required className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-gdg-blue" />
                  <button type="submit" className="bg-gdg-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">إرسال الحل</button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gdg-dark">التقويم والإيفنتات (Events & Workshops)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(ev => (
                <div key={ev._id} className="bg-white p-6 rounded-2xl shadow-sm border">
                  <span className="text-xs px-2.5 py-1 bg-blue-50 text-gdg-blue rounded-full font-semibold">{ev.type}</span>
                  <h3 className="text-xl font-bold text-gdg-dark mt-3">{ev.title}</h3>
                  <p className="text-sm text-gdg-gray mt-1">{ev.description}</p>
                  <div className="mt-4 pt-4 border-t text-xs text-gdg-gray flex justify-between items-center">
                    <span>المتحدث: {ev.speaker || 'GDG Team'}</span>
                    <button className="bg-gdg-blue text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-600 transition">سجل الآن</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && ['SuperAdmin', 'President', 'HR', 'TrackHead'].includes(user.role) && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gdg-dark">لوحة التحكم الإدارية (HR & Admin Panel)</h1>
            
            <div className="flex gap-4 mb-6">
              <a href={`${API_URL}/portal/export/users?authorization=Bearer ${token}`} className="bg-gdg-green text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Download size={16} /> تصدير بيانات المستخدمين (Excel)
              </a>
              <a href={`${API_URL}/portal/export/recruitment?authorization=Bearer ${token}`} className="bg-gdg-blue text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Download size={16} /> تصدير المتقدمين (Excel)
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-gdg-dark mb-4">مراجعة تسليمات التاسكات</h3>
              <div className="space-y-3">
                {submissions.map(sub => (
                  <div key={sub._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div>
                      <p className="font-semibold text-gdg-dark">{sub.student?.name} ({sub.student?.email})</p>
                      <a href={sub.linkOrFile} target="_blank" rel="noreferrer" className="text-xs text-gdg-blue hover:underline">رابط الحل: {sub.linkOrFile}</a>
                      <p className="text-xs text-gdg-gray mt-1">الحالة: <span className="font-bold">{sub.status}</span></p>
                    </div>
                    {sub.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          await fetch(`${API_URL}/portal/submissions/${sub._id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: 'Approved' })
                          });
                          fetchData();
                        }} className="bg-gdg-green text-white px-3 py-1 rounded text-xs font-semibold">قبول (+15 pts)</button>
                        <button onClick={async () => {
                          await fetch(`${API_URL}/portal/submissions/${sub._id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: 'Rejected' })
                          });
                          fetchData();
                        }} className="bg-gdg-red text-white px-3 py-1 rounded text-xs font-semibold">رفض</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border mt-6">
              <h3 className="text-lg font-bold text-gdg-dark mb-4">صندوق الشكاوي والاقتراحات السرية (Anonymous Feedback)</h3>
              <div className="space-y-3">
                {complaints.map((c, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border text-sm text-gdg-dark">
                    <p>{c.message}</p>
                    <span className="text-xs text-gdg-gray mt-2 block">{new Date(c.submittedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recruitment' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gdg-dark">بوابة التقديم والشكاوي السرية</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-bold text-gdg-dark mb-4">استمارة التقديم لانضمام أعضاء جدد</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_URL}/portal/recruitment`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(recForm)
                    });
                    if (res.ok) alert('تم تقديم طلبك بنجاح!');
                  } catch (err) { alert(err.message); }
                }} className="space-y-4">
                  <input type="text" placeholder="الاسم الكامل" value={recForm.fullName} onChange={e => setRecForm({...recForm, fullName: e.target.value})} required className="w-full px-4 py-2 border rounded-lg outline-none" />
                  <input type="email" placeholder="البريد الإلكتروني" value={recForm.email} onChange={e => setRecForm({...recForm, email: e.target.value})} required className="w-full px-4 py-2 border rounded-lg outline-none" />
                  <input type="text" placeholder="رقم الهاتف" value={recForm.phone} onChange={e => setRecForm({...recForm, phone: e.target.value})} required className="w-full px-4 py-2 border rounded-lg outline-none" />
                  <select value={recForm.trackPreference} onChange={e => setRecForm({...recForm, trackPreference: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none">
                    <option value="Flutter">Flutter</option>
                    <option value="Web">Web</option>
                    <option value="Cyber">Cyber</option>
                    <option value="HR">HR</option>
                  </select>
                  <textarea placeholder="لماذا تريد الانضمام إلينا؟" value={recForm.whyJoin} onChange={e => setRecForm({...recForm, whyJoin: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none"></textarea>
                  <button type="submit" className="w-full bg-gdg-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition">إرسال الاستمارة</button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-bold text-gdg-dark mb-4">صندوق الشكاوي والاقتراحات السرية (Anonymous)</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_URL}/portal/complaints`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: anonymousMsg })
                    });
                    if (res.ok) { alert('تم إرسال رسالتك بسرية تامة'); setAnonymousMsg(''); }
                  } catch (err) { alert(err.message); }
                }} className="space-y-4">
                  <textarea placeholder="اكتب شكواك أو اقتراحك بصورة سرية تماماً دون الكشف عن هويتك..." value={anonymousMsg} onChange={e => setAnonymousMsg(e.target.value)} required rows={5} className="w-full px-4 py-2 border rounded-lg outline-none"></textarea>
                  <button type="submit" className="w-full bg-gdg-red text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition">إرسال بسرية</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
