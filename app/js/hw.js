/* Homework shared by the teacher screens and the student page: who it is for,
 * where it stands, the class link and its QR code.
 *
 * homework:   { lessonId, classId, kind: 'online' | 'notebook', title, instructions, questions,
 *               testId?, dueDate, dueTime, studentIds (null = the whole class),
 *               checker: 'auto' | 'ai' | 'self', showAnswers, shuffle, status: 'draft' | 'sent', sentAt }
 * submission: { homeworkId, studentId, status: 'submitted' | 'checked', answers, points, total,
 *               autoGrade, photos, grade, comment, ai: { text, grade, hardest }, submittedAt, checkedAt } */
import { db } from './data/store.js';
import { today } from './school.js';

export function hwLink(id) {
  return `${location.origin}${location.pathname}#/s/${id}`;
}

/** Students the homework is addressed to. */
export async function hwStudents(hw) {
  const all = hw.classId ? await db.students.list({ classId: hw.classId }) : [];
  all.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return hw.studentIds && hw.studentIds.length ? all.filter(s => hw.studentIds.includes(s.id)) : all;
}

/** Counts for a homework card and the review screen. */
export function hwCounts(hw, students, subs) {
  const mine = subs.filter(s => s.homeworkId === hw.id && students.some(st => st.id === s.studentId));
  const graded = mine.filter(s => s.grade != null);
  const shares = mine.filter(s => s.total).map(s => s.points / s.total);
  return {
    total: students.length,
    submitted: mine.length,
    waiting: mine.filter(s => s.status === 'submitted').length,
    checked: mine.filter(s => s.status === 'checked').length,
    avgGrade: graded.length ? graded.reduce((a, s) => a + s.grade, 0) / graded.length : null,
    avgShare: shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : null
  };
}

export const isOpen = hw => hw.status === 'sent' && (!hw.dueDate || hw.dueDate >= today());

/** Load the QR library once (cdnjs) and return an SVG string for `text`. */
let qrLoading = null;
export async function qrSvg(text, cell = 6) {
  if (!qrLoading) {
    qrLoading = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
      s.onload = () => res(window.qrcode); s.onerror = () => { qrLoading = null; rej(new Error('qr')); };
      document.head.appendChild(s);
    });
  }
  const qrcode = await qrLoading;
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: cell, margin: 2, scalable: true });
}

/** Put the homework grade into the journal (a mark without attendance), or update it. */
export async function saveHwMark(hw, sub, grade) {
  const existing = (await db.marks.list({ submissionId: sub.id }))[0];
  const data = { lessonId: hw.lessonId || null, classId: hw.classId, studentId: sub.studentId, date: today(), present: null, points: 0, grade, kind: 'hw', homeworkId: hw.id, submissionId: sub.id };
  if (existing) await db.marks.update(existing.id, data);
  else await db.marks.create(data);
}

/** Share of correct answers per question for an online homework. */
export function questionStats(hw, subs) {
  const qs = hw.questions || [];
  return qs.map((q, i) => {
    const answered = subs.filter(s => s.answers && s.answers[i]);
    const right = answered.filter(s => s.answers[i].points > 0).length;
    return { i, share: answered.length ? right / answered.length : null };
  });
}
