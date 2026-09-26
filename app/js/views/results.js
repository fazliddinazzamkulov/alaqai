/* Screen 12: lesson results — attendance, the quiz question by question, who
 * needs attention, and an analysis (rule-based for everyone, AI on Standard/Max). */
import { add, t, lang, num } from '../i18n.js';
import { html, icon, toast, openModal } from '../ui.js';
import { db } from '../data/store.js';
import { addDays, longDate } from '../school.js';
import { studentStats } from '../stats.js';
import { currentPlan } from '../plans.js';
import { generateJSON, AiError } from '../ai.js';

add({
  ru: {
    'rs.crumb': 'Итоги урока', 'rs.u.slides': 'презентация', 'rs.u.quiz': 'викторина', 'rs.u.games': 'игры', 'rs.u.groups': 'работа в группах', 'rs.min': '{n} минут', 'rs.report': 'Скачать отчёт', 'rs.giveHw': 'Дать ДЗ тем, кто ошибся',
    'rs.came': 'Пришли', 'rs.of': 'из {n}', 'rs.quiz': 'Викторина · верных ответов', 'rs.points': 'Баллов выдано', 'rs.clear': '«Мне понятно»', 'rs.clearSet': 'Отметить',
    'rs.byQ': 'Викторина по вопросам', 'rs.noQuiz': 'Викторину на этом уроке не проводили. Запустите её в режиме урока — здесь появится процент верных ответов по каждому вопросу.',
    'rs.attention': 'Кому нужно внимание', 'rs.absent': 'Не был на уроке', 'rs.sendMat': 'Отправить материалы', 'rs.low': 'Средняя оценка {g}', 'rs.lowTag': 'Нужна поддержка', 'rs.down': 'Оценки снижаются', 'rs.downTag': 'Нужна беседа',
    'rs.nobody': 'Все на месте, тревожных сигналов нет.', 'rs.best': 'Лучшие на уроке: {list}',
    'rs.ai': 'Анализ урока от ИИ', 'rs.basic': 'Анализ урока', 'rs.good': 'Что получилось', 'rs.watch': 'Обратить внимание', 'rs.next': 'На следующий урок', 'rs.aiRun': 'Сделать анализ с ИИ', 'rs.aiRunning': 'ИИ анализирует урок…', 'rs.aiPlan': 'Анализ с ИИ — в тарифе Стандарт',
    'rs.b.good': 'Вопросы {list} решили почти все — эту часть темы класс понял.', 'rs.b.goodNone': 'Урок проведён, журнал заполнен.', 'rs.b.goodAtt': 'Посещаемость {p} — класс почти в полном составе.',
    'rs.b.watch': 'Вопрос {n} — меньше {p} верных ответов. Стоит разобрать ещё раз.', 'rs.b.watchAbs': 'Не были на уроке: {n}. Им стоит отправить материалы.', 'rs.b.watchNone': 'Явных проблем нет.',
    'rs.b.next': 'Начните с 5-минутной разминки по вопросу {n} — например, игрой из «Тестов и игр».', 'rs.b.nextNone': 'Можно двигаться дальше по программе и дать короткий тест в начале урока.',
    'rs.clearTitle': 'Сколько учеников сказали «мне понятно»?', 'rs.clearNote': 'Спросите класс в конце урока (поднять руку или карточки) и введите число.', 'rs.clearN': 'Число учеников',
    'rs.notFound': 'Урок не найден', 'rs.back': 'К урокам', 'rs.notDone': 'Урок ещё не проведён', 'rs.notDoneNote': 'Итоги появятся после того, как вы проведёте урок и нажмёте «Завершить».', 'rs.start': 'Начать урок'
  },
  kk: {
    'rs.crumb': 'Сабақ қорытындысы', 'rs.u.slides': 'презентация', 'rs.u.quiz': 'викторина', 'rs.u.games': 'ойындар', 'rs.u.groups': 'топпен жұмыс', 'rs.min': '{n} минут', 'rs.report': 'Есепті жүктеу', 'rs.giveHw': 'Қателескендерге ҮТ беру',
    'rs.came': 'Келгендер', 'rs.of': '/ {n}', 'rs.quiz': 'Викторина · дұрыс жауаптар', 'rs.points': 'Берілген ұпай', 'rs.clear': '«Маған түсінікті»', 'rs.clearSet': 'Белгілеу',
    'rs.byQ': 'Викторина сұрақтар бойынша', 'rs.noQuiz': 'Бұл сабақта викторина өткізілмеді. Оны сабақ режимінде іске қосыңыз — мұнда әр сұрақ бойынша дұрыс жауаптар пайызы шығады.',
    'rs.attention': 'Кімге назар керек', 'rs.absent': 'Сабақта болмады', 'rs.sendMat': 'Материалдарды жіберу', 'rs.low': 'Орташа баға {g}', 'rs.lowTag': 'Қолдау керек', 'rs.down': 'Бағалары төмендеп барады', 'rs.downTag': 'Әңгіме керек',
    'rs.nobody': 'Бәрі орнында, алаңдатарлық белгі жоқ.', 'rs.best': 'Сабақтағы үздіктер: {list}',
    'rs.ai': 'ЖИ-дан сабақ талдауы', 'rs.basic': 'Сабақ талдауы', 'rs.good': 'Не жақсы шықты', 'rs.watch': 'Назар аудару керек', 'rs.next': 'Келесі сабаққа', 'rs.aiRun': 'ЖИ-мен талдау', 'rs.aiRunning': 'ЖИ сабақты талдап жатыр…', 'rs.aiPlan': 'ЖИ-мен талдау — Стандарт тарифінде',
    'rs.b.good': '{list} сұрақтарын барлығы дерлік шешті — тақырыптың бұл бөлігін сынып түсінді.', 'rs.b.goodNone': 'Сабақ өтті, журнал толтырылды.', 'rs.b.goodAtt': 'Қатысу {p} — сынып толық дерлік.',
    'rs.b.watch': '{n}-сұрақ — дұрыс жауаптар {p}-дан аз. Қайта талдаған жөн.', 'rs.b.watchAbs': 'Сабақта болмағандар: {n}. Оларға материал жіберген жөн.', 'rs.b.watchNone': 'Айқын мәселе жоқ.',
    'rs.b.next': '{n}-сұрақ бойынша 5 минуттық жаттығудан бастаңыз — мысалы, «Тест және ойын» бөліміндегі ойынмен.', 'rs.b.nextNone': 'Бағдарлама бойынша әрі қарай жүріп, сабақ басында қысқа тест беруге болады.',
    'rs.clearTitle': 'Неше оқушы «маған түсінікті» деді?', 'rs.clearNote': 'Сабақ соңында сыныптан сұраңыз (қол көтеру немесе карточка) және санын енгізіңіз.', 'rs.clearN': 'Оқушылар саны',
    'rs.notFound': 'Сабақ табылмады', 'rs.back': 'Сабақтарға', 'rs.notDone': 'Сабақ әлі өтпеді', 'rs.notDoneNote': 'Сабақты өткізіп, «Аяқтау» батырмасын басқаннан кейін қорытынды шығады.', 'rs.start': 'Сабақты бастау'
  },
  en: {
    'rs.crumb': 'Lesson results', 'rs.u.slides': 'slides', 'rs.u.quiz': 'quiz', 'rs.u.games': 'games', 'rs.u.groups': 'group work', 'rs.min': '{n} minutes', 'rs.report': 'Download report', 'rs.giveHw': 'Homework for those who struggled',
    'rs.came': 'Present', 'rs.of': 'of {n}', 'rs.quiz': 'Quiz · correct answers', 'rs.points': 'Points given', 'rs.clear': '“I understand”', 'rs.clearSet': 'Set',
    'rs.byQ': 'Quiz by question', 'rs.noQuiz': 'There was no quiz in this lesson. Run it in lesson mode — the share of correct answers for each question will show here.',
    'rs.attention': 'Who needs attention', 'rs.absent': 'Missed the lesson', 'rs.sendMat': 'Send materials', 'rs.low': 'Average grade {g}', 'rs.lowTag': 'Needs support', 'rs.down': 'Grades are falling', 'rs.downTag': 'Have a talk',
    'rs.nobody': 'Everyone was here, no warning signs.', 'rs.best': 'Best in the lesson: {list}',
    'rs.ai': 'AI lesson analysis', 'rs.basic': 'Lesson analysis', 'rs.good': 'What worked', 'rs.watch': 'Watch out for', 'rs.next': 'For the next lesson', 'rs.aiRun': 'Analyse with AI', 'rs.aiRunning': 'AI is analysing the lesson…', 'rs.aiPlan': 'AI analysis comes with Standard',
    'rs.b.good': 'Almost everyone got questions {list} right — the class understood this part.', 'rs.b.goodNone': 'The lesson is done and the register is filled in.', 'rs.b.goodAtt': 'Attendance {p} — nearly the whole class.',
    'rs.b.watch': 'Question {n} — fewer than {p} correct. Worth going over again.', 'rs.b.watchAbs': 'Missed the lesson: {n}. Send them the materials.', 'rs.b.watchNone': 'No clear problems.',
    'rs.b.next': 'Start with a 5-minute warm-up on question {n} — for example a game from “Tests & games”.', 'rs.b.nextNone': 'Move on with the programme and give a short test at the start.',
    'rs.clearTitle': 'How many students said “I understand”?', 'rs.clearNote': 'Ask the class at the end of the lesson (hands up or cards) and enter the number.', 'rs.clearN': 'Number of students',
    'rs.notFound': 'Lesson not found', 'rs.back': 'Back to lessons', 'rs.notDone': 'The lesson has not been taught yet', 'rs.notDoneNote': 'Results appear after you teach the lesson and press “Finish”.', 'rs.start': 'Start lesson'
  }
});

export async function render(main, { args }) {
  if (!args[0]) { location.replace('#/lessons'); return; }
  const lesson = await db.lessons.get(args[0]);
  if (!lesson) { main.innerHTML = html`<div class="empty"><h2>${t('rs.notFound')}</h2><div class="row"><a class="btn-k" href="#/lessons">${t('rs.back')}</a></div></div>`; return; }
  const p = lesson.parts || {};
  const [cls, students, marks, quiz, deck, plan, games] = await Promise.all([
    lesson.classId ? db.classes.get(lesson.classId) : null,
    lesson.classId ? db.students.list({ classId: lesson.classId }) : [],
    db.marks.list({ lessonId: lesson.id }),
    p.quizId ? db.tests.get(p.quizId) : null,
    p.presentationId ? db.presentations.get(p.presentationId) : null,
    currentPlan(),
    Promise.all((p.gameIds || []).map(id => db.games.get(id)))
  ]);
  students.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  const crumbs = html`<div class="crumbs"><a href="#/lessons?id=${lesson.id}">${t('nav.lessons')}</a>${icon('chevronRight', 14)}<span>${t('rs.crumb')}</span></div>`;
  const title = `${cls ? cls.name + ' · ' : ''}${lesson.topic || lesson.subject || ''}`;
  const lessonMarks = marks.filter(m => m.kind !== 'hw');
  if (lesson.status !== 'done' && !lessonMarks.length) {
    main.innerHTML = html`<div>${crumbs}<h1 class="title title-md">${title}</h1></div>
      <div class="empty"><h2>${t('rs.notDone')}</h2><p>${t('rs.notDoneNote')}</p><div class="row"><a class="btn-k" href="#/lesson/${lesson.id}">${t('rs.start')}</a></div></div>`;
    return;
  }

  // Numbers
  const live = lesson.live || {};
  const byStudent = new Map(lessonMarks.map(m => [m.studentId, m]));
  const present = students.filter(s => (byStudent.get(s.id) || {}).present !== false);
  const absent = students.filter(s => (byStudent.get(s.id) || {}).present === false);
  const points = lessonMarks.reduce((a, m) => a + (m.points || 0), 0);
  const qLog = (live.quizLog || []).map((r, i) => r && r.all ? { i, share: r.ok / r.all } : null).filter(Boolean);
  const quizShare = qLog.length ? qLog.reduce((a, r) => a + r.share, 0) / qLog.length : null;
  const minutes = live.startedAt && lesson.finishedAt ? Math.max(1, Math.round((new Date(lesson.finishedAt) - new Date(live.startedAt)) / 60000)) : null;
  const used = [deck && t('rs.u.slides'), quiz && qLog.length && t('rs.u.quiz'), games.filter(Boolean).length && t('rs.u.games'), live.groups && t('rs.u.groups')].filter(Boolean);
  const meta = [lesson.date && longDate(lesson.date), minutes && t('rs.min', { n: Math.min(minutes, 90) }), used.join(', ')].filter(Boolean).join(' · ');

  // Attention: absent, low average, falling grades (the last 4 weeks of the journal).
  const recent = await db.marks.list(m => m.classId === lesson.classId && m.date >= addDays(lesson.date || lesson.finishedAt.slice(0, 10), -28));
  const attention = [];
  absent.forEach(s => attention.push({ s, text: t('rs.absent'), action: 'send' }));
  present.forEach(s => {
    const st = studentStats(recent.filter(m => m.studentId === s.id));
    if (st.avg != null && st.avg < 3) attention.push({ s, text: t('rs.low', { g: num(st.avg) }), tag: t('rs.lowTag') });
    else if (st.trend === 'down') attention.push({ s, text: t('rs.down'), tag: t('rs.downTag') });
  });
  const best = present.map(s => ({ s, p: (byStudent.get(s.id) || {}).points || 0 })).filter(x => x.p > 0).sort((a, b) => b.p - a.p).slice(0, 3);
  const quizQs = quiz ? quiz.questions : [];

  const basic = basicAnalysis(qLog, present.length, students.length, absent.length);
  let aiBusy = false;

  const draw = () => {
    const clear = lesson.understood;
    const a = lesson.aiAnalysis || basic;
    const isAi = !!lesson.aiAnalysis;
    main.innerHTML = html`
      <div class="page-head">
        <div>${crumbs}<h1 class="title title-md">${title}</h1><div class="rs-meta">${meta}</div></div>
        <div class="head-right no-print">
          <button type="button" class="btn-o btn-md" data-print>${t('rs.report')}</button>
          <a class="btn-k btn-md" href="#/homework?lesson=${lesson.id}${attention.length ? '&students=' + attention.map(x => x.s.id).join(',') : ''}">${t('rs.giveHw')}</a>
        </div>
      </div>
      <div class="stats c4">
        <div class="stat"><div class="stat-l">${t('rs.came')}</div><div class="stat-v">${present.length} <small class="mut">${t('rs.of', { n: students.length })}</small></div></div>
        <div class="stat"><div class="stat-l">${t('rs.quiz')}</div><div class="stat-v">${quizShare != null ? Math.round(quizShare * 100) + '%' : '—'}</div></div>
        <div class="stat"><div class="stat-l">${t('rs.points')}</div><div class="stat-v">${points}</div></div>
        <button type="button" class="stat rs-clear" data-clear><div class="stat-l">${t('rs.clear')}</div><div class="stat-v">${clear != null ? html`${clear} <small class="mut">${t('rs.of', { n: present.length })}</small>` : html`<small class="rs-set">${icon('edit', 14)} ${t('rs.clearSet')}</small>`}</div></button>
      </div>
      <div class="rs-grid">
        <div class="card">
          <div class="card-title">${t('rs.byQ')}</div>
          ${qLog.length ? html`<div class="rs-qs">${qLog.map(r => html`<div class="rs-q${r.share < 0.6 ? ' low' : ''}"><span class="l">${r.i + 1}. ${(quizQs[r.i] || {}).q || ''}</span><span class="bar"><i style="width:${Math.round(r.share * 100)}%"></i></span><b>${Math.round(r.share * 100)}%</b></div>`)}</div>`
            : html`<p class="muted-note">${t('rs.noQuiz')}</p>`}
        </div>
        <div class="card">
          <div class="card-title">${t('rs.attention')}</div>
          ${attention.length ? attention.slice(0, 6).map(x => html`<div class="rs-att"><span class="who"><b>${x.s.name}</b><span>${x.text}</span></span>
            ${x.action === 'send' ? html`<a class="btn-o btn-sm no-print" href="#/homework?lesson=${lesson.id}&students=${x.s.id}">${t('rs.sendMat')}</a>` : html`<span class="tag">${x.tag}</span>`}</div>`) : html`<p class="muted-note">${t('rs.nobody')}</p>`}
          ${best.length ? html`<div class="rs-best">${t('rs.best', { list: best.map(x => x.s.name.split(' ')[0]).join(', ') })}</div>` : ''}
        </div>
      </div>
      <div class="rs-ai">
        <div class="h">${icon('sparkle', 16)}<span class="grow">${isAi ? t('rs.ai') : t('rs.basic')}</span>
          ${isAi ? '' : aiBusy ? html`<span class="muted">${t('rs.aiRunning')}</span>` : plan.lessonAnalysis ? html`<button type="button" class="btn-w no-print" data-ai>${t('rs.aiRun')}</button>` : html`<a class="muted no-print" href="#/plan">${t('rs.aiPlan')}</a>`}</div>
        <div class="cols">
          <div><div class="k">${t('rs.good')}</div><div>${a.good}</div></div>
          <div><div class="k">${t('rs.watch')}</div><div>${a.watch}</div></div>
          <div><div class="k">${t('rs.next')}</div><div>${a.next}</div></div>
        </div>
      </div>`;
    main.querySelector('[data-print]').onclick = () => window.print();
    main.querySelector('[data-clear]').onclick = () => openModal({
      title: t('rs.clearTitle'),
      body: html`<p class="muted-note">${t('rs.clearNote')}</p><label class="field">${t('rs.clearN')}<input name="n" type="number" min="0" max="${present.length || 99}" value="${clear ?? ''}" required></label>`.toString(),
      onSubmit: async f => { lesson.understood = Math.max(0, Math.min(present.length || 99, Number(f.n.value) || 0)); await db.lessons.update(lesson.id, { understood: lesson.understood }); draw(); }
    });
    const ai = main.querySelector('[data-ai]');
    if (ai) ai.onclick = runAi;
  };

  const runAi = async () => {
    aiBusy = true; draw();
    try {
      const facts = {
        topic: lesson.topic, subject: lesson.subject, className: cls && cls.name, present: present.length, total: students.length,
        quiz: qLog.map(r => ({ question: (quizQs[r.i] || {}).q, correct: Math.round(r.share * 100) + '%' })),
        understood: lesson.understood ?? null, pointsGiven: points, usedMaterials: used,
        slides: deck ? deck.slides.map(s => s.title).slice(0, 14) : [], games: games.filter(Boolean).map(g => g.title)
      };
      const l = lang() === 'kk' ? 'казахском' : lang() === 'en' ? 'английском' : 'русском';
      const res = await generateJSON(`[part:analysis]\nТы — методист. Проанализируй прошедший урок по данным (JSON ниже) и дай учителю короткий практичный разбор. Пиши на ${l} языке, по 1–2 предложения в каждом поле, опирайся на цифры.\nДанные урока: ${JSON.stringify(facts)}\nВерни ТОЛЬКО JSON: { "good": "что получилось", "watch": "на что обратить внимание", "next": "что сделать на следующем уроке" }`, { temperature: 0.4 });
      if (!res.good) throw new AiError('bad');
      lesson.aiAnalysis = { good: String(res.good).slice(0, 400), watch: String(res.watch || '').slice(0, 400), next: String(res.next || '').slice(0, 400) };
      await db.lessons.update(lesson.id, { aiAnalysis: lesson.aiAnalysis });
    } catch (e) {
      toast(e instanceof AiError ? e.message : t('ai.err.other', { msg: e.message }));
    }
    aiBusy = false; draw();
  };

  draw();
  // The teacher asked for AI analysis when creating the lesson: run it once.
  if (lesson.analysis && !lesson.aiAnalysis && plan.lessonAnalysis && lesson.status === 'done' && !lesson.aiTried) {
    await db.lessons.update(lesson.id, { aiTried: true });
    runAi();
  }
  document.body.classList.add('print-results');
  return () => document.body.classList.remove('print-results');
}

function basicAnalysis(qLog, present, total, absent) {
  const good = qLog.filter(r => r.share >= 0.8).map(r => r.i + 1);
  const weak = [...qLog].filter(r => r.share < 0.6).sort((a, b) => a.share - b.share)[0];
  const att = total ? present / total : null;
  return {
    good: good.length ? t('rs.b.good', { list: good.join(', ') }) : att != null && att >= 0.9 ? t('rs.b.goodAtt', { p: Math.round(att * 100) + '%' }) : t('rs.b.goodNone'),
    watch: weak ? t('rs.b.watch', { n: weak.i + 1, p: '60%' }) : absent ? t('rs.b.watchAbs', { n: absent }) : t('rs.b.watchNone'),
    next: weak ? t('rs.b.next', { n: weak.i + 1 }) : t('rs.b.nextNone')
  };
}

