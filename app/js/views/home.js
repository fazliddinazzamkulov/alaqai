/* Screen 1 · Home — statistics. */
import { add, t, num, lang } from '../i18n.js';
import { html, raw, icon, segmented, toast } from '../ui.js';
import { db } from '../data/store.js';
import { loadAll, periodRange, inRange, groupStats, studentStats, weeklyQuality, homeworkOnTime, pct } from '../stats.js';
import { today, longDate, quarterLabel, addDays, DEFAULT_BELLS } from '../school.js';

add({
  ru: {
    'home.morning': 'Доброе утро', 'home.day': 'Добрый день', 'home.evening': 'Добрый вечер',
    'home.week': 'Неделя', 'home.month': 'Месяц', 'home.quarter': 'Четверть',
    'home.quality': 'Качество знаний', 'home.success': 'Успеваемость', 'home.avg': 'Средний балл', 'home.done': 'Уроков проведено', 'home.hwOnTime': 'ДЗ сдают вовремя',
    'home.chart': 'Качество знаний по неделям', 'home.allClasses': 'все классы', 'home.wk': '{n} нед',
    'home.classes': 'Классы', 'home.all': 'Все', 'home.qualityNote': 'Качество знаний — доля учеников на «4» и «5»',
    'home.top': 'Лучшие ученики', 'home.today': 'Уроки сегодня', 'home.calendar': 'Календарь',
    'home.attention': 'Нужно внимание', 'home.hwWaiting': 'ДЗ ждут проверки', 'home.falling': 'Ученики с падением баллов', 'home.missed': 'Пропустили 2+ урока',
    'home.start': 'Начать', 'home.open': 'Итоги', 'home.prepare': 'Подготовить',
    'home.st.ready': 'готов', 'home.st.planned': 'не подготовлен', 'home.st.done': 'проведён',
    'home.noToday': 'Сегодня уроков нет.', 'home.noGrades': 'Оценки появятся после первых уроков с журналом.',
    'home.emptyTitle': 'Добро пожаловать в alaqai', 'home.emptyText': 'Добавьте свои классы — и здесь появится статистика: качество знаний, успеваемость, лучшие ученики и уроки на сегодня. Или посмотрите, как всё выглядит, на примере.',
    'home.addClass': '+ Класс', 'home.fillDemo': 'Заполнить примером', 'home.demoOn': 'Сейчас показан пример с выдуманными классами и оценками.', 'home.demoOff': 'Удалить пример', 'home.demoRemoved': 'Пример удалён', 'home.demoAdded': 'Пример добавлен'
  },
  kk: {
    'home.morning': 'Қайырлы таң', 'home.day': 'Қайырлы күн', 'home.evening': 'Қайырлы кеш',
    'home.week': 'Апта', 'home.month': 'Ай', 'home.quarter': 'Тоқсан',
    'home.quality': 'Білім сапасы', 'home.success': 'Үлгерім', 'home.avg': 'Орташа балл', 'home.done': 'Өткізілген сабақ', 'home.hwOnTime': 'ҮТ уақытында',
    'home.chart': 'Апта бойынша білім сапасы', 'home.allClasses': 'барлық сыныптар', 'home.wk': '{n} апта',
    'home.classes': 'Сыныптар', 'home.all': 'Барлығы', 'home.qualityNote': 'Білім сапасы — «4» және «5»-ке оқитын оқушылар үлесі',
    'home.top': 'Үздік оқушылар', 'home.today': 'Бүгінгі сабақтар', 'home.calendar': 'Күнтізбе',
    'home.attention': 'Назар аудару керек', 'home.hwWaiting': 'Тексерілмеген ҮТ', 'home.falling': 'Балы төмендеген оқушылар', 'home.missed': '2+ сабақ босатқандар',
    'home.start': 'Бастау', 'home.open': 'Қорытынды', 'home.prepare': 'Дайындау',
    'home.st.ready': 'дайын', 'home.st.planned': 'дайындалмаған', 'home.st.done': 'өткізілді',
    'home.noToday': 'Бүгін сабақ жоқ.', 'home.noGrades': 'Бағалар журнал жүргізілген алғашқы сабақтардан кейін шығады.',
    'home.emptyTitle': 'alaqai-ға қош келдіңіз', 'home.emptyText': 'Сыныптарыңызды қосыңыз — мұнда статистика шығады: білім сапасы, үлгерім, үздік оқушылар және бүгінгі сабақтар. Немесе бәрі қалай көрінетінін мысалдан қараңыз.',
    'home.addClass': '+ Сынып', 'home.fillDemo': 'Мысалмен толтыру', 'home.demoOn': 'Қазір ойдан алынған сыныптар мен бағалар мысалы көрсетілген.', 'home.demoOff': 'Мысалды жою', 'home.demoRemoved': 'Мысал жойылды', 'home.demoAdded': 'Мысал қосылды'
  },
  en: {
    'home.morning': 'Good morning', 'home.day': 'Good afternoon', 'home.evening': 'Good evening',
    'home.week': 'Week', 'home.month': 'Month', 'home.quarter': 'Term',
    'home.quality': 'Knowledge quality', 'home.success': 'Pass rate', 'home.avg': 'Average grade', 'home.done': 'Lessons taught', 'home.hwOnTime': 'Homework on time',
    'home.chart': 'Knowledge quality by week', 'home.allClasses': 'all classes', 'home.wk': 'wk {n}',
    'home.classes': 'Classes', 'home.all': 'All', 'home.qualityNote': 'Knowledge quality — share of students with 4s and 5s',
    'home.top': 'Top students', 'home.today': 'Today’s lessons', 'home.calendar': 'Calendar',
    'home.attention': 'Needs attention', 'home.hwWaiting': 'Homework to check', 'home.falling': 'Students with falling grades', 'home.missed': 'Missed 2+ lessons',
    'home.start': 'Start', 'home.open': 'Results', 'home.prepare': 'Prepare',
    'home.st.ready': 'ready', 'home.st.planned': 'not prepared', 'home.st.done': 'taught',
    'home.noToday': 'No lessons today.', 'home.noGrades': 'Grades appear after your first lessons with the register.',
    'home.emptyTitle': 'Welcome to alaqai', 'home.emptyText': 'Add your classes and this page fills with statistics: knowledge quality, pass rate, top students and today’s lessons. Or see how it all looks with an example.',
    'home.addClass': '+ Class', 'home.fillDemo': 'Fill with an example', 'home.demoOn': 'You are looking at an example with made-up classes and grades.', 'home.demoOff': 'Remove example', 'home.demoRemoved': 'Example removed', 'home.demoAdded': 'Example added'
  }
});

let period = 'month';

function greeting(name) {
  const h = new Date().getHours();
  const g = t(h < 12 ? 'home.morning' : h < 18 ? 'home.day' : 'home.evening');
  return name ? `${g}, ${name.split(' ')[0]}` : g;
}

function chart(series) {
  const vals = series.map(s => s.value).filter(v => v != null).map(v => v * 100);
  let lo = 50, hi = 80;
  if (vals.length) { lo = Math.min(lo, Math.floor(Math.min(...vals) / 10) * 10); hi = Math.max(hi, Math.ceil(Math.max(...vals) / 10) * 10); }
  const y = v => 20 + (hi - v) / (hi - lo) * 120;
  const x = i => 60 + i * (550 / (series.length - 1));
  const pts = series.map((s, i) => (s.value == null ? null : [x(i), y(s.value * 100)])).filter(Boolean);
  const last = pts[pts.length - 1];
  const lastVal = [...series].reverse().find(s => s.value != null);
  const mid = Math.round((hi + lo) / 2);
  const labelAt = i => raw(`<text x="${x(i) - 8}" y="200" font-size="11" fill="#6B6C62">${t('home.wk', { n: i + 1 })}</text>`);
  return html`<svg viewBox="0 0 640 210" role="img" aria-label="${t('home.chart')}">
    <line x1="36" y1="20" x2="630" y2="20" stroke="#F1F1EA"/><line x1="36" y1="80" x2="630" y2="80" stroke="#F1F1EA"/><line x1="36" y1="140" x2="630" y2="140" stroke="#F1F1EA"/><line x1="36" y1="180" x2="630" y2="180" stroke="#E4E4DA"/>
    <text x="0" y="24" font-size="11" fill="#6B6C62">${hi}%</text><text x="0" y="84" font-size="11" fill="#6B6C62">${mid}%</text><text x="0" y="144" font-size="11" fill="#6B6C62">${lo}%</text>
    ${pts.length > 1 ? raw(`<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#16170F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`) : ''}
    ${last ? raw(`<circle cx="${last[0]}" cy="${last[1]}" r="6" fill="#D6FF3B" stroke="#16170F" stroke-width="2"/><text x="${last[0] - 12}" y="${last[1] - 14}" font-size="12" font-weight="700" fill="#16170F">${Math.round(lastVal.value * 100)}%</text>`) : ''}
    ${labelAt(0)}${labelAt(3)}${labelAt(series.length - 1)}
  </svg>`;
}

function delta(cur, prev) {
  if (cur == null || prev == null) return '';
  const d = Math.round((cur - prev) * 100);
  if (!d) return '';
  return html`<small class="${d < 0 ? 'neg' : ''}">${d > 0 ? '+' : '−'}${Math.abs(d)}%</small>`;
}

export async function render(main) {
  const [data, settings] = await Promise.all([loadAll(), db.settings.get()]);
  const { classes, students, lessons, marks, homework, submissions } = data;
  const user = window.Alaqai && window.Alaqai.getCachedUser && window.Alaqai.getCachedUser();
  const name = (user && user.name) || (settings.profile && settings.profile.name) || '';
  const day = today();
  const q = quarterLabel(day);

  const head = html`
    <div class="page-head">
      <div><div class="subtle">${longDate(day)} · ${q.quarter}</div><h1 class="title">${greeting(name)}</h1></div>
      <div class="head-right">${classes.length ? segmented('period', [{ id: 'week', label: t('home.week') }, { id: 'month', label: t('home.month') }, { id: 'quarter', label: t('home.quarter') }], period) : ''}
        <a class="btn-k btn-md" href="#/lesson/file">${icon('play', 12)}${t('nav.start')}</a></div>
    </div>`;

  if (!classes.length) {
    main.innerHTML = html`${head}
      <div class="empty">
        <h2>${t('home.emptyTitle')}</h2><p>${t('home.emptyText')}</p>
        <div class="row"><a class="btn-k" href="#/classes?add=1">${t('home.addClass')}</a><button type="button" class="btn-o" data-demo>${t('home.fillDemo')}</button></div>
      </div>`;
    main.querySelector('[data-demo]').addEventListener('click', async e => {
      e.target.disabled = true;
      const { loadDemo } = await import('../data/demo.js');
      await loadDemo();
      toast(t('home.demoAdded'));
      render(main);
    });
    return;
  }

  const r = periodRange(period, day);
  const cur = marks.filter(m => inRange(m, r.from, r.to));
  const prev = marks.filter(m => inRange(m, r.prevFrom, r.prevTo));
  const g = groupStats(students, cur), gp = groupStats(students, prev);
  const doneCount = lessons.filter(l => l.status === 'done' && l.date >= r.from && l.date <= r.to).length;
  const onTime = homeworkOnTime(homework, submissions, students, r.from, r.to);
  const clsName = new Map(classes.map(c => [c.id, c.name]));

  const perClass = classes.map(c => ({ c, q: groupStats(students.filter(s => s.classId === c.id), cur.filter(m => m.classId === c.id)).quality }));
  const top = students.map(s => {
    const ms = cur.filter(m => m.studentId === s.id && m.grade != null);
    return { s, avg: ms.length >= 2 ? ms.reduce((a, m) => a + m.grade, 0) / ms.length : null };
  }).filter(x => x.avg != null).sort((a, b) => b.avg - a.avg).slice(0, 5);

  const bells = settings.bells || DEFAULT_BELLS;
  const todays = lessons.filter(l => l.date === day).sort((a, b) => a.slot - b.slot);
  const recent = marks.filter(m => m.date > addDays(day, -14));
  const falling = students.filter(s => studentStats(marks.filter(m => m.studentId === s.id)).trend === 'down').length;
  const missed = students.filter(s => recent.filter(m => m.studentId === s.id && m.present === false).length >= 2).length;
  const hwWaiting = submissions.filter(s => s.status === 'submitted').length;

  const todayItem = l => {
    const title = l.topic || l.subject || t('home.st.planned');
    const meta = `${clsName.get(l.classId) || ''} · ${t('date.lessonN', { n: l.slot })}${bells[l.slot - 1] ? ' · ' + bells[l.slot - 1] : ''} · ${t('home.st.' + l.status)}`;
    const btn = l.status === 'ready' ? html`<a class="btn-k btn-sm" href="#/lesson/${l.id}">${t('home.start')}</a>`
      : l.status === 'done' ? html`<a class="btn-o btn-sm" href="#/results/${l.id}">${t('home.open')}</a>`
      : html`<a class="btn-o btn-sm" href="#/new?lesson=${l.id}">${t('home.prepare')}</a>`;
    return html`<div class="today-item"><span class="txt"><b>${title}</b><span>${meta}</span></span>${btn}</div>`;
  };

  main.innerHTML = html`${head}
    ${settings.demoLoaded ? html`<div class="demo-bar"><span class="grow">${t('home.demoOn')}</span><button type="button" class="btn-o btn-sm" data-clear-demo>${t('home.demoOff')}</button></div>` : ''}
    <div class="stats c5">
      <div class="stat dark"><div class="stat-l">${t('home.quality')}</div><div class="stat-v">${pct(g.quality)}${delta(g.quality, gp.quality)}</div></div>
      <div class="stat"><div class="stat-l">${t('home.success')}</div><div class="stat-v">${pct(g.success)}</div></div>
      <div class="stat"><div class="stat-l">${t('home.avg')}</div><div class="stat-v">${num(g.avg)}</div></div>
      <div class="stat"><div class="stat-l">${t('home.done')}</div><div class="stat-v">${doneCount}</div></div>
      <div class="stat"><div class="stat-l">${t('home.hwOnTime')}</div><div class="stat-v">${pct(onTime)}</div></div>
    </div>
    <div class="home-mid">
      <div class="card chart">
        <div class="card-head"><span class="card-title">${t('home.chart')}</span><span class="small">${t('home.allClasses')}</span></div>
        ${marks.some(m => m.grade != null) ? chart(weeklyQuality(students, marks, 8)) : html`<p class="muted-note">${t('home.noGrades')}</p>`}
      </div>
      <div class="card">
        <div class="card-head"><span class="card-title">${t('home.classes')}</span><a class="card-link" href="#/classes">${t('home.all')}</a></div>
        ${perClass.map(({ c, q: v }) => html`<a class="bar-row" href="#/classes?id=${c.id}"><span class="n">${c.name}</span><span class="bar"><i style="width:${Math.round((v || 0) * 100)}%"></i></span><span class="v">${pct(v)}</span></a>`)}
        <div class="small">${t('home.qualityNote')}</div>
      </div>
    </div>
    <div class="home-low">
      <div class="card pad-s">
        <div class="card-title">${t('home.top')}</div>
        ${top.length ? top.map((x, i) => html`<div class="top-row"><span class="r">${i + 1}</span><span class="nm">${x.s.name}</span><span class="c">${clsName.get(x.s.classId)}</span><span class="s">${num(x.avg)}</span></div>`) : html`<p class="muted-note">${t('home.noGrades')}</p>`}
      </div>
      <div class="card pad-s">
        <div class="card-head"><span class="card-title">${t('home.today')}</span><a class="card-link" href="#/calendar">${t('home.calendar')}</a></div>
        ${todays.length ? todays.map(todayItem) : html`<p class="muted-note">${t('home.noToday')}</p>`}
      </div>
      <div class="card pad-s">
        <div class="card-title">${t('home.attention')}</div>
        <div>
          <a class="row-link" href="#/homework"><span>${t('home.hwWaiting')}</span><b>${hwWaiting}</b></a>
          <a class="row-link" href="#/classes?filter=falling"><span>${t('home.falling')}</span><b>${falling}</b></a>
          <a class="row-link" href="#/classes?filter=missed"><span>${t('home.missed')}</span><b>${missed}</b></a>
        </div>
      </div>
    </div>`;

  main.querySelectorAll('[data-seg="period"]').forEach(b => b.addEventListener('click', () => { period = b.dataset.id; render(main); }));
  const clear = main.querySelector('[data-clear-demo]');
  if (clear) clear.addEventListener('click', async () => { await db.clearDemo(); toast(t('home.demoRemoved')); render(main); });
}
