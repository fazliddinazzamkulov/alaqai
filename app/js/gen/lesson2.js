/* Builds a lesson in one go: presentation (deck for the 50-template player),
 * level tasks for the live lesson and a KSP for the whole lesson. */
import { generateJSON, searchImage, generateImage } from '../ai.js';
import { db } from '../data/store.js';
import { today } from '../school.js';
import { normalizeDeck } from '../deck/schema.js';
import { deckPrompt, tasksPrompt, kspPrompt2, normalizeKsp } from './prompts2.js';

export const PARTS = ['deck', 'tasks', 'ksp'];
const LEVELS = ['A', 'B', 'C'], METHODS = ['steps', 'example', 'error'];
const MAX_AI_IMAGES = 3;

const slidesOf = list => normalizeDeck({ slides: Array.isArray(list) ? list : [] }, { title: false }).slides;

/** Keeps only task slides the player can show; a level/method with nothing left is dropped. */
export function normalizeTasks(raw) {
  const levels = {};
  for (const l of LEVELS) {
    const src = (raw && raw.levels && raw.levels[l]) || {};
    const m = {};
    for (const k of METHODS) { const s = slidesOf(src[k]); if (s.length) m[k] = s; }
    if (Object.keys(m).length) levels[l] = m;
  }
  return { common: slidesOf(raw && raw.common), levels };
}

function summary(deck) {
  return 'Презентация: ' + deck.slides.map((s, i) => `${i + 1}. ${s.title || s.type}`).join('; ') +
    '\nЗадания на alaqai: уровни A, B, C, методики «пошагово», «разбор примера», «найди ошибку»; общее задание для всех.';
}

async function addImages(deck, mode) {
  if (mode === 'none') return;
  let ai = 0;
  for (const s of deck.slides) {
    if (!s.image_query || s.image || s.svg) continue;
    try {
      if (mode === 'ai' && ai < MAX_AI_IMAGES) { s.image = await generateImage(`${s.image_query}. Clean educational illustration, flat, white background, no text.`); ai++; }
      else s.image = await searchImage(s.image_query);
    } catch (e) { /* a slide without a picture is fine */ }
  }
}

/**
 * o: { topic, classId, className, subject, lang, count, types, images: 'photo'|'ai'|'none', files }
 * onPart(part, state, error?) — state: 'run' | 'done' | 'error'. Returns the lesson id.
 */
export async function createLesson(o, onPart = () => {}) {
  const ctx = { ...o, hasFiles: !!(o.files && o.files.length) };
  const run = async (part, fn) => { onPart(part, 'run'); try { const r = await fn(); onPart(part, 'done'); return r; } catch (e) { onPart(part, 'error', e); throw e; } };
  const deckP = run('deck', async () => {
    const d = normalizeDeck(await generateJSON(deckPrompt(ctx), { files: o.files || [] }), { topic: o.topic });
    await addImages(d, o.images);
    return d;
  });
  const tasksP = run('tasks', async () => normalizeTasks(await generateJSON(tasksPrompt(ctx), { files: o.files || [] })));
  const deck = await deckP;
  const [tasks, ksp] = await Promise.all([tasksP, run('ksp', async () => normalizeKsp(await generateJSON(kspPrompt2(ctx, summary(deck))), { className: o.className, lang: o.lang }))]);
  return save(o, deck, tasks, ksp);
}

/** Lesson without AI: title slide, an empty notes slide and the standard 40-minute KSP. */
export async function createBlank(o) {
  const deck = { title: o.topic, slides: [{ type: 'title', title: o.topic, subject: o.subject || '', goals: [] }, { type: 'notes', title: o.topic, points: ['…'] }] };
  const informatics = /информ|ақпарат|informat|computer/i.test(o.subject || '');
  const stages = informatics
    ? [['Басы', 3], ['Жаңа сабақ', 7], ['alaqai: деңгейлік тапсырма', 7, true], ['Практика', 15, true], ['Қорытынды, рефлексия', 3]]
    : [['Басы', 5], ['Жаңа сабақ', 12], ['alaqai: деңгейлік тапсырма', 7, true], ['Жұптық жұмыс', 10], ['Қорытынды, рефлексия', 6]];
  const ksp = normalizeKsp({ topic: o.topic, stages: stages.map(([stage, minutes, screen]) => ({ stage, minutes, screen: !!screen, teacher: '', students: '', assessment: '', resources: '' })) }, { className: o.className, lang: o.lang });
  return save(o, deck, { common: [], levels: {} }, ksp);
}

async function save(o, deck, tasks, ksp) {
  const lesson = await db.lessons.create({ classId: o.classId || null, topic: o.topic, subject: o.subject || '', lang: o.lang || 'kk', date: today(), status: 'ready', parts: {} });
  const pres = await db.presentations.create({ lessonId: lesson.id, title: deck.title || o.topic, lang: o.lang || 'kk', deck: { lang: o.lang || 'kk', slides: deck.slides } });
  const t = await db.tasks.create({ lessonId: lesson.id, ...tasks });
  const k = await db.ksp.create({ lessonId: lesson.id, topic: o.topic, ...ksp });
  await db.lessons.update(lesson.id, { parts: { presentationId: pres.id, tasksId: t.id, kspId: k.id } });
  return lesson.id;
}
