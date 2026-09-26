/* Screen 21: the free step-by-step guide. A step counts as done when the teacher
 * has actually done it on the platform (or marks it by hand). Videos are added
 * by the admin (settings.guideVideos[i]); until then a placeholder is shown. */
import { add, t } from '../i18n.js';
import { html, raw, esc, icon } from '../ui.js';
import { db } from '../data/store.js';

const STEPS = [
  { href: '#/classes', done: d => d.classes > 0 },
  { href: '#/presentations', done: d => d.presentations > 0 },
  { href: '#/presentations?list=1', done: d => d.edited > 0 },
  { href: '#/tests', done: d => d.tests > 0 },
  { href: '#/lessons', done: d => d.taught > 0 },
  { href: '#/homework', done: d => d.homework > 0 },
  { href: '#/lessons', done: d => d.reviewed > 0 }
];

add({
  ru: {
    'gd.title': 'Инструкция', 'gd.free': 'бесплатно', 'gd.step': 'Шаг {n} · {t}', 'gd.all': 'Все шаги', 'gd.progress': '{n} из {total} пройдено', 'gd.try': 'Попробовать сейчас →', 'gd.mark': 'Отметить как пройденный', 'gd.unmark': 'Снять отметку', 'gd.video': 'Видео-урок появится здесь', 'gd.next': 'Следующий шаг',
    'gd.t1': 'Вход и первый класс', 'gd.t2': 'Презентация за 5 минут', 'gd.t3': 'Редактор и агент', 'gd.t4': 'Тесты и игры', 'gd.t5': 'Проведение урока', 'gd.t6': 'Домашние задания', 'gd.t7': 'Итоги и анализ урока',
    'gd.s1': [['Вход', 'Войдите через Google или по номеру телефона'], ['Класс', 'Добавьте класс и предмет — например, 8 «А», физика'], ['Ученики', 'Вставьте список учеников — по одному на строку']],
    'gd.s2': [['1. Тема', 'Напишите тему урока или загрузите страницу учебника'], ['2. Настройки', 'Язык, формат 16:9 или 4:3, число слайдов'], ['3. Проверка', 'Поправьте вручную или попросите агента']],
    'gd.s3': [['Текст', 'Нажмите на любой элемент слайда и измените его'], ['Картинки', 'Замените фото, иконку или добавьте формулу'], ['Агент', 'Напишите: «добавь слайд с вопросом» — агент сделает сам']],
    'gd.s4': [['Тест', 'Сгенерируйте вопросы по теме или напишите свои'], ['Игры', '9 игр: викторина, кроссворд, мемори и другие'], ['В урок', 'Добавьте тест или игру в урок одним нажатием']],
    'gd.s5': [['Старт', 'Откройте урок и нажмите «Начать урок»'], ['Инструменты', 'Журнал, колесо, группы, таймер, шумомер и доска — внизу экрана'], ['Завершение', 'Нажмите «Завершить» — журнал сохранится сам']],
    'gd.s6': [['Задание', 'Онлайн-тест или задание в тетради с фото'], ['Отправка', 'Выберите класс и срок — ссылка и QR-код готовы'], ['Проверка', 'Тест проверяется сам, фото — с помощью ИИ']],
    'gd.s7': [['Цифры', 'Посещаемость, баллы и ответы викторины по вопросам'], ['Внимание', 'Кто пропустил и кому нужна поддержка'], ['Анализ', 'Что получилось и что сделать на следующем уроке']]
  },
  kk: {
    'gd.title': 'Нұсқаулық', 'gd.free': 'тегін', 'gd.step': '{n}-қадам · {t}', 'gd.all': 'Барлық қадам', 'gd.progress': '{total} қадамның {n}-і өтті', 'gd.try': 'Қазір байқап көру →', 'gd.mark': 'Өтті деп белгілеу', 'gd.unmark': 'Белгіні алып тастау', 'gd.video': 'Бейне-сабақ осында болады', 'gd.next': 'Келесі қадам',
    'gd.t1': 'Кіру және алғашқы сынып', 'gd.t2': '5 минутта презентация', 'gd.t3': 'Редактор және агент', 'gd.t4': 'Тест және ойын', 'gd.t5': 'Сабақ өткізу', 'gd.t6': 'Үй тапсырмасы', 'gd.t7': 'Сабақ қорытындысы мен талдауы',
    'gd.s1': [['Кіру', 'Google немесе телефон нөмірі арқылы кіріңіз'], ['Сынып', 'Сынып пен пәнді қосыңыз — мысалы, 8 «А», физика'], ['Оқушылар', 'Оқушылар тізімін қойыңыз — әр жолға біреу']],
    'gd.s2': [['1. Тақырып', 'Сабақ тақырыбын жазыңыз немесе оқулық бетін жүктеңіз'], ['2. Баптаулар', 'Тіл, 16:9 не 4:3 форматы, слайд саны'], ['3. Тексеру', 'Қолмен түзетіңіз немесе агенттен сұраңыз']],
    'gd.s3': [['Мәтін', 'Слайдтағы кез келген элементті басып, өзгертіңіз'], ['Суреттер', 'Фотоны, белгішені ауыстырыңыз немесе формула қосыңыз'], ['Агент', '«Сұрағы бар слайд қос» деп жазыңыз — агент өзі жасайды']],
    'gd.s4': [['Тест', 'Тақырып бойынша сұрақтар құрыңыз немесе өзіңіз жазыңыз'], ['Ойындар', '9 ойын: викторина, сөзжұмбақ, мемори және т.б.'], ['Сабаққа', 'Тест не ойынды сабаққа бір батырмамен қосыңыз']],
    'gd.s5': [['Бастау', 'Сабақты ашып, «Сабақты бастау» батырмасын басыңыз'], ['Құралдар', 'Журнал, дөңгелек, топтар, таймер, шуөлшегіш және тақта — экранның төменгі жағында'], ['Аяқтау', '«Аяқтау» батырмасын басыңыз — журнал өзі сақталады']],
    'gd.s6': [['Тапсырма', 'Онлайн-тест немесе дәптерге фотосы бар тапсырма'], ['Жіберу', 'Сынып пен мерзімді таңдаңыз — сілтеме мен QR-код дайын'], ['Тексеру', 'Тест өзі тексеріледі, фото — ЖИ көмегімен']],
    'gd.s7': [['Сандар', 'Қатысу, ұпай және викторина жауаптары сұрақ бойынша'], ['Назар', 'Кім қалдырды және кімге қолдау керек'], ['Талдау', 'Не шықты және келесі сабақта не істеу керек']]
  },
  en: {
    'gd.title': 'Guide', 'gd.free': 'free', 'gd.step': 'Step {n} · {t}', 'gd.all': 'All steps', 'gd.progress': '{n} of {total} done', 'gd.try': 'Try it now →', 'gd.mark': 'Mark as done', 'gd.unmark': 'Unmark', 'gd.video': 'The video lesson will be here', 'gd.next': 'Next step',
    'gd.t1': 'Sign in and your first class', 'gd.t2': 'Slides in 5 minutes', 'gd.t3': 'Editor and agent', 'gd.t4': 'Tests and games', 'gd.t5': 'Teaching the lesson', 'gd.t6': 'Homework', 'gd.t7': 'Lesson results and analysis',
    'gd.s1': [['Sign in', 'Sign in with Google or your phone number'], ['Class', 'Add a class and a subject — for example 8A, physics'], ['Students', 'Paste the class list — one name per line']],
    'gd.s2': [['1. Topic', 'Type the lesson topic or upload a textbook page'], ['2. Settings', 'Language, 16:9 or 4:3, number of slides'], ['3. Review', 'Fix things by hand or ask the agent']],
    'gd.s3': [['Text', 'Click any element on a slide and change it'], ['Pictures', 'Replace a photo or icon, or add a formula'], ['Agent', 'Write “add a slide with a question” — the agent does it']],
    'gd.s4': [['Test', 'Generate questions on the topic or write your own'], ['Games', '9 games: quiz, crossword, memory and more'], ['In the lesson', 'Add a test or game to the lesson in one click']],
    'gd.s5': [['Start', 'Open the lesson and press “Start lesson”'], ['Tools', 'Register, wheel, groups, timer, noise meter and board — at the bottom'], ['Finish', 'Press “Finish” — the register saves itself']],
    'gd.s6': [['Task', 'An online test or a notebook task with photos'], ['Send', 'Choose the class and deadline — the link and QR code are ready'], ['Check', 'Tests check themselves, photos are checked with AI help']],
    'gd.s7': [['Numbers', 'Attendance, points and quiz answers by question'], ['Attention', 'Who missed it and who needs support'], ['Analysis', 'What worked and what to do next lesson']]
  }
});

export async function render(main, { query }) {
  const [settings, classes, presentations, tests, games, lessons, homework] = await Promise.all([
    db.settings.get(), db.classes.list(r => !r.demo), db.presentations.list(r => !r.demo), db.tests.list(r => !r.demo), db.games.list(r => !r.demo), db.lessons.list(r => !r.demo), db.homework.list(h => h.status === 'sent' && !h.demo)
  ]);
  const data = {
    classes: classes.length, presentations: presentations.length, edited: presentations.filter(p => p.updatedAt).length,
    tests: tests.length + games.length, taught: lessons.filter(l => l.status === 'done').length, homework: homework.length,
    reviewed: lessons.filter(l => l.understood != null || l.aiAnalysis).length
  };
  const manual = new Set(settings.guideDone || []);
  const isDone = i => manual.has(i) || STEPS[i].done(data);
  const firstOpen = STEPS.findIndex((s, i) => !isDone(i));
  let cur = query.step ? Math.max(0, Math.min(STEPS.length - 1, Number(query.step) - 1)) : firstOpen < 0 ? 0 : firstOpen;

  const draw = () => {
    const doneCount = STEPS.filter((s, i) => isDone(i)).length;
    const subs = t('gd.s' + (cur + 1));
    const video = (settings.guideVideos || [])[cur];
    main.innerHTML = html`
      <div class="gd">
        <div class="gd-main">
          <div><div class="gd-h"><h1 class="title title-md">${t('gd.title')}</h1><span class="tag lime">${t('gd.free')}</span></div>
            <div class="small">${t('gd.step', { n: cur + 1, t: t('gd.t' + (cur + 1)) })}</div></div>
          <div class="gd-video">${video ? raw(videoEmbed(video)) : html`<span class="play">${icon('play', 22)}</span><span>${t('gd.video')}</span>`}</div>
          <div class="gd-subs">${(Array.isArray(subs) ? subs : []).map(([h, p]) => html`<div><b>${h}</b><span>${p}</span></div>`)}</div>
          <div class="gd-actions">
            <a class="btn-k btn-md" href="${STEPS[cur].href}">${t('gd.try')}</a>
            ${STEPS[cur].done(data) ? '' : html`<button type="button" class="btn-o btn-md" data-mark>${manual.has(cur) ? t('gd.unmark') : t('gd.mark')}</button>`}
            ${cur < STEPS.length - 1 ? html`<button type="button" class="link-btn" data-next>${t('gd.next')} →</button>` : ''}
          </div>
        </div>
        <div class="gd-steps">
          <div class="gd-sh"><b>${t('gd.all')}</b><span>${t('gd.progress', { n: doneCount, total: STEPS.length })}</span></div>
          ${STEPS.map((s, i) => html`<button type="button" class="gd-step${i === cur ? ' on' : ''}${isDone(i) ? ' done' : ''}" data-step="${i}"><span class="dot">${isDone(i) ? icon('check', 13) : i + 1}</span><span>${t('gd.t' + (i + 1))}</span></button>`)}
        </div>
      </div>`;
    main.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { cur = Number(b.dataset.step); draw(); });
    const n = main.querySelector('[data-next]');
    if (n) n.onclick = () => { cur++; draw(); };
    const m = main.querySelector('[data-mark]');
    if (m) m.onclick = async () => {
      if (manual.has(cur)) manual.delete(cur); else manual.add(cur);
      await db.settings.set({ guideDone: [...manual] });
      draw();
    };
  };
  draw();
}

/** YouTube links become an embedded player; anything else plays as a video file. */
function videoEmbed(url) {
  const yt = String(url).match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if (yt) return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="video" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  return `<video src="${esc(url)}" controls preload="metadata"></video>`;
}
