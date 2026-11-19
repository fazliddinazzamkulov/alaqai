/* Screen 22 · Calendar — the week by lesson number, plus day and month views. */
import { add, t } from '../i18n.js';
import { html, icon, segmented, openModal, esc, toast } from '../ui.js';
import { db } from '../data/store.js';
import { today, weekStart, addDays, rangeLabel, quarterOf, dayShort, dayName, monthStart, monthLabel, parse, iso, DEFAULT_BELLS, longDate } from '../school.js';

add({
  ru: {
    'cal.day': 'День', 'cal.week': 'Неделя', 'cal.month': 'Месяц', 'cal.add': '+ Событие', 'cal.prev': 'Назад', 'cal.next': 'Вперёд', 'cal.today': 'сегодня',
    'cal.done': 'Итоги', 'cal.ready': 'Готов', 'cal.planned': '+ Создать урок',
    'cal.legendReady': 'Урок готов', 'cal.legendDone': 'Проведён · итоги готовы', 'cal.legendPlanned': 'Не подготовлен',
    'cal.hw': 'ДЗ {c}', 'cal.more': 'ещё {n}',
    'cal.newTitle': 'Урок в расписании', 'cal.editTitle': 'Урок в расписании', 'cal.date': 'Дата', 'cal.slot': 'Урок', 'cal.class': 'Класс', 'cal.topic': 'Тема', 'cal.topicHint': 'Можно оставить пустой и заполнить при подготовке урока',
    'cal.noClasses': 'Сначала добавьте класс.', 'cal.toClasses': 'Перейти к классам', 'cal.saved': 'Урок добавлен в календарь', 'cal.busy': 'У этого класса в это время уже есть урок', 'cal.addHere': 'Добавить урок'
  },
  kk: {
    'cal.day': 'Күн', 'cal.week': 'Апта', 'cal.month': 'Ай', 'cal.add': '+ Оқиға', 'cal.prev': 'Артқа', 'cal.next': 'Алға', 'cal.today': 'бүгін',
    'cal.done': 'Қорытынды', 'cal.ready': 'Дайын', 'cal.planned': '+ Сабақ құру',
    'cal.legendReady': 'Сабақ дайын', 'cal.legendDone': 'Өткізілді · қорытынды дайын', 'cal.legendPlanned': 'Дайындалмаған',
    'cal.hw': 'ҮТ {c}', 'cal.more': 'тағы {n}',
    'cal.newTitle': 'Кестедегі сабақ', 'cal.editTitle': 'Кестедегі сабақ', 'cal.date': 'Күні', 'cal.slot': 'Сабақ', 'cal.class': 'Сынып', 'cal.topic': 'Тақырып', 'cal.topicHint': 'Бос қалдырып, сабаққа дайындалғанда толтыруға болады',
    'cal.noClasses': 'Алдымен сынып қосыңыз.', 'cal.toClasses': 'Сыныптарға өту', 'cal.saved': 'Сабақ күнтізбеге қосылды', 'cal.busy': 'Бұл сыныптың осы уақытта сабағы бар', 'cal.addHere': 'Сабақ қосу'
  },
  en: {
    'cal.day': 'Day', 'cal.week': 'Week', 'cal.month': 'Month', 'cal.add': '+ Event', 'cal.prev': 'Previous', 'cal.next': 'Next', 'cal.today': 'today',
    'cal.done': 'Results', 'cal.ready': 'Ready', 'cal.planned': '+ Create lesson',
    'cal.legendReady': 'Lesson ready', 'cal.legendDone': 'Taught · results ready', 'cal.legendPlanned': 'Not prepared',
    'cal.hw': 'HW {c}', 'cal.more': '{n} more',
    'cal.newTitle': 'Lesson in the timetable', 'cal.editTitle': 'Lesson in the timetable', 'cal.date': 'Date', 'cal.slot': 'Lesson', 'cal.class': 'Class', 'cal.topic': 'Topic', 'cal.topicHint': 'You can leave it empty and fill it in when you prepare the lesson',
    'cal.noClasses': 'Add a class first.', 'cal.toClasses': 'Go to classes', 'cal.saved': 'Lesson added to the calendar', 'cal.busy': 'This class already has a lesson at that time', 'cal.addHere': 'Add lesson'
  }
});

// On a phone a week of six columns does not fit — start with one day there.
let view = (typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches) ? 'day' : 'week';
let anchor = null; // any date inside the shown week / day / month

function lessonHref(l) {
  if (l.status === 'done') return `#/results/${l.id}`;
  if (l.status === 'ready') return `#/lessons?id=${l.id}`;
  return `#/new?lesson=${l.id}`;
}

function eventCard(l, clsName) {
  const st = l.status === 'done' ? html`${t('cal.done')} ${icon('check', 12)}`
    : l.status === 'ready' ? html`${icon('play', 10)} ${t('cal.ready')}`
    : t('cal.planned');
  return html`<a class="ev ${l.status}" href="${lessonHref(l)}" data-lesson="${l.id}">
    <span class="c">${clsName.get(l.classId) || ''}</span>
    ${l.topic ? html`<span class="tt">${l.topic}</span>` : ''}
    <span class="st">${st}</span></a>`;
}

export async function render(main, { query }) {
  anchor = anchor || query.date || today();
  const [classes, lessons, homework, settings] = await Promise.all([db.classes.list(), db.lessons.list(), db.homework.list(), db.settings.get()]);
  const bells = settings.bells || DEFAULT_BELLS;
  const clsName = new Map(classes.map(c => [c.id, c.name]));
  const day = today();

  let title, days;
  if (view === 'day') { days = [anchor]; title = longDate(anchor); }
  else if (view === 'week') { const mon = weekStart(anchor); days = Array.from({ length: 6 }, (_, i) => addDays(mon, i)); title = rangeLabel(days[0], days[5]); }
  else { title = monthLabel(anchor); }
  const q = quarterOf(view === 'month' ? anchor : (days ? days[0] : anchor));

  const head = html`
    <div class="page-head center">
      <div class="head-left">
        <h1 class="title title-sm">${title}</h1>
        <span style="display:flex;gap:4px">
          <button type="button" class="icon-btn" data-nav="-1" aria-label="${t('cal.prev')}">${icon('chevronLeft')}</button>
          <button type="button" class="icon-btn" data-nav="1" aria-label="${t('cal.next')}">${icon('chevronRight')}</button>
        </span>
        <span class="small" style="font-size:13px">${t('date.quarter', { n: q.n })} · ${t('date.week', { n: q.week })}</span>
      </div>
      <div class="head-right">
        ${segmented('view', [{ id: 'day', label: t('cal.day') }, { id: 'week', label: t('cal.week') }, { id: 'month', label: t('cal.month') }], view)}
        <button type="button" class="btn-o" data-add>${t('cal.add')}</button>
      </div>
    </div>`;

  let body;
  if (view === 'month') {
    const first = monthStart(anchor);
    const start = weekStart(first);
    const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
    const month = parse(first).getMonth();
    const weekdays = Array.from({ length: 7 }, (_, i) => dayShort(addDays(start, i)));
    body = html`<div class="cal"><div class="month">
      ${weekdays.map(w => html`<div class="month-h">${w}</div>`)}
      ${cells.map(d => {
        const ls = lessons.filter(l => l.date === d).sort((a, b) => a.slot - b.slot);
        return html`<button type="button" class="month-d${parse(d).getMonth() !== month ? ' out' : ''}${d === day ? ' is-today' : ''}" data-open-day="${d}">
          <span class="num">${parse(d).getDate()}</span>
          ${ls.slice(0, 3).map(l => html`<span class="pill ${l.status}">${clsName.get(l.classId) || ''}${l.topic ? ' · ' + l.topic : ''}</span>`)}
          ${ls.length > 3 ? html`<span class="small">${t('cal.more', { n: ls.length - 3 })}</span>` : ''}
        </button>`;
      })}
    </div></div>`;
  } else {
    body = html`<div class="cal ${view}"><div class="cal-scroll"><div class="cal-inner">
      <div class="cal-head"><span class="cal-gutter"></span>
        ${days.map(d => {
          const due = homework.filter(h => h.dueDate === d).map(h => clsName.get(h.classId)).filter(Boolean);
          return html`<button type="button" class="cal-day${d === day ? ' is-today' : ''}" data-open-day="${d}">
            <div class="dn">${view === 'day' ? dayName(d) : dayShort(d)}${d === day ? ' · ' + t('cal.today') : ''}</div>
            <div class="cdn"><b>${parse(d).getDate()}</b><span>${due.length ? t('cal.hw', { c: due.join(', ') }) : ''}</span></div>
          </button>`;
        })}
      </div>
      ${bells.map((time, r) => html`<div class="cal-row">
        <div class="cal-time"><b>${t('date.lessonN', { n: r + 1 })}</b>${time}</div>
        ${days.map(d => {
          const ls = lessons.filter(l => l.date === d && l.slot === r + 1);
          return html`<div class="cal-cell${d === day ? ' is-today' : ''}">
            ${ls.length ? eventCard(ls[0], clsName) : html`<button type="button" class="cal-add" data-add-at="${d}|${r + 1}" aria-label="${t('cal.addHere')}">+</button>`}
          </div>`;
        })}
      </div>`)}
    </div></div></div>`;
  }

  main.innerHTML = html`${head}${body}
    <div class="cal-legend">
      <span><i class="ready"></i>${t('cal.legendReady')}</span>
      <span><i class="done"></i>${t('cal.legendDone')}</span>
      <span><i class="planned"></i>${t('cal.legendPlanned')}</span>
    </div>`;

  main.querySelectorAll('[data-seg="view"]').forEach(b => b.addEventListener('click', () => { view = b.dataset.id; render(main, { query: {} }); }));
  main.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => {
    const dir = Number(b.dataset.nav);
    if (view === 'day') anchor = addDays(anchor, dir);
    else if (view === 'week') anchor = addDays(anchor, 7 * dir);
    else { const d = parse(monthStart(anchor)); d.setMonth(d.getMonth() + dir); anchor = iso(d); }
    render(main, { query: {} });
  }));
  main.querySelectorAll('[data-open-day]').forEach(b => b.addEventListener('click', () => { anchor = b.dataset.openDay; view = 'day'; render(main, { query: {} }); }));
  main.querySelector('[data-add]').addEventListener('click', () => lessonModal({ date: view === 'month' ? day : (days.includes(day) ? day : days[0]) }, classes, bells, lessons, () => render(main, { query: {} })));
  main.querySelectorAll('[data-add-at]').forEach(b => b.addEventListener('click', () => {
    const [date, slot] = b.dataset.addAt.split('|');
    lessonModal({ date, slot: Number(slot) }, classes, bells, lessons, () => render(main, { query: {} }));
  }));
}

/** Add a lesson to the timetable (it stays "not prepared" until its materials are created). */
function lessonModal(pre, classes, bells, lessons, done) {
  if (!classes.length) {
    openModal({ title: t('cal.newTitle'), body: html`<p class="muted-note">${t('cal.noClasses')}</p>`.toString(),
      extraButtons: html`<a class="btn-k" href="#/classes?add=1">${t('cal.toClasses')}</a>`.toString() });
    return;
  }
  const body = html`<div class="fields">
    <div class="fields two">
      <label class="field">${t('cal.date')}<input type="date" name="date" required value="${pre.date}"></label>
      <label class="field">${t('cal.slot')}<select name="slot">${bells.map((b, i) => html`<option value="${i + 1}" ${pre.slot === i + 1 ? 'selected' : ''}>${t('date.lessonN', { n: i + 1 })} · ${b}</option>`)}</select></label>
    </div>
    <label class="field">${t('cal.class')}<select name="classId">${classes.map(c => html`<option value="${c.id}">${c.name}${c.subject ? ' · ' + c.subject : ''}</option>`)}</select></label>
    <label class="field">${t('cal.topic')}<input name="topic" maxlength="120" autocomplete="off"><span class="hint">${t('cal.topicHint')}</span></label>
  </div>`;
  openModal({
    title: t('cal.newTitle'), body: body.toString(),
    onSubmit: async form => {
      const f = new FormData(form);
      const date = f.get('date'), slot = Number(f.get('slot')), classId = f.get('classId');
      if (lessons.some(l => l.date === date && l.slot === slot && l.classId === classId)) { toast(t('cal.busy')); return false; }
      const cls = classes.find(c => c.id === classId);
      await db.lessons.create({ classId, date, slot, topic: String(f.get('topic') || '').trim(), subject: cls.subject || '', status: 'planned' });
      toast(t('cal.saved'));
      anchor = date;
      done();
    }
  });
}
