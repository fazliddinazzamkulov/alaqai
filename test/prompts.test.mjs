import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deckPrompt, tasksPrompt, kspPrompt2, normalizeKsp, screenLimit } from '../app/js/gen/prompts2.js';
import { kspModel } from '../app/js/ksp/doc.js';

const base = { topic: 'Цикл for', subject: 'Информатика', className: '8 «А»', lang: 'kk', count: 10 };
const sum = (arr, f) => arr.reduce((a, s) => a + (f(s) ? s.minutes : 0), 0);

test('deck prompt lists only chosen types', () => {
  const p = deckPrompt({ ...base, types: ['title', 'notes', 'predict'], images: 'photo' });
  assert.ok(p.includes('"type":"predict"'));
  assert.ok(!p.includes('"type":"quiz"'));
  assert.ok(p.includes('10'));
});

test('screen limit by grade', () => {
  assert.equal(screenLimit('8 «А»'), 25);
  assert.equal(screenLimit('10 «Б»'), 30);
  assert.equal(screenLimit('3 «А»'), 20);
});

test('ksp prompt covers the whole lesson, the break and the limit 25 for grade 8', () => {
  const p = kspPrompt2(base, 'Презентация: 1. Титул');
  assert.match(p, /весь урок/i);
  assert.match(p, /перерыв/i);
  assert.ok(p.includes('25'));
  assert.ok(p.includes('"methods"') && p.includes('"health"') && p.includes('"screen"'));
});

test('tasks prompt asks for three levels and three methods', () => {
  const p = tasksPrompt(base);
  for (const k of ['"A"', '"B"', '"C"', '"steps"', '"example"', '"error"', '"common"']) assert.ok(p.includes(k), k);
});

test('ksp minutes sum to 40', () => {
  const k = normalizeKsp({ stages: [{ stage: 'a', minutes: 5 }, { stage: 'b', minutes: 30 }, { stage: 'c', minutes: 10 }] }, { className: '8 «А»' });
  assert.equal(sum(k.stages, () => true), 40);
});

test('normalizeKsp adds a screen break between computer stages', () => {
  const k = normalizeKsp({ stages: [{ stage: 'a', minutes: 5 }, { stage: 'pc1', minutes: 10, screen: true }, { stage: 'pc2', minutes: 15, screen: true }, { stage: 'end', minutes: 10 }] }, { className: '8 «А»' });
  const i = k.stages.findIndex(s => s.rest);
  assert.ok(i > 0, 'break inserted');
  assert.equal(k.stages[i].screen, false);
  assert.equal(sum(k.stages, () => true), 40);
});

test('screen minutes capped at the grade limit', () => {
  const k = normalizeKsp({ stages: [{ stage: 'a', minutes: 5 }, { stage: 'pc', minutes: 30, screen: true }, { stage: 'rest', minutes: 5, rest: true }] }, { className: '8 «А»' });
  assert.ok(sum(k.stages, s => s.screen) <= 25);
  assert.equal(sum(k.stages, () => true), 40);
});

test('ksp document shows methods and health rows', () => {
  const m = kspModel({ topic: 'T', methods: 'Миға шабуыл', health: 'Сергіту сәті', stages: [] }, { docLang: 'kk' });
  assert.ok(m.info.some(r => r[0] === 'methods' && r[2] === 'Миға шабуыл'));
  assert.ok(m.after.some(r => r[0] === 'health'));
});
