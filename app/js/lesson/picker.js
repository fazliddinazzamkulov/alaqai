/* Screens 16–17 · Choosing who answers: wheel of fortune (with a group wheel
 * first), a slot-machine drum, or a card. Opens over the slide. */
import { add, t } from '../i18n.js';
import { esc, icon } from '../ui.js';

add({
  ru: { 'pk.wheel': 'Колесо фортуны', 'pk.drum': 'Барабан', 'pk.card': 'Карточка', 'pk.from': 'Из кого выбирать', 'pk.class': 'Весь класс', 'pk.groups': 'По группам · по одному', 'pk.noRepeat': 'Не повторять',
    'pk.info': 'Уже отвечали: {n}. Кого нет на уроке — в выборе не участвует.', 'pk.answers': 'Отвечает: ', 'pk.answersMany': 'Отвечают: ', 'pk.plus': '+1 балл', 'pk.plusGroup': '+1 балл группе', 'pk.spin': 'Крутить!', 'pk.again': 'Крутить снова',
    'pk.groupWheel': '1 · Колесо групп', 'pk.whoFrom': '2 · Кто из группы {g}', 'pk.fell': 'Выпала: ', 'pk.nobody': 'Некого выбирать — отметьте пришедших или снимите «Не повторять».', 'pk.noGroups': 'Сначала разделите класс на группы в панели «Группы».', 'pk.reset': 'Сбросить отвечавших', 'pk.tap': 'Нажмите «Крутить!»' },
  kk: { 'pk.wheel': 'Бақыт дөңгелегі', 'pk.drum': 'Барабан', 'pk.card': 'Карточка', 'pk.from': 'Кімнен таңдау', 'pk.class': 'Бүкіл сынып', 'pk.groups': 'Топтар бойынша · бір-бірден', 'pk.noRepeat': 'Қайталамау',
    'pk.info': 'Жауап бергендер: {n}. Сабақта жоқтар таңдауға қатыспайды.', 'pk.answers': 'Жауап береді: ', 'pk.answersMany': 'Жауап береді: ', 'pk.plus': '+1 балл', 'pk.plusGroup': 'Топқа +1 балл', 'pk.spin': 'Айналдыру!', 'pk.again': 'Қайта айналдыру',
    'pk.groupWheel': '1 · Топтар дөңгелегі', 'pk.whoFrom': '2 · {g} тобынан кім', 'pk.fell': 'Түсті: ', 'pk.nobody': 'Таңдайтын ешкім жоқ — келгендерді белгілеңіз немесе «Қайталамау»-ды өшіріңіз.', 'pk.noGroups': 'Алдымен «Топтар» панелінде сыныпты топқа бөліңіз.', 'pk.reset': 'Жауап бергендерді тазалау', 'pk.tap': '«Айналдыру!» басыңыз' },
  en: { 'pk.wheel': 'Wheel of fortune', 'pk.drum': 'Drum', 'pk.card': 'Card', 'pk.from': 'Pick from', 'pk.class': 'Whole class', 'pk.groups': 'By groups · one each', 'pk.noRepeat': 'No repeats',
    'pk.info': 'Already answered: {n}. Absent students are left out.', 'pk.answers': 'Answering: ', 'pk.answersMany': 'Answering: ', 'pk.plus': '+1 point', 'pk.plusGroup': '+1 point to group', 'pk.spin': 'Spin!', 'pk.again': 'Spin again',
    'pk.groupWheel': '1 · Group wheel', 'pk.whoFrom': '2 · Who from group {g}', 'pk.fell': 'Landed on: ', 'pk.nobody': 'Nobody to pick — mark who is here or turn off “No repeats”.', 'pk.noGroups': 'Split the class into groups in the Groups panel first.', 'pk.reset': 'Reset answered', 'pk.tap': 'Press “Spin!”' }
});

export const MARKS = ['●', '▲', '■', '◆', '★'];
export const TINTS = ['#D6FF3B', '#FFB38A', '#8FD0FF', '#C9B8FF', '#FFD166'];
const WHEEL = ['#FF5A5F', '#FFB400', '#3A86FF', '#06D6A0', '#8338EC', '#FF006E', '#FB5607', '#118AB2'];
const DARK_TEXT = ['#FFB400', '#06D6A0', '#FFD23F'];

let mode = 'wheel', source = 'class', noRepeat = true;

/**
 * ctx: { students: [{id,name}] present only, groups: [[ids]] | null, answered: Set, addPoint(ids[], n), addGroupPoint(gi, n) }
 */
export function openPicker(host, ctx, onClose) {
  const box = document.createElement('div');
  box.className = 'pk-back';
  host.appendChild(box);
  let result = null; // { ids: [], group: gi|null }
  let busy = false;

  const pool = ids => ids.filter(id => !noRepeat || !ctx.answered.has(id));
  const name = id => (ctx.students.find(s => s.id === id) || {}).name || '';
  const short = n => n.split(' ')[0];

  function draw() {
    const groupsOk = ctx.groups && ctx.groups.length;
    box.innerHTML = `<div class="pk" role="dialog" aria-modal="true" aria-label="${esc(t('pk.' + mode))}">
      <div class="pk-top">
        <div class="seg">${['wheel', 'drum', 'card'].map(m => `<button type="button" data-mode="${m}" aria-selected="${m === mode}">${esc(t('pk.' + m))}</button>`).join('')}</div>
        <button type="button" class="pk-x" data-close aria-label="${esc(t('ui.close'))}">${icon('close', 13).__raw}</button>
      </div>
      <div class="pk-body">
        <div class="pk-side">
          <div class="small" style="font-weight:600;color:var(--ink-2)">${esc(t('pk.from'))}</div>
          <button type="button" class="pk-src${source === 'class' ? ' on' : ''}" data-src="class">${esc(t('pk.class'))}</button>
          <button type="button" class="pk-src${source === 'groups' ? ' on' : ''}" data-src="groups">${esc(t('pk.groups'))}</button>
          <label class="pk-toggle"><span>${esc(t('pk.noRepeat'))}</span><input type="checkbox" ${noRepeat ? 'checked' : ''} data-norepeat><i></i></label>
          <div class="small">${esc(t('pk.info', { n: ctx.answered.size }))}</div>
          ${ctx.answered.size ? `<button type="button" class="link-btn" data-reset style="align-self:flex-start">${esc(t('pk.reset'))}</button>` : ''}
        </div>
        <div class="pk-stage">${source === 'groups' && !groupsOk ? `<p class="pk-msg">${esc(t('pk.noGroups'))}</p>` : stage()}</div>
      </div>
      <div class="pk-foot">
        <div class="grow pk-res">${result && result.ids.length ? `<span class="small" style="font-size:15px">${esc(result.ids.length > 1 ? t('pk.answersMany') : t('pk.answers'))}</span><b>${esc(result.ids.map(i => short(name(i))).join(', '))}${result.group != null ? ' · ' + (MARKS[result.group] || '') : ''}</b>` : `<span class="small" style="font-size:15px">${esc(t('pk.tap'))}</span>`}</div>
        ${result && result.ids.length ? `<button type="button" class="btn-o btn-md" data-plus>${esc(t('pk.plus'))}</button>` : ''}
        ${result && result.group != null && mode === 'wheel' ? `<button type="button" class="btn-o btn-md" data-plusgroup>${esc(t('pk.plusGroup'))}</button>` : ''}
        <button type="button" class="btn-k btn-md pk-spin" data-spin>${esc(result ? t('pk.again') : t('pk.spin'))}</button>
      </div>
    </div>`;
    bind();
  }

  function stage() {
    if (mode === 'wheel') {
      if (source === 'groups') {
        return `<div class="pk-two"><div class="pk-col"><div class="small pk-cap">${esc(t('pk.groupWheel'))}</div>${wheelSvg(ctx.groups.map((_, i) => MARKS[i]), 'g', 260, false)}<div class="pk-fell" data-fell></div></div>
          <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden="true"><path d="M2 12h52M44 3l10 9-10 9" fill="none" stroke="#D4D4C8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="pk-col"><div class="small pk-cap" data-who>${esc(t('pk.whoFrom', { g: '…' }))}</div><div data-second>${wheelSvg(['?'], 's', 360, true)}</div></div></div>`;
      }
      const ids = pool(ctx.students.map(s => s.id));
      if (!ids.length) return `<p class="pk-msg">${esc(t('pk.nobody'))}</p>`;
      return `<div class="pk-col">${wheelSvg(ids.map(i => short(name(i))), 's', 440, true, ids)}</div>`;
    }
    if (mode === 'drum') {
      const rows = source === 'groups' && ctx.groups ? ctx.groups.map((g, i) => ({ mark: MARKS[i], tint: TINTS[i], ids: pool(g) })) : [{ mark: '★', tint: '#FFFFFF', ids: pool(ctx.students.map(s => s.id)) }];
      return `<div class="pk-drum"><div class="pk-drum-t">${esc(t('pk.drum').toUpperCase())}</div>${rows.map((r, ri) => `<div class="pk-row"><span class="pk-mark" style="color:${r.tint}">${r.mark}</span>
        <div class="pk-reel" data-reel="${ri}">${r.ids.length ? `<div class="pk-strip">${[...Array(6)].flatMap(() => r.ids).map(id => `<span data-id="${id}">${esc(name(id))}</span>`).join('')}</div>` : `<span class="pk-empty">—</span>`}</div></div>`).join('')}</div>`;
    }
    const ids = pool(ctx.students.map(s => s.id));
    return `<div class="pk-card-wrap"><div class="pk-card" data-card><div class="face back"><span>?</span></div><div class="face front"><b data-cardname></b></div></div>${ids.length ? '' : `<p class="pk-msg">${esc(t('pk.nobody'))}</p>`}</div>`;
  }

  function wheelSvg(labels, kind, size, rotate, ids = []) {
    const n = Math.max(1, labels.length), c = size / 2, r = c - 10;
    const segs = labels.map((label, i) => {
      const a0 = (-90 - 180 / n + i * 360 / n) * Math.PI / 180, a1 = (-90 + 180 / n + i * 360 / n) * Math.PI / 180, am = -90 + i * 360 / n;
      const fill = kind === 'g' ? ['#3A86FF', '#FF5A5F', '#FFB400', '#8338EC', '#06D6A0'][i % 5] : WHEEL[i % WHEEL.length];
      const tr = r * (n > 8 && kind !== 'g' ? 0.6 : 0.64), tx = c + tr * Math.cos(am * Math.PI / 180), ty = c + tr * Math.sin(am * Math.PI / 180);
      const d = n === 1 ? `M${c} ${c - r} A${r} ${r} 0 1 1 ${c - 0.01} ${c - r} Z` : `M${c} ${c} L${(c + r * Math.cos(a0)).toFixed(1)} ${(c + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(c + r * Math.cos(a1)).toFixed(1)} ${(c + r * Math.sin(a1)).toFixed(1)} Z`;
      const many = n > 8;
      const fs = kind === 'g' ? 30 : many ? Math.max(11, Math.min(17, size / n / 1.9)) : Math.max(13, Math.min(22, 260 / Math.max(6, n) + 4));
      return `<path d="${d}" fill="${fill}" stroke="#FFFFFF" stroke-width="3"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="700" font-family="Inter, sans-serif" fill="${DARK_TEXT.includes(fill) ? '#16170F' : '#FFFFFF'}" ${rotate ? `transform="rotate(${many ? am : am + 90} ${tx.toFixed(1)} ${ty.toFixed(1)})"` : ''}>${esc(String(label).slice(0, 14))}</text>`;
    }).join('');
    return `<div class="pk-wheel" style="width:min(${size}px, 100%)" data-wheel="${kind}" data-n="${n}" data-ids="${ids.join(',')}">
      <svg class="pk-pointer" width="100%" viewBox="0 0 ${size} 30" aria-hidden="true"><path d="M${c - 13} 2 L${c + 13} 2 L${c} 26 Z" fill="#16170F"/></svg>
      <svg class="pk-disc" width="100%" viewBox="0 0 ${size} ${size}">${segs}<circle cx="${c}" cy="${c}" r="${r + 2}" fill="none" stroke="#16170F" stroke-width="${kind === 'g' ? 6 : 8}"/><circle cx="${c}" cy="${c}" r="${kind === 'g' ? 22 : 38}" fill="#16170F"/></svg></div>`;
  }

  const rotations = {};
  function spinWheel(el, winner) {
    const n = Number(el.dataset.n);
    const key = el.dataset.wheel;
    const prev = rotations[key] || 0;
    const target = prev - (prev % 360) + 360 * 5 + (360 - winner * 360 / n) - (Math.random() - 0.5) * (300 / n);
    rotations[key] = target;
    const disc = el.querySelector('.pk-disc');
    disc.style.transition = 'none'; disc.style.transform = `rotate(${prev}deg)`;
    void disc.getBoundingClientRect();
    disc.style.transition = `transform ${reduced() ? 0.01 : 3.6}s cubic-bezier(.12,.72,.14,1)`;
    disc.style.transform = `rotate(${target}deg)`;
    return new Promise(r => setTimeout(r, reduced() ? 50 : 3700));
  }
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = a => a[Math.floor(Math.random() * a.length)];

  async function spin() {
    if (busy) return;
    busy = true;
    box.querySelector('[data-spin]').disabled = true;
    if (mode === 'wheel' && source === 'groups') {
      const alive = ctx.groups.map((g, i) => ({ i, ids: pool(g) })).filter(g => g.ids.length);
      if (!alive.length) { busy = false; result = null; draw(); return; }
      const g = rand(alive);
      await spinWheel(box.querySelector('[data-wheel="g"]'), g.i);
      box.querySelector('[data-fell]').innerHTML = `${esc(t('pk.fell'))}<b>${MARKS[g.i]}</b>`;
      box.querySelector('[data-who]').textContent = t('pk.whoFrom', { g: MARKS[g.i] });
      box.querySelector('[data-second]').innerHTML = wheelSvg(g.ids.map(i => short(name(i))), 's', 360, true, g.ids);
      const k = Math.floor(Math.random() * g.ids.length);
      await new Promise(r => setTimeout(r, 200));
      await spinWheel(box.querySelector('[data-wheel="s"]'), k);
      result = { ids: [g.ids[k]], group: g.i };
    } else if (mode === 'wheel') {
      const el = box.querySelector('[data-wheel="s"]');
      if (!el) { busy = false; return; }
      const ids = el.dataset.ids.split(',').filter(Boolean);
      const k = Math.floor(Math.random() * ids.length);
      await spinWheel(el, k);
      result = { ids: [ids[k]], group: null };
    } else if (mode === 'drum') {
      const picked = [];
      await Promise.all([...box.querySelectorAll('[data-reel]')].map(async (reel, ri) => {
        const strip = reel.querySelector('.pk-strip');
        if (!strip) return;
        const items = [...strip.children];
        const per = items.length / 6;
        const k = Math.floor(per * 4 + Math.random() * per);
        const h = items[0].offsetHeight;
        strip.style.transition = 'none'; strip.style.transform = 'translateY(0)';
        void strip.offsetHeight;
        strip.style.transition = `transform ${reduced() ? 0.01 : 2.4 + ri * 0.35}s cubic-bezier(.15,.8,.2,1)`;
        strip.style.transform = `translateY(${-(k * h) + reel.clientHeight / 2 - h / 2}px)`;
        await new Promise(r => setTimeout(r, reduced() ? 60 : (2.4 + ri * 0.35) * 1000 + 80));
        items.forEach(x => x.classList.remove('on')); items[k].classList.add('on');
        picked[ri] = items[k].dataset.id;
      }));
      result = { ids: picked.filter(Boolean), group: null };
    } else {
      const ids = pool(ctx.students.map(s => s.id));
      if (ids.length) {
        const card = box.querySelector('[data-card]');
        card.classList.remove('flip'); void card.offsetWidth;
        const id = rand(ids);
        setTimeout(() => { box.querySelector('[data-cardname]').textContent = name(id); card.classList.add('flip'); }, 150);
        await new Promise(r => setTimeout(r, reduced() ? 200 : 900));
        result = { ids: [id], group: null };
      }
    }
    if (result) result.ids.forEach(id => ctx.answered.add(id));
    busy = false;
    const keep = box.querySelector('.pk-stage').innerHTML;
    draw();
    box.querySelector('.pk-stage').innerHTML = keep; // leave the wheel where it stopped
    box.querySelectorAll('.pk-disc').forEach(d => { const w = d.closest('[data-wheel]').dataset.wheel; d.style.transform = `rotate(${rotations[w] || 0}deg)`; });
  }

  function bind() {
    box.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; result = null; draw(); });
    box.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { source = b.dataset.src; result = null; draw(); });
    box.querySelector('[data-norepeat]').onchange = e => { noRepeat = e.target.checked; result = null; draw(); };
    const reset = box.querySelector('[data-reset]'); if (reset) reset.onclick = () => { ctx.answered.clear(); result = null; draw(); };
    box.querySelector('[data-close]').onclick = close;
    box.querySelector('[data-spin]').onclick = spin;
    const plus = box.querySelector('[data-plus]'); if (plus) plus.onclick = () => { ctx.addPoint(result.ids, 1); plus.disabled = true; };
    const pg = box.querySelector('[data-plusgroup]'); if (pg) pg.onclick = () => { ctx.addGroupPoint(result.group, 1); pg.disabled = true; };
  }
  function close() { box.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); }
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  draw();
  return close;
}
