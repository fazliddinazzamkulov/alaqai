/* The page a student opens from the homework link (#/s/<id>): choose your name,
 * then solve the online test or send photos of the notebook. No account needed. */
import { add, t, lang, setLang } from '../i18n.js';
import { html, raw, toast, downscale } from '../ui.js';
import { db } from '../data/store.js';
import { shortDate, today } from '../school.js';
import { hwStudents, saveHwMark } from '../hw.js';
import { playTest, gradeOf } from '../testlogic.js';

add({
  ru: { 'sp.hw': 'Домашнее задание', 'sp.due': 'Сдать до {d}', 'sp.late': 'Срок прошёл {d} — работу всё равно можно сдать', 'sp.who': 'Кто вы?', 'sp.pick': 'Выберите своё имя', 'sp.start': 'Начать', 'sp.change': 'Это не я',
    'sp.notFound': 'Задание не найдено', 'sp.notFoundNote': 'Проверьте ссылку или спросите учителя.', 'sp.done': 'Работа сдана', 'sp.doneNote': 'Учитель проверит её и поставит оценку.', 'sp.grade': 'Оценка: {g}', 'sp.result': 'Результат: {n} из {total}',
    'sp.photos': 'Фото тетради', 'sp.photosNote': 'Сфотографируйте решение — каждую страницу отдельно, чтобы текст было видно.', 'sp.add': 'Добавить фото', 'sp.note': 'Комментарий учителю (если нужно)', 'sp.send': 'Сдать работу', 'sp.needPhoto': 'Добавьте хотя бы одно фото', 'sp.remove': 'Убрать',
    'sp.sent': 'Готово! Работа отправлена учителю', 'sp.fail': 'Не получилось отправить — проверьте интернет и нажмите ещё раз', 'sp.offline': 'Нет связи с сервером', 'sp.offlineNote': 'Проверьте интернет и откройте ссылку ещё раз.', 'sp.teacher': 'Комментарий учителя', 'sp.noStudents': 'В классе пока нет списка учеников — попросите учителя добавить его.' },
  kk: { 'sp.hw': 'Үй тапсырмасы', 'sp.due': '{d} дейін тапсыру', 'sp.late': 'Мерзімі {d} өтті — жұмысты бәрібір тапсыруға болады', 'sp.who': 'Сіз кімсіз?', 'sp.pick': 'Өз атыңызды таңдаңыз', 'sp.start': 'Бастау', 'sp.change': 'Бұл мен емес',
    'sp.notFound': 'Тапсырма табылмады', 'sp.notFoundNote': 'Сілтемені тексеріңіз немесе мұғалімнен сұраңыз.', 'sp.done': 'Жұмыс тапсырылды', 'sp.doneNote': 'Мұғалім тексеріп, баға қояды.', 'sp.grade': 'Баға: {g}', 'sp.result': 'Нәтиже: {total} ұпайдың {n}',
    'sp.photos': 'Дәптер фотосы', 'sp.photosNote': 'Шешімді суретке түсіріңіз — әр бетті бөлек, мәтін анық көрінсін.', 'sp.add': 'Фото қосу', 'sp.note': 'Мұғалімге пікір (қажет болса)', 'sp.send': 'Жұмысты тапсыру', 'sp.needPhoto': 'Кемінде бір фото қосыңыз', 'sp.remove': 'Алып тастау',
    'sp.sent': 'Дайын! Жұмыс мұғалімге жіберілді', 'sp.fail': 'Жіберілмеді — интернетті тексеріп, қайта басыңыз', 'sp.offline': 'Сервермен байланыс жоқ', 'sp.offlineNote': 'Интернетті тексеріп, сілтемені қайта ашыңыз.', 'sp.teacher': 'Мұғалімнің пікірі', 'sp.noStudents': 'Сыныпта оқушылар тізімі әлі жоқ — мұғалімнен қосуды сұраңыз.' },
  en: { 'sp.hw': 'Homework', 'sp.due': 'Due {d}', 'sp.late': 'The deadline was {d} — you can still hand it in', 'sp.who': 'Who are you?', 'sp.pick': 'Choose your name', 'sp.start': 'Start', 'sp.change': 'Not me',
    'sp.notFound': 'Homework not found', 'sp.notFoundNote': 'Check the link or ask your teacher.', 'sp.done': 'Handed in', 'sp.doneNote': 'Your teacher will check it and give a grade.', 'sp.grade': 'Grade: {g}', 'sp.result': 'Result: {n} of {total}',
    'sp.photos': 'Notebook photos', 'sp.photosNote': 'Take a photo of your solution — each page separately, so the text is readable.', 'sp.add': 'Add a photo', 'sp.note': 'A note for the teacher (optional)', 'sp.send': 'Hand in', 'sp.needPhoto': 'Add at least one photo', 'sp.remove': 'Remove',
    'sp.sent': 'Done! Your work was sent to the teacher', 'sp.fail': 'Could not send — check the internet and press again', 'sp.offline': 'Can’t reach the server', 'sp.offlineNote': 'Check the internet and open the link again.', 'sp.teacher': 'Teacher’s comment', 'sp.noStudents': 'The class list is empty — ask your teacher to add it.' }
});

const KEY = id => 'alaqai_student_' + id;

/* The homework is in this browser (the teacher's own device) or, on a
 * student's phone, comes from the alaqai server by the link's id. */
const serverApi = () => new Promise(res => {
  let n = 0;
  const tick = () => (window.Alaqai ? res(window.Alaqai) : n++ > 40 ? res(null) : setTimeout(tick, 50));
  tick();
});

async function load(id) {
  const hw = await db.homework.get(id);
  if (hw) {
    return {
      hw, cls: hw.classId ? await db.classes.get(hw.classId) : null, students: await hwStudents(hw),
      submission: async sid => (await db.submissions.list({ homeworkId: hw.id, studentId: sid }))[0] || null,
      submit: async data => {
        const sub = await db.submissions.create(data);
        if (sub.status === 'checked') await saveHwMark(hw, sub, sub.grade);
        return sub;
      }
    };
  }
  const a = await serverApi();
  if (!a) return { hw: null };
  const base = '/api/public/hw/' + encodeURIComponent(id);
  try {
    const r = await a.api(base);
    return {
      hw: r.homework, cls: r.class, students: r.students,
      submission: async sid => (await a.api(base + '/sub/' + encodeURIComponent(sid))).submission,
      submit: async data => {
        try { return (await a.api(base + '/submit', { method: 'POST', body: data })).submission; } catch (e) {
          if (e.status === 409) return null; // already handed in (e.g. from another tab)
          throw e;
        }
      }
    };
  } catch (e) {
    return { hw: null, offline: !e.status };
  }
}

export async function render(main, { args }) {
  const src = await load(args[0]);
  const hw = src.hw;
  const shell = inner => {
    main.innerHTML = html`<div class="sp"><header class="sp-head"><span class="logo">alaqai<span class="logo-dot"></span></span>
      <span class="sp-lang">${[['kk', 'ҚАЗ'], ['ru', 'РУС'], ['en', 'ENG']].map(([id, l]) => html`<button type="button" data-lang="${id}" aria-pressed="${id === lang()}">${l}</button>`)}</span></header>
      <div class="sp-body">${raw(inner)}</div></div>`;
    main.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  };
  if (!hw || hw.status !== 'sent') {
    shell(html`<div class="empty"><h2>${t(src.offline ? 'sp.offline' : 'sp.notFound')}</h2><p>${t(src.offline ? 'sp.offlineNote' : 'sp.notFoundNote')}</p></div>`.toString());
    return;
  }
  const { cls, students } = src;
  const due = hw.dueDate ? shortDate(hw.dueDate).replace(/\.$/, '') + (hw.dueTime ? ', ' + hw.dueTime : '') : '';
  const late = hw.dueDate && hw.dueDate < today();
  const top = html`<div class="sp-card"><span class="k">${t('sp.hw')}${cls ? ' · ' + cls.name : ''}${cls && cls.subject ? ' · ' + cls.subject : ''}</span>
    <h1 class="title title-sm">${hw.title || ''}</h1>
    ${due ? html`<span class="sp-due${late ? ' late' : ''}">${late ? t('sp.late', { d: due }) : t('sp.due', { d: due })}</span>` : ''}
    ${hw.instructions ? html`<p class="sp-instr">${hw.instructions}</p>` : ''}</div>`;

  let me = null;
  try { me = sessionStorage.getItem(KEY(hw.id)); } catch (e) { /* private mode */ }
  const student = students.find(s => s.id === me);

  if (!student) {
    shell(html`${top}<form class="sp-card sp-who"><b>${t('sp.who')}</b>
      ${students.length ? html`<label class="field">${t('sp.pick')}<select name="s" required><option value=""></option>${students.map(s => html`<option value="${s.id}">${s.name}</option>`)}</select></label>
      <button class="btn-k btn-md">${t('sp.start')}</button>` : html`<p class="muted-note">${t('sp.noStudents')}</p>`}</form>`.toString());
    const f = main.querySelector('.sp-who');
    f.onsubmit = e => {
      e.preventDefault();
      if (!f.s || !f.s.value) return;
      try { sessionStorage.setItem(KEY(hw.id), f.s.value); } catch (err) { /* private mode */ }
      render(main, { args });
    };
    return;
  }

  const who = html`<div class="sp-me"><span>${student.name}</span><button type="button" class="link-btn" data-change>${t('sp.change')}</button></div>`;
  const existing = await src.submission(student.id);
  const bindChange = () => { main.querySelector('[data-change]').onclick = () => { try { sessionStorage.removeItem(KEY(hw.id)); } catch (e) { /* ignore */ } render(main, { args }); }; };

  if (existing) {
    shell(html`${top}${who}<div class="sp-card sp-done"><b class="big">${t('sp.done')}</b>
      ${existing.total ? html`<span>${t('sp.result', { n: existing.points, total: existing.total })}</span>` : ''}
      ${existing.status === 'checked' && existing.grade ? html`<span class="sp-grade">${t('sp.grade', { g: existing.grade })}</span>` : html`<span class="muted-note">${t('sp.doneNote')}</span>`}
      ${existing.status === 'checked' && existing.comment ? html`<div class="sp-comment"><span class="k">${t('sp.teacher')}</span>${existing.comment}</div>` : ''}</div>`.toString());
    bindChange();
    return;
  }

  if (hw.kind === 'online') {
    shell(html`${top}${who}<div class="sp-card"><div data-test></div></div>`.toString());
    bindChange();
    // Shuffled order is shown to the student; answers are stored in the original order.
    const n = (hw.questions || []).length;
    const order = [...Array(n).keys()];
    if (hw.shuffle) for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let sent = false;
    playTest(main.querySelector('[data-test]'), { questions: order.map(i => hw.questions[i]) }, {
      showAnswers: hw.showAnswers !== false,
      onSubmit: async res => {
        if (sent) return;
        sent = true;
        main.querySelector('[data-test] [data-submit]').disabled = true;
        main.querySelectorAll('[data-test] input, [data-test] textarea').forEach(x => { x.disabled = true; });
        const answers = [];
        order.forEach((orig, k) => { answers[orig] = res.answers[k]; });
        const auto = hw.checker !== 'self' && !res.needsReview;
        const grade = res.total ? gradeOf(res.points / res.total) : null;
        try {
          await src.submit({ homeworkId: hw.id, studentId: student.id, answers, points: res.points, total: res.total, autoGrade: grade, needsReview: !!res.needsReview,
            status: auto ? 'checked' : 'submitted', grade: auto ? grade : null, submittedAt: new Date().toISOString(), checkedAt: auto ? new Date().toISOString() : null });
          toast(t('sp.sent'));
        } catch (e) {
          sent = false;
          main.querySelector('[data-test] [data-submit]').disabled = false;
          toast(t('sp.fail'));
        }
      }
    });
    return;
  }

  // Notebook: photos of the solution.
  const photos = [];
  const draw = () => {
    shell(html`${top}${who}<form class="sp-card sp-up"><b>${t('sp.photos')}</b><p class="muted-note">${t('sp.photosNote')}</p>
      <div class="sp-photos">${photos.map((p, i) => html`<span class="ph"><img src="${p}" alt=""><button type="button" data-rm="${i}" aria-label="${t('sp.remove')}">×</button></span>`)}
        <label class="ph add"><input type="file" accept="image/*" capture="environment" multiple hidden><span>+ ${t('sp.add')}</span></label></div>
      <label class="field">${t('sp.note')}<textarea name="text" rows="2" maxlength="500"></textarea></label>
      <button class="btn-k btn-md">${t('sp.send')}</button></form>`.toString());
    bindChange();
    const f = main.querySelector('.sp-up');
    f.querySelector('input[type=file]').onchange = async e => {
      for (const file of [...e.target.files].slice(0, 6 - photos.length)) {
        try { photos.push(await downscale(file, 1400, 0.72)); } catch (err) { /* not an image */ }
      }
      draw();
    };
    f.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { photos.splice(Number(b.dataset.rm), 1); draw(); });
    f.onsubmit = async e => {
      e.preventDefault();
      if (!photos.length) { toast(t('sp.needPhoto')); return; }
      f.querySelector('.btn-k').disabled = true;
      try {
        await src.submit({ homeworkId: hw.id, studentId: student.id, photos, text: f.text.value.trim(), status: 'submitted', grade: null, submittedAt: new Date().toISOString() });
      } catch (err) {
        f.querySelector('.btn-k').disabled = false;
        toast(t('sp.fail'));
        return;
      }
      toast(t('sp.sent'));
      render(main, { args });
    };
  };
  draw();
}

