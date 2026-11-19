/* Cloud sync. The browser keeps working with its own copy (fast, works without
 * internet); when a teacher is signed in, every change is sent to the alaqai
 * server and changes from their other devices are brought in.
 *
 *   outbox  — ids changed here and not yet sent (kept, so nothing is lost offline)
 *   cursor  — the last server change this browser has seen
 *   owner   — whose data is in this browser; another account → local copy is replaced */
import { local, onLocalWrite, applyRemote, COLLECTIONS } from './store.js';

const PUSH_DELAY = 1200;
const PULL_EVERY = 30000;
const BATCH = 200;

let user = null;
let timer = null;
let pulling = null;
let pushing = null;
let poll = null;
const listeners = new Set();
let state = { status: 'local', pending: 0, error: null }; // local | syncing | synced | offline | error

const api = (path, opts) => window.Alaqai.api(path, opts);
const outbox = () => local.meta('outbox') || {};
const setOutbox = o => local.setMeta('outbox', o);
const cursorKey = () => 'rev:' + (user && user.id);

function setState(patch) {
  state = { ...state, ...patch, pending: Object.keys(outbox()).length };
  listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } });
}
export const syncState = () => state;
export function onSyncState(fn) { listeners.add(fn); fn(state); return () => listeners.delete(fn); }

function enqueue(coll, ids) {
  const box = outbox();
  ids.forEach(id => { box[coll + '/' + id] = { coll, id }; });
  setOutbox(box);
}

/** Every row in this browser goes to the outbox (first sign-in after working as a guest). */
function enqueueAll() {
  COLLECTIONS.forEach(name => enqueue(name, local.rows(name).filter(r => !r.demo).map(r => r.id)));
  if (Object.keys(local.settings()).length) enqueue('settings', ['settings']);
}

function schedulePush(delay = PUSH_DELAY) {
  clearTimeout(timer);
  timer = setTimeout(() => { push(); }, delay);
}

function currentOp({ coll, id }, cache) {
  if (coll === 'settings') {
    const s = local.settings();
    return { coll, id, data: s, updatedAt: s.updatedAt || new Date().toISOString() };
  }
  const rows = cache[coll] || (cache[coll] = new Map(local.rows(coll).map(r => [r.id, r])));
  const row = rows.get(id);
  if (row && row.demo) return null; // examples stay in this browser
  return row ? { coll, id, data: row, updatedAt: row.updatedAt || row.createdAt } : { coll, id, data: null, updatedAt: new Date().toISOString() };
}

async function push() {
  if (!user) return;
  if (pushing) return pushing;
  pushing = (async () => {
    await null; // let `pushing` be set before a quick run clears it in `finally`
    try {
      for (;;) {
        const box = outbox();
        const keys = Object.keys(box).slice(0, BATCH);
        if (!keys.length) break;
        setState({ status: 'syncing' });
        const cache = {};
        const ops = keys.map(k => currentOp(box[k], cache)).filter(Boolean);
        const res = ops.length ? await api('/api/sync', { method: 'POST', body: { ops } }) : { rejected: [] };
        const after = outbox();
        keys.forEach(k => { delete after[k]; });
        setOutbox(after);
        if (res.rejected && res.rejected.length) applyRemote(res.rejected);
      }
      setState({ status: 'synced', error: null });
    } catch (e) {
      const offline = !e.status;
      setState({ status: offline ? 'offline' : 'error', error: e.data && e.data.error || e.message });
      if (e.status === 401) stop();
      else schedulePush(offline ? 15000 : 60000);
    } finally {
      pushing = null;
    }
  })();
  return pushing;
}

/** True when the server sends back exactly what this browser already has (its own change). */
function sameAsLocal(r, cache) {
  if (r.coll === 'settings') return !r.deleted && JSON.stringify(r.data) === JSON.stringify(local.settings());
  const rows = cache[r.coll] || (cache[r.coll] = new Map(local.rows(r.coll).map(x => [x.id, JSON.stringify(x)])));
  const row = rows.get(r.id);
  return r.deleted ? !row : row === JSON.stringify(r.data);
}

async function pull() {
  if (!user) return;
  if (pulling) return pulling;
  pulling = (async () => {
    await null;
    try {
      let since = local.meta(cursorKey()) || 0;
      for (;;) {
        const res = await api('/api/sync?since=' + since);
        // A change still waiting in the outbox here is newer — keep it.
        const box = outbox();
        const cache = {};
        const incoming = res.records.filter(r => !box[r.coll + '/' + r.id] && !sameAsLocal(r, cache));
        if (incoming.length) applyRemote(incoming);
        since = res.rev;
        local.setMeta(cursorKey(), since);
        if (!res.more) break;
      }
      if (!Object.keys(outbox()).length) setState({ status: 'synced', error: null });
    } catch (e) {
      setState({ status: e.status ? 'error' : 'offline', error: e.message });
    } finally {
      pulling = null;
    }
  })();
  return pulling;
}

function stop() {
  user = null;
  clearTimeout(timer);
  clearInterval(poll);
  setState({ status: 'local' });
}

async function start(u) {
  const owner = local.meta('owner');
  if (owner && owner !== u.id) {
    // Someone else's lessons were in this browser (a shared school computer): replace them.
    local.wipe();
    setOutbox({});
  } else if (!owner) {
    enqueueAll(); // work done before signing in is kept and uploaded
  }
  local.setMeta('owner', u.id);
  user = u;
  await pull();
  await push();
  clearInterval(poll);
  poll = setInterval(() => { if (document.visibilityState === 'visible') pull(); }, PULL_EVERY);
}

/** Sends what is left before signing out; then this browser forgets the account's data. */
export async function signOutFlush() {
  if (!user) return true;
  await push();
  const clean = !Object.keys(outbox()).length;
  if (clean) {
    local.wipe();
    local.setMeta('owner', null);
    local.setMeta(cursorKey(), 0);
  }
  stop();
  return clean;
}

export const syncNow = () => pull().then(push);

export function initSync() {
  if (!window.Alaqai) { setTimeout(initSync, 100); return; }
  onLocalWrite(({ collection, ids }) => {
    enqueue(collection, ids);
    if (user) schedulePush();
    else setState({});
  });
  window.Alaqai.onAuthChange(u => {
    if (u && (!user || user.id !== u.id)) start(u);
    if (!u && user) stop();
  });
  window.addEventListener('online', () => { if (user) syncNow(); });
  document.addEventListener('visibilitychange', () => {
    if (!user) return;
    if (document.visibilityState === 'hidden') push();
    else pull();
  });
}
