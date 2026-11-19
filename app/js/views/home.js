/* Home (mockup 1): quick lesson, today's lessons, class growth, who needs attention. */
import { add, t } from '../i18n.js';
import { html, icon } from '../ui.js';
import { db } from '../data/store.js';
import { today, longDate } from '../school.js';
import { IC } from '../shell.js';

add({
  kk: { 'h.hello': 'Қайырлы күн', 'h.noLive': 'Дайындықсыз сабақ өткізу', 'h.quick': 'Бір минутта жаңа сабақ', 'h.quickSub': 'Презентация + ҚМЖ', 'h.topic': 'Сабақ тақырыбы', 'h.class': 'Сынып', 'h.create': 'Құру', 'h.today': 'Соңғы сабақтар', 'h.noLessons': 'Әзірге сабақ жоқ. Алғашқы сабағыңызды құрыңыз.', 'h.run': 'Өткізу', 'h.open': 'Ашу', 'h.growth': 'Сыныптар өсуі', 'h.more': 'Толығырақ', 'h.quality': 'Дұрыс жауаптар', 'h.noData': 'Сабақ өткізгеннен кейін мұнда оқушылардың нәтижесі шығады.', 'h.noClass': 'Алдымен сынып қосыңыз', 'h.addClass': '+ Сынып', 'h.attn': 'Назар аударыңыз', 'h.topicPh': 'Мысалы: Python тіліндегі for циклі', 'h.lowScore': 'соңғы сабақтарда 50%-дан төмен' },
  ru: { 'h.hello': 'Добрый день', 'h.noLive': 'Провести урок без подготовки', 'h.quick': 'Новый урок за минуту', 'h.quickSub': 'Презентация + КСП', 'h.topic': 'Тема урока', 'h.class': 'Класс', 'h.create': 'Создать', 'h.today': 'Последние уроки', 'h.noLessons': 'Уроков пока нет. Создайте первый урок.', 'h.run': 'Провести', 'h.open': 'Открыть', 'h.growth': 'Рост классов', 'h.more': 'Подробнее', 'h.quality': 'Верных ответов', 'h.noData': 'После первого урока с учениками здесь появятся их результаты.', 'h.noClass': 'Сначала добавьте класс', 'h.addClass': '+ Класс', 'h.attn': 'Нужно внимание', 'h.topicPh': 'Например: цикл for в Python', 'h.lowScore': 'ниже 50% на последних уроках' },
  en: { 'h.hello': 'Good afternoon', 'h.noLive': 'Run a lesson without preparation', 'h.quick': 'A new lesson in a minute', 'h.quickSub': 'Slides + lesson plan', 'h.topic': 'Lesson topic', 'h.class': 'Class', 'h.create': 'Create', 'h.today': 'Recent lessons', 'h.noLessons': 'No lessons yet. Create your first one.', 'h.run': 'Run', 'h.open': 'Open', 'h.growth': 'Class growth', 'h.more': 'Details', 'h.quality': 'Correct answers', 'h.noData': 'After your first lesson with students their results appear here.', 'h.noClass': 'Add a class first', 'h.addClass': '+ Class', 'h.attn': 'Needs attention', 'h.topicPh': 'For example: the for loop in Python', 'h.lowScore': 'below 50% in recent lessons' }
});

const pct = (a) => { const c = a.reduce((s, x) => s + (x.correct || 0), 0), n = a.reduce((s, x) => s + (x.total || 0), 0); return n ? Math.round(c / n * 100) : null; };

export async function render(main) {
  const [classes, lessons, attempts, students] = await Promise.all([db.classes.list(), db.lessons.list(), db.attempts.list(), db.students.list()]);
  const recent = lessons.slice().sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || ''))).slice(0, 4);
  const byClass = classes.map(c => ({ c, p: pct(attempts.filter(a => a.classId === c.id)) }));
  const low = students.map(s => ({ s, p: pct(attempts.filter(a => a.studentId === s.id).slice(-12)) })).filter(x => x.p != null && x.p < 50).slice(0, 4);
  const cname = id => (classes.find(c => c.id === id) || {}).name || '';
  main.innerHTML = html`<div class="wrap">
    <div class="row" style="justify-content:space-between;align-items:flex-end">
      <div><div class="muted" style="font-weight:500">${longDate(today())}</div><h1 style="margin-top:6px">${t('h.hello')}</h1></div>
      <a class="btn" href="#/live">${icon(IC.live, 20)}${t('h.noLive')}</a>
    </div>
    <form class="card dark" data-quick style="display:flex;flex-direction:column;gap:18px">
      <div class="row" style="justify-content:space-between;align-items:center"><h2 style="font-size:28px">${t('h.quick')}</h2><span style="color:#C9C9CF">${t('h.quickSub')}</span></div>
      <div class="row">
        <label class="field" style="flex:3 1 300px"><span>${t('h.topic')}</span><input name="topic" placeholder="${t('h.topicPh')}" required></label>
        ${classes.length ? html`<label class="field" style="flex:1 1 160px"><span>${t('h.class')}</span><select name="classId">${classes.map(c => html`<option value="${c.id}">${c.name}</option>`)}</select></label>`
          : html`<a class="btn" href="#/classes" style="flex:1 1 160px;height:56px">${t('h.addClass')}</a>`}
        <button class="btn b lg" style="flex:1 1 170px;height:56px">${t('h.create')} ${icon('M5 12h14M12 5l7 7-7 7', 20)}</button>
      </div>
    </form>
    <div class="grid2">
      <section class="card" style="display:flex;flex-direction:column;gap:6px">
        <h2 style="margin-bottom:8px">${t('h.today')}</h2>
        ${recent.length ? recent.map(l => html`<div class="list-row"><div class="grow"><div class="ttl">${l.topic}</div><div class="sub">${[cname(l.classId), l.subject].filter(Boolean).join(' · ')}</div></div>
          <a class="btn sm k" href="#/live/${l.id}">${t('h.run')}</a><a class="btn sm" href="#/lesson/${l.id}">${t('h.open')}</a></div>`)
          : html`<div class="empty">${t('h.noLessons')}<a class="btn b sm" href="#/new">${t('nav.create')}</a></div>`}
      </section>
      <section class="card" style="display:flex;flex-direction:column;gap:16px">
        <div class="row" style="justify-content:space-between;align-items:center"><h2>${t('h.growth')}</h2><a href="#/growth" style="font-weight:600;text-decoration:none">${t('h.more')}</a></div>
        ${byClass.some(x => x.p != null) ? byClass.filter(x => x.p != null).map(({ c, p }) => html`<div><div class="row" style="justify-content:space-between;margin-bottom:8px"><b>${c.name}</b><span>${t('h.quality')} <b>${p}%</b></span></div><div class="bar"><i style="width:${p}%"></i></div></div>`)
          : html`<div class="empty">${classes.length ? t('h.noData') : t('h.noClass')}${classes.length ? '' : html`<a class="btn sm" href="#/classes">${t('h.addClass')}</a>`}</div>`}
        ${low.length ? html`<div class="attn"><h3>${t('h.attn')}</h3>${low.map(({ s, p }) => html`<a href="#/growth/${s.id}" class="row" style="justify-content:space-between;color:var(--ink);text-decoration:none"><span>${s.name} · ${cname(s.classId)}</span><span class="muted">${p}% — ${t('h.lowScore')}</span></a>`)}</div>` : ''}
      </section>
    </div>
  </div>`.toString();
  const f = main.querySelector('[data-quick]');
  f.onsubmit = e => {
    e.preventDefault();
    const q = new URLSearchParams({ topic: f.topic.value.trim() });
    if (f.classId) q.set('classId', f.classId.value);
    location.hash = '#/new?' + q.toString();
  };
}
