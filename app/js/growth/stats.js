/* Student growth from live-lesson attempts. Pure functions, no DOM.
 * attempt: { studentId, lessonId, classId, method, template, level, correct, total, at } */

const pct = list => { const c = list.reduce((s, a) => s + (a.correct || 0), 0), n = list.reduce((s, a) => s + (a.total || 0), 0); return n ? Math.round(c / n * 100) : null; };

/** Lessons in time order with their first attempt time. */
function lessonsOf(list) {
  const first = new Map();
  for (const a of list) { const t = a.at || ''; if (!first.has(a.lessonId) || t < first.get(a.lessonId)) first.set(a.lessonId, t); }
  return [...first.entries()].sort((x, y) => x[1].localeCompare(y[1])).map(([lessonId, at]) => ({ lessonId, at }));
}

export function studentSummary(attempts, studentId) {
  const mine = attempts.filter(a => a.studentId === studentId);
  const byLesson = lessonsOf(mine).map(l => ({ ...l, pct: pct(mine.filter(a => a.lessonId === l.lessonId)) })).filter(l => l.pct != null);
  const methods = [...new Set(mine.map(a => a.method).filter(Boolean))];
  const byMethod = methods.map(m => { const list = mine.filter(a => a.method === m); return { method: m, pct: pct(list), n: list.length }; })
    .filter(x => x.pct != null).sort((a, b) => b.pct - a.pct || b.n - a.n);
  const best = (byMethod.find(x => x.n >= 3) || {}).method || null;
  const trend = byLesson.length > 1 ? byLesson[byLesson.length - 1].pct - byLesson[0].pct : 0;
  return { byLesson, byMethod, trend, best };
}

/** Who needs attention: three last lessons below 50%, or missed the class's last two lessons. */
export function lagging(attempts, students) {
  const out = [];
  for (const s of students) {
    const sum = studentSummary(attempts, s.id);
    const last3 = sum.byLesson.slice(-3);
    if (last3.length === 3 && last3.every(l => l.pct < 50)) { out.push({ studentId: s.id, reason: 'below50x3' }); continue; }
    const classLessons = lessonsOf(attempts.filter(a => a.classId === s.classId)).slice(-2);
    const been = new Set(attempts.filter(a => a.studentId === s.id).map(a => a.lessonId));
    if (classLessons.length === 2 && sum.byLesson.length && classLessons.every(l => !been.has(l.lessonId))) out.push({ studentId: s.id, reason: 'absent2' });
  }
  return out;
}

const ORDER = ['A', 'B', 'C'];
/** Proposed level after the last three lessons, or null to keep it. The teacher decides. */
export function suggestLevel(summary, level) {
  const last3 = (summary.byLesson || []).slice(-3);
  if (last3.length < 3) return null;
  const i = ORDER.indexOf(level || 'B');
  if (last3.every(l => l.pct >= 70) && i < 2) return ORDER[i + 1];
  if (last3.every(l => l.pct < 50) && i > 0) return ORDER[i - 1];
  return null;
}
