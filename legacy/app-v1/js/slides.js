/* Slide renderer shared by the presentation editor (screen 7), previews,
 * lesson mode (screen 13) and PDF export. A slide is plain JSON (see
 * gen/prompts.js); sizes use container units so any box shows it correctly
 * at 16:9 or 4:3. Text fields may hold a little inline HTML (b, i, mark). */
import { esc } from './ui.js';
import { iconUrl } from './ai.js';

export const THEMES = {
  lime: { accent: '#D6FF3B', soft: ['#F4FFD1', '#EEF7D4', '#F7FBE3'] },
  coral: { accent: '#FF9A6B', soft: ['#FFE6D9', '#FFF0E8', '#FFE0D1'] },
  sky: { accent: '#7CC6FF', soft: ['#DDF0FF', '#E9F5FF', '#D4EBFF'] },
  lilac: { accent: '#C9B8FF', soft: ['#EDE7FF', '#F3EFFF', '#E6DEFF'] },
  sun: { accent: '#FFD166', soft: ['#FFF1C9', '#FFF6DC', '#FFEBB8'] }
};
const CARD_COLORS = ['#FFE6D9', '#DDF0FF', '#FFF1C9', '#E3F6EA'];

export const LAYOUTS = ['title', 'content', 'full-image', 'stat', 'bigidea', 'compare', 'process', 'quiz', 'truefalse', 'fillblank', 'match', 'problem'];
export const GAME_LAYOUTS = ['quiz', 'truefalse', 'fillblank', 'match', 'problem'];

// Small labels on slides, in the language of the slides (not of the interface).
const LABELS = {
  ru: { bigidea: 'Ключевая мысль', quiz: 'Вопрос классу', truefalse: 'Правда или ложь?', fillblank: 'Вставьте слово', match: 'Соедините пары', problem: 'Задача', process: 'По шагам', true: 'Правда', false: 'Ложь', solution: 'Решение', photo: 'Фото' },
  kk: { bigidea: 'Негізгі ой', quiz: 'Сыныпқа сұрақ', truefalse: 'Шын ба, жалған ба?', fillblank: 'Сөзді қойыңыз', match: 'Жұптарды сәйкестендіріңіз', problem: 'Есеп', process: 'Қадам бойынша', true: 'Шын', false: 'Жалған', solution: 'Шешуі', photo: 'Фото' },
  en: { bigidea: 'Key idea', quiz: 'Question for the class', truefalse: 'True or false?', fillblank: 'Fill the gap', match: 'Match the pairs', problem: 'Problem', process: 'Step by step', true: 'True', false: 'False', solution: 'Solution', photo: 'Photo' },
  uz: { bigidea: 'Asosiy gʻoya', quiz: 'Sinfga savol', truefalse: 'Rostmi yoki yolgʻon?', fillblank: 'Soʻzni qoʻying', match: 'Juftlarni toping', problem: 'Masala', process: 'Qadamma-qadam', true: 'Rost', false: 'Yolgʻon', solution: 'Yechim', photo: 'Rasm' },
  uzc: { bigidea: 'Асосий ғоя', quiz: 'Синфга савол', truefalse: 'Ростми ёки ёлғон?', fillblank: 'Сўзни қўйинг', match: 'Жуфтларни топинг', problem: 'Масала', process: 'Қадамма-қадам', true: 'Рост', false: 'Ёлғон', solution: 'Ечим', photo: 'Расм' }
};
export function slideLabels(lang) {
  const l = String(lang || 'ru');
  if (l === 'uz-cyrl') return LABELS.uzc;
  if (l.startsWith('uz')) return LABELS.uz;
  return LABELS[l.slice(0, 2)] || LABELS.ru;
}

/* ---------- rich text (tiny inline HTML only) ---------- */

const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'MARK', 'BR', 'SUB', 'SUP']);
export function sanitize(input) {
  const s = String(input ?? '');
  if (!/[<&]/.test(s)) return esc(s);
  const doc = new DOMParser().parseFromString(`<div>${s}</div>`, 'text/html');
  const walk = node => [...node.childNodes].map(n => {
    if (n.nodeType === 3) return esc(n.textContent);
    if (n.nodeType !== 1) return '';
    const inner = walk(n);
    if (!ALLOWED.has(n.tagName)) return inner;
    const tag = n.tagName.toLowerCase();
    return tag === 'br' ? '<br>' : `<${tag}>${inner}</${tag}>`;
  }).join('');
  return walk(doc.body.firstChild);
}
export function plain(input) { return new DOMParser().parseFromString(`<div>${input ?? ''}</div>`, 'text/html').body.textContent.trim(); }

/* ---------- rendering ---------- */

/**
 * mode: 'view' (preview), 'edit' (contenteditable fields), 'present' (lesson mode,
 * interactive games), 'thumb' (tiny, no interaction).
 */
export function renderSlide(slide, { deck = {}, index = 0, mode = 'view' } = {}) {
  const s = slide || {};
  const theme = THEMES[deck.theme] || THEMES.lime;
  const L = slideLabels(deck.lang);
  const edit = mode === 'edit';
  const layout = LAYOUTS.includes(s.layout) ? s.layout : 'content';
  const F = (path, value, cls = '', tag = 'div') => {
    const empty = !plain(value) && edit ? ' is-empty' : '';
    return `<${tag} class="${cls}${empty}" data-f="${path}"${edit ? ' contenteditable="true" spellcheck="true"' : ''}>${sanitize(value)}</${tag}>`;
  };
  const list = (key, items, cls = 'sl-bullets') => {
    const arr = Array.isArray(items) ? items : [];
    const rows = (arr.length || !edit ? arr : ['']).map((b, i) => F(`${key}.${i}`, b, 'sl-li', 'li'));
    return rows.length ? `<ul class="${cls}">${rows.join('')}</ul>` : '';
  };
  const media = (big = false) => {
    if (s.imageUrl) return `<figure class="sl-media${big ? ' big' : ''}"><img src="${esc(s.imageUrl)}" alt="" loading="lazy"></figure>`;
    if (s.icon && deck.options?.icons !== false) return `<figure class="sl-media icon"><img src="${esc(iconUrl(s.icon))}" alt="" loading="lazy"></figure>`;
    if (edit) return `<figure class="sl-media empty" data-act="photo"><span>${esc(L.photo)}</span></figure>`;
    return '';
  };
  const formula = s.formula ? `<div class="sl-formula" data-f="formula"${edit ? ' contenteditable="true"' : ''}>${sanitize(s.formula)}</div>` : '';
  const kicker = text => `<div class="sl-kicker">${esc(text)}</div>`;
  // Only lesson mode gets real buttons (thumbnails sit inside links and buttons).
  const B = mode === 'present' ? 'button type="button"' : 'div';
  const BE = mode === 'present' ? 'button' : 'div';
  const opts = (items, correct, game) => `<div class="sl-options">${(items || []).map((o, i) =>
    `<${B} class="sl-opt" data-game="${game}" data-i="${i}" ${i === correct ? 'data-ok' : ''}><b>${'ABCDEF'[i]}</b>${F(`${game === 'quiz' ? 'options' : 'word_options'}.${i}`, o, '', 'span')}</${BE}>`).join('')}</div>`;

  let body;
  switch (layout) {
    case 'title':
      body = `<div class="sl-col">
          ${s.kicker || deck.kicker ? kicker(s.kicker || deck.kicker) : '<div></div>'}
          <div>${F('title', s.title, 'sl-h1')}${F('subtitle', s.subtitle, 'sl-sub')}</div>
          ${formula || '<div></div>'}
        </div>${media()}`;
      break;
    case 'full-image':
      body = `<div class="sl-bg">${s.imageUrl ? `<img src="${esc(s.imageUrl)}" alt="">` : ''}</div>
        <div class="sl-over">${F('title', s.title, 'sl-h2')}${list('bullets', s.bullets)}</div>`;
      break;
    case 'stat':
      body = `<div class="sl-col">${F('title', s.title, 'sl-h2')}
          <div class="sl-stat"><span class="n" data-f="stat_number"${edit ? ' contenteditable="true"' : ''}>${sanitize(s.stat_number)}</span>${F('stat_label', s.stat_label, 'l')}</div>
          ${list('bullets', s.bullets)}</div>${media()}`;
      break;
    case 'bigidea':
      body = `<div class="sl-col full">${kicker(L.bigidea)}${F('title', s.title, 'sl-big')}
          ${(s.bullets || []).length || edit ? `<div class="sl-cards">${(s.bullets && s.bullets.length ? s.bullets : ['']).slice(0, 3).map((b, i) => `<div class="sl-card" style="background:${CARD_COLORS[i]}">${F('bullets.' + i, b)}</div>`).join('')}</div>` : ''}
          ${formula}</div>`;
      break;
    case 'compare':
      body = `<div class="sl-col full">${F('title', s.title, 'sl-h2')}
          <div class="sl-two">
            <div class="sl-side" style="background:${theme.soft[0]}">${F('left_title', s.left_title, 'sl-h3')}${list('left_bullets', s.left_bullets)}</div>
            <div class="sl-side" style="background:${CARD_COLORS[1]}">${F('right_title', s.right_title, 'sl-h3')}${list('right_bullets', s.right_bullets)}</div>
          </div></div>`;
      break;
    case 'process':
      body = `<div class="sl-col full">${kicker(L.process)}${F('title', s.title, 'sl-h2')}
          <ol class="sl-steps">${(s.steps && s.steps.length ? s.steps : edit ? [''] : []).map((st, i) => `<li><span class="k" style="background:${i === 0 ? theme.accent : '#F3F3EC'}">${i + 1}</span>${F('steps.' + i, st, 't')}</li>`).join('')}</ol></div>`;
      break;
    case 'quiz':
      body = `<div class="sl-col full">${kicker(L.quiz)}${F('question', s.question || s.title, 'sl-h2')}${opts(s.options, Number(s.correct_index), 'quiz')}</div>`;
      break;
    case 'truefalse':
      body = `<div class="sl-col full">${kicker(L.truefalse)}${F('statement', s.statement || s.title, 'sl-big')}
          <div class="sl-options two">
            <${B} class="sl-opt" data-game="tf" data-i="1" ${String(s.is_true) !== 'false' ? 'data-ok' : ''}><b>✓</b><span>${esc(L.true)}</span></${BE}>
            <${B} class="sl-opt" data-game="tf" data-i="0" ${String(s.is_true) === 'false' ? 'data-ok' : ''}><b>✕</b><span>${esc(L.false)}</span></${BE}>
          </div></div>`;
      break;
    case 'fillblank': {
      const correct = (s.word_options || []).findIndex(w => plain(w).toLowerCase() === plain(s.correct_word).toLowerCase());
      body = `<div class="sl-col full">${kicker(L.fillblank)}
          <div class="sl-h2 sl-fill">${F('sentence_before', s.sentence_before, '', 'span')} <span class="blank" data-blank>${mode === 'edit' ? sanitize(s.correct_word) : '&nbsp;'}</span> ${F('sentence_after', s.sentence_after, '', 'span')}</div>
          ${opts(s.word_options, correct, 'fill')}</div>`;
      break;
    }
    case 'match': {
      const pairs = Array.isArray(s.pairs) ? s.pairs : [];
      const order = pairs.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % pairs.length) - ((b * 7 + 3) % pairs.length));
      body = `<div class="sl-col full">${kicker(L.match)}${F('title', s.title, 'sl-h2')}
          <div class="sl-match">
            <div>${pairs.map((p, i) => `<${B} class="sl-pair" data-game="match" data-side="l" data-i="${i}">${F(`pairs.${i}.left`, p.left, '', 'span')}</${BE}>`).join('')}</div>
            <div>${(mode === 'edit' ? pairs.map((_, i) => i) : order).map(i => `<${B} class="sl-pair" data-game="match" data-side="r" data-i="${i}">${F(`pairs.${i}.right`, pairs[i].right, '', 'span')}</${BE}>`).join('')}</div>
          </div></div>`;
      break;
    }
    case 'problem':
      body = `<div class="sl-col full">${kicker(L.problem)}${F('title', s.title, 'sl-h2')}${F('problem_text', s.problem_text, 'sl-text')}
          <div class="sl-solution${mode === 'present' ? ' hidden' : ''}" data-solution><b>${esc(L.solution)}</b>${list('solution_steps', s.solution_steps, 'sl-num')}</div>
          ${mode === 'present' ? `<button type="button" class="sl-reveal" data-game="solution">${esc(L.solution)}</button>` : ''}</div>`;
      break;
    default:
      body = `<div class="sl-col">${F('title', s.title, 'sl-h2')}${list('bullets', s.bullets)}${formula}${s.chart ? chart(s.chart) : ''}</div>${media()}`;
  }
  const r43 = deck.ratio === '4:3' ? ' r43' : '';
  return `<div class="sl sl-${layout}${r43} mode-${mode}" style="--accent:${theme.accent};--soft:${theme.soft[0]}" data-index="${index}">${body}</div>`;
}

function chart(c) {
  const data = (c.data || []).filter(d => d && d.label);
  const max = Math.max(1, ...data.map(d => Number(d.value) || 0));
  return `<div class="sl-chart">${data.map(d => `<div class="bar"><i style="height:${Math.round((Number(d.value) || 0) / max * 100)}%"></i><b>${esc(d.value)}</b><span>${esc(d.label)}</span></div>`).join('')}</div>`;
}

/* ---------- interactivity in lesson mode ---------- */

export function bindGames(root) {
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-game]');
    if (!b || !root.contains(b)) return;
    const sl = b.closest('.sl');
    const game = b.dataset.game;
    if (game === 'quiz' || game === 'tf' || game === 'fill') {
      if (sl.classList.contains('answered')) return;
      sl.classList.add('answered');
      b.classList.add(b.hasAttribute('data-ok') ? 'ok' : 'bad');
      sl.querySelectorAll('[data-ok]').forEach(x => x.classList.add('ok'));
      if (game === 'fill') { const ok = sl.querySelector('[data-ok]'); const blank = sl.querySelector('[data-blank]'); if (ok && blank) blank.textContent = ok.textContent.slice(1); }
    } else if (game === 'match') {
      const picked = sl.querySelector('.sl-pair.picked');
      if (!picked || picked === b) { sl.querySelectorAll('.sl-pair.picked').forEach(x => x.classList.remove('picked')); if (!b.classList.contains('ok')) b.classList.add('picked'); return; }
      if (picked.dataset.side === b.dataset.side) { picked.classList.remove('picked'); b.classList.add('picked'); return; }
      if (picked.dataset.i === b.dataset.i) { picked.classList.remove('picked'); picked.classList.add('ok'); b.classList.add('ok'); }
      else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 500); }
    } else if (game === 'solution') {
      sl.querySelector('[data-solution]').classList.remove('hidden');
      b.remove();
    }
  });
}

/* ---------- formulas (KaTeX from cdnjs, loaded only when a slide has $…$) ---------- */

let katexLoading = null;
function loadKatex() {
  if (katexLoading) return katexLoading;
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/';
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = base + 'katex.min.css';
  document.head.appendChild(css);
  const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  katexLoading = load(base + 'katex.min.js').then(() => load(base + 'contrib/auto-render.min.js')).catch(() => null);
  return katexLoading;
}
export async function renderMath(root) {
  if (!root || !/\$/.test(root.textContent)) return;
  await loadKatex();
  if (!window.renderMathInElement) return;
  root.querySelectorAll('[data-f]').forEach(el => {
    if (el === document.activeElement) return;
    window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
  });
}
