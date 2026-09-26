/* alaqai's own form controls. Phones and browsers draw <select>, date and time
 * pickers in their own style; the platform must look the same everywhere, so
 * every such field is shown with our dropdown / calendar instead. The original
 * element stays in the form (hidden) and keeps its value, name and events, so
 * screens read forms exactly as before.
 *
 *   enhance(root)  — upgrade the fields inside root (done automatically for the
 *                    whole page by watchControls()).
 * A field can opt out with data-native. */
import { add, t, locale } from './i18n.js';

add({
  ru: { 'ctl.today': 'Сегодня', 'ctl.close': 'Закрыть', 'ctl.pick': 'Выберите' },
  kk: { 'ctl.today': 'Бүгін', 'ctl.close': 'Жабу', 'ctl.pick': 'Таңдаңыз' },
  en: { 'ctl.today': 'Today', 'ctl.close': 'Close', 'ctl.pick': 'Choose' }
});

const CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const CAL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg>';
const CLOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2"/></svg>';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fire = el => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };

/* ---------- the floating menu (popover on desktop, bottom sheet on phones) ---------- */

let open = null;
function close() {
  if (!open) return;
  open.menu.remove(); if (open.back) open.back.remove();
  open.trigger.setAttribute('aria-expanded', 'false');
  document.removeEventListener('keydown', open.onKey, true);
  document.removeEventListener('mousedown', open.onDown, true);
  window.removeEventListener('resize', close);
  const tr = open.trigger; open = null; tr.focus({ preventScroll: true });
}

function place(trigger, menu) {
  const sheet = window.innerWidth < 640;
  menu.classList.toggle('sheet', sheet);
  if (sheet) return;
  const r = trigger.getBoundingClientRect();
  menu.style.minWidth = Math.max(r.width, 200) + 'px';
  const h = menu.offsetHeight, below = window.innerHeight - r.bottom;
  const top = below < h + 12 && r.top > below ? r.top - h - 6 : r.bottom + 6;
  menu.style.top = Math.max(8, top) + 'px';
  menu.style.left = Math.min(r.left, window.innerWidth - menu.offsetWidth - 8) + 'px';
}

function openMenu(trigger, build, title) {
  if (open && open.trigger === trigger) { close(); return; }
  close();
  const menu = document.createElement('div');
  menu.className = 'dd-menu';
  menu.setAttribute('role', 'dialog');
  const sheet = window.innerWidth < 640;
  let back = null;
  if (sheet) { back = document.createElement('div'); back.className = 'dd-back'; document.body.appendChild(back); }
  menu.innerHTML = sheet ? `<div class="dd-sheet-head"><b>${esc(title || t('ctl.pick'))}</b><button type="button" class="dd-x" aria-label="${esc(t('ctl.close'))}">×</button></div><div class="dd-body"></div>` : '<div class="dd-body"></div>';
  document.body.appendChild(menu);
  const body = menu.querySelector('.dd-body');
  const x = menu.querySelector('.dd-x');
  if (x) x.onclick = close;
  if (back) back.onclick = close;
  open = { trigger, menu, back };
  build(body, close);
  place(trigger, menu);
  trigger.setAttribute('aria-expanded', 'true');
  open.onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
  open.onDown = e => { if (!menu.contains(e.target) && !trigger.contains(e.target) && !(back && back.contains(e.target))) close(); };
  document.addEventListener('keydown', open.onKey, true);
  document.addEventListener('mousedown', open.onDown, true);
  window.addEventListener('resize', close);
}

function labelOf(el) {
  const l = el.closest('label, .field');
  const own = l ? [...l.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim() : '';
  return (own || el.getAttribute('aria-label') || '').slice(0, 60);
}

/* ---------- <select> ---------- */

function enhanceSelect(sel) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd ' + (sel.className || '');
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  if (sel.getAttribute('aria-label')) btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
  const paint = () => {
    const o = sel.options[sel.selectedIndex];
    btn.innerHTML = `<span class="dd-v">${esc(o ? o.textContent : '')}</span>${CHEV}`;
    btn.disabled = sel.disabled;
  };
  paint();
  sel.classList.add('dd-native');
  sel.tabIndex = -1;
  sel.setAttribute('aria-hidden', 'true');
  sel.after(btn);
  sel.addEventListener('change', paint);
  sel._ddPaint = paint;
  btn.addEventListener('click', e => {
    e.preventDefault();
    openMenu(btn, (body, done) => {
      body.setAttribute('role', 'listbox');
      body.innerHTML = [...sel.options].map((o, i) => `<button type="button" role="option" class="dd-opt${i === sel.selectedIndex ? ' on' : ''}" data-i="${i}" ${o.disabled ? 'disabled' : ''}>${esc(o.textContent)}</button>`).join('');
      const opts = [...body.querySelectorAll('.dd-opt')];
      opts.forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        if (i !== sel.selectedIndex) { sel.selectedIndex = i; fire(sel); }
        paint(); done();
      });
      const cur = opts[Math.max(0, sel.selectedIndex)];
      if (cur) { cur.focus({ preventScroll: true }); cur.scrollIntoView({ block: 'nearest' }); }
      body.addEventListener('keydown', ev => {
        const k = opts.indexOf(document.activeElement);
        if (ev.key === 'ArrowDown') { ev.preventDefault(); (opts[k + 1] || opts[k]).focus(); }
        if (ev.key === 'ArrowUp') { ev.preventDefault(); (opts[k - 1] || opts[k]).focus(); }
      });
    }, labelOf(sel));
  });
  btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); btn.click(); } });
}

/* ---------- <input type=date> ---------- */

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return y ? new Date(y, m - 1, d) : null; };
const fmtDate = s => { const d = parse(s); return d ? d.toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' }) : ''; };

function enhanceDate(inp) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd dd-date';
  const paint = () => { btn.innerHTML = `<span class="dd-v${inp.value ? '' : ' ph'}">${esc(inp.value ? fmtDate(inp.value) : inp.placeholder || t('ctl.pick'))}</span>${CAL}`; };
  paint();
  inp.classList.add('dd-native');
  inp.tabIndex = -1;
  inp.after(btn);
  inp.addEventListener('change', paint);
  btn.addEventListener('click', e => {
    e.preventDefault();
    let view = parse(inp.value) || new Date();
    view = new Date(view.getFullYear(), view.getMonth(), 1);
    openMenu(btn, (body, done) => {
      const draw = () => {
        const first = (view.getDay() + 6) % 7;
        const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        const wd = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale(), { weekday: 'short' }).slice(0, 2));
        const today = iso(new Date());
        const cells = [];
        for (let i = 0; i < first; i++) cells.push('<span></span>');
        for (let d = 1; d <= days; d++) {
          const v = iso(new Date(view.getFullYear(), view.getMonth(), d));
          const off = (inp.min && v < inp.min) || (inp.max && v > inp.max);
          cells.push(`<button type="button" data-v="${v}" class="${v === inp.value ? 'on' : ''}${v === today ? ' today' : ''}" ${off ? 'disabled' : ''}>${d}</button>`);
        }
        body.innerHTML = `<div class="cal"><div class="cal-h"><button type="button" data-m="-1" aria-label="‹">‹</button><b>${esc(view.toLocaleDateString(locale(), { month: 'long', year: 'numeric' }))}</b><button type="button" data-m="1" aria-label="›">›</button></div>
          <div class="cal-g">${wd.map(w => `<i>${esc(w)}</i>`).join('')}${cells.join('')}</div>
          <button type="button" class="cal-today" data-today>${esc(t('ctl.today'))}</button></div>`;
        body.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + Number(b.dataset.m), 1); draw(); });
        body.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { inp.value = b.dataset.v; fire(inp); paint(); done(); });
        body.querySelector('[data-today]').onclick = () => { if ((inp.min && today < inp.min) || (inp.max && today > inp.max)) return; inp.value = today; fire(inp); paint(); done(); };
      };
      draw();
    }, labelOf(inp));
  });
}

/* ---------- <input type=time> ---------- */

function enhanceTime(inp) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd dd-time';
  const paint = () => { btn.innerHTML = `<span class="dd-v">${esc(inp.value || '—')}</span>${CLOCK}`; };
  paint();
  inp.classList.add('dd-native');
  inp.tabIndex = -1;
  inp.after(btn);
  inp.addEventListener('change', paint);
  btn.addEventListener('click', e => {
    e.preventDefault();
    const times = [];
    for (let h = 7; h <= 23; h++) for (const m of [0, 30]) times.push(`${String(h).padStart(2, '0')}:${m ? '30' : '00'}`);
    times.push('23:59');
    if (inp.value && !times.includes(inp.value)) times.push(inp.value);
    times.sort();
    openMenu(btn, (body, done) => {
      body.innerHTML = `<div class="dd-grid">${times.map(v => `<button type="button" class="dd-opt${v === inp.value ? ' on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>`;
      body.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { inp.value = b.dataset.v; fire(inp); paint(); done(); });
      const on = body.querySelector('.on'); if (on) on.scrollIntoView({ block: 'center' });
    }, labelOf(inp));
  });
}

/* ---------- wiring ---------- */

export function enhance(root = document) {
  root.querySelectorAll('select:not([data-native]):not(.dd-native)').forEach(enhanceSelect);
  root.querySelectorAll('input[type="date"]:not([data-native]):not(.dd-native)').forEach(enhanceDate);
  root.querySelectorAll('input[type="time"]:not([data-native]):not(.dd-native)').forEach(enhanceTime);
}

/** Code that sets select.value directly can call this to refresh the shown label. */
export function refreshSelect(sel) { if (sel && sel._ddPaint) sel._ddPaint(); }

let queued = false;
export function watchControls() {
  enhance(document);
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; enhance(document); });
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('alaqai:langchange', close);
}

