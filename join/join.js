/* Student app (alaqai.online/join): code → name → a task picked for me (the level is never shown), method
 * choice, help, break screen, ranking. Polls the live lesson every 2 s. */
import { mountPlayer } from '../app/js/deck/player.js';

const D = {
  kk: { code: 'Кодты енгіз', codeHint: 'Мұғалім берген сабақ коды', go: 'Кіру', who: 'Сен кімсің?', taken: 'кірді', notFound: 'Мұндай код жоқ. Кодты тексер.', ended: 'Сабақ аяқталды. Рахмет!', offline: 'Серверге қосылу мүмкін болмады. Интернетті тексер.', help: 'Көмек керек', helpSent: 'Мұғалім көрді', methods: 'Саған қалай ыңғайлы?', steps: 'Қадам бойынша', stepsT: 'Тапсырма қадамдарға бөлінген', example: 'Үлгіні талдау', exampleT: 'Алдымен дайын үлгі, кейін өзің', error: 'Қатені тап', errorT: 'Қатесі бар код — тауып, түзет', wait: 'Мұғалімнің тапсырмасын күт…', notebook: 'Бұл тапсырманы дәптерге орында — мұғалім өзі тексереді.', grade: 'Бағаң: {g}', breakT: 'Экраннан демалыс', eyes: ['Монитордан алысқа 20 секунд қара', 'Көзіңді 5 рет қатты жұмып аш', 'Көзіңмен шеңбер сыз — оңға, солға'], top: 'Үздік бестік', place: 'Сенің орның: {p} / {n}', change: 'Басқа оқушы', back: 'Артқа', privacy: 'Құпиялылық саясаты' },
  ru: { code: 'Введи код', codeHint: 'Код урока от учителя', go: 'Войти', who: 'Кто ты?', taken: 'уже вошёл', notFound: 'Такого кода нет. Проверь код.', ended: 'Урок закончился. Спасибо!', offline: 'Нет связи с сервером. Проверь интернет.', help: 'Нужна помощь', helpSent: 'Учитель видит', methods: 'Как тебе удобнее?', steps: 'Пошагово', stepsT: 'Задача по шагам, с подсказками', example: 'Разбор примера', exampleT: 'Сначала готовый пример, потом сам', error: 'Найди ошибку', errorT: 'Код с ошибкой — найди и исправь', wait: 'Жди задание учителя…', notebook: 'Это задание сделай в тетради — учитель проверит сам.', grade: 'Твоя оценка: {g}', breakT: 'Отдых от экрана', eyes: ['Посмотри вдаль 20 секунд', 'Крепко зажмурься и открой глаза 5 раз', 'Нарисуй глазами круг — вправо и влево'], top: 'Лучшая пятёрка', place: 'Твоё место: {p} из {n}', change: 'Другой ученик', back: 'Назад', privacy: 'Политика конфиденциальности' },
  en: { code: 'Enter the code', codeHint: 'Lesson code from your teacher', go: 'Join', who: 'Who are you?', taken: 'joined', notFound: 'No such code. Check it.', ended: 'The lesson is over. Thank you!', offline: 'Cannot reach the server. Check the internet.', help: 'I need help', helpSent: 'Teacher can see', methods: 'Which way suits you?', steps: 'Step by step', stepsT: 'The task split into steps', example: 'Worked example', exampleT: 'A solved example first, then you', error: 'Find the mistake', errorT: 'Code with a mistake — find and fix it', wait: 'Wait for the teacher’s task…', notebook: 'Do this task in your notebook — the teacher checks it.', grade: 'Your grade: {g}', breakT: 'Screen break', eyes: ['Look far away for 20 seconds', 'Close your eyes tight and open them 5 times', 'Draw a circle with your eyes — both ways'], top: 'Top five', place: 'Your place: {p} of {n}', change: 'Another student', back: 'Back', privacy: 'Privacy policy' }
};
const L = () => (window.AlaqaiLang && D[window.AlaqaiLang.get()]) ? window.AlaqaiLang.get() : 'kk';
const T = (k, v) => { let s = (D[L()] || D.kk)[k]; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const API = () => window.ALAQAI_API_BASE || '';
const root = document.getElementById('root');
const METHODS = ['steps', 'example', 'error'];

function device() {
  try { let d = localStorage.getItem('alaqai_device'); if (!d) { d = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2); localStorage.setItem('alaqai_device', d); } return d; } catch (e) { return 'tmp'; }
}
const saved = code => { try { return JSON.parse(localStorage.getItem('alaqai_live:' + code) || 'null'); } catch (e) { return null; } };
const save = (code, v) => { try { v ? localStorage.setItem('alaqai_live:' + code, JSON.stringify(v)) : localStorage.removeItem('alaqai_live:' + code); } catch (e) { /* private mode */ } };

async function api(method, path, body) {
  let r;
  try { r = await fetch(API() + '/api/live/' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { return { status: 0, data: null }; }
  return { status: r.status, data: await r.json().catch(() => null) };
}

const top = () => `<header class="jtop"><a class="jlogo" href="./"><b>ala<i>q</i>ai</b><span>.online</span></a>
  <div class="langs" style="padding:0">${['kk', 'ru', 'en'].map(l => `<button type="button" data-lang="${l}" class="${l === L() ? 'on' : ''}">${{ kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' }[l]}</button>`).join('')}</div></header>`;
function bindLang(redraw) { root.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => { window.AlaqaiLang.set(b.dataset.lang); redraw(); }; }); }

/* ---------- 1. code ---------- */
function codeScreen(prefill = '', error = '') {
  stop();
  root.innerHTML = `${top()}<main class="jmain"><div class="jcol"><form class="jcard center" data-form>
    <h1>${T('code')}</h1><p class="muted" style="margin:0">${T('codeHint')}</p>
    <input class="jcode" data-code inputmode="numeric" autocomplete="off" maxlength="6" value="${esc(prefill)}" aria-label="${T('code')}">
    <div class="jerr" role="alert" ${error ? '' : 'hidden'}>${esc(error)}</div>
    <button class="btn b lg" data-go style="width:min(420px,100%)">${T('go')}</button></form>
    <p class="muted" style="text-align:center;font-size:13px;margin:14px 0 0"><a href="../privacy/" style="color:inherit">${T('privacy')}</a></p></div></main>`;
  bindLang(() => codeScreen(root.querySelector('[data-code]').value, error));
  const inp = root.querySelector('[data-code]');
  inp.oninput = () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); };
  root.querySelector('[data-form]').onsubmit = e => { e.preventDefault(); openCode(inp.value); };
  inp.focus();
}

async function openCode(code) {
  code = String(code || '').replace(/\D/g, '');
  if (code.length !== 6) { codeScreen(code, T('notFound')); return; }
  const mine = saved(code);
  if (mine) { taskScreen(code, mine); return; }
  const r = await api('GET', code);
  if (r.status === 404) return codeScreen(code, T('notFound'));
  if (r.status === 410) return endedScreen();
  if (r.status !== 200) return codeScreen(code, T('offline'));
  namesScreen(code, r.data);
}

/* ---------- 2. who are you ---------- */
function namesScreen(code, info, error = '') {
  root.innerHTML = `${top()}<main class="jmain"><div class="jcol">
    <div class="jcard center"><div class="chip ok">✓ ${esc([info.className, info.topic].filter(Boolean).join(' · '))}</div></div>
    <div class="jcard"><h2 style="font-size:26px">${T('who')}</h2>
      <div class="jerr" role="alert" ${error ? '' : 'hidden'}>${esc(error)}</div>
      <div class="jnames">${info.students.map(s => `<button type="button" data-student="${esc(s.id)}" ${s.taken ? 'disabled' : ''}>${esc(s.name)}${s.taken ? ` · ${T('taken')}` : ''}</button>`).join('')}</div>
      <button type="button" class="btn ghost" data-back>${T('back')}</button></div></div></main>`;
  bindLang(() => namesScreen(code, info, error));
  root.querySelector('[data-back]').onclick = () => codeScreen('');
  root.querySelectorAll('[data-student]').forEach(b => { b.onclick = async () => {
    const r = await api('POST', code + '/join', { studentId: b.dataset.student, device: device() });
    if (r.status === 409) { const fresh = await api('GET', code); return namesScreen(code, fresh.data || info, T('taken')); }
    if (r.status !== 200) return namesScreen(code, info, T('offline'));
    const me = { token: r.data.token, studentId: b.dataset.student, name: b.textContent.trim() };
    save(code, me);
    taskScreen(code, me);
  }; });
}

/* ---------- 3. task ---------- */
let timer = null, player = null;
function stop() { clearTimeout(timer); timer = null; if (player) { player.destroy(); player = null; } }

function taskScreen(code, me) {
  stop();
  let st = null, key = null, help = false;
  root.innerHTML = `<header class="shead"><a class="jlogo" href="./"><b>ala<i>q</i>ai</b></a>
      <div class="who">${esc(me.name)} <small data-class></small></div>
      <button type="button" class="btn sm helpbtn" data-help>${T('help')}</button></header>
    <div class="sbody">
      <aside class="methods"><h2>${T('methods')}</h2>${METHODS.map(m => `<button type="button" class="mt" data-method="${m}" aria-pressed="false"><b>${T(m)}</b><span>${T(m + 'T')}</span></button>`).join('')}</aside>
      <main class="swork">
        <div class="rank" data-ranking hidden></div>
        <div class="note" data-note hidden></div>
        <div class="brk" data-break hidden></div>
        <div class="wait" data-wait hidden>${T('wait')}</div>
        <div data-stage></div>
      </main></div>`;
  const $ = s => root.querySelector(s);
  const reported = new Set(); // one answer per slide of a task: pressing «Check» again adds nothing
  player = mountPlayer($('[data-stage]'), { slides: [] }, { lang: 'kk', onResult: m => {
    const k = `${key}|${m.slide}`;
    if (reported.has(k)) return;
    reported.add(k);
    api('POST', code + '/answer', { token: me.token, method: st ? st.method : 'steps', template: m.template, correct: m.correct, total: m.total });
  } });
  $('[data-help]').onclick = async () => { help = true; $('[data-help]').classList.add('on'); $('[data-help]').textContent = T('helpSent'); await api('POST', code + '/help', { token: me.token }); };
  root.querySelectorAll('[data-method]').forEach(b => { b.onclick = async () => { await api('POST', code + '/method', { token: me.token, method: b.dataset.method }); poll(true); }; });

  function paint() {
    root.querySelectorAll('[data-method]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.method === st.method)));
    root.querySelector('.methods').hidden = st.mode === 'common' || st.mode === 'slides';
    if (st.status === 'done' || st.status === 'work') { if (help && st.status === 'done') { help = false; $('[data-help]').classList.remove('on'); $('[data-help]').textContent = T('help'); } }
    // ranking
    const rk = $('[data-ranking]');
    if (st.ranking && st.ranking.mode === 'top5') { rk.hidden = false; rk.innerHTML = `<h3>${T('top')}</h3><ol>${st.ranking.top.map(x => `<li class="${x.name === me.name ? 'me' : ''}">${esc(x.name)} — ${x.score}</li>`).join('')}</ol>`; }
    else if (st.ranking && st.ranking.mode === 'place' && st.ranking.place) { rk.hidden = false; rk.innerHTML = `<h3>${T('place', { p: st.ranking.place, n: st.ranking.of })}</h3>`; }
    else rk.hidden = true;
    // notebook / grade
    const note = $('[data-note]');
    const lines = []; if (st.mode === 'notebook') lines.push(T('notebook')); if (st.grade) lines.push(T('grade', { g: st.grade }));
    note.hidden = !lines.length; note.textContent = lines.join(' ');
    // break
    const brk = $('[data-break]');
    if (st.break) {
      const m = Math.floor(st.break.secondsLeft / 60), s = String(st.break.secondsLeft % 60).padStart(2, '0');
      brk.hidden = false;
      brk.innerHTML = `<h2>${T('breakT')}</h2><div class="t">${m}:${s}</div>${st.break.text ? `<div class="task">${esc(st.break.text)}</div>` : ''}<ol>${T('eyes').map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    } else brk.hidden = true;
    const showTask = !st.break && st.task && st.task.length;
    player.el.hidden = !showTask;
    $('[data-wait]').hidden = !!(st.break || showTask);
    if (showTask && st.taskKey !== key) { key = st.taskKey; player.setDeck({ lang: st.lang || 'kk', slides: st.task }, 0); }
  }

  async function poll(once) {
    const r = await api('GET', `${code}/state?token=${encodeURIComponent(me.token)}`);
    if (r.status === 410) { save(code, null); return endedScreen(); }
    if (r.status === 401 || r.status === 404) { save(code, null); return openCode(code); }
    if (r.status === 200) { st = r.data; paint(); }
    if (!once) timer = setTimeout(() => poll(false), 2000);
  }
  poll(false);
}

function endedScreen() {
  stop();
  root.innerHTML = `${top()}<main class="jmain"><div class="jcol"><div class="jcard center" data-ended><h1>${T('ended')}</h1><a class="btn" href="./">${T('go')}</a></div></div></main>`;
  bindLang(endedScreen);
}

const c = new URLSearchParams(location.search).get('c');
if (c) openCode(c); else codeScreen('');
