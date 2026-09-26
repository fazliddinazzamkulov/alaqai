/* alaqai data layer.
 *
 * Every screen talks to data only through `db` below. All methods are async and
 * return plain objects, so the storage behind them can change without touching
 * the screens: today it is the browser (localStorage), later an HTTP adapter
 * that calls the alaqai server and its real database.
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
  'usage'           // { id, kind: 'ai-lesson' | ..., at }
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

/** Swap the storage (e.g. to the HTTP adapter once the server database is live). */
export function useAdapter(next) { adapter = next; notify({ type: 'reset' }); }

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
      return row;
    },
    async createMany(list) {
      const rows = await adapter.all(name);
      const created = list.map(obj => ({ id: uid(), createdAt: now(), ...obj }));
      await adapter.saveAll(name, rows.concat(created));
      notify({ type: 'create', collection: name, rows: created });
      return created;
    },
    async update(id, patch) {
      const rows = await adapter.all(name);
      const i = rows.findIndex(r => r.id === id);
      if (i < 0) return null;
      rows[i] = { ...rows[i], ...patch, updatedAt: now() };
      await adapter.saveAll(name, rows);
      notify({ type: 'update', collection: name, row: rows[i] });
      return rows[i];
    },
    async remove(id) {
      const rows = await adapter.all(name);
      await adapter.saveAll(name, rows.filter(r => r.id !== id));
      notify({ type: 'remove', collection: name, id });
    },
    async removeWhere(filter) {
      const rows = await adapter.all(name);
      const keep = rows.filter(r => !matches(r, filter));
      await adapter.saveAll(name, keep);
      notify({ type: 'remove', collection: name, count: rows.length - keep.length });
    }
  };
}

export const db = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  settings: {
    async get() { return adapter.getSettings(); },
    async set(patch) {
      const next = { ...(await adapter.getSettings()), ...patch };
      await adapter.saveSettings(next);
      notify({ type: 'settings', settings: next });
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
