/* Screen 23: sign in with Google (the only way in).
 * A new account is created on first sign-in (server side). */
import { add, t, lang, setLang } from '../i18n.js';
import { html, raw, icon, toast } from '../ui.js';
import { renderGoogle, googleConfigured, currentUser, acceptTerms, TERMS_VERSION } from '../auth.js';

add({
  ru: {
    'li.hero1': 'Готовый урок', 'li.hero2': 'за одну минуту',
    'li.p1': 'КСП в Word', 'li.p2': 'Презентация', 'li.p3': 'Задания по уровням A, B, C', 'li.p4': 'Урок по коду для учеников', 'li.p5': 'Рост каждого ученика',
    'li.title': 'Вход в alaqai', 'li.lead': 'Если вы здесь впервые — аккаунт создастся сам.', 'li.google': 'Продолжить с Google',
    'li.terms': 'Я прочитал(а) {a} и {b} и согласен(на) с ними', 'li.needAgree': 'Сначала отметьте согласие с правилами', 'li.agreeTitle': 'Новые правила', 'li.agreeLead': 'Чтобы продолжить, примите правила использования и политику конфиденциальности.', 'li.continue': 'Продолжить', 'li.termsA': 'Правила использования', 'li.termsB': 'Политику конфиденциальности',
    'li.noGoogle': 'Вход через Google включится после настройки Google Client ID на сайте.',
    'li.offline': 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.',
   
    'li.welcome': 'Вы вошли', 'li.already': 'Вы уже вошли как {n}', 'li.toPlatform': 'Перейти на платформу'
  },
  kk: {
    'li.hero1': 'Дайын сабақ', 'li.hero2': 'бір минутта',
    'li.p1': 'ҚМЖ Word-та', 'li.p2': 'Презентация', 'li.p3': 'A, B, C деңгейлі тапсырмалар', 'li.p4': 'Оқушыларға кодпен сабақ', 'li.p5': 'Әр оқушының өсуі',
    'li.title': 'alaqai-ға кіру', 'li.lead': 'Алғаш рет келсеңіз — аккаунт өзі құрылады.', 'li.google': 'Google арқылы жалғастыру',
    'li.terms': 'Мен {a} және {b} оқыдым, келісемін', 'li.needAgree': 'Алдымен ережелермен келісу белгісін қойыңыз', 'li.agreeTitle': 'Жаңа ережелер', 'li.agreeLead': 'Жалғастыру үшін пайдалану шарттары мен құпиялылық саясатын қабылдаңыз.', 'li.continue': 'Жалғастыру', 'li.termsA': 'Пайдалану шарттарын', 'li.termsB': 'Құпиялылық саясатын',
    'li.noGoogle': 'Google арқылы кіру сайтта Google Client ID бапталғаннан кейін қосылады.',
    'li.offline': 'Сервермен байланыс жоқ. Интернетті тексеріп, қайталап көріңіз.',
   
    'li.welcome': 'Сіз кірдіңіз', 'li.already': 'Сіз {n} ретінде кірдіңіз', 'li.toPlatform': 'Платформаға өту'
  },
  en: {
    'li.hero1': 'A ready lesson', 'li.hero2': 'in one minute',
    'li.p1': 'Lesson plan in Word', 'li.p2': 'Slides', 'li.p3': 'Tasks by level A, B, C', 'li.p4': 'Live lesson by code', 'li.p5': 'Growth of every student',
    'li.title': 'Sign in to alaqai', 'li.lead': 'New here? Your account is created automatically.', 'li.google': 'Continue with Google',
    'li.terms': 'I have read the {a} and the {b} and agree to them', 'li.needAgree': 'First tick the box to accept the rules', 'li.agreeTitle': 'New rules', 'li.agreeLead': 'To continue, accept the terms of use and the privacy policy.', 'li.continue': 'Continue', 'li.termsA': 'Terms of use', 'li.termsB': 'Privacy policy',
    'li.noGoogle': 'Google sign-in turns on once the Google Client ID is set up for the site.',
    'li.offline': 'Can’t reach the server. Check your connection and try again.',
   
    'li.welcome': 'You are signed in', 'li.already': 'You are signed in as {n}', 'li.toPlatform': 'Go to the platform'
  }
});

export async function render(main, { args, query }) {
  // next: a screen of the platform (#/…) or the admin panel ('admin').
  const next = query.next === 'admin' ? 'admin' : query.next && query.next.startsWith('#/') ? query.next : '#/home';
  const done = () => { toast(t('li.welcome')); if (next === 'admin') location.href = '../admin/'; else location.hash = next; };
  const langs = html`<div class="li-lang">${[['kk', 'ҚАЗ'], ['ru', 'РУС'], ['en', 'ENG']].map(([id, l]) => html`<button type="button" data-lang="${id}" aria-pressed="${id === lang()}">${l}</button>`)}</div>`;
  const hero = full => html`<div class="li-hero"><span class="logo">alaqai<span class="logo-dot"></span></span>
    <div class="li-h">${t('li.hero1')}<br><span>${t('li.hero2')}</span></div>
    ${full ? html`<div class="li-parts">${[1, 2, 3, 4, 5].map(i => html`<span><i>${icon('check', 12)}</i>${t('li.p' + i)}</span>`)}</div>` : ''}
    </div>`;
  const shell = (full, form) => {
    main.innerHTML = html`<div class="li">${hero(full)}<div class="li-side"><div class="li-top">${langs}</div><div class="li-center">${raw(form)}</div></div></div>`;
    main.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  };

  if (args[0] === 'code') { location.replace('#/login'); return; } // old SMS-code links

  const user = await currentUser();
  const agreeBox = html`<label class="li-agree"><input type="checkbox" data-agree><span>${raw(t('li.terms', { a: `<a href="../terms/" target="_blank" rel="noopener">${t('li.termsA')}</a>`, b: `<a href="../privacy/" target="_blank" rel="noopener">${t('li.termsB')}</a>` }))}</span></label>`;
  const accepted = user && user.termsVersion === TERMS_VERSION;
  shell(true, html`<form class="li-form" novalidate>
      ${accepted ? html`<h1 class="li-title">${t('li.title')}</h1><p class="li-lead">${t('li.already', { n: user.name || user.email })}</p><a class="btn-k li-btn" href="#/home">${t('li.toPlatform')}</a>`
      : user ? html`<h1 class="li-title">${t('li.agreeTitle')}</h1><p class="li-lead">${t('li.agreeLead')}</p>${agreeBox}<div class="li-err" role="alert" hidden></div><button class="btn-k li-btn" data-continue>${t('li.continue')}</button>`
      : html`<h1 class="li-title">${t('li.title')}</h1>
      <p class="li-lead">${t('li.lead')}</p>
      ${agreeBox}
      <div class="li-google locked" data-google>${googleConfigured() ? '' : html`<button type="button" class="li-gbtn" data-nogoogle><span class="g">G</span>${t('li.google')}</button>`}</div>
      <div class="li-err" role="alert" hidden></div>`}
    </form>`.toString());
  if (accepted) return;
  const form = main.querySelector('.li-form');
  const err = msg => { const e = form.querySelector('.li-err'); e.hidden = !msg; e.textContent = msg || ''; };
  const agree = form.querySelector('[data-agree]');
  // Consent is recorded on the server (version and time) right after sign-in.
  const finish = async () => {
    try { await acceptTerms(); done(); } catch (e) { err(e.status ? (e.message || 'error') : t('li.offline')); }
  };
  if (user) {
    form.onsubmit = e => { e.preventDefault(); if (!agree.checked) { err(t('li.needAgree')); return; } finish(); };
    return;
  }
  const g = form.querySelector('[data-google]');
  agree.onchange = () => { g.classList.toggle('locked', !agree.checked); if (agree.checked) err(''); };
  g.addEventListener('click', e => { if (!agree.checked) { e.preventDefault(); err(t('li.needAgree')); } }, true);
  if (googleConfigured()) renderGoogle(g, { onSignIn: finish, onError: () => err(t('li.offline')), width: Math.min(400, g.clientWidth || 400) });
  else form.querySelector('[data-nogoogle]').onclick = () => err(agree.checked ? t('li.noGoogle') : t('li.needAgree'));
  form.onsubmit = e => e.preventDefault();
}
