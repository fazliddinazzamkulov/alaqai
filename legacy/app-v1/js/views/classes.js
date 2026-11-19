/* Screen 5 · Classes — students with average grade, lesson points, attendance and trend. */
import { add, t, num } from '../i18n.js';
import { html, raw, icon, segmented, openModal, toast, confirmModal } from '../ui.js';
import { subjectField, bindSubject } from '../gen/materials.js';
import { db } from '../data/store.js';
import { loadAll, studentStats, groupStats, homeworkOnTime, periodRange, inRange, pct } from '../stats.js';
import { today, addDays, shortDate } from '../school.js';

add({
  ru: {
    'cls.title': 'Классы', 'cls.add': '+ Класс', 'cls.edit': 'Изменить',
    'cls.quality': 'Качество знаний', 'cls.success': 'Успеваемость', 'cls.attendance': 'Посещаемость', 'cls.hw': 'ДЗ сдают',
    'cls.student': 'Ученик · {n}', 'cls.avg': 'Средний балл', 'cls.points': 'Баллы за уроки', 'cls.att': 'Посещаемость', 'cls.trend': 'Динамика',
    'cls.lessons': 'Уроки класса', 'cls.all': 'Все', 'cls.noLessons': 'Уроков пока нет.', 'cls.todayL': 'сегодня',
    'cls.attention': 'Нужно внимание', 'cls.fallingNote': 'баллы падают 2 недели', 'cls.missedNote': 'пропустил(а) {n} урока за 2 недели', 'cls.allGood': 'Всё в порядке.',
    'cls.noStudents': 'В классе пока нет учеников.', 'cls.addStudents': 'Добавить учеников',
    'cls.emptyTitle': 'Добавьте первый класс', 'cls.emptyText': 'Класс — это список учеников. По нему alaqai ведёт журнал, посещаемость, группы и выбор ученика на уроке.',
    'cls.newTitle': 'Новый класс', 'cls.editTitle': 'Класс {name}', 'cls.name': 'Название', 'cls.namePh': '7 «А»', 'cls.subject': 'Предмет', 'cls.subjectPh': 'Английский язык',
    'cls.students': 'Ученики', 'cls.newStudents': 'Добавить учеников', 'cls.newStudentsHint': 'По одному в строке — можно вставить список из Excel или Kundelik',
    'cls.removeStudent': 'Убрать ученика', 'cls.delete': 'Удалить класс', 'cls.deleteConfirm': 'Удалить класс «{name}» вместе с журналом?', 'cls.saved': 'Класс сохранён', 'cls.deleted': 'Класс удалён', 'cls.nameRequired': 'Введите название класса'
  },
  kk: {
    'cls.title': 'Сыныптар', 'cls.add': '+ Сынып', 'cls.edit': 'Өзгерту',
    'cls.quality': 'Білім сапасы', 'cls.success': 'Үлгерім', 'cls.attendance': 'Қатысу', 'cls.hw': 'ҮТ тапсырады',
    'cls.student': 'Оқушы · {n}', 'cls.avg': 'Орташа балл', 'cls.points': 'Сабақ ұпайлары', 'cls.att': 'Қатысу', 'cls.trend': 'Динамика',
    'cls.lessons': 'Сынып сабақтары', 'cls.all': 'Барлығы', 'cls.noLessons': 'Әзірге сабақ жоқ.', 'cls.todayL': 'бүгін',
    'cls.attention': 'Назар аудару керек', 'cls.fallingNote': 'балы 2 апта төмендеп жатыр', 'cls.missedNote': '2 аптада {n} сабақ босатты', 'cls.allGood': 'Бәрі жақсы.',
    'cls.noStudents': 'Сыныпта әлі оқушы жоқ.', 'cls.addStudents': 'Оқушы қосу',
    'cls.emptyTitle': 'Алғашқы сыныпты қосыңыз', 'cls.emptyText': 'Сынып — оқушылар тізімі. Сол бойынша alaqai сабақта журналды, қатысуды, топтарды және оқушы таңдауды жүргізеді.',
    'cls.newTitle': 'Жаңа сынып', 'cls.editTitle': '{name} сыныбы', 'cls.name': 'Атауы', 'cls.namePh': '7 «А»', 'cls.subject': 'Пән', 'cls.subjectPh': 'Ағылшын тілі',
    'cls.students': 'Оқушылар', 'cls.newStudents': 'Оқушы қосу', 'cls.newStudentsHint': 'Әр жолға біреуден — Excel немесе Kundelik тізімін қоюға болады',
    'cls.removeStudent': 'Оқушыны алып тастау', 'cls.delete': 'Сыныпты жою', 'cls.deleteConfirm': '«{name}» сыныбын журналымен бірге жоясыз ба?', 'cls.saved': 'Сынып сақталды', 'cls.deleted': 'Сынып жойылды', 'cls.nameRequired': 'Сынып атауын енгізіңіз'
  },
  en: {
    'cls.title': 'Classes', 'cls.add': '+ Class', 'cls.edit': 'Edit',
    'cls.quality': 'Knowledge quality', 'cls.success': 'Pass rate', 'cls.attendance': 'Attendance', 'cls.hw': 'Homework handed in',
    'cls.student': 'Student · {n}', 'cls.avg': 'Average grade', 'cls.points': 'Lesson points', 'cls.att': 'Attendance', 'cls.trend': 'Trend',
    'cls.lessons': 'Class lessons', 'cls.all': 'All', 'cls.noLessons': 'No lessons yet.', 'cls.todayL': 'today',
    'cls.attention': 'Needs attention', 'cls.fallingNote': 'grades falling for 2 weeks', 'cls.missedNote': 'missed {n} lessons in 2 weeks', 'cls.allGood': 'All good.',
    'cls.noStudents': 'No students in this class yet.', 'cls.addStudents': 'Add students',
    'cls.emptyTitle': 'Add your first class', 'cls.emptyText': 'A class is a list of students. alaqai uses it for the register, attendance, groups and the student picker in class.',
    'cls.newTitle': 'New class', 'cls.editTitle': 'Class {name}', 'cls.name': 'Name', 'cls.namePh': '7A', 'cls.subject': 'Subject', 'cls.subjectPh': 'English',
    'cls.students': 'Students', 'cls.newStudents': 'Add students', 'cls.newStudentsHint': 'One per line — you can paste a list from Excel or Kundelik',
    'cls.removeStudent': 'Remove student', 'cls.delete': 'Delete class', 'cls.deleteConfirm': 'Delete class “{name}” with its register?', 'cls.saved': 'Class saved', 'cls.deleted': 'Class deleted', 'cls.nameRequired': 'Enter the class name'
  }
});

let selected = null;
const TREND = { up: '↑', down: '↓', flat: '→' };

export async function render(main, { query }) {
  const data = await loadAll();
  const { classes, students, lessons, marks, homework, submissions } = data;
  if (query.id) selected = query.id;
  if (!classes.find(c => c.id === selected)) selected = classes[0] && classes[0].id;
  const rerender = () => render(main, { query: {} });

  if (query.add) { history.replaceState(null, '', '#/classes'); classModal(null, [], rerender); }

  if (!classes.length) {
    main.innerHTML = html`
      <div class="page-head center"><h1 class="title title-md">${t('cls.title')}</h1><button type="button" class="btn-o" data-add>${t('cls.add')}</button></div>
      <div class="empty"><h2>${t('cls.emptyTitle')}</h2><p>${t('cls.emptyText')}</p><div class="row"><button type="button" class="btn-k" data-add>${t('cls.add')}</button></div></div>`;
    main.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => classModal(null, [], rerender)));
    return;
  }

  const cls = classes.find(c => c.id === selected);
  const kids = students.filter(s => s.classId === cls.id);
  const clsMarks = marks.filter(m => m.classId === cls.id);
  const r = periodRange('quarter');
  const qMarks = clsMarks.filter(m => inRange(m, r.from, r.to));
  const g = groupStats(kids, qMarks);
  const hw = homeworkOnTime(homework.filter(h => h.classId === cls.id), submissions, kids, r.from, r.to);
  const rows = kids.map(s => ({ s, st: studentStats(clsMarks.filter(m => m.studentId === s.id)) }))
    .sort((a, b) => (b.st.avg ?? -1) - (a.st.avg ?? -1));
  const day = today();
  const recentFrom = addDays(day, -14);
  const attention = [
    ...rows.filter(x => x.st.trend === 'down').map(x => ({ name: x.s.name, note: t('cls.fallingNote') })),
    ...kids.map(s => ({ s, n: clsMarks.filter(m => m.studentId === s.id && m.date > recentFrom && m.present === false).length }))
      .filter(x => x.n >= 2).map(x => ({ name: x.s.name, note: t('cls.missedNote', { n: x.n }) }))
  ].slice(0, 4);
  const clsLessons = lessons.filter(l => l.classId === cls.id && l.status !== 'planned')
    .sort((a, b) => (b.date + b.slot).localeCompare(a.date + a.slot)).filter(l => l.date <= day).slice(0, 3);

  main.innerHTML = html`
    <div class="page-head center">
      <div class="head-left">
        <h1 class="title title-md">${t('cls.title')}</h1>
        ${segmented('cls', classes.map(c => ({ id: c.id, label: c.name })), cls.id, 'lg')}
      </div>
      <div class="head-right">
        <button type="button" class="btn-o" data-edit>${icon('edit', 14)}${t('cls.edit')}</button>
        <button type="button" class="btn-o" data-add>${t('cls.add')}</button>
      </div>
    </div>
    <div class="stats c4">
      <div class="stat"><div class="stat-l">${t('cls.quality')}</div><div class="stat-v">${pct(g.quality)}</div></div>
      <div class="stat"><div class="stat-l">${t('cls.success')}</div><div class="stat-v">${pct(g.success)}</div></div>
      <div class="stat"><div class="stat-l">${t('cls.attendance')}</div><div class="stat-v">${pct(g.attendance)}</div></div>
      <div class="stat"><div class="stat-l">${t('cls.hw')}</div><div class="stat-v">${pct(hw)}</div></div>
    </div>
    <div class="cls-body">
      <div class="card table">
        <div class="t-head"><span>${t('cls.student', { n: kids.length })}</span><span>${t('cls.avg')}</span><span>${t('cls.points')}</span><span>${t('cls.att')}</span><span>${t('cls.trend')}</span></div>
        ${rows.length ? rows.map(({ s, st }) => html`<div class="t-row">
            <span class="nm">${s.name}</span><span class="b">${num(st.avg)}</span><span>${st.points}</span><span>${pct(st.attendance)}</span>
            <span class="trend ${st.trend}" aria-label="${st.trend}">${TREND[st.trend]}</span></div>`)
          : html`<div class="empty" style="border:0;padding:28px 0"><p>${t('cls.noStudents')}</p><div class="row"><button type="button" class="btn-k" data-edit>${t('cls.addStudents')}</button></div></div>`}
      </div>
      <div class="cls-side">
        <div class="card pad-s">
          <div class="card-head"><span class="card-title">${t('cls.lessons')}</span><a class="card-link" href="#/lessons?class=${cls.id}">${t('cls.all')}</a></div>
          <div>${clsLessons.length ? clsLessons.map(l => html`<a class="row-link" href="${l.status === 'done' ? '#/results/' + l.id : '#/lessons?id=' + l.id}"><b style="font-weight:600">${l.topic}</b><span class="small" style="font-size:14px">${l.date === day ? t('cls.todayL') : shortDate(l.date)}</span></a>`) : html`<p class="muted-note">${t('cls.noLessons')}</p>`}</div>
        </div>
        <div class="card pad-s">
          <div class="card-title">${t('cls.attention')}</div>
          ${attention.length ? attention.map(a => html`<div class="attn"><b>${a.name}</b><span>${a.note}</span></div>`) : html`<p class="muted-note">${t('cls.allGood')}</p>`}
        </div>
      </div>
    </div>`;

  main.querySelectorAll('[data-seg="cls"]').forEach(b => b.addEventListener('click', () => { selected = b.dataset.id; rerender(); }));
  main.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => classModal(null, [], rerender)));
  main.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => classModal(cls, kids, rerender)));
}

/** Create or edit a class together with its student list. */
function classModal(cls, kids, done) {
  const body = html`<div class="fields">
    <div class="fields two">
      <label class="field">${t('cls.name')}<input name="name" required maxlength="40" placeholder="${t('cls.namePh')}" value="${cls ? cls.name : ''}"></label>
      ${raw(subjectField(cls ? cls.subject || '' : '', t('cls.subject'), 'field'))}
    </div>
    ${kids.length ? html`<div class="field">${t('cls.students')} · ${kids.length}
      <div class="stud-list">${kids.map(s => html`<div class="stud-row" data-sid="${s.id}"><input name="s-${s.id}" value="${s.name}" maxlength="80"><button type="button" class="icon-btn" data-remove aria-label="${t('cls.removeStudent')}">${icon('close', 14)}</button></div>`)}</div></div>` : ''}
    <label class="field">${t('cls.newStudents')}<textarea name="newStudents" placeholder="Алия Нурова&#10;Айбек Тоқтаров"></textarea><span class="hint">${t('cls.newStudentsHint')}</span></label>
  </div>`;
  const removed = new Set();
  const close = openModal({
    title: cls ? t('cls.editTitle', { name: cls.name }) : t('cls.newTitle'), body: body.toString(), wide: true,
    extraButtons: cls ? html`<button type="button" class="btn-danger" data-delete>${t('cls.delete')}</button>`.toString() : '',
    onSubmit: async form => {
      const f = new FormData(form);
      const name = String(f.get('name') || '').trim();
      if (!name) { toast(t('cls.nameRequired')); return false; }
      const subject = String(f.get('subject') || '').trim();
      const row = cls ? await db.classes.update(cls.id, { name, subject }) : await db.classes.create({ name, subject });
      for (const s of kids) {
        if (removed.has(s.id)) { await db.students.remove(s.id); await db.marks.removeWhere({ studentId: s.id }); continue; }
        const nn = String(f.get('s-' + s.id) || '').trim();
        if (nn && nn !== s.name) await db.students.update(s.id, { name: nn });
      }
      const added = String(f.get('newStudents') || '').split(/\r?\n/).map(x => x.replace(/^\s*\d+[.)]\s*/, '').replace(/\t/g, ' ').trim()).filter(Boolean);
      if (added.length) await db.students.createMany(added.map(n => ({ classId: row.id, name: n })));
      selected = row.id;
      toast(t('cls.saved'));
      done();
    }
  });
  const modal = document.querySelector('.modal-back:last-child');
  bindSubject(modal);
  modal.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    const r = b.closest('.stud-row'); removed.add(r.dataset.sid); r.remove();
  }));
  const del = modal.querySelector('[data-delete]');
  if (del) del.addEventListener('click', async () => {
    if (!(await confirmModal(t('cls.deleteConfirm', { name: cls.name })))) return;
    await db.students.removeWhere({ classId: cls.id });
    await db.marks.removeWhere({ classId: cls.id });
    await db.lessons.removeWhere({ classId: cls.id });
    await db.classes.remove(cls.id);
    selected = null;
    close();
    toast(t('cls.deleted'));
    done();
  });
}
