/* Screens 23–24: sign in with Google or a phone number + SMS code.
 * A new account is created on first sign-in (server side). */
import { add, t, lang, setLang } from '../i18n.js';
import { html, raw, icon, toast } from '../ui.js';
import { renderGoogle, googleConfigured, normPhone, maskPhone, sendSmsCode, verifySmsCode, currentUser, AuthError } from '../auth.js';

add({
  ru: {
    'li.hero1': 'Готовый урок', 'li.hero2': 'за одну минуту', 'li.free': 'Базовые функции — бесплатно навсегда',
    'li.p1': 'КСП в Word', 'li.p2': 'Презентация', 'li.p3': 'Игры и викторины', 'li.p4': 'Тест', 'li.p5': 'Домашнее задание', 'li.p6': 'Анализ урока',
    'li.title': 'Вход в alaqai', 'li.lead': 'Если вы здесь впервые — аккаунт создастся сам.', 'li.google': 'Продолжить с Google', 'li.or': 'или по номеру телефона',
    'li.phone': 'Номер телефона', 'li.getCode': 'Получить код по SMS', 'li.terms': 'Продолжая, вы соглашаетесь с {a} и {b}.', 'li.termsA': 'Условиями использования', 'li.termsB': 'Политикой конфиденциальности',
    'li.badPhone': 'Введите номер из 10 цифр, например 775 123 45 67', 'li.noGoogle': 'Вход через Google включится после настройки Google Client ID на сайте.',
    'li.noSms': 'Вход по SMS заработает после подключения SMS-сервиса. Пока войдите через Google.', 'li.offline': 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.', 'li.tooMany': 'Слишком много попыток. Подождите минуту.',
    'li.back': 'Назад', 'li.code': 'Введите код', 'li.sent': 'Отправили SMS на {p}', 'li.codeLabel': 'Код из SMS', 'li.resendIn': 'Отправить код ещё раз через {t}', 'li.resend': 'Отправить код ещё раз', 'li.enter': 'Войти', 'li.change': 'Изменить номер',
    'li.badCode': 'Неверный код. Проверьте SMS и попробуйте ещё раз.', 'li.welcome': 'Вы вошли', 'li.example': 'Посмотреть пример урока без входа', 'li.already': 'Вы уже вошли как {n}', 'li.toPlatform': 'Перейти на платформу'
  },
  kk: {
    'li.hero1': 'Дайын сабақ', 'li.hero2': 'бір минутта', 'li.free': 'Негізгі мүмкіндіктер — мәңгі тегін',
    'li.p1': 'ҚМЖ Word-та', 'li.p2': 'Презентация', 'li.p3': 'Ойындар мен викториналар', 'li.p4': 'Тест', 'li.p5': 'Үй тапсырмасы', 'li.p6': 'Сабақ талдауы',
    'li.title': 'alaqai-ға кіру', 'li.lead': 'Алғаш рет келсеңіз — аккаунт өзі құрылады.', 'li.google': 'Google арқылы жалғастыру', 'li.or': 'немесе телефон нөмірі арқылы',
    'li.phone': 'Телефон нөмірі', 'li.getCode': 'SMS арқылы код алу', 'li.terms': 'Жалғастыра отырып, сіз {a} және {b} келісесіз.', 'li.termsA': 'Пайдалану шарттарымен', 'li.termsB': 'Құпиялылық саясатымен',
    'li.badPhone': '10 саннан тұратын нөмірді енгізіңіз, мысалы 775 123 45 67', 'li.noGoogle': 'Google арқылы кіру сайтта Google Client ID бапталғаннан кейін қосылады.',
    'li.noSms': 'SMS арқылы кіру SMS-сервис қосылғаннан кейін жұмыс істейді. Әзірге Google арқылы кіріңіз.', 'li.offline': 'Сервермен байланыс жоқ. Интернетті тексеріп, қайталап көріңіз.', 'li.tooMany': 'Әрекет тым көп. Бір минут күтіңіз.',
    'li.back': 'Артқа', 'li.code': 'Кодты енгізіңіз', 'li.sent': '{p} нөміріне SMS жібердік', 'li.codeLabel': 'SMS-тегі код', 'li.resendIn': 'Кодты {t} кейін қайта жіберу', 'li.resend': 'Кодты қайта жіберу', 'li.enter': 'Кіру', 'li.change': 'Нөмірді өзгерту',
    'li.badCode': 'Код қате. SMS-ті тексеріп, қайталап көріңіз.', 'li.welcome': 'Сіз кірдіңіз', 'li.example': 'Кірмей-ақ сабақ мысалын көру', 'li.already': 'Сіз {n} ретінде кірдіңіз', 'li.toPlatform': 'Платформаға өту'
  },
  en: {
    'li.hero1': 'A ready lesson', 'li.hero2': 'in one minute', 'li.free': 'The basics are free forever',
    'li.p1': 'Lesson plan in Word', 'li.p2': 'Slides', 'li.p3': 'Games and quizzes', 'li.p4': 'Test', 'li.p5': 'Homework', 'li.p6': 'Lesson analysis',
    'li.title': 'Sign in to alaqai', 'li.lead': 'New here? Your account is created automatically.', 'li.google': 'Continue with Google', 'li.or': 'or with your phone number',
    'li.phone': 'Phone number', 'li.getCode': 'Get a code by SMS', 'li.terms': 'By continuing you agree to the {a} and the {b}.', 'li.termsA': 'Terms of use', 'li.termsB': 'Privacy policy',
    'li.badPhone': 'Enter a 10-digit number, for example 775 123 45 67', 'li.noGoogle': 'Google sign-in turns on once the Google Client ID is set up for the site.',
    'li.noSms': 'SMS sign-in works once the SMS service is connected. For now, sign in with Google.', 'li.offline': 'Can’t reach the server. Check your connection and try again.', 'li.tooMany': 'Too many attempts. Wait a minute.',
    'li.back': 'Back', 'li.code': 'Enter the code', 'li.sent': 'We sent an SMS to {p}', 'li.codeLabel': 'Code from the SMS', 'li.resendIn': 'Send the code again in {t}', 'li.resend': 'Send the code again', 'li.enter': 'Sign in', 'li.change': 'Change number',
    'li.badCode': 'Wrong code. Check the SMS and try again.', 'li.welcome': 'You are signed in', 'li.example': 'See an example lesson without signing in', 'li.already': 'You are signed in as {n}', 'li.toPlatform': 'Go to the platform'
  }
});

const errText = e => ({ not_configured: t('li.noSms'), offline: t('li.offline'), too_many: t('li.tooMany'), bad_code: t('li.badCode') })[e.code] || e.message;

export async function render(main, { args, query }) {
  // next: a screen of the platform (#/…) or the admin panel ('admin').
  const next = query.next === 'admin' ? 'admin' : query.next && query.next.startsWith('#/') ? query.next : '#/home';
  const done = () => { toast(t('li.welcome')); if (next === 'admin') location.href = '../admin/'; else location.hash = next; };
  const langs = html`<div class="li-lang">${[['kk', 'ҚАЗ'], ['ru', 'РУС'], ['en', 'ENG']].map(([id, l]) => html`<button type="button" data-lang="${id}" aria-pressed="${id === lang()}">${l}</button>`)}</div>`;
  const hero = full => html`<div class="li-hero"><span class="logo">alaqai<span class="logo-dot"></span></span>
    <div class="li-h">${t('li.hero1')}<br><span>${t('li.hero2')}</span></div>
    ${full ? html`<div class="li-parts">${[1, 2, 3, 4, 5, 6].map(i => html`<span><i>${icon('check', 12)}</i>${t('li.p' + i)}</span>`)}</div>` : ''}
    <div class="li-free">${t('li.free')}</div></div>`;
  const shell = (full, form) => {
    main.innerHTML = html`<div class="li">${hero(full)}<div class="li-side"><div class="li-top">${langs}</div><div class="li-center">${raw(form)}</div></div></div>`;
    main.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  };

  if (args[0] === 'code') return codeScreen(main, query, shell, done);

  const user = await currentUser();
  shell(true, html`<form class="li-form" novalidate>
      <h1 class="li-title">${t('li.title')}</h1>
      ${user ? html`<p class="li-lead">${t('li.already', { n: user.name || user.email })}</p><a class="btn-k li-btn" href="#/home">${t('li.toPlatform')}</a>` : html`
      <p class="li-lead">${t('li.lead')}</p>
      <div class="li-google" data-google>${googleConfigured() ? '' : html`<button type="button" class="li-gbtn" data-nogoogle><span class="g">G</span>${t('li.google')}</button>`}</div>
      <div class="li-or"><span></span>${t('li.or')}<span></span></div>
      <label class="li-field">${t('li.phone')}<span class="li-phone"><b>+7</b><input name="phone" inputmode="tel" autocomplete="tel-national" placeholder="775 123 45 67" value="${query.phone ? String(query.phone).replace(/^\+7/, '') : ''}"></span></label>
      <div class="li-err" role="alert" hidden></div>
      <button class="btn-k li-btn">${t('li.getCode')}</button>
      <p class="li-terms">${raw(t('li.terms', { a: `<u>${t('li.termsA')}</u>`, b: `<u>${t('li.termsB')}</u>` }))}</p>
      <a class="li-example" href="#/preview">${t('li.example')} →</a>`}
    </form>`.toString());
  if (user) return;
  const form = main.querySelector('.li-form');
  const err = msg => { const e = form.querySelector('.li-err'); e.hidden = !msg; e.textContent = msg || ''; };
  const g = form.querySelector('[data-google]');
  if (googleConfigured()) renderGoogle(g, { onSignIn: done, onError: () => err(t('li.offline')), width: Math.min(400, g.clientWidth || 400) });
  else form.querySelector('[data-nogoogle]').onclick = () => err(t('li.noGoogle'));
  form.onsubmit = async e => {
    e.preventDefault();
    const phone = normPhone(form.phone.value);
    if (!phone) { err(t('li.badPhone')); form.phone.focus(); return; }
    err('');
    const btn = form.querySelector('.li-btn'); btn.disabled = true;
    try {
      await sendSmsCode(phone);
      location.hash = `#/login/code?phone=${encodeURIComponent(phone)}${next !== '#/home' ? '&next=' + encodeURIComponent(next) : ''}`;
    } catch (ex) { err(ex instanceof AuthError ? errText(ex) : ex.message); btn.disabled = false; }
  };
}

function codeScreen(main, query, shell, done) {
  const phone = normPhone(query.phone);
  if (!phone) { location.replace('#/login'); return; }
  shell(false, html`<form class="li-form" novalidate>
      <a class="li-backlink" href="#/login?phone=${encodeURIComponent(phone)}">${icon('chevronLeft', 16)}${t('li.back')}</a>
      <h1 class="li-title">${t('li.code')}</h1>
      <p class="li-lead">${raw(t('li.sent', { p: `<b>${maskPhone(phone)}</b>` }))}</p>
      <label class="li-code"><span class="sr">${t('li.codeLabel')}</span><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="4" pattern="[0-9]*">
        <span class="boxes" aria-hidden="true">${[0, 1, 2, 3].map(i => html`<i data-i="${i}"></i>`)}</span></label>
      <div class="li-resend"></div>
      <div class="li-err" role="alert" hidden></div>
      <button class="btn-k li-btn">${t('li.enter')}</button>
      <a class="li-change" href="#/login">${t('li.change')}</a>
    </form>`.toString());
  const form = main.querySelector('.li-form');
  const input = form.code;
  const boxes = [...form.querySelectorAll('.boxes i')];
  const paint = () => {
    const v = input.value.replace(/\D/g, '').slice(0, 4);
    if (input.value !== v) input.value = v;
    boxes.forEach((b, i) => { b.textContent = v[i] || ''; b.classList.toggle('filled', !!v[i]); b.classList.toggle('cur', document.activeElement === input && i === Math.min(v.length, 3)); });
  };
  ['input', 'focus', 'blur'].forEach(ev => input.addEventListener(ev, paint));
  input.focus(); paint();
  const err = msg => { const e = form.querySelector('.li-err'); e.hidden = !msg; e.textContent = msg || ''; };
  let left = 60, timer = null;
  const tick = () => {
    const r = form.querySelector('.li-resend');
    if (!r) { clearInterval(timer); return; }
    if (left > 0) r.innerHTML = html`${raw(t('li.resendIn', { t: `<b>0:${String(left).padStart(2, '0')}</b>` }))}`.toString();
    else { r.innerHTML = html`<button type="button" class="link-btn">${t('li.resend')}</button>`.toString(); r.querySelector('button').onclick = resend; clearInterval(timer); }
    left--;
  };
  const start = () => { left = 60; clearInterval(timer); tick(); timer = setInterval(tick, 1000); };
  const resend = async () => { try { await sendSmsCode(phone); start(); } catch (ex) { err(ex instanceof AuthError ? errText(ex) : ex.message); } };
  start();
  form.onsubmit = async e => {
    e.preventDefault();
    if (input.value.length !== 4) { input.focus(); return; }
    err('');
    const btn = form.querySelector('.li-btn'); btn.disabled = true;
    try { await verifySmsCode(phone, input.value); done(); } catch (ex) { err(ex instanceof AuthError ? errText(ex) : ex.message); btn.disabled = false; }
  };
  return () => clearInterval(timer);
}
