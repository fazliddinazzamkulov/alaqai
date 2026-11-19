import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studentSummary, lagging, suggestLevel } from '../app/js/growth/stats.js';

const A = (studentId, lessonId, method, correct, total, day) => ({ id: `${studentId}-${lessonId}-${method}-${day}`, studentId, lessonId, classId: 'c1', method, correct, total, at: `2026-11-${String(day).padStart(2, '0')}T09:00:00Z` });

test('summary: percent per lesson in time order, per method, best method needs 3 tries', () => {
  const at = [A('s1', 'L2', 'steps', 3, 3, 12), A('s1', 'L1', 'steps', 1, 2, 10), A('s1', 'L1', 'error', 0, 2, 10), A('s1', 'L3', 'steps', 2, 2, 14), A('s1', 'L3', 'error', 1, 2, 14)];
  const s = studentSummary(at, 's1');
  assert.deepEqual(s.byLesson.map(x => [x.lessonId, x.pct]), [['L1', 25], ['L2', 100], ['L3', 75]]);
  assert.deepEqual(s.byMethod[0], { method: 'steps', pct: 86, n: 3 });
  assert.equal(s.best, 'steps');
  assert.equal(s.trend, 50);
});

test('summary of a student without attempts', () => {
  const s = studentSummary([], 's9');
  assert.deepEqual(s, { byLesson: [], byMethod: [], trend: 0, best: null });
});

test('lagging: three lessons below 50%', () => {
  const at = [A('s1', 'L1', 'steps', 1, 4, 10), A('s1', 'L2', 'steps', 1, 3, 11), A('s1', 'L3', 'steps', 0, 2, 12), A('s2', 'L1', 'steps', 4, 4, 10), A('s2', 'L2', 'steps', 3, 3, 11), A('s2', 'L3', 'steps', 2, 2, 12)];
  const r = lagging(at, [{ id: 's1', classId: 'c1' }, { id: 's2', classId: 'c1' }]);
  assert.deepEqual(r, [{ studentId: 's1', reason: 'below50x3' }]);
});

test('lagging: missed the last two lessons of the class', () => {
  const at = [A('s1', 'L1', 'steps', 2, 2, 10), A('s2', 'L1', 'steps', 2, 2, 10), A('s2', 'L2', 'steps', 2, 2, 11), A('s2', 'L3', 'steps', 2, 2, 12)];
  const r = lagging(at, [{ id: 's1', classId: 'c1' }, { id: 's2', classId: 'c1' }]);
  assert.deepEqual(r, [{ studentId: 's1', reason: 'absent2' }]);
});

test('suggest level: up after three lessons at 70%+, down after three below 50%', () => {
  const up = { byLesson: [{ pct: 40 }, { pct: 70 }, { pct: 80 }, { pct: 90 }] };
  const down = { byLesson: [{ pct: 30 }, { pct: 40 }, { pct: 20 }] };
  assert.equal(suggestLevel(up, 'B'), 'C');
  assert.equal(suggestLevel(up, 'C'), null);
  assert.equal(suggestLevel(down, 'B'), 'A');
  assert.equal(suggestLevel(down, 'A'), null);
  assert.equal(suggestLevel({ byLesson: [{ pct: 90 }, { pct: 90 }] }, 'A'), null);
});
