/* Live lesson, teacher screen (mockup 5): code + QR, students by status,
 * task mode, screen time with a break, ranking, levels and notebook grades. */
import { add, t } from '../i18n.js';
import { html, icon, openModal, confirmModal, toast } from '../ui.js';
import { db } from '../data/store.js';
import { mountPlayer } from '../deck/player.js';
import { IC } from '../shell.js';

add({
  kk: { 'lv.pick': 'Қай сабақты өткізесіз?', 'lv.none': 'Әзірге сабақ жоқ — алдымен сабақ құрыңыз.', 'lv.run': 'Өткізу', 'lv.live': 'Сабақ жүріп жатыр', 'lv.end': 'Аяқтау', 'lv.endQ': 'Сабақты аяқтау керек пе? Оқушылардың экраны жабылады.', 'lv.join': 'Кіру коды', 'lv.joined': 'кірді', 'lv.done': 'шешті', 'lv.work': 'шешуде', 'lv.help': 'көмек сұрайды', 'lv.off': 'кірмеген', 'lv.task': 'Тапсырма', 'lv.levels': 'Деңгей бойынша', 'lv.common': 'Жалпы', 'lv.notebook': 'Дәптерде', 'lv.slides': 'Слайд', 'lv.next': 'Келесі тапсырма', 'lv.screen': 'Компьютерде', 'lv.min': 'мин', 'lv.break': 'Экраннан үзіліс 5 мин', 'lv.breakText': 'Дәптерге тапсырма', 'lv.breakDef': 'Дәптерге бүгінгі кодтың блок-схемасын сыз', 'lv.breakStop': 'Үзілісті тоқтату', 'lv.breakLeft': 'Үзіліс: {t}', 'lv.near': 'Лимитке жақын — үзіліс жасаңыз', 'lv.over': 'Лимит асты — компьютерді өшіртіңіз', 'lv.rank': 'Рейтинг', 'lv.top5': 'Топ-5 тақтаға', 'lv.place': 'Әр оқушыға орны', 'lv.hide': 'Жасыру', 'lv.level': 'Деңгейі', 'lv.grade': 'Бағасы (дәптер)', 'lv.method': 'Әдіс: {m}', 'lv.login': 'Сабақ өткізу үшін аккаунтқа кіріңіз.', 'lv.signin': 'Кіру', 'lv.offline': 'alaqai серверімен байланыс жоқ. Интернетті тексеріңіз.', 'lv.click': 'Оқушыны басыңыз: деңгейін ауыстыру немесе дәптердегі жұмысқа баға қою.', 'lv.steps': 'Қадам бойынша', 'lv.example': 'Үлгіні талдау', 'lv.error': 'Қатені тап', 'lv.prev': 'Артқа', 'lv.nextSlide': 'Алға' },
  ru: { 'lv.pick': 'Какой урок проводите?', 'lv.none': 'Уроков пока нет — сначала создайте урок.', 'lv.run': 'Провести', 'lv.live': 'Урок идёт', 'lv.end': 'Завершить', 'lv.endQ': 'Завершить урок? Экраны учеников закроются.', 'lv.join': 'Код урока', 'lv.joined': 'подключились', 'lv.done': 'решили', 'lv.work': 'решают', 'lv.help': 'просят помощь', 'lv.off': 'не вошли', 'lv.task': 'Задание', 'lv.levels': 'По уровням', 'lv.common': 'Общее', 'lv.notebook': 'В тетради', 'lv.slides': 'Слайд', 'lv.next': 'Следующее задание', 'lv.screen': 'За компьютером', 'lv.min': 'мин', 'lv.break': 'Перерыв от экрана 5 мин', 'lv.breakText': 'Задание в тетради', 'lv.breakDef': 'Нарисуйте в тетради блок-схему сегодняшнего кода', 'lv.breakStop': 'Закончить перерыв', 'lv.breakLeft': 'Перерыв: {t}', 'lv.near': 'Близко к лимиту — сделайте перерыв', 'lv.over': 'Лимит превышен — выключите компьютеры', 'lv.rank': 'Рейтинг', 'lv.top5': 'Топ-5 на доску', 'lv.place': 'Каждому его место', 'lv.hide': 'Скрыть', 'lv.level': 'Уровень', 'lv.grade': 'Оценка (тетрадь)', 'lv.method': 'Методика: {m}', 'lv.login': 'Чтобы провести урок, войдите в аккаунт.', 'lv.signin': 'Войти', 'lv.offline': 'Нет связи с сервером alaqai. Проверьте интернет.', 'lv.click': 'Нажмите на ученика: поменять уровень или поставить оценку за тетрадь.', 'lv.steps': 'Пошагово', 'lv.example': 'Разбор примера', 'lv.error': 'Найди ошибку', 'lv.prev': 'Назад', 'lv.nextSlide': 'Вперёд' },
  en: { 'lv.pick': 'Which lesson are you running?', 'lv.none': 'No lessons yet — create one first.', 'lv.run': 'Run', 'lv.live': 'Lesson in progress', 'lv.end': 'Finish', 'lv.endQ': 'Finish the lesson? Student screens will close.', 'lv.join': 'Lesson code', 'lv.joined': 'joined', 'lv.done': 'solved', 'lv.work': 'working', 'lv.help': 'need help', 'lv.off': 'not in', 'lv.task': 'Task', 'lv.levels': 'By level', 'lv.common': 'Common', 'lv.notebook': 'Notebook', 'lv.slides': 'Slide', 'lv.next': 'Next task', 'lv.screen': 'At the computer', 'lv.min': 'min', 'lv.break': '5-minute screen break', 'lv.breakText': 'Notebook task', 'lv.breakDef': 'Draw a flowchart of today’s code in your notebook', 'lv.breakStop': 'End the break', 'lv.breakLeft': 'Break: {t}', 'lv.near': 'Close to the limit — take a break', 'lv.over': 'Limit passed — switch the computers off', 'lv.rank': 'Ranking', 'lv.top5': 'Top 5 on the board', 'lv.place': 'Each student’s place', 'lv.hide': 'Hide', 'lv.level': 'Level', 'lv.grade': 'Grade (notebook)', 'lv.method': 'Method: {m}', 'lv.login': 'Sign in to run a lesson.', 'lv.signin': 'Sign in', 'lv.offline': 'Cannot reach the alaqai server. Check the internet.', 'lv.click': 'Click a student to change the level or grade notebook work.', 'lv.steps': 'Step by step', 'lv.example': 'Worked example', 'lv.error': 'Find the mistake', 'lv.prev': 'Back', 'lv.nextSlide': 'Next' }
});

const base = () => window.ALAQAI_API_BASE || '';
const joinUrl = code => (window.ALAQAI_JOIN_URL || 'https://alaqai.online/join/') + '?c=' + code;
async function api(method, path, body) {
  try {
    const r = await fetch(base() + '/api/live' + path, { method, credentials: 'include', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, data: await r.json().catch(() => null) };
  } catch (e) { return { status: 0, data: null }; }
}
let qrLoading = null;
function loadQR() {
  if (!qrLoading) qrLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = new URL('../../vendor/qrcode.js', import.meta.url).href; s.onload = () => res(window.qrcode); s.onerror = rej; document.head.appendChild(s); });
  return qrLoading;
}
const COLORS = { done: 'background:var(--ok-soft);border:2px solid var(--ok)', work: 'background:#fff;border:2px solid var(--line)', help: 'background:var(--warn-soft);border:2px solid var(--warn-line)', off: 'background:var(--bg);border:2px dashed var(--line2)' };
const STXT = { done: 'color:var(--ok);font-weight:700', work: 'color:var(--ink2);font-weight:600', help: 'color:var(--warn);font-weight:700', off: 'color:var(--muted);font-weight:600' };

async function picker(main) {
  const [lessons, classes] = await Promise.all([db.lessons.list(), db.classes.list()]);
  const cname = id => (classes.find(c => c.id === id) || {}).name || '';
  main.innerHTML = html`<div class="wrap" style="padding:36px 24px"><h1>${t('lv.pick')}</h1><section class="card">
    ${lessons.length ? lessons.slice().reverse().map(l => html`<div class="list-row"><div class="grow"><div class="ttl">${l.topic}</div><div class="sub">${[cname(l.classId), l.subject].filter(Boolean).join(' · ')}</div></div><a class="btn sm b" href="#/live/${l.id}">${t('lv.run')}</a></div>`)
      : html`<div class="empty">${t('lv.none')}<a class="btn b sm" href="#/new">${t('nav.create')}</a></div>`}</section></div>`.toString();
}

export async function render(main, { args }) {
  if (!args[0]) { document.getElementById('shell').classList.remove('bare'); return picker(main); }
  const lessonId = args[0];
  const opened = await api('POST', '', { lessonId });
  if (opened.status !== 200) {
    const msg = opened.status === 401 ? t('lv.login') : opened.status === 0 ? t('lv.offline') : (opened.data && opened.data.error) || 'error';
    main.innerHTML = html`<div class="wrap" style="padding:40px 24px"><div class="empty" role="alert">${msg}${opened.status === 401 ? html`<a class="btn b sm" href="#/login?next=${encodeURIComponent('#/live/' + lessonId)}">${t('lv.signin')}</a>` : ''}<a class="btn sm" href="#/lessons">${t('nav.lessons')}</a></div></div>`.toString();
    return;
  }
  const code = opened.data.code;
  const lesson = await db.lessons.get(lessonId);
  const pres = lesson && lesson.parts ? await db.presentations.get(lesson.parts.presentationId) : null;
  const slides = (pres && pres.deck && pres.deck.slides) || [];
  let board = null, timer = null, gone = false, player = null, breakText = t('lv.breakDef');

  main.innerHTML = html`
    <header class="lhead" style="background:var(--ink);color:#fff;border:0">
      <span class="chip" style="background:#1F1F23;color:#fff"><i style="width:10px;height:10px;border-radius:50%;background:#4ADE80;display:inline-block"></i>${t('lv.live')}</span>
      <div class="grow" style="min-width:220px"><div style="font:700 20px var(--f-head)" data-title>${lesson ? lesson.topic : ''}</div><div style="font-size:14px;color:#C9C9CF" data-sub></div></div>
      <span style="font:700 24px var(--f-head);font-variant-numeric:tabular-nums" data-clock>0 ${t('lv.min')}</span>
      <button type="button" class="btn" style="background:#fff" data-end>${t('lv.end')}</button>
    </header>
    <div class="row" style="align-items:flex-start;gap:24px;padding:24px">
      <main style="flex:999 1 600px;min-width:0;display:flex;flex-direction:column;gap:16px">
        <div class="row" style="gap:12px" data-stats></div>
        <div class="rank" data-top hidden style="padding:20px 24px;border-radius:22px;background:var(--ink);color:#fff"></div>
        <div data-slidebox hidden class="stagebox" style="padding:0"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px" data-cards></div>
        <p class="muted" style="margin:0;font-size:14px">${t('lv.click')}</p>
      </main>
      <aside style="flex:1 1 330px;min-width:0;display:flex;flex-direction:column;gap:16px">
        <section class="card" style="display:flex;gap:18px;align-items:center;padding:20px">
          <div data-qr style="width:128px;height:128px;flex:none"></div>
          <div style="min-width:0"><div class="sub" style="font-weight:600">${t('lv.join')} · alaqai.online/join</div><div data-code style="font:800 36px/1.1 var(--f-head);letter-spacing:.04em;margin-top:4px;white-space:nowrap">${code.slice(0, 3)} ${code.slice(3)}</div></div>
        </section>
        <section class="card" style="display:flex;flex-direction:column;gap:12px;padding:20px">
          <h2 style="font-size:20px">${t('lv.task')}</h2>
          <div class="seg" style="flex-wrap:wrap">${['levels', 'common', 'notebook', 'slides'].map(m => html`<button type="button" data-mode="${m}">${t('lv.' + m)}</button>`)}</div>
          <button type="button" class="btn b" data-next>${t('lv.next')}</button>
        </section>
        <section class="card" style="display:flex;flex-direction:column;gap:12px;padding:20px" data-screen></section>
        <section class="card" style="display:flex;flex-direction:column;gap:10px;padding:20px">
          <h2 style="font-size:20px">${t('lv.rank')}</h2>
          <div class="row" style="gap:8px"><button type="button" class="btn sm" data-rank="top5">${t('lv.top5')}</button><button type="button" class="btn sm" data-rank="place">${t('lv.place')}</button><button type="button" class="btn sm ghost" data-rank="off">${t('lv.hide')}</button></div>
        </section>
      </aside>
    </div>`.toString();
  const $ = s => main.querySelector(s);

  loadQR().then(qrcode => { try { if (qrcode.stringToBytesFuncs) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']; const q = qrcode(0, 'M'); q.addData(joinUrl(code)); q.make(); $('[data-qr]').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { /* code alone is enough */ } }).catch(() => {});

  const control = async body => { const r = await api('POST', `/${code}/control`, body); if (r.status === 200) { board = r.data; paint(); } else toast(t('lv.offline')); };

  function paint() {
    if (!board || gone) return;
    const s = board.students, count = k => s.filter(x => x.status === k).length;
    $('[data-sub]').textContent = [board.className, board.mode === 'slides' ? `${t('lv.slides')} ${board.slide + 1} / ${slides.length}` : ''].filter(Boolean).join(' · ');
    $('[data-clock]').textContent = `${board.minutes} ${t('lv.min')}`;
    $('[data-stats]').innerHTML = [['joined', `${s.length - count('off')} / ${s.length}`, t('lv.joined')], ['done', count('done'), t('lv.done')], ['work', count('work'), t('lv.work')], ['help', count('help'), t('lv.help')]]
      .map(([k, n, l]) => `<div class="card" data-stat="${k}" style="flex:1 1 140px;padding:14px 18px;border-radius:16px;${k === 'help' && count('help') ? 'background:var(--warn-soft);border-color:#F5C38A' : ''}"><b style="font:800 30px var(--f-head);${k === 'done' ? 'color:var(--ok)' : k === 'help' ? 'color:var(--warn)' : ''}">${n}</b> <span style="font-size:14px;color:var(--ink2);font-weight:500">${l}</span></div>`).join('');
    $('[data-cards]').innerHTML = s.map(x => html`<button type="button" data-card="${x.id}" data-status="${x.status}" style="display:flex;flex-direction:column;gap:8px;text-align:left;padding:14px 16px;border-radius:18px;cursor:pointer;${COLORS[x.status]}">
      <span class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><span style="font-size:17px;font-weight:600">${x.name}</span><span class="lv ${x.level}">${x.level}</span></span>
      <span style="font-size:14px;color:var(--ink2)">${x.method ? t('lv.method', { m: t('lv.' + x.method) }) : '—'}${x.total ? ` · ${x.correct}/${x.total}` : ''}${x.grade ? ` · ${x.grade}` : ''}</span>
      <span style="font-size:14px;${STXT[x.status]}">${t('lv.' + x.status)}</span></button>`.toString()).join('');
    main.querySelectorAll('[data-card]').forEach(c => { c.onclick = () => studentModal(s.find(x => x.id === c.dataset.card)); });
    main.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === board.mode));
    // screen time
    const pct = Math.min(100, Math.round(board.screenMinutes / board.limit * 100));
    const color = board.screenMinutes >= board.limit ? 'var(--bad)' : board.screenMinutes >= board.limit - 5 ? 'var(--warn-line)' : 'var(--acc)';
    const left = board.breakUntil ? Math.max(0, Math.round((Date.parse(board.breakUntil) - Date.now()) / 1000)) : 0;
    $('[data-screen]').innerHTML = html`<div class="row" style="justify-content:space-between;align-items:baseline"><h2 style="font-size:20px">${t('lv.screen')}</h2><b style="font:800 24px var(--f-head);color:${color}">${board.screenMinutes} / ${board.limit} ${t('lv.min')}</b></div>
      <div class="bar"><i style="width:${pct}%;background:${color}"></i></div>
      ${board.screenMinutes >= board.limit ? html`<div class="chip warn" style="background:var(--bad-soft);color:var(--bad)">${t('lv.over')}</div>` : board.screenMinutes >= board.limit - 5 ? html`<div class="chip warn">${t('lv.near')}</div>` : ''}
      ${left ? html`<div style="font:700 22px var(--f-head)" data-break-left>${t('lv.breakLeft', { t: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` })}</div><button type="button" class="btn" data-break-stop>${t('lv.breakStop')}</button>`
        : html`<label class="field"><span>${t('lv.breakText')}</span><input data-break-text value="${breakText}"></label><button type="button" class="btn k" data-break-start>${t('lv.break')}</button>`}`.toString();
    const bs = $('[data-break-start]'); if (bs) bs.onclick = () => { breakText = $('[data-break-text]').value.trim(); control({ break: { minutes: 5, text: breakText } }); };
    const bx = $('[data-break-text]'); if (bx) bx.oninput = () => { breakText = bx.value; };
    const be = $('[data-break-stop]'); if (be) be.onclick = () => control({ break: null });
    // top-5 on the board
    const top = $('[data-top]');
    if (board.ranking === 'top5') {
      const list = s.filter(x => x.total > 0).sort((a, b) => b.correct - a.correct || a.total - b.total).slice(0, 5);
      top.hidden = false; top.innerHTML = html`<h3 style="font:700 20px var(--f-head)">${t('lv.top5')}</h3><ol style="margin:6px 0 0;font-size:20px;line-height:1.6">${list.map(x => html`<li>${x.name} — ${x.correct}</li>`)}</ol>`.toString();
    } else top.hidden = true;
    // slides for the board
    const sb = $('[data-slidebox]');
    sb.hidden = board.mode !== 'slides';
    if (board.mode === 'slides' && !player && slides.length) {
      player = mountPlayer(sb, { lang: (lesson && lesson.lang) || 'kk', slides }, { lang: (lesson && lesson.lang) || 'kk', index: board.slide, onSlide: i => { if (i !== board.slide) control({ slide: i }); } });
    }
    if (board.mode !== 'slides' && player) { player.destroy(); player = null; }
  }

  function studentModal(x) {
    if (!x) return;
    const close = openModal({ title: x.name, body: html`<div class="field"><span>${t('lv.level')}</span><div class="row" style="gap:8px">${['A', 'B', 'C'].map(l => html`<button type="button" class="btn${l === x.level ? ' k' : ''}" data-setlevel="${l}" style="width:64px">${l}</button>`)}</div></div>
      <div class="field"><span>${t('lv.grade')}</span><div class="row" style="gap:8px">${[2, 3, 4, 5].map(g => html`<button type="button" class="btn${g === x.grade ? ' k' : ''}" data-grade="${g}" style="width:64px">${g}</button>`)}</div></div>`.toString() });
    document.querySelectorAll('.modal [data-setlevel]').forEach(b => { b.onclick = async () => { await control({ level: { studentId: x.id, level: b.dataset.setlevel } }); close(); }; });
    document.querySelectorAll('.modal [data-grade]').forEach(b => { b.onclick = async () => { await control({ grade: { studentId: x.id, grade: Number(b.dataset.grade) } }); close(); }; });
  }

  main.querySelectorAll('[data-mode]').forEach(b => { b.onclick = () => control({ mode: b.dataset.mode }); });
  $('[data-next]').onclick = () => control({ next: true });
  main.querySelectorAll('[data-rank]').forEach(b => { b.onclick = () => control({ ranking: b.dataset.rank === 'off' ? null : b.dataset.rank }); });
  $('[data-end]').onclick = async () => { if (!(await confirmModal(t('lv.endQ'), { yes: t('lv.end') }))) return; await control({ end: true }); gone = true; location.hash = '#/growth'; };

  async function poll() {
    if (gone) return;
    const r = await api('GET', `/${code}/board`);
    if (r.status === 200) { board = r.data; paint(); }
    timer = setTimeout(poll, 2000);
  }
  poll();
  return () => { gone = true; clearTimeout(timer); if (player) player.destroy(); };
}
