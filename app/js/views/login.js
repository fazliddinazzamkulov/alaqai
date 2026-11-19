/* Screen 23: sign in with Google (the only way in).
 * A new account is created on first sign-in (server side). */
import { add, t, lang, setLang } from '../i18n.js';
import { html, raw, icon, toast } from '../ui.js';
import { renderGoogle, googleConfigured, currentUser } from '../auth.js';

add({
  ru: {
    'li.hero1': 'Готовый урок', 'li.hero2': 'за одну минуту', 'li.free': 'Базовые функции — бесплатно навсегда',
    'li.p1': 'КСП в Word', 'li.p2': 'Презентация', 'li.p3': 'Игры и викторины', 'li.p4': 'Тест', 'li.p5': 'Домашнее задание', 'li.p6': 'Анализ урока',
    'li.title': 'Вход в alaqai', 'li.lead': 'Если вы здесь впервые — аккаунт создастся сам.', 'li.google': 'Продолжить с Google',
    'li.terms': 'Продолжая, вы соглашаетесь с {a} и {b}.', 'li.termsA': 'Условиями использования', 'li.termsB': 'Политикой конфиденциальности',
    'li.noGoogle': 'Вход через Google включится после настройки Google Client ID на сайте.',
    'li.offline': 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.',
   
    'li.welcome': 'Вы вошли', 'li.example': 'Посмотреть пример урока без входа', 'li.already': 'Вы уже вошли как {n}', 'li.toPlatform': 'Перейти на платформу'
  },
  kk: {
    'li.hero1': 'Дайын сабақ', 'li.hero2': 'бір минутта', 'li.free': 'Негізгі мүмкіндіктер — мәңгі тегін',
    'li.p1': 'ҚМЖ Word-та', 'li.p2': 'Презентация', 'li.p3': 'Ойындар мен викториналар', 'li.p4': 'Тест', 'li.p5': 'Үй тапсырмасы', 'li.p6': 'Сабақ талдауы',
    'li.title': 'alaqai-ға кіру', 'li.lead': 'Алғаш рет келсеңіз — аккаунт өзі құрылады.', 'li.google': 'Google арқылы жалғастыру',
    'li.terms': 'Жалғастыра отырып, сіз {a} және {b} келісесіз.', 'li.termsA': 'Пайдалану шарттарымен', 'li.termsB': 'Құпиялылық саясатымен',
    'li.noGoogle': 'Google арқылы кіру сайтта Google Client ID бапталғаннан кейін қосылады.',
    'li.offline': 'Сервермен байланыс жоқ. Интернетті тексеріп, қайталап көріңіз.',
   
    'li.welcome': 'Сіз кірдіңіз', 'li.example': 'Кірмей-ақ сабақ мысалын көру', 'li.already': 'Сіз {n} ретінде кірдіңіз', 'li.toPlatform': 'Платформаға өту'
  },
  en: {
    'li.hero1': 'A ready lesson', 'li.hero2': 'in one minute', 'li.free': 'The basics are free forever',
    'li.p1': 'Lesson plan in Word', 'li.p2': 'Slides', 'li.p3': 'Games and quizzes', 'li.p4': 'Test', 'li.p5': 'Homework', 'li.p6': 'Lesson analysis',
    'li.title': 'Sign in to alaqai', 'li.lead': 'New here? Your account is created automatically.', 'li.google': 'Continue with Google',
    'li.terms': 'By continuing you agree to the {a} and the {b}.', 'li.termsA': 'Terms of use', 'li.termsB': 'Privacy policy',
    'li.noGoogle': 'Google sign-in turns on once the Google Client ID is set up for the site.',
    'li.offline': 'Can’t reach the server. Check your connection and try again.',
   
    'li.welcome': 'You are signed in', 'li.example': 'See an example lesson without signing in', 'li.already': 'You are signed in as {n}', 'li.toPlatform': 'Go to the platform'
  }
});

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

  if (args[0] === 'code') { location.replace('#/login'); return; } // old SMS-code links

  const user = await currentUser();
  shell(true, html`<form class="li-form" novalidate>
      <h1 class="li-title">${t('li.title')}</h1>
      ${user ? html`<p class="li-lead">${t('li.already', { n: user.name || user.email })}</p><a class="btn-k li-btn" href="#/home">${t('li.toPlatform')}</a>` : html`
      <p class="li-lead">${t('li.lead')}</p>
      <div class="li-google" data-google>${googleConfigured() ? '' : html`<button type="button" class="li-gbtn" data-nogoogle><span class="g">G</span>${t('li.google')}</button>`}</div>
      <div class="li-err" role="alert" hidden></div>
      <p class="li-terms">${raw(t('li.terms', { a: `<u>${t('li.termsA')}</u>`, b: `<u>${t('li.termsB')}</u>` }))}</p>
      <a class="li-example" href="#/preview">${t('li.example')} →</a>`}
    </form>`.toString());
  if (user) return;
  const form = main.querySelector('.li-form');
  const err = msg => { const e = form.querySelector('.li-err'); e.hidden = !msg; e.textContent = msg || ''; };
  const g = form.querySelector('[data-google]');
  if (googleConfigured()) renderGoogle(g, { onSignIn: done, onError: () => err(t('li.offline')), width: Math.min(400, g.clientWidth || 400) });
  else form.querySelector('[data-nogoogle]').onclick = () => err(t('li.noGoogle'));
  form.onsubmit = e => e.preventDefault();
}
