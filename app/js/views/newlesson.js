/* Screen 2 · Create lesson — one topic, and every part of the lesson is made at once. */
import { add, t, lang } from '../i18n.js';
import { html, icon, esc, toast } from '../ui.js';
import { db } from '../data/store.js';
import { fileToPart } from '../ai.js';
import { weeklyUsage } from '../plans.js';
import { materialLangs, defaultMaterialLang, RATIOS, subjects } from '../gen/materials.js';
import { startLesson, blankLesson, currentJob, onJob, retry, clearJob, ROWS } from '../gen/lesson.js';

add({
  ru: {
    'new.title': 'Создать урок', 'new.sub': 'Одна тема — и всё для урока готово сразу',
    'new.subject': 'Предмет', 'new.class': 'Класс', 'new.noClass': 'Без класса', 'new.topic': 'Тема урока', 'new.topicPh': 'Например: Past Simple — правильные и неправильные глаголы',
    'new.lang': 'Язык материалов', 'new.ratio': 'Формат', 'new.upload': 'Добавить материал из учебника (необязательно)', 'new.uploadHint': 'Фото страниц или PDF, до 3 файлов', 'new.fileTooBig': 'Файл больше 10 МБ: {name}',
    'new.what': 'Что создать',
    'new.p.ksp': 'КСП', 'new.h.ksp': 'Word, новый формат', 'new.p.slides': 'Презентация', 'new.h.slides': '10 слайдов', 'new.p.games': 'Игры и викторина', 'new.h.games': '2 игры',
    'new.p.test': 'Тест', 'new.h.test': '8 вопросов', 'new.p.homework': 'Домашнее задание', 'new.h.homework': 'онлайн-тест', 'new.p.analysis': 'Анализ урока', 'new.h.analysis': 'после урока',
    'new.create': 'Создать урок', 'new.manual': 'Создать без ИИ — заполню сам', 'new.usage': 'Это {n}-й из {max} уроков с ИИ на этой неделе', 'new.unlimited': 'Уроки с ИИ — без ограничений',
    'new.topicRequired': 'Напишите тему урока', 'new.nothing': 'Выберите, что создать', 'new.busy': 'Урок уже создаётся — дождитесь окончания',
    'new.making': 'Создаётся', 'new.willMake': 'Будет создано', 'new.ready': 'Урок готов', 'new.topicPlaceholder': 'Тема урока',
    'new.r.ksp': 'КСП', 'new.d.ksp': 'Цели, этапы урока, ресурсы и ссылки', 'new.r.slides': 'Презентация', 'new.d.slides': '10 слайдов · {ratio} · фото и примеры',
    'new.r.games': 'Игры', 'new.d.games': '«Совпадения» и «Мемори»', 'new.r.quiz': 'Викторина', 'new.d.quiz': '5 вопросов для всего класса',
    'new.r.testhw': 'Тест и домашнее задание', 'new.d.testhw': '8 вопросов · ссылка для учеников', 'new.r.analysis': 'Анализ урока', 'new.d.analysis': 'Соберётся сам по баллам и ответам',
    'new.s.done': 'Готово', 'new.s.run': 'Создаётся…', 'new.s.wait': 'В очереди', 'new.s.after': 'После урока', 'new.s.error': 'Ошибка', 'new.s.off': 'Не выбрано', 'new.retry': 'Повторить',
    'new.note': 'Урок появится в «Уроках» одним набором. Каждая часть также сохранится в своём разделе: презентации, тесты, КСП, ДЗ.',
    'new.open': 'Открыть урок', 'new.again': 'Создать ещё', 'new.doneToast': 'Урок готов', 'new.manualToast': 'Урок создан — заполните части',
    'new.fatal': 'ИИ не смог создать урок', 'new.login': 'Войти'
  },
  kk: {
    'new.title': 'Сабақ құру', 'new.sub': 'Бір тақырып — сабаққа қажеттінің бәрі бірден дайын',
    'new.subject': 'Пән', 'new.class': 'Сынып', 'new.noClass': 'Сыныпсыз', 'new.topic': 'Сабақ тақырыбы', 'new.topicPh': 'Мысалы: Past Simple — дұрыс және бұрыс етістіктер',
    'new.lang': 'Материалдар тілі', 'new.ratio': 'Формат', 'new.upload': 'Оқулықтан материал қосу (міндетті емес)', 'new.uploadHint': 'Бет суреттері немесе PDF, 3 файлға дейін', 'new.fileTooBig': 'Файл 10 МБ-тан үлкен: {name}',
    'new.what': 'Не құру керек',
    'new.p.ksp': 'ҚМЖ', 'new.h.ksp': 'Word, жаңа формат', 'new.p.slides': 'Презентация', 'new.h.slides': '10 слайд', 'new.p.games': 'Ойындар мен викторина', 'new.h.games': '2 ойын',
    'new.p.test': 'Тест', 'new.h.test': '8 сұрақ', 'new.p.homework': 'Үй тапсырмасы', 'new.h.homework': 'онлайн-тест', 'new.p.analysis': 'Сабақ талдауы', 'new.h.analysis': 'сабақтан кейін',
    'new.create': 'Сабақ құру', 'new.manual': 'ЖИ-сіз құру — өзім толтырамын', 'new.usage': 'Бұл аптадағы {max} ЖИ-сабақтың {n}-шісі', 'new.unlimited': 'ЖИ-сабақтар — шектеусіз',
    'new.topicRequired': 'Сабақ тақырыбын жазыңыз', 'new.nothing': 'Не құру керегін таңдаңыз', 'new.busy': 'Сабақ құрылып жатыр — аяқталуын күтіңіз',
    'new.making': 'Құрылып жатыр', 'new.willMake': 'Не құрылады', 'new.ready': 'Сабақ дайын', 'new.topicPlaceholder': 'Сабақ тақырыбы',
    'new.r.ksp': 'ҚМЖ', 'new.d.ksp': 'Мақсаттар, сабақ кезеңдері, ресурстар мен сілтемелер', 'new.r.slides': 'Презентация', 'new.d.slides': '10 слайд · {ratio} · фото және мысалдар',
    'new.r.games': 'Ойындар', 'new.d.games': '«Сәйкестендіру» және «Мемори»', 'new.r.quiz': 'Викторина', 'new.d.quiz': 'Бүкіл сыныпқа 5 сұрақ',
    'new.r.testhw': 'Тест және үй тапсырмасы', 'new.d.testhw': '8 сұрақ · оқушыларға сілтеме', 'new.r.analysis': 'Сабақ талдауы', 'new.d.analysis': 'Балдар мен жауаптар бойынша өзі жиналады',
    'new.s.done': 'Дайын', 'new.s.run': 'Құрылып жатыр…', 'new.s.wait': 'Кезекте', 'new.s.after': 'Сабақтан кейін', 'new.s.error': 'Қате', 'new.s.off': 'Таңдалмаған', 'new.retry': 'Қайталау',
    'new.note': 'Сабақ «Сабақтар» бөлімінде бір жиынтық болып шығады. Әр бөлігі өз бөлімінде де сақталады: презентациялар, тесттер, ҚМЖ, ҮТ.',
    'new.open': 'Сабақты ашу', 'new.again': 'Тағы құру', 'new.doneToast': 'Сабақ дайын', 'new.manualToast': 'Сабақ құрылды — бөліктерін толтырыңыз',
    'new.fatal': 'ЖИ сабақты құра алмады', 'new.login': 'Кіру'
  },
  en: {
    'new.title': 'Create lesson', 'new.sub': 'One topic — and everything for the lesson is ready at once',
    'new.subject': 'Subject', 'new.class': 'Class', 'new.noClass': 'No class', 'new.topic': 'Lesson topic', 'new.topicPh': 'For example: Past Simple — regular and irregular verbs',
    'new.lang': 'Language of materials', 'new.ratio': 'Format', 'new.upload': 'Add material from the textbook (optional)', 'new.uploadHint': 'Page photos or PDF, up to 3 files', 'new.fileTooBig': 'File is over 10 MB: {name}',
    'new.what': 'What to create',
    'new.p.ksp': 'Lesson plan', 'new.h.ksp': 'Word, official format', 'new.p.slides': 'Slides', 'new.h.slides': '10 slides', 'new.p.games': 'Games and quiz', 'new.h.games': '2 games',
    'new.p.test': 'Test', 'new.h.test': '8 questions', 'new.p.homework': 'Homework', 'new.h.homework': 'online test', 'new.p.analysis': 'Lesson analysis', 'new.h.analysis': 'after class',
    'new.create': 'Create lesson', 'new.manual': 'Create without AI — I’ll fill it in', 'new.usage': 'This is AI lesson {n} of {max} this week', 'new.unlimited': 'AI lessons — unlimited',
    'new.topicRequired': 'Type the lesson topic', 'new.nothing': 'Choose what to create', 'new.busy': 'A lesson is being created — wait until it finishes',
    'new.making': 'Creating', 'new.willMake': 'Will be created', 'new.ready': 'Lesson ready', 'new.topicPlaceholder': 'Lesson topic',
    'new.r.ksp': 'Lesson plan', 'new.d.ksp': 'Goals, lesson stages, resources and links', 'new.r.slides': 'Slides', 'new.d.slides': '10 slides · {ratio} · photos and examples',
    'new.r.games': 'Games', 'new.d.games': '“Matching” and “Memory”', 'new.r.quiz': 'Quiz', 'new.d.quiz': '5 questions for the whole class',
    'new.r.testhw': 'Test and homework', 'new.d.testhw': '8 questions · a link for students', 'new.r.analysis': 'Lesson analysis', 'new.d.analysis': 'Builds itself from points and answers',
    'new.s.done': 'Done', 'new.s.run': 'Creating…', 'new.s.wait': 'Queued', 'new.s.after': 'After class', 'new.s.error': 'Error', 'new.s.off': 'Not selected', 'new.retry': 'Retry',
    'new.note': 'The lesson appears in “Lessons” as one set. Each part is also saved in its own section: slides, tests, lesson plans, homework.',
    'new.open': 'Open lesson', 'new.again': 'Create another', 'new.doneToast': 'Lesson ready', 'new.manualToast': 'Lesson created — fill in the parts',
    'new.fatal': 'The AI could not create the lesson', 'new.login': 'Sign in'
  }
});

const PART_IDS = ['ksp', 'slides', 'games', 'test', 'homework', 'analysis'];
let form = null; // what the teacher typed, kept while moving around the platform

export async function render(main, { query }) {
  const [classes, usage] = await Promise.all([db.classes.list(), weeklyUsage()]);
  classes.sort((a, b) => a.name.localeCompare(b.name, 'ru', { numeric: true }));
  const pre = query.lesson ? await db.lessons.get(query.lesson) : null;
  if (!form || query.lesson || query.topic) {
    const cls = pre ? classes.find(c => c.id === pre.classId) : classes[0];
    const subject = (pre && pre.subject) || (cls && cls.subject) || '';
    form = {
      subject, classId: cls ? cls.id : '', topic: (pre && pre.topic) || query.topic || '', lang: defaultMaterialLang(subject, lang()), ratio: '16:9',
      parts: Object.fromEntries(PART_IDS.map(id => [id, true])), files: [], lessonId: pre ? pre.id : null
    };
  }

  main.innerHTML = html`
    <div><h1 class="title" style="margin-top:0">${t('new.title')}</h1><div class="lead">${t('new.sub')}</div></div>
    <div class="new-body">
      <form class="new-form" novalidate>
        <div class="fields two">
          <label class="field muted">${t('new.subject')}<input name="subject" list="subjects" value="${form.subject}" maxlength="60" autocomplete="off"></label>
          <label class="field muted">${t('new.class')}<select name="classId"><option value="">${t('new.noClass')}</option>${classes.map(c => html`<option value="${c.id}" ${c.id === form.classId ? 'selected' : ''}>${c.name}</option>`)}</select></label>
        </div>
        <datalist id="subjects">${subjects().map(s => html`<option value="${s}">`)}</datalist>
        <label class="field muted">${t('new.topic')}<input name="topic" value="${form.topic}" maxlength="160" placeholder="${t('new.topicPh')}" autocomplete="off"></label>
        <div class="new-row">
          <label class="field muted grow">${t('new.lang')}<select name="lang">${materialLangs().map(l => html`<option value="${l.id}" ${l.id === form.lang ? 'selected' : ''}>${l.label}</option>`)}</select></label>
          <label class="field muted" style="width:110px">${t('new.ratio')}<select name="ratio">${RATIOS.map(r => html`<option ${r === form.ratio ? 'selected' : ''}>${r}</option>`)}</select></label>
        </div>
        <label class="upload">
          <input type="file" name="files" accept="image/*,application/pdf" multiple hidden>
          ${icon('M12 16V4M7 9l5-5 5 5M4 16v4h16v-4', 18)}
          <span class="grow">${form.files.length ? form.files.map(f => f.name).join(', ') : t('new.upload')}</span>
          ${form.files.length ? html`<button type="button" class="link-btn" data-clear-files aria-label="×">${icon('close', 14)}</button>` : ''}
        </label>
        <div class="what">${t('new.what')}</div>
        <div class="checks">
          ${PART_IDS.map(id => html`<label class="check-row"><input type="checkbox" name="p-${id}" ${form.parts[id] ? 'checked' : ''}><span class="box">${icon('check', 12)}</span><span class="grow">${t('new.p.' + id)}</span><span class="small">${t('new.h.' + id)}</span></label>`)}
        </div>
        <div class="grow"></div>
        <button type="submit" class="btn-k btn-lg">${t('new.create')}</button>
        <div class="small t-center">${usage.max == null ? t('new.unlimited') : usage.max > 0 ? t('new.usage', { n: usage.used + 1, max: usage.max }) : ''}</div>
        <button type="button" class="link-btn t-center" data-manual>${t('new.manual')}</button>
      </form>
      <section class="card new-progress" aria-live="polite"></section>
    </div>`;

  const f = main.querySelector('form');
  const read = () => {
    const d = new FormData(f);
    form.subject = String(d.get('subject') || '').trim();
    form.classId = String(d.get('classId') || '');
    form.topic = String(d.get('topic') || '').trim();
    form.lang = String(d.get('lang'));
    form.ratio = String(d.get('ratio'));
    PART_IDS.forEach(id => { form.parts[id] = d.get('p-' + id) === 'on'; });
  };
  f.addEventListener('input', () => { read(); drawProgress(main, classes); });
  f.addEventListener('change', e => {
    if (e.target.name === 'classId') {
      const c = classes.find(x => x.id === e.target.value);
      if (c && c.subject && !form.subject) { f.subject.value = c.subject; }
    }
    read(); drawProgress(main, classes);
  });
  f.files.addEventListener('change', async () => {
    const list = [...f.files.files].slice(0, 3);
    const big = list.find(x => x.size > 10 * 1024 * 1024);
    if (big) { toast(t('new.fileTooBig', { name: big.name })); return; }
    form.files = await Promise.all(list.map(fileToPart));
    render(main, { query: {} });
  });
  const clearFiles = main.querySelector('[data-clear-files]');
  if (clearFiles) clearFiles.addEventListener('click', e => { e.preventDefault(); form.files = []; render(main, { query: {} }); });

  const validate = () => {
    read();
    if (!form.topic) { toast(t('new.topicRequired')); f.topic.focus(); return false; }
    if (!PART_IDS.some(id => id !== 'analysis' && form.parts[id])) { toast(t('new.nothing')); return false; }
    const j = currentJob();
    if (j && !j.done) { toast(t('new.busy')); return false; }
    return true;
  };
  const opts = () => ({ ...form, className: (classes.find(c => c.id === form.classId) || {}).name || '', parts: { ...form.parts } });
  f.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    await startLesson(opts());
    form = { ...form, topic: '', files: [], lessonId: null };
    f.topic.value = '';
  });
  main.querySelector('[data-manual]').addEventListener('click', async () => {
    if (!validate()) return;
    const id = await blankLesson(opts());
    form = null;
    toast(t('new.manualToast'));
    location.hash = '#/lessons?id=' + id;
  });

  drawProgress(main, classes);
  const off = onJob(() => drawProgress(main, classes));
  return off;
}

/* ---------- right panel: what is being made ---------- */

const DOT = { done: 'check', run: '', wait: '', after: '', error: 'close', off: '' };

function drawProgress(main, classes) {
  const el = main.querySelector('.new-progress');
  if (!el) return;
  const j = currentJob();
  const src = j ? j.opts : { ...form, className: (classes.find(c => c.id === form.classId) || {}).name || '' };
  const rows = j ? j.rows : Object.fromEntries(ROWS.map(id => {
    const on = id === 'quiz' ? form.parts.games : id === 'testhw' ? form.parts.test || form.parts.homework : form.parts[id];
    return [id, { state: on ? (id === 'analysis' ? 'after' : 'wait') : 'off' }];
  }));
  const active = ROWS.filter(id => id !== 'analysis' && rows[id].state !== 'off');
  const done = active.filter(id => rows[id].state === 'done').length;
  const allDone = j && j.done && !j.fatal;
  const head = [src.topic || t('new.topicPlaceholder'), src.className, src.subject].filter(Boolean).join(' · ');

  const detail = id => {
    const r = rows[id];
    if (id === 'games' && r.names && r.names.length) return r.names.map(n => `«${n}»`).join(' · ');
    if (id === 'slides') return t('new.d.slides', { ratio: src.ratio || '16:9' }).replace('10', r.count || 10);
    return t('new.d.' + id);
  };

  el.innerHTML = html`
    <div class="card-head" style="align-items:center">
      <div class="grow"><div class="small" style="font-size:13px">${allDone ? t('new.ready') : j ? t('new.making') : t('new.willMake')}</div><div class="np-title">${head}</div></div>
      ${j ? html`<span class="np-count">${done} / ${active.length}</span>` : ''}
    </div>
    ${j ? html`<div class="np-bar"><i style="width:${active.length ? Math.round(done / active.length * 100) : 0}%"></i></div>` : ''}
    <div class="np-rows">
      ${ROWS.map(id => {
        const r = rows[id];
        return html`<div class="np-row ${r.state}">
          <span class="np-dot ${r.state}">${DOT[r.state] ? icon(DOT[r.state], 14) : ''}</span>
          <span class="grow"><b>${t('new.r.' + id)}</b><span>${r.state === 'error' && r.message ? r.message : detail(id)}</span></span>
          ${r.state === 'error' && j && j.done && !j.fatal ? html`<button type="button" class="btn-o btn-sm" data-retry="${id}">${t('new.retry')}</button>` : html`<span class="np-state ${r.state}">${t('new.s.' + r.state)}</span>`}
        </div>`;
      })}
    </div>
    <div class="grow"></div>
    ${j && j.done && j.fatal ? html`<div class="np-fatal"><b>${t('new.fatal')}</b><span>${j.fatal.message}</span>
      <div class="row">${j.fatal.code === 'login' ? html`<a class="btn-k" href="#/login">${t('new.login')}</a>` : ''}<button type="button" class="btn-o" data-manual-after>${t('new.manual')}</button></div></div>` : ''}
    <div class="np-note">
      <span class="grow">${t('new.note')}</span>
      ${allDone ? html`<button type="button" class="btn-o" data-again>${t('new.again')}</button>` : ''}
      ${j && !j.fatal ? html`<a class="btn-${allDone ? 'k' : 'o'}" href="#/lessons?id=${j.lessonId}">${t('new.open')}</a>` : ''}
    </div>`;

  el.querySelectorAll('[data-retry]').forEach(b => b.addEventListener('click', () => retry(b.dataset.retry)));
  const again = el.querySelector('[data-again]');
  if (again) again.addEventListener('click', () => { clearJob(); });
  const manual = el.querySelector('[data-manual-after]');
  if (manual) manual.addEventListener('click', async () => {
    const o = j.opts; clearJob();
    const id = await blankLesson(o);
    toast(t('new.manualToast'));
    location.hash = '#/lessons?id=' + id;
  });
  if (allDone && !j.toasted) { j.toasted = true; toast(t('new.doneToast')); }
}
