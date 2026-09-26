/* Screen 25: an example lesson anyone can look at without signing in —
 * slides and what the set contains; starting it needs an account. */
import { add, t, lang, setLang } from '../i18n.js';
import { html, raw, icon } from '../ui.js';
import { slideBox } from '../deck.js';
import { renderMath } from '../slides.js';
import { currentUser } from '../auth.js';

add({
  ru: { 'pv.mode': 'Режим просмотра · пример урока', 'pv.login': 'Войти', 'pv.start': 'Начать бесплатно', 'pv.meta': 'Английский язык · 7 класс · пример', 'pv.slide': 'Слайд {i} из {n}',
    'pv.ksp': 'КСП', 'pv.kspN': 'план по этапам', 'pv.games': 'Игры', 'pv.gamesN': 'Совпадения, Мемори', 'pv.quiz': 'Викторина', 'pv.quizN': '5 вопросов', 'pv.test': 'Тест', 'pv.testN': '8 вопросов', 'pv.hw': 'Задание', 'pv.hwN': 'онлайн-тест',
    'pv.h': 'Войдите, чтобы провести этот урок', 'pv.p': 'Смотреть можно всё. Чтобы начать урок, скачать КСП или создать свой — войдите. Это бесплатно.', 'pv.google': 'Войти через Google', 'pv.phone': 'Войти по номеру телефона',
    'pv.can': 'Смотреть слайды и план урока', 'pv.lock1': 'Начать урок, игры и тест', 'pv.lock2': 'Скачать КСП, отправить задание', 'pv.prev': 'Предыдущий слайд', 'pv.next': 'Следующий слайд', 'pv.open': 'Открыть платформу' },
  kk: { 'pv.mode': 'Қарау режимі · сабақ мысалы', 'pv.login': 'Кіру', 'pv.start': 'Тегін бастау', 'pv.meta': 'Ағылшын тілі · 7 сынып · мысал', 'pv.slide': '{n} слайдтың {i}-і',
    'pv.ksp': 'ҚМЖ', 'pv.kspN': 'кезеңдер бойынша жоспар', 'pv.games': 'Ойындар', 'pv.gamesN': 'Сәйкестендіру, Мемори', 'pv.quiz': 'Викторина', 'pv.quizN': '5 сұрақ', 'pv.test': 'Тест', 'pv.testN': '8 сұрақ', 'pv.hw': 'Тапсырма', 'pv.hwN': 'онлайн-тест',
    'pv.h': 'Осы сабақты өткізу үшін кіріңіз', 'pv.p': 'Бәрін көруге болады. Сабақты бастау, ҚМЖ жүктеу немесе өзіңіздікін құру үшін кіріңіз. Бұл тегін.', 'pv.google': 'Google арқылы кіру', 'pv.phone': 'Телефон нөмірі арқылы кіру',
    'pv.can': 'Слайдтар мен сабақ жоспарын көру', 'pv.lock1': 'Сабақты, ойындар мен тестті бастау', 'pv.lock2': 'ҚМЖ жүктеу, тапсырма жіберу', 'pv.prev': 'Алдыңғы слайд', 'pv.next': 'Келесі слайд', 'pv.open': 'Платформаны ашу' },
  en: { 'pv.mode': 'Preview mode · example lesson', 'pv.login': 'Sign in', 'pv.start': 'Start for free', 'pv.meta': 'English · grade 7 · example', 'pv.slide': 'Slide {i} of {n}',
    'pv.ksp': 'Lesson plan', 'pv.kspN': 'stage by stage', 'pv.games': 'Games', 'pv.gamesN': 'Matching, Memory', 'pv.quiz': 'Quiz', 'pv.quizN': '5 questions', 'pv.test': 'Test', 'pv.testN': '8 questions', 'pv.hw': 'Homework', 'pv.hwN': 'online test',
    'pv.h': 'Sign in to teach this lesson', 'pv.p': 'You can look at everything. To start the lesson, download the plan or make your own — sign in. It’s free.', 'pv.google': 'Sign in with Google', 'pv.phone': 'Sign in with a phone number',
    'pv.can': 'View the slides and lesson plan', 'pv.lock1': 'Start the lesson, games and test', 'pv.lock2': 'Download the plan, send homework', 'pv.prev': 'Previous slide', 'pv.next': 'Next slide', 'pv.open': 'Open the platform' }
});

const DECK = {
  title: 'Past Simple', lang: 'en', ratio: '16:9', theme: 'lime',
  slides: [
    { layout: 'title', title: 'Past Simple', subtitle: 'Regular and irregular verbs', icon: 'clock' },
    { layout: 'content', title: 'What is Past Simple?', bullets: ['Finished actions in the past', 'Yesterday, last week, two days ago', 'One form for all persons'], icon: 'history' },
    { layout: 'bigidea', title: 'Yesterday I <mark>played</mark> football', bullets: ['go → went · see → saw · have → had'] },
    { layout: 'compare', title: 'Regular vs irregular', left_title: 'Regular', left_bullets: ['play → played', 'watch → watched', 'study → studied'], right_title: 'Irregular', right_bullets: ['go → went', 'see → saw', 'buy → bought'] },
    { layout: 'process', title: 'Making a question', steps: ['Did', 'subject', 'verb (base form)', '?'] },
    { layout: 'quiz', title: 'Check yourself', question: 'Yesterday she ___ to school.', options: ['go', 'went', 'goed', 'gone'], correct_index: 1 },
    { layout: 'fillblank', title: 'Fill the gap', sentence_before: 'We', sentence_after: 'a film last night.', correct_word: 'watched', word_options: ['watch', 'watched', 'watches', 'watching'] },
    { layout: 'match', title: 'Match the forms', pairs: [{ left: 'see', right: 'saw' }, { left: 'have', right: 'had' }, { left: 'buy', right: 'bought' }] },
    { layout: 'truefalse', title: 'True or false?', statement: '“Goed” is the past form of “go”.', is_true: false },
    { layout: 'content', title: 'Homework', bullets: ['Write 5 sentences about your last weekend', 'Use at least 3 irregular verbs'], icon: 'notebook-pen' }
  ]
};

export async function render(main) {
  const user = await currentUser();
  let i = 2;
  const draw = () => {
    main.innerHTML = html`<div class="pv">
      <header class="pv-head"><a class="logo" href="../index.html">alaqai<span class="logo-dot"></span></a>
        <span class="pv-mode">${icon('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6', 15)}${t('pv.mode')}</span>
        <span class="pv-acts"><span class="pv-lang">${[['kk', 'ҚАЗ'], ['ru', 'РУС'], ['en', 'ENG']].map(([id, l]) => html`<button type="button" data-lang="${id}" aria-pressed="${id === lang()}">${l}</button>`)}</span>
          ${user ? html`<a class="btn-k btn-md" href="#/home">${t('pv.open')}</a>` : html`<a class="btn-o btn-md" href="#/login">${t('pv.login')}</a><a class="btn-k btn-md" href="#/login">${t('pv.start')}</a>`}</span></header>
      <div class="pv-body">
        <div class="pv-main">
          <div><div class="small">${t('pv.meta')}</div><h1 class="title">Past Simple</h1></div>
          <div class="pv-stage"><span class="pv-count">${t('pv.slide', { i: i + 1, n: DECK.slides.length })}</span>${raw(slideBox(DECK.slides[i], DECK, i, 'view'))}
            <span class="pv-nav"><button type="button" class="icon-btn" data-go="-1" aria-label="${t('pv.prev')}" ${i === 0 ? raw('disabled') : ''}>${icon('chevronLeft')}</button><button type="button" class="icon-btn" data-go="1" aria-label="${t('pv.next')}" ${i === DECK.slides.length - 1 ? raw('disabled') : ''}>${icon('chevronRight')}</button></span></div>
          <div class="pv-items">${[['ksp', 'kspN'], ['games', 'gamesN'], ['quiz', 'quizN'], ['test', 'testN'], ['hw', 'hwN']].map(([a, b]) => html`<div><b>${t('pv.' + a)}${icon('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z', 14)}</b><span>${t('pv.' + b)}</span></div>`)}</div>
        </div>
        <aside class="pv-side">
          <span class="pv-ic">${icon('play', 20)}</span>
          <div class="pv-h">${t('pv.h')}</div><p>${t('pv.p')}</p>
          <a class="li-gbtn" href="#/login?next=${encodeURIComponent('#/home')}"><span class="g">G</span>${t('pv.google')}</a>
          <a class="btn-k li-btn" href="#/login">${t('pv.phone')}</a>
          <hr>
          <ul class="pv-list"><li class="ok">${icon('check', 14)}${t('pv.can')}</li><li>${icon('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z', 14)}${t('pv.lock1')}</li><li>${icon('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z', 14)}${t('pv.lock2')}</li></ul>
        </aside>
      </div></div>`;
    main.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
    main.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { i = Math.max(0, Math.min(DECK.slides.length - 1, i + Number(b.dataset.go))); draw(); });
    renderMath(main);
  };
  draw();
  const onKey = e => { if (e.key === 'ArrowRight' && i < DECK.slides.length - 1) { i++; draw(); } else if (e.key === 'ArrowLeft' && i > 0) { i--; draw(); } };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}
