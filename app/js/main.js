/* Platform entry: hash router + menu. Each screen is a module in views/ that
 * exports render(main, params) and may return a cleanup function. */
import { add, t, onChange } from './i18n.js';
import { db } from './data/store.js';
import { renderSidebar } from './sidebar.js';
import { icon } from './ui.js';

add({
  ru: { 'app.title': 'alaqai — платформа для учителей' },
  kk: { 'app.title': 'alaqai — мұғалімдерге арналған платформа' },
  en: { 'app.title': 'alaqai — a platform for teachers' }
});

// route → [module, menu item it belongs to, layout]
const ROUTES = {
  home: ['./views/home.js', 'home'],
  calendar: ['./views/calendar.js', 'calendar', 'tight'],
  classes: ['./views/classes.js', 'classes'],
  lessons: ['./views/lessons.js', 'lessons'],
  new: ['./views/newlesson.js', null],
  presentations: ['./views/presentations.js', 'presentations'],
  editor: ['./views/editor.js', 'presentations', 'bare'],
  tests: ['./views/tests.js', 'tests'],
  ksp: ['./views/ksp.js', 'ksp'],
  view: ['./views/view.js', null, 'bare'],
  homework: ['./views/soon.js', 'homework'],
  guide: ['./views/soon.js', 'guide'],
  plan: ['./views/soon.js', 'plan'],
  account: ['./views/soon.js', 'account'],
  lesson: ['./views/lessonmode.js', 'lessons', 'bare'],
  results: ['./views/soon.js', 'lessons']
};

const shell = document.querySelector('.shell');
const sidebar = document.getElementById('sidebar');
const main = document.getElementById('main');
let cleanup = null;
let current = null;

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [route, ...rest] = path.split('/');
  return { route: ROUTES[route] ? route : 'home', args: rest, query: Object.fromEntries(new URLSearchParams(query)) };
}

async function render() {
  const { route, args, query } = parseHash();
  const [modPath, menuId, layout] = ROUTES[route];
  current = { route, args, query };
  document.title = t('app.title');
  shell.classList.remove('menu-open');
  renderSidebar(sidebar, menuId);
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  main.className = 'main' + (layout ? ' ' + layout : '');
  shell.classList.toggle('is-bare', layout === 'bare');
  const mod = await import(modPath);
  if (current.route !== route) return; // navigated away while loading
  main.innerHTML = '';
  cleanup = (await mod.render(main, { route, args, query })) || null;
  main.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
onChange(render);

// Data changed (this tab or another one): refresh the menu and the open screen.
let pending = null;
db.subscribe(evt => {
  if (evt.silent) return;
  clearTimeout(pending);
  pending = setTimeout(() => {
    renderSidebar(sidebar, ROUTES[current.route][1]);
    if (evt.type === 'external' || evt.type === 'reset') render();
  }, 60);
});

// Narrow screens: the menu slides in from the left.
document.getElementById('menu-toggle').innerHTML = icon('menu', 18);
document.getElementById('menu-toggle').addEventListener('click', () => shell.classList.toggle('menu-open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') shell.classList.remove('menu-open'); });
document.addEventListener('click', e => {
  if (shell.classList.contains('menu-open') && !e.target.closest('#sidebar, #menu-toggle')) shell.classList.remove('menu-open');
});

render();

/** Re-render the open screen (used by views after they change data). */
export function refresh() { render(); }
