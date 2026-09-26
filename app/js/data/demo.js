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
  }
  await db.settings.set({ demoLoaded: true });
}
