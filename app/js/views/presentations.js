/* Screen 6 · New presentation, plus "My presentations". */
import { add, t, lang } from '../i18n.js';
import { html, raw, icon, toast } from '../ui.js';
import { db } from '../data/store.js';
import { fileToPart, AiError } from '../ai.js';
import { weeklyUsage } from '../plans.js';
import { THEMES } from '../slides.js';
import { slideBox, generateDeck, fillImages, officeText } from '../deck.js';
import { langLabel, SLIDE_LANGS } from '../gen/materials.js';
import { shortDate } from '../school.js';

add({
  ru: {
    'pr.new': 'Новая презентация', 'pr.mine': 'Мои презентации · {n}', 'pr.topic': 'Тема урока', 'pr.topicPh': 'Например: Закон Ома для участка цепи. 8 класс, физика.',
    'pr.material': 'Материал (необязательно)', 'pr.materialText': 'Учебник, конспект или фото страницы', 'pr.materialTypes': 'PDF, DOCX, PPTX, JPG', 'pr.choose': 'Выбрать',
    'pr.lang': 'Язык слайдов', 'pr.other': 'Другой…', 'pr.otherPrompt': 'На каком языке сделать слайды?', 'pr.ratio': 'Формат', 'pr.count': 'Слайдов',
    'pr.theme': 'Цветовая тема · {name}', 'th.lime': 'Лайм', 'th.coral': 'Коралл', 'th.sky': 'Небо', 'th.lilac': 'Сирень', 'th.sun': 'Солнце',
    'pr.on': 'На слайдах', 'pr.photos': 'Фото', 'pr.icons': 'Иконки', 'pr.ai': 'AI-изображения', 'pr.questions': 'Вопросы классу',
    'pr.generate': 'Сгенерировать', 'pr.fromLimit': '1 урок из лимита', 'pr.making': 'Создаётся презентация…', 'pr.topicRequired': 'Напишите тему',
    'pr.ready': 'Готово · {title} · {n} слайдов', 'pr.edit': 'Редактировать · вручную или с агентом', 'pr.start': 'Начать урок', 'pr.more': '+ ещё {n}',
    'pr.emptyTitle': 'Здесь появится презентация', 'pr.emptyText': 'Напишите тему слева — alaqai соберёт слайды с фото, примерами и вопросами классу. Потом их можно поправить вручную или попросить агента.',
    'pr.listTitle': 'Мои презентации', 'pr.newBtn': '+ Новая', 'pr.none': 'Презентаций пока нет.', 'pr.slides': '{n} слайдов', 'pr.fromLesson': 'из урока',
    'pr.delete': 'Удалить', 'pr.deleteConfirm': 'Удалить презентацию «{name}»?', 'pr.deleted': 'Презентация удалена', 'pr.blank': 'Пустая презентация', 'pr.untitled': 'Без названия',
    'pr.fileErr': 'Не удалось прочитать файл {name}'
  },
  kk: {
    'pr.new': 'Жаңа презентация', 'pr.mine': 'Менің презентацияларым · {n}', 'pr.topic': 'Сабақ тақырыбы', 'pr.topicPh': 'Мысалы: Тізбек бөлігі үшін Ом заңы. 8-сынып, физика.',
    'pr.material': 'Материал (міндетті емес)', 'pr.materialText': 'Оқулық, конспект немесе бет суреті', 'pr.materialTypes': 'PDF, DOCX, PPTX, JPG', 'pr.choose': 'Таңдау',
    'pr.lang': 'Слайд тілі', 'pr.other': 'Басқа…', 'pr.otherPrompt': 'Слайдтарды қай тілде жасау керек?', 'pr.ratio': 'Формат', 'pr.count': 'Слайд саны',
    'pr.theme': 'Түс тақырыбы · {name}', 'th.lime': 'Лайм', 'th.coral': 'Маржан', 'th.sky': 'Аспан', 'th.lilac': 'Сирень', 'th.sun': 'Күн',
    'pr.on': 'Слайдтарда', 'pr.photos': 'Фото', 'pr.icons': 'Белгішелер', 'pr.ai': 'ЖИ-суреттер', 'pr.questions': 'Сыныпқа сұрақтар',
    'pr.generate': 'Жасау', 'pr.fromLimit': 'лимиттен 1 сабақ', 'pr.making': 'Презентация жасалып жатыр…', 'pr.topicRequired': 'Тақырыпты жазыңыз',
    'pr.ready': 'Дайын · {title} · {n} слайд', 'pr.edit': 'Өңдеу · қолмен немесе агентпен', 'pr.start': 'Сабақты бастау', 'pr.more': '+ тағы {n}',
    'pr.emptyTitle': 'Мұнда презентация шығады', 'pr.emptyText': 'Сол жақта тақырыпты жазыңыз — alaqai фото, мысал және сыныпқа сұрақтары бар слайдтар жасайды. Кейін оларды қолмен немесе агентпен түзетуге болады.',
    'pr.listTitle': 'Менің презентацияларым', 'pr.newBtn': '+ Жаңа', 'pr.none': 'Әзірге презентация жоқ.', 'pr.slides': '{n} слайд', 'pr.fromLesson': 'сабақтан',
    'pr.delete': 'Жою', 'pr.deleteConfirm': '«{name}» презентациясын жоясыз ба?', 'pr.deleted': 'Презентация жойылды', 'pr.blank': 'Бос презентация', 'pr.untitled': 'Атаусыз',
    'pr.fileErr': '{name} файлын оқу мүмкін болмады'
  },
  en: {
    'pr.new': 'New presentation', 'pr.mine': 'My presentations · {n}', 'pr.topic': 'Lesson topic', 'pr.topicPh': 'For example: Ohm’s law for a circuit section. Grade 8, physics.',
    'pr.material': 'Material (optional)', 'pr.materialText': 'Textbook, notes or a page photo', 'pr.materialTypes': 'PDF, DOCX, PPTX, JPG', 'pr.choose': 'Choose',
    'pr.lang': 'Slide language', 'pr.other': 'Other…', 'pr.otherPrompt': 'Which language should the slides be in?', 'pr.ratio': 'Format', 'pr.count': 'Slides',
    'pr.theme': 'Colour theme · {name}', 'th.lime': 'Lime', 'th.coral': 'Coral', 'th.sky': 'Sky', 'th.lilac': 'Lilac', 'th.sun': 'Sun',
    'pr.on': 'On slides', 'pr.photos': 'Photos', 'pr.icons': 'Icons', 'pr.ai': 'AI images', 'pr.questions': 'Class questions',
    'pr.generate': 'Generate', 'pr.fromLimit': '1 lesson from your limit', 'pr.making': 'Creating the presentation…', 'pr.topicRequired': 'Type a topic',
    'pr.ready': 'Ready · {title} · {n} slides', 'pr.edit': 'Edit · by hand or with the agent', 'pr.start': 'Start lesson', 'pr.more': '+ {n} more',
    'pr.emptyTitle': 'Your presentation appears here', 'pr.emptyText': 'Type a topic on the left — alaqai builds slides with photos, examples and questions for the class. Then edit them by hand or ask the agent.',
    'pr.listTitle': 'My presentations', 'pr.newBtn': '+ New', 'pr.none': 'No presentations yet.', 'pr.slides': '{n} slides', 'pr.fromLesson': 'from a lesson',
    'pr.delete': 'Delete', 'pr.deleteConfirm': 'Delete “{name}”?', 'pr.deleted': 'Presentation deleted', 'pr.blank': 'Blank presentation', 'pr.untitled': 'Untitled',
    'pr.fileErr': 'Could not read {name}'
  }
});

let form = null;
let lastId = null;
let busy = false;

function defaults() {
  return { topic: '', lang: lang(), langText: '', ratio: '16:9', count: 8, theme: 'lime', options: { photos: true, icons: true, aiImages: false, questions: true }, files: [], materialText: '', fileNames: [] };
}

export async function render(main, { query }) {
  if (query.list) return list(main);
  form = form || defaults();
  const [decks, usage] = await Promise.all([db.presentations.list(), weeklyUsage()]);
  const deck = lastId ? decks.find(d => d.id === lastId) : null;
  const chip = (on, label, attr) => html`<button type="button" class="chip${on ? ' on' : ''}" ${raw(attr)}>${label}</button>`;
  const seg = (name, values, cur) => html`<div class="seg2">${values.map(v => html`<button type="button" data-${name}="${v}" aria-pressed="${String(v) === String(cur)}">${v}</button>`)}</div>`;

  main.innerHTML = html`
    <div class="page-head center"><h1 class="title title-md">${t('pr.new')}</h1>
      <a class="btn-o btn-md" href="#/presentations?list=1">${t('pr.mine', { n: decks.length })}</a></div>
    <div class="pr-body">
      <form class="pr-form" novalidate>
        <label class="field muted">${t('pr.topic')}<textarea name="topic" rows="2" maxlength="300" placeholder="${t('pr.topicPh')}">${form.topic}</textarea></label>
        <div class="field muted">${t('pr.material')}
          <label class="pr-upload"><input type="file" name="files" accept=".pdf,.docx,.pptx,image/*" multiple hidden>
            ${icon('M12 16V4M7 9l5-5 5 5M4 16v4h16v-4', 22)}
            <span class="grow">${form.fileNames.length ? form.fileNames.join(', ') : html`${t('pr.materialText')}<br><span class="small">${t('pr.materialTypes')}</span>`}</span>
            <span class="btn-o btn-sm">${t('pr.choose')}</span></label>
        </div>
        <div class="field muted">${t('pr.lang')}
          <div class="chips">${SLIDE_LANGS.map(l => html`<button type="button" class="chip sq${form.lang === l && !form.langText ? ' on dark' : ''}" data-lang-pick="${l}">${langLabel(l).replace(' (', ' · ').replace(')', '')}</button>`)}
            <button type="button" class="chip sq dashed${form.langText ? ' on dark' : ''}" data-lang-other>${form.langText || t('pr.other')}</button></div>
        </div>
        <div class="new-row">
          <div class="field muted grow">${t('pr.ratio')}${seg('ratio', ['16:9', '4:3'], form.ratio)}</div>
          <div class="field muted grow">${t('pr.count')}${seg('count', [6, 8, 10, 12], form.count)}</div>
        </div>
        <div class="field muted">${t('pr.theme', { name: t('th.' + form.theme) })}
          <div class="swatches">${Object.keys(THEMES).map(k => html`<button type="button" class="swatch${form.theme === k ? ' on' : ''}" data-theme="${k}" style="background:${THEMES[k].accent}" aria-label="${t('th.' + k)}"></button>`)}</div>
        </div>
        <div class="field muted">${t('pr.on')}
          <div class="chips">
            ${chip(form.options.photos, t('pr.photos'), 'data-opt="photos"')}${chip(form.options.icons, t('pr.icons'), 'data-opt="icons"')}
            ${chip(form.options.aiImages, t('pr.ai'), 'data-opt="aiImages"')}${chip(form.options.questions, t('pr.questions'), 'data-opt="questions"')}
          </div>
        </div>
        <div class="grow"></div>
        <button type="submit" class="btn-k btn-xl" ${busy ? 'disabled' : ''}>${icon('sparkle', 16, 'style="color:var(--lime)"')}${t('pr.generate')}${usage.max ? ' · ' + t('pr.fromLimit') : ''}</button>
      </form>
      <section class="pr-preview">${preview(deck)}</section>
    </div>`;

  const f = main.querySelector('form');
  f.topic.addEventListener('input', () => { form.topic = f.topic.value; });
  main.querySelectorAll('[data-lang-pick]').forEach(b => b.addEventListener('click', () => { form.lang = b.dataset.langPick; form.langText = ''; render(main, { query }); }));
  main.querySelector('[data-lang-other]').addEventListener('click', () => {
    const v = prompt(t('pr.otherPrompt'), form.langText || '');
    if (v != null) { form.langText = v.trim(); render(main, { query }); }
  });
  main.querySelectorAll('[data-ratio]').forEach(b => b.addEventListener('click', () => { form.ratio = b.dataset.ratio; render(main, { query }); }));
  main.querySelectorAll('[data-count]').forEach(b => b.addEventListener('click', () => { form.count = Number(b.dataset.count); render(main, { query }); }));
  main.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { form.theme = b.dataset.theme; render(main, { query }); }));
  main.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => { form.options[b.dataset.opt] = !form.options[b.dataset.opt]; render(main, { query }); }));
  f.files.addEventListener('change', async () => {
    const files = [...f.files.files].slice(0, 3);
    form.files = []; form.materialText = ''; form.fileNames = files.map(x => x.name);
    for (const file of files) {
      try {
        if (/\.(docx|pptx)$/i.test(file.name)) form.materialText += '\n' + await officeText(file);
        else form.files.push(await fileToPart(file));
      } catch (e) { toast(t('pr.fileErr', { name: file.name })); }
    }
    render(main, { query });
  });
  f.addEventListener('submit', async e => {
    e.preventDefault();
    form.topic = f.topic.value.trim();
    if (!form.topic) { toast(t('pr.topicRequired')); f.topic.focus(); return; }
    busy = true; lastId = null;
    render(main, { query });
    try {
      const deck = await generateDeck({ ...form });
      lastId = deck.id;
      await db.usage.create({ kind: 'ai-lesson', at: new Date().toISOString(), presentationId: deck.id });
      busy = false;
      form = { ...defaults(), lang: form.lang, ratio: form.ratio, count: form.count, theme: form.theme, options: form.options };
      if (location.hash.startsWith('#/presentations')) render(main, { query });
      fillImages(deck.id, () => { if (location.hash.startsWith('#/presentations') && lastId === deck.id) drawPreview(main); });
    } catch (err) {
      busy = false;
      toast(err instanceof AiError ? err.message : t('ai.err.bad'));
      if (location.hash.startsWith('#/presentations')) render(main, { query });
    }
  });
}

async function drawPreview(main) {
  const el = main.querySelector('.pr-preview');
  if (el) el.innerHTML = preview(await db.presentations.get(lastId));
}

function preview(deck) {
  if (busy) return html`<div class="pr-head"><span class="np-title" style="font-size:15px">${t('pr.making')}</span></div><div class="slide-box skeleton"></div>
    <div class="pr-thumbs">${[0, 1, 2, 3, 4].map(() => html`<div class="slide-box skeleton"></div>`)}</div>`;
  if (!deck) return html`<div class="empty" style="flex-grow:1;justify-content:center"><h2>${t('pr.emptyTitle')}</h2><p>${t('pr.emptyText')}</p></div>`;
  const rest = deck.slides.length - 4;
  return html`
    <div class="pr-head"><span class="pr-ready">${t('pr.ready', { title: deck.title, n: deck.slides.length })}</span><span class="small" style="font-size:13px">${langLabel(deck.lang)} · ${deck.ratio}</span></div>
    <div class="pr-main">${raw(slideBox(deck.slides[0], deck, 0, 'view'))}</div>
    <div class="pr-actions">
      <a class="btn-o btn-lg2" href="#/editor/${deck.id}">${icon('edit', 15)}${t('pr.edit')}</a>
      <a class="btn-k btn-lg2" href="${deck.lessonId ? '#/lesson/' + deck.lessonId : '#/lesson/deck?deck=' + deck.id}">${icon('play', 12)}${t('pr.start')}</a>
    </div>
    <div class="pr-thumbs">
      ${deck.slides.slice(0, 4).map((s, i) => html`<a href="#/editor/${deck.id}?s=${i}" class="thumb${i === 0 ? ' on' : ''}">${raw(slideBox(s, deck, i, 'thumb'))}</a>`)}
      ${rest > 0 ? html`<a href="#/editor/${deck.id}?s=4" class="thumb more">${t('pr.more', { n: rest })}</a>` : ''}
    </div>`;
}

/* ---------- My presentations ---------- */

async function list(main) {
  const decks = (await db.presentations.list()).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  main.innerHTML = html`
    <div class="page-head center"><h1 class="title title-md">${t('pr.listTitle')}</h1>
      <div class="head-right"><button type="button" class="btn-o btn-md" data-blank>${t('pr.blank')}</button><a class="btn-k btn-md" href="#/presentations">${t('pr.newBtn')}</a></div></div>
    ${decks.length ? html`<div class="deck-grid">${decks.map(d => html`
      <div class="card deck-card">
        <a href="#/editor/${d.id}" class="thumb">${raw(slideBox(d.slides[0] || {}, d, 0, 'thumb'))}</a>
        <div class="deck-meta"><a href="#/editor/${d.id}"><b>${d.title || t('pr.untitled')}</b></a>
          <span class="small">${t('pr.slides', { n: d.slides.length })} · ${d.ratio} · ${langLabel(d.lang)}${d.lessonId ? ' · ' + t('pr.fromLesson') : ''} · ${shortDate((d.updatedAt || d.createdAt).slice(0, 10))}</span></div>
        <button type="button" class="icon-btn" data-del="${d.id}" aria-label="${t('pr.delete')}">${icon('trash', 15)}</button>
      </div>`)}</div>`
    : html`<div class="empty"><p>${t('pr.none')}</p><div class="row"><a class="btn-k" href="#/presentations">${t('pr.newBtn')}</a></div></div>`}`;
  main.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    const d = decks.find(x => x.id === b.dataset.del);
    if (!confirm(t('pr.deleteConfirm', { name: d.title }))) return;
    await db.presentations.remove(d.id);
    if (d.lessonId) { const l = await db.lessons.get(d.lessonId); if (l) await db.lessons.update(l.id, { parts: { ...l.parts, presentationId: null } }); }
    toast(t('pr.deleted'));
    list(main);
  }));
  main.querySelector('[data-blank]').addEventListener('click', async () => {
    const d = await db.presentations.create({ title: t('pr.untitled'), lang: lang(), ratio: '16:9', theme: 'lime', options: { photos: true, icons: true }, slides: [{ layout: 'title', title: '', subtitle: '' }] });
    location.hash = '#/editor/' + d.id;
  });
}
