/* Lesson screen (mockups 3–4): presentation in the 50-template player with
 * thumbnails and an edit panel, level tasks preview, and the KSP with Word export. */
import { add, t } from '../i18n.js';
import { html, icon, toast, downscale, confirmModal } from '../ui.js';
import { db } from '../data/store.js';
import { generateJSON, searchImage, generateImage } from '../ai.js';
import { TEMPLATES, templatesFor, normalizeDeck } from '../deck/schema.js';
import { mountPlayer } from '../deck/player.js';
import { kspHtml, kspDocx, docLangOf } from '../ksp/doc.js';
import { IC } from '../shell.js';
import '../deck/labels.js';

add({
  kk: { 'le.deck': 'Презентация', 'le.tasks': 'Тапсырмалар', 'le.ksp': 'ҚМЖ', 'le.run': 'Сабақ өткізу', 'le.slide': 'Слайд {n}', 'le.retype': 'Шаблонды ауыстыру', 'le.ask': 'ЖИ-ден сұрау', 'le.askPh': 'Мысалы: мысалды жеңілдет', 'le.change': 'Өзгерту', 'le.img': 'Сурет', 'le.photo': 'Фото', 'le.aiImg': 'ЖИ', 'le.own': 'Өзімдікі', 'le.ops': 'Слайд', 'le.up': 'Жоғары', 'le.down': 'Төмен', 'le.dup': 'Көшірме', 'le.del': 'Жою', 'le.delQ': 'Слайдты жою керек пе?', 'le.saved': 'Сақталды', 'le.aiErr': 'ЖИ жауап бермеді: ', 'le.word': 'Word жүктеу', 'le.kspHint': 'ҚМЖ бүкіл сабақты сипаттайды. Кез келген ұяшықты осы жерде түзетуге болады.', 'le.level': 'Деңгей', 'le.method': 'Әдіс', 'le.common': 'Жалпы', 'le.mSteps': 'Қадам бойынша', 'le.mExample': 'Үлгіні талдау', 'le.mError': 'Қатені тап', 'le.noTasks': 'Бұл деңгей мен әдіске тапсырма жоқ.', 'le.notFound': 'Сабақ табылмады.', 'le.imgNone': 'Бұл слайдта сурет жоқ' },
  ru: { 'le.deck': 'Презентация', 'le.tasks': 'Задания', 'le.ksp': 'КСП', 'le.run': 'Провести урок', 'le.slide': 'Слайд {n}', 'le.retype': 'Поменять шаблон', 'le.ask': 'Попросить ИИ', 'le.askPh': 'Например: сделай пример проще', 'le.change': 'Изменить', 'le.img': 'Картинка', 'le.photo': 'Фото', 'le.aiImg': 'ИИ', 'le.own': 'Своя', 'le.ops': 'Слайд', 'le.up': 'Выше', 'le.down': 'Ниже', 'le.dup': 'Копия', 'le.del': 'Удалить', 'le.delQ': 'Удалить слайд?', 'le.saved': 'Сохранено', 'le.aiErr': 'ИИ не ответил: ', 'le.word': 'Скачать Word', 'le.kspHint': 'КСП описывает весь урок. Любую ячейку можно исправить прямо здесь.', 'le.level': 'Уровень', 'le.method': 'Методика', 'le.common': 'Общее', 'le.mSteps': 'Пошагово', 'le.mExample': 'Разбор примера', 'le.mError': 'Найди ошибку', 'le.noTasks': 'Для этого уровня и методики заданий нет.', 'le.notFound': 'Урок не найден.', 'le.imgNone': 'На этом слайде нет картинки' },
  en: { 'le.deck': 'Slides', 'le.tasks': 'Tasks', 'le.ksp': 'Lesson plan', 'le.run': 'Run the lesson', 'le.slide': 'Slide {n}', 'le.retype': 'Change template', 'le.ask': 'Ask AI', 'le.askPh': 'For example: make the example simpler', 'le.change': 'Change', 'le.img': 'Picture', 'le.photo': 'Photo', 'le.aiImg': 'AI', 'le.own': 'Own', 'le.ops': 'Slide', 'le.up': 'Up', 'le.down': 'Down', 'le.dup': 'Copy', 'le.del': 'Delete', 'le.delQ': 'Delete this slide?', 'le.saved': 'Saved', 'le.aiErr': 'AI did not answer: ', 'le.word': 'Download Word', 'le.kspHint': 'The plan covers the whole lesson. Edit any cell right here.', 'le.level': 'Level', 'le.method': 'Method', 'le.common': 'Common', 'le.mSteps': 'Step by step', 'le.mExample': 'Worked example', 'le.mError': 'Find the mistake', 'le.noTasks': 'No tasks for this level and method.', 'le.notFound': 'Lesson not found.', 'le.imgNone': 'This slide has no picture' }
});

const IMG_TYPES = new Set(['figure', 'label', 'hotspot']);
const LANG_TEXT = { kk: 'на казахском', ru: 'на русском', en: 'на английском', 'uz-latn': 'на узбекском (латиница)' };

export async function render(main, { args, query }) {
  const lesson = await db.lessons.get(args[0]);
  if (!lesson) { main.innerHTML = html`<div class="wrap" style="padding:40px"><div class="empty">${t('le.notFound')}<a class="btn sm" href="#/lessons">${t('nav.lessons')}</a></div></div>`.toString(); return; }
  const parts = lesson.parts || {};
  const [pres, tasks, ksp, classes, settings] = await Promise.all([db.presentations.get(parts.presentationId), db.tasks.get(parts.tasksId), db.ksp.get(parts.kspId), db.classes.list(), db.settings.get()]);
  const cls = classes.find(c => c.id === lesson.classId);
  const st = { tab: ['deck', 'tasks', 'ksp'].includes(query.tab) ? query.tab : 'deck', idx: 0, level: 'B', method: 'steps', busy: false };
  const deck = (pres && pres.deck) || { slides: [] };
  let player = null;

  main.innerHTML = html`
    <header class="lhead">
      <a href="#/lessons" class="btn sq" aria-label="${t('nav.lessons')}">${icon('chevronLeft', 22)}</a>
      <div class="grow" style="min-width:200px"><div style="font:700 20px var(--f-head)">${lesson.topic}</div><div class="sub">${[cls && cls.name, lesson.subject].filter(Boolean).join(' · ')}</div></div>
      <nav class="seg" aria-label="${t('le.deck')}">${['deck', 'tasks', 'ksp'].map(k => html`<button type="button" data-tab="${k}" class="${k === st.tab ? 'on' : ''}">${t('le.' + k)}</button>`)}</nav>
      <a class="btn b" href="#/live/${lesson.id}">${icon(IC.live, 20)}${t('le.run')}</a>
    </header>
    <div data-body></div>`.toString();
  const body = main.querySelector('[data-body]');

  const saveDeck = async () => { await db.presentations.update(pres.id, { deck: { ...deck } }); };
  const ctxText = () => `Урок: "${lesson.topic}", предмет: ${lesson.subject || '—'}${cls ? ', класс ' + cls.name : ''}. Пиши ${LANG_TEXT[lesson.lang] || 'на русском'}. Верни ТОЛЬКО JSON одного слайда без markdown.`;

  async function aiSlide(prompt) {
    st.busy = true; drawPanel();
    try {
      const raw = await generateJSON(prompt, { temperature: 0.6 });
      const s = normalizeDeck({ slides: [raw && raw.slides ? raw.slides[0] : raw] }, { title: false }).slides[0];
      if (!s) throw new Error('JSON');
      deck.slides[st.idx] = s;
      await saveDeck(); player.setDeck(deck, st.idx); toast(t('le.saved'));
    } catch (e) { toast(t('le.aiErr') + (e.message || e)); }
    st.busy = false; drawThumbs(); drawPanel();
  }

  /* ---------- presentation tab ---------- */
  function drawDeck() {
    body.innerHTML = '<div class="lbody"><aside class="thumbs" data-thumbs></aside><div class="stagebox" data-stage></div><aside class="panel" data-panel></aside></div>';
    player = mountPlayer(body.querySelector('[data-stage]'), deck, { lang: lesson.lang, index: st.idx, onSlide: i => { st.idx = i; drawThumbs(); drawPanel(); } });
    drawThumbs(); drawPanel();
  }
  function drawThumbs() {
    const el = body.querySelector('[data-thumbs]'); if (!el) return;
    el.innerHTML = deck.slides.map((s, i) => html`<button type="button" class="thumb${i === st.idx ? ' on' : ''}" data-thumb="${i}"><b>${i + 1}</b><span><span class="k">${t('t.' + s.type)}</span><span class="n">${s.title || s.question || s.center || ''}</span></span></button>`.toString()).join('');
    el.querySelectorAll('[data-thumb]').forEach(b => { b.onclick = () => { st.idx = +b.dataset.thumb; player.goto(st.idx); drawThumbs(); drawPanel(); }; });
  }
  function drawPanel() {
    const el = body.querySelector('[data-panel]'); if (!el) return;
    const s = deck.slides[st.idx]; if (!s) { el.innerHTML = ''; return; }
    const kind = (TEMPLATES[s.type] || {}).kind;
    const alts = templatesFor(lesson.subject).filter(k => k !== 'title' && (TEMPLATES[k] || {}).kind === kind).slice(0, 8);
    el.className = 'panel' + (st.busy ? ' busy' : '');
    el.innerHTML = html`
      <div><div class="cap">${t('le.slide', { n: st.idx + 1 })}</div><div style="font:700 22px var(--f-head);margin-top:4px">${t('t.' + s.type)}</div></div>
      ${s.type !== 'title' ? html`<div class="field"><span>${t('le.retype')}</span><div class="tpl-grid">${alts.map(k => html`<button type="button" data-retype="${k}" class="${k === s.type ? 'on' : ''}">${t('t.' + k)}</button>`)}</div></div>` : ''}
      <label class="field"><span>${t('le.ask')}</span><textarea data-askt placeholder="${t('le.askPh')}"></textarea><button type="button" class="btn k" data-ask>${t('le.change')}</button></label>
      ${IMG_TYPES.has(s.type) ? html`<div class="field"><span>${t('le.img')}</span><div class="seg"><button type="button" data-img="photo">${t('le.photo')}</button><button type="button" data-img="ai">${t('le.aiImg')}</button><button type="button" data-img="own">${t('le.own')}</button></div><input type="file" accept="image/*" data-own hidden></div>` : ''}
      <div class="field"><span>${t('le.ops')}</span><div class="ops">
        <button type="button" class="btn sm" data-op="up" ${st.idx === 0 ? 'disabled' : ''}>${t('le.up')}</button>
        <button type="button" class="btn sm" data-op="down" ${st.idx >= deck.slides.length - 1 ? 'disabled' : ''}>${t('le.down')}</button>
        <button type="button" class="btn sm" data-op="dup">${t('le.dup')}</button>
        <button type="button" class="btn sm" data-op="del" ${deck.slides.length < 2 ? 'disabled' : ''}>${t('le.del')}</button></div></div>`.toString();
    el.querySelectorAll('[data-retype]').forEach(b => { b.onclick = () => { if (b.dataset.retype === s.type) return;
      aiSlide(`Перепиши слайд урока в другой тип. ${ctxText()}\nИсходный слайд: ${JSON.stringify(s)}\nНовый тип и его формат: ${TEMPLATES[b.dataset.retype].prompt}`); }; });
    el.querySelector('[data-ask]').onclick = () => { const q = el.querySelector('[data-askt]').value.trim(); if (!q) return;
      aiSlide(`Измени слайд урока по просьбе учителя: "${q}". ${ctxText()}\nСохрани тип "${s.type}" и формат: ${TEMPLATES[s.type].prompt}\nИсходный слайд: ${JSON.stringify(s)}`); };
    el.querySelectorAll('[data-img]').forEach(b => { b.onclick = async () => {
      if (b.dataset.img === 'own') { el.querySelector('[data-own]').click(); return; }
      st.busy = true; drawPanel();
      const q = s.image_query || s.title || lesson.topic;
      try { const url = b.dataset.img === 'ai' ? await generateImage(`${q}. Clean educational illustration, flat, white background, no text.`) : await searchImage(q); if (url) { s.image = url; delete s.svg; await saveDeck(); player.setDeck(deck, st.idx); } else toast(t('le.imgNone')); }
      catch (e) { toast(t('le.aiErr') + (e.message || e)); }
      st.busy = false; drawPanel(); }; });
    const own = el.querySelector('[data-own]');
    if (own) own.onchange = async () => { const f = own.files[0]; if (!f) return; s.image = await downscale(f, 1400, 0.85); delete s.svg; await saveDeck(); player.setDeck(deck, st.idx); };
    el.querySelectorAll('[data-op]').forEach(b => { b.onclick = async () => {
      const i = st.idx, op = b.dataset.op;
      if (op === 'up' && i > 0) { [deck.slides[i - 1], deck.slides[i]] = [deck.slides[i], deck.slides[i - 1]]; st.idx--; }
      if (op === 'down' && i < deck.slides.length - 1) { [deck.slides[i + 1], deck.slides[i]] = [deck.slides[i], deck.slides[i + 1]]; st.idx++; }
      if (op === 'dup') { deck.slides.splice(i + 1, 0, JSON.parse(JSON.stringify(deck.slides[i]))); st.idx++; }
      if (op === 'del') { if (!(await confirmModal(t('le.delQ')))) return; deck.slides.splice(i, 1); st.idx = Math.min(i, deck.slides.length - 1); }
      await saveDeck(); player.setDeck(deck, st.idx); drawThumbs(); drawPanel(); }; });
  }

  /* ---------- tasks tab ---------- */
  function taskSlides() {
    if (!tasks) return [];
    if (st.method === 'common') return tasks.common || [];
    return ((tasks.levels || {})[st.level] || {})[st.method] || [];
  }
  function drawTasks() {
    const list = taskSlides();
    body.innerHTML = html`<div class="wrap" style="padding:24px">
      <div class="row" style="gap:20px">
        <div class="field"><span>${t('le.level')}</span><div class="seg">${['A', 'B', 'C'].map(l => html`<button type="button" data-lvl="${l}" class="${l === st.level && st.method !== 'common' ? 'on' : ''}">${l}</button>`)}</div></div>
        <div class="field"><span>${t('le.method')}</span><div class="seg">${[['steps', 'le.mSteps'], ['example', 'le.mExample'], ['error', 'le.mError'], ['common', 'le.common']].map(([k, l]) => html`<button type="button" data-method="${k}" class="${k === st.method ? 'on' : ''}">${t(l)}</button>`)}</div></div>
      </div>
      ${list.length ? html`<div data-stage class="stagebox" style="padding:0"></div>` : html`<div class="empty">${t('le.noTasks')}</div>`}</div>`.toString();
    if (list.length) player = mountPlayer(body.querySelector('[data-stage]'), { lang: lesson.lang, slides: list }, { lang: lesson.lang });
    body.querySelectorAll('[data-lvl]').forEach(b => { b.onclick = () => { st.level = b.dataset.lvl; if (st.method === 'common') st.method = 'steps'; drawTasks(); }; });
    body.querySelectorAll('[data-method]').forEach(b => { b.onclick = () => { st.method = b.dataset.method; drawTasks(); }; });
  }

  /* ---------- KSP tab ---------- */
  const kspCtx = () => ({ docLang: docLangOf(lesson.lang, 'kk'), teacher: (settings.profile || {}).name || '', school: (settings.profile || {}).school || '', className: cls ? cls.name : '', date: lesson.date });
  function drawKsp() {
    if (!ksp) { body.innerHTML = html`<div class="wrap" style="padding:24px"><div class="empty">—</div></div>`.toString(); return; }
    body.innerHTML = html`<div class="kspwrap"><div class="row" style="justify-content:space-between;align-items:center"><p class="muted" style="margin:0">${t('le.kspHint')}</p>
      <button type="button" class="btn b" data-word>${icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3', 20)}${t('le.word')}</button></div>
      <div class="paper"></div></div>`.toString();
    body.querySelector('.paper').innerHTML = kspHtml(ksp, kspCtx(), { edit: true });
    body.querySelector('.ksp-doc').addEventListener('focusout', async e => {
      const k = e.target.dataset && e.target.dataset.k; if (!k) return;
      const v = e.target.innerText.replace(/ /g, ' ').trim();
      if (k === '$teacher' || k === '$school') { const profile = { ...(settings.profile || {}), [k === '$teacher' ? 'name' : 'school']: v }; settings.profile = profile; await db.settings.set({ profile }); return; }
      const path = k.split('.');
      if (path[0] === 'stages') { ksp.stages[+path[1]][path[2]] = path[2] === 'minutes' ? Number(v) || 0 : v; await db.ksp.update(ksp.id, { stages: ksp.stages }); }
      else { ksp[k] = Array.isArray(ksp[k]) ? v.split('\n').map(x => x.trim()).filter(Boolean) : v; await db.ksp.update(ksp.id, { [k]: ksp[k] }); }
    });
    body.querySelector('[data-word]').onclick = async () => {
      const blob = await kspDocx(ksp, kspCtx());
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${t('le.ksp')} — ${lesson.topic}.docx`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
  }

  function show() {
    if (player) { player.destroy(); player = null; }
    main.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === st.tab));
    ({ deck: drawDeck, tasks: drawTasks, ksp: drawKsp })[st.tab]();
  }
  main.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => { st.tab = b.dataset.tab; show(); }; });
  show();
  return () => { if (player) player.destroy(); };
}
