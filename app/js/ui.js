/* Small UI helpers shared by every screen: escaping, line icons, modal, toast. */
import { add, t } from './i18n.js';

add({
  ru: { 'ui.cancel': 'Отмена', 'ui.save': 'Сохранить', 'ui.close': 'Закрыть', 'ui.delete': 'Удалить', 'ui.confirmDelete': 'Удалить без возможности восстановления?' },
  kk: { 'ui.cancel': 'Бас тарту', 'ui.save': 'Сақтау', 'ui.close': 'Жабу', 'ui.delete': 'Жою', 'ui.confirmDelete': 'Қайтарусыз жоясыз ба?' },
  en: { 'ui.cancel': 'Cancel', 'ui.save': 'Save', 'ui.close': 'Close', 'ui.delete': 'Delete', 'ui.confirmDelete': 'Delete for good?' }
});

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Tagged template that escapes interpolated values; wrap trusted markup in raw(). */
export function html(strings, ...vals) {
  return raw(strings.reduce((out, s, i) => out + s + (i < vals.length ? toHtml(vals[i]) : ''), ''));
}
function toHtml(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(toHtml).join('');
  if (v && v.__raw) return v.__raw;
  return esc(v);
}
export function raw(s) { const str = String(s); return { __raw: str, toString: () => str }; }

/* ---------- line icons (24×24, stroke) ---------- */

export const ICONS = {
  home: 'M3 11l9-7 9 7M5 10v10h14V10',
  lessons: 'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  classes: 'M9 4.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6',
  presentations: 'M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 16v4M8 20h8',
  tests: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  ksp: 'M14 3H6v18h12V7zM14 3v4h4M9 12h6M9 16h6',
  homework: 'M9 3h6v3H9zM7 4.5H5v16h14v-16h-2M8.5 13l2.5 2.5L16 11',
  guide: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4v.8M12 17h.01',
  plan: 'M3 8l4 4 5-7 5 7 4-4-2 11H5z',
  plus: 'M12 5v14M5 12h14',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 8h16M4 16h16',
  play: 'M7 5l12 7-12 7z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  users: 'M9 4.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6'
};

export function icon(name, size = 16, extra = '') {
  const d = ICONS[name] || name;
  const fill = name === 'sparkle' || name === 'play' ? 'currentColor' : 'none';
  return raw(`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}><path d="${d}"/></svg>`);
}

/* ---------- segmented control ---------- */

/** options: [{ id, label }] — renders buttons with data-seg="<name>" data-id="<id>". */
export function segmented(name, options, active, cls = '') {
  return raw(`<div class="seg ${cls}" role="tablist">${options.map(o =>
    `<button type="button" role="tab" data-seg="${esc(name)}" data-id="${esc(o.id)}" aria-selected="${o.id === active}">${esc(o.label)}</button>`).join('')}</div>`);
}

/* ---------- modal ---------- */

/**
 * openModal({ title, body, submitLabel, onSubmit(form) → false to keep open, danger })
 * Returns a close() function.
 */
export function openModal({ title, body, submitLabel, onSubmit, extraButtons = '', wide = false }) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-back';
  wrap.innerHTML = `
    <form class="modal${wide ? ' modal-wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head"><h2>${esc(title)}</h2>
        <button type="button" class="icon-btn" data-close aria-label="${esc(t('ui.close'))}">${icon('close', 18).__raw}</button></div>
      <div class="modal-body">${body}</div>
      <div class="modal-foot">${extraButtons}<span class="grow"></span>
        <button type="button" class="btn-o" data-close>${esc(onSubmit ? t('ui.cancel') : t('ui.close'))}</button>
        ${onSubmit ? `<button type="submit" class="btn-k">${esc(submitLabel || t('ui.save'))}</button>` : ''}
      </div>
    </form>`;
  const prevFocus = document.activeElement;
  const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); prevFocus && prevFocus.focus && prevFocus.focus(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) close(); });
  wrap.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  const form = wrap.querySelector('form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!onSubmit) return close();
    const keep = await onSubmit(form, close);
    if (keep !== false) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(wrap);
  const first = form.querySelector('input, select, textarea');
  (first || form.querySelector('[type=submit]') || form).focus();
  return close;
}

/* ---------- toast ---------- */

export function toast(message) {
  let box = document.querySelector('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}

/** Initials for an avatar: "Фазлиддин Аззамкулов" → "ФА". */
export function initials(name) {
  return String(name || '').trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('') || '·';
}

/** Resize an uploaded picture to a JPEG data URL so it stays small enough to store. */
export function downscale(file, max = 1600, quality = 0.85) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', quality)); URL.revokeObjectURL(img.src);
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); rej(new Error('image')); };
    img.src = URL.createObjectURL(file);
  });
}

/** Copy text; falls back to a hidden textarea where the Clipboard API is blocked. */
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (err) { /* ignore */ }
    ta.remove(); return ok;
  }
}
