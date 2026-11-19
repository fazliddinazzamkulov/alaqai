import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDeck, templatesFor, TEMPLATES } from '../app/js/deck/schema.js';

test('drops unknown types', () => {
  const r = normalizeDeck({ slides: [{ type: 'title', title: 'T' }, { type: 'zzz' }, { type: 'notes', title: 'A', points: ['x'] }] });
  assert.equal(r.slides.length, 2);
  assert.equal(r.dropped, 1);
});

test('order keeps answer order', () => {
  const r = normalizeDeck({ slides: [{ type: 'title', title: 'T' }, { type: 'order', title: 'O', items: ['a', 'b', 'c'] }] });
  assert.deepEqual(r.slides[1].items, ['a', 'b', 'c']);
});

test('quiz with an answer index outside the options is dropped', () => {
  const r = normalizeDeck({ slides: [{ type: 'title', title: 'T' }, { type: 'quiz', questions: [{ q: 'Q', options: ['1', '2', '3', '4'], answer: 9 }] }] });
  assert.equal(r.slides.length, 1);
  assert.equal(r.dropped, 1);
});

test('first slide is title', () => {
  const r = normalizeDeck({ slides: [{ type: 'notes', title: 'A', points: ['x'] }] }, { topic: 'Цикл for' });
  assert.equal(r.slides[0].type, 'title');
  assert.equal(r.slides[0].title, 'Цикл for');
});

test('codefill without blanks is dropped', () => {
  const r = normalizeDeck({ slides: [{ type: 'title', title: 'T' }, { type: 'codefill', code: 'print(1)' }] });
  assert.equal(r.dropped, 1);
});

test('informatics templates include code tasks, not chemistry', () => {
  const t = templatesFor('Информатика');
  for (const k of ['code', 'predict', 'codefill', 'parsons', 'steps', 'error', 'flowchart']) assert.ok(t.includes(k), k);
  assert.ok(!t.includes('reaction'));
  assert.ok(!t.includes('geometry'), 'Информатика contains «мат» but is not maths');
});

test('physics templates include formula and lab', () => {
  const t = templatesFor('Физика');
  assert.ok(t.includes('formula') && t.includes('lab') && t.includes('example'));
});

test('every template has a prompt shape and a kind', () => {
  for (const [k, v] of Object.entries(TEMPLATES)) {
    assert.ok(v.prompt && v.prompt.length > 10, k);
    assert.ok(v.kind === 'teach' || v.kind === 'task', k);
  }
});

test('title:false keeps task slides without adding a title', () => {
  const r = normalizeDeck({ slides: [{ type: 'steps', title: 'S', steps: [{ q: '1+1', answer: '2' }] }] }, { title: false });
  assert.equal(r.slides.length, 1);
  assert.equal(r.slides[0].type, 'steps');
});
