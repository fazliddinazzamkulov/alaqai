/* The observer page opened from a view-only link: the lesson plan and small
 * slide previews, with the viewer's name as a watermark. No selecting, copying,
 * downloading or printing. A browser cannot fully stop screenshots — the
 * watermark makes any copy traceable. */
import { add, t, lang } from '../i18n.js';
import { esc } from '../ui.js';
import { db } from '../data/store.js';
import { today } from '../school.js';
import { kspHtml, docLangOf } from '../ksp/doc.js';
import { kspContext } from './ksp.js';
import { slideBox } from '../deck.js';

add({
  ru: { 'vw.who': 'Представьтесь, пожалуйста', 'vw.whoNote': 'Имя будет видно на странице как водяной знак — так учитель знает, кто смотрел план.', 'vw.name': 'Имя и должность', 'vw.open': 'Открыть план', 'vw.only': 'Только просмотр', 'vw.expired': 'Срок действия ссылки истёк', 'vw.expiredNote': 'Попросите учителя прислать новую ссылку.', 'vw.slides': 'Слайды урока' },
  kk: { 'vw.who': 'Өзіңізді таныстырыңыз', 'vw.whoNote': 'Атыңыз бетте су белгісі ретінде көрінеді — мұғалім жоспарды кім көргенін біледі.', 'vw.name': 'Аты-жөні және лауазымы', 'vw.open': 'Жоспарды ашу', 'vw.only': 'Тек қарау', 'vw.expired': 'Сілтеменің мерзімі өтті', 'vw.expiredNote': 'Мұғалімнен жаңа сілтеме сұраңыз.', 'vw.slides': 'Сабақ слайдтары' },
  en: { 'vw.who': 'Please introduce yourself', 'vw.whoNote': 'Your name appears on the page as a watermark, so the teacher knows who viewed the plan.', 'vw.name': 'Name and position', 'vw.open': 'Open the plan', 'vw.only': 'View only', 'vw.expired': 'This link has expired', 'vw.expiredNote': 'Ask the teacher for a new link.', 'vw.slides': 'Lesson slides' }
});

export async function render(main, { args }) {
  const share = await db.shares.get(args[0]);
  const shell = inner => { main.innerHTML = `<div class="vw"><header class="vw-head"><span class="logo">alaqai<span class="logo-dot"></span></span><span class="pill">${esc(t('vw.only'))}</span></header>${inner}</div>`; };
  if (!share || !share.active || share.expiresAt < today()) {
    shell(`<div class="empty" style="margin:40px auto;max-width:520px"><h2>${esc(t('vw.expired'))}</h2><p>${esc(t('vw.expiredNote'))}</p></div>`);
    return;
  }
  let name = sessionStorage.getItem('alaqai_viewer_' + share.id);
  if (!name) {
    shell(`<form class="vw-who card"><h2 class="title title-sm">${esc(t('vw.who'))}</h2><p class="muted-note">${esc(t('vw.whoNote'))}</p>
      <label class="field">${esc(t('vw.name'))}<input name="n" required maxlength="60" autocomplete="name"></label><button class="btn-k btn-md">${esc(t('vw.open'))}</button></form>`);
    main.querySelector('form').onsubmit = async e => {
      e.preventDefault();
      name = e.target.n.value.trim();
      if (!name) return;
      try { sessionStorage.setItem('alaqai_viewer_' + share.id, name); } catch (err) { /* private mode */ }
      await db.shares.update(share.id, { views: [...(share.views || []), { name, at: new Date().toISOString() }] });
      render(main, { args });
    };
    return;
  }
  const ksp = await db.ksp.get(share.refId);
  const ctx = await kspContext(ksp, docLangOf(ksp.lang, lang()));
  const deck = ctx.lesson && ctx.lesson.parts && ctx.lesson.parts.presentationId ? await db.presentations.get(ctx.lesson.parts.presentationId) : null;
  const stamp = `${name} · ${new Date().toLocaleDateString('ru-RU')}`;
  const wm = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='220'><text x='20' y='130' transform='rotate(-24 180 110)' font-family='Inter,Arial' font-size='18' fill='rgba(22,23,15,0.13)'>${stamp.replace(/[<&>]/g, '')}</text></svg>`)}")`;
  shell(`<div class="vw-body no-copy"><div class="ks-paper">${kspHtml(ksp, ctx)}</div>
    ${deck ? `<div class="vw-slides"><div class="sec-label">${esc(t('vw.slides'))}</div><div class="vw-grid">${deck.slides.map((s, i) => slideBox(s, deck, i, 'thumb')).join('')}</div></div>` : ''}
    <div class="vw-mark"></div></div>`);
  main.querySelector('.vw-mark').style.backgroundImage = wm;
  const body = main.querySelector('.vw-body');
  ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach(ev => body.addEventListener(ev, e => e.preventDefault()));
  const onKey = e => { if ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'a'].includes(e.key.toLowerCase())) e.preventDefault(); };
  document.addEventListener('keydown', onKey);
  document.body.classList.add('no-print');
  return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('no-print'); };
}
