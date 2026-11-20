/* Grade journal: students × lessons of one class. A cell is the points a student
 * scored in that lesson — tasks checked on alaqai (attempts) plus points the
 * teacher enters by hand (notebook work, oral answers: «marks»). Points only,
 * no 10-point grade column. Export to CSV for Excel. */
import { add, t } from '../i18n.js';
import { html, openModal, toast } from '../ui.js';
import { db } from '../data/store.js';

add({
  kk: { 'j.title': 'Бағалау журналы', 'j.lead': 'Әр сабақтағы ұпай: alaqai-да тексерілген тапсырмалар және қолмен қосылған ұпай (дәптер, ауызша жауап). Ұяшықты басып, ұпай қосыңыз.', 'j.noClass': 'Алдымен сынып қосыңыз.', 'j.noLessons': 'Бұл сыныпта әзірге сабақ жоқ.', 'j.student': 'Оқушы', 'j.total': 'Барлығы', 'j.pct': '%', 'j.csv': 'Excel-ге (CSV)', 'j.manual': 'Қолмен қосылған ұпай', 'j.got': 'Алған ұпайы', 'j.max': 'Ең көп ұпай', 'j.note': 'Ескерту (міндетті емес)', 'j.auto': 'alaqai-да тексерілгені: {n}', 'j.saved': 'Сақталды', 'j.clear': 'Қолмен қосылғанын өшіру', 'j.avg': 'Сынып орташасы', 'j.bad': 'Ұпай ең көп ұпайдан аспауы керек' },
  ru: { 'j.title': 'Журнал оценок', 'j.lead': 'Баллы за каждый урок: задания, проверенные на alaqai, и баллы, добавленные вручную (тетрадь, устный ответ). Нажмите на ячейку, чтобы добавить баллы.', 'j.noClass': 'Сначала добавьте класс.', 'j.noLessons': 'В этом классе пока нет уроков.', 'j.student': 'Ученик', 'j.total': 'Итого', 'j.pct': '%', 'j.csv': 'В Excel (CSV)', 'j.manual': 'Баллы вручную', 'j.got': 'Набрано баллов', 'j.max': 'Максимум баллов', 'j.note': 'Заметка (необязательно)', 'j.auto': 'Проверено на alaqai: {n}', 'j.saved': 'Сохранено', 'j.clear': 'Удалить ручные баллы', 'j.avg': 'Среднее по классу', 'j.bad': 'Баллов не может быть больше максимума' },
  en: { 'j.title': 'Grade journal', 'j.lead': 'Points for each lesson: tasks checked on alaqai plus points added by hand (notebook, oral answers). Click a cell to add points.', 'j.noClass': 'Add a class first.', 'j.noLessons': 'No lessons in this class yet.', 'j.student': 'Student', 'j.total': 'Total', 'j.pct': '%', 'j.csv': 'To Excel (CSV)', 'j.manual': 'Points by hand', 'j.got': 'Points scored', 'j.max': 'Maximum points', 'j.note': 'Note (optional)', 'j.auto': 'Checked on alaqai: {n}', 'j.saved': 'Saved', 'j.clear': 'Remove hand-entered points', 'j.avg': 'Class average', 'j.bad': 'Points cannot exceed the maximum' },
});

/** Points of one student in one lesson: { got, max, auto:{got,max}, mark } (pure; exported for tests). */
export function cellPoints(attempts, marks, studentId, lessonId) {
  const auto = { got: 0, max: 0 };
  for (const a of attempts) if (a.studentId === studentId && a.lessonId === lessonId && !a.manual) { auto.got += Number(a.correct) || 0; auto.max += Number(a.total) || 0; }
  const mark = marks.find(m => m.studentId === studentId && m.lessonId === lessonId) || null;
  const mGot = mark ? Number(mark.points) || 0 : 0, mMax = mark ? Number(mark.maxPoints) || 0 : 0;
  return { got: auto.got + mGot, max: auto.max + mMax, auto, mark };
}

const pct = (got, max) => (max ? Math.round(got / max * 100) : null);
const tone = p => (p == null ? '' : p >= 80 ? 'ok' : p >= 50 ? 'mid' : 'low');

export async function render(main, { query }) {
  const [classes, students, lessons, attempts, marks] = await Promise.all([db.classes.list(), db.students.list(), db.lessons.list(), db.attempts.list(), db.marks.list()]);
  if (!classes.length) { main.innerHTML = html`<div class="wrap"><h1>${t('j.title')}</h1><div class="empty">${t('j.noClass')}<a class="btn sm" href="#/classes">${t('nav.classes')}</a></div></div>`.toString(); return; }
  const st = { classId: query.classId && classes.some(c => c.id === query.classId) ? query.classId : classes[0].id };

  const lessonDate = l => l.date || l.createdAt || (attempts.find(a => a.lessonId === l.id) || {}).at || '';
  const shortDate = d => { const x = new Date(d); return isNaN(x) ? '' : `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}`; };

  function table() {
    const list = students.filter(s => s.classId === st.classId).sort((a, b) => a.name.localeCompare(b.name, 'kk'));
    const cols = lessons.filter(l => l.classId === st.classId).sort((a, b) => String(lessonDate(a)).localeCompare(String(lessonDate(b))));
    const rows = list.map(s => {
      const cells = cols.map(l => cellPoints(attempts, marks, s.id, l.id));
      const got = cells.reduce((n, c) => n + c.got, 0), max = cells.reduce((n, c) => n + c.max, 0);
      return { s, cells, got, max };
    });
    return { list, cols, rows };
  }

  function draw() {
    const { cols, rows } = table();
    const avg = rows.length ? Math.round(rows.reduce((n, r) => n + (pct(r.got, r.max) || 0), 0) / rows.length) : 0;
    main.innerHTML = html`<div class="wrap">
      <div class="row" style="justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h1>${t('j.title')}</h1>
        <div class="row" style="gap:8px;flex-wrap:wrap">${classes.map(c => html`<button type="button" class="btn sm${c.id === st.classId ? ' k' : ''}" data-cls="${c.id}">${c.name}</button>`)}
          <button type="button" class="btn sm" data-csv>${t('j.csv')}</button></div></div>
      <p class="sub" style="margin:4px 0 16px">${t('j.lead')}</p>
      ${!cols.length ? html`<div class="empty">${t('j.noLessons')}</div>` : html`
      <div class="card jr-wrap" style="padding:0">
        <table class="jr" data-journal>
          <thead><tr><th class="jr-name">${t('j.student')}</th>${cols.map(l => html`<th title="${l.topic}"><span class="jr-date">${shortDate(lessonDate(l))}</span><span class="jr-topic">${l.topic}</span></th>`)}<th class="jr-tot">${t('j.total')}</th><th class="jr-tot">${t('j.pct')}</th></tr></thead>
          <tbody>${rows.map(r => html`<tr data-row="${r.s.id}"><th class="jr-name">${r.s.name}</th>
            ${r.cells.map((c, i) => { const p = pct(c.got, c.max); return html`<td><button type="button" class="jr-cell ${tone(p)}" data-cell="${r.s.id}|${cols[i].id}" aria-label="${r.s.name}, ${cols[i].topic}: ${c.max ? c.got + '/' + c.max : '—'}">${c.max ? html`<b>${c.got}</b><small>/${c.max}</small>` : '·'}${c.mark ? html`<i class="jr-hand" title="${t('j.manual')}">✎</i>` : ''}</button></td>`; })}
            <td class="jr-tot"><b>${r.got}</b><small>/${r.max}</small></td><td class="jr-tot"><span class="jr-pct ${tone(pct(r.got, r.max))}">${pct(r.got, r.max) ?? '—'}</span></td></tr>`)}</tbody>
          <tfoot><tr><th class="jr-name">${t('j.avg')}</th>${cols.map((l, i) => { const ps = rows.map(r => pct(r.cells[i].got, r.cells[i].max)).filter(x => x != null); return html`<td class="jr-foot">${ps.length ? Math.round(ps.reduce((a, b) => a + b, 0) / ps.length) + '%' : '—'}</td>`; })}<td class="jr-tot"></td><td class="jr-tot"><b>${avg}%</b></td></tr></tfoot>
        </table></div>`}
    </div>`.toString();
    main.querySelectorAll('[data-cls]').forEach(b => b.onclick = () => { st.classId = b.dataset.cls; draw(); });
    main.querySelectorAll('[data-cell]').forEach(b => b.onclick = () => edit(...b.dataset.cell.split('|')));
    const csv = main.querySelector('[data-csv]'); if (csv) csv.onclick = exportCsv;
  }

  function edit(studentId, lessonId) {
    const s = students.find(x => x.id === studentId), l = lessons.find(x => x.id === lessonId);
    const c = cellPoints(attempts, marks, studentId, lessonId);
    const close = openModal({
      title: `${s.name} · ${l.topic}`,
      body: html`<p class="sub" style="margin:0 0 12px">${t('j.auto', { n: c.auto.max ? `${c.auto.got}/${c.auto.max}` : '—' })}</p>
        <div class="lbl" style="margin-bottom:6px">${t('j.manual')}</div>
        <div class="row" style="gap:12px"><label class="field" style="flex:1">${t('j.got')}<input name="got" type="number" min="0" step="1" inputmode="numeric" value="${c.mark ? c.mark.points : ''}" autofocus></label>
        <label class="field" style="flex:1">${t('j.max')}<input name="max" type="number" min="1" step="1" inputmode="numeric" value="${c.mark ? c.mark.maxPoints : 5}"></label></div>
        <label class="field">${t('j.note')}<input name="note" maxlength="120" value="${c.mark ? c.mark.note || '' : ''}"></label>`.toString(),
      submitLabel: t('ui.save'),
      extraButtons: c.mark ? html`<button type="button" class="btn sm" data-clear>${t('j.clear')}</button>`.toString() : '',
      onSubmit: async f => {
        const got = Math.round(Number(f.got.value)), max = Math.round(Number(f.max.value));
        if (f.got.value === '') { if (c.mark) { await db.marks.remove(c.mark.id); marks.splice(marks.indexOf(c.mark), 1); } draw(); return; }
        if (!(max >= 1) || !(got >= 0) || got > max) { toast(t('j.bad')); return false; }
        const patch = { points: got, maxPoints: max, note: f.note.value.trim() };
        if (c.mark) { Object.assign(c.mark, await db.marks.update(c.mark.id, patch)); }
        else marks.push(await db.marks.create({ lessonId, classId: st.classId, studentId, date: new Date().toISOString(), ...patch }));
        toast(t('j.saved')); draw();
      },
    });
    const clear = document.querySelector('.modal [data-clear]');
    if (clear) clear.onclick = async () => { await db.marks.remove(c.mark.id); marks.splice(marks.indexOf(c.mark), 1); close(); draw(); };
  }

  function exportCsv() {
    const { cols, rows } = table();
    const q = v => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [[t('j.student'), ...cols.map(l => `${shortDate(lessonDate(l))} ${l.topic}`), t('j.total'), t('j.pct')].map(q).join(';')];
    rows.forEach(r => lines.push([r.s.name, ...r.cells.map(c => (c.max ? `${c.got}/${c.max}` : '')), `${r.got}/${r.max}`, pct(r.got, r.max) ?? ''].map(q).join(';')));
    const cls = classes.find(c => c.id === st.classId);
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `journal-${(cls ? cls.name : 'class').replace(/[^\p{L}\p{N}]+/gu, '_')}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  draw();
}
