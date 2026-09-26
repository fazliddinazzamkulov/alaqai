/* Screens 13–19 · Lesson mode. The slide fills the screen; a thin dock at the
 * bottom switches materials (slides, game, quiz, test, homework, own file) and
 * opens the tools: AI chat, timer, student picker, noise meter, register,
 * groups, board and blackout. */
import { add, t, lang } from '../i18n.js';
import { esc, icon, toast } from '../ui.js';
import { db } from '../data/store.js';
import { today, shortDate } from '../school.js';
import { slideBox, fillImages } from '../deck.js';
import { bindGames, renderMath, plain } from '../slides.js';
import { playGame } from '../games.js';
import { playTest } from '../testlogic.js';
import { generateJSON } from '../ai.js';
import { openPicker, MARKS, TINTS } from '../lesson/picker.js';
import { monsterSvg, moodOf, Mic, Balls } from '../lesson/noise.js';
import { openFile } from '../lesson/files.js';

add({
  ru: {
    'lm.slides': 'Презентация', 'lm.game': 'Игра', 'lm.quiz': 'Викторина', 'lm.test': 'Тест', 'lm.hw': 'ДЗ', 'lm.file': 'Файл', 'lm.upload': 'Открыть свой файл (PDF, PPTX, DOCX)',
    'lm.prev': 'Назад', 'lm.next': 'Вперёд', 'lm.finish': 'Завершить', 'lm.exit': 'Выйти из урока',
    'lm.t.ai': 'ИИ-чат', 'lm.t.timer': 'Таймер', 'lm.t.picker': 'Выбор ученика', 'lm.t.noise': 'Шумомер', 'lm.t.journal': 'Журнал и посещаемость', 'lm.t.groups': 'Группы', 'lm.t.board': 'Доска', 'lm.t.dark': 'Затемнить экран',
    'lm.none.slides': 'В этом уроке нет презентации.', 'lm.none.game': 'В этом уроке нет игр.', 'lm.none.quiz': 'В этом уроке нет викторины.', 'lm.none.test': 'В этом уроке нет теста.', 'lm.none.hw': 'Домашнее задание не создано.', 'lm.none.file': 'Откройте свой файл — PDF, PPTX или DOCX.',
    'lm.make': 'Создать', 'lm.chooseFile': 'Выбрать файл', 'lm.fileErr': 'Не удалось открыть файл', 'lm.fileLabel': 'Файл', 'lm.pageOf': '{r} · {i} из {n}',
    'lm.hwDue': 'Сдать до {d}', 'lm.hwOnline': 'Онлайн-тест · {n} вопросов', 'lm.hwNotebook': 'Задание в тетради — пришлите фото',
    'lm.autosave': 'Сохраняется автоматически', 'lm.close': 'Закрыть панель', 'lm.journal': 'Журнал', 'lm.attendance': 'Посещаемость', 'lm.groups': 'Группы', 'lm.came': 'Пришли {n} из {total}', 'lm.plusAll': '+1 всем', 'lm.allHere': 'Все пришли',
    'lm.here': 'Пришёл', 'lm.absent': 'Нет на уроке', 'lm.minus': 'Минус балл', 'lm.plus': 'Плюс балл', 'lm.noClass': 'Выберите класс, чтобы вести журнал', 'lm.noStudents': 'В классе нет учеников — добавьте их в «Классах».',
    'lm.groupsSub': 'Только пришедшие · {n}', 'lm.howMany': 'Сколько групп', 'lm.howSplit': 'Как делить', 'lm.byPoints': 'Поровну по баллам', 'lm.random': 'Случайно', 'lm.group': 'Группа {n}', 'lm.shuffle': 'Перемешать', 'lm.groupWheel': 'Колесо групп', 'lm.makeGroups': 'Разделить на группы',
    'lm.noise': 'Шумомер', 'lm.noiseSub': 'Показывается в углу слайда', 'lm.balls': 'Шарики', 'lm.ballsSub': 'прыгают от шума', 'lm.monster': 'Монстрик', 'lm.scale': 'Шкала',
    'lm.mood.sleep': 'Тихо — монстрик спит', 'lm.mood.mid': 'Шумновато — монстрик приоткрыл глаза', 'lm.mood.loud': 'Громко! Монстрик проснулся и просит потише', 'lm.shh': 'Тсс… потише!',
    'lm.silence': 'Таймер тишины', 'lm.silenceSub': 'Идёт, пока в классе тихо', 'lm.min': '{n} мин', 'lm.pause': 'Пауза', 'lm.play': 'Пуск', 'lm.reset': 'Сначала',
    'lm.mic': 'Включить микрофон', 'lm.micOff': 'Выключить микрофон', 'lm.micErr': 'Нет доступа к микрофону — разрешите его в браузере', 'lm.testLevel': 'Проверить: громкость класса', 'lm.quiet': 'тихо', 'lm.loud': 'громко', 'lm.threshold': 'порог: {n}%',
    'lm.timer': 'Таймер', 'lm.timerSub': 'Показывается внизу вместо часов', 'lm.stopwatch': 'Секундомер', 'lm.timeUp': 'Время вышло',
    'lm.ai': 'ИИ-чат', 'lm.aiSub': 'Помощник на уроке', 'lm.aiPh': 'Спросите что-нибудь…', 'lm.aiHello': 'Спросите: «объясни проще», «дай ещё пример», «придумай вопрос классу».', 'lm.ai.simpler': 'Объясни проще', 'lm.ai.example': 'Ещё пример', 'lm.ai.question': 'Вопрос классу',
    'lm.board': 'Доска', 'lm.eraser': 'Ластик', 'lm.clear': 'Очистить', 'lm.darkHint': 'Нажмите, чтобы вернуться', 'lm.finished': 'Урок завершён — журнал сохранён', 'lm.notFound': 'Урок не найден',
    'lm.answering': 'Отвечает', 'lm.nobody': '—'
  },
  kk: {
    'lm.slides': 'Презентация', 'lm.game': 'Ойын', 'lm.quiz': 'Викторина', 'lm.test': 'Тест', 'lm.hw': 'ҮТ', 'lm.file': 'Файл', 'lm.upload': 'Өз файлыңызды ашу (PDF, PPTX, DOCX)',
    'lm.prev': 'Артқа', 'lm.next': 'Алға', 'lm.finish': 'Аяқтау', 'lm.exit': 'Сабақтан шығу',
    'lm.t.ai': 'ЖИ-чат', 'lm.t.timer': 'Таймер', 'lm.t.picker': 'Оқушы таңдау', 'lm.t.noise': 'Шуөлшегіш', 'lm.t.journal': 'Журнал және қатысу', 'lm.t.groups': 'Топтар', 'lm.t.board': 'Тақта', 'lm.t.dark': 'Экранды қарайту',
    'lm.none.slides': 'Бұл сабақта презентация жоқ.', 'lm.none.game': 'Бұл сабақта ойын жоқ.', 'lm.none.quiz': 'Бұл сабақта викторина жоқ.', 'lm.none.test': 'Бұл сабақта тест жоқ.', 'lm.none.hw': 'Үй тапсырмасы құрылмаған.', 'lm.none.file': 'Өз файлыңызды ашыңыз — PDF, PPTX немесе DOCX.',
    'lm.make': 'Құру', 'lm.chooseFile': 'Файл таңдау', 'lm.fileErr': 'Файлды ашу мүмкін болмады', 'lm.fileLabel': 'Файл', 'lm.pageOf': '{r} · {n}-дан {i}',
    'lm.hwDue': '{d} дейін тапсыру', 'lm.hwOnline': 'Онлайн-тест · {n} сұрақ', 'lm.hwNotebook': 'Дәптердегі тапсырма — фото жіберіңіз',
    'lm.autosave': 'Өздігінен сақталады', 'lm.close': 'Панельді жабу', 'lm.journal': 'Журнал', 'lm.attendance': 'Қатысу', 'lm.groups': 'Топтар', 'lm.came': '{total}-дан {n} келді', 'lm.plusAll': 'Барлығына +1', 'lm.allHere': 'Бәрі келді',
    'lm.here': 'Келді', 'lm.absent': 'Сабақта жоқ', 'lm.minus': 'Балл алу', 'lm.plus': 'Балл қосу', 'lm.noClass': 'Журнал жүргізу үшін сыныпты таңдаңыз', 'lm.noStudents': 'Сыныпта оқушы жоқ — «Сыныптар» бөлімінде қосыңыз.',
    'lm.groupsSub': 'Тек келгендер · {n}', 'lm.howMany': 'Топ саны', 'lm.howSplit': 'Қалай бөлу', 'lm.byPoints': 'Балл бойынша тең', 'lm.random': 'Кездейсоқ', 'lm.group': '{n}-топ', 'lm.shuffle': 'Араластыру', 'lm.groupWheel': 'Топтар дөңгелегі', 'lm.makeGroups': 'Топқа бөлу',
    'lm.noise': 'Шуөлшегіш', 'lm.noiseSub': 'Слайдтың бұрышында көрсетіледі', 'lm.balls': 'Шарлар', 'lm.ballsSub': 'шудан секіреді', 'lm.monster': 'Күзетші', 'lm.scale': 'Шкала',
    'lm.mood.sleep': 'Тыныш — күзетші ұйықтап жатыр', 'lm.mood.mid': 'Сәл шулы — күзетші көзін ашты', 'lm.mood.loud': 'Шулы! Күзетші оянып, тынышырақ болуды сұрайды', 'lm.shh': 'Тсс… тынышырақ!',
    'lm.silence': 'Тыныштық таймері', 'lm.silenceSub': 'Сынып тыныш болғанда жүреді', 'lm.min': '{n} мин', 'lm.pause': 'Кідірту', 'lm.play': 'Бастау', 'lm.reset': 'Басынан',
    'lm.mic': 'Микрофонды қосу', 'lm.micOff': 'Микрофонды өшіру', 'lm.micErr': 'Микрофонға рұқсат жоқ — браузерде рұқсат беріңіз', 'lm.testLevel': 'Тексеру: сынып дауысы', 'lm.quiet': 'тыныш', 'lm.loud': 'шулы', 'lm.threshold': 'шегі: {n}%',
    'lm.timer': 'Таймер', 'lm.timerSub': 'Төменде сағаттың орнына көрсетіледі', 'lm.stopwatch': 'Секундомер', 'lm.timeUp': 'Уақыт бітті',
    'lm.ai': 'ЖИ-чат', 'lm.aiSub': 'Сабақтағы көмекші', 'lm.aiPh': 'Бірдеңе сұраңыз…', 'lm.aiHello': 'Сұраңыз: «жеңілірек түсіндір», «тағы мысал», «сыныпқа сұрақ ойлап тап».', 'lm.ai.simpler': 'Жеңілірек түсіндір', 'lm.ai.example': 'Тағы мысал', 'lm.ai.question': 'Сыныпқа сұрақ',
    'lm.board': 'Тақта', 'lm.eraser': 'Өшіргіш', 'lm.clear': 'Тазалау', 'lm.darkHint': 'Қайту үшін басыңыз', 'lm.finished': 'Сабақ аяқталды — журнал сақталды', 'lm.notFound': 'Сабақ табылмады',
    'lm.answering': 'Жауап береді', 'lm.nobody': '—'
  },
  en: {
    'lm.slides': 'Slides', 'lm.game': 'Game', 'lm.quiz': 'Quiz', 'lm.test': 'Test', 'lm.hw': 'Homework', 'lm.file': 'File', 'lm.upload': 'Open your own file (PDF, PPTX, DOCX)',
    'lm.prev': 'Back', 'lm.next': 'Next', 'lm.finish': 'Finish', 'lm.exit': 'Leave the lesson',
    'lm.t.ai': 'AI chat', 'lm.t.timer': 'Timer', 'lm.t.picker': 'Student picker', 'lm.t.noise': 'Noise meter', 'lm.t.journal': 'Register and attendance', 'lm.t.groups': 'Groups', 'lm.t.board': 'Board', 'lm.t.dark': 'Black out the screen',
    'lm.none.slides': 'This lesson has no slides.', 'lm.none.game': 'This lesson has no games.', 'lm.none.quiz': 'This lesson has no quiz.', 'lm.none.test': 'This lesson has no test.', 'lm.none.hw': 'No homework yet.', 'lm.none.file': 'Open your own file — PDF, PPTX or DOCX.',
    'lm.make': 'Create', 'lm.chooseFile': 'Choose a file', 'lm.fileErr': 'Could not open the file', 'lm.fileLabel': 'File', 'lm.pageOf': '{r} · {i} of {n}',
    'lm.hwDue': 'Due {d}', 'lm.hwOnline': 'Online test · {n} questions', 'lm.hwNotebook': 'Notebook task — send a photo',
    'lm.autosave': 'Saved automatically', 'lm.close': 'Close panel', 'lm.journal': 'Register', 'lm.attendance': 'Attendance', 'lm.groups': 'Groups', 'lm.came': '{n} of {total} here', 'lm.plusAll': '+1 everyone', 'lm.allHere': 'Everyone is here',
    'lm.here': 'Here', 'lm.absent': 'Absent', 'lm.minus': 'Minus a point', 'lm.plus': 'Plus a point', 'lm.noClass': 'Choose a class to keep the register', 'lm.noStudents': 'No students in this class — add them in Classes.',
    'lm.groupsSub': 'Only those here · {n}', 'lm.howMany': 'How many groups', 'lm.howSplit': 'How to split', 'lm.byPoints': 'Evenly by points', 'lm.random': 'Randomly', 'lm.group': 'Group {n}', 'lm.shuffle': 'Shuffle', 'lm.groupWheel': 'Group wheel', 'lm.makeGroups': 'Split into groups',
    'lm.noise': 'Noise meter', 'lm.noiseSub': 'Shown in the corner of the slide', 'lm.balls': 'Balls', 'lm.ballsSub': 'jump with the noise', 'lm.monster': 'Monster', 'lm.scale': 'Scale',
    'lm.mood.sleep': 'Quiet — the monster is asleep', 'lm.mood.mid': 'A bit noisy — the monster opened its eyes', 'lm.mood.loud': 'Loud! The monster woke up and asks for quiet', 'lm.shh': 'Shh… a little quieter!',
    'lm.silence': 'Silence timer', 'lm.silenceSub': 'Runs while the class is quiet', 'lm.min': '{n} min', 'lm.pause': 'Pause', 'lm.play': 'Start', 'lm.reset': 'Reset',
    'lm.mic': 'Turn on the microphone', 'lm.micOff': 'Turn off the microphone', 'lm.micErr': 'No microphone access — allow it in the browser', 'lm.testLevel': 'Try it: class volume', 'lm.quiet': 'quiet', 'lm.loud': 'loud', 'lm.threshold': 'threshold: {n}%',
    'lm.timer': 'Timer', 'lm.timerSub': 'Shown at the bottom instead of the clock', 'lm.stopwatch': 'Stopwatch', 'lm.timeUp': 'Time is up',
    'lm.ai': 'AI chat', 'lm.aiSub': 'Your helper in class', 'lm.aiPh': 'Ask anything…', 'lm.aiHello': 'Ask: “explain it simpler”, “one more example”, “a question for the class”.', 'lm.ai.simpler': 'Explain simpler', 'lm.ai.example': 'One more example', 'lm.ai.question': 'Class question',
    'lm.board': 'Board', 'lm.eraser': 'Eraser', 'lm.clear': 'Clear', 'lm.darkHint': 'Tap to come back', 'lm.finished': 'Lesson finished — register saved', 'lm.notFound': 'Lesson not found',
    'lm.answering': 'Answering', 'lm.nobody': '—'
  }
});

const TOOLS = [
  ['ai', 'M4 5h16v11H9l-5 4z'],
  ['timer', 'M12 5a8 8 0 1 0 0 16a8 8 0 1 0 0-16M12 9v4l2 2M9 2h6'],
  ['picker', 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 15.5h.01M15.5 8.5h.01M8.5 15.5h.01M12 12h.01'],
  ['noise', 'M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2'],
  ['journal', 'M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.6 6.7 19.5l1.1-6L3.4 9.3l6-.8z'],
  ['groups', 'M7 5a3 3 0 1 0 0 6a3 3 0 1 0 0-6M17 5a3 3 0 1 0 0 6a3 3 0 1 0 0-6M2 19a5 5 0 0 1 10 0M12 19a5 5 0 0 1 10 0'],
  ['board', 'M4 20l4-1 11-11-3-3L5 16z'],
  ['dark', 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z']
];
const PANELS = ['ai', 'timer', 'noise', 'journal', 'groups'];

let S = null; // everything about the lesson on screen

export async function render(main, { args, query }) {
  const key = args[0];
  const lesson = key && !['deck', 'test', 'file'].includes(key) ? await db.lessons.get(key) : null;
  if (key && !['deck', 'test', 'file'].includes(key) && !lesson) {
    main.innerHTML = `<div class="empty" style="margin:40px"><h2>${esc(t('lm.notFound'))}</h2><div class="row"><a class="btn-k" href="#/lessons">${esc(t('les.back'))}</a></div></div>`;
    return;
  }
  const p = (lesson && lesson.parts) || {};
  const [deck, games, quiz, test, hw, classes, settings] = await Promise.all([
    query.deck ? db.presentations.get(query.deck) : p.presentationId ? db.presentations.get(p.presentationId) : null,
    Promise.all((p.gameIds || []).map(id => db.games.get(id))).then(x => x.filter(Boolean)),
    p.quizId ? db.tests.get(p.quizId) : null,
    query.test ? db.tests.get(query.test) : p.testId ? db.tests.get(p.testId) : null,
    p.homeworkId ? db.homework.get(p.homeworkId) : null,
    db.classes.list(), db.settings.get()
  ]);
  const live = (lesson && lesson.live) || {};
  S = {
    main, lesson, deck, games, quiz, test, hw, classes, settings,
    classId: (lesson && lesson.classId) || live.classId || null, students: [], journal: new Map(),
    material: query.test ? 'test' : live.material || (deck ? 'slides' : games.length ? 'game' : test ? 'test' : 'file'),
    page: live.page || 0, gameIdx: 0, panel: null, tab: 'journal', file: null, filePage: 0,
    groups: live.groups || null, groupScores: live.groupScores || [], answered: new Set(live.answered || []), lastPicked: null,
    timer: { mode: 'down', total: 300, left: 300, running: false, start: 0 },
    noise: { on: false, display: live.noiseDisplay || 'monster', level: 20, threshold: 70, mic: null, balls: null, silence: 300, silenceLeft: 300, silenceRunning: false },
    started: Date.now(), chat: [], saveTimer: null, tick: null, board: null
  };
  await loadClass(S.classId);
  draw();
  bindKeys();
  S.tick = setInterval(tick, 1000);
  if (deck && deck.slides.some(x => !x.imageUrl && !x.imageTried && x.image_query)) {
    fillImages(deck.id, d => { if (S && S.deck && S.deck.id === d.id) { S.deck = d; if (S.material === 'slides') drawContent(); } });
  }
  return cleanup;
}

async function loadClass(classId) {
  S.classId = classId;
  S.students = classId ? (await db.students.list({ classId })).sort((a, b) => a.name.localeCompare(b.name, 'ru')) : [];
  S.journal = new Map();
  if (S.lesson) (await db.marks.list({ lessonId: S.lesson.id })).forEach(m => S.journal.set(m.studentId, m));
  S.students.forEach(s => { if (!S.journal.has(s.id)) S.journal.set(s.id, { studentId: s.id, present: true, points: 0 }); });
}

function cleanup() {
  clearInterval(S.tick);
  if (S.noise.mic) S.noise.mic.stop();
  if (S.noise.balls) S.noise.balls.stop();
  document.removeEventListener('keydown', onKey);
  saveNow();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  S = null;
}

/* ---------- saving the register and the live state ---------- */

async function ensureLesson() {
  if (S.lesson) return S.lesson;
  S.lesson = await db.lessons.create({ classId: S.classId, topic: (S.deck && S.deck.title) || (S.test && S.test.title) || '', subject: (S.classes.find(c => c.id === S.classId) || {}).subject || '', date: today(), slot: null, status: 'ready', parts: { presentationId: S.deck ? S.deck.id : null, testId: S.test ? S.test.id : null } });
  return S.lesson;
}
function save() { clearTimeout(S.saveTimer); S.saveTimer = setTimeout(saveNow, 700); }
async function saveNow() {
  if (!S) return;
  clearTimeout(S.saveTimer);
  const st = S;
  if (!st.classId && !st.lesson) return;
  const lesson = await ensureLesson();
  await db.lessons.update(lesson.id, { classId: st.classId, live: { material: st.material, page: st.page, groups: st.groups, groupScores: st.groupScores, answered: [...st.answered], classId: st.classId, noiseDisplay: st.noise.display } });
  for (const [sid, m] of st.journal) {
    const data = { lessonId: lesson.id, classId: st.classId, studentId: sid, date: lesson.date || today(), present: m.present, points: m.points || 0 };
    if (m.id) await db.marks.update(m.id, data);
    else if (m.touched) { const created = await db.marks.create(data); m.id = created.id; }
  }
}

/* ---------- drawing ---------- */

const matAvailable = m => ({ slides: !!S.deck, game: S.games.length > 0, quiz: !!(S.quiz && S.quiz.questions.length), test: !!(S.test && S.test.questions.length), hw: !!S.hw, file: !!S.file })[m];
const ratioOf = () => (S.material === 'file' && S.file ? S.file.ratio : S.material === 'slides' && S.deck && S.deck.ratio === '4:3' ? 4 / 3 : 16 / 9);

function draw() {
  const m = S.main;
  const compact = !!S.panel;
  m.innerHTML = `<div class="lm${compact ? ' has-panel' : ''}">
    <div class="lm-left">
      <div class="lm-stage" data-stage>
        ${wings()}
        <div class="lm-fit" style="--r:${ratioOf()}"><div class="lm-content" data-content></div>
          <div class="lm-widget" data-widget ${S.noise.on || S.noise.silenceRunning ? '' : 'hidden'}></div>
          <canvas class="lm-board" data-board hidden></canvas>
        </div>
        ${wings(true)}
      </div>
      <div class="lm-dock">${dock(compact)}</div>
    </div>
    ${compact ? `<aside class="lm-panel" data-panel></aside>` : ''}
  </div><input type="file" accept=".pdf,.pptx,.docx,image/*" hidden data-fileinput>`;
  drawContent();
  if (compact) drawPanel();
  drawWidget();
  bindDock();
}

/** Side columns for 4:3 material on a wide screen (screen 19). */
function wings(right) {
  if (S.panel || ratioOf() > 1.5) return '';
  if (!right) {
    if (S.material !== 'file' || !S.file) return '<div class="lm-wing"></div>';
    return `<div class="lm-wing"><div class="wcard"><span class="k">${esc(t('lm.fileLabel'))}</span><b>${esc(S.file.name)}</b><span class="k">${S.file.ratio < 1.5 ? '4:3' : '16:9'} · ${S.filePage + 1} / ${S.file.pages.length}</span></div></div>`;
  }
  const name = S.lastPicked ? (S.students.find(s => s.id === S.lastPicked) || {}).name : null;
  return `<div class="lm-wing"><div class="wcard"><span class="k">${esc(t('lm.timer'))}</span><b class="big" data-wingtimer>${fmt(S.timer.left)}</b></div>
    <div class="wcard"><span class="k">${esc(t('lm.answering'))}</span><b>${esc(name ? name.split(' ')[0] : t('lm.nobody'))}</b>${name ? `<button type="button" class="wbtn" data-pluspicked>+1</button>` : ''}</div></div>`;
}

function dock(compact) {
  const mats = ['slides', 'game', 'quiz', 'test', 'hw', ...(S.file ? ['file'] : [])];
  const pageInfo = pager();
  return `
    <div class="dk">${compact
      ? `<select class="dk-sel" data-matsel aria-label="${esc(t('lm.slides'))}">${mats.map(x => `<option value="${x}" ${x === S.material ? 'selected' : ''}>${esc(t('lm.' + x))}</option>`).join('')}</select>`
      : mats.map(x => `<button type="button" class="dk-mat${x === S.material ? ' on' : ''}${matAvailable(x) ? '' : ' off'}" data-mat="${x}">${esc(t('lm.' + x))}</button>`).join('')}
      <button type="button" class="dk-ic" data-upload aria-label="${esc(t('lm.upload'))}" title="${esc(t('lm.upload'))}">${icon('M12 16V4M7 9l5-5 5 5M4 16v4h16v-4', 17).__raw}</button>
    </div>
    <div class="dk">
      <button type="button" class="dk-ic" data-prev aria-label="${esc(t('lm.prev'))}">${icon('chevronLeft', 17).__raw}</button>
      <span class="dk-page">${pageInfo ? `${pageInfo.i} / ${pageInfo.n}` : '—'}</span>
      <button type="button" class="dk-ic" data-next aria-label="${esc(t('lm.next'))}">${icon('chevronRight', 17).__raw}</button>
    </div>
    <div class="dk">${TOOLS.map(([id, d]) => `<button type="button" class="dk-ic${S.panel === id || (id === 'groups' && S.panel === 'journal' && S.tab === 'groups') ? ' on' : ''}" data-tool="${id}" aria-label="${esc(t('lm.t.' + id))}" title="${esc(t('lm.t.' + id))}">${icon(d, 18).__raw}</button>`).join('')}</div>
    <div class="dk-right">
      <span class="dk-clock" data-clock>${clockText()}</span>
      <button type="button" class="dk-finish" data-finish>${esc(t('lm.finish'))}</button>
    </div>`;
}

function pager() {
  if (S.material === 'slides' && S.deck) return { i: S.page + 1, n: S.deck.slides.length };
  if (S.material === 'file' && S.file) return { i: S.filePage + 1, n: S.file.pages.length };
  if (S.material === 'game' && S.games.length) return { i: S.gameIdx + 1, n: S.games.length };
  return null;
}

function drawContent() {
  const el = S.main.querySelector('[data-content]');
  const box = S.main.querySelector('.lm-fit');
  el.className = 'lm-content mat-' + S.material;
  const none = () => {
    const make = { slides: '#/presentations', game: '#/tests?tab=games', quiz: '#/tests?tab=games', test: '#/tests?new=1', hw: '#/homework' }[S.material];
    el.innerHTML = `<div class="lm-none"><p>${esc(t('lm.none.' + S.material))}</p>${S.material === 'file'
      ? `<button type="button" class="btn-k btn-md" data-upload2>${esc(t('lm.chooseFile'))}</button>`
      : `<a class="btn-o btn-md" href="${make}">${esc(t('lm.make'))}</a>`}</div>`;
    const u = el.querySelector('[data-upload2]'); if (u) u.onclick = () => S.main.querySelector('[data-fileinput]').click();
  };
  if (!matAvailable(S.material)) return none();
  if (S.material === 'slides') {
    S.page = Math.max(0, Math.min(S.page, S.deck.slides.length - 1));
    el.innerHTML = slideBox(S.deck.slides[S.page], S.deck, S.page, 'present');
    bindGames(el);
    renderMath(el);
  } else if (S.material === 'game') {
    el.innerHTML = '<div class="lm-card"><div data-g></div></div>';
    playGame(el.querySelector('[data-g]'), S.games[S.gameIdx]);
  } else if (S.material === 'quiz') {
    el.innerHTML = '<div class="lm-card"><div data-g></div></div>';
    playGame(el.querySelector('[data-g]'), { type: 'quiz', questions: S.quiz.questions });
  } else if (S.material === 'test') {
    el.innerHTML = `<div class="lm-card scroll"><h2 class="lm-h">${esc(S.test.title || '')}</h2><div data-g></div></div>`;
    playTest(el.querySelector('[data-g]'), S.test);
  } else if (S.material === 'hw') {
    const h = S.hw;
    el.innerHTML = `<div class="lm-card hw"><span class="k">${esc(t('lm.hw'))}</span><h2 class="lm-h big">${esc(h.title || '')}</h2>
      <p class="lead">${esc(h.kind === 'online' ? t('lm.hwOnline', { n: (h.questions || []).length }) : t('lm.hwNotebook'))}</p>
      ${h.instructions ? `<p class="txt">${esc(h.instructions)}</p>` : ''}${h.dueDate ? `<span class="due">${esc(t('lm.hwDue', { d: shortDate(h.dueDate) }))}</span>` : ''}</div>`;
  } else if (S.material === 'file') drawFilePage(el, box);
}

async function drawFilePage(el, box) {
  const pg = S.file.pages[S.filePage];
  if (pg.type === 'pdf') {
    el.innerHTML = '<canvas class="lm-pdf"></canvas>';
    await pg.render(el.querySelector('canvas'), box.clientWidth || 1200);
  } else if (pg.type === 'image') el.innerHTML = `<img class="lm-img" src="${esc(pg.src)}" alt="">`;
  else if (pg.type === 'doc') {
    const doc = new DOMParser().parseFromString(pg.html, 'text/html');
    doc.querySelectorAll('script,style,iframe,object').forEach(x => x.remove());
    doc.querySelectorAll('*').forEach(x => [...x.attributes].forEach(a => { if (/^on/i.test(a.name) || (a.name === 'href' && /^javascript:/i.test(a.value))) x.removeAttribute(a.name); }));
    el.innerHTML = `<div class="lm-doc">${doc.body.innerHTML}</div>`;
  } else {
    el.innerHTML = `<div class="lm-pptx"><h2>${esc(pg.title)}</h2><div class="cols">${pg.body.length ? `<ul>${pg.body.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}${pg.images.length ? `<div class="imgs">${pg.images.slice(0, 4).map(src => `<img src="${esc(src)}" alt="">`).join('')}</div>` : ''}</div></div>`;
  }
}

/* ---------- widget in the corner of the slide: monster / balls / scale + silence timer ---------- */

function drawWidget() {
  const w = S.main && S.main.querySelector('[data-widget]');
  if (!w) return;
  const n = S.noise;
  w.hidden = !(n.on || n.silenceRunning);
  if (w.hidden) return;
  const mood = moodOf(n.level, n.threshold);
  w.className = 'lm-widget ' + n.display;
  w.innerHTML = `${mood === 'loud' ? `<span class="shh">${esc(t('lm.shh'))}</span>` : ''}
    ${n.display === 'monster' ? monsterSvg(mood, 120) : n.display === 'scale' ? `<span class="scale"><i style="width:${n.level}%;background:${mood === 'loud' ? '#FF5A5F' : mood === 'mid' ? '#FFB400' : '#06D6A0'}"></i></span>` : '<canvas class="wballs"></canvas>'}
    <b class="silence">${fmt(n.silenceLeft)}</b>`;
  if (n.display === 'balls') {
    if (n.wballs) n.wballs.stop();
    n.wballs = new Balls(w.querySelector('canvas'));
    n.wballs.level = n.level;
  }
}

/* ---------- right panel ---------- */

function drawPanel() {
  const el = S.main.querySelector('[data-panel]');
  if (!el) return;
  const cls = S.classes.find(c => c.id === S.classId);
  const head = (title, sub) => `<div class="pn-head"><div><b>${esc(title)}</b><span>${esc(sub)}</span></div><button type="button" class="pn-x" data-closepanel aria-label="${esc(t('lm.close'))}">${icon('close', 13).__raw}</button></div>`;
  let body = '';
  if (S.panel === 'journal' || S.panel === 'groups') {
    const title = [cls && cls.name, S.lesson && S.lesson.topic].filter(Boolean).join(' · ') || t('lm.journal');
    const tabs = `<div class="seg pn-tabs">${['journal', 'attendance', 'groups'].map(x => `<button type="button" data-tab="${x}" aria-selected="${S.tab === x}">${esc(t('lm.' + x))}</button>`).join('')}</div>`;
    if (!S.classId) body = head(t('lm.journal'), t('lm.noClass')) + `<div class="pn-classes">${S.classes.map(c => `<button type="button" class="btn-o" data-pickclass="${c.id}">${esc(c.name)}</button>`).join('')}</div>`;
    else if (!S.students.length) body = head(title, t('lm.autosave')) + tabs + `<p class="muted-note">${esc(t('lm.noStudents'))}</p>`;
    else if (S.tab === 'groups') body = head(t('lm.groups'), t('lm.groupsSub', { n: present().length })) + tabs + groupsBody();
    else {
      const here = present().length;
      body = head(title, t('lm.autosave')) + tabs + `
        <div class="pn-row"><b>${esc(t('lm.came', { n: here, total: S.students.length }))}</b>${S.tab === 'journal' ? `<button type="button" class="btn-o btn-sm" data-plusall>${esc(t('lm.plusAll'))}</button>` : `<button type="button" class="btn-o btn-sm" data-allhere>${esc(t('lm.allHere'))}</button>`}</div>
        <div class="pn-list">${S.students.map(s => {
          const m = S.journal.get(s.id);
          return `<div class="st${m.present ? '' : ' away'}">
            <button type="button" class="att${m.present ? ' on' : ''}" data-att="${s.id}" aria-label="${esc(m.present ? t('lm.here') : t('lm.absent'))}">${icon(m.present ? 'check' : 'close', 13).__raw}</button>
            <span class="nm">${esc(s.name)}</span>
            ${S.tab === 'journal' ? `<button type="button" class="pm" data-pt="${s.id}|-1" aria-label="${esc(t('lm.minus'))}">−</button><span class="sc">${m.points || 0}</span><button type="button" class="pm plus" data-pt="${s.id}|1" aria-label="${esc(t('lm.plus'))}">+</button>`
              : `<span class="small">${esc(m.present ? t('lm.here') : t('lm.absent'))}</span>`}
          </div>`;
        }).join('')}</div>`;
    }
  } else if (S.panel === 'noise') body = head(t('lm.noise'), t('lm.noiseSub')) + noiseBody();
  else if (S.panel === 'timer') body = head(t('lm.timer'), t('lm.timerSub')) + timerBody();
  else if (S.panel === 'ai') body = head(t('lm.ai'), t('lm.aiSub')) + aiBody();
  el.innerHTML = body;
  el.className = 'lm-panel pn-' + S.panel;
  bindPanel(el);
  if (S.panel === 'noise') {
    const c = el.querySelector('[data-ballscanvas]');
    if (S.noise.balls) S.noise.balls.stop();
    S.noise.balls = new Balls(c); S.noise.balls.level = S.noise.level;
  }
  if (S.panel === 'ai') { const log = el.querySelector('.ag-log'); if (log) log.scrollTop = log.scrollHeight; }
}

const present = () => S.students.filter(s => S.journal.get(s.id).present);

function groupsBody() {
  const count = S.groups ? S.groups.length : 4;
  return `<div class="pn-row"><span class="lbl">${esc(t('lm.howMany'))}</span><span class="nums">${[2, 3, 4, 5].map(n => `<button type="button" class="${n === count ? 'on' : ''}" data-gcount="${n}">${n}</button>`).join('')}</span></div>
    <div class="pn-row"><span class="lbl">${esc(t('lm.howSplit'))}</span><select class="pill-sel" data-gmethod><option value="points">${esc(t('lm.byPoints'))}</option><option value="random" ${S.gmethod === 'random' ? 'selected' : ''}>${esc(t('lm.random'))}</option></select></div>
    ${S.groups ? `<div class="pn-groups">${S.groups.map((g, i) => `<div class="grp">
      <span class="mk" style="color:${TINTS[i]}">${MARKS[i]}</span>
      <span class="grow"><b>${esc(t('lm.group', { n: i + 1 }))}</b><span class="small">${esc(g.map(id => (S.students.find(s => s.id === id) || { name: '' }).name.split(' ')[0]).join(', '))}</span></span>
      <button type="button" class="pm" data-gpt="${i}|-1" aria-label="${esc(t('lm.minus'))}">−</button><span class="sc">${S.groupScores[i] || 0}</span><button type="button" class="pm plus" data-gpt="${i}|1" aria-label="${esc(t('lm.plus'))}">+</button>
    </div>`).join('')}</div>` : ''}
    <div class="grow"></div>
    <div class="pn-row gap">${S.groups ? `<button type="button" class="btn-o grow" data-gmake>${esc(t('lm.shuffle'))}</button><button type="button" class="btn-k grow" data-gwheel>${esc(t('lm.groupWheel'))}</button>` : `<button type="button" class="btn-k grow" data-gmake>${esc(t('lm.makeGroups'))}</button>`}</div>`;
}

function noiseBody() {
  const n = S.noise, mood = moodOf(n.level, n.threshold);
  return `<div class="nz-card"><div class="pn-row"><b>${esc(t('lm.balls'))}</b><span class="small">${esc(t('lm.ballsSub'))}</span></div><canvas class="nz-balls" data-ballscanvas></canvas></div>
    <div class="nz-card row">${monsterSvg(mood, 110)}<div><b>${esc(t('lm.monster'))}</b><span class="small" data-mood>${esc(t('lm.mood.' + mood))}</span></div></div>
    <div class="nz-card row"><div class="grow"><b>${esc(t('lm.silence'))}</b><div class="nz-time" data-silence>${fmt(n.silenceLeft)}</div><span class="small">${esc(t('lm.silenceSub'))}</span></div>
      <div class="nz-ctrl"><div class="nums">${[3, 5, 10].map(m => `<button type="button" class="${n.silence === m * 60 ? 'on' : ''}" data-sil="${m}">${esc(t('lm.min', { n: m }))}</button>`).join('')}</div>
      <div class="nums"><button type="button" data-silplay aria-label="${esc(n.silenceRunning ? t('lm.pause') : t('lm.play'))}">${n.silenceRunning ? '❚❚' : '▶'}</button><button type="button" data-silreset aria-label="${esc(t('lm.reset'))}">↺</button></div></div></div>
    <div class="nz-test"><button type="button" class="btn-${n.mic ? 'o' : 'k'} btn-sm" data-mic>${esc(n.mic ? t('lm.micOff') : t('lm.mic'))}</button>
      <label class="pn-row"><span>${esc(t('lm.testLevel'))}</span><b data-lvl>${n.level}%</b></label>
      <input type="range" min="0" max="100" value="${n.level}" data-level aria-label="${esc(t('lm.testLevel'))}" ${n.mic ? 'disabled' : ''}>
      <div class="pn-row small"><span>${esc(t('lm.quiet'))}</span><span>${esc(t('lm.threshold', { n: n.threshold }))}</span><span>${esc(t('lm.loud'))}</span></div></div>
    <div class="seg pn-tabs">${['balls', 'monster', 'scale'].map(x => `<button type="button" data-disp="${x}" aria-selected="${n.display === x}">${esc(t('lm.' + x))}</button>`).join('')}</div>`;
}

function timerBody() {
  const tm = S.timer;
  return `<div class="tm-big" data-tmbig>${fmt(tm.mode === 'down' ? tm.left : elapsedTimer())}</div>
    <div class="nums wide">${[1, 3, 5, 10, 15].map(m => `<button type="button" class="${tm.mode === 'down' && tm.total === m * 60 ? 'on' : ''}" data-tmset="${m}">${esc(t('lm.min', { n: m }))}</button>`).join('')}</div>
    <div class="pn-row gap"><button type="button" class="btn-o grow" data-tmminus>−1</button><button type="button" class="btn-o grow" data-tmplus>+1</button><button type="button" class="btn-o grow${tm.mode === 'up' ? ' on' : ''}" data-tmup>${esc(t('lm.stopwatch'))}</button></div>
    <div class="pn-row gap"><button type="button" class="btn-k grow btn-md" data-tmplay>${esc(tm.running ? t('lm.pause') : t('lm.play'))}</button><button type="button" class="btn-o grow btn-md" data-tmreset>${esc(t('lm.reset'))}</button></div>`;
}

function aiBody() {
  return `<div class="ag-log">${S.chat.length ? '' : `<div class="ag-msg bot"><span>${esc(t('lm.aiHello'))}</span></div>`}
    ${S.chat.map(c => `<div class="ag-msg ${c.role}">${esc(c.text)}</div>`).join('')}${S.aiBusy ? `<div class="ag-msg bot typing">${esc(t('ag.thinking'))}</div>` : ''}</div>
    <div class="ag-chips">${['simpler', 'example', 'question'].map(x => `<button type="button" class="chip" data-aiq="${x}">${esc(t('lm.ai.' + x))}</button>`).join('')}</div>
    <form class="ag-input" data-aiform><input name="q" placeholder="${esc(t('lm.aiPh'))}" aria-label="${esc(t('lm.aiPh'))}" autocomplete="off"><button type="submit" aria-label="${esc(t('ag.send'))}">${icon('M12 19V5M5 12l7-7 7 7').__raw}</button></form>`;
}

/* ---------- events ---------- */

function setPanel(id) {
  if (id === 'groups') { S.panel = S.panel === 'journal' && S.tab === 'groups' ? null : 'journal'; S.tab = 'groups'; }
  else if (id === 'journal') { S.panel = S.panel === 'journal' && S.tab !== 'groups' ? null : 'journal'; if (S.tab === 'groups') S.tab = 'journal'; }
  else S.panel = S.panel === id ? null : id;
  if (S.panel !== 'noise' && S.noise.balls) { S.noise.balls.stop(); S.noise.balls = null; }
  draw();
}

function go(dir) {
  if (S.material === 'slides' && S.deck) S.page = Math.max(0, Math.min(S.deck.slides.length - 1, S.page + dir));
  else if (S.material === 'file' && S.file) S.filePage = Math.max(0, Math.min(S.file.pages.length - 1, S.filePage + dir));
  else if (S.material === 'game' && S.games.length) S.gameIdx = (S.gameIdx + dir + S.games.length) % S.games.length;
  else return;
  drawContent();
  const pi = pager(); S.main.querySelector('.dk-page').textContent = pi ? `${pi.i} / ${pi.n}` : '—';
  if (S.material === 'file' && !S.panel) draw();
  save();
}

function bindDock() {
  const m = S.main;
  m.querySelectorAll('[data-mat]').forEach(b => b.onclick = () => { S.material = b.dataset.mat; draw(); save(); });
  const sel = m.querySelector('[data-matsel]'); if (sel) sel.onchange = () => { S.material = sel.value; draw(); save(); };
  m.querySelector('[data-prev]').onclick = () => go(-1);
  m.querySelector('[data-next]').onclick = () => go(1);
  m.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => tool(b.dataset.tool));
  m.querySelector('[data-finish]').onclick = finish;
  m.querySelector('[data-upload]').onclick = () => m.querySelector('[data-fileinput]').click();
  m.querySelector('[data-fileinput]').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { S.file = await openFile(f); S.filePage = 0; S.material = 'file'; draw(); }
    catch (err) { console.error(err); toast(t('lm.fileErr')); }
  };
  const pp = m.querySelector('[data-pluspicked]'); if (pp) pp.onclick = () => { addPoint([S.lastPicked], 1); pp.disabled = true; };
  // Swipe on the slide (interactive whiteboards and tablets)
  const stage = m.querySelector('[data-stage]');
  let x0 = null;
  stage.addEventListener('pointerdown', e => { if (!S.board) x0 = e.clientX; });
  stage.addEventListener('pointerup', e => { if (x0 != null && Math.abs(e.clientX - x0) > 80 && !e.target.closest('button, input, .lm-card')) go(e.clientX < x0 ? 1 : -1); x0 = null; });
}

function tool(id) {
  if (PANELS.includes(id)) return setPanel(id);
  if (id === 'picker') return picker();
  if (id === 'board') return board();
  if (id === 'dark') {
    const d = document.createElement('div');
    d.className = 'lm-dark';
    d.innerHTML = `<span>${esc(t('lm.darkHint'))}</span>`;
    d.onclick = () => d.remove();
    S.main.appendChild(d);
  }
}

function picker() {
  const host = S.main.querySelector('[data-stage]');
  if (!present().length) { setPanel('journal'); return; }
  openPicker(host, {
    students: present().map(s => ({ id: s.id, name: s.name })),
    groups: S.groups ? S.groups.map(g => g.filter(id => S.journal.get(id) && S.journal.get(id).present)) : null,
    answered: S.answered,
    addPoint: (ids, n) => { addPoint(ids, n); S.lastPicked = ids[0]; },
    addGroupPoint: (gi, n) => { S.groupScores[gi] = (S.groupScores[gi] || 0) + n; save(); if (S.panel) drawPanel(); }
  }, () => {
    const last = [...S.answered].pop(); if (last) S.lastPicked = last; // shown in the 4:3 side column
    save(); if (!S.panel && ratioOf() < 1.5) draw();
  });
}

function addPoint(ids, n) {
  ids.forEach(id => { const m = S.journal.get(id); if (m) { m.points = Math.max(0, (m.points || 0) + n); m.touched = true; } });
  save();
  if (S.panel === 'journal') drawPanel();
}

function bindPanel(el) {
  const q = s => el.querySelector(s);
  const on = (s, fn) => el.querySelectorAll(s).forEach(b => b.onclick = () => fn(b));
  on('[data-closepanel]', () => { S.panel = null; draw(); });
  on('[data-tab]', b => { S.tab = b.dataset.tab; drawPanel(); draw(); });
  on('[data-pickclass]', async b => { await loadClass(b.dataset.pickclass); drawPanel(); save(); });
  on('[data-att]', b => { const m = S.journal.get(b.dataset.att); m.present = !m.present; m.touched = true; save(); drawPanel(); });
  on('[data-pt]', b => { const [id, n] = b.dataset.pt.split('|'); addPoint([id], Number(n)); });
  on('[data-plusall]', () => addPoint(present().map(s => s.id), 1));
  on('[data-allhere]', () => { S.journal.forEach(m => { m.present = true; m.touched = true; }); save(); drawPanel(); });
  on('[data-gcount]', b => { makeGroups(Number(b.dataset.gcount)); });
  on('[data-gmake]', () => makeGroups(S.groups ? S.groups.length : 4));
  on('[data-gpt]', b => { const [i, n] = b.dataset.gpt.split('|').map(Number); S.groupScores[i] = Math.max(0, (S.groupScores[i] || 0) + n); save(); drawPanel(); });
  on('[data-gwheel]', () => picker());
  const gm = q('[data-gmethod]'); if (gm) gm.onchange = () => { S.gmethod = gm.value; makeGroups(S.groups ? S.groups.length : 4); };
  // noise
  on('[data-mic]', async () => {
    const n = S.noise;
    if (n.mic) { n.mic.stop(); n.mic = null; n.on = false; drawPanel(); drawWidget(); return; }
    try {
      n.mic = new Mic(level => { n.level = level; onLevel(); });
      await n.mic.start(); n.on = true;
    } catch (e) { n.mic = null; toast(t('lm.micErr')); }
    drawPanel(); drawWidget();
  });
  const lv = q('[data-level]'); if (lv) lv.oninput = () => { S.noise.level = Number(lv.value); S.noise.on = true; onLevel(); };
  on('[data-disp]', b => { S.noise.display = b.dataset.disp; S.noise.on = true; drawPanel(); drawWidget(); save(); });
  on('[data-sil]', b => { S.noise.silence = S.noise.silenceLeft = Number(b.dataset.sil) * 60; drawPanel(); drawWidget(); });
  on('[data-silplay]', () => { S.noise.silenceRunning = !S.noise.silenceRunning; drawPanel(); drawWidget(); });
  on('[data-silreset]', () => { S.noise.silenceLeft = S.noise.silence; drawPanel(); drawWidget(); });
  // timer
  const tm = S.timer;
  on('[data-tmset]', b => { tm.mode = 'down'; tm.total = tm.left = Number(b.dataset.tmset) * 60; tm.running = false; drawPanel(); tick(); });
  on('[data-tmminus]', () => { tm.mode = 'down'; tm.total = tm.left = Math.max(60, tm.left - 60); drawPanel(); tick(); });
  on('[data-tmplus]', () => { tm.mode = 'down'; tm.left += 60; tm.total = Math.max(tm.total, tm.left); drawPanel(); tick(); });
  on('[data-tmup]', () => { tm.mode = 'up'; tm.running = false; tm.acc = 0; drawPanel(); tick(); });
  on('[data-tmplay]', () => { tm.running = !tm.running; tm.start = Date.now(); if (!tm.running && tm.mode === 'up') tm.acc = elapsedTimer(); drawPanel(); tick(); });
  on('[data-tmreset]', () => { tm.running = false; tm.left = tm.total; tm.acc = 0; drawPanel(); tick(); });
  // AI
  on('[data-aiq]', b => ask(t('lm.ai.' + b.dataset.aiq)));
  const f = q('[data-aiform]'); if (f) f.onsubmit = e => { e.preventDefault(); const v = f.q.value.trim(); if (v) ask(v); };
}

function onLevel() {
  const n = S.noise; if (!S) return;
  if (n.balls) n.balls.level = n.level;
  if (n.wballs) n.wballs.level = n.level;
  const mood = moodOf(n.level, n.threshold);
  if (mood !== n.lastMood) { n.lastMood = mood; drawWidget(); if (S.panel === 'noise') { const m = S.main.querySelector('[data-mood]'); if (m) { drawPanel(); } } }
  else if (n.display === 'scale') { const i = S.main.querySelector('.lm-widget .scale i'); if (i) i.style.width = n.level + '%'; }
  const l = S.main.querySelector('[data-lvl]'); if (l) l.textContent = n.level + '%';
}

function makeGroups(count) {
  const here = present();
  let order;
  if (S.gmethod === 'random') order = [...here].sort(() => Math.random() - 0.5);
  else {
    // Snake draft by points so every group is about equally strong.
    order = [...here].sort((a, b) => (S.journal.get(b.id).points || 0) - (S.journal.get(a.id).points || 0) || Math.random() - 0.5);
  }
  const groups = Array.from({ length: count }, () => []);
  order.forEach((s, i) => { const r = Math.floor(i / count), k = i % count; groups[r % 2 ? count - 1 - k : k].push(s.id); });
  S.groups = groups; S.groupScores = groups.map(() => 0);
  save(); drawPanel();
}

async function ask(text) {
  S.chat.push({ role: 'user', text });
  S.aiBusy = true; drawPanel();
  const slide = S.deck && S.material === 'slides' ? S.deck.slides[S.page] : null;
  try {
    const res = await generateJSON(`[part:lessonchat]\nТы — помощник учителя прямо на уроке. Тема урока: "${(S.lesson && S.lesson.topic) || (S.deck && S.deck.title) || ''}". ${slide ? 'Сейчас на экране слайд: ' + JSON.stringify({ title: plain(slide.title), bullets: (slide.bullets || []).map(plain), question: slide.question }) : ''}
Ответь коротко (2–5 предложений), чтобы учитель мог сразу сказать это классу. Язык ответа — язык вопроса учителя (${lang() === 'kk' ? 'казахский' : lang() === 'en' ? 'английский' : 'русский'} по умолчанию).
Вопрос учителя: "${text}"\nВерни ТОЛЬКО JSON: { "reply": "…" }`, { temperature: 0.6 });
    S.chat.push({ role: 'bot', text: String(res.reply || '') });
  } catch (e) { S.chat.push({ role: 'bot', text: e.message }); }
  S.aiBusy = false;
  if (S && S.panel === 'ai') drawPanel();
}

/* ---------- board over the slide ---------- */

function board() {
  const c = S.main.querySelector('[data-board]');
  if (S.board) { S.board.bar.remove(); c.hidden = true; S.board = null; return; }
  c.hidden = false;
  const fit = S.main.querySelector('.lm-fit');
  c.width = fit.clientWidth * 2; c.height = fit.clientHeight * 2;
  const ctx = c.getContext('2d'); ctx.scale(2, 2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let color = '#FF5A5F', erase = false, drawing = false;
  const bar = document.createElement('div');
  bar.className = 'lm-boardbar';
  bar.innerHTML = `${['#16170F', '#FF5A5F', '#3A86FF', '#06D6A0', '#FFB400'].map(col => `<button type="button" class="sw${col === color ? ' on' : ''}" data-col="${col}" style="background:${col}" aria-label="${col}"></button>`).join('')}
    <button type="button" data-erase>${esc(t('lm.eraser'))}</button><button type="button" data-clearb>${esc(t('lm.clear'))}</button><button type="button" data-closeb aria-label="${esc(t('ui.close'))}">${icon('close', 14).__raw}</button>`;
  fit.appendChild(bar);
  S.board = { bar };
  bar.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { color = b.dataset.col; erase = false; bar.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x === b)); });
  bar.querySelector('[data-erase]').onclick = () => { erase = !erase; };
  bar.querySelector('[data-clearb]').onclick = () => ctx.clearRect(0, 0, c.width, c.height);
  bar.querySelector('[data-closeb]').onclick = () => board();
  const pos = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  c.onpointerdown = e => { drawing = true; c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); };
  c.onpointermove = e => {
    if (!drawing) return;
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color; ctx.lineWidth = erase ? 28 : 4;
    ctx.lineTo(...pos(e)); ctx.stroke();
  };
  c.onpointerup = () => { drawing = false; };
}

/* ---------- clock, timers ---------- */

const fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const elapsedTimer = () => (S.timer.acc || 0) + (S.timer.running && S.timer.mode === 'up' ? (Date.now() - S.timer.start) / 1000 : 0);
function clockText() {
  const tm = S.timer;
  if (tm.running || tm.left !== tm.total || tm.mode === 'up') return fmt(tm.mode === 'down' ? tm.left : elapsedTimer());
  return fmt((Date.now() - S.started) / 1000);
}

function tick() {
  if (!S) return;
  const tm = S.timer;
  if (tm.running && tm.mode === 'down') {
    tm.left = Math.max(0, tm.left - 1);
    if (tm.left === 0) { tm.running = false; toast(t('lm.timeUp')); beep(); }
  }
  const n = S.noise;
  if (n.silenceRunning && moodOf(n.level, n.threshold) !== 'loud') {
    n.silenceLeft = Math.max(0, n.silenceLeft - 1);
    if (!n.silenceLeft) n.silenceRunning = false;
  }
  const m = S.main;
  const set = (s, v) => { const e = m.querySelector(s); if (e) e.textContent = v; };
  set('[data-clock]', clockText());
  set('[data-tmbig]', fmt(tm.mode === 'down' ? tm.left : elapsedTimer()));
  set('[data-wingtimer]', fmt(tm.left));
  set('.lm-widget .silence', fmt(n.silenceLeft));
  set('[data-silence]', fmt(n.silenceLeft));
}

function beep() {
  try { const a = new AudioContext(); const o = a.createOscillator(); o.frequency.value = 880; o.connect(a.destination); o.start(); setTimeout(() => { o.stop(); a.close(); }, 500); } catch (e) { /* no sound */ }
}

/* ---------- keys, finishing ---------- */

function onKey(e) {
  if (!S || e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  else if (e.key === 'Escape') { const d = S.main.querySelector('.lm-dark'); if (d) d.remove(); else if (S.panel) { S.panel = null; draw(); } }
  else if (e.key.toLowerCase() === 'f') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }
  else if (e.key.toLowerCase() === 'b') tool('dark');
}
function bindKeys() { document.addEventListener('keydown', onKey); }

async function finish() {
  S.journal.forEach(m => { m.touched = true; });
  await saveNow();
  if (S.lesson) await db.lessons.update(S.lesson.id, { status: 'done', date: S.lesson.date || today(), finishedAt: new Date().toISOString() });
  toast(t('lm.finished'));
  const id = S.lesson ? S.lesson.id : null;
  location.hash = id ? '#/results/' + id : '#/lessons';
}
