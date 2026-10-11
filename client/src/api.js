const BASE = '/api';

let token = localStorage.getItem('gdg_token') || '';

export function setToken(t) {
  token = t || '';
  if (t) localStorage.setItem('gdg_token', t);
  else localStorage.removeItem('gdg_token');
}

export function getToken() {
  return token;
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (_) {
    throw new Error('تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.');
  }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const msg = (data && data.message) || 'حدث خطأ غير متوقع';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),

  leaderboard: (track) => request('/leaderboard' + (track && track !== 'All' ? `?track=${encodeURIComponent(track)}` : '')),
  stats: () => request('/stats'),

  tracks: () => request('/tracks'),
  createTrack: (b) => request('/tracks', { method: 'POST', body: b }),
  addModule: (id, b) => request(`/tracks/${id}/modules`, { method: 'POST', body: b }),

  events: () => request('/events'),
  createEvent: (b) => request('/events', { method: 'POST', body: b }),
  registerEvent: (id) => request(`/events/${id}/register`, { method: 'POST' }),

  submissions: () => request('/submissions'),
  mySubmissions: () => request('/submissions/mine'),
  submitTask: (b) => request('/submissions', { method: 'POST', body: b }),
  reviewSubmission: (id, status) => request(`/submissions/${id}`, { method: 'PATCH', body: { status } }),

  complaints: () => request('/complaints'),
  sendComplaint: (message) => request('/complaints', { method: 'POST', body: { message } }),

  recruitment: () => request('/recruitment'),
  apply: (b) => request('/recruitment', { method: 'POST', body: b }),
  updateRecruitment: (id, status) => request(`/recruitment/${id}`, { method: 'PATCH', body: { status } }),

  users: () => request('/users'),
  setRole: (id, role) => request(`/users/${id}/role`, { method: 'PATCH', body: { role } }),
  strike: (id) => request(`/users/${id}/strike`, { method: 'PATCH' }),

  seasons: () => request('/seasons'),
  createSeason: (name) => request('/seasons', { method: 'POST', body: { name } }),
};

export async function downloadFile(path, filename) {
  const res = await fetch(BASE + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('تعذّر تنزيل الملف');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function openCertificate() {
  const res = await fetch(BASE + '/certificate', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('تعذّر توليد الشهادة');
  const html = await res.text();
  const w = window.open('', '_blank');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}
