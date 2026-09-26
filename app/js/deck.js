/* Presentations: generation, pictures, the AI agent, reading textbook files. */
import { db } from './data/store.js';
import { generateJSON, searchImage, generateImage } from './ai.js';
import { slidesPrompt } from './gen/prompts.js';
import { renderSlide, plain } from './slides.js';

export function slideBox(slide, deck, index, mode = 'view', extra = '') {
  return `<div class="slide-box${deck.ratio === '4:3' ? ' r43' : ''}" ${extra}>${renderSlide(slide, { deck, index, mode })}</div>`;
}

const SHOWS_MEDIA = ['title', 'content', 'stat', 'full-image'];

/** Find stock photos (and, if asked, AI pictures) for slides that have none yet. */
export async function fillImages(deckId, onProgress) {
  let deck = await db.presentations.get(deckId);
  if (!deck || deck.options?.photos === false && !deck.options?.aiImages) return deck;
  let aiLeft = deck.options?.aiImages ? 2 : 0;
  for (let i = 0; i < deck.slides.length; i++) {
    const s = deck.slides[i];
    if (s.imageUrl || s.imageTried || !SHOWS_MEDIA.includes(s.layout)) continue;
    let url = null;
    if (aiLeft > 0 && (s.layout === 'full-image' || s.layout === 'title')) {
      aiLeft--;
      try { url = await generateImage(`Educational illustration for a school lesson slide: ${s.image_query || plain(s.title)}. Clean, bright, no text.`); } catch (e) { url = null; }
    }
    if (!url && deck.options?.photos !== false && s.image_query) url = await searchImage(s.image_query);
    deck = await db.presentations.get(deckId);
    if (!deck) return null;
    deck.slides[i] = { ...deck.slides[i], imageTried: true, ...(url ? { imageUrl: url } : {}) };
    deck = await db.presentations.update(deckId, { slides: deck.slides });
    if (url && onProgress) onProgress(deck, i);
  }
  return deck;
}

/**
 * opts: { topic, lang, langText?, ratio, count, theme, options: { photos, icons, aiImages, questions }, files, lessonId?, classId? }
 */
export async function generateDeck(opts) {
  const res = await generateJSON(slidesPrompt({ ...opts, ...(opts.options || {}), subject: opts.subject || '', hasFiles: !!(opts.files && opts.files.length) }), { files: opts.files || [] });
  const slides = (Array.isArray(res.slides) ? res.slides : Array.isArray(res) ? res : []).filter(s => s && s.layout);
  if (!slides.length) throw new Error('empty');
  return db.presentations.create({
    lessonId: opts.lessonId || null, classId: opts.classId || null, title: String(res.title || opts.topic).slice(0, 120),
    lang: opts.lang, ratio: opts.ratio, theme: opts.theme || 'lime', options: opts.options || {}, slides
  });
}

/* ---------- the agent (screen 7, right panel) ---------- */

const LANG_NAMES = { kk: 'казахский', ru: 'русский', en: 'английский', 'uz-latn': 'узбекский (латиница)', 'uz-cyrl': 'узбекский (кириллица)' };

/** Returns { reply, summary[], slides } — the whole new slide list, applied only when the teacher keeps it. */
export async function agentEdit(deck, index, request) {
  const compact = deck.slides.map((s, i) => ({ i: i + 1, ...Object.fromEntries(Object.entries(s).filter(([k]) => !['imageUrl', 'imageTried'].includes(k))) }));
  const prompt = `[part:agent]
Ты — помощник учителя в редакторе презентаций alaqai. Язык слайдов: ${LANG_NAMES[deck.lang] || deck.lang || 'русский'}.
Сейчас открыт слайд ${index + 1}. Просьба учителя: "${request}".
Слайды (JSON, поле "i" — номер слайда):
${JSON.stringify(compact)}
Выполни просьбу. Меняй только то, что нужно; остальные слайды верни без изменений. Можно добавлять и удалять слайды.
Используй те же поля и layout (title | content | full-image | stat | bigidea | compare | process | quiz | truefalse | fillblank | match | problem).
Ответ — ТОЛЬКО JSON:
{ "reply": "одна короткая фраза для учителя на языке интерфейса учителя (${document.documentElement.lang === 'kk' ? 'казахский' : document.documentElement.lang === 'en' ? 'английский' : 'русский'})",
  "summary": ["2-3 коротких пункта, что изменено"],
  "slides": [ ...полный новый список слайдов без поля "i"... ] }`;
  const res = await generateJSON(prompt, { temperature: 0.5 });
  const slides = Array.isArray(res.slides) ? res.slides.filter(s => s && s.layout).map(({ i, ...s }) => s) : null;
  if (!slides || !slides.length) throw new Error('empty');
  // Keep pictures of slides that were not touched.
  slides.forEach((s, k) => {
    const old = deck.slides.find(o => plain(o.title) && plain(o.title) === plain(s.title) && o.layout === s.layout) || (deck.slides[k] && deck.slides[k].layout === s.layout ? deck.slides[k] : null);
    if (old && old.imageUrl && !s.image_query_changed) s.imageUrl = old.imageUrl;
  });
  return { reply: String(res.reply || ''), summary: Array.isArray(res.summary) ? res.summary.map(String) : [], slides };
}

/* ---------- textbook files: PDF/images go to Gemini as they are, DOCX/PPTX as text ---------- */

let zipLoading = null;
function loadJSZip() {
  if (!zipLoading) zipLoading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    s.onload = () => res(window.JSZip); s.onerror = rej;
    document.head.appendChild(s);
  });
  return zipLoading;
}

/** Text of a .docx or .pptx file (for the prompt). */
export async function officeText(file) {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter(n => /^word\/document\.xml$|^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0));
  const parts = [];
  for (const n of names) {
    const xml = await zip.file(n).async('string');
    parts.push(xml.replace(/<\/w:p>|<\/a:p>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\n{3,}/g, '\n\n').trim());
  }
  return parts.join('\n\n').slice(0, 30000);
}
