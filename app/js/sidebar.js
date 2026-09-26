/* The menu shared by every platform screen (design: "Меню (общий компонент)"). */
import { add, t, lang, setLang } from './i18n.js';
import { html, icon, initials } from './ui.js';
import { db } from './data/store.js';
import { weeklyUsage } from './plans.js';

add({
  ru: { 'nav.home': 'Главная', 'nav.lessons': 'Уроки', 'nav.calendar': 'Календарь', 'nav.classes': 'Классы', 'nav.presentations': 'Презентации', 'nav.tests': 'Тесты и игры', 'nav.ksp': 'КСП', 'nav.homework': 'Домашние задания', 'nav.guide': 'Инструкция', 'nav.plan': 'Подписка', 'nav.create': 'Создать урок', 'nav.start': 'Начать урок', 'nav.free': 'бесплатно', 'nav.teacher': 'Учитель', 'nav.guest': 'Гость', 'nav.menu': 'Меню', 'nav.lang': 'Язык интерфейса' },
  kk: { 'nav.home': 'Басты бет', 'nav.lessons': 'Сабақтар', 'nav.calendar': 'Күнтізбе', 'nav.classes': 'Сыныптар', 'nav.presentations': 'Презентациялар', 'nav.tests': 'Тест және ойын', 'nav.ksp': 'ҚМЖ', 'nav.homework': 'Үй тапсырмасы', 'nav.guide': 'Нұсқаулық', 'nav.plan': 'Жазылым', 'nav.create': 'Сабақ құру', 'nav.start': 'Сабақты бастау', 'nav.free': 'тегін', 'nav.teacher': 'Мұғалім', 'nav.guest': 'Қонақ', 'nav.menu': 'Мәзір', 'nav.lang': 'Интерфейс тілі' },
  en: { 'nav.home': 'Home', 'nav.lessons': 'Lessons', 'nav.calendar': 'Calendar', 'nav.classes': 'Classes', 'nav.presentations': 'Presentations', 'nav.tests': 'Tests & games', 'nav.ksp': 'Lesson plan', 'nav.homework': 'Homework', 'nav.guide': 'Guide', 'nav.plan': 'Subscription', 'nav.create': 'Create lesson', 'nav.start': 'Start lesson', 'nav.free': 'free', 'nav.teacher': 'Teacher', 'nav.guest': 'Guest', 'nav.menu': 'Menu', 'nav.lang': 'Interface language' }
});

const ITEMS = ['home', 'lessons', 'calendar', 'classes', 'presentations', 'tests', 'ksp', 'homework'];
const BOTTOM = ['guide', 'plan'];

export async function renderSidebar(el, active) {
  const [settings, usage, subs] = await Promise.all([db.settings.get(), weeklyUsage(), db.submissions.list(s => s.status === 'submitted')]);
  const user = window.Alaqai && window.Alaqai.getCachedUser && window.Alaqai.getCachedUser();
  const name = (user && user.name) || (settings.profile && settings.profile.name) || t('nav.teacher');
  const counts = { homework: subs.length || '' };
  const usageText = usage.max == null ? t('plan.unlimited') : usage.max === 0 ? t('plan.noAi') : t('plan.usedOf', { n: usage.used, max: usage.max });
  const item = (id, extra) => html`
    <a class="sb-item" href="#/${id}" ${id === active ? html`aria-current="page"` : ''}>
      <span class="sb-chip">${icon(id)}</span><span class="sb-label">${t('nav.' + id)}</span>${extra}
    </a>`;
  el.innerHTML = html`
    <a class="logo" href="#/home" aria-label="alaqai">alaqai<span class="logo-dot"></span></a>
    <a class="sb-create" href="#/new">${icon('plus')}${t('nav.create')}</a>
    <a class="sb-start" href="#/lesson/file">${icon('play', 13)}${t('nav.start')}</a>
    <nav aria-label="${t('nav.menu')}">
      ${ITEMS.map(id => item(id, counts[id] ? html`<span class="sb-count">${counts[id]}</span>` : ''))}
    </nav>
    <div class="sb-spacer"></div>
    ${item('guide', html`<span class="sb-badge">${t('nav.free')}</span>`)}
    ${item('plan', '')}
    <a class="sb-plan" href="#/plan">
      <span class="sb-plan-row"><b>${usage.plan.name}</b><span>${usageText}</span></span>
      ${usage.max ? html`<span class="sb-bar"><i style="width:${usage.percent}%"></i></span>` : ''}
    </a>
    <div class="sb-lang" role="group" aria-label="${t('nav.lang')}">
      ${[['kk', 'ҚАЗ'], ['ru', 'РУС'], ['en', 'ENG']].map(([id, label]) => html`<button type="button" data-lang="${id}" lang="${id}" aria-pressed="${id === lang()}">${label}</button>`)}
    </div>
    <a class="sb-profile" href="#/account">
      <span class="avatar">${settings.profile && settings.profile.photo ? html`<img src="${settings.profile.photo}" alt="">` : initials(name)}</span>
      <span class="who"><b>${name}</b><span>${user ? t('nav.teacher') : t('nav.guest')}</span></span>
      ${icon('chevronRight')}
    </a>`;
  el.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
}

export { ITEMS, BOTTOM };
