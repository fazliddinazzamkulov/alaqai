/* Screen 7 · Presentation editor: slides on the left, the slide in the middle
 * (click any text to edit it), the AI agent on the right. */
import { add, t, lang } from '../i18n.js';
import { html, raw, esc, icon, openModal, toast } from '../ui.js';
import { db } from '../data/store.js';
import { searchImage, generateImage, iconUrl, AiError } from '../ai.js';
import { sanitize, plain, renderMath, LAYOUTS, GAME_LAYOUTS, THEMES } from '../slides.js';
import { slideBox, agentEdit, fillImages } from '../deck.js';
import { langLabel } from '../gen/materials.js';

add({
  ru: {
    'ed.back': 'Назад', 'ed.saved': 'Сохранено · {n} слайдов · {lang}', 'ed.saving': 'Сохраняется…', 'ed.undo': 'Отменить', 'ed.pdf': 'Скачать PDF', 'ed.show': 'Показать на уроке',
    'ed.addSlide': '+ Слайд', 'ed.text': 'Текст', 'ed.photo': 'Фото', 'ed.icon': 'Иконка', 'ed.formula': 'Формула', 'ed.chart': 'Диаграмма', 'ed.game': 'Мини-игра', 'ed.layout': 'Макет',
    'ed.caption': 'Слайд {i} из {n} · нажмите на любой элемент, чтобы изменить его', 'ed.up': 'Выше', 'ed.down': 'Ниже', 'ed.dup': 'Дублировать', 'ed.del': 'Удалить слайд', 'ed.lastSlide': 'В презентации должен остаться хотя бы один слайд',
    'ed.noList': 'На этом макете нет списка — выберите «Макет» → «Текст и фото»', 'ed.bold': 'Жирный', 'ed.mark': 'Выделить маркером', 'ed.agentBtn': '✦ Агент',
    'lay.title': 'Титульный', 'lay.content': 'Текст и фото', 'lay.full-image': 'Фото на весь слайд', 'lay.stat': 'Число', 'lay.bigidea': 'Ключевая мысль', 'lay.compare': 'Сравнение', 'lay.process': 'Шаги',
    'lay.quiz': 'Вопрос с вариантами', 'lay.truefalse': 'Правда или ложь', 'lay.fillblank': 'Вставь слово', 'lay.match': 'Найди пару', 'lay.problem': 'Задача с решением',
    'ed.photoTitle': 'Фото на слайде', 'ed.search': 'Найти фото', 'ed.searchPh': 'Что на фото? (лучше по-английски)', 'ed.upload': 'Загрузить своё', 'ed.aiImage': 'Сгенерировать ИИ', 'ed.removePhoto': 'Убрать фото', 'ed.notFound': 'Фото не найдено — попробуйте другие слова или войдите в аккаунт',
    'ed.iconTitle': 'Иконка', 'ed.iconName': 'Название иконки (Lucide)', 'ed.noIcon': 'Без иконки',
    'ed.formulaTitle': 'Формула', 'ed.formulaHint': 'LaTeX: например I = \\frac{U}{R}', 'ed.removeFormula': 'Убрать формулу',
    'ed.chartTitle': 'Диаграмма', 'ed.chartHint': 'По строке на столбик: «название: число»', 'ed.removeChart': 'Убрать диаграмму',
    'ed.gameTitle': 'Добавить мини-игру', 'ed.gameAdded': 'Мини-игра добавлена после текущего слайда',
    'ed.correct': 'Правильный ответ', 'ed.isTrue': 'Утверждение верное', 'ed.addPair': '+ Пара', 'ed.addStep': '+ Шаг', 'ed.addOption': '+ Вариант',
    'ag.title': 'Агент', 'ag.sub': 'Меняет слайды по вашей просьбе', 'ag.ph': 'Что изменить в презентации?', 'ag.send': 'Отправить', 'ag.keep': 'Оставить', 'ag.revert': 'Вернуть как было', 'ag.done': 'Готово.', 'ag.reverted': 'Вернул как было.',
    'ag.c.question': 'Добавить вопрос классу', 'ag.c.translate': 'Перевести на {lang}', 'ag.c.short': 'Сократить текст', 'ag.c.photo': 'Другое фото',
    'ag.p.question': 'Добавь после слайда {i} слайд с вопросом классу по этой теме', 'ag.p.translate': 'Переведи всю презентацию на {lang}', 'ag.p.short': 'Сократи текст на слайде {i}, оставь главное',
    'ag.hello': 'Напишите, что поменять: «сделай слайд 3 проще», «добавь пример из жизни», «переведи на казахский».', 'ag.thinking': 'Думаю…', 'ag.newPhoto': 'Поставил другое фото на слайд {i}.', 'ag.noPhoto': 'Не нашёл другого фото для этого слайда.',
    'ed.notFoundDeck': 'Презентация не найдена'
  },
  kk: {
    'ed.back': 'Артқа', 'ed.saved': 'Сақталды · {n} слайд · {lang}', 'ed.saving': 'Сақталып жатыр…', 'ed.undo': 'Болдырмау', 'ed.pdf': 'PDF жүктеу', 'ed.show': 'Сабақта көрсету',
    'ed.addSlide': '+ Слайд', 'ed.text': 'Мәтін', 'ed.photo': 'Фото', 'ed.icon': 'Белгіше', 'ed.formula': 'Формула', 'ed.chart': 'Диаграмма', 'ed.game': 'Мини-ойын', 'ed.layout': 'Макет',
    'ed.caption': '{n} слайдтың {i}-і · өзгерту үшін кез келген элементті басыңыз', 'ed.up': 'Жоғары', 'ed.down': 'Төмен', 'ed.dup': 'Көшірме', 'ed.del': 'Слайдты жою', 'ed.lastSlide': 'Презентацияда кемінде бір слайд болуы керек',
    'ed.noList': 'Бұл макетте тізім жоқ — «Макет» → «Мәтін және фото» таңдаңыз', 'ed.bold': 'Қалың', 'ed.mark': 'Маркермен белгілеу', 'ed.agentBtn': '✦ Агент',
    'lay.title': 'Титул', 'lay.content': 'Мәтін және фото', 'lay.full-image': 'Толық фото', 'lay.stat': 'Сан', 'lay.bigidea': 'Негізгі ой', 'lay.compare': 'Салыстыру', 'lay.process': 'Қадамдар',
    'lay.quiz': 'Нұсқалары бар сұрақ', 'lay.truefalse': 'Шын ба, жалған ба', 'lay.fillblank': 'Сөзді қой', 'lay.match': 'Жұбын тап', 'lay.problem': 'Шешуі бар есеп',
    'ed.photoTitle': 'Слайдтағы фото', 'ed.search': 'Фото іздеу', 'ed.searchPh': 'Фотода не бар? (ағылшынша жақсырақ)', 'ed.upload': 'Өзімдікін жүктеу', 'ed.aiImage': 'ЖИ-мен жасау', 'ed.removePhoto': 'Фотоны алып тастау', 'ed.notFound': 'Фото табылмады — басқа сөздермен көріңіз немесе аккаунтқа кіріңіз',
    'ed.iconTitle': 'Белгіше', 'ed.iconName': 'Белгіше атауы (Lucide)', 'ed.noIcon': 'Белгішесіз',
    'ed.formulaTitle': 'Формула', 'ed.formulaHint': 'LaTeX: мысалы I = \\frac{U}{R}', 'ed.removeFormula': 'Формуланы алып тастау',
    'ed.chartTitle': 'Диаграмма', 'ed.chartHint': 'Әр жолда бір баған: «атауы: сан»', 'ed.removeChart': 'Диаграмманы алып тастау',
    'ed.gameTitle': 'Мини-ойын қосу', 'ed.gameAdded': 'Мини-ойын ағымдағы слайдтан кейін қосылды',
    'ed.correct': 'Дұрыс жауап', 'ed.isTrue': 'Тұжырым дұрыс', 'ed.addPair': '+ Жұп', 'ed.addStep': '+ Қадам', 'ed.addOption': '+ Нұсқа',
    'ag.title': 'Агент', 'ag.sub': 'Слайдтарды өтінішіңіз бойынша өзгертеді', 'ag.ph': 'Презентацияда не өзгерту керек?', 'ag.send': 'Жіберу', 'ag.keep': 'Қалдыру', 'ag.revert': 'Бұрынғыдай қайтару', 'ag.done': 'Дайын.', 'ag.reverted': 'Бұрынғыдай қайтардым.',
    'ag.c.question': 'Сыныпқа сұрақ қосу', 'ag.c.translate': '{lang} тіліне аудару', 'ag.c.short': 'Мәтінді қысқарту', 'ag.c.photo': 'Басқа фото',
    'ag.p.question': '{i}-слайдтан кейін осы тақырып бойынша сыныпқа сұрағы бар слайд қос', 'ag.p.translate': 'Бүкіл презентацияны {lang} тіліне аудар', 'ag.p.short': '{i}-слайдтағы мәтінді қысқарт, негізгісін қалдыр',
    'ag.hello': 'Не өзгерту керегін жазыңыз: «3-слайдты жеңілдет», «өмірден мысал қос», «орысшаға аудар».', 'ag.thinking': 'Ойланып жатырмын…', 'ag.newPhoto': '{i}-слайдқа басқа фото қойдым.', 'ag.noPhoto': 'Бұл слайдқа басқа фото таппадым.',
    'ed.notFoundDeck': 'Презентация табылмады'
  },
  en: {
    'ed.back': 'Back', 'ed.saved': 'Saved · {n} slides · {lang}', 'ed.saving': 'Saving…', 'ed.undo': 'Undo', 'ed.pdf': 'Download PDF', 'ed.show': 'Show in class',
    'ed.addSlide': '+ Slide', 'ed.text': 'Text', 'ed.photo': 'Photo', 'ed.icon': 'Icon', 'ed.formula': 'Formula', 'ed.chart': 'Chart', 'ed.game': 'Mini-game', 'ed.layout': 'Layout',
    'ed.caption': 'Slide {i} of {n} · click any element to change it', 'ed.up': 'Up', 'ed.down': 'Down', 'ed.dup': 'Duplicate', 'ed.del': 'Delete slide', 'ed.lastSlide': 'A presentation needs at least one slide',
    'ed.noList': 'This layout has no list — choose Layout → Text and photo', 'ed.bold': 'Bold', 'ed.mark': 'Highlight', 'ed.agentBtn': '✦ Agent',
    'lay.title': 'Title', 'lay.content': 'Text and photo', 'lay.full-image': 'Full-screen photo', 'lay.stat': 'Big number', 'lay.bigidea': 'Key idea', 'lay.compare': 'Compare', 'lay.process': 'Steps',
    'lay.quiz': 'Multiple choice', 'lay.truefalse': 'True or false', 'lay.fillblank': 'Fill the gap', 'lay.match': 'Match pairs', 'lay.problem': 'Problem with solution',
    'ed.photoTitle': 'Photo on the slide', 'ed.search': 'Find a photo', 'ed.searchPh': 'What is in the photo? (English works best)', 'ed.upload': 'Upload my own', 'ed.aiImage': 'Generate with AI', 'ed.removePhoto': 'Remove photo', 'ed.notFound': 'No photo found — try other words or sign in',
    'ed.iconTitle': 'Icon', 'ed.iconName': 'Icon name (Lucide)', 'ed.noIcon': 'No icon',
    'ed.formulaTitle': 'Formula', 'ed.formulaHint': 'LaTeX: for example I = \\frac{U}{R}', 'ed.removeFormula': 'Remove formula',
    'ed.chartTitle': 'Chart', 'ed.chartHint': 'One bar per line: “label: number”', 'ed.removeChart': 'Remove chart',
    'ed.gameTitle': 'Add a mini-game', 'ed.gameAdded': 'Mini-game added after the current slide',
    'ed.correct': 'Correct answer', 'ed.isTrue': 'The statement is true', 'ed.addPair': '+ Pair', 'ed.addStep': '+ Step', 'ed.addOption': '+ Option',
    'ag.title': 'Agent', 'ag.sub': 'Changes slides when you ask', 'ag.ph': 'What should change?', 'ag.send': 'Send', 'ag.keep': 'Keep', 'ag.revert': 'Undo this', 'ag.done': 'Done.', 'ag.reverted': 'Reverted.',
    'ag.c.question': 'Add a class question', 'ag.c.translate': 'Translate to {lang}', 'ag.c.short': 'Shorten the text', 'ag.c.photo': 'Another photo',
    'ag.p.question': 'After slide {i}, add a slide with a question for the class on this topic', 'ag.p.translate': 'Translate the whole presentation to {lang}', 'ag.p.short': 'Shorten the text on slide {i}, keep the key points',
    'ag.hello': 'Tell me what to change: “make slide 3 simpler”, “add a real-life example”, “translate to Kazakh”.', 'ag.thinking': 'Thinking…', 'ag.newPhoto': 'Put another photo on slide {i}.', 'ag.noPhoto': 'Couldn’t find another photo for this slide.',
    'ed.notFoundDeck': 'Presentation not found'
  }
});

const ICON_SUGGEST = ['book-open', 'atom', 'leaf', 'globe', 'calculator', 'flask-conical', 'lightbulb', 'users', 'target', 'music', 'pencil', 'heart', 'zap', 'clock', 'map', 'sun'];
const LIST_FIELD = { content: 'bullets', 'full-image': 'bullets', stat: 'bullets', bigidea: 'bullets' };

let deck = null, cur = 0, history = [], chat = [], pending = null, saveTimer = null, editSnapshot = false, photoPage = {};

export async function render(main, { args, query }) {
  const id = args[0];
  deck = await db.presentations.get(id);
  if (!deck) { main.innerHTML = html`<div class="empty" style="margin:40px"><h2>${t('ed.notFoundDeck')}</h2><div class="row"><a class="btn-k" href="#/presentations?list=1">${t('ed.back')}</a></div></div>`; return; }
  cur = Math.min(Number(query.s) || 0, deck.slides.length - 1);
  history = []; chat = deck.agentLog || []; pending = null; photoPage = {};

  main.innerHTML = html`
    <div class="ed">
      <header class="ed-head">
        <a class="icon-btn lg" href="${deck.lessonId ? '#/lessons?id=' + deck.lessonId : '#/presentations?list=1'}" aria-label="${t('ed.back')}">${icon('chevronLeft')}</a>
        <div class="grow ed-titlebox"><input class="ed-title" value="${deck.title}" maxlength="120" aria-label="title"><div class="small ed-status"></div></div>
        <div class="seg2 ed-ratio">${['16:9', '4:3'].map(r => html`<button type="button" data-ratio="${r}" aria-pressed="${deck.ratio === r}">${r}</button>`)}</div>
        <div class="swatches small-sw">${Object.keys(THEMES).map(k => html`<button type="button" class="swatch${deck.theme === k ? ' on' : ''}" data-theme="${k}" style="background:${THEMES[k].accent}" aria-label="${k}"></button>`)}</div>
        <button type="button" class="icon-btn lg" data-undo aria-label="${t('ed.undo')}">${icon('M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3')}</button>
        <button type="button" class="btn-o btn-h40" data-pdf>${t('ed.pdf')}</button>
        <a class="btn-k btn-h40" href="${deck.lessonId ? '#/lesson/' + deck.lessonId : '#/lesson/deck?deck=' + deck.id}">${icon('play', 12)}${t('ed.show')}</a>
      </header>
      <div class="ed-body">
        <nav class="ed-thumbs"></nav>
        <div class="ed-center">
          <div class="ed-tools">
            <button type="button" data-tool="text"><b>T</b>${t('ed.text')}</button>
            <button type="button" data-tool="photo">${t('ed.photo')}</button>
            <button type="button" data-tool="icon">${t('ed.icon')}</button>
            <button type="button" data-tool="formula">${t('ed.formula')}</button>
            <button type="button" data-tool="chart">${t('ed.chart')}</button>
            <button type="button" data-tool="game">${t('ed.game')}</button>
            <span class="sep"></span>
            <button type="button" data-tool="layout" class="soft">${t('ed.layout')}</button>
          </div>
          <div class="ed-stage-wrap"><div class="ed-stage"></div><div class="ed-float" hidden>
            <button type="button" data-fmt="bold" aria-label="${t('ed.bold')}"><b>B</b></button>
            <button type="button" data-fmt="mark" aria-label="${t('ed.mark')}"><span class="mk"></span></button>
            <button type="button" data-fmt="agent" class="ag">${t('ed.agentBtn')}</button>
          </div></div>
          <div class="ed-settings"></div>
          <div class="small ed-caption"></div>
        </div>
        <aside class="ed-agent"></aside>
      </div>
    </div>`;

  drawAll(main);
  bind(main);
  if (deck.slides.some(s => !s.imageUrl && !s.imageTried && s.image_query)) fillImages(deck.id, d => { if (deck && d.id === deck.id) { deck.slides = d.slides.map((s, i) => ({ ...deck.slides[i], imageUrl: s.imageUrl, imageTried: s.imageTried })); drawThumbs(main); if (document.activeElement.closest('.ed-stage') == null) drawStage(main); } });
  const onKey = e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.target.closest('[contenteditable], input, textarea')) { e.preventDefault(); undo(main); }
  };
  document.addEventListener('keydown', onKey);
  return () => { document.removeEventListener('keydown', onKey); flush(); deck = null; };
}

/* ---------- saving & history ---------- */

function snapshot() { history.push(JSON.stringify(deck.slides)); if (history.length > 60) history.shift(); }
function status(main, saving) {
  const el = main.querySelector('.ed-status');
  if (el) el.textContent = saving ? t('ed.saving') : t('ed.saved', { n: deck.slides.length, lang: langLabel(deck.lang) });
}
function save(main, delay = 500) {
  status(main, true);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveTimer = null; persist().then(() => deck && status(main, false)); }, delay);
}
async function persist() { if (deck) await db.presentations.update(deck.id, { slides: deck.slides, title: deck.title, ratio: deck.ratio, theme: deck.theme, agentLog: chat.slice(-30) }); }
function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; persist(); } }
function undo(main) {
  const prev = history.pop();
  if (!prev) return;
  deck.slides = JSON.parse(prev);
  cur = Math.min(cur, deck.slides.length - 1);
  pending = null;
  drawAll(main); save(main, 0);
}

/* ---------- drawing ---------- */

function drawAll(main) { drawThumbs(main); drawStage(main); drawAgent(main); status(main, false); }

function drawThumbs(main) {
  const el = main.querySelector('.ed-thumbs');
  el.innerHTML = html`${deck.slides.map((s, i) => html`
    <div class="ed-thumb${i === cur ? ' on' : ''}">
      <span class="n">${i + 1}</span>
      <button type="button" class="tb" data-go="${i}" aria-label="${i + 1}">${raw(slideBox(s, deck, i, 'thumb'))}</button>
      <span class="acts">
        ${i > 0 ? html`<button type="button" data-move="${i}|-1" aria-label="${t('ed.up')}">↑</button>` : ''}
        ${i < deck.slides.length - 1 ? html`<button type="button" data-move="${i}|1" aria-label="${t('ed.down')}">↓</button>` : ''}
        <button type="button" data-dup="${i}" aria-label="${t('ed.dup')}">⧉</button>
        <button type="button" data-del="${i}" aria-label="${t('ed.del')}">×</button>
      </span>
    </div>`)}
    <button type="button" class="ed-add" data-add>${t('ed.addSlide')}</button>`;
}

function drawThumb(main, i) {
  const b = main.querySelector(`.ed-thumbs [data-go="${i}"]`);
  if (b) b.innerHTML = slideBox(deck.slides[i], deck, i, 'thumb');
}

function drawStage(main) {
  const stage = main.querySelector('.ed-stage');
  stage.className = 'ed-stage' + (deck.ratio === '4:3' ? ' r43' : '');
  stage.parentElement.classList.toggle('r43', deck.ratio === '4:3');
  stage.innerHTML = slideBox(deck.slides[cur], deck, cur, 'edit');
  main.querySelector('.ed-caption').textContent = t('ed.caption', { i: cur + 1, n: deck.slides.length });
  main.querySelector('.ed-float').hidden = true;
  drawSettings(main);
  renderMath(stage);
}

/** Extra controls under the slide for game layouts (correct answer, pairs…). */
function drawSettings(main) {
  const s = deck.slides[cur];
  const el = main.querySelector('.ed-settings');
  let body = '';
  if (s.layout === 'quiz') body = html`<span>${t('ed.correct')}</span>${(s.options || []).map((_, i) => html`<button type="button" class="chip${Number(s.correct_index) === i ? ' on dark' : ''}" data-set="correct_index|${i}">${'ABCDEF'[i]}</button>`)}${(s.options || []).length < 6 ? html`<button type="button" class="chip dashed" data-push="options">${t('ed.addOption')}</button>` : ''}`;
  else if (s.layout === 'truefalse') body = html`<label class="chk"><input type="checkbox" data-bool="is_true" ${String(s.is_true) !== 'false' ? 'checked' : ''}>${t('ed.isTrue')}</label>`;
  else if (s.layout === 'fillblank') body = html`<span>${t('ed.correct')}</span>${(s.word_options || []).map((w, i) => html`<button type="button" class="chip${plain(w) && plain(w) === plain(s.correct_word) ? ' on dark' : ''}" data-word="${i}">${plain(w) || '—'}</button>`)}`;
  else if (s.layout === 'match') body = html`<button type="button" class="chip dashed" data-push="pairs">${t('ed.addPair')}</button>`;
  else if (s.layout === 'process') body = html`<button type="button" class="chip dashed" data-push="steps">${t('ed.addStep')}</button>`;
  el.innerHTML = body;
  el.hidden = !body;
}

/* ---------- agent panel ---------- */

function drawAgent(main) {
  const el = main.querySelector('.ed-agent');
  const other = deck.lang === 'kk' ? 'ru' : 'kk';
  const otherName = { kk: 'қазақша', ru: lang() === 'kk' ? 'орысша' : 'русский' }[other];
  el.innerHTML = html`
    <div class="ag-head"><span class="ag-ic">${icon('sparkle', 16, 'style="color:var(--lime)"')}</span><div><b>${t('ag.title')}</b><span class="small">${t('ag.sub')}</span></div></div>
    <div class="ag-log">
      ${chat.length ? '' : html`<div class="ag-msg bot"><span>${t('ag.hello')}</span></div>`}
      ${chat.map((m, k) => m.role === 'user' ? html`<div class="ag-msg user">${m.text}</div>`
        : html`<div class="ag-msg bot"><span>${m.text}</span>
          ${m.summary && m.summary.length ? html`<span class="ag-sum">${m.summary.map(x => html`• ${x}<br>`)}</span>` : ''}
          ${pending && pending.msg === k ? html`<span class="ag-btns"><button type="button" class="btn-k btn-sm" data-keep>${t('ag.keep')}</button><button type="button" class="btn-o btn-sm" data-revert>${t('ag.revert')}</button></span>` : ''}</div>`)}
      ${el.dataset.busy ? html`<div class="ag-msg bot typing">${t('ag.thinking')}</div>` : ''}
    </div>
    <div class="ag-chips">
      <button type="button" class="chip" data-ask="question">${t('ag.c.question')}</button>
      <button type="button" class="chip" data-ask="translate" data-lang="${other}">${t('ag.c.translate', { lang: otherName })}</button>
      <button type="button" class="chip" data-ask="short">${t('ag.c.short')}</button>
      <button type="button" class="chip" data-ask="photo">${t('ag.c.photo')}</button>
    </div>
    <form class="ag-input"><input name="q" placeholder="${t('ag.ph')}" aria-label="${t('ag.ph')}" autocomplete="off"><button type="submit" aria-label="${t('ag.send')}">${icon('M12 19V5M5 12l7-7 7 7')}</button></form>`;
  const log = el.querySelector('.ag-log');
  log.scrollTop = log.scrollHeight;
}

async function ask(main, text) {
  const el = main.querySelector('.ed-agent');
  chat.push({ role: 'user', text });
  el.dataset.busy = '1';
  drawAgent(main);
  const before = JSON.stringify(deck.slides);
  try {
    const res = await agentEdit(deck, cur, text);
    if (!deck) return;
    snapshot();
    deck.slides = res.slides;
    cur = Math.min(cur, deck.slides.length - 1);
    chat.push({ role: 'bot', text: res.reply || t('ag.done'), summary: res.summary });
    pending = { msg: chat.length - 1, before };
    drawThumbs(main); drawStage(main); save(main, 0);
    fillImages(deck.id);
  } catch (e) {
    chat.push({ role: 'bot', text: e instanceof AiError ? e.message : t('ai.err.bad') });
  }
  delete el.dataset.busy;
  if (deck) drawAgent(main);
}

async function anotherPhoto(main) {
  const s = deck.slides[cur];
  const q = s.image_query || plain(s.title);
  photoPage[cur] = (photoPage[cur] || 1) + 1;
  const url = q ? await searchImage(q, photoPage[cur]) : null;
  if (url) {
    snapshot();
    deck.slides[cur] = { ...s, imageUrl: url, layout: ['title', 'content', 'stat', 'full-image'].includes(s.layout) ? s.layout : 'content' };
    chat.push({ role: 'bot', text: t('ag.newPhoto', { i: cur + 1 }) });
    drawThumb(main, cur); drawStage(main); save(main, 0);
  } else chat.push({ role: 'bot', text: t('ag.noPhoto') });
  drawAgent(main);
}

/* ---------- events ---------- */

function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k, i) => { if (o[k] == null) o[k] = /^\d+$/.test(keys[i + 1]) ? [] : {}; o = o[k]; });
  o[keys[keys.length - 1]] = value;
}

function bind(main) {
  const stage = main.querySelector('.ed-stage');
  const float = main.querySelector('.ed-float');

  main.querySelector('.ed-title').addEventListener('input', e => { deck.title = e.target.value; save(main); });
  main.querySelectorAll('[data-ratio]').forEach(b => b.addEventListener('click', () => {
    deck.ratio = b.dataset.ratio; main.querySelectorAll('[data-ratio]').forEach(x => x.setAttribute('aria-pressed', x === b));
    drawThumbs(main); drawStage(main); save(main, 0);
  }));
  main.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => {
    deck.theme = b.dataset.theme; main.querySelectorAll('[data-theme]').forEach(x => x.classList.toggle('on', x === b));
    drawThumbs(main); drawStage(main); save(main, 0);
  }));
  main.querySelector('[data-undo]').addEventListener('click', () => undo(main));
  main.querySelector('[data-pdf]').addEventListener('click', () => exportPdf());

  // Thumbnails
  main.querySelector('.ed-thumbs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.go != null) { cur = Number(d.go); drawThumbs(main); drawStage(main); return; }
    snapshot();
    if (d.move) { const [i, dir] = d.move.split('|').map(Number); const [s] = deck.slides.splice(i, 1); deck.slides.splice(i + dir, 0, s); cur = i + dir; }
    else if (d.dup != null) { const i = Number(d.dup); deck.slides.splice(i + 1, 0, JSON.parse(JSON.stringify(deck.slides[i]))); cur = i + 1; }
    else if (d.del != null) { if (deck.slides.length === 1) { history.pop(); return toast(t('ed.lastSlide')); } deck.slides.splice(Number(d.del), 1); cur = Math.min(cur, deck.slides.length - 1); }
    else if (d.add != null) { deck.slides.splice(cur + 1, 0, { layout: 'content', title: '', bullets: [''] }); cur += 1; }
    drawThumbs(main); drawStage(main); save(main, 0);
  });

  // Editing text right on the slide
  stage.addEventListener('focusin', e => {
    const f = e.target.closest('[data-f]');
    if (!f) return;
    editSnapshot = false;
    const path = f.dataset.f;
    const v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), deck.slides[cur]);
    if (/\$/.test(f.textContent)) f.innerHTML = sanitize(v); // show the LaTeX source while editing
    const r = f.getBoundingClientRect(), w = stage.getBoundingClientRect();
    float.hidden = false;
    float.style.left = Math.max(0, r.left - w.left) + 'px';
    float.style.top = Math.max(-44, r.top - w.top - 48) + 'px';
  });
  stage.addEventListener('focusout', e => {
    setTimeout(() => { if (!stage.contains(document.activeElement) && !float.contains(document.activeElement)) float.hidden = true; }, 150);
    if (e.target.closest('[data-f]')) renderMath(stage);
  });
  stage.addEventListener('input', e => {
    const f = e.target.closest('[data-f]');
    if (!f) return;
    if (!editSnapshot) { snapshot(); editSnapshot = true; }
    setPath(deck.slides[cur], f.dataset.f, sanitize(f.innerHTML).replace(/<br>$/, ''));
    f.classList.toggle('is-empty', !f.textContent.trim());
    drawThumb(main, cur);
    save(main);
  });
  stage.addEventListener('keydown', e => {
    const f = e.target.closest('[data-f]');
    if (!f) return;
    const m = f.dataset.f.match(/^(\w+)\.(\d+)$/);
    const isList = m && ['bullets', 'steps', 'left_bullets', 'right_bullets', 'solution_steps'].includes(m[1]);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isList) { f.blur(); return; }
      snapshot();
      const arr = deck.slides[cur][m[1]] || (deck.slides[cur][m[1]] = []);
      arr.splice(Number(m[2]) + 1, 0, '');
      drawStage(main); save(main, 0);
      const next = stage.querySelector(`[data-f="${m[1]}.${Number(m[2]) + 1}"]`); if (next) next.focus();
    } else if (e.key === 'Backspace' && isList && !f.textContent && (deck.slides[cur][m[1]] || []).length > 1) {
      e.preventDefault();
      snapshot();
      deck.slides[cur][m[1]].splice(Number(m[2]), 1);
      drawStage(main); save(main, 0);
      const prev = stage.querySelector(`[data-f="${m[1]}.${Math.max(0, Number(m[2]) - 1)}"]`);
      if (prev) { prev.focus(); document.getSelection().selectAllChildren(prev); document.getSelection().collapseToEnd(); }
    }
  });
  stage.addEventListener('paste', e => {
    if (!e.target.closest('[data-f]')) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });
  stage.addEventListener('click', e => { if (e.target.closest('[data-act="photo"]')) photoModal(main); });

  // Floating text toolbar
  float.addEventListener('mousedown', e => e.preventDefault()); // keep the text selection
  float.addEventListener('click', e => {
    const b = e.target.closest('[data-fmt]');
    if (!b) return;
    const f = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-f]');
    if (b.dataset.fmt === 'agent') { const inp = main.querySelector('.ag-input input'); inp.value = `${t('ed.caption', { i: cur + 1, n: deck.slides.length }).split(' · ')[0]}: `; inp.focus(); return; }
    if (!f) return;
    if (b.dataset.fmt === 'bold') document.execCommand('bold');
    if (b.dataset.fmt === 'mark') {
      const sel = document.getSelection();
      if (sel.rangeCount && !sel.isCollapsed) { const mk = document.createElement('mark'); try { sel.getRangeAt(0).surroundContents(mk); } catch (err) { mk.textContent = sel.toString(); sel.getRangeAt(0).deleteContents(); sel.getRangeAt(0).insertNode(mk); } }
    }
    f.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Settings for games under the slide
  main.querySelector('.ed-settings').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const s = deck.slides[cur];
    snapshot();
    if (b.dataset.set) { const [k, v] = b.dataset.set.split('|'); s[k] = Number(v); }
    if (b.dataset.word != null) s.correct_word = plain(s.word_options[Number(b.dataset.word)]);
    if (b.dataset.push === 'options') (s.options = s.options || []).push('');
    if (b.dataset.push === 'pairs') (s.pairs = s.pairs || []).push({ left: '', right: '' });
    if (b.dataset.push === 'steps') (s.steps = s.steps || []).push('');
    drawStage(main); drawThumb(main, cur); save(main, 0);
  });
  main.querySelector('.ed-settings').addEventListener('change', e => {
    if (e.target.dataset.bool) { snapshot(); deck.slides[cur][e.target.dataset.bool] = e.target.checked; drawStage(main); save(main, 0); }
  });

  // Toolbar
  main.querySelector('.ed-tools').addEventListener('click', e => {
    const b = e.target.closest('[data-tool]');
    if (!b) return;
    ({ text: addText, photo: photoModal, icon: iconModal, formula: formulaModal, chart: chartModal, game: gameModal, layout: layoutModal })[b.dataset.tool](main);
  });

  // Agent
  main.querySelector('.ed-agent').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.keep != null) { pending = null; drawAgent(main); return; }
    if (b.dataset.revert != null) { deck.slides = JSON.parse(pending.before); pending = null; cur = Math.min(cur, deck.slides.length - 1); chat.push({ role: 'bot', text: t('ag.reverted') }); drawAll(main); save(main, 0); return; }
    const a = b.dataset.ask;
    if (a === 'photo') return anotherPhoto(main);
    if (a === 'question') return ask(main, t('ag.p.question', { i: cur + 1 }));
    if (a === 'short') return ask(main, t('ag.p.short', { i: cur + 1 }));
    if (a === 'translate') return ask(main, t('ag.p.translate', { lang: langLabel(b.dataset.lang) }));
  });
  main.querySelector('.ed-agent').addEventListener('submit', e => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (!q || main.querySelector('.ed-agent').dataset.busy) return;
    ask(main, q);
  });
}

/* ---------- toolbar actions ---------- */

function addText(main) {
  const s = deck.slides[cur];
  const key = LIST_FIELD[s.layout];
  if (!key) return toast(t('ed.noList'));
  snapshot();
  (s[key] = s[key] || []).push('');
  drawStage(main); save(main, 0);
  const el = main.querySelector(`.ed-stage [data-f="${key}.${s[key].length - 1}"]`); if (el) el.focus();
}

function mediaLayout(s) { return ['title', 'content', 'stat', 'full-image'].includes(s.layout) ? s.layout : 'content'; }

function photoModal(main) {
  const s = deck.slides[cur];
  const close = openModal({
    title: t('ed.photoTitle'),
    body: html`<div class="fields">
      <div class="new-row"><label class="field grow"><input name="q" value="${s.image_query || plain(s.title)}" placeholder="${t('ed.searchPh')}"></label><button type="button" class="btn-k" data-find style="height:40px;align-self:flex-end">${t('ed.search')}</button></div>
      <div class="new-row"><label class="btn-o grow" style="cursor:pointer">${t('ed.upload')}<input type="file" accept="image/*" hidden data-file></label><button type="button" class="btn-o grow" data-gen>${icon('sparkle', 14)}${t('ed.aiImage')}</button></div>
      ${s.imageUrl ? html`<button type="button" class="btn-danger" data-remove style="align-self:flex-start">${t('ed.removePhoto')}</button>` : ''}
    </div>`.toString()
  });
  const m = document.querySelector('.modal-back:last-child');
  const set = url => { snapshot(); deck.slides[cur] = { ...deck.slides[cur], imageUrl: url, layout: mediaLayout(deck.slides[cur]) }; drawStage(main); drawThumb(main, cur); save(main, 0); close(); };
  m.querySelector('[data-find]').addEventListener('click', async ev => {
    ev.target.disabled = true;
    const q = m.querySelector('[name=q]').value.trim();
    const url = q && await searchImage(q);
    ev.target.disabled = false;
    if (url) { deck.slides[cur].image_query = q; set(url); } else toast(t('ed.notFound'));
  });
  m.querySelector('[data-file]').addEventListener('change', async ev => {
    const file = ev.target.files[0]; if (!file) return;
    set(await downscale(file));
  });
  m.querySelector('[data-gen]').addEventListener('click', async ev => {
    ev.currentTarget.disabled = true;
    try { const url = await generateImage(`Educational illustration for a school lesson slide: ${m.querySelector('[name=q]').value || plain(s.title)}. Clean, bright, no text.`); if (url) set(url); }
    catch (err) { toast(err.message); ev.target.disabled = false; }
  });
  const rm = m.querySelector('[data-remove]');
  if (rm) rm.addEventListener('click', () => { snapshot(); delete deck.slides[cur].imageUrl; deck.slides[cur].imageTried = true; drawStage(main); drawThumb(main, cur); save(main, 0); close(); });
}

/** Resize an uploaded picture so a presentation stays small enough to store. */
function downscale(file, max = 1600) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.85)); URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

function iconModal(main) {
  const s = deck.slides[cur];
  const close = openModal({
    title: t('ed.iconTitle'),
    body: html`<div class="fields"><label class="field">${t('ed.iconName')}<input name="icon" value="${s.icon || ''}" placeholder="book-open"></label>
      <div class="icon-grid">${ICON_SUGGEST.map(n => html`<button type="button" data-icon="${n}" aria-label="${n}"><img src="${iconUrl(n)}" alt=""></button>`)}</div>
      <button type="button" class="btn-danger" data-none style="align-self:flex-start">${t('ed.noIcon')}</button></div>`.toString(),
    onSubmit: form => apply(form.icon.value.trim())
  });
  const apply = name => { snapshot(); deck.slides[cur] = { ...deck.slides[cur], icon: name || null, layout: mediaLayout(deck.slides[cur]) }; if (name) delete deck.slides[cur].imageUrl; drawStage(main); drawThumb(main, cur); save(main, 0); };
  const m = document.querySelector('.modal-back:last-child');
  m.querySelectorAll('[data-icon]').forEach(b => b.addEventListener('click', () => { apply(b.dataset.icon); close(); }));
  m.querySelector('[data-none]').addEventListener('click', () => { apply(''); close(); });
}

function formulaModal(main) {
  const s = deck.slides[cur];
  const src = String(s.formula || '').replace(/^\$+|\$+$/g, '');
  openModal({
    title: t('ed.formulaTitle'),
    body: html`<div class="fields"><label class="field">LaTeX<input name="f" value="${src}" placeholder="I = \\frac{U}{R}"><span class="hint">${t('ed.formulaHint')}</span></label><div class="formula-prev"></div></div>`.toString(),
    extraButtons: s.formula ? html`<button type="button" class="btn-danger" data-rm>${t('ed.removeFormula')}</button>`.toString() : '',
    onSubmit: form => { const v = form.f.value.trim(); snapshot(); deck.slides[cur].formula = v ? `$${v}$` : ''; if (!['title', 'content', 'bigidea'].includes(deck.slides[cur].layout)) deck.slides[cur].layout = 'content'; drawStage(main); drawThumb(main, cur); save(main, 0); }
  });
  const m = document.querySelector('.modal-back:last-child');
  const prev = m.querySelector('.formula-prev');
  const upd = () => { prev.innerHTML = `<div data-f="x">$${esc(m.querySelector('[name=f]').value)}$</div>`; renderMath(prev); };
  m.querySelector('[name=f]').addEventListener('input', upd); upd();
  const rm = m.querySelector('[data-rm]');
  if (rm) rm.addEventListener('click', () => { snapshot(); deck.slides[cur].formula = ''; drawStage(main); drawThumb(main, cur); save(main, 0); m.remove(); });
}

function chartModal(main) {
  const s = deck.slides[cur];
  const text = (s.chart && s.chart.data || []).map(d => `${d.label}: ${d.value}`).join('\n');
  openModal({
    title: t('ed.chartTitle'),
    body: html`<label class="field">${t('ed.chartHint')}<textarea name="c" placeholder="2023: 12&#10;2024: 18&#10;2025: 25">${text}</textarea></label>`.toString(),
    extraButtons: s.chart ? html`<button type="button" class="btn-danger" data-rm>${t('ed.removeChart')}</button>`.toString() : '',
    onSubmit: form => {
      const data = form.c.value.split('\n').map(l => l.split(/[:;\t]/)).filter(p => p.length >= 2 && p[0].trim()).map(([l, v]) => ({ label: l.trim(), value: parseFloat(String(v).replace(',', '.')) || 0 }));
      snapshot(); deck.slides[cur].chart = data.length ? { type: 'bar', data } : null; deck.slides[cur].layout = 'content';
      drawStage(main); drawThumb(main, cur); save(main, 0);
    }
  });
  const rm = document.querySelector('.modal-back:last-child [data-rm]');
  if (rm) rm.addEventListener('click', () => { snapshot(); deck.slides[cur].chart = null; drawStage(main); drawThumb(main, cur); save(main, 0); rm.closest('.modal-back').remove(); });
}

const GAME_TEMPLATES = {
  quiz: () => ({ layout: 'quiz', question: '', options: ['', '', '', ''], correct_index: 0 }),
  truefalse: () => ({ layout: 'truefalse', statement: '', is_true: true }),
  fillblank: () => ({ layout: 'fillblank', sentence_before: '', sentence_after: '', correct_word: '', word_options: ['', '', '', ''] }),
  match: () => ({ layout: 'match', title: '', pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] }),
  problem: () => ({ layout: 'problem', title: '', problem_text: '', solution_steps: [''] })
};

function gameModal(main) {
  const close = openModal({
    title: t('ed.gameTitle'),
    body: html`<div class="layout-grid">${GAME_LAYOUTS.map(l => html`<button type="button" data-g="${l}">${raw(slideBox(GAME_TEMPLATES[l](), deck, 0, 'thumb'))}<span>${t('lay.' + l)}</span></button>`)}</div>`.toString(), wide: true
  });
  document.querySelectorAll('.modal-back:last-child [data-g]').forEach(b => b.addEventListener('click', () => {
    snapshot(); deck.slides.splice(cur + 1, 0, GAME_TEMPLATES[b.dataset.g]()); cur += 1;
    drawThumbs(main); drawStage(main); save(main, 0); close(); toast(t('ed.gameAdded'));
  }));
}

function layoutModal(main) {
  const s = deck.slides[cur];
  const close = openModal({
    title: t('ed.layout'),
    body: html`<div class="layout-grid">${LAYOUTS.map(l => html`<button type="button" data-l="${l}" class="${s.layout === l ? 'on' : ''}">${raw(slideBox({ ...(GAME_TEMPLATES[l] ? GAME_TEMPLATES[l]() : {}), ...s, layout: l }, deck, 0, 'thumb'))}<span>${t('lay.' + l)}</span></button>`)}</div>`.toString(), wide: true
  });
  document.querySelectorAll('.modal-back:last-child [data-l]').forEach(b => b.addEventListener('click', () => {
    snapshot();
    const l = b.dataset.l;
    deck.slides[cur] = { ...(GAME_TEMPLATES[l] ? GAME_TEMPLATES[l]() : {}), ...deck.slides[cur], layout: l };
    if (['content', 'full-image', 'stat', 'bigidea'].includes(l) && !(deck.slides[cur].bullets || []).length) deck.slides[cur].bullets = [''];
    drawThumb(main, cur); drawStage(main); save(main, 0); close();
  }));
}

/* ---------- PDF: the browser's print dialog with one slide per page ---------- */

async function exportPdf() {
  flush();
  const wrap = document.createElement('div');
  wrap.className = 'print-deck' + (deck.ratio === '4:3' ? ' r43' : '');
  wrap.innerHTML = deck.slides.map((s, i) => slideBox(s, deck, i, 'view')).join('');
  const page = document.createElement('style');
  page.textContent = `@page { size: ${deck.ratio === '4:3' ? '254mm 190.5mm' : '297mm 167.06mm'}; margin: 0; }`;
  document.body.append(wrap, page);
  wrap.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
  await renderMath(wrap);
  await Promise.all([...wrap.querySelectorAll('img')].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 4000); })));
  const title = document.title;
  document.title = deck.title || 'alaqai';
  window.print();
  document.title = title;
  wrap.remove(); page.remove();
}
