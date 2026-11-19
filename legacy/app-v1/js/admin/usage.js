/* Admin: usage (who spent what, per service and per teacher, limits) and
 * administrators by Google e-mail. */
import { add, t } from '../i18n.js';
import { html, raw, icon, toast, openModal, initials, confirmModal } from '../ui.js';
import * as S from './source.js';

add({
  ru: {
    'us.title': 'Расход', 'us.s.gemini': 'тексты, задания, КСП', 'us.s.gemini_image': 'генерация картинок', 'us.s.pexels': 'поиск фото', 'us.s.pixabay': 'поиск фото', 'us.s.unsplash': 'поиск фото', 'us.services': 'Сервисы сегодня', 'us.servicesNote': 'Сервер сам считает запросы к каждому сервису: Google не показывает остаток лимита по ключу. Дошёл до дневного лимита — сервис отдыхает до полуночи (время Казахстана), фото берутся из следующего сервиса.',
    'us.today': 'сегодня', 'us.of': 'из {n}', 'us.noLimit': 'без лимита', 'us.week': 'Неделя', 'us.month': '30 дней', 'us.failed': 'ошибок сегодня', 'us.limit': 'Лимит в день', 'us.limitPh': 'пусто — без лимита', 'us.saveLimits': 'Сохранить лимиты', 'us.limitsSaved': 'Лимиты сохранены', 'us.ownerOnly': 'Лимиты сервисов меняет только владелец.',
    'us.teachers': 'Кто сколько потратил', 'us.teachersNote': 'Запросы к ИИ (тексты и картинки) за сегодня, неделю и 30 дней. «Лимит» — дать дополнительные запросы в неделю или личный дневной лимит.', 'us.find': 'Имя или почта',
    'us.c.who': 'Учитель', 'us.c.plan': 'Тариф', 'us.c.today': 'Сегодня', 'us.c.week': 'Неделя / лимит', 'us.c.month': '30 дней', 'us.c.pics': 'Картинки', 'us.c.photos': 'Фото', 'us.c.extra': 'Доп. / день', 'us.none': 'Пока никто ничего не потратил.',
    'us.edit': 'Лимит', 'us.editTitle': 'Лимит: {n}', 'us.extra': 'Дополнительно запросов в неделю', 'us.extraNote': 'Прибавляется к лимиту тарифа. 0 — без добавки.', 'us.cap': 'Личный лимит в день', 'us.capNote': 'Пусто — общий ({n} в день). 0 — ИИ для этого учителя выключен.', 'us.off': 'ИИ выключен', 'us.unlim': '∞', 'us.saved': 'Сохранено',
    'ad2.note': 'Админ входит через Google этой почтой. Если он уже входил — роль появится сразу. Удалили почту — он снова учитель. Владелец задаётся на сервере (OWNER_EMAILS).', 'ad2.owner': 'владелец', 'ad2.admin': 'админ', 'ad2.add': 'Добавить', 'ad2.email': 'почта Google, например name@gmail.com', 'ad2.bad': 'Это не похоже на почту', 'ad2.saved': 'Список админов сохранён', 'ad2.remove': 'Убрать', 'ad2.ownerOnly': 'Админов добавляет только владелец.', 'ad2.empty': 'Админов пока нет — только владелец.'
  },
  kk: {
    'us.title': 'Шығын', 'us.s.gemini': 'мәтін, тапсырма, ҚМЖ', 'us.s.gemini_image': 'сурет генерациясы', 'us.s.pexels': 'фото іздеу', 'us.s.pixabay': 'фото іздеу', 'us.s.unsplash': 'фото іздеу', 'us.services': 'Бүгінгі сервистер', 'us.servicesNote': 'Сервер әр сервиске сұрауды өзі санайды: Google кілт бойынша қалған лимитті көрсетпейді. Күндік лимитке жеткен сервис түн ортасына дейін тынығады (Қазақстан уақыты), фото келесі сервистен алынады.',
    'us.today': 'бүгін', 'us.of': '{n}-ден', 'us.noLimit': 'лимитсіз', 'us.week': 'Апта', 'us.month': '30 күн', 'us.failed': 'бүгінгі қате', 'us.limit': 'Күндік лимит', 'us.limitPh': 'бос — лимитсіз', 'us.saveLimits': 'Лимиттерді сақтау', 'us.limitsSaved': 'Лимиттер сақталды', 'us.ownerOnly': 'Сервис лимиттерін тек иесі өзгертеді.',
    'us.teachers': 'Кім қанша жұмсады', 'us.teachersNote': 'ЖИ сұраулары (мәтін мен сурет) бүгін, аптада және 30 күнде. «Лимит» — аптасына қосымша сұрау немесе жеке күндік лимит беру.', 'us.find': 'Аты немесе пошта',
    'us.c.who': 'Мұғалім', 'us.c.plan': 'Тариф', 'us.c.today': 'Бүгін', 'us.c.week': 'Апта / лимит', 'us.c.month': '30 күн', 'us.c.pics': 'Суреттер', 'us.c.photos': 'Фото', 'us.c.extra': 'Қосымша / күн', 'us.none': 'Әзірге ешкім ештеңе жұмсаған жоқ.',
    'us.edit': 'Лимит', 'us.editTitle': 'Лимит: {n}', 'us.extra': 'Аптасына қосымша сұрау', 'us.extraNote': 'Тариф лимитіне қосылады. 0 — қосымшасыз.', 'us.cap': 'Жеке күндік лимит', 'us.capNote': 'Бос — жалпы (күніне {n}). 0 — бұл мұғалімге ЖИ өшірулі.', 'us.off': 'ЖИ өшірулі', 'us.unlim': '∞', 'us.saved': 'Сақталды',
    'ad2.note': 'Әкімші осы поштамен Google арқылы кіреді. Бұрын кірген болса — рөл бірден беріледі. Поштаны өшірсеңіз — қайтадан мұғалім. Иесі серверде беріледі (OWNER_EMAILS).', 'ad2.owner': 'иесі', 'ad2.admin': 'әкімші', 'ad2.add': 'Қосу', 'ad2.email': 'Google поштасы, мысалы name@gmail.com', 'ad2.bad': 'Бұл поштаға ұқсамайды', 'ad2.saved': 'Әкімшілер тізімі сақталды', 'ad2.remove': 'Алып тастау', 'ad2.ownerOnly': 'Әкімшілерді тек иесі қосады.', 'ad2.empty': 'Әзірге әкімші жоқ — тек иесі.'
  },
  en: {
    'us.title': 'Usage', 'us.s.gemini': 'text, tasks, lesson plans', 'us.s.gemini_image': 'picture generation', 'us.s.pexels': 'photo search', 'us.s.pixabay': 'photo search', 'us.s.unsplash': 'photo search', 'us.services': 'Services today', 'us.servicesNote': 'The server counts its own requests to each service: Google shows no remaining quota for a key. A service at its daily limit rests until midnight (Kazakhstan time); photos come from the next service.',
    'us.today': 'today', 'us.of': 'of {n}', 'us.noLimit': 'no limit', 'us.week': 'Week', 'us.month': '30 days', 'us.failed': 'errors today', 'us.limit': 'Daily limit', 'us.limitPh': 'empty — no limit', 'us.saveLimits': 'Save limits', 'us.limitsSaved': 'Limits saved', 'us.ownerOnly': 'Only the owner changes service limits.',
    'us.teachers': 'Who spent how much', 'us.teachersNote': 'AI requests (text and pictures) today, this week and in 30 days. «Limit» gives extra requests per week or a personal daily limit.', 'us.find': 'Name or e-mail',
    'us.c.who': 'Teacher', 'us.c.plan': 'Plan', 'us.c.today': 'Today', 'us.c.week': 'Week / limit', 'us.c.month': '30 days', 'us.c.pics': 'Pictures', 'us.c.photos': 'Photos', 'us.c.extra': 'Extra / day', 'us.none': 'Nobody has spent anything yet.',
    'us.edit': 'Limit', 'us.editTitle': 'Limit: {n}', 'us.extra': 'Extra requests per week', 'us.extraNote': 'Added to the plan limit. 0 — nothing extra.', 'us.cap': 'Personal daily limit', 'us.capNote': 'Empty — the common one ({n} a day). 0 — AI off for this teacher.', 'us.off': 'AI off', 'us.unlim': '∞', 'us.saved': 'Saved',
    'ad2.note': 'An admin signs in with Google using this e-mail. If they signed in before, the role applies at once. Remove the e-mail — they are a teacher again. The owner is set on the server (OWNER_EMAILS).', 'ad2.owner': 'owner', 'ad2.admin': 'admin', 'ad2.add': 'Add', 'ad2.email': 'Google e-mail, e.g. name@gmail.com', 'ad2.bad': 'This does not look like an e-mail', 'ad2.saved': 'Admin list saved', 'ad2.remove': 'Remove', 'ad2.ownerOnly': 'Only the owner adds admins.', 'ad2.empty': 'No admins yet — only the owner.'
  }
});

const num = n => (n == null ? '—' : new Intl.NumberFormat('ru-RU').format(n));
const pill = () => (S.getMode() === 'demo' ? html`<span class="tag">${t('av.demo')}</span>` : '');
const isOwner = who => S.getMode() === 'demo' || (who && who.role === 'owner');

/* ---------- usage ---------- */

export async function usagePage(main, { who }) {
  let data = await S.usage();
  let q = '';
  const owner = isOwner(who);
  const draw = () => {
    const rows = data.teachers.filter(u => !q || [u.name, u.email].some(v => v && v.toLowerCase().includes(q.toLowerCase())));
    main.innerHTML = html`<div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('us.title')}</h1>${pill()}</div></div>
      <div class="card av-x"><span class="card-title">${t('us.services')}</span><p class="muted-note">${t('us.servicesNote')}</p>
        <form class="us-svc" data-limits>${data.services.map(s => {
          const share = s.limit ? Math.min(1, s.today / Math.max(1, s.limit)) : 0;
          return html`<div class="us-card${s.limit != null && s.today >= s.limit ? ' full' : ''}" data-service="${s.id}">
            <div class="us-name"><b>${s.label.split(' — ')[0]}</b><span>${t('us.s.' + s.id) !== 'us.s.' + s.id ? t('us.s.' + s.id) : s.label.split(' — ')[1] || ''}</span></div>
            <div class="us-big"><b data-today>${num(s.today)}</b><span>${s.limit != null ? t('us.of', { n: num(s.limit) }) : t('us.noLimit')}</span></div>
            <div class="us-bar"><i style="width:${Math.round(share * 100)}%" class="${share >= 1 ? 'bad' : share >= 0.8 ? 'warn' : ''}"></i></div>
            <div class="us-sub">${t('us.week')}: ${num(s.week)} · ${t('us.month')}: ${num(s.month)}${s.failedToday ? html` · <em>${t('us.failed')}: ${s.failedToday}</em>` : ''}</div>
            <label class="us-lim">${t('us.limit')}<input name="${s.id}" type="number" min="0" step="1" inputmode="numeric" value="${s.limit ?? ''}" placeholder="${t('us.limitPh')}" ${owner ? '' : raw('disabled')}></label>
          </div>`;
        })}
        <div class="us-foot">${owner ? html`<button class="btn-k btn-md">${t('us.saveLimits')}</button>` : html`<span class="muted-note">${t('us.ownerOnly')}</span>`}</div></form>
      </div>
      <div class="card av-x"><span class="card-title">${t('us.teachers')}</span><p class="muted-note">${t('us.teachersNote')}</p>
        <div class="us-find"><label class="av-search">${icon('M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4', 16)}<input name="q" value="${q}" placeholder="${t('us.find')}"></label></div>
        <div class="av-table us-table">
          <div class="av-tr h us">${['us.c.who', 'us.c.plan', 'us.c.today', 'us.c.week', 'us.c.month', 'us.c.pics', 'us.c.photos', 'us.c.extra'].map(k => html`<span>${t(k)}</span>`)}<span></span></div>
          ${rows.length ? rows.map(u => html`<div class="av-tr us" data-teacher="${u.id}">
            <span class="who"><b>${u.name || u.email}</b><span>${u.email || ''}</span></span>
            <span>${t('plan.' + u.plan)}</span><b>${num(u.today)}</b>
            <span class="${u.weekLimit != null && u.week >= u.weekLimit ? 'us-over' : ''}">${num(u.week)} / ${u.weekLimit == null ? t('us.unlim') : num(u.weekLimit)}</span>
            <span>${num(u.month)}</span><span>${num(u.picturesMonth)}</span><span>${num(u.photosMonth)}</span>
            <span>${u.dailyCap === 0 ? html`<em class="us-off">${t('us.off')}</em>` : html`+${u.extraWeek} / ${u.dailyCap == null ? num(data.defaultDailyCap) : num(u.dailyCap)}`}</span>
            <button type="button" class="btn-o btn-sm" data-edit="${u.id}">${t('us.edit')}</button></div>`) : html`<p class="muted-note av-empty">${t('us.none')}</p>`}
        </div></div>`;
    const form = main.querySelector('[data-limits]');
    form.onsubmit = async e => {
      e.preventDefault();
      if (!owner) return;
      const limits = Object.fromEntries(data.services.map(s => [s.id, form.elements[s.id].value.trim()]));
      try { await S.setServiceLimits(limits); data = await S.usage(); toast(t('us.limitsSaved')); draw(); } catch (err) { toast(err.message); }
    };
    const inp = main.querySelector('[name="q"]');
    inp.oninput = () => { q = inp.value; draw(); const n = main.querySelector('[name="q"]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
    main.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => edit(data.teachers.find(u => String(u.id) === b.dataset.edit)));
  };
  const edit = u => openModal({
    title: t('us.editTitle', { n: u.name || u.email }),
    body: html`<label class="field">${t('us.extra')}<input name="extra" type="number" min="0" step="1" value="${u.extraWeek}"></label><p class="muted-note">${t('us.extraNote')}</p>
      <label class="field">${t('us.cap')}<input name="cap" type="number" min="0" step="1" value="${u.dailyCap ?? ''}"></label><p class="muted-note">${t('us.capNote', { n: data.defaultDailyCap })}</p>`.toString(),
    submitLabel: t('ui.save'),
    onSubmit: async f => {
      const extra = Math.max(0, Math.round(Number(f.extra.value) || 0));
      const capRaw = f.cap.value.trim();
      const cap = capRaw === '' ? null : Math.max(0, Math.round(Number(capRaw) || 0));
      try { await S.setTeacherLimit(u, { aiExtraWeek: extra, aiDailyCap: cap }); data = await S.usage(); toast(t('us.saved')); draw(); } catch (err) { toast(err.message); return false; }
    }
  });
  draw();
}

/* ---------- administrators by Google e-mail ---------- */

export async function adminsPage(main, { who }) {
  let data = await S.adminEmails();
  const owner = isOwner(who);
  const save = async emails => {
    try { data = await S.setAdminEmails(emails); toast(t('ad2.saved')); draw(); } catch (e) { toast(e.message); }
  };
  const draw = () => {
    main.innerHTML = html`<div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.admins')}</h1>${pill()}</div></div>
      <p class="muted-note">${t('ad2.note')}</p>
      <div class="card av-table">
        ${data.owners.map(e => html`<div class="av-tr staff"><span class="avatar sm">${initials(e)}</span><span class="who"><b>${e}</b></span><span class="tag">${t('ad2.owner')}</span><span></span></div>`)}
        ${data.emails.map(e => html`<div class="av-tr staff" data-admin="${e}"><span class="avatar sm">${initials(e)}</span><span class="who"><b>${e}</b></span><span class="tag">${t('ad2.admin')}</span>
          ${owner ? html`<button type="button" class="link-btn danger" data-remove="${e}">${t('ad2.remove')}</button>` : html`<span></span>`}</div>`)}
        ${data.emails.length ? '' : html`<p class="muted-note av-empty">${t('ad2.empty')}</p>`}
      </div>
      ${owner ? html`<form class="card us-add" data-add><input name="email" type="email" autocomplete="off" placeholder="${t('ad2.email')}" required><button class="btn-k btn-md">${t('ad2.add')}</button></form>` : html`<p class="muted-note">${t('ad2.ownerOnly')}</p>`}`;
    const f = main.querySelector('[data-add]');
    if (f) f.onsubmit = e => {
      e.preventDefault();
      const mail = f.email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { toast(t('ad2.bad')); return; }
      save([...data.emails.filter(x => x !== mail), mail]);
    };
    main.querySelectorAll('[data-remove]').forEach(b => b.onclick = async () => {
      if (!(await confirmModal(t('ad2.remove') + ': ' + b.dataset.remove + '?'))) return;
      save(data.emails.filter(x => x !== b.dataset.remove));
    });
  };
  draw();
}
