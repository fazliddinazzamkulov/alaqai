/* Where the admin screens get their data.
 *   live — the alaqai server (/api/admin/*), for a signed-in admin or owner;
 *   demo — generated example data, so the interface can be reviewed before the
 *          server, payments and database are connected (clearly labelled).
 * Things the server cannot do yet (payments, promo codes, plan prices) answer
 * { soon: true } in live mode; plan prices and promo codes are then kept in
 * this browser so the platform's subscription and checkout screens use them. */
import { db } from '../data/store.js';
import { DEFAULT_PLANS } from '../plans.js';

let mode = 'login';
export const getMode = () => mode;
export function setMode(m) { mode = m; try { sessionStorage.setItem('alaqai_admin_mode', m); } catch (e) { /* private mode */ } }
export function savedMode() { try { return sessionStorage.getItem('alaqai_admin_mode'); } catch (e) { return null; } }

const api = (path, opts) => window.Alaqai.api(path, opts);
const SOON = { soon: true };

/* ---------- demo data (deterministic) ---------- */

const NAMES = ['Айгерим Бекова', 'Ерлан Сейтов', 'Дана Касымова', 'Нурлан Беков', 'Мадина Омарова', 'Тимур Алиев', 'Асель Нурланова', 'Руслан Ибраев', 'Зарина Ермекова', 'Олжас Бекенов', 'Сабина Ахмедова', 'Айша Султанова',
  'Бауыржан Жумабаев', 'Гульнара Садыкова', 'Данияр Касенов', 'Жанар Абилова', 'Камила Юсупова', 'Марат Токтаров', 'Сауле Мухамеджанова', 'Арман Исаев', 'Динара Серикова', 'Ильяс Мамыров', 'Лаура Каримова', 'Азамат Нургалиев',
  'Алуа Есимова', 'Максат Нургалиев', 'Индира Сулейменова', 'Ельдар Хасенов', 'Томирис Кайратова', 'Мирас Оспанов', 'Аружан Сейтова', 'Ерасыл Абенов'];
const LATIN = ['aigerim', 'erlan', 'dana', 'nurlan', 'madina', 'timur', 'asel', 'ruslan', 'zarina', 'olzhas', 'sabina', 'aisha', 'baurzhan', 'gulnara', 'daniyar', 'zhanar', 'kamila', 'marat', 'saule', 'arman', 'dinara', 'ilyas', 'laura', 'azamat', 'alua', 'maksat', 'indira', 'eldar', 'tomiris', 'miras', 'aruzhan', 'erasyl'];
const SCHOOLS = ['[Школа №1]', '[Гимназия №5]', '[Школа №12]', '[Лицей №2]', '[Школа №7]', '[Школа №3]', '[Школа №9]', '[Школа №4]'];
const REGIONS = ['Алматы', 'Астана', 'Шымкент', 'Туркестанская обл.', 'Карагандинская обл.', 'Актобе'];

function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
let demoCache = null;
export function demo() {
  if (demoCache) return demoCache;
  const r = rng(42);
  const now = Date.now(), day = 86400000;
  const pick = a => a[Math.floor(r() * a.length)];
  const users = Array.from({ length: 64 }, (_, i) => {
    const plan = r() < 0.62 ? 'basic' : r() < 0.72 ? 'standard' : r() < 0.8 ? 'max' : 'school';
    const status = plan === 'basic' ? 'free' : r() < 0.08 ? 'debt' : r() < 0.05 ? 'blocked' : 'active';
    const phone = r() < 0.5;
    const since = new Date(now - Math.floor(r() * 240) * day).toISOString();
    const last = new Date(now - Math.floor(r() * r() * 30) * day).toISOString();
    return { id: 10400 + i, name: NAMES[i % NAMES.length], email: phone ? null : `${LATIN[i % LATIN.length][0]}•••${i}@gmail.com`,
      phone: phone ? `+7 7${Math.floor(r() * 90 + 10)} ••• •• ${String(Math.floor(r() * 90 + 10))}` : null, via: phone ? 'phone' : 'google', school: pick(SCHOOLS), region: pick(REGIONS),
      role: i === 0 ? 'owner' : i === 5 ? 'admin' : 'teacher', plan, status, aiWeek: plan === 'basic' ? null : Math.floor(r() * 21), since, last, lessons: Math.floor(r() * 60),
      until: plan === 'basic' ? null : new Date(now + Math.floor(r() * 60 + 1) * day).toISOString(), autoRenew: r() < 0.8, aiCostMonth: plan === 'basic' ? 0 : Math.round(r() * 3000) };
  });
  const methods = ['kaspi', 'kaspi', 'kaspi', 'card', 'card', 'apple', 'google'];
  const payments = [];
  users.filter(u => u.plan === 'standard' || u.plan === 'max').forEach((u, k) => {
    for (let m = 0; m < 1 + (k % 4); m++) {
      const six = r() < 0.2;
      const sum = u.plan === 'max' ? (six ? 49900 : 9990) : (six ? 25900 : 4990);
      payments.push({ id: 'p' + payments.length, userId: u.id, who: u.name, plan: u.plan, period: six ? '6' : '1', method: pick(methods), sum, status: r() < 0.08 ? 'failed' : 'paid', at: new Date(now - Math.floor(r() * 90) * day).toISOString() });
    }
  });
  payments.sort((a, b) => b.at.localeCompare(a.at));
  const log = ['Вошёл(ла) по номеру телефона', 'Создал(а) урок «Past Simple»', 'Скачал(а) КСП (Word)', 'Провёл(а) урок в 7 «А»', 'Отправил(а) домашнее задание', 'Создал(а) урок «Present Continuous»', 'Оплатил(а) Стандарт через Kaspi QR', 'Перешёл(ла) с Базового на Стандарт'];
  demoCache = { users, payments, log, schools: [{ name: '[Гимназия №5]', teachers: 40, status: 'new' }, { name: '[Школа №12]', teachers: 25, status: 'new' }] };
  return demoCache;
}

/* ---------- normalising server users ---------- */

function fromServer(u) {
  const plan = { free: 'basic' }[u.subscription_plan] || u.subscription_plan || 'basic';
  const status = u.disabled ? 'blocked' : u.subscription_status === 'suspended' ? 'debt' : plan === 'basic' ? 'free' : 'active';
  return { id: u.id, name: u.name || u.email, email: u.email, phone: null, via: 'google', school: '', region: '', role: u.role, plan, status, aiWeek: null,
    since: u.created_at, last: u.last_login_at, until: u.subscription_expires_at, raw: u };
}

/* ---------- the API used by the screens ---------- */

export async function me() {
  if (!window.Alaqai) return null;
  const u = await window.Alaqai.fetchMe();
  return u && (u.role === 'admin' || u.role === 'owner') ? u : u ? { ...u, notAdmin: true } : null;
}

export async function users(q = '') {
  if (mode === 'demo') {
    const s = q.trim().toLowerCase();
    return demo().users.filter(u => !s || [u.name, u.email, u.phone, u.school].some(v => v && v.toLowerCase().includes(s)));
  }
  return ((await api('/api/admin/users' + (q ? '?q=' + encodeURIComponent(q) : ''))).users || []).map(fromServer);
}

export async function user(id) {
  const list = await users();
  return list.find(u => String(u.id) === String(id)) || null;
}

/** patch: { plan, until, blocked, role } */
export async function updateUser(u, patch) {
  if (mode === 'demo') { Object.assign(u, patch.plan ? { plan: patch.plan, status: patch.plan === 'basic' ? 'free' : 'active' } : {}, patch.until ? { until: patch.until } : {}, patch.blocked != null ? { status: patch.blocked ? 'blocked' : u.plan === 'basic' ? 'free' : 'active' } : {}, patch.role ? { role: patch.role } : {}); return u; }
  const body = {};
  if (patch.plan) { body.subscriptionPlan = patch.plan; body.subscriptionStatus = 'active'; }
  if (patch.until) body.subscriptionExpiresAt = patch.until;
  if (patch.blocked != null) body.disabled = patch.blocked;
  if (patch.role) body.role = patch.role;
  return fromServer({ ...(await api('/api/admin/users/' + u.id, { method: 'PATCH', body })).user, created_at: u.since, last_login_at: u.last });
}

export async function stats() {
  if (mode === 'demo') {
    const d = demo();
    const month = Date.now() - 30 * 86400000;
    const paid = d.payments.filter(p => p.status === 'paid');
    const revenue = paid.filter(p => Date.parse(p.at) > month).reduce((s, p) => s + p.sum, 0);
    return { totalUsers: d.users.length, newWeek: d.users.filter(u => Date.parse(u.since) > Date.now() - 7 * 86400000).length, activeSubs: d.users.filter(u => u.plan !== 'basic' && u.status === 'active').length,
      revenue, aiCost: Math.round(revenue * 0.24), lessons: d.users.reduce((s, u) => s + u.lessons, 0), failed: d.payments.filter(p => p.status === 'failed').length, schoolRequests: d.schools.length };
  }
  const s = await api('/api/admin/stats');
  return { totalUsers: s.totalUsers, activeSubs: s.activeSubs, trial: s.trialSubs, suspended: s.suspended, aiToday: s.aiToday, revenue: null, aiCost: null, lessons: null };
}

export async function payments() {
  if (mode === 'demo') return demo().payments;
  try { return (await api('/api/admin/payments')).payments || []; } catch (e) { return SOON; }
}

export async function userLog(u) {
  if (mode === 'demo') return demo().log.map((e, i) => ({ at: i < 5 ? ['08:14', '08:20', '08:21', '09:25', '09:31'][i] : ['вчера', '12.09', '12.08'][i - 5], text: e }));
  try { return ((await api('/api/admin/audit-log')).entries || []).filter(e => e.target === u.email || e.actor_email === u.email).slice(0, 30).map(e => ({ at: e.at.slice(0, 16).replace('T', ' '), text: e.action })); } catch (e) { return []; }
}

export async function auditLog() {
  if (mode === 'demo') return demo().users.slice(0, 20).map((u, i) => ({ at: new Date(Date.now() - i * 3600000 * 5).toISOString(), actor: 'owner@alaqai.online', action: ['user.update', 'apikey.set', 'user.update', 'session.revoke'][i % 4], target: u.email || u.phone }));
  return ((await api('/api/admin/audit-log')).entries || []).map(e => ({ at: e.at, actor: e.actor_email, action: e.action, target: e.target }));
}

export async function sessionsOf(u) {
  if (mode === 'demo') return [];
  return ((await api('/api/admin/sessions')).sessions || []).filter(s => s.user_id === u.id);
}
export const revokeSession = id => api('/api/admin/sessions/' + id, { method: 'DELETE' });

/* API keys (the Gemini key and image search keys live only on the server). */
export async function keys() {
  if (mode === 'demo') return { providers: ['gemini', 'gemini_image', 'pexels', 'pixabay', 'unsplash'], maxSlots: 3, keys: [{ id: 1, provider: 'gemini', slot: 1, label: 'основной', preview: 'AIza…9f2c', active: 1, last_used_at: new Date().toISOString(), fail_count: 0 }, { id: 2, provider: 'pexels', slot: 1, label: '', preview: '563…a1', active: 1, last_used_at: null, fail_count: 0 }] };
  return api('/api/admin/keys');
}
export const saveKey = body => mode === 'demo' ? Promise.resolve() : api('/api/admin/keys', { method: 'POST', body });
export const toggleKey = (id, active) => mode === 'demo' ? Promise.resolve() : api('/api/admin/keys/' + id, { method: 'PATCH', body: { active } });
export const deleteKey = id => mode === 'demo' ? Promise.resolve() : api('/api/admin/keys/' + id, { method: 'DELETE' });

/* Plans, promo codes, payment methods. */
export async function plansConfig() {
  try { if (mode === 'live') return { ...DEFAULT_PLANS, ...((await api('/api/admin/plans')).plans || {}) }; } catch (e) { /* not on the server yet */ }
  const s = await db.settings.get();
  return { ...DEFAULT_PLANS, ...(s.plans || {}) };
}
export async function savePlans(plans) {
  if (mode === 'demo') return 'demo';
  if (mode === 'live') { try { await api('/api/admin/plans', { method: 'PUT', body: { plans } }); return 'server'; } catch (e) { /* fall back */ } }
  await db.settings.set({ plans });
  return 'local';
}
export async function promos() {
  if (mode === 'live') { try { return (await api('/api/admin/promos')).promos; } catch (e) { /* fall back */ } }
  const s = await db.settings.get();
  if (s.promos) return s.promos;
  return mode === 'demo' ? [{ code: 'TEACHER2026', off: 0.3, plan: 'standard', used: 84, limit: 200, till: '2026-12-31' }, { code: 'SCHOOL50', off: 0.5, plan: 'max', used: 12, limit: 30, till: '2026-11-30' }, { code: 'OPENLESSON', freeMonths: 1, plan: 'standard', used: 41, limit: 100, till: '2026-10-31' }, { code: 'KAZAKH', off: 0.2, plan: 'all', used: 17, limit: 0, till: '' }] : [];
}
export async function savePromos(list) {
  if (mode === 'demo') return 'demo';
  if (mode === 'live') { try { await api('/api/admin/promos', { method: 'PUT', body: { promos: list } }); return 'server'; } catch (e) { /* fall back */ } }
  await db.settings.set({ promos: list });
  return 'local';
}
export async function paymentMethods() {
  let on = {};
  try { on = (await api('/api/billing/config')).methods || {}; } catch (e) { /* none connected */ }
  const share = mode === 'demo' ? { kaspi: 54, card: 31, apple: 9, google: 6 } : {};
  return ['card', 'kaspi', 'apple', 'google'].map(id => ({ id, on: !!on[id], share: share[id] }));
}
export async function schoolRequests() { return mode === 'demo' ? demo().schools : []; }
