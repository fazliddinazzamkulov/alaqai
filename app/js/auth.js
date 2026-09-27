/* Sign-in for the platform. Google works through the existing server route
 * (/api/auth/google, needs GOOGLE_CLIENT_ID on the server and in the page).
 * Phone + SMS code and "sign out everywhere" call server routes that are
 * added when the SMS provider is chosen; until then they answer
 * { code: 'not_configured' } and the screens say so. */

import { signOutFlush } from './data/sync.js';

const API = () => window.Alaqai;

export class AuthError extends Error {
  constructor(code, message) { super(message || code); this.code = code; }
}

/** The signed-in user from the server (null = guest). Waits for api.js to load. */
export async function currentUser() {
  const a = await ready();
  if (!a) return null;
  await a.configReady;
  const cached = a.getCachedUser();
  return cached || a.fetchMe();
}

function ready() {
  return new Promise(res => {
    let n = 0;
    const tick = () => { if (window.Alaqai) res(window.Alaqai); else if (n++ > 40) res(null); else setTimeout(tick, 50); };
    tick();
  });
}

export const googleConfigured = () => !!window.ALAQAI_GOOGLE_CLIENT_ID;

/** Loads Google Identity Services and draws its button into `el`. */
export async function renderGoogle(el, { onSignIn, onError, width = 400 } = {}) {
  const a = await ready();
  if (!a || !googleConfigured()) return false;
  if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  a.renderGoogleButton(el, { onSignIn, onError, buttonConfig: { theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with', width } });
  return true;
}

async function call(path, body, { codeCheck = false } = {}) {
  const a = await ready();
  if (!a) throw new AuthError('offline');
  try {
    return await a.api(path, { method: 'POST', body });
  } catch (e) {
    if (e.status === 404 || e.status === 501 || (e.data && e.data.error === 'not_configured')) throw new AuthError('not_configured');
    if (e.status === 429) throw new AuthError('too_many');
    if (codeCheck && (e.status === 400 || e.status === 401)) throw new AuthError('bad_code');
    if (!e.status) throw new AuthError('offline');
    throw new AuthError('other', e.message);
  }
}

/** Phone in +7XXXXXXXXXX form, or null. */
export function normPhone(input) {
  const d = String(input || '').replace(/\D/g, '');
  const ten = d.length === 11 && (d[0] === '7' || d[0] === '8') ? d.slice(1) : d;
  return ten.length === 10 ? '+7' + ten : null;
}
export function maskPhone(p) {
  const d = String(p || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+7 ${d.slice(0, 3)} ${d.slice(3, 6)} •• ${d.slice(8)}` : p;
}

export const sendSmsCode = phone => call('/api/auth/sms/send', { phone });
export async function verifySmsCode(phone, code) {
  const res = await call('/api/auth/sms/verify', { phone, code }, { codeCheck: true });
  const a = await ready();
  if (a) await a.fetchMe();
  return res.user;
}
/** Sends unsaved changes, then signs out; false = some changes could not be sent (offline). */
export async function logout() {
  const a = await ready();
  const clean = await signOutFlush().catch(() => false);
  if (a) await a.logout();
  return clean;
}
export const logoutEverywhere = () => call('/api/auth/logout-all', {});
