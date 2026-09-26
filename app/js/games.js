/* Games (screen 9) and their players — reused on the games page, in previews
 * and in lesson mode. Ported from the old test constructor (legacy/tests.html):
 * each game is written as plain text in a simple format and played from it. */
import { add, t, lang } from './i18n.js';
import { esc } from './ui.js';

add({
  ru: {
    'g.quiz': 'Викторина', 'g.matching': 'Совпадения', 'g.crossword': 'Кроссворд', 'g.memory': 'Мемори', 'g.fill': 'Вставь слова', 'g.search': 'Найди слова', 'g.truefalse': 'Правда / Ложь', 'g.anagram': 'Анаграмма', 'g.sort': 'Сортировка',
    'gh.quiz': 'Вопрос в первой строке, варианты ниже. Правильный отметьте «+». Вопросы разделяйте пустой строкой.',
    'gh.matching': 'По паре в строке: термин = пара.', 'gh.memory': 'По паре в строке: термин = пара. Минимум 3 пары.',
    'gh.crossword': 'По слову в строке: слово = подсказка. Слова сами пересекутся по общим буквам.', 'gh.fill': 'Текст, где пропуски — в квадратных скобках: Вчера я [играл] в футбол.',
    'gh.search': 'По слову в строке, без пробелов.', 'gh.truefalse': 'По утверждению в строке: «+» — верно, «−» — неверно.', 'gh.anagram': 'По слову в строке, можно с подсказкой: слово = подсказка.',
    'gh.sort': 'Категория начинается с «#», под ней — элементы по одному в строке.',
    'gp.score': '{n} из {total}', 'gp.check': 'Проверить', 'gp.again': 'Сначала', 'gp.win': 'Отлично! Всё верно.', 'gp.next': 'Дальше', 'gp.finish': 'Результат: {n} из {total}',
    'gp.true': 'Правда', 'gp.false': 'Ложь', 'gp.across': 'По горизонтали', 'gp.down': 'По вертикали', 'gp.hint': 'Подсказка', 'gp.bank': 'Выберите слово, потом нажмите на пропуск',
    'gp.bad': 'Не получилось собрать игру — проверьте формат текста.', 'gp.found': 'Найдено {n} из {total}', 'gp.moves': 'Ходов: {n}'
  },
  kk: {
    'g.quiz': 'Викторина', 'g.matching': 'Сәйкестендіру', 'g.crossword': 'Сөзжұмбақ', 'g.memory': 'Мемори', 'g.fill': 'Сөзді қой', 'g.search': 'Сөз ізде', 'g.truefalse': 'Шын / Жалған', 'g.anagram': 'Анаграмма', 'g.sort': 'Сұрыптау',
    'gh.quiz': 'Бірінші жолда сұрақ, астында нұсқалар. Дұрысын «+» белгісімен белгілеңіз. Сұрақтарды бос жолмен бөліңіз.',
    'gh.matching': 'Әр жолға бір жұп: термин = жұбы.', 'gh.memory': 'Әр жолға бір жұп: термин = жұбы. Кемінде 3 жұп.',
    'gh.crossword': 'Әр жолға бір сөз: сөз = кеңес. Сөздер ортақ әріптермен өздігінен қиылысады.', 'gh.fill': 'Бос орындар төртбұрышты жақшада: Кеше мен [футбол] ойнадым.',
    'gh.search': 'Әр жолға бір сөз, бос орынсыз.', 'gh.truefalse': 'Әр жолға бір тұжырым: «+» — дұрыс, «−» — қате.', 'gh.anagram': 'Әр жолға бір сөз, кеңеспен болады: сөз = кеңес.',
    'gh.sort': 'Санат «#» белгісімен басталады, астында — элементтер әр жолда.',
    'gp.score': '{total}-дан {n}', 'gp.check': 'Тексеру', 'gp.again': 'Басынан', 'gp.win': 'Керемет! Бәрі дұрыс.', 'gp.next': 'Келесі', 'gp.finish': 'Нәтиже: {total}-дан {n}',
    'gp.true': 'Шын', 'gp.false': 'Жалған', 'gp.across': 'Көлденең', 'gp.down': 'Тігінен', 'gp.hint': 'Кеңес', 'gp.bank': 'Сөзді таңдап, бос орынды басыңыз',
    'gp.bad': 'Ойын құрылмады — мәтін форматын тексеріңіз.', 'gp.found': '{total}-дан {n} табылды', 'gp.moves': 'Жүріс: {n}'
  },
  en: {
    'g.quiz': 'Quiz', 'g.matching': 'Matching', 'g.crossword': 'Crossword', 'g.memory': 'Memory', 'g.fill': 'Fill the gaps', 'g.search': 'Word search', 'g.truefalse': 'True / False', 'g.anagram': 'Anagram', 'g.sort': 'Sorting',
    'gh.quiz': 'Question on the first line, options below. Mark the correct one with “+”. Separate questions with an empty line.',
    'gh.matching': 'One pair per line: term = match.', 'gh.memory': 'One pair per line: term = match. At least 3 pairs.',
    'gh.crossword': 'One word per line: word = clue. Words cross each other by shared letters.', 'gh.fill': 'Text with gaps in square brackets: Yesterday I [played] football.',
    'gh.search': 'One word per line, no spaces.', 'gh.truefalse': 'One statement per line: “+” true, “−” false.', 'gh.anagram': 'One word per line, optionally with a hint: word = hint.',
    'gh.sort': 'A category starts with “#”, its items go below, one per line.',
    'gp.score': '{n} of {total}', 'gp.check': 'Check', 'gp.again': 'Restart', 'gp.win': 'Great! All correct.', 'gp.next': 'Next', 'gp.finish': 'Score: {n} of {total}',
    'gp.true': 'True', 'gp.false': 'False', 'gp.across': 'Across', 'gp.down': 'Down', 'gp.hint': 'Hint', 'gp.bank': 'Pick a word, then tap a gap',
    'gp.bad': 'Could not build the game — check the text format.', 'gp.found': 'Found {n} of {total}', 'gp.moves': 'Moves: {n}'
  }
});

/* ---------- catalogue ---------- */

export const GAMES = {
  quiz: { bg: '#DDF0FF', ink: '#2F4B63', icon: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4v.8M12 17h.01' },
  matching: { bg: '#FFE6D9', ink: '#6B3A22', icon: 'M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1' },
  crossword: { bg: '#FFF1C9', ink: '#6B5310', icon: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18' },
  memory: { bg: '#ECE5FF', ink: '#45367A', icon: 'M3 5h8v14H3zM13 5h8v14h-8z' },
  fill: { icon: 'M4 20l4-1 11-11-3-3L5 16z' },
  search: { icon: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-3.5-3.5' },
  truefalse: { icon: 'M4 12l5 5L20 6' },
  anagram: { icon: 'M4 18l4-12 4 12M5.5 14h5M15 6h5l-5 12h5' },
  sort: { icon: 'M3 7h7l2 2h9v10H3z' }
};
export const DEFAULT_ORDER = ['quiz', 'matching', 'crossword', 'memory', 'fill', 'search', 'truefalse', 'anagram', 'sort'];

const SAMPLES = {
  ru: {
    quiz: 'Какая форма глагола go в Past Simple?\n+went\ngoed\ngone\ngoes\n\nКак образуется Past Simple правильных глаголов?\n+глагол + -ed\nглагол + -ing\nhave + V3\nwill + глагол',
    matching: 'go = went\nsee = saw\nhave = had\nbuy = bought\neat = ate',
    memory: 'go = went\nsee = saw\nhave = had\nbuy = bought',
    crossword: 'атом = мельчайшая частица вещества\nсила = причина ускорения тела\nмасса = мера инертности тела\nток = направленное движение зарядов',
    fill: 'Вчера я [играл] в футбол, а потом мы [смотрели] фильм.',
    search: 'ФИЗИКА\nЭНЕРГИЯ\nСИЛА\nМАССА\nАТОМ',
    truefalse: '+Сила измеряется в ньютонах\n-Скорость звука больше скорости света\n+При нагревании тела расширяются',
    anagram: 'энергия = способность совершать работу\nатом = мельчайшая частица вещества',
    sort: '# Твёрдые\nЛёд\nКамень\n\n# Жидкие\nВода\nМасло\n\n# Газы\nКислород\nГелий'
  },
  kk: {
    quiz: 'go етістігінің Past Simple түрі қандай?\n+went\ngoed\ngone\ngoes',
    matching: 'go = went\nsee = saw\nhave = had\nbuy = bought',
    memory: 'go = went\nsee = saw\nhave = had\nbuy = bought',
    crossword: 'атом = заттың ең кіші бөлшегі\nкүш = дененің үдеу себебі\nмасса = инерттілік өлшемі',
    fill: 'Кеше мен [футбол] ойнадым, кейін біз [кино] көрдік.',
    search: 'ФИЗИКА\nЭНЕРГИЯ\nКҮШ\nМАССА\nАТОМ',
    truefalse: '+Күш ньютонмен өлшенеді\n-Дыбыс жылдамдығы жарық жылдамдығынан үлкен',
    anagram: 'энергия = жұмыс істеу қабілеті\nатом = заттың ең кіші бөлшегі',
    sort: '# Қатты\nМұз\nТас\n\n# Сұйық\nСу\nМай\n\n# Газ\nОттегі\nГелий'
  },
  en: {
    quiz: 'What is the past of “go”?\n+went\ngoed\ngone\ngoes',
    matching: 'go = went\nsee = saw\nhave = had\nbuy = bought',
    memory: 'go = went\nsee = saw\nhave = had\nbuy = bought',
    crossword: 'atom = the smallest particle of matter\nforce = a push or a pull\nmass = how much matter an object has',
    fill: 'Yesterday I [played] football and then we [watched] a film.',
    search: 'PHYSICS\nENERGY\nFORCE\nMASS\nATOM',
    truefalse: '+Force is measured in newtons\n-Sound travels faster than light',
    anagram: 'energy = the ability to do work\natom = the smallest particle of matter',
    sort: '# Solids\nIce\nStone\n\n# Liquids\nWater\nOil\n\n# Gases\nOxygen\nHelium'
  }
};
export function sample(type) { return (SAMPLES[lang()] || SAMPLES.ru)[type] || ''; }

/* ---------- text <-> data ---------- */

const lines = raw => String(raw || '').split('\n').map(l => l.trim()).filter(Boolean);
const pairLines = raw => lines(raw).map(l => { const k = l.indexOf('='); return k < 0 ? null : { a: l.slice(0, k).trim(), b: l.slice(k + 1).trim() }; }).filter(p => p && p.a && p.b);

/** Text of a game, whether it was typed by hand or made by AI (pairs / questions). */
export function gameText(g) {
  if (g.raw) return g.raw;
  if (g.pairs) return g.pairs.map(p => `${p.a} = ${p.b}`).join('\n');
  if (g.questions) return g.questions.map(q => [q.q, ...(q.options || []).map((o, i) => (i === q.answer ? '+' : '') + o)].join('\n')).join('\n\n');
  return '';
}

export function parse(type, raw) {
  switch (type) {
    case 'matching': case 'memory': case 'crossword': case 'anagram':
      return type === 'anagram' || type === 'crossword'
        ? lines(raw).map(l => { const [w, h] = l.split('=').map(s => (s || '').trim()); return { word: w, hint: h || '' }; }).filter(x => x.word)
        : pairLines(raw);
    case 'quiz':
      return String(raw || '').split(/\n\s*\n/).map(b => lines(b)).filter(b => b.length >= 3).map(([q, ...opts]) => ({
        q, options: opts.map(o => o.replace(/^[+*]\s*/, '')), answer: Math.max(0, opts.findIndex(o => /^[+*]/.test(o)))
      }));
    case 'truefalse':
      return lines(raw).map(l => ({ text: l.replace(/^[+\-−–]\s*/, ''), isTrue: !/^[\-−–]/.test(l) })).filter(x => x.text);
    case 'search':
      return lines(raw).map(w => w.toUpperCase().replace(/\s+/g, '')).filter(w => w.length >= 2 && w.length <= 14);
    case 'fill':
      return String(raw || '');
    case 'sort': {
      const cats = []; let cur = null;
      lines(raw).forEach(l => { if (l.startsWith('#')) { cur = { name: l.slice(1).trim(), items: [] }; cats.push(cur); } else if (cur) cur.items.push(l); });
      return cats.filter(c => c.name && c.items.length);
    }
    default: return null;
  }
}

/* ---------- players ---------- */

const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

/**
 * Renders a playable game into `el`. `game` = { type, raw? | pairs? | questions? }.
 * opts.onScore(n, total) is called as the class plays.
 */
export function playGame(el, game, opts = {}) {
  const type = game.type;
  const data = parse(type, gameText(game));
  const ok = data && (typeof data === 'string' ? /\[[^\]]+\]/.test(data) : data.length >= (type === 'quiz' || type === 'truefalse' || type === 'sort' || type === 'search' ? 1 : 2));
  if (!ok) { el.innerHTML = `<div class="gp-bad">${esc(t('gp.bad'))}</div>`; return; }
  const P = { quiz, matching, memory, crossword, fill, search, truefalse, anagram, sort }[type];
  el.innerHTML = '';
  el.className = 'gp gp-' + type;
  P(el, data, opts.onScore || (() => {}), opts);
}

function head(el, title, total) {
  el.insertAdjacentHTML('beforeend', `<div class="gp-head"><b>${esc(title)}</b><span class="gp-score" data-score>${esc(t('gp.score', { n: 0, total }))}</span></div>`);
  return n => { const s = el.querySelector('[data-score]'); if (s) s.textContent = t('gp.score', { n, total }); };
}
function win(el) { el.insertAdjacentHTML('beforeend', `<div class="gp-win">${esc(t('gp.win'))}</div>`); }

function quiz(el, qs, onScore, opts = {}) {
  let i = 0, right = 0;
  const draw = () => {
    if (i >= qs.length) { el.innerHTML = `<div class="gp-final"><b>${esc(t('gp.finish', { n: right, total: qs.length }))}</b><button type="button" class="btn-o" data-again>${esc(t('gp.again'))}</button></div>`; el.querySelector('[data-again]').onclick = () => { i = 0; right = 0; draw(); }; return; }
    const q = qs[i];
    el.innerHTML = `<div class="gp-head"><b>${i + 1} / ${qs.length}</b><span class="gp-score">${esc(t('gp.score', { n: right, total: qs.length }))}</span></div>
      <div class="gp-q">${esc(q.q)}</div>
      <div class="gp-opts">${q.options.map((o, k) => `<button type="button" data-k="${k}"><b>${'ABCDEF'[k]}</b>${esc(o)}</button>`).join('')}</div>
      <div class="gp-foot"></div>`;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      if (el.querySelector('.gp-opts').dataset.done) return;
      el.querySelector('.gp-opts').dataset.done = '1';
      const k = Number(b.dataset.k);
      if (k === q.answer) { right++; b.classList.add('ok'); } else { b.classList.add('bad'); el.querySelector(`[data-k="${q.answer}"]`).classList.add('ok'); }
      onScore(right, qs.length);
      if (opts.onAnswer) opts.onAnswer(i, k === q.answer);
      el.querySelector('.gp-foot').innerHTML = `<button type="button" class="btn-k" data-next>${esc(t('gp.next'))}</button>`;
      el.querySelector('[data-next]').onclick = () => { i++; draw(); };
    });
  };
  draw();
}

function matching(el, pairs, onScore) {
  const set = head(el, t('g.matching'), pairs.length);
  let done = 0, picked = null;
  el.insertAdjacentHTML('beforeend', `<div class="gp-match"><div>${pairs.map((p, i) => `<button type="button" data-side="a" data-i="${i}">${esc(p.a)}</button>`).join('')}</div>
    <div>${shuffle(pairs.map((p, i) => i)).map(i => `<button type="button" data-side="b" data-i="${i}">${esc(pairs[i].b)}</button>`).join('')}</div></div>`);
  el.querySelectorAll('.gp-match button').forEach(b => b.onclick = () => {
    if (b.classList.contains('ok')) return;
    if (!picked || picked.dataset.side === b.dataset.side) { if (picked) picked.classList.remove('picked'); picked = b; b.classList.add('picked'); return; }
    if (picked.dataset.i === b.dataset.i) { [picked, b].forEach(x => { x.classList.remove('picked'); x.classList.add('ok'); }); done++; set(done); onScore(done, pairs.length); if (done === pairs.length) win(el); }
    else { const p = picked; [p, b].forEach(x => x.classList.add('bad')); setTimeout(() => [p, b].forEach(x => x.classList.remove('bad', 'picked')), 450); }
    picked = null;
  });
}

function memory(el, pairs, onScore) {
  const set = head(el, t('g.memory'), pairs.length);
  const cards = shuffle(pairs.flatMap((p, i) => [{ i, text: p.a }, { i, text: p.b }]));
  let open = [], done = 0, busy = false;
  el.insertAdjacentHTML('beforeend', `<div class="gp-memory" style="--cols:${cards.length > 12 ? 5 : 4}">${cards.map((c, k) => `<button type="button" data-k="${k}"><span class="back"></span><span class="front">${esc(c.text)}</span></button>`).join('')}</div>`);
  el.querySelectorAll('.gp-memory button').forEach(b => b.onclick = () => {
    if (busy || b.classList.contains('open')) return;
    b.classList.add('open'); open.push(b);
    if (open.length < 2) return;
    const [x, y] = open; open = [];
    if (cards[x.dataset.k].i === cards[y.dataset.k].i) { x.classList.add('ok'); y.classList.add('ok'); done++; set(done); onScore(done, pairs.length); if (done === pairs.length) win(el); }
    else { busy = true; setTimeout(() => { x.classList.remove('open'); y.classList.remove('open'); busy = false; }, 800); }
  });
}

function truefalse(el, items, onScore) {
  const set = head(el, t('g.truefalse'), items.length);
  let right = 0;
  el.insertAdjacentHTML('beforeend', `<div class="gp-tf">${items.map((x, i) => `<div class="row" data-i="${i}"><span>${esc(x.text)}</span>
    <button type="button" data-v="1">${esc(t('gp.true'))}</button><button type="button" data-v="0">${esc(t('gp.false'))}</button></div>`).join('')}</div>`);
  el.querySelectorAll('.gp-tf .row').forEach(r => r.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (r.dataset.done) return;
    r.dataset.done = '1';
    const good = (b.dataset.v === '1') === items[r.dataset.i].isTrue;
    b.classList.add(good ? 'ok' : 'bad');
    if (!good) r.querySelector(`[data-v="${items[r.dataset.i].isTrue ? 1 : 0}"]`).classList.add('ok');
    if (good) right++;
    set(right); onScore(right, items.length);
  }));
}

function anagram(el, words, onScore) {
  const set = head(el, t('g.anagram'), words.length);
  let right = 0;
  el.insertAdjacentHTML('beforeend', `<div class="gp-anagram">${words.map((w, i) => {
    let mixed = w.word.toUpperCase(); for (let k = 0; k < 5 && mixed === w.word.toUpperCase(); k++) mixed = shuffle([...w.word.toUpperCase()]).join('');
    return `<div class="row"><span class="mix">${esc(mixed)}</span>${w.hint ? `<span class="small">${esc(w.hint)}</span>` : ''}<input data-i="${i}" autocomplete="off" aria-label="${esc(t('gp.hint'))}"></div>`;
  }).join('')}<button type="button" class="btn-k" data-check>${esc(t('gp.check'))}</button></div>`);
  el.querySelector('[data-check]').onclick = () => {
    right = 0;
    el.querySelectorAll('.gp-anagram input').forEach(inp => {
      const good = inp.value.trim().toUpperCase() === words[inp.dataset.i].word.toUpperCase();
      inp.classList.toggle('ok', good); inp.classList.toggle('bad', !good && !!inp.value.trim());
      if (good) right++;
    });
    set(right); onScore(right, words.length); if (right === words.length) win(el);
  };
}

function fill(el, text, onScore) {
  const words = [];
  const html = esc(text).replace(/\[([^\]]+)\]/g, (m, w) => { words.push(w.trim()); return `<button type="button" class="blank" data-i="${words.length - 1}">&nbsp;</button>`; });
  const set = head(el, t('g.fill'), words.length);
  el.insertAdjacentHTML('beforeend', `<div class="gp-fill">${html}</div><div class="small">${esc(t('gp.bank'))}</div>
    <div class="gp-bank">${shuffle(words.map((w, i) => ({ w, i }))).map(x => `<button type="button" data-w="${esc(x.w)}">${esc(x.w)}</button>`).join('')}</div>
    <button type="button" class="btn-k" data-check>${esc(t('gp.check'))}</button>`);
  let pick = null;
  el.querySelectorAll('.gp-bank button').forEach(b => b.onclick = () => { if (b.classList.contains('used')) return; el.querySelectorAll('.gp-bank .picked').forEach(x => x.classList.remove('picked')); pick = b; b.classList.add('picked'); });
  el.querySelectorAll('.gp-fill .blank').forEach(bl => bl.onclick = () => {
    if (bl.dataset.w) { const chip = [...el.querySelectorAll('.gp-bank button.used')].find(c => c.dataset.w === bl.dataset.w); if (chip) chip.classList.remove('used'); bl.dataset.w = ''; bl.innerHTML = '&nbsp;'; bl.classList.remove('ok', 'bad'); return; }
    if (!pick) return;
    bl.dataset.w = pick.dataset.w; bl.textContent = pick.dataset.w; pick.classList.add('used'); pick.classList.remove('picked'); pick = null;
  });
  el.querySelector('[data-check]').onclick = () => {
    let right = 0;
    el.querySelectorAll('.gp-fill .blank').forEach(bl => { const good = (bl.dataset.w || '').toLowerCase() === words[bl.dataset.i].toLowerCase(); bl.classList.toggle('ok', good); bl.classList.toggle('bad', !good && !!bl.dataset.w); if (good) right++; });
    set(right); onScore(right, words.length); if (right === words.length) win(el);
  };
}

function search(el, words, onScore) {
  const size = Math.min(14, Math.max(8, ...words.map(w => w.length + 1)));
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const dirs = [[0, 1], [1, 0], [1, 1]];
  const placed = [];
  words.forEach(w => {
    for (let tries = 0; tries < 200; tries++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r0 = Math.floor(Math.random() * (size - dr * (w.length - 1)));
      const c0 = Math.floor(Math.random() * (size - dc * (w.length - 1)));
      if ([...w].every((ch, i) => !grid[r0 + dr * i][c0 + dc * i] || grid[r0 + dr * i][c0 + dc * i] === ch)) {
        [...w].forEach((ch, i) => { grid[r0 + dr * i][c0 + dc * i] = ch; });
        placed.push({ w, cells: [...w].map((_, i) => `${r0 + dr * i},${c0 + dc * i}`) });
        break;
      }
    }
  });
  const letters = /[А-ЯЁӘҒҚҢӨҰҮҺІ]/.test(words.join('')) ? 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЫЭЮЯӘҒҚҢӨҰҮІ' : 'ABCDEFGHIJKLMNOPRSTUVWY';
  grid.forEach(row => row.forEach((ch, c) => { if (!ch) row[c] = letters[Math.floor(Math.random() * letters.length)]; }));
  const set = head(el, t('g.search'), placed.length);
  el.insertAdjacentHTML('beforeend', `<div class="gp-search"><div class="grid" style="--n:${size}">${grid.map((row, r) => row.map((ch, c) => `<button type="button" data-rc="${r},${c}">${ch}</button>`).join('')).join('')}</div>
    <div class="words">${placed.map(p => `<span data-w="${esc(p.w)}">${esc(p.w)}</span>`).join('')}</div></div>`);
  let sel = [], found = 0;
  el.querySelectorAll('.grid button').forEach(b => b.onclick = () => {
    if (b.classList.contains('sel')) { b.classList.remove('sel'); sel = sel.filter(x => x !== b.dataset.rc); return; }
    b.classList.add('sel'); sel.push(b.dataset.rc);
    const hit = placed.find(p => !p.found && p.cells.length === sel.length && p.cells.every(c => sel.includes(c)));
    if (hit) {
      hit.found = true; found++;
      hit.cells.forEach(c => { const x = el.querySelector(`[data-rc="${c}"]`); x.classList.remove('sel'); x.classList.add('ok'); });
      el.querySelector(`.words [data-w="${CSS.escape(hit.w)}"]`).classList.add('ok');
      sel = []; set(found); onScore(found, placed.length); if (found === placed.length) win(el);
    } else if (sel.length > Math.max(...placed.map(p => p.w.length))) { sel.forEach(c => el.querySelector(`[data-rc="${c}"]`).classList.remove('sel')); sel = []; }
  });
}

function crossword(el, entries, onScore) {
  const list = entries.map(e => ({ ...e, word: e.word.toUpperCase().replace(/\s+/g, '') })).filter(e => e.word.length >= 2).sort((a, b) => b.word.length - a.word.length);
  const grid = {}, placements = [];
  const can = (w, r0, c0, dr, dc) => [...w].every((ch, i) => !grid[`${r0 + dr * i},${c0 + dc * i}`] || grid[`${r0 + dr * i},${c0 + dc * i}`] === ch);
  const put = (e, r0, c0, dr, dc) => { const cells = [...e.word].map((ch, i) => { grid[`${r0 + dr * i},${c0 + dc * i}`] = ch; return [r0 + dr * i, c0 + dc * i]; }); placements.push({ ...e, cells, dr, dc }); };
  put(list[0], 0, 0, 0, 1);
  list.slice(1).forEach(e => {
    for (const key of Object.keys(grid)) {
      const [gr, gc] = key.split(',').map(Number);
      for (let i = 0; i < e.word.length; i++) {
        if (e.word[i] !== grid[key]) continue;
        for (const [dr, dc] of [[1, 0], [0, 1]]) { if (can(e.word, gr - dr * i, gc - dc * i, dr, dc)) { put(e, gr - dr * i, gc - dc * i, dr, dc); return; } }
      }
    }
    const maxR = Math.max(...Object.keys(grid).map(k => Number(k.split(',')[0])));
    put(e, maxR + 2, 0, 0, 1);
  });
  const cells = Object.keys(grid).map(k => k.split(',').map(Number));
  const minR = Math.min(...cells.map(c => c[0])), minC = Math.min(...cells.map(c => c[1]));
  const H = Math.max(...cells.map(c => c[0])) - minR + 1, W = Math.max(...cells.map(c => c[1])) - minC + 1;
  const starts = [...new Set(placements.map(p => `${p.cells[0][0] - minR},${p.cells[0][1] - minC}`))].map(k => k.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const num = {}; starts.forEach((s, i) => { num[s.join(',')] = i + 1; });
  placements.forEach(p => { p.n = num[`${p.cells[0][0] - minR},${p.cells[0][1] - minC}`]; });
  const total = cells.length;
  const set = head(el, t('g.crossword'), total);
  let gridHtml = '';
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const ch = grid[`${r + minR},${c + minC}`];
    gridHtml += ch ? `<label class="cell">${num[`${r},${c}`] ? `<i>${num[`${r},${c}`]}</i>` : ''}<input maxlength="1" data-key="${r + minR},${c + minC}" autocomplete="off"></label>` : '<span class="cell off"></span>';
  }
  const clue = p => `<div><b>${p.n}.</b> ${esc(p.hint || p.word)}</div>`;
  el.insertAdjacentHTML('beforeend', `<div class="gp-cw"><div class="grid" style="--w:${W}">${gridHtml}</div>
    <div class="clues"><h4>${esc(t('gp.across'))} →</h4>${placements.filter(p => p.dc).sort((a, b) => a.n - b.n).map(clue).join('')}
    <h4>${esc(t('gp.down'))} ↓</h4>${placements.filter(p => p.dr).sort((a, b) => a.n - b.n).map(clue).join('')}</div></div>
    <button type="button" class="btn-k" data-check>${esc(t('gp.check'))}</button>`);
  el.querySelectorAll('.gp-cw input').forEach(inp => inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase(); }));
  el.querySelector('[data-check]').onclick = () => {
    let right = 0;
    el.querySelectorAll('.gp-cw input').forEach(inp => { const good = inp.value === grid[inp.dataset.key]; inp.parentElement.classList.toggle('ok', good); inp.parentElement.classList.toggle('bad', !good && !!inp.value); if (good) right++; });
    set(right); onScore(right, total); if (right === total) win(el);
  };
}

function sort(el, cats, onScore) {
  const items = shuffle(cats.flatMap((c, ci) => c.items.map(text => ({ text, ci }))));
  const set = head(el, t('g.sort'), items.length);
  el.insertAdjacentHTML('beforeend', `<div class="gp-pool">${items.map((x, k) => `<button type="button" data-k="${k}">${esc(x.text)}</button>`).join('')}</div>
    <div class="gp-cats" style="--n:${cats.length}">${cats.map((c, ci) => `<button type="button" class="cat" data-ci="${ci}"><b>${esc(c.name)}</b><span class="drop"></span></button>`).join('')}</div>`);
  let pick = null, right = 0;
  el.querySelectorAll('.gp-pool button').forEach(b => b.onclick = () => { el.querySelectorAll('.gp-pool .picked').forEach(x => x.classList.remove('picked')); pick = b; b.classList.add('picked'); });
  el.querySelectorAll('.gp-cats .cat').forEach(cat => cat.onclick = () => {
    if (!pick) return;
    const item = items[pick.dataset.k];
    if (item.ci === Number(cat.dataset.ci)) {
      cat.querySelector('.drop').insertAdjacentHTML('beforeend', `<span>${esc(item.text)}</span>`); pick.remove(); pick = null; right++;
      set(right); onScore(right, items.length); if (right === items.length) win(el);
    } else { const p = pick; p.classList.add('bad'); setTimeout(() => p.classList.remove('bad'), 450); }
  });
}
