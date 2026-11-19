/* alaqai v2 teacher app: hash router. Each screen is a module in views/ that
 * exports render(main, { args, query }) and may return a cleanup function. */
import { onChange } from './i18n.js';
import { db } from './data/store.js';
import { renderSide } from './shell.js';
import { initSync } from './data/sync.js';
import { currentUser } from './auth.js';

// route → [module, menu item, layout]
const ROUTES = {
  home: ['./views/home.js', 'home'],
  new: ['./views/newlesson.js', null],
  lessons: ['./views/lessons.js', 'lessons'],
  lesson: ['./views/lesson.js', 'lessons', 'bare'],
  live: ['./views/live.js', 'live', 'bare'],
  growth: ['./views/growth.js', 'growth'],
  classes: ['./views/classes.js', 'classes'],
  login: ['./views/login.js', null, 'bare']
};
// Old links (homework #/s/…, plan viewer #/view/…) keep working in the first version.
const LEGACY = ['s', 'view', 'preview'];

const shell = document.getElementById('shell');
const side = document.getElementById('side');
const main = document.getElementById('main');
let cleanup = null, current = null, user = null;

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [route, ...args] = path.split('/');
  return { route, args, query: Object.fromEntries(new URLSearchParams(query)) };
}

async function render() {
  const p = parseHash();
  if (LEGACY.includes(p.route)) { location.replace('../legacy/app-v1/' + location.hash); return; }
  const route = ROUTES[p.route] ? p.route : 'home';
  const [mod, menu, layout] = ROUTES[route];
  current = { ...p, route };
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  shell.classList.toggle('bare', layout === 'bare');
  renderSide(side, menu, user);
  document.querySelectorAll('.modal-back').forEach(el => el.remove());
  const m = await import(mod);
  if (current.route !== route) return;
  main.innerHTML = '';
  cleanup = (await m.render(main, { args: p.args, query: p.query })) || null;
  main.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
onChange(render);

// Background changes refresh list screens only, never a screen the teacher is working in.
let pending = null;
db.subscribe(evt => {
  if (evt.silent || !current) return;
  clearTimeout(pending);
  pending = setTimeout(() => { if (['home', 'lessons', 'growth', 'classes'].includes(current.route) && evt.type === 'external') render(); }, 250);
});

initSync();
render();
currentUser().then(u => { user = u; if (current) renderSide(side, ROUTES[current.route][1], user); }).catch(() => {});
