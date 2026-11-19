/* Prompts for alaqai v2: the presentation (50-template engine), the level tasks
 * for the live lesson and a KSP that covers the whole lesson. Pure module. */
import { TEMPLATES } from '../deck/schema.js';

const LANG = {
  kk: 'на казахском языке (кириллица)',
  ru: 'на русском языке',
  en: 'на английском языке',
  'en+ru': 'на английском языке, с короткими пояснениями на русском',
  'en+kk': 'на английском языке, с короткими пояснениями на казахском',
  uz: 'на узбекском языке, латиницей',
  'uz-latn': 'на узбекском языке, латиницей',
  'uz-cyrl': 'на узбекском языке, кириллицей'
};

export function gradeOf(className) {
  const m = String(className || '').match(/\d{1,2}/);
  return m ? Number(m[0]) : null;
}

/** Continuous computer minutes per lesson (sanitary rules of Kazakhstan). */
export function screenLimit(className) {
  const g = gradeOf(className);
  if (g == null) return 25;
  if (g <= 1) return 15;
  if (g <= 3) return 20;
  if (g <= 8) return 25;
  return 30;
}

const isInformatics = s => /информ|ақпарат|informat|computer/i.test(String(s || ''));

function context(o) {
  const g = gradeOf(o.className);
  return `Учитель из Казахстана готовит урок (40 минут, обновлённое содержание образования, критериальное оценивание).
Предмет: ${o.subject || 'не указан'}.${g ? ` Класс: ${g}.` : ''}
Тема урока: "${o.topic}".
Все тексты пиши ${LANG[o.lang] || LANG.ru}.
${o.hasFiles ? 'К запросу приложены страницы учебника или материалы учителя — бери факты, примеры и задания оттуда.\n' : ''}Пиши коротко и по существу, языком, понятным ученикам этого возраста.
Разметка в текстах: ==маркер== для ключевых слов, **жирный**, формулы LaTeX внутри $...$. Код — Python, если не сказано иначе.
Верни ТОЛЬКО валидный JSON без markdown и пояснений.`;
}

const shapes = types => types.filter(t => TEMPLATES[t]).map(t => '- ' + TEMPLATES[t].prompt).join('\n');

export function deckPrompt(o) {
  const n = o.count || 15;
  const types = (o.types && o.types.length ? o.types : ['title', 'notes', 'summary']).filter(t => TEMPLATES[t]);
  // A whole lesson always has a warm-up question, a summary, reflection and homework.
  for (const t of ['title', 'quiz', 'summary', 'reflection', 'homework']) if (!types.includes(t)) types.push(t);
  const imgs = o.images === 'none' ? 'Не добавляй "image_query".' : 'В 2–3 слайдах, где картинка поможет понять тему, добавь поле "image_query" — короткий запрос на английском.';
  return `[part:deck]
${context(o)}
Составь презентацию из ${n} слайдов на ВЕСЬ урок (40 минут) — учитель проводит по ней урок от начала до конца, даже если у учеников нет компьютеров.
Используй ТОЛЬКО эти типы слайдов (формат каждого):
${shapes(types)}
Порядок урока:
1) "title" — тема и цель урока;
2) актуализация знаний — 1–2 слайда-вопроса ("quiz" или другое задание) по тому, что ученики уже знают;
3) объяснение нового материала — слайды для тетради (примерно треть презентации);
4) общие вопросы для всего класса — 3–4 слайда-задания, класс решает вместе или каждый в тетради;
5) индивидуальная работа — один слайд "notes" с заголовком вроде «Жеке жұмыс / Индивидуальная работа»: ученики выполняют задания на alaqai по коду урока или в тетради;
6) "summary" — главное за урок; 7) "reflection" — рефлексия; 8) "homework" — домашнее задание.
Один тип не больше 2 раз подряд. Ответы в заданиях — однозначные и проверяемые. Слайды показывают всему классу: не пиши на них уровни учеников и слова «уровень», «деңгей», «для слабых/сильных». ${imgs}
Формат ответа: {"title":"название презентации","slides":[ ... ]}`;
}

export function tasksPrompt(o) {
  return `[part:tasks]
${context(o)}
Составь задания для индивидуальной работы на уроке (7 минут). Каждый ученик получает задание своего уровня и сам выбирает методику.
Уровни: "A" — базовый (с подсказкой, проще), "B" — средний, "C" — высокий (сложнее, нужно объяснить).
Методики: "steps" — пошагово (один слайд steps), "example" — разбор примера (слайд example с решённым примером + слайд input с похожими задачами), "error" — найди ошибку (слайд error).
Плюс "common" — общие вопросы для всего класса (2–3 слайда-задания любого типа ниже).
Ученик НЕ должен знать свой уровень: нигде в тексте слайдов не пиши букву уровня и слова «уровень», «деңгей», «лёгкий», «сложный», «для слабых/сильных».
Форматы слайдов:
${shapes(['steps', 'example', 'input', 'error', 'predict', 'codefill', 'parsons', 'quiz', 'order', 'match', 'fill'])}
Формат ответа:
{"common":[слайд, слайд],"levels":{"A":{"steps":[слайд],"example":[слайд example, слайд input],"error":[слайд]},"B":{…},"C":{…}}}
Все три уровня — по одной и той же теме урока, разной сложности. Ответы — короткие и однозначные.`;
}

export function kspPrompt2(o, summary) {
  const limit = screenLimit(o.className);
  const inf = isInformatics(o.subject);
  return `[part:ksp]
${context(o)}
Составь краткосрочный план урока (КСП / ҚМЖ) по форме школ Казахстана. КСП описывает ВЕСЬ урок на 40 минут:
начало, актуализация знаний, объяснение нового материала, работа в парах или группах, индивидуальная работа, практика, рефлексия, домашнее задание.
Задания на платформе alaqai — только ОДИН этап урока (индивидуальная работа по уровням A, B, C, около 7 минут), не весь урок.
Здоровье: за компьютером не больше ${limit} минут за урок. Между этапами с компьютером обязательно перерыв от экрана 5 минут
(задание в тетради или в паре + гимнастика для глаз). У каждого этапа укажи "screen": true, если ученики работают за компьютером.
${inf ? `Для информатики используй порядок: 0–3 начало (без ПК) · 3–10 объяснение по презентации (без ПК) · 10–17 задания по уровням на alaqai (ПК) · 17–22 перерыв от экрана: задание в тетради или в паре (без ПК) · 22–37 практика на компьютере (ПК) · 37–40 рейтинг, рефлексия, домашнее задание (без ПК).\n` : ''}Готовые материалы урока (ссылайся на них в «Ресурсах»):
${summary || '—'}
Формат ответа:
{
  "section": "раздел учебной программы",
  "learningObjectives": ["цели обучения по программе, с кодом если знаешь"],
  "lessonGoals": ["Все ученики: …", "Большинство: …", "Некоторые: …"],
  "successCriteria": ["критерии оценивания"],
  "languageGoals": "ключевые слова и фразы",
  "values": "привитие ценностей",
  "crossCurricular": "межпредметные связи",
  "priorKnowledge": "предварительные знания",
  "methods": "методы и приёмы урока через запятую (миға шабуыл, ойлан—жұптас—бөліс, деңгейлік саралау, оқушының әдіс таңдауы…)",
  "stages": [{"stage": "название этапа", "minutes": 5, "screen": false, "rest": false, "teacher": "действия педагога", "students": "действия учеников", "assessment": "оценивание", "resources": "ресурсы"}],
  "differentiation": "уровни A (с подсказкой), B (самостоятельно), C (сложнее + объяснить); ученик сам выбирает удобную методику; ИИ по результатам предлагает, решение принимает учитель",
  "assessmentNote": "формативное оценивание: как проверить, чему научились",
  "health": "правила работы за компьютером, перерыв от экрана, гимнастика для глаз",
  "reflection": "вопросы для рефлексии"
}
Названия этапов — на языке урока. Сумма минут — ровно 40.`;
}

/* ---------- KSP normalizer ---------- */

const REST = {
  kk: { stage: 'Экраннан демалыс', teacher: 'Компьютерлерді өшіртеді, дәптерде немесе жұппен тапсырма береді, көзге арналған жаттығу жасатады', students: 'Дәптерде тапсырма орындайды, көзге жаттығу жасайды' },
  ru: { stage: 'Перерыв от экрана', teacher: 'Просит выключить мониторы, даёт задание в тетради или в паре, проводит гимнастику для глаз', students: 'Выполняют задание в тетради, делают гимнастику для глаз' },
  en: { stage: 'Screen break', teacher: 'Asks to switch monitors off, gives a notebook or pair task, leads eye exercises', students: 'Do the notebook task and eye exercises' }
};
const TOTAL = 40;

/** Minutes add up to 40, computer time stays within the grade limit, a screen break exists. */
export function normalizeKsp(k, { className = '', lang = 'ru' } = {}) {
  const limit = screenLimit(className);
  let st = (Array.isArray(k && k.stages) ? k.stages : []).map(s => ({ ...s, minutes: Math.max(1, Math.round(Number(s.minutes) || 5)), screen: !!s.screen, rest: !!s.rest }));
  const screens = st.filter(s => s.screen);
  if (screens.length && !st.some(s => s.rest)) {
    const r = REST[String(lang).slice(0, 2)] || REST.ru;
    const at = st.indexOf(screens[0]) + 1;
    st.splice(at, 0, { stage: r.stage, minutes: 5, screen: false, rest: true, teacher: r.teacher, students: r.students, assessment: '', resources: '' });
  }
  // Cap computer time.
  let scr = st.reduce((a, s) => a + (s.screen ? s.minutes : 0), 0);
  if (scr > limit) {
    const f = limit / scr;
    st.forEach(s => { if (s.screen) s.minutes = Math.max(3, Math.floor(s.minutes * f)); });
  }
  // Total = 40: change the longest stage without a computer (never the break) first.
  const pick = (dir) => {
    const pool = st.filter(s => !s.rest && (dir > 0 ? !s.screen : s.minutes > 2));
    const cand = (dir > 0 ? pool : pool.filter(s => !s.screen).concat(pool.filter(s => s.screen)));
    return cand.sort((a, b) => b.minutes - a.minutes)[0] || st.filter(s => s.minutes > 1).sort((a, b) => b.minutes - a.minutes)[0];
  };
  let total = st.reduce((a, s) => a + s.minutes, 0), guard = 200;
  while (total !== TOTAL && st.length && guard--) {
    const dir = total < TOTAL ? 1 : -1, s = pick(dir);
    if (!s) break;
    s.minutes += dir; total += dir;
  }
  return { ...k, stages: st };
}
