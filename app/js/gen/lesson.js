/* Builds a whole lesson from one topic: KSP, slides, games, quiz, test, homework.
 * The lesson is stored as one set (lessons.parts) and every part also lands in
 * its own collection, so it shows up in its own section of the platform. */
import { db } from '../data/store.js';
import { generateJSON, AiError } from '../ai.js';
import { slidesPrompt, gamesPrompt, testPrompt, kspPrompt, summarize } from './prompts.js';
import { today, addDays } from '../school.js';

export const ROWS = ['ksp', 'slides', 'games', 'quiz', 'testhw', 'analysis'];

let job = null;              // the lesson being generated right now (survives leaving the screen)
const listeners = new Set();
export function currentJob() { return job; }
export function onJob(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => { try { fn(job); } catch (e) { console.error(e); } }); }
function setRow(id, state, extra = {}) { job.rows[id] = { ...job.rows[id], state, ...extra }; emit(); }

/* ---------- cleaning model output ---------- */

const str = v => (v == null ? '' : String(v)).trim();
const arr = v => (Array.isArray(v) ? v : []);
function cleanQuestions(qs) {
  return arr(qs).map(q => {
    const options = arr(q.options).map(str).filter(Boolean).slice(0, 6);
    const answer = Math.max(0, Math.min(options.length - 1, Number(q.answer) || 0));
    return { q: str(q.q || q.question), options, answer, explanation: str(q.explanation) };
  }).filter(q => q.q && q.options.length >= 2);
}
function cleanPairs(ps) { return arr(ps).map(p => ({ a: str(p.a || p.left), b: str(p.b || p.right) })).filter(p => p.a && p.b); }

/* ---------- saving parts ---------- */

async function nextLessonDate(lesson) {
  if (!lesson.classId || !lesson.date) return addDays(today(), 2);
  const later = (await db.lessons.list(l => l.classId === lesson.classId && l.date > lesson.date)).map(l => l.date).sort();
  return later[0] || addDays(lesson.date, 2);
}

async function attach(lessonId, patch) {
  const l = await db.lessons.get(lessonId);
  return db.lessons.update(lessonId, { parts: { ...(l.parts || {}), ...patch } });
}

/* ---------- the job ---------- */

/**
 * opts: { topic, subject, classId, className, lang, ratio, parts: { ksp, slides, games, test, homework, analysis }, files, lessonId? }
 * `lessonId` — an existing lesson (e.g. from the calendar) to fill instead of creating a new one.
 */
export async function startLesson(opts) {
  const base = { topic: opts.topic, subject: opts.subject, classId: opts.classId || null, lang: opts.lang, ratio: opts.ratio, analysis: !!opts.parts.analysis };
  let lesson;
  const existing = opts.lessonId ? await db.lessons.get(opts.lessonId) : null;
  if (existing) lesson = await db.lessons.update(existing.id, { ...base, status: 'generating', prevStatus: existing.status });
  else lesson = await db.lessons.create({ ...base, date: null, slot: null, status: 'generating', parts: {} });

  const p = opts.parts;
  job = {
    lessonId: lesson.id, opts, isNew: !existing, fatal: null, done: false, results: {},
    rows: {
      ksp: { state: p.ksp ? 'wait' : 'off' },
      slides: { state: p.slides ? 'wait' : 'off' },
      games: { state: p.games ? 'wait' : 'off' },
      quiz: { state: p.games ? 'wait' : 'off' },
      testhw: { state: p.test || p.homework ? 'wait' : 'off' },
      analysis: { state: p.analysis ? 'after' : 'off' }
    }
  };
  emit();
  run(job).catch(e => console.error(e));
  return job;
}

const ctx = j => ({ ...j.opts, hasFiles: !!(j.opts.files && j.opts.files.length) });
const gen = (j, prompt) => generateJSON(prompt, { files: j.opts.files || [] });

async function doSlides(j) {
  setRow('slides', 'run');
  const res = await gen(j, slidesPrompt({ ...ctx(j), count: 10 }));
  const slides = arr(res.slides || res).filter(s => s && s.layout);
  if (!slides.length) throw new AiError('bad');
  const deck = await db.presentations.create({ lessonId: j.lessonId, classId: j.opts.classId || null, title: str(res.title) || j.opts.topic, lang: j.opts.lang, ratio: j.opts.ratio, slides });
  await attach(j.lessonId, { presentationId: deck.id });
  j.results.slides = deck;
  setRow('slides', 'done', { count: slides.length });
}

async function doGames(j) {
  setRow('games', 'run'); setRow('quiz', 'run');
  const res = await gen(j, gamesPrompt(ctx(j)));
  const games = [];
  for (const type of ['matching', 'memory']) {
    const pairs = cleanPairs(res[type] && res[type].pairs);
    if (pairs.length >= 3) games.push(await db.games.create({ lessonId: j.lessonId, type, title: str(res[type].title), pairs }));
  }
  const qs = cleanQuestions(res.quiz && res.quiz.questions);
  if (!games.length && !qs.length) throw new AiError('bad');
  const quiz = qs.length ? await db.tests.create({ lessonId: j.lessonId, kind: 'quiz', title: str(res.quiz.title) || j.opts.topic, questions: qs }) : null;
  await attach(j.lessonId, { gameIds: games.map(g => g.id), quizId: quiz && quiz.id });
  j.results.games = games; j.results.quiz = quiz;
  setRow('games', games.length ? 'done' : 'error', { names: games.map(g => g.title) });
  setRow('quiz', quiz ? 'done' : 'error', { count: qs.length });
}

async function doTest(j) {
  setRow('testhw', 'run');
  const res = await gen(j, testPrompt({ ...ctx(j), test: !!j.opts.parts.test, homework: !!j.opts.parts.homework }));
  const patch = {};
  if (j.opts.parts.test) {
    const qs = cleanQuestions(res.test && res.test.questions);
    if (qs.length) { const test = await db.tests.create({ lessonId: j.lessonId, kind: 'test', title: str(res.test.title) || j.opts.topic, questions: qs }); patch.testId = test.id; j.results.test = test; }
  }
  if (j.opts.parts.homework) {
    const qs = cleanQuestions(res.homework && res.homework.questions);
    if (qs.length) {
      const lesson = await db.lessons.get(j.lessonId);
      const hw = await db.homework.create({ lessonId: j.lessonId, classId: j.opts.classId || null, kind: 'online', title: str(res.homework.title) || j.opts.topic, instructions: str(res.homework.instructions), questions: qs, dueDate: await nextLessonDate(lesson), status: 'draft' });
      patch.homeworkId = hw.id; j.results.homework = hw;
    }
  }
  if (!patch.testId && !patch.homeworkId) throw new AiError('bad');
  await attach(j.lessonId, patch);
  setRow('testhw', 'done', { count: j.results.test ? j.results.test.questions.length : 0 });
}

async function doKsp(j) {
  setRow('ksp', 'run');
  const r = j.results;
  const res = await gen(j, kspPrompt(ctx(j), summarize({ slides: r.slides, games: r.games, quiz: r.quiz, test: r.test, homework: r.homework })));
  const stages = arr(res.stages).map(s => ({ stage: str(s.stage), minutes: Number(s.minutes) || null, teacher: str(s.teacher), students: str(s.students), assessment: str(s.assessment), resources: str(s.resources) })).filter(s => s.stage);
  if (!stages.length) throw new AiError('bad');
  const ksp = await db.ksp.create({
    lessonId: j.lessonId, topic: j.opts.topic, subject: j.opts.subject, classId: j.opts.classId || null, lang: j.opts.lang,
    section: str(res.section), learningObjectives: arr(res.learningObjectives).map(str), lessonGoals: arr(res.lessonGoals).map(str),
    successCriteria: arr(res.successCriteria).map(str), languageGoals: str(res.languageGoals), values: str(res.values),
    crossCurricular: str(res.crossCurricular), priorKnowledge: str(res.priorKnowledge), stages,
    differentiation: str(res.differentiation), assessmentNote: str(res.assessmentNote), reflection: str(res.reflection)
  });
  await attach(j.lessonId, { kspId: ksp.id });
  setRow('ksp', 'done');
}

const RUNNERS = { slides: doSlides, games: doGames, testhw: doTest, ksp: doKsp };
const FAIL_ROWS = { games: ['games', 'quiz'] };

async function attempt(j, id) {
  try { await RUNNERS[id](j); return true; } catch (e) {
    const code = e instanceof AiError ? e.code : 'other';
    (FAIL_ROWS[id] || [id]).forEach(r => setRow(r, 'error', { message: e.message }));
    if (['login', 'plan', 'nokeys', 'offline'].includes(code)) j.fatal = j.fatal || e;
    return false;
  }
}

async function run(j) {
  const first = ['slides', 'games', 'testhw'].filter(id => j.rows[id].state !== 'off');
  await Promise.all(first.map(id => attempt(j, id)));
  if (j.rows.ksp.state !== 'off' && !j.fatal) await attempt(j, 'ksp');
  await finish(j);
}

async function finish(j) {
  const lesson = await db.lessons.get(j.lessonId);
  const parts = lesson.parts || {};
  const hasAny = parts.kspId || parts.presentationId || (parts.gameIds && parts.gameIds.length) || parts.quizId || parts.testId || parts.homeworkId;
  if (!hasAny && j.fatal) {
    // Nothing was made (not signed in, no plan, server down): leave things as they were.
    if (j.isNew) await db.lessons.remove(j.lessonId);
    else await db.lessons.update(j.lessonId, { status: lesson.prevStatus || 'planned' });
  } else {
    await db.lessons.update(j.lessonId, { status: 'ready' });
    await db.usage.create({ kind: 'ai-lesson', at: new Date().toISOString(), lessonId: j.lessonId });
  }
  j.done = true;
  emit();
}

/** Try one failed row again. */
export async function retry(id) {
  if (!job || !job.done) return;
  const runner = id === 'quiz' ? 'games' : id;
  job.done = false; job.fatal = null; emit();
  await attempt(job, runner);
  job.done = true; emit();
  if (!(await db.lessons.get(job.lessonId))) return;
  await db.lessons.update(job.lessonId, { status: 'ready' });
}

export function clearJob() { job = null; emit(); }

/* ---------- without AI: an empty set the teacher fills in by hand ---------- */

const STAGES = {
  ru: ['Начало урока', 'Середина урока', 'Конец урока'],
  kk: ['Сабақтың басы', 'Сабақтың ортасы', 'Сабақтың соңы'],
  en: ['Beginning', 'Middle', 'End']
};

export async function blankLesson(opts) {
  const base = { topic: opts.topic, subject: opts.subject, classId: opts.classId || null, lang: opts.lang, ratio: opts.ratio, analysis: !!opts.parts.analysis };
  const existing = opts.lessonId ? await db.lessons.get(opts.lessonId) : null;
  const lesson = existing ? await db.lessons.update(existing.id, { ...base, status: 'ready' }) : await db.lessons.create({ ...base, date: null, slot: null, status: 'ready', parts: {} });
  const p = opts.parts, parts = {};
  if (p.slides) parts.presentationId = (await db.presentations.create({ lessonId: lesson.id, classId: base.classId, title: opts.topic, lang: opts.lang, ratio: opts.ratio, slides: [{ layout: 'title', title: opts.topic, subtitle: opts.subject || '' }, { layout: 'content', title: '', bullets: [] }] })).id;
  if (p.test) parts.testId = (await db.tests.create({ lessonId: lesson.id, kind: 'test', title: opts.topic, questions: [] })).id;
  if (p.games) parts.quizId = (await db.tests.create({ lessonId: lesson.id, kind: 'quiz', title: opts.topic, questions: [] })).id;
  if (p.homework) parts.homeworkId = (await db.homework.create({ lessonId: lesson.id, classId: base.classId, kind: 'notebook', title: opts.topic, instructions: '', questions: [], dueDate: await nextLessonDate(lesson), status: 'draft' })).id;
  if (p.ksp) {
    const names = STAGES[String(opts.lang).slice(0, 2)] || STAGES.ru;
    parts.kspId = (await db.ksp.create({ lessonId: lesson.id, topic: opts.topic, subject: opts.subject, classId: base.classId, lang: opts.lang, stages: names.map((stage, i) => ({ stage, minutes: [5, 30, 10][i], teacher: '', students: '', assessment: '', resources: '' })) })).id;
  }
  await db.lessons.update(lesson.id, { parts });
  return lesson.id;
}
