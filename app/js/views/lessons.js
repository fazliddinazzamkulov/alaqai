/* Screen 3 · Lessons — the list of lessons and one ready lesson as a set of parts. */
import { add, t } from '../i18n.js';
import { html, icon, segmented, openModal, toast } from '../ui.js';
import { db } from '../data/store.js';
import { shortDate, DEFAULT_BELLS, today } from '../school.js';
import { onJob } from '../gen/lesson.js';

add({
  ru: {
    'les.title': 'Уроки', 'les.all': 'Все', 'les.ready': 'Готовы', 'les.done': 'Проведены', 'les.create': 'Создать урок',
    'les.st.ready': 'Готов', 'les.st.done': 'Проведён', 'les.st.planned': 'Не подготовлен', 'les.st.generating': 'Создаётся…',
    'les.noDate': 'не в расписании', 'les.slot': '{n} урок', 'les.emptyTitle': 'Уроков пока нет', 'les.emptyText': 'Напишите тему — alaqai соберёт КСП, презентацию, игры, тест и домашнее задание одним набором.',
    'les.notFound': 'Урок не найден', 'les.back': 'Все уроки', 'les.share': 'Поделиться', 'les.start': 'Начать урок',
    'les.c.ksp': 'КСП', 'les.c.slides': 'Презентация', 'les.c.games': 'Игры и викторина', 'les.c.test': 'Тест', 'les.c.hw': 'Домашнее задание', 'les.c.analysis': 'Анализ урока',
    'les.kspTitle': 'Краткосрочный план', 'les.kspDesc': 'Цели, {n} этапа урока, ресурсы со ссылками на слайды, игры и ДЗ', 'les.word': 'Word ↓',
    'les.slides': '{n} слайдов · {ratio}', 'les.quiz': 'Викторина', 'les.quizDesc': '{n} вопросов для класса', 'les.testTitle': '{n} вопросов · ~{m} мин', 'les.testDesc': 'Можно провести в классе или отправить как ДЗ',
    'les.hwOnline': 'Онлайн-тест', 'les.hwNotebook': 'Задание в тетради', 'les.hwDue': 'до {d}', 'les.hwDesc': 'Отправится классу после урока, проверка автоматическая', 'les.hwDescNb': 'Ученики присылают фото, ИИ помогает проверить',
    'les.analysisSoon': 'Появится после урока', 'les.analysisDesc': 'Посещаемость, баллы, ответы и советы на следующий урок', 'les.analysisReady': 'Итоги урока готовы',
    'les.open': 'Открыть →', 'les.missing': 'Не создано', 'les.makeIt': 'Создать →', 'les.empty': 'Пусто — заполните вручную',
    'les.plan': 'План урока', 'les.min': '{n} мин', 'les.noPlan': 'План появится вместе с КСП.',
    'les.schedule': 'Поставить в расписание', 'les.delete': 'Удалить урок', 'les.deleteConfirm': 'Удалить урок «{name}» вместе с его материалами?', 'les.deleted': 'Урок удалён', 'les.scheduled': 'Урок в расписании',
    'les.date': 'Дата', 'les.lessonNo': 'Урок', 'les.busy': 'У класса в это время уже есть урок', 'les.generating': 'Урок ещё создаётся — части появятся здесь по мере готовности.'
  },
  kk: {
    'les.title': 'Сабақтар', 'les.all': 'Барлығы', 'les.ready': 'Дайын', 'les.done': 'Өткізілген', 'les.create': 'Сабақ құру',
    'les.st.ready': 'Дайын', 'les.st.done': 'Өткізілді', 'les.st.planned': 'Дайындалмаған', 'les.st.generating': 'Құрылып жатыр…',
    'les.noDate': 'кестеде жоқ', 'les.slot': '{n}-сабақ', 'les.emptyTitle': 'Әзірге сабақ жоқ', 'les.emptyText': 'Тақырыпты жазыңыз — alaqai ҚМЖ, презентация, ойындар, тест және үй тапсырмасын бір жиынтықпен дайындайды.',
    'les.notFound': 'Сабақ табылмады', 'les.back': 'Барлық сабақтар', 'les.share': 'Бөлісу', 'les.start': 'Сабақты бастау',
    'les.c.ksp': 'ҚМЖ', 'les.c.slides': 'Презентация', 'les.c.games': 'Ойындар мен викторина', 'les.c.test': 'Тест', 'les.c.hw': 'Үй тапсырмасы', 'les.c.analysis': 'Сабақ талдауы',
    'les.kspTitle': 'Қысқа мерзімді жоспар', 'les.kspDesc': 'Мақсаттар, {n} кезең, слайдтарға, ойындарға және ҮТ-ға сілтемелер', 'les.word': 'Word ↓',
    'les.slides': '{n} слайд · {ratio}', 'les.quiz': 'Викторина', 'les.quizDesc': 'Сыныпқа {n} сұрақ', 'les.testTitle': '{n} сұрақ · ~{m} мин', 'les.testDesc': 'Сыныпта өткізуге немесе ҮТ ретінде жіберуге болады',
    'les.hwOnline': 'Онлайн-тест', 'les.hwNotebook': 'Дәптердегі тапсырма', 'les.hwDue': '{d} дейін', 'les.hwDesc': 'Сабақтан кейін сыныпқа жіберіледі, тексеру автоматты', 'les.hwDescNb': 'Оқушылар фото жібереді, ЖИ тексеруге көмектеседі',
    'les.analysisSoon': 'Сабақтан кейін шығады', 'les.analysisDesc': 'Қатысу, балдар, жауаптар және келесі сабаққа кеңес', 'les.analysisReady': 'Сабақ қорытындысы дайын',
    'les.open': 'Ашу →', 'les.missing': 'Құрылмаған', 'les.makeIt': 'Құру →', 'les.empty': 'Бос — қолмен толтырыңыз',
    'les.plan': 'Сабақ жоспары', 'les.min': '{n} мин', 'les.noPlan': 'Жоспар ҚМЖ-мен бірге шығады.',
    'les.schedule': 'Кестеге қою', 'les.delete': 'Сабақты жою', 'les.deleteConfirm': '«{name}» сабағын материалдарымен бірге жоясыз ба?', 'les.deleted': 'Сабақ жойылды', 'les.scheduled': 'Сабақ кестеде',
    'les.date': 'Күні', 'les.lessonNo': 'Сабақ', 'les.busy': 'Сыныптың бұл уақытта сабағы бар', 'les.generating': 'Сабақ әлі құрылып жатыр — бөліктер дайын болған сайын осында шығады.'
  },
  en: {
    'les.title': 'Lessons', 'les.all': 'All', 'les.ready': 'Ready', 'les.done': 'Taught', 'les.create': 'Create lesson',
    'les.st.ready': 'Ready', 'les.st.done': 'Taught', 'les.st.planned': 'Not prepared', 'les.st.generating': 'Creating…',
    'les.noDate': 'not scheduled', 'les.slot': 'lesson {n}', 'les.emptyTitle': 'No lessons yet', 'les.emptyText': 'Type a topic — alaqai builds the lesson plan, slides, games, a test and homework as one set.',
    'les.notFound': 'Lesson not found', 'les.back': 'All lessons', 'les.share': 'Share', 'les.start': 'Start lesson',
    'les.c.ksp': 'Lesson plan', 'les.c.slides': 'Slides', 'les.c.games': 'Games and quiz', 'les.c.test': 'Test', 'les.c.hw': 'Homework', 'les.c.analysis': 'Lesson analysis',
    'les.kspTitle': 'Short-term plan', 'les.kspDesc': 'Goals, {n} lesson stages, resources linked to slides, games and homework', 'les.word': 'Word ↓',
    'les.slides': '{n} slides · {ratio}', 'les.quiz': 'Quiz', 'les.quizDesc': '{n} questions for the class', 'les.testTitle': '{n} questions · ~{m} min', 'les.testDesc': 'Run it in class or send it as homework',
    'les.hwOnline': 'Online test', 'les.hwNotebook': 'Notebook task', 'les.hwDue': 'due {d}', 'les.hwDesc': 'Goes to the class after the lesson, checked automatically', 'les.hwDescNb': 'Students send a photo, AI helps you check',
    'les.analysisSoon': 'Appears after class', 'les.analysisDesc': 'Attendance, points, answers and tips for the next lesson', 'les.analysisReady': 'Lesson results are ready',
    'les.open': 'Open →', 'les.missing': 'Not created', 'les.makeIt': 'Create →', 'les.empty': 'Empty — fill it in by hand',
    'les.plan': 'Lesson plan', 'les.min': '{n} min', 'les.noPlan': 'The plan appears with the lesson plan document.',
    'les.schedule': 'Add to timetable', 'les.delete': 'Delete lesson', 'les.deleteConfirm': 'Delete “{name}” with all its materials?', 'les.deleted': 'Lesson deleted', 'les.scheduled': 'Lesson scheduled',
    'les.date': 'Date', 'les.lessonNo': 'Lesson', 'les.busy': 'This class already has a lesson at that time', 'les.generating': 'The lesson is still being created — parts appear here as they are ready.'
  }
});

let filter = 'all';

export async function render(main, { query }) {
  if (query.id) {
    await detail(main, query.id);
    // While the lesson is still being generated, redraw as parts arrive.
    return onJob(j => { if (j && j.lessonId === query.id) detail(main, query.id); });
  }
  const [lessons, classes] = await Promise.all([db.lessons.list(), db.classes.list()]);
  const clsName = new Map(classes.map(c => [c.id, c.name]));
  let list = lessons.filter(l => l.status !== 'planned' || l.topic);
  if (query.class) list = list.filter(l => l.classId === query.class);
  if (filter !== 'all') list = list.filter(l => l.status === filter);
  list.sort((a, b) => (b.date || b.createdAt).localeCompare(a.date || a.createdAt) || (b.slot || 0) - (a.slot || 0));

  main.innerHTML = html`
    <div class="page-head center">
      <div class="head-left">
        <h1 class="title title-md">${t('les.title')}</h1>
        ${segmented('filter', [{ id: 'all', label: t('les.all') }, { id: 'ready', label: t('les.ready') }, { id: 'done', label: t('les.done') }], filter)}
        ${query.class ? html`<a class="chip-x" href="#/lessons">${clsName.get(query.class) || ''} ${icon('close', 12)}</a>` : ''}
      </div>
      <a class="btn-k" href="#/new">${icon('plus', 14)}${t('les.create')}</a>
    </div>
    ${list.length ? html`<div class="les-grid">${list.map(l => html`
      <a class="card les-card" href="#/lessons?id=${l.id}">
        <span class="les-meta">${[clsName.get(l.classId), l.date ? shortDate(l.date) : t('les.noDate'), l.slot ? t('les.slot', { n: l.slot }) : ''].filter(Boolean).join(' · ')}</span>
        <b>${l.topic || l.subject || '—'}</b>
        <span class="grow"></span>
        <span class="les-foot"><span class="pill ${l.status}">${t('les.st.' + l.status)}</span>${partTags(l)}</span>
      </a>`)}</div>`
    : html`<div class="empty"><h2>${t('les.emptyTitle')}</h2><p>${t('les.emptyText')}</p><div class="row"><a class="btn-k" href="#/new">${t('les.create')}</a></div></div>`}`;

  main.querySelectorAll('[data-seg="filter"]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.id; render(main, { query }); }));
}

function partTags(l) {
  const p = l.parts || {};
  const tags = [p.kspId && t('les.c.ksp'), p.presentationId && t('les.c.slides'), ((p.gameIds && p.gameIds.length) || p.quizId) && t('les.quiz'), p.testId && t('les.c.test'), p.homeworkId && t('les.c.hw')].filter(Boolean);
  return html`<span class="les-tags">${tags.join(' · ')}</span>`;
}

/* ---------- one lesson ---------- */

async function detail(main, id) {
  const lesson = await db.lessons.get(id);
  if (!lesson) {
    main.innerHTML = html`<div class="empty"><h2>${t('les.notFound')}</h2><div class="row"><a class="btn-k" href="#/lessons">${t('les.back')}</a></div></div>`;
    return;
  }
  const p = lesson.parts || {};
  const [cls, ksp, deck, games, quiz, test, hw, settings] = await Promise.all([
    lesson.classId ? db.classes.get(lesson.classId) : null,
    p.kspId ? db.ksp.get(p.kspId) : null,
    p.presentationId ? db.presentations.get(p.presentationId) : null,
    Promise.all((p.gameIds || []).map(g => db.games.get(g))),
    p.quizId ? db.tests.get(p.quizId) : null,
    p.testId ? db.tests.get(p.testId) : null,
    p.homeworkId ? db.homework.get(p.homeworkId) : null,
    db.settings.get()
  ]);
  const bells = settings.bells || DEFAULT_BELLS;
  const when = lesson.date ? `${shortDate(lesson.date).replace(/\.$/, '')}, ${t('les.slot', { n: lesson.slot })}` : t('les.noDate');
  const meta = [lesson.subject, cls && cls.name, when].filter(Boolean).join(' · ');
  const regen = `#/new?lesson=${lesson.id}`;
  const generating = lesson.status === 'generating';

  const card = (label, body, href, extra = '', cls2 = '') => html`<a class="card part-card ${cls2}" href="${href}">
    <span class="pc-top"><span class="pc-label">${label}</span>${extra}</span>${body}</a>`;
  const missing = label => card(label, html`<span class="pc-title">${t('les.missing')}</span><span class="grow"></span><span class="pc-go">${t('les.makeIt')}</span>`, regen, '', 'dashed');
  const open = html`<span class="pc-go">${t('les.open')}</span>`;
  const gamesList = games.filter(Boolean);

  const cards = [
    ksp ? card(t('les.c.ksp'), html`<span class="pc-title">${t('les.kspTitle')}</span><span class="pc-desc">${t('les.kspDesc', { n: (ksp.stages || []).length })}</span><span class="grow"></span>${open}`, `#/ksp?id=${ksp.id}`, html`<span class="pc-extra">${t('les.word')}</span>`) : missing(t('les.c.ksp')),
    deck ? card(t('les.c.slides'), html`<span class="thumbs"><i class="dark"></i><i></i><i></i></span><span class="pc-title">${t('les.slides', { n: deck.slides.length, ratio: deck.ratio || '16:9' })}</span><span class="grow"></span>${open}`, `#/editor/${deck.id}`) : missing(t('les.c.slides')),
    gamesList.length || quiz ? card(t('les.c.games'), html`<span class="pc-title">${[...gamesList.map(g => g.title), quiz && t('les.quiz')].filter(Boolean).join(' · ')}</span><span class="pc-desc">${quiz && quiz.questions.length ? t('les.quizDesc', { n: quiz.questions.length }) : t('les.empty')}</span><span class="grow"></span>${open}`, `#/tests?tab=games&lesson=${lesson.id}`, html`<span class="pro">PRO</span>`) : missing(t('les.c.games')),
    test ? card(t('les.c.test'), html`<span class="pc-title">${test.questions.length ? t('les.testTitle', { n: test.questions.length, m: Math.max(3, Math.round(test.questions.length * 1.25)) }) : t('les.empty')}</span><span class="pc-desc">${t('les.testDesc')}</span><span class="grow"></span>${open}`, `#/tests?id=${test.id}`) : missing(t('les.c.test')),
    hw ? card(t('les.c.hw'), html`<span class="pc-title">${hw.kind === 'online' ? t('les.hwOnline') : t('les.hwNotebook')}${hw.dueDate ? ' · ' + t('les.hwDue', { d: shortDate(hw.dueDate) }) : ''}</span><span class="pc-desc">${hw.kind === 'online' ? t('les.hwDesc') : t('les.hwDescNb')}</span><span class="grow"></span>${open}`, `#/homework?id=${hw.id}`) : missing(t('les.c.hw')),
    lesson.status === 'done'
      ? card(t('les.c.analysis'), html`<span class="pc-title">${t('les.analysisReady')}</span><span class="pc-desc">${t('les.analysisDesc')}</span><span class="grow"></span>${open}`, `#/results/${lesson.id}`)
      : html`<div class="card part-card soft"><span class="pc-top"><span class="pc-label">${t('les.c.analysis')}</span></span><span class="pc-title">${t('les.analysisSoon')}</span><span class="pc-desc">${t('les.analysisDesc')}</span></div>`
  ];

  const stages = (ksp && ksp.stages || []).filter(s => s.stage || s.resources || s.teacher);
  main.innerHTML = html`
    <div class="page-head">
      <div><div class="small" style="font-size:13px">${meta}</div><h1 class="title" style="font-size:34px">${lesson.topic || lesson.subject}</h1></div>
      <div class="head-right">
        <a class="btn-o btn-md" href="${ksp ? `#/ksp?id=${ksp.id}&share=1` : regen}">${t('les.share')}</a>
        <a class="btn-k btn-md" href="#/lesson/${lesson.id}">${icon('play', 12)}${t('les.start')}</a>
      </div>
    </div>
    ${generating ? html`<div class="demo-bar"><span class="np-dot run" style="width:18px;height:18px"></span><span class="grow">${t('les.generating')}</span><a class="btn-o btn-sm" href="#/new">${t('les.open')}</a></div>` : ''}
    <div class="parts-grid">${cards}</div>
    <div class="card">
      <div class="card-title">${t('les.plan')}</div>
      ${stages.length ? html`<div class="plan-stages">${stages.map((s, i) => html`<div class="plan-stage" style="flex-grow:${s.minutes || (i === 1 ? 2 : 1)}"><b>${s.stage}${s.minutes ? ' · ' + t('les.min', { n: s.minutes }) : ''}</b><span>${s.resources || s.teacher}</span></div>`)}</div>`
        : html`<p class="muted-note">${t('les.noPlan')}</p>`}
    </div>
    <div class="les-actions">
      <button type="button" class="link-btn" data-schedule>${t('les.schedule')}</button>
      <button type="button" class="link-btn danger" data-delete>${t('les.delete')}</button>
    </div>`;

  main.querySelector('[data-delete]').addEventListener('click', async () => {
    if (!confirm(t('les.deleteConfirm', { name: lesson.topic || '' }))) return;
    for (const c of ['presentations', 'tests', 'games', 'ksp', 'homework']) await db[c].removeWhere({ lessonId: lesson.id });
    await db.lessons.remove(lesson.id);
    toast(t('les.deleted'));
    location.hash = '#/lessons';
  });
  main.querySelector('[data-schedule]').addEventListener('click', () => {
    openModal({
      title: t('les.schedule'),
      body: html`<div class="fields two">
        <label class="field">${t('les.date')}<input type="date" name="date" required value="${lesson.date || today()}"></label>
        <label class="field">${t('les.lessonNo')}<select name="slot">${bells.map((b, i) => html`<option value="${i + 1}" ${lesson.slot === i + 1 ? 'selected' : ''}>${t('date.lessonN', { n: i + 1 })} · ${b}</option>`)}</select></label>
      </div>`.toString(),
      onSubmit: async form => {
        const d = new FormData(form);
        const date = d.get('date'), slot = Number(d.get('slot'));
        const clash = lesson.classId && (await db.lessons.list(l => l.id !== lesson.id && l.classId === lesson.classId && l.date === date && l.slot === slot))[0];
        if (clash && (clash.status !== 'planned' || clash.topic)) { toast(t('les.busy')); return false; }
        if (clash) await db.lessons.remove(clash.id); // an empty timetable slot is replaced by this lesson
        await db.lessons.update(lesson.id, { date, slot });
        toast(t('les.scheduled'));
        detail(main, id);
      }
    });
  });
}
