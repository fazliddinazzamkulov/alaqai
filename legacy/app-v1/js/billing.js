/* Payments. The page never touches card data itself: the payment provider's
 * widget / Kaspi QR is started by the server (/api/billing/*), which knows the
 * merchant keys. Until a provider is connected every method reports "off". */
import { db } from './data/store.js';
import { DEFAULT_PLANS } from './plans.js';

export const METHODS = ['card', 'kaspi', 'google', 'apple'];

async function api(path, opts) {
  if (!window.Alaqai) throw Object.assign(new Error('offline'), { code: 'offline' });
  try { return await window.Alaqai.api(path, opts); } catch (e) {
    const code = e.status === 404 || (e.data && e.data.error === 'not_configured') ? 'not_configured' : e.status === 401 ? 'login' : e.status ? 'other' : 'offline';
    throw Object.assign(new Error(e.message), { code });
  }
}

/** Which payment methods are switched on (server), e.g. { card: true, kaspi: false, … }. */
export async function billingConfig() {
  try { const r = await api('/api/billing/config'); return { ...Object.fromEntries(METHODS.map(m => [m, false])), ...(r.methods || {}) }; } catch (e) { return Object.fromEntries(METHODS.map(m => [m, false])); }
}

/** Plans with the admin's changes applied (the server's prices win). */
export async function plansTable() {
  const s = await db.settings.get();
  let server = {};
  try { server = (await api('/api/billing/config')).plans || {}; } catch (e) { /* offline: defaults */ }
  const out = { ...DEFAULT_PLANS };
  for (const id of Object.keys(out)) out[id] = { ...out[id], ...((s.plans || {})[id] || {}), ...(server[id] || {}) };
  return out;
}

/** Promo code → { off: 0.3 } or { freeMonths: 1 }, checked by the server; falls back to codes the admin saved here. */
export async function checkPromo(code, plan) {
  const c = String(code || '').trim().toUpperCase();
  if (!c) return null;
  try { return (await api('/api/billing/promo?code=' + encodeURIComponent(c) + '&plan=' + plan)).promo || null; } catch (e) {
    const local = ((await db.settings.get()).promos || []).find(p => p.code === c && (!p.till || p.till >= new Date().toISOString().slice(0, 10)) && (!p.plan || p.plan === 'all' || p.plan === plan) && (!p.limit || (p.used || 0) < p.limit));
    return local || null;
  }
}

export function priceFor(plans, plan, period, promo) {
  const p = plans[plan];
  const base = period === '6' ? p.price6 : p.priceMonth;
  let discount = 0;
  if (promo && promo.off) discount = Math.round(base * promo.off);
  if (promo && promo.freeMonths) discount = Math.min(base, p.priceMonth * promo.freeMonths);
  return { base, discount, total: Math.max(0, base - discount) };
}

/** 'pending' | 'paid' | 'failed' for an order started here. */
export async function paymentStatus(id) {
  try { return (await api('/api/billing/status/' + encodeURIComponent(id))).status; } catch (e) { return 'pending'; }
}

/** Starts a payment on the server; resolves with what to show next ({ redirectUrl } or { qr, orderId }). */
export const startPayment = body => api('/api/billing/checkout', { method: 'POST', body });
