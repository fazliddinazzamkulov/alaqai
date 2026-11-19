/* Lesson without student devices: the teacher shows the whole lesson on the
 * board. The slide fills the screen (the 50-template engine with its own
 * arrows); two floating islands hold the lesson time and Finish at the top,
 * and the tools at the bottom: timer, random student, whiteboard, full screen.
 * The bottom island folds away so nothing covers the slide. Ideas from the
 * first version's lesson mode, without the parts that need student logins. */
import { add, t, lang } from '../i18n.js';
import { html, icon } from '../ui.js';
import { db } from '../data/store.js';
import { mountPlayer } from '../deck/player.js';

add({
  kk: { 'pr.finish': 'Аяқтау', 'pr.timer': 'Таймер', 'pr.pick': 'Оқушыны таңдау', 'pr.board': 'Тақта', 'pr.full': 'Толық экран', 'pr.hide': 'Жасыру', 'pr.show': 'Құралдар', 'pr.min': '{n} мин', 'pr.stop': 'Тоқтату', 'pr.timeUp': 'Уақыт бітті!', 'pr.noClass': 'Сабаққа сынып таңдалмаған — оқушылар тізімі жоқ.', 'pr.again': 'Тағы', 'pr.all': 'Барлығы шықты — тізім қайта басталады', 'pr.pen': 'Қалам', 'pr.eraser': 'Өшіргіш', 'pr.clear': 'Тазалау', 'pr.close': 'Жабу', 'pr.empty': 'Бұл сабақта презентация жоқ.', 'pr.notFound': 'Сабақ табылмады.' },
  ru: { 'pr.finish': 'Завершить', 'pr.timer': 'Таймер', 'pr.pick': 'Выбрать ученика', 'pr.board': 'Доска', 'pr.full': 'Во весь экран', 'pr.hide': 'Скрыть', 'pr.show': 'Инструменты', 'pr.min': '{n} мин', 'pr.stop': 'Стоп', 'pr.timeUp': 'Время вышло!', 'pr.noClass': 'У урока не выбран класс — нет списка учеников.', 'pr.again': 'Ещё', 'pr.all': 'Все уже выходили — список начинается заново', 'pr.pen': 'Ручка', 'pr.eraser': 'Ластик', 'pr.clear': 'Очистить', 'pr.close': 'Закрыть', 'pr.empty': 'В этом уроке нет презентации.', 'pr.notFound': 'Урок не найден.' },
  en: { 'pr.finish': 'Finish', 'pr.timer': 'Timer', 'pr.pick': 'Pick a student', 'pr.board': 'Board', 'pr.full': 'Full screen', 'pr.hide': 'Hide', 'pr.show': 'Tools', 'pr.min': '{n} min', 'pr.stop': 'Stop', 'pr.timeUp': 'Time is up!', 'pr.noClass': 'No class is set for this lesson — no student list.', 'pr.again': 'Again', 'pr.all': 'Everyone has been picked — starting over', 'pr.pen': 'Pen', 'pr.eraser': 'Eraser', 'pr.clear': 'Clear', 'pr.close': 'Close', 'pr.empty': 'This lesson has no presentation.', 'pr.notFound': 'Lesson not found.' }
});

const SVG = {
  timer: 'M12 8v5l3 2M9 2h6M12 22a9 9 0 1 0 0-18a9 9 0 1 0 0 18',
  pick: 'M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8M4 21a8 8 0 0 1 16 0',
  board: 'M3 4h18v12H3zM8 20h8M12 16v4M7 12l3-3 2 2 4-4',
  full: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  hide: 'M6 9l6 6 6-6'
};

export async function render(main, { args }) {
  const lesson = await db.lessons.get(args[0]);
  const back = lesson ? `#/lesson/${lesson.id}` : '#/lessons';
  if (!lesson) { main.innerHTML = html`<div class="wrap" style="padding:40px"><div class="empty">${t('pr.notFound')}<a class="btn sm" href="#/lessons">${t('nav.lessons')}</a></div></div>`.toString(); return; }
  const pres = await db.presentations.get((lesson.parts || {}).presentationId);
  const deck = (pres && pres.deck) || { slides: [] };
  const students = lesson.classId ? (await db.students.list()).filter(s => s.classId === lesson.classId).map(s => s.name) : [];

  main.innerHTML = html`<div class="pr" data-present>
    <div class="pr-stage" data-stage></div>
    <div class="pr-top">
      <b class="pr-topic">${lesson.topic}</b>
      <span class="pr-clock" data-clock>0:00</span>
      <a class="pr-btn dark" href="${back}" data-finish>${t('pr.finish')}</a>
    </div>
    <div class="pr-tools" data-tools>
      <button type="button" class="pr-btn" data-tool="timer">${icon(SVG.timer, 18)}<span>${t('pr.timer')}</span></button>
      <button type="button" class="pr-btn" data-tool="pick">${icon(SVG.pick, 18)}<span>${t('pr.pick')}</span></button>
      <button type="button" class="pr-btn" data-tool="board">${icon(SVG.board, 18)}<span>${t('pr.board')}</span></button>
      <button type="button" class="pr-btn" data-tool="full">${icon(SVG.full, 18)}<span>${t('pr.full')}</span></button>
      <button type="button" class="pr-btn ghost" data-tool="hide" aria-label="${t('pr.hide')}">${icon(SVG.hide, 18)}</button>
    </div>
    <button type="button" class="pr-btn pr-show" data-show hidden>${t('pr.show')}</button>
    <div class="pr-pop" data-pop hidden></div>
    <div class="pr-boardwrap" data-boardwrap hidden><canvas data-canvas></canvas>
      <div class="pr-boardbar"><button type="button" class="pr-btn on" data-pen>${t('pr.pen')}</button><button type="button" class="pr-btn" data-eraser>${t('pr.eraser')}</button><button type="button" class="pr-btn" data-clear>${t('pr.clear')}</button><button type="button" class="pr-btn dark" data-closeboard>${t('pr.close')}</button></div></div>
  </div>`.toString();

  const $ = s => main.querySelector(s);
  const root = $('[data-present]');
  if (!deck.slides.length) $('[data-stage]').innerHTML = html`<div class="empty" style="margin:auto">${t('pr.empty')}</div>`.toString();
  const player = deck.slides.length ? mountPlayer($('[data-stage]'), deck, { lang: lesson.lang || lang() }) : null;

  // lesson clock
  const started = Date.now();
  const clock = setInterval(() => {
    const s = Math.floor((Date.now() - started) / 1000);
    $('[data-clock]').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }, 1000);

  // tools island folds away
  const fold = hide => { $('[data-tools]').hidden = hide; $('[data-show]').hidden = !hide; };
  $('[data-show]').onclick = () => fold(false);

  // timer
  let countdown = null;
  const pop = $('[data-pop]');
  const closePop = () => { pop.hidden = true; pop.innerHTML = ''; };
  const startTimer = min => {
    clearInterval(countdown);
    let left = min * 60;
    const paint = () => { pop.innerHTML = html`<div class="pr-big" data-left>${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</div><button type="button" class="pr-btn" data-stop>${t('pr.stop')}</button>`.toString(); pop.querySelector('[data-stop]').onclick = () => { clearInterval(countdown); closePop(); }; };
    pop.hidden = false; paint();
    countdown = setInterval(() => {
      left--;
      if (left <= 0) { clearInterval(countdown); pop.innerHTML = html`<div class="pr-big up">${t('pr.timeUp')}</div><button type="button" class="pr-btn" data-stop>${t('pr.close')}</button>`.toString(); pop.querySelector('[data-stop]').onclick = closePop; return; }
      paint();
    }, 1000);
  };

  // random student without repeats until everyone has been picked
  let left = [];
  const pick = () => {
    if (!students.length) { pop.hidden = false; pop.innerHTML = html`<p>${t('pr.noClass')}</p><button type="button" class="pr-btn" data-x>${t('pr.close')}</button>`.toString(); pop.querySelector('[data-x]').onclick = closePop; return; }
    let note = '';
    if (!left.length) { if (students.length > 1 && root.dataset.picked) note = t('pr.all'); left = students.slice(); }
    const name = left.splice(Math.floor(Math.random() * left.length), 1)[0];
    root.dataset.picked = '1';
    pop.hidden = false;
    pop.innerHTML = html`<div class="pr-big name" data-picked>${name}</div>${note ? html`<p class="muted">${note}</p>` : ''}<div class="row" style="gap:8px;justify-content:center"><button type="button" class="pr-btn" data-again>${t('pr.again')}</button><button type="button" class="pr-btn dark" data-x>${t('pr.close')}</button></div>`.toString();
    pop.querySelector('[data-again]').onclick = pick;
    pop.querySelector('[data-x]').onclick = closePop;
  };

  // whiteboard over the slide
  const canvas = $('[data-canvas]'), ctx = canvas.getContext('2d');
  let erase = false, drawing = false;
  const sizeCanvas = () => { const r = canvas.getBoundingClientRect(); const img = canvas.width ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null; canvas.width = r.width; canvas.height = r.height; if (img) ctx.putImageData(img, 0, 0); };
  const at = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.onpointerdown = e => { drawing = true; canvas.setPointerCapture(e.pointerId); const [x, y] = at(e); ctx.beginPath(); ctx.moveTo(x, y); };
  canvas.onpointermove = e => {
    if (!drawing) return;
    const [x, y] = at(e);
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    ctx.lineWidth = erase ? 28 : 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#E11D48';
    ctx.lineTo(x, y); ctx.stroke();
  };
  canvas.onpointerup = () => { drawing = false; };
  const setTool = er => { erase = er; $('[data-pen]').classList.toggle('on', !er); $('[data-eraser]').classList.toggle('on', er); };
  $('[data-pen]').onclick = () => setTool(false);
  $('[data-eraser]').onclick = () => setTool(true);
  $('[data-clear]').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  $('[data-closeboard]').onclick = () => { $('[data-boardwrap]').hidden = true; };

  main.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => {
    const tool = b.dataset.tool;
    if (tool === 'hide') fold(true);
    else if (tool === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen && root.requestFullscreen().catch(() => {}); }
    else if (tool === 'board') { $('[data-boardwrap]').hidden = false; sizeCanvas(); }
    else if (tool === 'pick') pick();
    else if (tool === 'timer') {
      pop.hidden = false;
      pop.innerHTML = html`<div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap">${[1, 2, 3, 5, 10].map(n => html`<button type="button" class="pr-btn" data-min="${n}">${t('pr.min', { n })}</button>`)}<button type="button" class="pr-btn dark" data-x>${t('pr.close')}</button></div>`.toString();
      pop.querySelectorAll('[data-min]').forEach(m => m.onclick = () => startTimer(+m.dataset.min));
      pop.querySelector('[data-x]').onclick = closePop;
    }
  });

  // arrows on this page move the slides too (the frame handles its own keys)
  const onKey = e => {
    if (e.target.closest && e.target.closest('input,textarea,select')) return;
    if (!player) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); player.el.contentWindow.postMessage({ source: 'alaqai', type: 'next' }, '*'); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); player.el.contentWindow.postMessage({ source: 'alaqai', type: 'prev' }, '*'); }
    else if (e.key === 'Escape') { closePop(); $('[data-boardwrap]').hidden = true; }
  };
  document.addEventListener('keydown', onKey);

  return () => {
    clearInterval(clock); clearInterval(countdown);
    document.removeEventListener('keydown', onKey);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (player) player.destroy();
  };
}
