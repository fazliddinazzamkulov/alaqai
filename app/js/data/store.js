/* alaqai data layer.
 *
 * Every screen talks to data only through `db` below. All methods are async and
 * return plain objects, so the storage behind them can change without touching
 * the screens. The browser (localStorage) is the working copy; when a teacher
 * is signed in, sync.js copies every change to the alaqai server and back.
 *
 *   db.classes.list({ filter })   db.classes.get(id)
 *   db.classes.create(obj)        db.classes.update(id, patch)
 *   db.classes.remove(id)         db.settings.get() / db.settings.set(patch)
 *   db.subscribe(fn)              — called after any write
 */

const PREFIX = 'alaqai:v1:';

export const COLLECTIONS = [
  'classes',        // { id, name, subject }
  'students',       // { id, classId, name }
  'lessons',        // { id, classId, topic, subject, grade, lang, date, slot, status, parts }
  'marks',          // { id, lessonId, classId, studentId, date, present, points, grade }
  'presentations',  // { id, lessonId, title, lang, ratio, slides }
  'ksp',            // { id, lessonId, ... }
  'games',          // { id, lessonId, type, title, data }
  'tests',          // { id, lessonId, kind: 'test' | 'quiz', title, questions }
  'homework',       // { id, lessonId, classId, kind, dueDate, ... }
  'submissions',    // { id, homeworkId, studentId, status, grade, submittedAt }
  'usage',          // { id, kind: 'ai-lesson' | ..., at }
  'shares'          // { id, kind: 'ksp', refId, expiresAt, active, views: [{ name, at }] }
];

/* ---------- localStorage adapter ---------- */

const memory = {}; // fallback when localStorage is unavailable (private mode)

function readRaw(key) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v == null ? null : JSON.parse(v);
  } catch (e) {
    return memory[key] ?? null;
  }
}
function writeRaw(key, value) {
  memory[key] = value;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* quota or private mode */ }
}

const localAdapter = {
  async all(name) { return readRaw(name) || []; },
  async saveAll(name, rows) { writeRaw(name, rows); },
  async getSettings() { return readRaw('settings') || {}; },
  async saveSettings(s) { writeRaw('settings', s); }
};

let adapter = localAdapter;

/** Swap the storage; returns a function that puts the previous one back. */
export function useAdapter(next) {
  const prev = adapter;
  adapter = next;
  notify({ type: 'reset' });
  return () => { adapter = prev; notify({ type: 'reset' }); };
}

/** Read-only data handed over by the server (a shared lesson plan), kept in memory. */
export function memoryAdapter(bundle = {}, settings = {}) {
  const data = { ...bundle };
  return {
    async all(name) { return (data[name] || []).slice(); },
    async saveAll(name, rows) { data[name] = rows; },
    async getSettings() { return settings; },
    async saveSettings(s) { settings = s; }
  };
}

/* ---------- write hooks (cloud sync listens here) ---------- */

const writeHooks = new Set();
/** fn({ collection, ids }) after any change made in this browser; returns an unsubscribe. */
export function onLocalWrite(fn) { writeHooks.add(fn); return () => writeHooks.delete(fn); }
function wrote(collection, ids) {
  if (adapter !== localAdapter) return; // shared views in memory are never uploaded
  writeHooks.forEach(fn => { try { fn({ collection, ids }); } catch (e) { console.error(e); } });
}

/** Local rows and settings for the sync module (no hooks fired). */
export const local = {
  rows: name => readRaw(name) || [],
  setRows: (name, rows) => writeRaw(name, rows),
  settings: () => readRaw('settings') || {},
  setSettings: s => writeRaw('settings', s),
  meta: key => readRaw('__' + key),
  setMeta: (key, v) => writeRaw('__' + key, v),
  /** Deletes every collection and the settings (used when another account signs in). */
  wipe() { COLLECTIONS.forEach(n => writeRaw(n, [])); writeRaw('settings', {}); }
};

/** Changes that came from the server: write them and let open screens refresh. */
export function applyRemote(changes) {
  const by = {};
  let settings = null;
  for (const c of changes) {
    if (c.coll === 'settings') { settings = c.deleted ? {} : c.data; continue; }
    if (!COLLECTIONS.includes(c.coll)) continue;
    (by[c.coll] = by[c.coll] || []).push(c);
  }
  for (const [name, list] of Object.entries(by)) {
    const rows = readRaw(name) || [];
    const index = new Map(rows.map((r, i) => [r.id, i]));
    const drop = new Set();
    for (const c of list) {
      if (c.deleted) { drop.add(c.id); continue; }
      if (index.has(c.id)) rows[index.get(c.id)] = c.data;
      else { index.set(c.id, rows.length); rows.push(c.data); }
    }
    writeRaw(name, drop.size ? rows.filter(r => !drop.has(r.id)) : rows);
    notify({ type: 'external', collection: name });
  }
  if (settings) { writeRaw('settings', settings); notify({ type: 'settings', settings }); }
}

/* ---------- change notifications ---------- */

const listeners = new Set();
function notify(evt) { listeners.forEach(fn => { try { fn(evt); } catch (e) { console.error(e); } }); }

// Another tab changed the data — let the open screen refresh.
window.addEventListener('storage', e => {
  if (e.key && e.key.startsWith(PREFIX)) notify({ type: 'external', collection: e.key.slice(PREFIX.length) });
});

/* ---------- helpers ---------- */

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
const now = () => new Date().toISOString();

function matches(row, filter) {
  if (!filter) return true;
  if (typeof filter === 'function') return filter(row);
  return Object.keys(filter).every(k => row[k] === filter[k]);
}

function collection(name) {
  return {
    async list(filter) {
      const rows = await adapter.all(name);
      return rows.filter(r => matches(r, filter));
    },
    async get(id) {
      const rows = await adapter.all(name);
      return rows.find(r => r.id === id) || null;
    },
    async create(obj) {
      const rows = await adapter.all(name);
      const row = { id: uid(), createdAt: now(), ...obj };
      rows.push(row);
      await adapter.saveAll(name, rows);
      notify({ type: 'create', collection: name, row });
      wrote(name, [row.id]);
      return row;
    },
    async createMany(list) {
      const rows = await adapter.all(name);
      const created = list.map(obj => ({ id: uid(), createdAt: now(), ...obj }));
      await adapter.saveAll(name, rows.concat(created));
      notify({ type: 'create', collection: name, rows: created });
      wrote(name, created.map(r => r.id));
      return created;
    },
    async update(id, patch) {
      const rows = await adapter.all(name);
      const i = rows.findIndex(r => r.id === id);
      if (i < 0) return null;
      rows[i] = { ...rows[i], ...patch, updatedAt: now() };
      await adapter.saveAll(name, rows);
      notify({ type: 'update', collection: name, row: rows[i] });
      wrote(name, [id]);
      return rows[i];
    },
    async remove(id) {
      const rows = await adapter.all(name);
      await adapter.saveAll(name, rows.filter(r => r.id !== id));
      notify({ type: 'remove', collection: name, id });
      wrote(name, [id]);
    },
    async removeWhere(filter) {
      const rows = await adapter.all(name);
      const keep = rows.filter(r => !matches(r, filter));
      await adapter.saveAll(name, keep);
      notify({ type: 'remove', collection: name, count: rows.length - keep.length });
      if (keep.length !== rows.length) wrote(name, rows.filter(r => matches(r, filter)).map(r => r.id));
    }
  };
}

export const db = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  settings: {
    async get() { return adapter.getSettings(); },
    async set(patch) {
      const next = { ...(await adapter.getSettings()), ...patch, updatedAt: now() };
      await adapter.saveSettings(next);
      notify({ type: 'settings', settings: next });
      wrote('settings', ['settings']);
      return next;
    }
  },
  /** Removes everything that was created by "fill with an example". */
  async clearDemo() {
    for (const name of COLLECTIONS) await collection(name).removeWhere(r => r.demo === true);
    await db.settings.set({ demoLoaded: false });
  }
};
COLLECTIONS.forEach(name => { db[name] = collection(name); });
