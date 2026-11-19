/* Create lesson (mockup 2): topic, class, subject, language, material, slide
 * templates, slide count, pictures → presentation + level tasks + KSP. */
import { add, t, lang } from '../i18n.js';
import { html, icon } from '../ui.js';
import { db } from '../data/store.js';
import { fileToPart } from '../ai.js';
import { templatesFor } from '../deck/schema.js';
import '../deck/labels.js';
import { createLesson, createBlank } from '../gen/lesson2.js';

add({
  kk: { 'n.title': 'Сабақ құру', 'n.back': '← Басты бет', 'n.topic': 'Сабақ тақырыбы', 'n.class': 'Сынып', 'n.noClass': 'Сыныпсыз', 'n.subject': 'Пән', 'n.lang': 'Сабақ тілі', 'n.files': 'Материал (міндетті емес)', 'n.filesHint': 'Оқулық беттерінің фотосы немесе PDF — ЖИ мәтінді осыдан алады', 'n.slides': 'Сабаққа арналған слайдтар', 'n.slidesHint': 'Пәнге қарай таңдалды — өзгертуге болады', 'n.count': 'Слайд саны', 'n.img': 'Суреттер', 'n.photo': 'Фото Pexels / Pixabay', 'n.ai': 'ЖИ — Nano Banana', 'n.none': 'Суретсіз', 'n.result': 'Нәтижесі', 'n.pres': 'Презентация', 'n.presSub': '{n} слайд: түсіндіру + тапсырмалар', 'n.tasks': 'Деңгейлік тапсырмалар', 'n.tasksSub': 'A, B, C · үш әдіс · жалпы тапсырма', 'n.ksp': 'ҚМЖ', 'n.kspSub': 'Бүкіл сабаққа, Word форматында', 'n.create': 'Сабақ құру', 'n.minute': 'Шамамен бір минут', 'n.run': 'Жасалуда…', 'n.done': 'Дайын', 'n.err': 'Қате', 'n.retry': 'Қайталау', 'n.noai': 'ЖИ-сыз құру', 'n.needTopic': 'Тақырыпты жазыңыз' },
  ru: { 'n.title': 'Создать урок', 'n.back': '← Главная', 'n.topic': 'Тема урока', 'n.class': 'Класс', 'n.noClass': 'Без класса', 'n.subject': 'Предмет', 'n.lang': 'Язык урока', 'n.files': 'Материал (необязательно)', 'n.filesHint': 'Фото страниц учебника или PDF — ИИ возьмёт текст отсюда', 'n.slides': 'Слайды для урока', 'n.slidesHint': 'Подобраны по предмету — можно поменять', 'n.count': 'Количество слайдов', 'n.img': 'Картинки', 'n.photo': 'Фото Pexels / Pixabay', 'n.ai': 'ИИ — Nano Banana', 'n.none': 'Без картинок', 'n.result': 'Получится', 'n.pres': 'Презентация', 'n.presSub': '{n} слайдов: теория + задания', 'n.tasks': 'Задания по уровням', 'n.tasksSub': 'A, B, C · три методики · общее задание', 'n.ksp': 'КСП', 'n.kspSub': 'На весь урок, в Word', 'n.create': 'Создать урок', 'n.minute': 'Около минуты', 'n.run': 'Создаётся…', 'n.done': 'Готово', 'n.err': 'Ошибка', 'n.retry': 'Повторить', 'n.noai': 'Создать без ИИ', 'n.needTopic': 'Напишите тему' },
  en: { 'n.title': 'Create lesson', 'n.back': '← Home', 'n.topic': 'Lesson topic', 'n.class': 'Class', 'n.noClass': 'No class', 'n.subject': 'Subject', 'n.lang': 'Lesson language', 'n.files': 'Material (optional)', 'n.filesHint': 'Photos of textbook pages or a PDF — the AI takes the text from here', 'n.slides': 'Slides for the lesson', 'n.slidesHint': 'Picked for the subject — change if you like', 'n.count': 'Number of slides', 'n.img': 'Pictures', 'n.photo': 'Photos Pexels / Pixabay', 'n.ai': 'AI — Nano Banana', 'n.none': 'No pictures', 'n.result': 'You get', 'n.pres': 'Presentation', 'n.presSub': '{n} slides: theory + tasks', 'n.tasks': 'Level tasks', 'n.tasksSub': 'A, B, C · three methods · one common task', 'n.ksp': 'Lesson plan', 'n.kspSub': 'Whole lesson, Word file', 'n.create': 'Create lesson', 'n.minute': 'About a minute', 'n.run': 'Creating…', 'n.done': 'Done', 'n.err': 'Error', 'n.retry': 'Try again', 'n.noai': 'Create without AI', 'n.needTopic': 'Type a topic' }
});

const DEFAULTS = [
  [/информ|ақпарат|informat|computer/i, ['notes', 'code', 'flowchart', 'predict', 'codefill', 'parsons', 'summary', 'reflection']],
  [/физ|phys/i, ['notes', 'formula', 'figure', 'example', 'input', 'quiz', 'summary']],
  [/хим|chem/i, ['notes', 'formula', 'reaction', 'balance', 'quiz', 'summary']],
  [/математ|алгеб|геом|math|^мат/i, ['notes', 'rule', 'example', 'input', 'error', 'summary']],
  [/.*/, ['notes', 'figure', 'example', 'match', 'quiz', 'summary']]
];
const defaultsFor = s => DEFAULTS.find(([re]) => re.test(String(s || '')))[1];
const LANGS = [['kk', 'Қазақша'], ['ru', 'Русский'], ['en', 'English'], ['uz-latn', 'Oʻzbekcha']];

export async function render(main, { query }) {
  const classes = await db.classes.list();
  const st = {
    topic: query.topic || '', classId: query.classId || (classes[0] && classes[0].id) || '',
    lang: ({ kk: 'kk', ru: 'ru', en: 'en' })[lang()] || 'kk', count: 10, images: 'photo', files: [], busy: false, parts: {}
  };
  const cls = () => classes.find(c => c.id === st.classId);
  st.subject = query.subject || (cls() && cls().subject) || '';
  st.types = new Set(defaultsFor(st.subject));

  const draw = () => {
    const types = templatesFor(st.subject).filter(k => k !== 'title');
    main.innerHTML = html`<div class="wrap">
      <div><a href="#/home" style="font-weight:600;text-decoration:none;color:var(--muted)">${t('n.back')}</a><h1 style="margin-top:10px">${t('n.title')}</h1></div>
      <div class="row" style="align-items:flex-start;gap:24px">
        <form data-form style="flex:999 1 520px;min-width:0;display:flex;flex-direction:column;gap:20px">
          <section class="card" style="display:flex;flex-direction:column;gap:18px">
            <label class="field"><span>${t('n.topic')}</span><input name="topic" value="${st.topic}" required></label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px">
              <label class="field"><span>${t('n.class')}</span><select name="classId"><option value="">${t('n.noClass')}</option>${classes.map(c => html`<option value="${c.id}" ${c.id === st.classId ? 'selected' : ''}>${c.name}</option>`)}</select></label>
              <label class="field"><span>${t('n.subject')}</span><input name="subject" value="${st.subject}" placeholder="Информатика"></label>
              <label class="field"><span>${t('n.lang')}</span><select name="lang">${LANGS.map(([id, l]) => html`<option value="${id}" ${id === st.lang ? 'selected' : ''}>${l}</option>`)}</select></label>
            </div>
            <label class="field"><span>${t('n.files')}</span><input type="file" name="files" multiple accept="image/*,application/pdf" style="padding:14px;height:auto;border-style:dashed"><small class="muted">${t('n.filesHint')}${st.files.length ? ` · ${st.files.map(f => f.name).join(', ')}` : ''}</small></label>
          </section>
          <section class="card" style="display:flex;flex-direction:column;gap:16px">
            <div class="row" style="justify-content:space-between;align-items:baseline"><h2 style="font-size:22px">${t('n.slides')}</h2><span class="muted">${t('n.slidesHint')}</span></div>
            <div class="pills">${types.map(k => html`<button type="button" class="pill" data-type="${k}" aria-pressed="${st.types.has(k)}">${t('t.' + k)}</button>`)}</div>
            <div class="row" style="gap:28px">
              <div class="field"><span>${t('n.count')}</span><div class="seg">${[8, 10, 12].map(n => html`<button type="button" data-count="${n}" class="${n === st.count ? 'on' : ''}">${n}</button>`)}</div></div>
              <div class="field"><span>${t('n.img')}</span><div class="seg">${[['photo', 'n.photo'], ['ai', 'n.ai'], ['none', 'n.none']].map(([id, k]) => html`<button type="button" data-img="${id}" class="${id === st.images ? 'on' : ''}">${t(k)}</button>`)}</div></div>
            </div>
          </section>
        </form>
        <aside class="card" style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:16px">
          <h2 style="font-size:22px">${t('n.result')}</h2>
          ${[['deck', 'n.pres', t('n.presSub', { n: st.count })], ['tasks', 'n.tasks', t('n.tasksSub')], ['ksp', 'n.ksp', t('n.kspSub')]].map(([id, k, sub]) => { const s = st.parts[id];
            return html`<div class="row" style="align-items:center;gap:14px;padding:14px 16px;border-radius:16px;background:${id === 'deck' ? 'var(--acc-soft)' : 'var(--bg)'}">
              <div class="grow"><div style="font-weight:700;font-size:17px">${t(k)}</div><div class="sub" style="color:var(--ink2)">${sub}</div></div>
              ${s ? html`<span class="chip ${s === 'done' ? 'ok' : s === 'error' ? 'warn' : 'b'}">${t(s === 'done' ? 'n.done' : s === 'error' ? 'n.err' : 'n.run')}</span>` : ''}</div>`; })}
          ${st.error ? html`<div class="attn" role="alert"><h3>${st.error}</h3><div class="row"><button class="btn sm k" data-retry>${t('n.retry')}</button><button class="btn sm" data-noai>${t('n.noai')}</button></div></div>` : ''}
          <button class="btn b lg" data-create ${st.busy ? 'disabled' : ''}>${st.busy ? t('n.run') : t('n.create')}</button>
          <span class="muted" style="text-align:center;font-size:14px">${t('n.minute')}</span>
        </aside>
      </div></div>`.toString();
    bind();
  };

  const read = () => { const f = main.querySelector('[data-form]'); st.topic = f.topic.value.trim(); st.classId = f.classId.value; st.lang = f.lang.value; };
  const opts = () => ({ topic: st.topic, classId: st.classId || null, className: (cls() || {}).name || '', subject: st.subject, lang: st.lang, count: st.count, types: ['title', ...st.types], images: st.images, files: st.files });

  async function start() {
    read();
    if (!st.topic) { main.querySelector('[name=topic]').focus(); return; }
    st.busy = true; st.error = ''; st.parts = {}; draw();
    try {
      const id = await createLesson(opts(), (part, state) => { st.parts[part] = state; draw(); });
      location.hash = '#/lesson/' + id;
    } catch (e) {
      st.busy = false; st.error = e.message || String(e); draw();
    }
  }

  function bind() {
    const f = main.querySelector('[data-form]');
    f.onsubmit = e => { e.preventDefault(); start(); };
    f.classId.onchange = () => { read(); const c = cls(); if (c && c.subject) { st.subject = c.subject; st.types = new Set(defaultsFor(st.subject)); } draw(); };
    f.subject.onchange = () => { read(); st.subject = f.subject.value.trim(); st.types = new Set(defaultsFor(st.subject)); draw(); };
    f.files.onchange = async () => { read(); st.files = await Promise.all([...f.files.files].slice(0, 6).map(fileToPart)); draw(); };
    main.querySelectorAll('[data-type]').forEach(b => { b.onclick = () => { read(); const k = b.dataset.type; st.types.has(k) ? st.types.delete(k) : st.types.add(k); draw(); }; });
    main.querySelectorAll('[data-count]').forEach(b => { b.onclick = () => { read(); st.count = +b.dataset.count; draw(); }; });
    main.querySelectorAll('[data-img]').forEach(b => { b.onclick = () => { read(); st.images = b.dataset.img; draw(); }; });
    main.querySelector('[data-create]').onclick = start;
    const r = main.querySelector('[data-retry]'); if (r) r.onclick = start;
    const n = main.querySelector('[data-noai]'); if (n) n.onclick = async () => { read(); location.hash = '#/lesson/' + await createBlank(opts()); };
  }
  draw();
}
