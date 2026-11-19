/* alaqai admin (/admin): router, menu and the sign-in gate. Only admins and
 * the owner get live data; anyone can open the example-data mode to review
 * the interface. */
import { add, t, lang, setLang, onChange } from '../i18n.js';
import { html, icon, initials } from '../ui.js';
import { me, getMode, setMode, savedMode } from './source.js';
import { renderGoogle, googleConfigured } from '../auth.js';
import * as V from './views.js';
import { watchControls } from '../controls.js';

add({
  ru: { 'ad.title': 'alaqai — админка', 'ad.overview': 'Обзор', 'ad.db': 'База данных', 'ad.user': 'Аккаунты', 'ad.plans': 'Подписки и тарифы', 'ad.payments': 'Платежи', 'ad.ai': 'ИИ: ключи и расходы', 'ad.admins': 'Администраторы', 'ad.log': 'Журнал действий',
    'ad.owner': 'Владелец', 'ad.admin': 'Администратор', 'ad.openApp': 'Открыть платформу', 'ad.demoWho': 'Пример данных', 'ad.exitDemo': 'Выйти из примера',
    'ad.gate': 'Вход для администраторов', 'ad.gateNote': 'Войдите аккаунтом, у которого есть роль администратора или владельца (OWNER_EMAILS / OWNER_PHONES на сервере).', 'ad.notAdmin': 'Аккаунт {e} — не администратор. Попросите владельца выдать роль.',
    'ad.noGoogle': 'Вход через Google ещё не настроен (GOOGLE_CLIENT_ID на сервере).', 'ad.phone': 'Войти по номеру телефона', 'ad.demo': 'Посмотреть на примере данных', 'ad.demoNote': 'Сервер ещё не подключён? Интерфейс можно проверить на выдуманных данных — они нигде не сохраняются.', 'ad.menu': 'Меню' },
  kk: { 'ad.title': 'alaqai — әкімші', 'ad.overview': 'Шолу', 'ad.db': 'Дерекқор', 'ad.user': 'Аккаунттар', 'ad.plans': 'Жазылымдар мен тарифтер', 'ad.payments': 'Төлемдер', 'ad.ai': 'ЖИ: кілттер мен шығын', 'ad.admins': 'Әкімшілер', 'ad.log': 'Әрекеттер журналы',
    'ad.owner': 'Иесі', 'ad.admin': 'Әкімші', 'ad.openApp': 'Платформаны ашу', 'ad.demoWho': 'Деректер мысалы', 'ad.exitDemo': 'Мысалдан шығу',
    'ad.gate': 'Әкімшілерге кіру', 'ad.gateNote': 'Әкімші немесе иесі рөлі бар аккаунтпен кіріңіз (сервердегі OWNER_EMAILS / OWNER_PHONES).', 'ad.phone': 'Телефон нөмірімен кіру', 'ad.notAdmin': '{e} аккаунты әкімші емес. Иесінен рөл беруді сұраңыз.',
    'ad.noGoogle': 'Google арқылы кіру әлі бапталмаған (сервердегі GOOGLE_CLIENT_ID).', 'ad.demo': 'Деректер мысалымен көру', 'ad.demoNote': 'Сервер әлі қосылмаған ба? Интерфейсті ойдан алынған деректермен тексеруге болады — олар ешқайда сақталмайды.', 'ad.menu': 'Мәзір' },
  en: { 'ad.title': 'alaqai — admin', 'ad.overview': 'Overview', 'ad.db': 'Database', 'ad.user': 'Accounts', 'ad.plans': 'Plans & subscriptions', 'ad.payments': 'Payments', 'ad.ai': 'AI: keys and costs', 'ad.admins': 'Administrators', 'ad.log': 'Activity log',
    'ad.owner': 'Owner', 'ad.admin': 'Administrator', 'ad.openApp': 'Open the platform', 'ad.demoWho': 'Example data', 'ad.exitDemo': 'Leave the example',
    'ad.gate': 'Administrator sign-in', 'ad.gateNote': 'Sign in with an account that has the admin or owner role (OWNER_EMAILS / OWNER_PHONES on the server).', 'ad.notAdmin': 'The account {e} is not an administrator. Ask the owner for the role.',
    'ad.noGoogle': 'Google sign-in is not set up yet (GOOGLE_CLIENT_ID on the server).', 'ad.phone': 'Sign in with a phone number', 'ad.demo': 'See it with example data', 'ad.demoNote': 'Server not connected yet? Review the interface with made-up data — nothing is saved anywhere.', 'ad.menu': 'Menu' }
});

const NAV = [
  ['overview', 'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z'],
  ['db', 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  ['user', 'M12 3.5a4 4 0 1 0 0 8a4 4 0 1 0 0-8M4 21a8 8 0 0 1 16 0'],
  ['plans', 'M3 8l4 4 5-7 5 7 4-4-2 11H5z'],
  ['payments', 'M3 6h18v12H3zM3 10h18M7 15h3'],
  ['ai', 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'],
  ['admins', 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'],
  ['log', 'M4 5h16M4 10h16M4 15h10M4 20h7']
];
const ROUTES = { overview: V.overview, db: V.database, user: V.account, plans: V.plans, payments: V.paymentsPage, ai: V.aiPage, admins: V.admins, log: V.logPage };

const shell = document.querySelector('.shell');
const side = document.getElementById('sidebar');
const main = document.getElementById('main');
let who = null;
let alerts = {};

function parse() {
  const [path, q = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [route, ...args] = path.split('/');
  return { route: ROUTES[route] ? route : 'overview', args, query: Object.fromEntries(new URLSearchParams(q)) };
}

function sidebar(active) {
  const demo = getMode() === 'demo';
  const name = demo ? t('ad.demoWho') : (who && (who.name || who.email || who.phone)) || '';
  side.innerHTML = html`
    <div class="as-logo"><span class="logo">alaqai<span class="logo-dot"></span></span><span class="as-badge">admin</span></div>
    <div class="as-url">alaqai.online/admin</div>
    <nav aria-label="${t('ad.menu')}">${NAV.map(([id, d]) => html`<a class="as-item" href="#/${id}" ${id === active ? html`aria-current="page"` : ''}>${icon(d, 18)}<span class="grow">${t('ad.' + id)}</span>${alerts[id] ? html`<span class="as-alert">${alerts[id]}</span>` : ''}</a>`)}</nav>
    <span class="grow"></span>
    <div class="as-lang">${[['kk', 'ҚАЗ'], ['ru', 'РУС'], ['en', 'ENG']].map(([id, l]) => html`<button type="button" data-lang="${id}" aria-pressed="${id === lang()}">${l}</button>`)}</div>
    <div class="as-me"><span class="avatar">${initials(name)}</span><div class="grow"><b>${name}</b><span>${demo ? html`<button type="button" class="link-btn" data-exitdemo>${t('ad.exitDemo')}</button>` : who && who.role === 'owner' ? t('ad.owner') : t('ad.admin')}</span></div>
      <a class="as-open" href="../app/" aria-label="${t('ad.openApp')}" title="${t('ad.openApp')}">${icon('M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', 16)}</a></div>`;
  side.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  const ex = side.querySelector('[data-exitdemo]');
  if (ex) ex.onclick = () => { setMode('login'); start(); };
}

let cleanup = null;
async function render() {
  document.title = t('ad.title');
  shell.classList.remove('menu-open');
  const { route, args, query } = parse();
  sidebar(route);
  if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
  main.innerHTML = '';
  try {
    cleanup = (await ROUTES[route](main, { args, query, who, setAlerts: a => { alerts = { ...alerts, ...a }; sidebar(route); } })) || null;
  } catch (e) {
    main.innerHTML = html`<div class="empty"><h2>${e.status === 403 ? t('ad.notAdmin', { e: who && who.email }) : e.message}</h2></div>`;
  }
}

function gate(user) {
  shell.classList.add('is-bare');
  side.innerHTML = '';
  main.innerHTML = html`<div class="ag"><div class="ag-card">
      <div class="as-logo dark"><span class="logo">alaqai<span class="logo-dot"></span></span><span class="as-badge">admin</span></div>
      <h1 class="li-title">${t('ad.gate')}</h1><p class="li-lead">${t('ad.gateNote')}</p>
      ${user && user.notAdmin ? html`<div class="li-err">${t('ad.notAdmin', { e: user.email })}</div>` : ''}
      <div class="li-google" data-google>${googleConfigured() ? '' : html`<div class="co-off"><span>${t('ad.noGoogle')}</span></div>`}</div>
      <a class="btn-k btn-md ag-phone" href="../app/#/login?next=admin">${t('ad.phone')}</a>
      <hr><p class="muted-note">${t('ad.demoNote')}</p><button type="button" class="btn-o btn-md" data-demo>${t('ad.demo')}</button>
    </div></div>`;
  const g = main.querySelector('[data-google]');
  if (googleConfigured()) renderGoogle(g, { onSignIn: () => start(), width: 360 });
  main.querySelector('[data-demo]').onclick = () => { setMode('demo'); start(); };
}

async function start() {
  if (window.Alaqai) await window.Alaqai.configReady;
  const user = await me();
  if (user && !user.notAdmin) { who = user; setMode('live'); }
  else if (savedMode() === 'demo') { who = null; setMode('demo'); }
  else { gate(user); return; }
  shell.classList.remove('is-bare');
  render();
}

window.addEventListener('hashchange', () => { if (getMode() !== 'login') render(); });
onChange(() => (getMode() === 'login' ? start() : render()));
document.getElementById('menu-toggle').innerHTML = icon('menu', 18);
document.getElementById('menu-toggle').addEventListener('click', () => shell.classList.toggle('menu-open'));
document.addEventListener('click', e => { if (shell.classList.contains('menu-open') && !e.target.closest('#sidebar, #menu-toggle')) shell.classList.remove('menu-open'); });

watchControls();
start();
