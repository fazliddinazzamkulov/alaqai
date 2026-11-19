/* Classes: class list, students pasted as a list, each student's level A/B/C. */
import { add, t } from '../i18n.js';
import { html, openModal, toast, confirmModal } from '../ui.js';
import { db } from '../data/store.js';

add({
  kk: { 'c.title': 'Сыныптар', 'c.new': '+ Сынып қосу', 'c.name': 'Сынып атауы', 'c.subject': 'Пән', 'c.students': 'Оқушылар (әр жолда бір оқушы)', 'c.save': 'Сақтау', 'c.empty': 'Сынып әлі жоқ. Сынып қосып, оқушылар тізімін қойыңыз.', 'c.addStudents': '+ Оқушылар', 'c.level': 'Деңгей', 'c.levels': 'A — базалық, B — орта, C — жоғары', 'c.del': 'Сыныпты жою', 'c.saved': 'Сақталды', 'c.n': 'оқушы' },
  ru: { 'c.title': 'Классы', 'c.new': '+ Добавить класс', 'c.name': 'Название класса', 'c.subject': 'Предмет', 'c.students': 'Ученики (по одному в строке)', 'c.save': 'Сохранить', 'c.empty': 'Классов пока нет. Добавьте класс и вставьте список учеников.', 'c.addStudents': '+ Ученики', 'c.level': 'Уровень', 'c.levels': 'A — базовый, B — средний, C — высокий', 'c.del': 'Удалить класс', 'c.saved': 'Сохранено', 'c.n': 'учеников' },
  en: { 'c.title': 'Classes', 'c.new': '+ Add class', 'c.name': 'Class name', 'c.subject': 'Subject', 'c.students': 'Students (one per line)', 'c.save': 'Save', 'c.empty': 'No classes yet. Add a class and paste the list of students.', 'c.addStudents': '+ Students', 'c.level': 'Level', 'c.levels': 'A — basic, B — medium, C — advanced', 'c.del': 'Delete class', 'c.saved': 'Saved', 'c.n': 'students' }
});

const LV = ['A', 'B', 'C'];

function studentsForm(withName) {
  return html`${withName ? html`<label class="field"><span>${t('c.name')}</span><input name="name" required placeholder="8 «А»"></label>
    <label class="field"><span>${t('c.subject')}</span><input name="subject" placeholder="Информатика"></label>` : ''}
    <label class="field"><span>${t('c.students')}</span><textarea name="students" rows="8"></textarea></label>`.toString();
}
const names = v => String(v || '').split('\n').map(s => s.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);

export async function render(main) {
  const classes = await db.classes.list();
  const students = await db.students.list();
  main.innerHTML = html`<div class="wrap">
    <div class="row" style="justify-content:space-between;align-items:center"><h1>${t('c.title')}</h1><button class="btn b" data-new-class>${t('c.new')}</button></div>
    ${classes.length ? '' : html`<div class="empty">${t('c.empty')}</div>`}
    ${classes.map(c => { const list = students.filter(s => s.classId === c.id).sort((a, b) => a.name.localeCompare(b.name, 'kk'));
      return html`<section class="card" data-class="${c.id}" style="display:flex;flex-direction:column;gap:12px">
        <div class="row" style="justify-content:space-between;align-items:center"><div><h2>${c.name}</h2><div class="sub">${[c.subject, list.length + ' ' + t('c.n')].filter(Boolean).join(' · ')} · ${t('c.levels')}</div></div>
          <div class="row"><button class="btn sm" data-add="${c.id}">${t('c.addStudents')}</button><button class="btn sm ghost" data-del="${c.id}">${t('c.del')}</button></div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">
          ${list.map(s => html`<div data-student="${s.id}" class="row" style="align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:14px">
            <span class="lv ${s.level || 'B'}">${s.level || 'B'}</span><span class="grow">${s.name}</span>
            <span class="row" style="gap:4px" role="group" aria-label="${t('c.level')}">${LV.map(l => html`<button type="button" class="btn sm${(s.level || 'B') === l ? ' k' : ''}" style="width:40px;height:36px;padding:0" data-level="${l}">${l}</button>`)}</span></div>`)}
        </div></section>`; })}
  </div>`.toString();

  main.querySelector('[data-new-class]').onclick = () => openModal({
    title: t('c.new').replace('+ ', ''), body: studentsForm(true), submitLabel: t('c.save'),
    onSubmit: async form => {
      const name = form.name.value.trim(); if (!name) return false;
      const c = await db.classes.create({ name, subject: form.subject.value.trim() });
      for (const n of names(form.students.value)) await db.students.create({ classId: c.id, name: n, level: 'B' });
      toast(t('c.saved')); render(main);
    }
  });
  main.querySelectorAll('[data-add]').forEach(b => { b.onclick = () => openModal({
    title: t('c.addStudents').replace('+ ', ''), body: studentsForm(false), submitLabel: t('c.save'),
    onSubmit: async form => { for (const n of names(form.students.value)) await db.students.create({ classId: b.dataset.add, name: n, level: 'B' }); render(main); }
  }); });
  main.querySelectorAll('[data-del]').forEach(b => { b.onclick = async () => {
    if (!(await confirmModal(t('c.del') + '?'))) return;
    await db.students.removeWhere(s => s.classId === b.dataset.del); await db.classes.remove(b.dataset.del); render(main);
  }; });
  main.querySelectorAll('[data-student]').forEach(row => row.querySelectorAll('[data-level]').forEach(btn => { btn.onclick = async () => {
    await db.students.update(row.dataset.student, { level: btn.dataset.level }); render(main);
  }; }));
}
