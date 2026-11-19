/* Sign-in for the platform: Google only, through /api/auth/google
 * (GOOGLE_CLIENT_ID on the server; the page gets it from /api/config). */

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

const LAST = 'alaqai_last_user';
const remember = u => { try { localStorage.setItem(LAST, JSON.stringify({ name: u.name || '', email: u.email || '', school: u.school || '' })); } catch (e) { /* private mode */ } };
const forget = () => { try { localStorage.removeItem(LAST); } catch (e) { /* private mode */ } };
function lastUser() { try { return JSON.parse(localStorage.getItem(LAST) || 'null'); } catch (e) { return null; } }

/** Who is signed in: asks the server. Without internet a teacher who signed in on this
 *  device before keeps working (changes are sent later); a new visitor must sign in. */
export async function authState() {
  const a = await ready();
  if (!a) return { user: lastUser(), offline: true };
  await a.configReady;
  try {
    const { user } = await a.api('/api/auth/me');
    if (user) remember(user); else forget();
    return { user: user || null, offline: false };
  } catch (e) {
    return e.status ? { user: null, offline: false } : { user: lastUser(), offline: true };
  }
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

async function call(path, body) {
  const a = await ready();
  if (!a) throw new AuthError('offline');
  try {
    return await a.api(path, { method: 'POST', body });
  } catch (e) {
    if (e.status === 404 || e.status === 501 || (e.data && e.data.error === 'not_configured')) throw new AuthError('not_configured');
    if (e.status === 429) throw new AuthError('too_many');
    if (!e.status) throw new AuthError('offline');
    throw new AuthError('other', e.message);
  }
}

/** Sends unsaved changes, then signs out; false = some changes could not be sent (offline). */
export async function logout() {
  const a = await ready();
  const clean = await signOutFlush().catch(() => false);
  if (a) await a.logout();
  forget();
  return clean;
}
export const logoutEverywhere = () => call('/api/auth/logout-all', {});
