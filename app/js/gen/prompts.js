/* Prompts for the lesson parts. Each starts with a [part:…] marker (used in tests
 * and logs) and asks Gemini for strict JSON in the shapes stored by the data layer. */
import { langPrompt } from './materials.js';

export function gradeOf(className) {
  const m = String(className || '').match(/\d{1,2}/);
  return m ? Number(m[0]) : null;
}

function context(o) {
  const grade = gradeOf(o.className);
  return `Учитель из Казахстана готовит урок (40–45 минут, обновлённое содержание образования, критериальное оценивание).
Предмет: ${o.subject || 'не указан'}.${grade ? ` Класс: ${grade}.` : ''}
Тема урока: "${o.topic}".
Все тексты для учеников и учителя пиши ${o.langText ? 'на языке: ' + o.langText : langPrompt(o.lang)}.
${o.hasFiles ? 'К запросу приложены страницы учебника или материалы учителя — опирайся на них как на главный источник фактов, примеров и заданий.' : ''}
Пиши по существу, без воды, языком, понятным ученикам этого возраста. Формулы — в LaTeX внутри $...$.
${o.materialText ? 'Текст материалов учителя:\n"""\n' + o.materialText + '\n"""' : ''}
Верни ТОЛЬКО валидный JSON без markdown и пояснений.`;
}

// Slide layouts the presentation editor can show (see app/js/slides.js).
const SLIDE_SCHEMA = `{
  "title": "название презентации",
  "slides": [{
    "layout": "title | content | full-image | stat | bigidea | compare | process | quiz | truefalse | fillblank | match | problem",
    "title": "короткий заголовок (до 8 слов)",
    "subtitle": "только для title",
    "bullets": ["3-4 коротких пункта — для content / full-image / stat / bigidea"],
    "stat_number": "число или % — только для stat", "stat_label": "подпись — только для stat",
    "left_title": "", "left_bullets": [], "right_title": "", "right_bullets": [],
    "steps": ["3-5 шагов — только для process"],
    "question": "только для quiz", "options": ["4 варианта — только для quiz"], "correct_index": 0,
    "statement": "только для truefalse", "is_true": true,
    "sentence_before": "", "sentence_after": "", "correct_word": "", "word_options": ["4 слова, только для fillblank"],
    "pairs": [{"left": "термин", "right": "пара"}],
    "problem_text": "только для problem", "solution_steps": ["шаги решения"],
    "notes": "1-2 предложения — что сказать классу на этом слайде",
    "image_query": "короткий запрос на английском для поиска фото",
    "icon": "название иконки Lucide в kebab-case (book-open, atom, leaf, users…)"
  }]
}`;

export function slidesPrompt(o) {
  const n = o.count || 10;
  return `[part:slides]
${context(o)}
Составь презентацию из ${n} слайдов для урока (формат ${o.ratio || '16:9'}).
Формат ответа:
${SLIDE_SCHEMA}
Правила: слайд 1 — "title"; ${o.photos === false ? 'не используй "full-image"' : '1–2 слайда "full-image"'}; "stat" — только если есть уместное число;
"compare" — только если реально есть что сравнивать; "process" — для последовательности шагов;
${o.questions === false ? 'не используй интерактивные слайды (quiz / truefalse / fillblank / match / problem);' : 'ближе к середине и концу — 2–3 интерактивных слайда (quiz / truefalse / fillblank / match / problem) для закрепления;'}
не повторяй один layout больше 2 раз подряд; последний слайд — вывод ("bigidea" или "content").
Заполняй только поля, нужные выбранному layout.`;
}

export function gamesPrompt(o) {
  return `[part:games]
${context(o)}
Подготовь две игры и викторину для закрепления темы.
Формат ответа:
{
  "matching": { "title": "короткое название игры «Совпадения» (например: глагол → вторая форма)", "pairs": [{"a": "…", "b": "…"}] },
  "memory": { "title": "короткое название игры «Мемори»", "pairs": [{"a": "…", "b": "…"}] },
  "quiz": { "title": "название викторины", "questions": [{"q": "вопрос", "options": ["…","…","…","…"], "answer": 0}] }
}
В "matching" и "memory" — по 6 пар (коротко, до 4 слов в каждой части). В викторине — 5 вопросов для всего класса,
4 варианта, "answer" — индекс правильного (0–3), правильные ответы распредели по разным позициям.`;
}

export function testPrompt(o) {
  const hw = o.homework !== false, test = o.test !== false;
  return `[part:test]
${context(o)}
${test ? 'Составь тест из 8 вопросов по теме урока (проверка в конце урока).' : ''}
${hw ? 'Составь домашнее задание — онлайн-тест из 5 вопросов, которые ученик решит дома, и короткую инструкцию.' : ''}
Формат ответа:
{
  ${test ? '"test": { "title": "название теста", "questions": [{"q": "вопрос", "options": ["…","…","…","…"], "answer": 0, "explanation": "почему это правильный ответ"}] },' : ''}
  ${hw ? '"homework": { "title": "название ДЗ", "instructions": "1-2 предложения для ученика", "questions": [{"q": "…", "options": ["…","…","…","…"], "answer": 0, "explanation": "…"}] }' : ''}
}
"answer" — индекс правильного варианта (0–3); правильные ответы распредели по разным позициям; вопросы от простых к сложным.`;
}

export function kspPrompt(o, summary) {
  return `[part:ksp]
${context(o)}
Составь краткосрочный план урока (КСП / ҚМЖ) по новому формату для школ Казахстана.
Материалы урока уже готовы — ссылайся на них в колонке «Ресурсы» (номера слайдов, названия игр, тест, ДЗ):
${summary}
Формат ответа:
{
  "section": "раздел учебной программы",
  "learningObjectives": ["цели обучения по учебной программе с кодами, если знаешь (например 7.4.1.1 …)"],
  "lessonGoals": ["цели урока: все / большинство / некоторые ученики смогут…"],
  "successCriteria": ["критерии оценивания"],
  "languageGoals": "языковые цели и ключевые слова",
  "values": "привитие ценностей",
  "crossCurricular": "межпредметные связи",
  "priorKnowledge": "предварительные знания",
  "stages": [
    {"stage": "Начало урока", "minutes": 5, "teacher": "действия педагога", "students": "действия учеников", "assessment": "оценивание", "resources": "Слайды 1–2"},
    {"stage": "Середина урока", "minutes": 30, "teacher": "…", "students": "…", "assessment": "…", "resources": "…"},
    {"stage": "Конец урока", "minutes": 10, "teacher": "…", "students": "…", "assessment": "…", "resources": "…"}
  ],
  "differentiation": "как поддержать слабых и дать задания сильным",
  "assessmentNote": "как проверить, чему научились ученики",
  "reflection": "вопросы для рефлексии"
}
Названия этапов напиши на языке материалов. Сумма минут — 40–45.`;
}

/** Short text description of the generated parts, fed into the KSP prompt. */
export function summarize({ slides, games, quiz, test, homework }) {
  const lines = [];
  if (slides) lines.push('Презентация: ' + slides.slides.map((s, i) => `${i + 1}. ${s.title}`).join('; '));
  if (games) games.forEach(g => lines.push(`Игра «${g.title}»`));
  if (quiz) lines.push(`Викторина «${quiz.title}» — ${quiz.questions.length} вопросов`);
  if (test) lines.push(`Тест «${test.title}» — ${test.questions.length} вопросов`);
  if (homework) lines.push(`Домашнее задание «${homework.title}»`);
  return lines.join('\n') || '—';
}
