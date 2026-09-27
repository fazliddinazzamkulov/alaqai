/* Screens 16–17 · Choosing who answers, with animation and sound:
 *   wheel of fortune, slot-machine drum or a card —
 *   from the whole class, "which group starts" (groups themselves), or
 *   "one from each group" (a drum per group, stopping one after another). */
import { add, t } from '../i18n.js';
import { esc, icon } from '../ui.js';
import { sfx, spinTicks } from '../sound.js';

add({
  ru: { 'pk.wheel': 'Колесо', 'pk.drum': 'Барабан', 'pk.card': 'Карточка', 'pk.from': 'Кого выбираем', 'pk.class': 'Ученика из класса', 'pk.group': 'Какая группа начнёт', 'pk.each': 'По одному из каждой группы', 'pk.noRepeat': 'Не повторять',
    'pk.info': 'Уже отвечали: {n}. Кого нет на уроке — в выборе не участвует.', 'pk.answers': 'Отвечает: ', 'pk.answersMany': 'Отвечают: ', 'pk.starts': 'Начинает: ', 'pk.plus': '+1 балл', 'pk.plusGroup': '+1 балл группе', 'pk.spin': 'Крутить!', 'pk.again': 'Ещё раз',
    'pk.nobody': 'Некого выбирать — отметьте пришедших или снимите «Не повторять».', 'pk.noGroups': 'Сначала разделите класс на группы в журнале.', 'pk.reset': 'Сбросить отвечавших', 'pk.tap': 'Нажмите «Крутить!»', 'pk.groupN': 'Группа {n}', 'pk.makeGroups': 'Разделить на группы' },
  kk: { 'pk.wheel': 'Дөңгелек', 'pk.drum': 'Барабан', 'pk.card': 'Карточка', 'pk.from': 'Кімді таңдаймыз', 'pk.class': 'Сыныптан оқушы', 'pk.group': 'Қай топ бастайды', 'pk.each': 'Әр топтан бір-бірден', 'pk.noRepeat': 'Қайталамау',
    'pk.info': 'Жауап бергендер: {n}. Сабақта жоқтар таңдауға қатыспайды.', 'pk.answers': 'Жауап береді: ', 'pk.answersMany': 'Жауап береді: ', 'pk.starts': 'Бастайды: ', 'pk.plus': '+1 балл', 'pk.plusGroup': 'Топқа +1 балл', 'pk.spin': 'Айналдыру!', 'pk.again': 'Тағы',
    'pk.nobody': 'Таңдайтын ешкім жоқ — келгендерді белгілеңіз немесе «Қайталамау»-ды өшіріңіз.', 'pk.noGroups': 'Алдымен журналда сыныпты топқа бөліңіз.', 'pk.reset': 'Жауап бергендерді тазалау', 'pk.tap': '«Айналдыру!» басыңыз', 'pk.groupN': '{n}-топ', 'pk.makeGroups': 'Топқа бөлу' },
  en: { 'pk.wheel': 'Wheel', 'pk.drum': 'Drum', 'pk.card': 'Card', 'pk.from': 'Who are we picking', 'pk.class': 'A student from the class', 'pk.group': 'Which group starts', 'pk.each': 'One from each group', 'pk.noRepeat': 'No repeats',
    'pk.info': 'Already answered: {n}. Absent students are left out.', 'pk.answers': 'Answering: ', 'pk.answersMany': 'Answering: ', 'pk.starts': 'Starts: ', 'pk.plus': '+1 point', 'pk.plusGroup': '+1 point to group', 'pk.spin': 'Spin!', 'pk.again': 'Again',
    'pk.nobody': 'Nobody to pick — mark who is here or turn off “No repeats”.', 'pk.noGroups': 'Split the class into groups in the register first.', 'pk.reset': 'Reset answered', 'pk.tap': 'Press “Spin!”', 'pk.groupN': 'Group {n}', 'pk.makeGroups': 'Make groups' }
});

export const MARKS = ['●', '▲', '■', '◆', '★'];
export const TINTS = ['#D6FF3B', '#FFB38A', '#8FD0FF', '#C9B8FF', '#FFD166'];
const WHEEL = ['#FF5A5F', '#FFB400', '#3A86FF', '#06D6A0', '#8338EC', '#FF006E', '#FB5607', '#118AB2'];
const GROUP_COLORS = ['#3A86FF', '#FF5A5F', '#FFB400', '#8338EC', '#06D6A0'];
const DARK_TEXT = ['#FFB400', '#06D6A0', '#FFD23F'];

let mode = 'wheel', source = 'class', noRepeat = true;

/**
 * ctx: { students: [{id,name}] present only, groups: [[ids]] | null, answered: Set,
 *        addPoint(ids[], n), addGroupPoint(gi, n), openGroups() }
 */
export function openPicker(host, ctx, onClose) {
  const box = document.createElement('div');
  box.className = 'pk-back';
  host.appendChild(box);
  let result = null; // { ids: [], group: gi|null, groups: [gi] }
  let busy = false;
  const rotations = {};

  const pool = ids => ids.filter(id => !noRepeat || !ctx.answered.has(id));
  const name = id => (ctx.students.find(s => s.id === id) || {}).name || '';
  const short = n => n.split(' ')[0];
  const groupsOk = () => ctx.groups && ctx.groups.length > 1;
  const groupLabel = i => `${MARKS[i]} ${t('pk.groupN', { n: i + 1 })}`;

  function draw() {
    const needGroups = source !== 'class' && !groupsOk();
    box.innerHTML = `<div class="pk" role="dialog" aria-modal="true" aria-label="${esc(t('pk.' + mode))}">
      <div class="pk-top">
        <div class="seg">${['wheel', 'drum', 'card'].map(m => `<button type="button" data-mode="${m}" aria-selected="${m === mode}" ${source === 'each' && m !== 'drum' ? 'disabled' : ''}>${esc(t('pk.' + m))}</button>`).join('')}</div>
        <button type="button" class="pk-x" data-close aria-label="${esc(t('ui.close'))}">${icon('close', 13).__raw}</button>
      </div>
      <div class="pk-body">
        <div class="pk-side">
          <div class="small" style="font-weight:600;color:var(--ink-2)">${esc(t('pk.from'))}</div>
          ${['class', 'group', 'each'].map(s => `<button type="button" class="pk-src${source === s ? ' on' : ''}" data-src="${s}">${esc(t('pk.' + s))}</button>`).join('')}
          <label class="pk-toggle"><span>${esc(t('pk.noRepeat'))}</span><input type="checkbox" ${noRepeat ? 'checked' : ''} data-norepeat><i></i></label>
          <div class="small">${esc(t('pk.info', { n: ctx.answered.size }))}</div>
          ${ctx.answered.size ? `<button type="button" class="link-btn" data-reset style="align-self:flex-start">${esc(t('pk.reset'))}</button>` : ''}
        </div>
        <div class="pk-stage">${needGroups ? `<div class="pk-msg"><p>${esc(t('pk.noGroups'))}</p>${ctx.openGroups ? `<button type="button" class="btn-k btn-md" data-mkgroups>${esc(t('pk.makeGroups'))}</button>` : ''}</div>` : stage()}</div>
      </div>
      <div class="pk-foot">
        <div class="grow pk-res">${resultText()}</div>
        ${result && result.ids.length ? `<button type="button" class="btn-o btn-md" data-plus>${esc(t('pk.plus'))}</button>` : ''}
        ${result && result.group != null ? `<button type="button" class="btn-o btn-md" data-plusgroup>${esc(t('pk.plusGroup'))}</button>` : ''}
        <button type="button" class="btn-k btn-md pk-spin" data-spin ${needGroups ? 'disabled' : ''}>${esc(result ? t('pk.again') : t('pk.spin'))}</button>
      </div>
    </div>`;
    bind();
  }

  function resultText() {
    if (!result) return `<span class="small" style="font-size:15px">${esc(t('pk.tap'))}</span>`;
    if (result.group != null && !result.ids.length) return `<span class="small" style="font-size:15px">${esc(t('pk.starts'))}</span><b>${esc(groupLabel(result.group))}</b>`;
    if (!result.ids.length) return `<span class="small" style="font-size:15px">${esc(t('pk.nobody'))}</span>`;
    return `<span class="small" style="font-size:15px">${esc(result.ids.length > 1 ? t('pk.answersMany') : t('pk.answers'))}</span><b>${esc(result.ids.map(i => short(name(i))).join(', '))}</b>`;
  }

  function stage() {
    if (source === 'each') return drumHtml(ctx.groups.map((g, i) => ({ mark: MARKS[i], tint: TINTS[i], items: pool(g).map(id => ({ id, label: name(id) })) })));
    if (source === 'group') {
      const items = ctx.groups.map((g, i) => ({ id: String(i), label: groupLabel(i) }));
      if (mode === 'wheel') return `<div class="pk-col">${wheelSvg(ctx.groups.map((_, i) => MARKS[i]), 'g', 400, false, items.map(x => x.id))}</div>`;
      if (mode === 'drum') return drumHtml([{ mark: '★', tint: '#FFFFFF', items }]);
      return cardHtml();
    }
    const ids = pool(ctx.students.map(s => s.id));
    if (!ids.length) return `<p class="pk-msg">${esc(t('pk.nobody'))}</p>`;
    if (mode === 'wheel') return `<div class="pk-col">${wheelSvg(ids.map(i => short(name(i))), 's', 440, true, ids)}</div>`;
    if (mode === 'drum') return drumHtml([{ mark: '★', tint: '#FFFFFF', items: ids.map(id => ({ id, label: name(id) })) }]);
    return cardHtml();
  }

  const cardHtml = () => `<div class="pk-card-wrap"><div class="pk-card" data-card><div class="face back"><span>?</span></div><div class="face front"><b data-cardname></b></div></div></div>`;

  function drumHtml(rows) {
    return `<div class="pk-drum"><div class="pk-drum-t">${esc(t('pk.drum').toUpperCase())}</div>${rows.map((r, ri) => `<div class="pk-row"><span class="pk-mark" style="color:${r.tint}">${r.mark}</span>
      <div class="pk-reel" data-reel="${ri}">${r.items.length ? `<div class="pk-strip">${[...Array(8)].flatMap(() => r.items).map(x => `<span data-id="${esc(x.id)}">${esc(x.label)}</span>`).join('')}</div>` : `<span class="pk-empty">—</span>`}</div></div>`).join('')}</div>`;
  }

  function wheelSvg(labels, kind, size, rotate, ids = []) {
    const n = Math.max(1, labels.length), c = size / 2, r = c - 10;
    const segs = labels.map((label, i) => {
      const a0 = (-90 - 180 / n + i * 360 / n) * Math.PI / 180, a1 = (-90 + 180 / n + i * 360 / n) * Math.PI / 180, am = -90 + i * 360 / n;
      const fill = kind === 'g' ? GROUP_COLORS[i % 5] : WHEEL[i % WHEEL.length];
      const tr = r * (n > 8 && kind !== 'g' ? 0.6 : 0.64), tx = c + tr * Math.cos(am * Math.PI / 180), ty = c + tr * Math.sin(am * Math.PI / 180);
      const d = n === 1 ? `M${c} ${c - r} A${r} ${r} 0 1 1 ${c - 0.01} ${c - r} Z` : `M${c} ${c} L${(c + r * Math.cos(a0)).toFixed(1)} ${(c + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(c + r * Math.cos(a1)).toFixed(1)} ${(c + r * Math.sin(a1)).toFixed(1)} Z`;
      const many = n > 8;
      const fs = kind === 'g' ? 40 : many ? Math.max(11, Math.min(17, size / n / 1.9)) : Math.max(13, Math.min(22, 260 / Math.max(6, n) + 4));
      return `<path d="${d}" fill="${fill}" stroke="#FFFFFF" stroke-width="3"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="700" font-family="Inter, sans-serif" fill="${DARK_TEXT.includes(fill) ? '#16170F' : '#FFFFFF'}" ${rotate ? `transform="rotate(${many ? am : am + 90} ${tx.toFixed(1)} ${ty.toFixed(1)})"` : ''}>${esc(String(label).slice(0, 14))}</text>`;
    }).join('');
    return `<div class="pk-wheel" style="width:min(${size}px, 100%)" data-wheel="${kind}" data-n="${n}" data-ids="${ids.join(',')}">
      <svg class="pk-pointer" width="100%" viewBox="0 0 ${size} 30" aria-hidden="true"><path d="M${c - 13} 2 L${c + 13} 2 L${c} 26 Z" fill="#16170F"/></svg>
      <svg class="pk-disc" width="100%" viewBox="0 0 ${size} ${size}" style="transform:rotate(${rotations[kind] || 0}deg)">${segs}<circle cx="${c}" cy="${c}" r="${r + 2}" fill="none" stroke="#16170F" stroke-width="${kind === 'g' ? 6 : 8}"/><circle cx="${c}" cy="${c}" r="${kind === 'g' ? 26 : 38}" fill="#16170F"/></svg></div>`;
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // The spin always animates (a teacher asked for it even where the system has animations turned off).
  async function spinWheel(el, winner) {
    const n = Number(el.dataset.n), key = el.dataset.wheel, dur = 4200;
    const prev = rotations[key] || 0;
    const target = prev - (prev % 360) + 360 * 6 + (360 - winner * 360 / n) - (Math.random() - 0.5) * (280 / n);
    rotations[key] = target;
    const disc = el.querySelector('.pk-disc');
    disc.style.transition = 'none'; disc.style.transform = `rotate(${prev}deg)`;
    void disc.getBoundingClientRect();
    disc.style.transition = `transform ${dur}ms cubic-bezier(.12,.72,.14,1)`;
    disc.style.transform = `rotate(${target}deg)`;
    const stop = spinTicks(dur - 150);
    await wait(dur + 80);
    stop();
  }

  async function spinReel(reel, ri, delay) {
    const strip = reel.querySelector('.pk-strip');
    if (!strip) return null;
    const items = [...strip.children];
    const per = items.length / 8;
    const k = Math.floor(per * 5 + Math.random() * per);
    const h = items[0].offsetHeight;
    const dur = 2600 + delay;
    items.forEach(x => x.classList.remove('on'));
    strip.style.transition = 'none'; strip.style.transform = 'translateY(0)';
    void strip.offsetHeight;
    strip.style.transition = `transform ${dur}ms cubic-bezier(.15,.8,.2,1)`;
    strip.style.transform = `translateY(${-(k * h) + reel.clientHeight / 2 - h / 2}px)`;
    const stop = spinTicks(dur - 120, 'drum');
    await wait(dur + 60);
    stop();
    items[k].classList.add('on');
    sfx.reveal();
    return items[k].dataset.id;
  }

  async function spin() {
    if (busy) return;
    busy = true;
    box.querySelector('[data-spin]').disabled = true;
    box.querySelectorAll('[data-mode], [data-src]').forEach(b => { b.disabled = true; });
    const rand = a => a[Math.floor(Math.random() * a.length)];
    result = null;
    if (source === 'each' || mode === 'drum') {
      const reels = [...box.querySelectorAll('[data-reel]')];
      const picked = [];
      await Promise.all(reels.map(async (reel, ri) => { picked[ri] = await spinReel(reel, ri, ri * 700); }));
      if (source === 'group') result = { ids: [], group: picked[0] != null ? Number(picked[0]) : null };
      else result = { ids: picked.filter(Boolean), group: null };
    } else if (mode === 'wheel') {
      const el = box.querySelector('[data-wheel]');
      if (el) {
        const ids = el.dataset.ids.split(',').filter(Boolean);
        const k = Math.floor(Math.random() * ids.length);
        await spinWheel(el, k);
        sfx.reveal();
        result = source === 'group' ? { ids: [], group: Number(ids[k]) } : { ids: [ids[k]], group: null };
      }
    } else {
      const card = box.querySelector('[data-card]');
      const choice = source === 'group' ? String(Math.floor(Math.random() * ctx.groups.length)) : rand(pool(ctx.students.map(s => s.id)));
      if (card && choice != null) {
        card.classList.remove('flip'); card.classList.add('shuffle'); void card.offsetWidth;
        const stop = spinTicks(1100);
        await wait(1150); stop();
        card.classList.remove('shuffle');
        box.querySelector('[data-cardname]').textContent = source === 'group' ? groupLabel(Number(choice)) : name(choice);
        card.classList.add('flip'); sfx.flip();
        await wait(650); sfx.reveal();
        result = source === 'group' ? { ids: [], group: Number(choice) } : { ids: [choice], group: null };
      }
    }
    if (result) result.ids.forEach(id => ctx.answered.add(id));
    busy = false;
    const keep = box.querySelector('.pk-stage').innerHTML;
    draw();
    box.querySelector('.pk-stage').innerHTML = keep; // leave the wheel / drum / card where it stopped
    box.querySelectorAll('.pk-disc').forEach(d => { const w = d.closest('[data-wheel]').dataset.wheel; d.style.transform = `rotate(${rotations[w] || 0}deg)`; });
  }

  function bind() {
    box.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { sfx.click(); mode = b.dataset.mode; result = null; draw(); });
    box.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { sfx.click(); source = b.dataset.src; if (source === 'each') mode = 'drum'; result = null; draw(); });
    box.querySelector('[data-norepeat]').onchange = e => { noRepeat = e.target.checked; result = null; draw(); };
    const reset = box.querySelector('[data-reset]'); if (reset) reset.onclick = () => { ctx.answered.clear(); result = null; draw(); };
    const mk = box.querySelector('[data-mkgroups]'); if (mk) mk.onclick = () => { close(); ctx.openGroups(); };
    box.querySelector('[data-close]').onclick = close;
    box.querySelector('[data-spin]').onclick = spin;
    const plus = box.querySelector('[data-plus]'); if (plus) plus.onclick = () => { ctx.addPoint(result.ids, 1); plus.disabled = true; sfx.right(); };
    const pg = box.querySelector('[data-plusgroup]'); if (pg) pg.onclick = () => { ctx.addGroupPoint(result.group, 1); pg.disabled = true; sfx.right(); };
  }
  function close() { box.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); }
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  draw();
  return close;
}
