/* Class and student statistics, computed from journal marks.
 *
 * Grades are on the 5-point scale. Definitions used in Kazakhstan schools:
 *   knowledge quality — share of students whose average rounds to 4 or 5;
 *   success rate      — share of students whose average rounds to 3 or higher.
 */
import { db } from './data/store.js';
import { addDays, today, weekStart, quarterOf, monthStart, daysBetween } from './school.js';

export async function loadAll() {
  const [classes, students, lessons, marks, homework, submissions] = await Promise.all([
    db.classes.list(), db.students.list(), db.lessons.list(), db.marks.list(), db.homework.list(), db.submissions.list()
  ]);
  classes.sort((a, b) => a.name.localeCompare(b.name, 'ru', { numeric: true }));
  students.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return { classes, students, lessons, marks, homework, submissions };
}

const mean = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Start date of the period ('week' | 'month' | 'quarter') that contains `day`, and the one before it. */
export function periodRange(period, day = today()) {
  if (period === 'week') { const from = weekStart(day); return { from, to: addDays(from, 6), prevFrom: addDays(from, -7), prevTo: addDays(from, -1) }; }
  if (period === 'month') {
    const from = monthStart(day);
    const prevFrom = monthStart(addDays(from, -1));
    return { from, to: addDays(monthStart(addDays(from, 32)), -1), prevFrom, prevTo: addDays(from, -1) };
  }
  const q = quarterOf(day);
  const len = daysBetween(q.from, q.to);
  return { from: q.from, to: q.to, prevFrom: addDays(q.from, -len - 1), prevTo: addDays(q.from, -1) };
}

export const inRange = (m, from, to) => m.date >= from && m.date <= to;

/** Per-student numbers from the student's marks. */
export function studentStats(marks) {
  const grades = marks.filter(m => m.grade != null).map(m => m.grade);
  const withPresence = marks.filter(m => m.present != null);
  const present = withPresence.filter(m => m.present).length;
  const recentFrom = addDays(today(), -14), prevFrom = addDays(today(), -28);
  const recentG = marks.filter(m => m.grade != null && m.date > recentFrom).map(m => m.grade);
  const beforeG = marks.filter(m => m.grade != null && m.date > prevFrom && m.date <= recentFrom).map(m => m.grade);
  let trend = 'flat';
  if (recentG.length >= 2 && beforeG.length >= 2) {
    const d = mean(recentG) - mean(beforeG);
    trend = d >= 0.4 ? 'up' : d <= -0.4 ? 'down' : 'flat';
  }
  return {
    avg: mean(grades),
    points: marks.reduce((s, m) => s + (m.points || 0), 0),
    attendance: withPresence.length ? present / withPresence.length : null,
    absences: withPresence.length - present,
    trend
  };
}

/** Group numbers (a class, or all classes) from marks. */
export function groupStats(students, marks) {
  const byStudent = new Map(students.map(s => [s.id, []]));
  marks.forEach(m => byStudent.has(m.studentId) && byStudent.get(m.studentId).push(m));
  const avgs = [...byStudent.values()].map(ms => mean(ms.filter(m => m.grade != null).map(m => m.grade))).filter(a => a != null);
  const withPresence = marks.filter(m => m.present != null && byStudent.has(m.studentId));
  const grades = marks.filter(m => m.grade != null && byStudent.has(m.studentId)).map(m => m.grade);
  return {
    quality: avgs.length ? avgs.filter(a => Math.round(a) >= 4).length / avgs.length : null,
    success: avgs.length ? avgs.filter(a => Math.round(a) >= 3).length / avgs.length : null,
    avg: mean(grades),
    attendance: withPresence.length ? withPresence.filter(m => m.present).length / withPresence.length : null
  };
}

/** Knowledge quality for each of the last `weeks` weeks (null where there are no grades). */
export function weeklyQuality(students, marks, weeks = 8) {
  const start = addDays(weekStart(today()), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, i) => {
    const from = addDays(start, 7 * i), to = addDays(from, 6);
    return { from, value: groupStats(students, marks.filter(m => inRange(m, from, to))).quality };
  });
}

/** Share of homework handed in on time (null until there is homework). */
export function homeworkOnTime(homework, submissions, students, from, to) {
  const hw = homework.filter(h => h.dueDate && h.dueDate >= from && h.dueDate <= to);
  if (!hw.length) return null;
  let expected = 0, onTime = 0;
  hw.forEach(h => {
    const classStudents = students.filter(s => s.classId === h.classId).length;
    expected += classStudents;
    onTime += submissions.filter(x => x.homeworkId === h.id && x.submittedAt && x.submittedAt.slice(0, 10) <= h.dueDate).length;
  });
  return expected ? onTime / expected : null;
}

export const pct = v => (v == null ? '—' : Math.round(v * 100) + '%');
