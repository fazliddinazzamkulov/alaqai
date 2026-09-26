/* Test questions: types, auto-check and the player used for previews, lesson
 * mode and online homework. */
import { add, t } from './i18n.js';
import { esc } from './ui.js';

add({
  ru: {
    'qt.single': 'Один ответ', 'qt.multiple': 'Несколько ответов', 'qt.truefalse': 'Правда / Ложь', 'qt.open': 'Открытый ответ', 'qt.number': 'Задача с числом',
    'tp.submit': 'Проверить ответы', 'tp.result': 'Результат: {n} из {total} баллов', 'tp.grade': 'Оценка: {g}', 'tp.true': 'Правда', 'tp.false': 'Ложь',
    'tp.answerPh': 'Ваш ответ', 'tp.numberPh': 'Число', 'tp.correct': 'Верно', 'tp.wrong': 'Неверно', 'tp.right': 'Правильный ответ: {a}', 'tp.manual': 'Проверит учитель', 'tp.again': 'Пройти ещё раз'
  },
  kk: {
    'qt.single': 'Бір жауап', 'qt.multiple': 'Бірнеше жауап', 'qt.truefalse': 'Шын / Жалған', 'qt.open': 'Ашық жауап', 'qt.number': 'Сандық есеп',
    'tp.submit': 'Жауаптарды тексеру', 'tp.result': 'Нәтиже: {total} балдан {n}', 'tp.grade': 'Баға: {g}', 'tp.true': 'Шын', 'tp.false': 'Жалған',
    'tp.answerPh': 'Жауабыңыз', 'tp.numberPh': 'Сан', 'tp.correct': 'Дұрыс', 'tp.wrong': 'Қате', 'tp.right': 'Дұрыс жауап: {a}', 'tp.manual': 'Мұғалім тексереді', 'tp.again': 'Қайта өту'
  },
  en: {
    'qt.single': 'Single answer', 'qt.multiple': 'Multiple answers', 'qt.truefalse': 'True / False', 'qt.open': 'Open answer', 'qt.number': 'Number problem',
    'tp.submit': 'Check answers', 'tp.result': 'Score: {n} of {total} points', 'tp.grade': 'Grade: {g}', 'tp.true': 'True', 'tp.false': 'False',
    'tp.answerPh': 'Your answer', 'tp.numberPh': 'Number', 'tp.correct': 'Correct', 'tp.wrong': 'Wrong', 'tp.right': 'Correct answer: {a}', 'tp.manual': 'The teacher will check', 'tp.again': 'Try again'
  }
});

export const QTYPES = ['single', 'multiple', 'truefalse', 'open', 'number'];

/** Brings any stored question (AI or hand-made, old or new shape) to one form. */
export function normQ(q) {
  const type = QTYPES.includes(q.type) ? q.type : 'single';
  return {
    type, q: q.q || q.question || '', points: Number(q.points) || (type === 'number' ? 2 : 1), explanation: q.explanation || '', image: q.image || null,
    options: Array.isArray(q.options) ? q.options : [], answer: Number.isInteger(q.answer) ? q.answer : 0,
    answers: Array.isArray(q.answers) ? q.answers : [], isTrue: q.isTrue !== false, answerText: q.answerText || '', answerNumber: q.answerNumber ?? '', tolerance: Number(q.tolerance) || 0
  };
}

export function totalPoints(qs) { return qs.map(normQ).reduce((s, q) => s + q.points, 0); }
export function minutes(qs) { return Math.max(3, Math.round(qs.length * 1.2)); }

/** Returns points earned, or null when a person must check (open answers without a key). */
export function check(q0, given) {
  const q = normQ(q0);
  if (given == null || given === '') return 0;
  switch (q.type) {
    case 'single': return Number(given) === q.answer ? q.points : 0;
    case 'multiple': { const g = [...given].map(Number).sort().join(','); return g === [...q.answers].sort().join(',') ? q.points : 0; }
    case 'truefalse': return (given === true || given === 'true') === q.isTrue ? q.points : 0;
    case 'number': { const v = parseFloat(String(given).replace(',', '.')); const a = parseFloat(String(q.answerNumber).replace(',', '.')); return !Number.isNaN(v) && Math.abs(v - a) <= (q.tolerance || 1e-9) ? q.points : 0; }
    case 'open': {
      if (!q.answerText) return null;
      const norm = s => String(s).toLowerCase().replace(/[.,!?«»"']/g, '').replace(/\s+/g, ' ').trim();
      return q.answerText.split('|').some(a => norm(a) === norm(given)) ? q.points : 0;
    }
    default: return 0;
  }
}

export function rightAnswer(q0) {
  const q = normQ(q0);
  if (q.type === 'single') return q.options[q.answer] || '';
  if (q.type === 'multiple') return q.answers.map(i => q.options[i]).join(', ');
  if (q.type === 'truefalse') return q.isTrue ? t('tp.true') : t('tp.false');
  if (q.type === 'number') return String(q.answerNumber);
  return q.answerText.split('|')[0] || '';
}

/** 5-point grade from the share of points (a common Kazakhstan scale). */
export function gradeOf(share) { return share >= 0.85 ? 5 : share >= 0.65 ? 4 : share >= 0.4 ? 3 : 2; }

/**
 * A test to take: all questions on one page, "Check answers" scores them.
 * opts.onSubmit({ answers, points, total, needsReview }) — e.g. to save a homework submission.
 * opts.showAnswers — reveal right answers after checking (preview, lesson).
 */
export function playTest(el, test, opts = {}) {
  const qs = (test.questions || []).map(normQ);
  const total = totalPoints(qs);
  el.className = 'tp';
  el.innerHTML = `${qs.map((q, i) => `<fieldset class="tp-q" data-i="${i}"><legend><span class="n">${i + 1}</span>${esc(q.q)}</legend>
    ${q.image ? `<img src="${esc(q.image)}" alt="">` : ''}
    ${q.type === 'single' || q.type === 'multiple' ? `<div class="tp-opts">${q.options.map((o, k) => `<label><input type="${q.type === 'single' ? 'radio' : 'checkbox'}" name="q${i}" value="${k}"><span>${esc(o)}</span></label>`).join('')}</div>` : ''}
    ${q.type === 'truefalse' ? `<div class="tp-opts two"><label><input type="radio" name="q${i}" value="true"><span>${esc(t('tp.true'))}</span></label><label><input type="radio" name="q${i}" value="false"><span>${esc(t('tp.false'))}</span></label></div>` : ''}
    ${q.type === 'open' ? `<textarea name="q${i}" rows="2" placeholder="${esc(t('tp.answerPh'))}"></textarea>` : ''}
    ${q.type === 'number' ? `<input name="q${i}" inputmode="decimal" placeholder="${esc(t('tp.numberPh'))}">` : ''}
    <div class="tp-fb"></div></fieldset>`).join('')}
    <div class="tp-foot"><button type="button" class="btn-k btn-md" data-submit>${esc(t('tp.submit'))}</button><span class="tp-res"></span></div>`;
  el.querySelector('[data-submit]').onclick = () => {
    let points = 0, needsReview = false;
    const answers = qs.map((q, i) => {
      const inputs = [...el.querySelectorAll(`[name="q${i}"]`)];
      let given;
      if (q.type === 'multiple') given = inputs.filter(x => x.checked).map(x => Number(x.value));
      else if (q.type === 'single' || q.type === 'truefalse') { const c = inputs.find(x => x.checked); given = c ? (q.type === 'truefalse' ? c.value === 'true' : Number(c.value)) : ''; }
      else given = inputs[0].value.trim();
      const got = check(q, given);
      if (got == null) needsReview = true; else points += got;
      const fb = el.querySelector(`.tp-q[data-i="${i}"] .tp-fb`);
      const fs = fb.parentElement;
      fs.classList.remove('ok', 'bad', 'wait');
      fs.classList.add(got == null ? 'wait' : got > 0 ? 'ok' : 'bad');
      fb.textContent = got == null ? t('tp.manual') : got > 0 ? t('tp.correct') : (opts.showAnswers !== false ? t('tp.right', { a: rightAnswer(q) }) : t('tp.wrong'));
      if (opts.showAnswers !== false && q.explanation && got === 0) fb.textContent += ' · ' + q.explanation;
      return { given, points: got };
    });
    el.querySelector('.tp-res').textContent = t('tp.result', { n: points, total }) + (needsReview ? '' : ' · ' + t('tp.grade', { g: gradeOf(total ? points / total : 0) }));
    if (opts.onSubmit) opts.onSubmit({ answers, points, total, needsReview });
  };
}
