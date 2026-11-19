/* Screen 20: plans. Prices and limits come from plans.js (the admin can change
 * them); payment itself is the checkout screen. */
import { add, t } from '../i18n.js';
import { html, segmented } from '../ui.js';
import { db } from '../data/store.js';
import { DEFAULT_PLANS, weeklyUsage } from '../plans.js';

add({
  ru: {
    'sub.title': 'Подписка', 'sub.lead': 'Базовые функции — бесплатно и без ограничений', 'sub.month': 'Помесячно', 'sub.six': '6 месяцев · выгоднее',
    'sub.yours': 'Ваш тариф · {p}', 'sub.usage': '{n} из {max} про-уроков на этой неделе', 'sub.unl': 'Про-уроки без ограничений', 'sub.noAi': 'ИИ-уроки доступны в Стандарте и Max', 'sub.reset': 'обновится в понедельник',
    'sub.forever': 'навсегда', 'sub.current': 'ваш тариф', 'sub.nolimit': 'без лимита', 'sub.perMonth': '{p} ₸ / мес', 'sub.per6': '{p} ₸ / 6 мес', 'sub.or6': 'или {p} ₸ за 6 месяцев', 'sub.eq': '≈ {p} ₸ в месяц · выгода {s} ₸', 'sub.noTime': 'без ограничений по времени',
    'sub.deal': 'Договорная', 'sub.dealSub': 'для всех учителей школы', 'sub.always': 'Доступен всегда', 'sub.renew': 'Продлить', 'sub.go': 'Перейти на {p}', 'sub.contact': 'Связаться',
    'sub.b1': 'Своя презентация и урок — сколько угодно', 'sub.b2': 'Журнал и посещаемость', 'sub.b3': 'Шумомер с таймером', 'sub.b4': 'Колесо фортуны и выбор ученика', 'sub.b5': 'Тестовые игры без ИИ', 'sub.b6': 'Базовый анализ и статистика без ИИ',
    'sub.s1': 'Всё из Базового', 'sub.s2': '{n} про-уроков в неделю: КСП, презентация, игры, тест и ДЗ с ИИ', 'sub.s3': 'Анализ уроков с ИИ', 'sub.s4': 'Анализ результатов ДЗ', 'sub.s5': 'КСП в Word и ссылка для наблюдателей',
    'sub.m1': 'Всё из Стандарта', 'sub.soon': 'Скоро', 'sub.soonBadge': 'скоро', 'sub.soonSub': 'новые игры и уроки без ограничений', 'sub.soonCta': 'Скоро будет', 'sub.mNewGames': 'Новые игры', 'sub.mUnlimited': 'Количество уроков не ограничено', 'sub.m2': 'Уроки без ограничений', 'sub.m3': 'Агент при подготовке к уроку', 'sub.m4': 'Агент для открытого урока — {n} раза в месяц',
    'sub.k1': 'Подключение всех учителей школы', 'sub.k2': 'Условия и цена — по договорённости', 'sub.k3': 'Напишите нам — обсудим'
  },
  kk: {
    'sub.title': 'Жазылым', 'sub.lead': 'Негізгі мүмкіндіктер — тегін және шектеусіз', 'sub.month': 'Ай сайын', 'sub.six': '6 ай · тиімдірек',
    'sub.yours': 'Сіздің тариф · {p}', 'sub.usage': 'Осы аптада {max} про-сабақтың {n}-і', 'sub.unl': 'Про-сабақтар шектеусіз', 'sub.noAi': 'ЖИ-сабақтар Стандарт пен Max тарифтерінде', 'sub.reset': 'дүйсенбіде жаңарады',
    'sub.forever': 'мәңгі', 'sub.current': 'сіздің тариф', 'sub.nolimit': 'шектеусіз', 'sub.perMonth': '{p} ₸ / ай', 'sub.per6': '{p} ₸ / 6 ай', 'sub.or6': 'немесе 6 айға {p} ₸', 'sub.eq': '≈ айына {p} ₸ · үнем {s} ₸', 'sub.noTime': 'уақыт шектеуі жоқ',
    'sub.deal': 'Келісім бойынша', 'sub.dealSub': 'мектептің барлық мұғаліміне', 'sub.always': 'Әрқашан қолжетімді', 'sub.renew': 'Ұзарту', 'sub.go': '{p} тарифіне өту', 'sub.contact': 'Байланысу',
    'sub.b1': 'Өз презентацияңыз бен сабағыңыз — шексіз', 'sub.b2': 'Журнал және қатысу', 'sub.b3': 'Таймері бар шуөлшегіш', 'sub.b4': 'Сәттілік дөңгелегі және оқушы таңдау', 'sub.b5': 'ЖИ-сыз тест ойындары', 'sub.b6': 'ЖИ-сыз базалық талдау мен статистика',
    'sub.s1': 'Базалықтың бәрі', 'sub.s2': 'Аптасына {n} про-сабақ: ҚМЖ, презентация, ойындар, тест және ҮТ ЖИ-мен', 'sub.s3': 'Сабақты ЖИ-мен талдау', 'sub.s4': 'ҮТ нәтижелерін талдау', 'sub.s5': 'ҚМЖ Word-та және бақылаушыға сілтеме',
    'sub.m1': 'Стандарттың бәрі', 'sub.soon': 'Жақында', 'sub.soonBadge': 'жақында', 'sub.soonSub': 'жаңа ойындар және шектеусіз сабақтар', 'sub.soonCta': 'Жақында болады', 'sub.mNewGames': 'Жаңа ойындар', 'sub.mUnlimited': 'Сабақ саны шектелмейді', 'sub.m2': 'Шектеусіз сабақтар', 'sub.m3': 'Сабаққа дайындықта агент', 'sub.m4': 'Ашық сабаққа агент — айына {n} рет',
    'sub.k1': 'Мектептің барлық мұғалімін қосу', 'sub.k2': 'Шарттары мен бағасы — келісім бойынша', 'sub.k3': 'Бізге жазыңыз — талқылаймыз'
  },
  en: {
    'sub.title': 'Subscription', 'sub.lead': 'The basics are free, with no time limit', 'sub.month': 'Monthly', 'sub.six': '6 months · save more',
    'sub.yours': 'Your plan · {p}', 'sub.usage': '{n} of {max} pro lessons this week', 'sub.unl': 'Unlimited pro lessons', 'sub.noAi': 'AI lessons come with Standard and Max', 'sub.reset': 'resets on Monday',
    'sub.forever': 'forever', 'sub.current': 'your plan', 'sub.nolimit': 'no limit', 'sub.perMonth': '{p} ₸ / mo', 'sub.per6': '{p} ₸ / 6 mo', 'sub.or6': 'or {p} ₸ for 6 months', 'sub.eq': '≈ {p} ₸ a month · save {s} ₸', 'sub.noTime': 'no time limit',
    'sub.deal': 'By agreement', 'sub.dealSub': 'for every teacher in the school', 'sub.always': 'Always available', 'sub.renew': 'Renew', 'sub.go': 'Switch to {p}', 'sub.contact': 'Contact us',
    'sub.b1': 'Your own slides and lessons — as many as you like', 'sub.b2': 'Register and attendance', 'sub.b3': 'Noise meter with a timer', 'sub.b4': 'Wheel of fortune and student picker', 'sub.b5': 'Test games without AI', 'sub.b6': 'Basic analysis and statistics without AI',
    'sub.s1': 'Everything in Basic', 'sub.s2': '{n} pro lessons a week: lesson plan, slides, games, test and homework with AI', 'sub.s3': 'AI lesson analysis', 'sub.s4': 'Homework results analysis', 'sub.s5': 'Lesson plan in Word and an observer link',
    'sub.m1': 'Everything in Standard', 'sub.soon': 'Coming soon', 'sub.soonBadge': 'soon', 'sub.soonSub': 'new games and unlimited lessons', 'sub.soonCta': 'Coming soon', 'sub.mNewGames': 'New games', 'sub.mUnlimited': 'No limit on the number of lessons', 'sub.m2': 'Unlimited lessons', 'sub.m3': 'An agent to help you prepare', 'sub.m4': 'Open-lesson agent — {n} times a month',
    'sub.k1': 'Every teacher in the school', 'sub.k2': 'Terms and price by agreement', 'sub.k3': 'Write to us and we’ll talk'
  }
});

export const WHATSAPP = 'https://wa.me/77759018100';
const money = n => new Intl.NumberFormat('ru-RU').format(n);

export async function render(main, { query }) {
  const [settings, usage] = await Promise.all([db.settings.get(), weeklyUsage()]);
  const plans = { ...DEFAULT_PLANS, ...(settings.plans || {}) };
  const cur = usage.plan.id;
  let period = query.period === '6' ? '6' : '1';

  const draw = () => {
    const st = plans.standard;
    const price = p => period === '1'
      ? { price: t('sub.perMonth', { p: money(p.priceMonth) }), sub: t('sub.or6', { p: money(p.price6) }) }
      : { price: t('sub.per6', { p: money(p.price6) }), sub: t('sub.eq', { p: money(Math.round(p.price6 / 6)), s: money(p.priceMonth * 6 - p.price6) }) };
    const cta = (id, name) => id === cur ? t('sub.renew') : t('sub.go', { p: name });
    const cards = [
      { id: 'basic', name: t('plan.basic'), badge: cur === 'basic' ? t('sub.current') : t('sub.forever'), price: '0 ₸', sub: t('sub.noTime'), items: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'].map(k => t('sub.' + k)), cta: html`<span class="btn-o sub-cta off">${t('sub.always')}</span>` },
      { id: 'standard', name: t('plan.standard'), badge: cur === 'standard' ? t('sub.current') : '', ...price(st), items: [t('sub.s1'), t('sub.s2', { n: st.aiLessonsPerWeek }), t('sub.s3'), t('sub.s4'), t('sub.s5')], cta: html`<a class="btn-o sub-cta" href="#/checkout?plan=standard&period=${period}">${cta('standard', t('plan.standard'))}</a>` },
      // Max is announced but not on sale yet: no price, just what it will bring.
      { id: 'max', name: t('plan.max'), badge: t('sub.soonBadge'), price: t('sub.soon'), sub: t('sub.soonSub'), items: [t('sub.m1'), t('sub.mNewGames'), t('sub.mUnlimited')], cta: html`<span class="btn-w sub-cta off">${t('sub.soonCta')}</span>`, dark: true },
      { id: 'school', name: t('plan.school'), badge: '', price: t('sub.deal'), sub: t('sub.dealSub'), items: ['k1', 'k2', 'k3'].map(k => t('sub.' + k)), cta: html`<a class="btn-k sub-cta" href="${WHATSAPP}" target="_blank" rel="noopener">${t('sub.contact')}</a>`, soft: true }
    ];
    const usageText = usage.max == null ? t('sub.unl') : usage.max === 0 ? t('sub.noAi') : t('sub.usage', { n: usage.used, max: usage.max });
    main.innerHTML = html`
      <div class="page-head center">
        <div><h1 class="title title-md">${t('sub.title')}</h1><div class="small">${t('sub.lead')}</div></div>
        ${segmented('period', [{ id: '1', label: t('sub.month') }, { id: '6', label: t('sub.six') }], period, 'lg')}
      </div>
      <div class="sub-now">
        <div class="grow"><b>${t('sub.yours', { p: usage.plan.name })}</b><span>${usageText}</span></div>
        ${usage.max ? html`<div class="sub-bar"><i style="width:${usage.percent}%"></i></div><span class="muted">${t('sub.reset')}</span>` : ''}
      </div>
      <div class="sub-grid">${cards.map(c => html`
        <div class="sub-card${c.dark ? ' dark' : ''}${c.soft ? ' soft' : ''}${c.id === cur ? ' current' : ''}">
          <div class="sub-name"><span>${c.name}</span>${c.badge ? html`<span class="sub-badge${c.dark && c.id !== cur ? ' lime' : ''}">${c.badge}</span>` : ''}</div>
          <div class="sub-price">${c.price}</div><div class="sub-sub">${c.sub}</div>
          <ul class="sub-items">${c.items.map(it => html`<li>${it}</li>`)}</ul>
          <span class="grow"></span>${c.cta}
        </div>`)}</div>`;
    main.querySelectorAll('[data-seg="period"]').forEach(b => b.onclick = () => { period = b.dataset.id; draw(); });
  };
  draw();
}
