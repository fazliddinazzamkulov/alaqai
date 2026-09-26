/* Placeholder for screens that are built in later stages (see PROGRESS.md). */
import { add, t } from '../i18n.js';
import { html } from '../ui.js';

add({
  ru: { 'soon.title': 'Раздел скоро появится', 'soon.text': 'Этот экран делаем на следующих этапах. Пока можно вести классы, календарь и смотреть статистику.', 'soon.home': 'На главную' },
  kk: { 'soon.title': 'Бөлім жақында қосылады', 'soon.text': 'Бұл экран келесі кезеңдерде жасалады. Әзірге сыныптарды, күнтізбені және статистиканы қолдана аласыз.', 'soon.home': 'Басты бетке' },
  en: { 'soon.title': 'Coming soon', 'soon.text': 'This screen is being built in the next stages. For now you can manage classes, the calendar and see statistics.', 'soon.home': 'Go home' }
});

export function render(main) {
  main.innerHTML = html`
    <div class="soon"><div class="empty">
      <h2>${t('soon.title')}</h2><p>${t('soon.text')}</p>
      <div class="row"><a class="btn-k" href="#/home">${t('soon.home')}</a></div>
    </div></div>`;
}
