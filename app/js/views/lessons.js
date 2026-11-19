/* My lessons: every generated lesson, newest first. */
import { add, t } from '../i18n.js';
import { html } from '../ui.js';
import { db } from '../data/store.js';
import { shortDate } from '../school.js';

add({
  kk: { 'ls.title': 'Сабақтарым', 'ls.empty': 'Әзірге сабақ жоқ.', 'ls.open': 'Ашу', 'ls.run': 'Өткізу' },
  ru: { 'ls.title': 'Мои уроки', 'ls.empty': 'Уроков пока нет.', 'ls.open': 'Открыть', 'ls.run': 'Провести' },
  en: { 'ls.title': 'My lessons', 'ls.empty': 'No lessons yet.', 'ls.open': 'Open', 'ls.run': 'Run' }
});

export async function render(main) {
  const [lessons, classes] = await Promise.all([db.lessons.list(), db.classes.list()]);
  const cname = id => (classes.find(c => c.id === id) || {}).name || '';
  const list = lessons.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  main.innerHTML = html`<div class="wrap">
    <div class="row" style="justify-content:space-between;align-items:center"><h1>${t('ls.title')}</h1><a class="btn b" href="#/new">${t('nav.create')}</a></div>
    <section class="card">${list.length ? list.map(l => html`<div class="list-row"><div class="grow"><div class="ttl">${l.topic}</div><div class="sub">${[cname(l.classId), l.subject, l.date ? shortDate(l.date) : ''].filter(Boolean).join(' · ')}</div></div>
      <a class="btn sm k" href="#/live/${l.id}">${t('ls.run')}</a><a class="btn sm" href="#/lesson/${l.id}">${t('ls.open')}</a></div>`) : html`<div class="empty">${t('ls.empty')}</div>`}</section>
  </div>`.toString();
}
