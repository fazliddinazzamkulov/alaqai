/* alaqai v2 teacher app: hash router. Each screen is a module in views/ that
 * exports render(main, { args, query }) and may return a cleanup function. */
import { onChange } from './i18n.js';
import { db } from './data/store.js';
import { renderSide } from './shell.js';
import { initSync } from './data/sync.js';
import { authState, logout, TERMS_VERSION } from './auth.js';

// route → [module, menu item, layout]
const ROUTES = {
  home: ['./views/home.js', 'home'],
  new: ['./views/newlesson.js', null],
  lessons: ['./views/lessons.js', 'lessons'],
  lesson: ['./views/lesson.js', 'lessons', 'bare'],
  live: ['./views/live.js', 'live', 'bare'],
  present: ['./views/present.js', 'lessons', 'bare'],
  growth: ['./views/growth.js', 'growth'],
  classes: ['./views/classes.js', 'classes'],
  login: ['./views/login.js', null, 'bare']
};
// Old links (homework #/s/…, plan viewer #/view/…) keep working in the first version.
const LEGACY = ['s', 'view', 'preview'];

const shell = document.getElementById('shell');
const side = document.getElementById('side');
const main = document.getElementById('main');
let cleanup = null, current = null, user = null, auth = null;

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [route, ...args] = path.split('/');
  return { route, args, query: Object.fromEntries(new URLSearchParams(query)) };
}

async function render() {
  const p = parseHash();
  if (LEGACY.includes(p.route)) { location.replace('../legacy/app-v1/' + location.hash); return; }
  const route = ROUTES[p.route] ? p.route : 'home';
  // Everything except the sign-in screen needs a Google account: work done as a
  // guest could never reach the server.
  if (route === 'login') auth = null;
  else {
    if (!auth) { auth = await authState(); user = auth.user; }
    // No account, or the current rules not accepted yet → the sign-in screen asks for it.
    if (!auth.user || (!auth.offline && auth.user.termsVersion !== TERMS_VERSION)) { location.replace('#/login?next=' + encodeURIComponent('#/' + location.hash.replace(/^#\/?/, ''))); return; }
  }
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

// Phone menu: the burger opens the side menu as a drawer; any choice closes it.
const setMenu = open => { shell.classList.toggle('menu-open', open); document.getElementById('burger').setAttribute('aria-expanded', String(open)); };
document.getElementById('burger').addEventListener('click', () => setMenu(!shell.classList.contains('menu-open')));
document.getElementById('side-back').addEventListener('click', () => setMenu(false));
side.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

window.addEventListener('hashchange', () => { window.scrollTo(0, 0); setMenu(false); render(); });
onChange(render);

// Background changes refresh list screens only, never a screen the teacher is working in.
let pending = null;
db.subscribe(evt => {
  if (evt.silent || !current) return;
  clearTimeout(pending);
  pending = setTimeout(() => { if (['home', 'lessons', 'growth', 'classes'].includes(current.route) && evt.type === 'external') render(); }, 250);
});

// Examples from the first version (marked demo) never reach the server: remove them.
db.settings.get().then(s => (s && s.demoLoaded ? db.clearDemo() : null)).catch(() => {});
initSync();
render();
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-logout]')) return;
  await logout();
  auth = null; user = null;
  location.hash = '#/login';
});
