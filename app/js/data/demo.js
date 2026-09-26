/* "Fill with an example": four classes, a month of lessons with a journal,
 * and today's lessons — so a teacher can see every screen working before
 * entering their own data. Everything created here is marked demo: true and
 * can be removed in one click (db.clearDemo). */
import { db } from './store.js';
import { today, weekStart, addDays } from '../school.js';

const NAMES = {
  '7А': ['Алия Нурова', 'Айбек Тоқтаров', 'Камила Юсупова', 'Ислам Ахмедов', 'Дана Серикова', 'Нурлан Беков', 'Жасмин Рахимова', 'Бекзат Муратов', 'Санжар Жумабаев', 'Мирас Оспанов', 'Лейла Каримова', 'Аружан Сейтова', 'Ерасыл Абенов', 'Томирис Қайратқызы'],
  '8А': ['Айгерим Бекова', 'Мадина Омарова', 'Арман Исаев', 'Диас Нурланов', 'Сабина Ахметова', 'Ернар Тулегенов', 'Асель Жакупова', 'Нурсултан Ермеков', 'Алихан Серикбаев', 'Жанель Муканова', 'Руслан Каримов', 'Айша Турсынова'],
  '8Б': ['Амина Садыкова', 'Тимур Бекмуханов', 'Айсулу Даулетова', 'Батыр Мухтаров', 'Малика Ибраимова', 'Даурен Оспанов', 'Еркежан Сапарова', 'Адиль Кенжебаев', 'Назерке Абдрахманова', 'Олжас Шарипов', 'Карина Жунусова'],
  '9А': ['Данияр Касымов', 'Аяжан Кусаинова', 'Ильяс Мамыров', 'Зарина Абилова', 'Бауыржан Ержанов', 'Индира Сулейменова', 'Максат Нургалиев', 'Сымбат Байжанова', 'Темирлан Искаков', 'Алуа Есимова', 'Ельдар Хасенов', 'Динара Смагулова', 'Нурдаулет Акимов']
};
const CLASSES = [
  { key: '7А', name: '7 «А»', subject: 'Ағылшын тілі' },
  { key: '8А', name: '8 «А»', subject: 'Физика' },
  { key: '8Б', name: '8 «Б»', subject: 'Физика' },
  { key: '9А', name: '9 «А»', subject: 'Физика' }
];
// Weekly timetable: [weekday 0=Mon…5=Sat, lesson number 1…6]
const TIMETABLE = {
  '7А': [[0, 2], [1, 3], [2, 2], [4, 5], [5, 2]],
  '8А': [[0, 4], [2, 4], [3, 4], [5, 4]],
  '8Б': [[0, 5], [3, 1], [5, 5]],
  '9А': [[1, 1], [2, 6], [4, 3]]
};
const TOPICS = {
  '7А': ['Present Simple', 'Vocabulary: Holidays', 'Present Continuous', 'Reading: My Weekend', 'Present Perfect', 'Vocabulary: Food', 'Listening: At the Market', 'Writing a Letter', 'Comparatives', 'Superlatives', 'Reading: Famous People', 'Speaking: Hobbies', 'Past Simple: regular verbs', 'Vocabulary: Travel', 'Irregular verbs', 'Revision', 'Reading: Kazakhstan', 'Writing a Story', 'Articles', 'Quiz Day'],
  '8А': ['Электрический заряд', 'Электрическое поле', 'Электрический ток', 'Сила тока', 'Напряжение', 'Сопротивление', 'Амперметр и вольтметр', 'Лабораторная работа', 'Удельное сопротивление', 'Реостаты', 'Последовательное соединение', 'Параллельное соединение', 'Решение задач', 'Контрольная работа', 'Работа тока', 'Мощность тока'],
  '9А': ['Механическая работа', 'Мощность', 'Работа и мощность', 'Энергия', 'КПД', 'Простые механизмы', 'Рычаг', 'Блоки', 'Решение задач', 'Закон сохранения энергии', 'Импульс', 'Контрольная работа']
};
TOPICS['8Б'] = TOPICS['8А'];
const TODAY_TOPIC = { '7А': 'Past Simple', '8А': 'Закон Ома', '8Б': 'Закон Ома', '9А': 'Колебания' };

function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export async function loadDemo() {
  const rand = rng(26);
  const day = today();
  const monday = weekStart(day);
  const todayIdx = Math.round((new Date(day) - new Date(monday)) / 86400000);

  for (const c of CLASSES) {
    const cls = await db.classes.create({ name: c.name, subject: c.subject, demo: true });
    const students = await db.students.createMany(NAMES[c.key].map(name => ({ classId: cls.id, name, demo: true })));
    // Each student gets an "ability" so their grades look consistent; a couple slip lately.
    const ability = new Map(students.map((s, i) => [s.id, 2.75 + rand() * 2.1]));
    const slipping = new Set([students[7]?.id, students[8]?.id]);

    const lessons = [], marks = [];
    let topicIdx = 0;
    for (let w = -8; w <= 0; w++) {
      for (const [wd, slot] of TIMETABLE[c.key]) {
        if (wd === 6) continue;
        const date = addDays(monday, w * 7 + wd);
        const isPast = date < day;
        const isToday = date === day;
        if (w === 0 && wd > todayIdx) {
          lessons.push({ classId: cls.id, topic: '', subject: c.subject, date, slot, status: 'planned', demo: true });
          continue;
        }
        const topic = isToday ? TODAY_TOPIC[c.key] : TOPICS[c.key][topicIdx++ % TOPICS[c.key].length];
        const status = isPast ? 'done' : (c.key === '8Б' ? 'planned' : 'ready');
        lessons.push({ classId: cls.id, topic: status === 'planned' ? '' : topic, subject: c.subject, date, slot, status, demo: true });
      }
    }
    const created = await db.lessons.createMany(lessons);
    created.filter(l => l.status === 'done').forEach(l => {
      const weeksAgo = Math.floor((new Date(monday) - new Date(l.date)) / 604800000);
      students.forEach(s => {
        const present = rand() > (slipping.has(s.id) && weeksAgo < 1 ? 0.35 : 0.06);
        let grade = null;
        if (present && rand() < 0.45) {
          let a = ability.get(s.id);
          if (slipping.has(s.id)) a -= weeksAgo < 2 ? 0.9 : -0.2;
          else a += (4 - weeksAgo) * 0.05; // the class slowly improves
          grade = Math.max(2, Math.min(5, Math.round(a + (rand() - 0.5) * 1.1)));
        }
        marks.push({ lessonId: l.id, classId: cls.id, studentId: s.id, date: l.date, present, points: present ? Math.round(rand() * 3) : 0, grade, demo: true });
      });
    });
    await db.marks.createMany(marks);
    await demoHomework(c.key, cls, students, created, rand);
  }
  await db.settings.set({ demoLoaded: true });
}

/* ---------- homework and lesson results for the example ---------- */

const OHM_TEST = [
  { q: 'Как связаны сила тока и напряжение на участке цепи?', options: ['Прямо пропорционально', 'Обратно пропорционально', 'Не связаны', 'Квадратично'], answer: 0 },
  { q: 'Как изменится ток, если напряжение увеличить в 2 раза?', options: ['Уменьшится в 2 раза', 'Увеличится в 2 раза', 'Не изменится', 'Увеличится в 4 раза'], answer: 1 },
  { q: 'Какая формула выражает закон Ома?', options: ['I = U · R', 'I = R / U', 'I = U / R', 'U = I / R'], answer: 2 },
  { q: 'В каких единицах измеряют сопротивление?', options: ['Вольт', 'Ампер', 'Ватт', 'Ом'], answer: 3 },
  { q: 'Напряжение 12 В, сопротивление 4 Ом. Чему равен ток?', options: ['48 А', '3 А', '0,33 А', '16 А'], answer: 1 }
];
const QUIZ_SHARE = [0.95, 0.9, 0.86, 0.43, 0.76];

// A small drawn "notebook page" so the photo review has something to show.
function notebookPhoto(n, seed) {
  const lines = ['№1  I = U / R = 6 / 3 = 2 А', '№2  R = U / I = 12 / 0,5 = 24 Ом', seed % 2 ? '№3  I = 4,5 / 250 = 0,018 А' : '№3  I = 4,5 / 0,25 = 18 А', '№4  U = I · R = 0,2 · 40 = 8 В'];
  const rows = Array.from({ length: 22 }, (_, i) => `<line x1='0' y1='${60 + i * 34}' x2='600' y2='${60 + i * 34}' stroke='%23C9DDF0' stroke-width='1'/>`).join('');
  const text = lines.map((l, i) => `<text x='50' y='${118 + i * 102 + n * 12}' font-family='Comic Sans MS, cursive' font-size='26' fill='%23243B7A'>${l}</text>`).join('');
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'><rect width='600' height='800' fill='%23FDFDF8'/>${rows}<line x1='36' y1='0' x2='36' y2='800' stroke='%23F2A5A5' stroke-width='2'/>${text}</svg>`;
}

async function demoHomework(key, cls, students, lessons, rand) {
  const day = today();
  const done = lessons.filter(l => l.status === 'done').sort((a, b) => b.date.localeCompare(a.date));
  const iso = () => new Date(Date.now() - Math.round(rand() * 36) * 3600000).toISOString();
  if (key === '8А') {
    // Last taught lesson: a quiz run in class, "I understand" count, 45 minutes.
    const last = done[0];
    const quiz = await db.tests.create({ lessonId: last.id, kind: 'quiz', title: 'Закон Ома', questions: OHM_TEST, demo: true });
    const finished = new Date(`${last.date}T10:05:00`);
    await db.lessons.update(last.id, { topic: 'Закон Ома', parts: { quizId: quiz.id }, understood: 9,
      live: { quizLog: QUIZ_SHARE.map(p => ({ ok: Math.round(p * 21), all: 21 })), startedAt: new Date(finished - 45 * 60000).toISOString() }, finishedAt: finished.toISOString() });
    // An online test sent as homework, checked automatically.
    const hw = await db.homework.create({ lessonId: last.id, classId: cls.id, kind: 'online', title: 'Тест: Сила тока и напряжение', instructions: 'Решите 5 вопросов, у вас одна попытка.', questions: OHM_TEST,
      dueDate: addDays(day, 2), dueTime: '23:59', studentIds: null, checker: 'auto', showAnswers: true, shuffle: false, status: 'sent', sentAt: iso(), demo: true });
    const subs = students.slice(0, students.length - 3).map((s, k) => {
      const answers = OHM_TEST.map((q, i) => { const ok = rand() < QUIZ_SHARE[i]; return { given: ok ? q.answer : (q.answer + 1) % 4, points: ok ? 1 : 0 }; });
      const points = answers.reduce((a, x) => a + x.points, 0);
      const grade = points / 5 >= 0.85 ? 5 : points / 5 >= 0.65 ? 4 : points / 5 >= 0.4 ? 3 : 2;
      return { homeworkId: hw.id, studentId: s.id, answers, points, total: 5, autoGrade: grade, grade, status: 'checked', submittedAt: iso(), checkedAt: iso(), demo: true };
    });
    await db.submissions.createMany(subs);
  }
  if (key === '8Б') {
    const hw = await db.homework.create({ lessonId: done[0] && done[0].id, classId: cls.id, kind: 'notebook', title: 'Задачи §12, № 1–4', instructions: 'Решите задачи 1–4 из §12 в тетради и пришлите фото решения.', questions: [],
      dueDate: addDays(day, 3), dueTime: '23:59', studentIds: null, checker: 'ai', showAnswers: true, shuffle: false, status: 'sent', sentAt: iso(), demo: true });
    const subs = students.slice(0, 8).map((s, k) => {
      const checked = k >= 4;
      const grade = checked ? [5, 4, 4, 3][k - 4] : null;
      return { homeworkId: hw.id, studentId: s.id, photos: [notebookPhoto(0, k), notebookPhoto(1, k + 1)], text: '', status: checked ? 'checked' : 'submitted', grade, submittedAt: iso(), checkedAt: checked ? iso() : null,
        ai: k === 0 || checked ? { text: '№1, №2, №4 — верно.\n№3 — ошибка: 250 мА не переведены в 0,25 А.', grade: 4, comment: 'Хорошо! В №3 не забудь перевести мА в А.', hardest: '№3' } : null, demo: true };
    });
    await db.submissions.createMany(subs);
  }
  if (key === '7А') {
    const hw = await db.homework.create({ lessonId: done[3] && done[3].id, classId: cls.id, kind: 'online', title: 'Irregular verbs', instructions: '', questions: [
      { q: 'go → ?', options: ['goed', 'went', 'gone', 'going'], answer: 1 }, { q: 'see → ?', options: ['saw', 'seed', 'seen', 'sees'], answer: 0 }, { q: 'buy → ?', options: ['buyed', 'bought', 'brought', 'buys'], answer: 1 }],
      dueDate: addDays(day, -4), dueTime: '23:59', studentIds: null, checker: 'auto', showAnswers: true, shuffle: true, status: 'sent', sentAt: iso(), demo: true });
    await db.submissions.createMany(students.map(s => {
      const answers = [1, 0, 1].map(a => { const ok = rand() < 0.82; return { given: ok ? a : (a + 2) % 4, points: ok ? 1 : 0 }; });
      const points = answers.reduce((a, x) => a + x.points, 0);
      const grade = [2, 3, 4, 5][points];
      return { homeworkId: hw.id, studentId: s.id, answers, points, total: 3, autoGrade: grade, grade, status: 'checked', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(), checkedAt: new Date(Date.now() - 5 * 86400000).toISOString(), demo: true };
    }));
  }
}
