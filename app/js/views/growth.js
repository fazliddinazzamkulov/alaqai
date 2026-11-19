/* Student growth (mockup 6): who needs attention, each student's results per
 * lesson, which method helps, and a level suggestion the teacher confirms. */
import { add, t } from '../i18n.js';
import { html, raw, toast } from '../ui.js';
import { db } from '../data/store.js';
import { generateJSON } from '../ai.js';
import { studentSummary, lagging, suggestLevel } from '../growth/stats.js';

add({
  kk: { 'g.level': 'деңгей', 'g.title': 'Оқушылар өсуі', 'g.empty': 'Әзірге нәтиже жоқ. alaqai-да сабақ өткізгеннен кейін мұнда әр оқушының өсуі көрінеді.', 'g.noClass': 'Алдымен сынып қосыңыз.', 'g.attn': 'Назар аударыңыз', 'g.below50x3': 'соңғы 3 сабақта 50%-дан төмен', 'g.absent2': 'соңғы 2 сабаққа кірмеді', 'g.lessons': '{n} сабақ alaqai-да', 'g.month': 'өзгеріс', 'g.chart': 'Әр сабақтағы дұрыс жауаптар, %', 'g.methods': 'Қай әдіс көмектеседі', 'g.tasks': '{n} тапсырма', 'g.rec': 'Ұсыныс', 'g.up': '3 сабақ қатарынан 70%-дан жоғары — {l} деңгейіне ауыстыруға болады.', 'g.down': '3 сабақ қатарынан 50%-дан төмен — {l} деңгейіне ауыстырып, көмек беріңіз.', 'g.keep': 'Деңгейі сәйкес. Жалғастыра беріңіз.', 'g.best': 'Жиірек «{m}» беріңіз.', 'g.moveTo': '{l} деңгейіне ауыстыру', 'g.stay': '{l} қалдыру', 'g.note': 'Мұғалім жазбасы', 'g.ai': 'ЖИ талдауы', 'g.aiErr': 'ЖИ жауап бермеді: ', 'g.noData': 'Бұл оқушының әлі нәтижесі жоқ.', 'g.decide': 'Шешімді мұғалім қабылдайды.', 'g.trend': 'Стрелка — бірінші сабақтан соңғысына дейінгі өзгеріс, %', 'g.saved': 'Сақталды', 'g.steps': 'Қадам бойынша', 'g.example': 'Үлгіні талдау', 'g.error': 'Қатені тап', 'g.common': 'Жалпы тапсырма' },
  ru: { 'g.level': 'уровень', 'g.title': 'Рост учеников', 'g.empty': 'Результатов пока нет. После уроков на alaqai здесь появится рост каждого ученика.', 'g.noClass': 'Сначала добавьте класс.', 'g.attn': 'Нужно внимание', 'g.below50x3': 'ниже 50% три урока подряд', 'g.absent2': 'пропустил(а) 2 последних урока', 'g.lessons': '{n} уроков на alaqai', 'g.month': 'изменение', 'g.chart': 'Верных ответов на каждом уроке, %', 'g.methods': 'Какая методика помогает', 'g.tasks': '{n} заданий', 'g.rec': 'Рекомендация', 'g.up': 'Три урока подряд выше 70% — можно перевести на уровень {l}.', 'g.down': 'Три урока подряд ниже 50% — переведите на уровень {l} и помогите.', 'g.keep': 'Уровень подходит. Продолжайте.', 'g.best': 'Чаще давать «{m}».', 'g.moveTo': 'Перевести на {l}', 'g.stay': 'Оставить {l}', 'g.note': 'Заметка учителя', 'g.ai': 'Анализ ИИ', 'g.aiErr': 'ИИ не ответил: ', 'g.noData': 'У этого ученика ещё нет результатов.', 'g.decide': 'Решение принимает учитель.', 'g.trend': 'Стрелка — изменение от первого урока к последнему, %', 'g.saved': 'Сохранено', 'g.steps': 'Пошагово', 'g.example': 'Разбор примера', 'g.error': 'Найди ошибку', 'g.common': 'Общее задание' },
  en: { 'g.level': 'level', 'g.title': 'Student growth', 'g.empty': 'No results yet. After lessons on alaqai each student’s growth appears here.', 'g.noClass': 'Add a class first.', 'g.attn': 'Needs attention', 'g.below50x3': 'below 50% three lessons in a row', 'g.absent2': 'missed the last 2 lessons', 'g.lessons': '{n} lessons on alaqai', 'g.month': 'change', 'g.chart': 'Correct answers per lesson, %', 'g.methods': 'Which method helps', 'g.tasks': '{n} tasks', 'g.rec': 'Suggestion', 'g.up': 'Above 70% three lessons in a row — can move to level {l}.', 'g.down': 'Below 50% three lessons in a row — move to level {l} and support.', 'g.keep': 'The level fits. Keep going.', 'g.best': 'Give «{m}» more often.', 'g.moveTo': 'Move to {l}', 'g.stay': 'Keep {l}', 'g.note': 'Teacher’s note', 'g.ai': 'AI analysis', 'g.aiErr': 'AI did not answer: ', 'g.noData': 'No results for this student yet.', 'g.decide': 'The teacher decides.', 'g.trend': 'Arrow — change from the first lesson to the last, %', 'g.saved': 'Saved', 'g.steps': 'Step by step', 'g.example': 'Worked example', 'g.error': 'Find the mistake', 'g.common': 'Common task' }
});

const initials = n => String(n || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

function chart(byLesson) {
  const W = 640, H = 200, x0 = 46, x1 = 626, y = p => 175 - p * 1.5;
  const n = byLesson.length, xs = i => n < 2 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1);
  const pts = byLesson.map((l, i) => `${xs(i).toFixed(1)},${y(l.pct).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${byLesson.map(l => l.pct + '%').join(', ')}" style="width:100%;height:auto;display:block" data-chart>
    <g stroke="#EDEDE7" stroke-width="1.5">${[0, 50, 70, 100].map(p => `<line x1="${x0}" y1="${y(p)}" x2="${x1}" y2="${y(p)}"/>`).join('')}</g>
    <g font-family="Inter,sans-serif" font-size="13" fill="#6B6B72">${[0, 50, 70, 100].map(p => `<text x="${x0 - 10}" y="${y(p) + 4}" text-anchor="end">${p}</text>`).join('')}</g>
    ${n > 1 ? `<polyline fill="none" stroke="#2563EB" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/>` : ''}
    <g fill="#2563EB">${byLesson.map((l, i) => `<circle cx="${xs(i).toFixed(1)}" cy="${y(l.pct).toFixed(1)}" r="${i === n - 1 ? 7 : 5}"/>`).join('')}</g>
    ${n ? `<text x="${xs(n - 1) - 6}" y="${y(byLesson[n - 1].pct) - 14}" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#0B0B0C" text-anchor="end">${byLesson[n - 1].pct}%</text>` : ''}</svg>`;
}

export async function render(main, { args, query }) {
  const [classes, students, attempts] = await Promise.all([db.classes.list(), db.students.list(), db.attempts.list()]);
  if (!classes.length) { main.innerHTML = html`<div class="wrap"><h1>${t('g.title')}</h1><div class="empty">${t('g.noClass')}<a class="btn sm" href="#/classes">${t('nav.classes')}</a></div></div>`.toString(); return; }
  const picked = students.find(s => s.id === args[0]);
  const st = { classId: (picked && picked.classId) || query.classId || classes[0].id, studentId: picked ? picked.id : null };

  function draw() {
    const list = students.filter(s => s.classId === st.classId).sort((a, b) => a.name.localeCompare(b.name, 'kk'));
    const sums = new Map(list.map(s => [s.id, studentSummary(attempts, s.id)]));
    const lag = lagging(attempts.filter(a => a.classId === st.classId), list);
    if (!st.studentId || !list.some(s => s.id === st.studentId)) st.studentId = (list.find(s => sums.get(s.id).byLesson.length) || list[0] || {}).id || null;
    const s = list.find(x => x.id === st.studentId), sum = s ? sums.get(s.id) : null;
    const level = s ? s.level || 'B' : 'B', sug = sum ? suggestLevel(sum, level) : null;
    const arrow = n => n > 0 ? `<span style="color:var(--ok);font-weight:700">↑ ${n}</span>` : n < 0 ? `<span style="color:var(--bad);font-weight:700">↓ ${-n}</span>` : '<span style="color:var(--ink2);font-weight:700">0</span>';
    main.innerHTML = html`<div class="wrap">
      <div class="row" style="justify-content:space-between;align-items:center"><h1>${t('g.title')}</h1>
        <div class="row" style="gap:8px">${classes.map(c => html`<button type="button" class="btn sm${c.id === st.classId ? ' k' : ''}" data-cls="${c.id}">${c.name}</button>`)}</div></div>
      ${lag.length ? html`<div class="attn" data-attn><h3>${t('g.attn')}</h3>${lag.map(l => { const x = list.find(y => y.id === l.studentId); return html`<button type="button" class="link-btn" style="color:var(--ink);text-align:left" data-pick="${l.studentId}">${x ? x.name : ''} — <span class="muted">${t('g.' + l.reason)}</span></button>`; })}</div>` : ''}
      ${!attempts.some(a => a.classId === st.classId) ? html`<div class="empty">${t('g.empty')}</div>` : ''}
      <div class="row" style="align-items:flex-start;gap:20px">
        <section class="card" style="flex:1 1 260px;min-width:0;padding:14px;display:flex;flex-direction:column;gap:2px">
          ${list.map(x => { const m = sums.get(x.id); return html`<button type="button" data-st="${x.id}" class="row" style="align-items:center;gap:12px;padding:10px 12px;border-radius:14px;border:0;cursor:pointer;text-align:left;background:${x.id === st.studentId ? 'var(--acc-soft)' : 'transparent'}"><span class="lv ${x.level || 'B'}">${x.level || 'B'}</span><span class="grow" style="font-weight:600">${x.name}</span>${m.byLesson.length ? html`${raw(arrow(m.trend))}` : ''}</button>`; })}
          <span class="sub" style="padding:8px 12px 2px">${t('g.trend')}</span>
        </section>
        ${s ? html`<div style="flex:999 1 520px;min-width:0;display:flex;flex-direction:column;gap:20px">
          <section class="card" style="display:flex;flex-direction:column;gap:16px">
            <div class="row" style="align-items:center;gap:14px">
              <span class="ava" style="width:56px;height:56px;font:700 20px var(--f-head)">${initials(s.name)}</span>
              <div class="grow"><div style="font:700 26px var(--f-head)">${s.name}</div><div style="color:var(--ink2)">${(classes.find(c => c.id === s.classId) || {}).name || ''} · ${t('g.level')} <b>${level}</b> · ${t('g.lessons', { n: sum.byLesson.length })}</div></div>
              ${sum.byLesson.length > 1 ? html`<div style="text-align:right"><div style="font:800 34px var(--f-head);color:${sum.trend >= 0 ? 'var(--ok)' : 'var(--bad)'}">${sum.trend >= 0 ? '+' : ''}${sum.trend}%</div><div class="sub">${t('g.month')}</div></div>` : ''}
            </div>
            ${sum.byLesson.length ? html`<div><div class="lbl" style="margin-bottom:8px">${t('g.chart')}</div>${raw(chart(sum.byLesson))}</div>` : html`<div class="empty">${t('g.noData')}</div>`}
          </section>
          <div class="row" style="gap:20px;align-items:stretch">
            <section class="card" style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:14px">
              <h2 style="font-size:22px">${t('g.methods')}</h2>
              ${sum.byMethod.map((m, i) => html`<div data-mbar="${m.method}"><div class="row" style="justify-content:space-between;margin-bottom:6px"><b>${t('g.' + m.method)}</b><span><b>${m.pct}%</b> <span class="muted">· ${t('g.tasks', { n: m.n })}</span></span></div><div class="bar"><i style="width:${m.pct}%;background:${i === 0 ? 'var(--ink)' : '#9A9AA2'}"></i></div></div>`)}
            </section>
            <section class="card dark" style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:14px">
              <div style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#8AB4FF;text-transform:uppercase">${t('g.rec')}</div>
              <p style="margin:0;font:600 19px/1.4 var(--f-body)" data-rec>${sug ? t(sug > level ? 'g.up' : 'g.down', { l: sug }) : t('g.keep')} ${sum.best ? t('g.best', { m: t('g.' + sum.best) }) : ''}</p>
              ${sug ? html`<div class="row" style="gap:10px"><button type="button" class="btn b" ${sug > level ? 'data-up' : 'data-down'}="${sug}">${t('g.moveTo', { l: sug })}</button><button type="button" class="btn" style="background:#1F1F23;border-color:#3C3C42;color:#fff" data-keep>${t('g.stay', { l: level })}</button></div>` : ''}
              <span style="font-size:13px;color:#C9C9CF">${t('g.decide')}</span>
              <button type="button" class="btn sm" style="align-self:flex-start;background:#1F1F23;border-color:#3C3C42;color:#fff" data-ai>${t('g.ai')}</button>
              <label class="field"><span>${t('g.note')}</span><textarea data-note style="min-height:70px;border:0">${s.note || ''}</textarea></label>
            </section>
          </div></div>` : ''}
      </div></div>`.toString();

    main.querySelectorAll('[data-cls]').forEach(b => { b.onclick = () => { st.classId = b.dataset.cls; st.studentId = null; draw(); }; });
    main.querySelectorAll('[data-st],[data-pick]').forEach(b => { b.onclick = () => { st.studentId = b.dataset.st || b.dataset.pick; draw(); }; });
    if (!s) return;
    main.querySelectorAll('[data-up],[data-down]').forEach(b => { b.onclick = async () => { const l = b.dataset.up || b.dataset.down; await db.students.update(s.id, { level: l }); s.level = l; toast(t('g.saved')); draw(); }; });
    const keep = main.querySelector('[data-keep]'); if (keep) keep.onclick = () => toast(t('g.saved'));
    const note = main.querySelector('[data-note]'); if (note) note.onchange = async () => { await db.students.update(s.id, { note: note.value.trim() }); s.note = note.value.trim(); };
    main.querySelector('[data-ai]').onclick = async e => {
      e.target.disabled = true;
      try {
        const r = await generateJSON(`Учитель из Казахстана смотрит рост ученика. Уровень сейчас ${level} (A — базовый, B — средний, C — высокий).
Результаты по урокам (% верных): ${sum.byLesson.map(l => l.pct).join(', ') || 'нет'}. По методикам: ${sum.byMethod.map(m => `${m.method} ${m.pct}% (${m.n})`).join('; ') || 'нет'}.
Дай 2–3 коротких совета учителю: какую методику давать, нужен ли другой уровень, на что обратить внимание. Пиши на языке: ${({ kk: 'казахский', ru: 'русский', en: 'английский' })[document.documentElement.lang] || 'русский'}.
Верни JSON {"text":"…"}.`, { temperature: 0.4 });
        main.querySelector('[data-rec]').textContent = r.text || '';
      } catch (err) { toast(t('g.aiErr') + (err.message || err)); }
      e.target.disabled = false;
    };
  }
  draw();
}
