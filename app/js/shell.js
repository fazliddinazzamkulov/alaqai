/* Left menu: create button, five sections, language switch, account. */
import { add, t, lang, setLang } from './i18n.js';
import { html, icon, initials } from './ui.js';

add({
  kk: { 'nav.create': 'Сабақ құру', 'nav.home': 'Басты бет', 'nav.lessons': 'Сабақтарым', 'nav.live': 'Сабақ өткізу', 'nav.growth': 'Оқушылар өсуі', 'nav.classes': 'Сыныптар', 'nav.guest': 'Қонақ', 'nav.signin': 'Кіру', 'nav.logout': 'Шығу' },
  ru: { 'nav.create': 'Создать урок', 'nav.home': 'Главная', 'nav.lessons': 'Мои уроки', 'nav.live': 'Провести урок', 'nav.growth': 'Рост учеников', 'nav.classes': 'Классы', 'nav.guest': 'Гость', 'nav.signin': 'Войти', 'nav.logout': 'Выйти' },
  en: { 'nav.create': 'Create lesson', 'nav.home': 'Home', 'nav.lessons': 'My lessons', 'nav.live': 'Run a lesson', 'nav.growth': 'Student growth', 'nav.classes': 'Classes', 'nav.guest': 'Guest', 'nav.signin': 'Sign in', 'nav.logout': 'Sign out' }
});

export const IC = {
  home: 'M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  lessons: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  live: 'M6 4l14 8-14 8z',
  growth: 'M3 3v18h18M19 9l-5 5-4-4-3 3',
  classes: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'
};
const ITEMS = [['home', '#/home'], ['lessons', '#/lessons'], ['live', '#/live'], ['growth', '#/growth'], ['classes', '#/classes']];

export function renderSide(el, active, user) {
  el.innerHTML = html`
    <a class="logo" href="#/home">ala<b>q</b>ai</a>
    <a class="btn b lg" href="#/new" style="margin:0 0 18px">${icon('plus', 22)}${t('nav.create')}</a>
    ${ITEMS.map(([id, href]) => html`<a class="nav${id === active ? ' on' : ''}" href="${href}">${icon(IC[id], 22)}${t('nav.' + id)}</a>`)}
    <div class="side-grow"></div>
    <div class="langs">${['kk', 'ru', 'en'].map(l => html`<button type="button" data-lang="${l}" class="${l === lang() ? 'on' : ''}">${{ kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' }[l]}</button>`)}</div>
    ${user ? html`<div class="me-row"><a class="me" href="#/home"><span class="ava">${initials(user.name || user.email || '?')}</span><span>${user.name || user.email || ''}<small>${user.school || ''}</small></span></a><button type="button" class="logout" data-logout>${t('nav.logout')}</button></div>`
      : html`<a class="me" href="#/login"><span class="ava">?</span><span>${t('nav.guest')}<small>${t('nav.signin')}</small></span></a>`}`.toString();
  el.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => setLang(b.dataset.lang); });
}
