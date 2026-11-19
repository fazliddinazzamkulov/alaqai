/* Screen 28: personal account — profile, sign-in methods, plan and payments. */
import { add, t, lang, setLang } from '../i18n.js';
import { html, raw, icon, toast, openModal, initials, downscale } from '../ui.js';
import { db, COLLECTIONS } from '../data/store.js';
import { weeklyUsage } from '../plans.js';
import { longDate } from '../school.js';
import { currentUser, logout, logoutEverywhere, maskPhone } from '../auth.js';

add({
  ru: {
    'ac.title': 'Личный кабинет', 'ac.trial': 'пробный период', 'ac.p1': '1 месяц', 'ac.p6': '6 месяцев', 'ac.paidOk': 'Оплата прошла — спасибо! Тариф включится в течение минуты.', 'ac.unsent': 'Нет интернета: часть изменений осталась в этом браузере и отправится при следующем входе.', 'ac.logout': 'Выйти', 'ac.login': 'Войти', 'ac.guest': 'Вы не вошли — данные хранятся только в этом браузере. Войдите, чтобы пользоваться ИИ и не потерять уроки.',
    'ac.photo': 'Изменить фото', 'ac.name': 'Имя и фамилия', 'ac.school': 'Школа', 'ac.subjects': 'Предметы', 'ac.lang': 'Язык интерфейса', 'ac.save': 'Сохранить', 'ac.saved': 'Сохранено',
    'ac.methods': 'Способы входа', 'ac.google': 'Google', 'ac.phone': 'Телефон', 'ac.on': 'подключён', 'ac.off': 'не подключён', 'ac.connect': 'Подключить', 'ac.everywhere': 'Выйти на всех устройствах', 'ac.soon': 'Заработает после подключения базы и SMS-сервиса',
    'ac.plan': 'Ваш тариф', 'ac.active': 'активен', 'ac.free': 'бесплатно', 'ac.until': 'до {d}', 'ac.usage': 'Уроки с ИИ на этой неделе', 'ac.usageOf': '{n} из {max}', 'ac.unl': 'без лимита', 'ac.next': 'Следующее списание — {sum} · {d} · {how}',
    'ac.change': 'Сменить тариф', 'ac.method': 'Способ оплаты', 'ac.noRenew': 'Отключить продление', 'ac.renewOff': 'Продление отключено',
    'ac.history': 'История платежей', 'ac.date': 'Дата', 'ac.what': 'Что', 'ac.how': 'Способ', 'ac.sum': 'Сумма', 'ac.status': 'Статус', 'ac.receipt': 'Чек', 'ac.paid': 'Оплачено', 'ac.failed': 'Ошибка', 'ac.noPays': 'Платежей пока нет.',
    'ac.delete': 'Удалить аккаунт', 'ac.delTitle': 'Удалить аккаунт?', 'ac.delGuest': 'Все классы, уроки, презентации, тесты и журнал в этом браузере будут удалены без возможности восстановления.', 'ac.delUser': 'Аккаунт и все данные на сервере будут удалены без возможности восстановления.', 'ac.delType': 'Напишите «{w}», чтобы подтвердить', 'ac.delWord': 'удалить', 'ac.deleted': 'Данные удалены'
  },
  kk: {
    'ac.title': 'Жеке кабинет', 'ac.trial': 'сынақ кезеңі', 'ac.p1': '1 ай', 'ac.p6': '6 ай', 'ac.paidOk': 'Төлем өтті — рақмет! Тариф бір минут ішінде қосылады.', 'ac.unsent': 'Интернет жоқ: кейбір өзгерістер осы браузерде қалды, келесі кіргенде жіберіледі.', 'ac.logout': 'Шығу', 'ac.login': 'Кіру', 'ac.guest': 'Сіз кірмедіңіз — деректер тек осы браузерде сақталады. ЖИ-ді пайдалану және сабақтарды жоғалтпау үшін кіріңіз.',
    'ac.photo': 'Фотоны өзгерту', 'ac.name': 'Аты-жөні', 'ac.school': 'Мектеп', 'ac.subjects': 'Пәндер', 'ac.lang': 'Интерфейс тілі', 'ac.save': 'Сақтау', 'ac.saved': 'Сақталды',
    'ac.methods': 'Кіру тәсілдері', 'ac.google': 'Google', 'ac.phone': 'Телефон', 'ac.on': 'қосылған', 'ac.off': 'қосылмаған', 'ac.connect': 'Қосу', 'ac.everywhere': 'Барлық құрылғыдан шығу', 'ac.soon': 'Дерекқор мен SMS-сервис қосылғаннан кейін жұмыс істейді',
    'ac.plan': 'Сіздің тариф', 'ac.active': 'белсенді', 'ac.free': 'тегін', 'ac.until': '{d} дейін', 'ac.usage': 'Осы аптадағы ЖИ-сабақтар', 'ac.usageOf': '{max}-дан {n}', 'ac.unl': 'шектеусіз', 'ac.next': 'Келесі төлем — {sum} · {d} · {how}',
    'ac.change': 'Тарифті ауыстыру', 'ac.method': 'Төлем тәсілі', 'ac.noRenew': 'Ұзартуды өшіру', 'ac.renewOff': 'Ұзарту өшірілді',
    'ac.history': 'Төлемдер тарихы', 'ac.date': 'Күні', 'ac.what': 'Не', 'ac.how': 'Тәсіл', 'ac.sum': 'Сома', 'ac.status': 'Күйі', 'ac.receipt': 'Чек', 'ac.paid': 'Төленді', 'ac.failed': 'Қате', 'ac.noPays': 'Әзірге төлем жоқ.',
    'ac.delete': 'Аккаунтты жою', 'ac.delTitle': 'Аккаунтты жою керек пе?', 'ac.delGuest': 'Осы браузердегі барлық сынып, сабақ, презентация, тест және журнал қайтарусыз жойылады.', 'ac.delUser': 'Аккаунт пен сервердегі барлық дерек қайтарусыз жойылады.', 'ac.delType': 'Растау үшін «{w}» деп жазыңыз', 'ac.delWord': 'жою', 'ac.deleted': 'Деректер жойылды'
  },
  en: {
    'ac.title': 'Account', 'ac.trial': 'free trial', 'ac.p1': '1 month', 'ac.p6': '6 months', 'ac.paidOk': 'Payment received — thank you! Your plan switches on within a minute.', 'ac.unsent': 'No internet: some changes stayed in this browser and will be sent next time you sign in.', 'ac.logout': 'Sign out', 'ac.login': 'Sign in', 'ac.guest': 'You are not signed in — your data is kept only in this browser. Sign in to use AI and keep your lessons safe.',
    'ac.photo': 'Change photo', 'ac.name': 'Full name', 'ac.school': 'School', 'ac.subjects': 'Subjects', 'ac.lang': 'Interface language', 'ac.save': 'Save', 'ac.saved': 'Saved',
    'ac.methods': 'Sign-in methods', 'ac.google': 'Google', 'ac.phone': 'Phone', 'ac.on': 'connected', 'ac.off': 'not connected', 'ac.connect': 'Connect', 'ac.everywhere': 'Sign out on all devices', 'ac.soon': 'Works once the database and SMS service are connected',
    'ac.plan': 'Your plan', 'ac.active': 'active', 'ac.free': 'free', 'ac.until': 'until {d}', 'ac.usage': 'AI lessons this week', 'ac.usageOf': '{n} of {max}', 'ac.unl': 'unlimited', 'ac.next': 'Next charge — {sum} · {d} · {how}',
    'ac.change': 'Change plan', 'ac.method': 'Payment method', 'ac.noRenew': 'Turn off renewal', 'ac.renewOff': 'Renewal turned off',
    'ac.history': 'Payment history', 'ac.date': 'Date', 'ac.what': 'What', 'ac.how': 'Method', 'ac.sum': 'Amount', 'ac.status': 'Status', 'ac.receipt': 'Receipt', 'ac.paid': 'Paid', 'ac.failed': 'Failed', 'ac.noPays': 'No payments yet.',
    'ac.delete': 'Delete account', 'ac.delTitle': 'Delete the account?', 'ac.delGuest': 'All classes, lessons, slides, tests and the register in this browser will be deleted for good.', 'ac.delUser': 'The account and all its data on the server will be deleted for good.', 'ac.delType': 'Type “{w}” to confirm', 'ac.delWord': 'delete', 'ac.deleted': 'Data deleted'
  }
});

const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
const maskEmail = e => { const [a, b] = String(e || '').split('@'); return b ? `${a[0]}•••@${b}` : e; };

async function payments() {
  try { return (await window.Alaqai.api('/api/billing/payments')).payments || []; } catch (e) { return []; }
}

export async function render(main, { query = {} } = {}) {
  if (query.paid) { toast(t('ac.paidOk')); history.replaceState(null, '', '#/account'); }
  const [user, settings, usage, pays] = await Promise.all([currentUser(), db.settings.get(), weeklyUsage(), payments()]);
  const profile = { name: '', school: '', subjects: '', ...(settings.profile || {}) };
  if (!profile.name && user) profile.name = user.name || '';
  const sub = settings.subscription || {};
  const until = (user && user.subscriptionExpiresAt) || sub.until || null;
  const paid = usage.plan.id !== 'basic';

  main.innerHTML = html`
    <div class="page-head center"><h1 class="title title-md">${t('ac.title')}</h1>
      ${user ? html`<button type="button" class="btn-o btn-sm" data-logout>${t('ac.logout')}</button>` : html`<a class="btn-k btn-sm" href="#/login?next=${encodeURIComponent('#/account')}">${t('ac.login')}</a>`}</div>
    ${user ? '' : html`<div class="demo-bar">${icon('M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 8v5M12 16h.01', 16)}<span class="grow">${t('ac.guest')}</span></div>`}
    <div class="ac-grid">
      <div class="ac-col">
        <form class="card ac-profile">
          <div class="ac-who"><span class="avatar xl">${profile.photo ? html`<img src="${profile.photo}" alt="">` : initials(profile.name || t('nav.teacher'))}</span>
            <div><b>${(profile.name || t('nav.teacher')).split(' ')[0]}</b><label class="link-btn ac-photo">${t('ac.photo')}<input type="file" accept="image/*" hidden></label></div></div>
          <label class="field muted sm">${t('ac.name')}<input name="name" value="${profile.name}" maxlength="80" autocomplete="name"></label>
          <label class="field muted sm">${t('ac.school')}<input name="school" value="${profile.school}" maxlength="120"></label>
          <label class="field muted sm">${t('ac.subjects')}<input name="subjects" value="${profile.subjects}" maxlength="120"></label>
          <label class="field muted sm">${t('ac.lang')}<select name="lang">${[['kk', 'Қазақша'], ['ru', 'Русский'], ['en', 'English']].map(([id, l]) => html`<option value="${id}" ${id === lang() ? raw('selected') : ''}>${l}</option>`)}</select></label>
          <button class="btn-k btn-sm ac-save">${t('ac.save')}</button>
        </form>
        <div class="card">
          <div class="card-title">${t('ac.methods')}</div>
          <div class="ac-method"><span class="ac-ic g">G</span><span class="grow">${t('ac.google')}${user && user.email ? ' · ' + maskEmail(user.email) : ''}</span>${user && user.email ? html`<span class="ok">${t('ac.on')}</span>` : html`<a class="link-btn" href="#/login">${t('ac.connect')}</a>`}</div>
          <div class="ac-method"><span class="ac-ic">${icon('M6 3h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z', 15)}</span><span class="grow">${t('ac.phone')}${user && user.phone ? ' · ' + maskPhone(user.phone) : ''}</span>${user && user.phone ? html`<span class="ok">${t('ac.on')}</span>` : html`<span class="mut">${t('ac.off')}</span>`}</div>
          ${user ? html`<button type="button" class="link-btn strong" data-everywhere>${t('ac.everywhere')}</button>` : ''}
        </div>
      </div>
      <div class="ac-col">
        <div class="ac-plan">
          <div class="r"><span class="mut">${t('ac.plan')}</span><span class="pill-l">${user && user.subscriptionStatus === 'trial' ? t('ac.trial') : paid ? t('ac.active') : t('ac.free')}</span></div>
          <div class="r base"><span class="nm">${usage.plan.name}</span>${paid && until ? html`<span class="mut">${t('ac.until', { d: longDate(until.slice(0, 10)).replace(/^[^,]+,\s*/, '') })}</span>` : ''}</div>
          <div class="u"><span class="r"><span class="mut">${t('ac.usage')}</span><span>${usage.max == null ? t('ac.unl') : usage.max === 0 ? t('plan.noAi') : t('ac.usageOf', { n: usage.used, max: usage.max })}</span></span>
            ${usage.max ? html`<span class="bar"><i style="width:${usage.percent}%"></i></span>` : ''}</div>
          ${paid && sub.autoRenew && sub.nextCharge ? html`<div class="mut">${t('ac.next', { sum: money(sub.nextCharge.sum), d: longDate(sub.nextCharge.date).replace(/^[^,]+,\s*/, ''), how: sub.nextCharge.method })}</div>` : ''}
          <div class="acts"><a class="btn-w btn-md" href="#/plan">${t('ac.change')}</a><a class="btn-ghost btn-md" href="#/checkout">${t('ac.method')}</a>${paid && sub.autoRenew ? html`<button type="button" class="link-btn" data-norenew>${t('ac.noRenew')}</button>` : ''}</div>
        </div>
        <div class="card ac-pays">
          <div class="card-title">${t('ac.history')}</div>
          <div class="ac-row h"><span>${t('ac.date')}</span><span>${t('ac.what')}</span><span>${t('ac.how')}</span><span>${t('ac.sum')}</span><span>${t('ac.status')}</span><span></span></div>
          ${pays.length ? pays.map(p => html`<div class="ac-row"><span class="mut">${p.date}</span><b>${p.plan ? t('plan.' + p.plan) + ' · ' + t('ac.p' + (p.period === '6' ? '6' : '1')) : p.what}</b><span class="mut">${p.method}</span><b>${money(p.sum)}</b><span class="${p.status === 'paid' ? 'ok' : 'bad'}">${p.status === 'paid' ? t('ac.paid') : t('ac.failed')}</span>${p.receiptUrl ? html`<a href="${p.receiptUrl}" target="_blank" rel="noopener">${t('ac.receipt')}</a>` : html`<span></span>`}</div>`)
            : html`<p class="muted-note ac-none">${t('ac.noPays')}</p>`}
          <span class="grow"></span>
          <button type="button" class="link-btn danger" data-delete>${t('ac.delete')}</button>
        </div>
      </div>
    </div>`;

  const form = main.querySelector('.ac-profile');
  form.onsubmit = async e => {
    e.preventDefault();
    await db.settings.set({ profile: { ...profile, name: form.name.value.trim(), school: form.school.value.trim(), subjects: form.subjects.value.trim() } });
    if (user) { try { await window.Alaqai.api('/api/account', { method: 'PATCH', body: { name: form.name.value.trim(), school: form.school.value.trim() } }); } catch (err) { /* saved in the profile anyway */ } }
    if (form.lang.value !== lang()) setLang(form.lang.value);
    toast(t('ac.saved'));
  };
  form.querySelector('input[type=file]').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    try { const photo = await downscale(f, 256, 0.85); await db.settings.set({ profile: { ...profile, photo } }); render(main); } catch (err) { /* not an image */ }
  };
  const lo = main.querySelector('[data-logout]');
  if (lo) lo.onclick = async () => { const clean = await logout(); if (!clean) toast(t('ac.unsent')); location.hash = '#/login'; };
  const ev = main.querySelector('[data-everywhere]');
  if (ev) ev.onclick = async () => { try { await logoutEverywhere(); await logout(); location.hash = '#/login'; } catch (err) { toast(t('ac.soon')); } };
  const nr = main.querySelector('[data-norenew]');
  if (nr) nr.onclick = async () => {
    try { await window.Alaqai.api('/api/billing/autorenew', { method: 'POST', body: { on: false } }); await db.settings.set({ subscription: { ...sub, autoRenew: false } }); toast(t('ac.renewOff')); render(main); } catch (err) { toast(t('ac.soon')); }
  };
  main.querySelector('[data-delete]').onclick = () => {
    const word = t('ac.delWord');
    openModal({
      title: t('ac.delTitle'),
      body: html`<p class="muted-note">${user ? t('ac.delUser') : t('ac.delGuest')}</p><label class="field">${t('ac.delType', { w: word })}<input name="w" autocomplete="off" required></label>`.toString(),
      submitLabel: t('ac.delete'),
      onSubmit: async f => {
        if (f.w.value.trim().toLowerCase() !== word) { f.w.focus(); return false; }
        if (user) {
          try { await window.Alaqai.api('/api/account', { method: 'DELETE' }); await logout(); } catch (err) { toast(t('ac.soon')); return; }
        }
        for (const c of COLLECTIONS) await db[c].removeWhere(() => true);
        await db.settings.set({ profile: {}, demoLoaded: false, subscription: {} });
        toast(t('ac.deleted'));
        location.hash = '#/home';
      }
    });
  };
}


