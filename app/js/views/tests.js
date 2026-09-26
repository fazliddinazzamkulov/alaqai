/* Screens 8 and 9 · Tests and games. */
import { add, t, lang } from '../i18n.js';
import { html, raw, esc, icon, openModal, toast, confirmModal, moreBox } from '../ui.js';
import { db } from '../data/store.js';
import { generateJSON, fileToPart, AiError } from '../ai.js';
import { officeText } from '../deck.js';
import { langPrompt } from '../gen/materials.js';
import { QTYPES, normQ, totalPoints, minutes, playTest } from '../testlogic.js';
import { GAMES, DEFAULT_ORDER, sample, gameText, playGame } from '../games.js';
import { shortDate } from '../school.js';

add({
  ru: {
    'ts.title': 'Тесты и игры', 'ts.test': 'Тест', 'ts.games': 'Игры', 'ts.preview': 'Предпросмотр', 'ts.asHw': 'Дать как ДЗ', 'ts.run': 'Провести в классе', 'ts.mine': 'Мои тесты · {n}',
    'ts.ai': 'С ИИ', 'ts.aiSub': 'из вашего материала', 'ts.manual': 'Вручную', 'ts.manualSub': 'сами пишете вопросы', 'ts.manualText': 'Пишите вопросы справа: выберите тип, отметьте правильный ответ, добавьте картинку или пояснение.',
    'ts.material': 'Материал', 'ts.addMore': 'Добавьте ещё: PDF, DOCX, фото учебника или текст', 'ts.addFirst': 'PDF, DOCX, фото учебника или текст', 'ts.pasteText': 'Вставить текст', 'ts.textPh': 'Вставьте текст параграфа',
    'ts.settings': 'Количество, типы и сложность', 'ts.nQ': '{n} вопросов', 'ts.count': 'Вопросов', 'ts.types': 'Типы вопросов', 'ts.level': 'Сложность', 'ts.easy': 'Лёгкий', 'ts.medium': 'Средний', 'ts.hard': 'Сложный', 'ts.generate': 'Сгенерировать вопросы', 'ts.generating': 'ИИ пишет вопросы…',
    'ts.untitled': 'Новый тест', 'ts.titlePh': 'Название теста', 'ts.meta': '{n} вопросов · {p} баллов · ~{m} мин', 'ts.point': '{n} балл', 'ts.improve': '✦ Улучшить', 'ts.dup': 'Дублировать', 'ts.del': 'Удалить',
    'ts.qPh': 'Текст вопроса', 'ts.optPh': 'Вариант ответа', 'ts.right': 'ВЕРНО', 'ts.addOpt': '+ Вариант', 'ts.addImg': '+ Картинка', 'ts.addExpl': '+ Пояснение к ответу', 'ts.explPh': 'Почему этот ответ верный',
    'ts.openAns': 'Правильный ответ (варианты через |)', 'ts.openHint': 'Можно оставить пустым — такой ответ проверите вы', 'ts.numAns': 'Ответ', 'ts.tol': 'Допуск ±', 'ts.addQ': '+ Добавить вопрос вручную',
    'ts.needTopic': 'Добавьте материал или напишите название теста — по нему ИИ составит вопросы', 'ts.noQuestions': 'Вопросов пока нет. Сгенерируйте их слева или добавьте вручную.',
    'ts.hwMade': 'Домашнее задание создано', 'ts.needQ': 'Сначала добавьте вопросы', 'ts.listTitle': 'Мои тесты', 'ts.newTest': '+ Новый тест', 'ts.none': 'Тестов пока нет.', 'ts.quizKind': 'викторина', 'ts.deleteConfirm': 'Удалить тест «{name}»?', 'ts.deleted': 'Удалено',
    'gm.searchBtn': 'Поиск', 'gm.search': 'Найти игру', 'gm.frequent': 'Чаще всего используете', 'gm.used': 'Использовано {n} раз', 'gm.notUsed': 'Ещё не использовали', 'gm.other': 'Остальные форматы', 'gm.mine': 'Мои игры', 'gm.new': 'Новые игры', 'gm.soon': 'скоро',
    'gm.ph1': 'место для командной игры', 'gm.ph2': 'место для игры на скорость', 'gm.ph3': 'пришлите описание — добавлю', 'gm.phName': 'Новая игра {n}',
    'gm.play': 'Играть', 'gm.edit': 'Изменить', 'gm.builder': 'Новая игра · {type}', 'gm.titlePh': 'Название игры', 'gm.text': 'Содержание', 'gm.sample': 'Пример', 'gm.aiTopic': 'Тема для ИИ', 'gm.aiFill': '✦ Заполнить с ИИ', 'gm.save': 'Сохранить', 'gm.saved': 'Игра сохранена',
    'gm.preview': 'Так увидит класс', 'gm.forLesson': 'Игры урока «{name}»', 'gm.all': 'Все игры', 'gm.noneMine': 'Своих игр пока нет — выберите формат выше.', 'gm.deleteConfirm': 'Удалить игру «{name}»?'
  },
  kk: {
    'ts.title': 'Тест және ойын', 'ts.test': 'Тест', 'ts.games': 'Ойындар', 'ts.preview': 'Алдын ала қарау', 'ts.asHw': 'ҮТ ретінде беру', 'ts.run': 'Сыныпта өткізу', 'ts.mine': 'Менің тесттерім · {n}',
    'ts.ai': 'ЖИ-мен', 'ts.aiSub': 'сіздің материалыңыздан', 'ts.manual': 'Қолмен', 'ts.manualSub': 'сұрақтарды өзіңіз жазасыз', 'ts.manualText': 'Сұрақтарды оң жақта жазыңыз: түрін таңдап, дұрыс жауапты белгілеңіз, сурет не түсініктеме қосыңыз.',
    'ts.material': 'Материал', 'ts.addMore': 'Тағы қосыңыз: PDF, DOCX, оқулық суреті немесе мәтін', 'ts.addFirst': 'PDF, DOCX, оқулық суреті немесе мәтін', 'ts.pasteText': 'Мәтін қою', 'ts.textPh': 'Параграф мәтінін қойыңыз',
    'ts.settings': 'Саны, түрлері және күрделілігі', 'ts.nQ': '{n} сұрақ', 'ts.count': 'Сұрақ саны', 'ts.types': 'Сұрақ түрлері', 'ts.level': 'Күрделілік', 'ts.easy': 'Жеңіл', 'ts.medium': 'Орташа', 'ts.hard': 'Күрделі', 'ts.generate': 'Сұрақтарды жасау', 'ts.generating': 'ЖИ сұрақ жазып жатыр…',
    'ts.untitled': 'Жаңа тест', 'ts.titlePh': 'Тест атауы', 'ts.meta': '{n} сұрақ · {p} балл · ~{m} мин', 'ts.point': '{n} балл', 'ts.improve': '✦ Жақсарту', 'ts.dup': 'Көшірме', 'ts.del': 'Жою',
    'ts.qPh': 'Сұрақ мәтіні', 'ts.optPh': 'Жауап нұсқасы', 'ts.right': 'ДҰРЫС', 'ts.addOpt': '+ Нұсқа', 'ts.addImg': '+ Сурет', 'ts.addExpl': '+ Жауапқа түсініктеме', 'ts.explPh': 'Неге бұл жауап дұрыс',
    'ts.openAns': 'Дұрыс жауап (нұсқаларды | арқылы)', 'ts.openHint': 'Бос қалдыруға болады — мұндай жауапты өзіңіз тексересіз', 'ts.numAns': 'Жауап', 'ts.tol': 'Ауытқу ±', 'ts.addQ': '+ Сұрақты қолмен қосу',
    'ts.needTopic': 'Материал қосыңыз немесе тест атауын жазыңыз — ЖИ сол бойынша сұрақ құрады', 'ts.noQuestions': 'Әзірге сұрақ жоқ. Сол жақта жасаңыз немесе қолмен қосыңыз.',
    'ts.hwMade': 'Үй тапсырмасы құрылды', 'ts.needQ': 'Алдымен сұрақ қосыңыз', 'ts.listTitle': 'Менің тесттерім', 'ts.newTest': '+ Жаңа тест', 'ts.none': 'Әзірге тест жоқ.', 'ts.quizKind': 'викторина', 'ts.deleteConfirm': '«{name}» тестін жоясыз ба?', 'ts.deleted': 'Жойылды',
    'gm.searchBtn': 'Іздеу', 'gm.search': 'Ойын іздеу', 'gm.frequent': 'Жиі қолданасыз', 'gm.used': '{n} рет қолданылды', 'gm.notUsed': 'Әлі қолданылмаған', 'gm.other': 'Басқа форматтар', 'gm.mine': 'Менің ойындарым', 'gm.new': 'Жаңа ойындар', 'gm.soon': 'жақында',
    'gm.ph1': 'командалық ойынға орын', 'gm.ph2': 'жылдамдық ойынына орын', 'gm.ph3': 'сипаттамасын жіберіңіз — қосамын', 'gm.phName': 'Жаңа ойын {n}',
    'gm.play': 'Ойнау', 'gm.edit': 'Өзгерту', 'gm.builder': 'Жаңа ойын · {type}', 'gm.titlePh': 'Ойын атауы', 'gm.text': 'Мазмұны', 'gm.sample': 'Мысал', 'gm.aiTopic': 'ЖИ-ге тақырып', 'gm.aiFill': '✦ ЖИ-мен толтыру', 'gm.save': 'Сақтау', 'gm.saved': 'Ойын сақталды',
    'gm.preview': 'Сынып осылай көреді', 'gm.forLesson': '«{name}» сабағының ойындары', 'gm.all': 'Барлық ойындар', 'gm.noneMine': 'Өз ойындарыңыз әзірге жоқ — жоғарыдан формат таңдаңыз.', 'gm.deleteConfirm': '«{name}» ойынын жоясыз ба?'
  },
  en: {
    'ts.title': 'Tests & games', 'ts.test': 'Test', 'ts.games': 'Games', 'ts.preview': 'Preview', 'ts.asHw': 'Set as homework', 'ts.run': 'Run in class', 'ts.mine': 'My tests · {n}',
    'ts.ai': 'With AI', 'ts.aiSub': 'from your material', 'ts.manual': 'By hand', 'ts.manualSub': 'you write the questions', 'ts.manualText': 'Write questions on the right: choose a type, mark the correct answer, add a picture or an explanation.',
    'ts.material': 'Material', 'ts.addMore': 'Add more: PDF, DOCX, a textbook photo or text', 'ts.addFirst': 'PDF, DOCX, a textbook photo or text', 'ts.pasteText': 'Paste text', 'ts.textPh': 'Paste the paragraph text',
    'ts.settings': 'Number, types and difficulty', 'ts.nQ': '{n} questions', 'ts.count': 'Questions', 'ts.types': 'Question types', 'ts.level': 'Difficulty', 'ts.easy': 'Easy', 'ts.medium': 'Medium', 'ts.hard': 'Hard', 'ts.generate': 'Generate questions', 'ts.generating': 'AI is writing questions…',
    'ts.untitled': 'New test', 'ts.titlePh': 'Test title', 'ts.meta': '{n} questions · {p} points · ~{m} min', 'ts.point': '{n} pt', 'ts.improve': '✦ Improve', 'ts.dup': 'Duplicate', 'ts.del': 'Delete',
    'ts.qPh': 'Question text', 'ts.optPh': 'Answer option', 'ts.right': 'CORRECT', 'ts.addOpt': '+ Option', 'ts.addImg': '+ Picture', 'ts.addExpl': '+ Explanation', 'ts.explPh': 'Why this answer is correct',
    'ts.openAns': 'Correct answer (alternatives separated by |)', 'ts.openHint': 'Leave empty and you will check it yourself', 'ts.numAns': 'Answer', 'ts.tol': 'Tolerance ±', 'ts.addQ': '+ Add a question by hand',
    'ts.needTopic': 'Add material or type a test title — the AI will write questions from it', 'ts.noQuestions': 'No questions yet. Generate them on the left or add by hand.',
    'ts.hwMade': 'Homework created', 'ts.needQ': 'Add questions first', 'ts.listTitle': 'My tests', 'ts.newTest': '+ New test', 'ts.none': 'No tests yet.', 'ts.quizKind': 'quiz', 'ts.deleteConfirm': 'Delete “{name}”?', 'ts.deleted': 'Deleted',
    'gm.searchBtn': 'Search', 'gm.search': 'Find a game', 'gm.frequent': 'Used most often', 'gm.used': 'Used {n} times', 'gm.notUsed': 'Not used yet', 'gm.other': 'Other formats', 'gm.mine': 'My games', 'gm.new': 'New games', 'gm.soon': 'soon',
    'gm.ph1': 'a spot for a team game', 'gm.ph2': 'a spot for a speed game', 'gm.ph3': 'send a description and I’ll add it', 'gm.phName': 'New game {n}',
    'gm.play': 'Play', 'gm.edit': 'Edit', 'gm.builder': 'New game · {type}', 'gm.titlePh': 'Game title', 'gm.text': 'Content', 'gm.sample': 'Example', 'gm.aiTopic': 'Topic for AI', 'gm.aiFill': '✦ Fill with AI', 'gm.save': 'Save', 'gm.saved': 'Game saved',
    'gm.preview': 'What the class sees', 'gm.forLesson': 'Games of “{name}”', 'gm.all': 'All games', 'gm.noneMine': 'No games of your own yet — pick a format above.', 'gm.deleteConfirm': 'Delete “{name}”?'
  }
});

let testId = null, aiMode = true, active = 0, gen = { count: 10, types: ['single', 'multiple', 'truefalse'], level: 'medium', files: [], names: [], text: '', showText: false }, busy = false, saveTimer = null;

function tabs(active) {
  return html`<div class="seg lg"><a href="#/tests" role="tab" aria-selected="${active === 'test'}">${t('ts.test')}</a><a href="#/tests?tab=games" role="tab" aria-selected="${active === 'games'}">${t('ts.games')}</a></div>`;
}

export async function render(main, { query }) {
  if (query.tab === 'games') return games(main, query);
  if (query.list) return testList(main);
  if (query.id) testId = query.id;
  if (query.new) testId = null;
  let test = testId ? await db.tests.get(testId) : null;
  if (!test && !query.new) {
    const all = (await db.tests.list()).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
    test = all[0] || null;
  }
  if (!test) test = { id: null, kind: 'test', title: '', questions: [] };
  testId = test.id;
  const count = (await db.tests.list()).length;
  const qs = test.questions.map(normQ);
  active = Math.min(active, Math.max(0, qs.length - 1));

  main.innerHTML = html`
    <div class="page-head center">
      <div class="head-left"><h1 class="title title-md">${t('ts.title')}</h1>${tabs('test')}</div>
      <div class="head-right">
        <a class="btn-o btn-md" href="#/tests?list=1">${t('ts.mine', { n: count })}</a>
        <button type="button" class="btn-o btn-md" data-preview>${t('ts.preview')}</button>
        <button type="button" class="btn-o btn-md" data-hw>${t('ts.asHw')}</button>
        <a class="btn-k btn-md" href="${test.id ? (test.lessonId ? '#/lesson/' + test.lessonId + '?test=' + test.id : '#/lesson/test?test=' + test.id) : '#/tests'}" data-run>${icon('play', 12)}${t('ts.run')}</a>
      </div>
    </div>
    <div class="ts-body">
      <aside class="ts-side">
        <div class="mode-cards">
          <button type="button" class="${aiMode ? 'on' : ''}" data-mode="ai">${icon('sparkle', 20)}<b>${t('ts.ai')}</b><span>${t('ts.aiSub')}</span></button>
          <button type="button" class="${aiMode ? '' : 'on'}" data-mode="manual">${icon('edit', 20)}<b>${t('ts.manual')}</b><span>${t('ts.manualSub')}</span></button>
        </div>
        ${aiMode ? html`
          <div class="field muted">${t('ts.material')}
            <div class="ts-drop">
              ${gen.names.map((n, i) => html`<div class="file-row"><span class="badge">${(n.split('.').pop() || '').slice(0, 4).toUpperCase()}</span><span class="grow">${n}</span><button type="button" class="icon-btn" data-rmfile="${i}" aria-label="×">${icon('close', 14)}</button></div>`)}
              ${gen.showText ? html`<textarea name="text" rows="4" placeholder="${t('ts.textPh')}">${gen.text}</textarea>` : ''}
              <label class="add-line"><input type="file" accept=".pdf,.docx,.pptx,image/*" multiple hidden data-files>${gen.names.length || gen.text ? t('ts.addMore') : t('ts.addFirst')}</label>
              ${gen.showText ? '' : html`<button type="button" class="link-btn" data-text>${t('ts.pasteText')}</button>`}
            </div>
          </div>
          ${moreBox('ts-settings', html`
          <div class="field muted">${t('ts.count')}<div class="seg2">${[5, 10, 15, 20].map(n => html`<button type="button" data-count="${n}" aria-pressed="${gen.count === n}">${n}</button>`)}</div></div>
          <div class="field muted">${t('ts.types')}<div class="chips">${QTYPES.map(q => html`<button type="button" class="chip${gen.types.includes(q) ? ' on' : ''}" data-type="${q}">${t('qt.' + q)}</button>`)}</div></div>
          <div class="field muted">${t('ts.level')}<div class="seg2">${['easy', 'medium', 'hard'].map(l => html`<button type="button" data-level="${l}" aria-pressed="${gen.level === l}">${t('ts.' + l)}</button>`)}</div></div>
          `.toString(), [t('ts.nQ', { n: gen.count }), gen.types.map(q => t('qt.' + q)).join(', '), t('ts.' + gen.level)].join(' · '), t('ts.settings'))}
          <div class="grow"></div>
          <button type="button" class="btn-k btn-xl" data-generate ${busy ? 'disabled' : ''}>${icon('sparkle', 15, 'style="color:var(--lime)"')}${busy ? t('ts.generating') : t('ts.generate')}</button>`
        : html`<p class="muted-note">${t('ts.manualText')}</p><div class="grow"></div><button type="button" class="btn-k btn-xl" data-addq>${t('ts.addQ').replace('+ ', '')}</button>`}
      </aside>
      <section class="ts-main">
        <div class="ts-top"><input class="ts-title" value="${test.title}" placeholder="${t('ts.titlePh')}" aria-label="${t('ts.titlePh')}" maxlength="120"><span class="small">${t('ts.meta', { n: qs.length, p: totalPoints(qs), m: minutes(qs) })}</span></div>
        ${qs.length ? qs.map((q, i) => i === active ? qEditor(q, i) : html`<button type="button" class="q-row" data-open="${i}"><span class="qn">${i + 1}</span><span class="grow">${q.q || '—'}</span><span class="small">${t('qt.' + q.type)} · ${t('ts.point', { n: q.points })}</span></button>`) : html`<p class="muted-note">${t('ts.noQuestions')}</p>`}
        <button type="button" class="q-add" data-addq>${t('ts.addQ')}</button>
      </section>
    </div>`;

  bindTest(main, test, qs);
}

function qEditor(q, i) {
  const choice = q.type === 'single' || q.type === 'multiple';
  return html`<div class="q-card" data-i="${i}">
    <div class="q-bar">
      <span class="qn on">${i + 1}</span>
      <select class="pill-sel" data-f="type">${QTYPES.map(x => html`<option value="${x}" ${x === q.type ? 'selected' : ''}>${t('qt.' + x)}</option>`)}</select>
      <select class="pill-sel" data-f="points">${[1, 2, 3, 4, 5].map(n => html`<option value="${n}" ${n === q.points ? 'selected' : ''}>${t('ts.point', { n })}</option>`)}</select>
      <span class="grow"></span>
      <button type="button" class="ghost" data-improve>${t('ts.improve')}</button>
      <button type="button" class="ghost ic" data-dup aria-label="${t('ts.dup')}">${icon('M8 8h12v12H8zM16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3')}</button>
      <button type="button" class="ghost ic" data-delq aria-label="${t('ts.del')}">${icon('trash')}</button>
    </div>
    <input class="q-text" data-f="q" value="${q.q}" placeholder="${t('ts.qPh')}" aria-label="${t('ts.qPh')}">
    ${q.image ? html`<div class="q-img"><img src="${q.image}" alt=""><button type="button" class="icon-btn" data-rmimg aria-label="×">${icon('close', 14)}</button></div>` : ''}
    ${choice ? html`<div class="q-opts">${q.options.map((o, k) => {
      const right = q.type === 'single' ? q.answer === k : q.answers.includes(k);
      return html`<label class="q-opt${right ? ' right' : ''}"><input type="${q.type === 'single' ? 'radio' : 'checkbox'}" name="right-${i}" data-right="${k}" ${right ? 'checked' : ''}><input class="opt-text" data-opt="${k}" value="${o}" placeholder="${t('ts.optPh')}">${right ? html`<span class="tag">${t('ts.right')}</span>` : ''}<button type="button" class="x" data-rmopt="${k}" aria-label="×">×</button></label>`;
    })}</div>` : ''}
    ${q.type === 'truefalse' ? html`<div class="q-opts">${[true, false].map(v => html`<label class="q-opt${q.isTrue === v ? ' right' : ''}"><input type="radio" name="tf-${i}" data-tf="${v}" ${q.isTrue === v ? 'checked' : ''}><span class="grow">${t(v ? 'tp.true' : 'tp.false')}</span>${q.isTrue === v ? html`<span class="tag">${t('ts.right')}</span>` : ''}</label>`)}</div>` : ''}
    ${q.type === 'open' ? html`<label class="field">${t('ts.openAns')}<input data-f="answerText" value="${q.answerText}"><span class="hint">${t('ts.openHint')}</span></label>` : ''}
    ${q.type === 'number' ? html`<div class="fields two"><label class="field">${t('ts.numAns')}<input data-f="answerNumber" inputmode="decimal" value="${q.answerNumber}"></label><label class="field">${t('ts.tol')}<input data-f="tolerance" inputmode="decimal" value="${q.tolerance || ''}"></label></div>` : ''}
    ${q.explanation || q.showExpl ? html`<textarea class="q-expl" data-f="explanation" rows="2" placeholder="${t('ts.explPh')}">${q.explanation}</textarea>` : ''}
    <div class="q-links">
      ${choice ? html`<button type="button" class="link-btn" data-addopt>${t('ts.addOpt')}</button>` : ''}
      <label class="link-btn" style="cursor:pointer">${t('ts.addImg')}<input type="file" accept="image/*" hidden data-img></label>
      ${q.explanation ? '' : html`<button type="button" class="link-btn" data-expl>${t('ts.addExpl')}</button>`}
    </div>
  </div>`;
}

function bindTest(main, test, qs) {
  const rerender = () => render(main, { query: {} });
  const store = async (now) => {
    const data = { title: main.querySelector('.ts-title').value.trim() || t('ts.untitled'), questions: test.questions };
    if (!test.id) { const created = await db.tests.create({ kind: 'test', lessonId: null, ...data }); test.id = created.id; testId = created.id; }
    else await db.tests.update(test.id, data);
    if (now) rerender();
  };
  const later = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => store(false), 500); };
  const Q = () => test.questions[active];
  const setQ = patch => { test.questions[active] = { ...normQ(Q()), ...patch }; };

  main.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { aiMode = b.dataset.mode === 'ai'; rerender(); });
  main.querySelectorAll('[data-count]').forEach(b => b.onclick = () => { gen.count = Number(b.dataset.count); rerender(); });
  main.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { gen.level = b.dataset.level; rerender(); });
  main.querySelectorAll('[data-type]').forEach(b => b.onclick = () => { const x = b.dataset.type; gen.types = gen.types.includes(x) ? gen.types.filter(y => y !== x) : [...gen.types, x]; if (!gen.types.length) gen.types = ['single']; rerender(); });
  const txt = main.querySelector('[data-text]'); if (txt) txt.onclick = () => { gen.showText = true; rerender(); };
  const ta = main.querySelector('.ts-drop textarea'); if (ta) ta.oninput = () => { gen.text = ta.value; };
  main.querySelectorAll('[data-rmfile]').forEach(b => b.onclick = () => { const i = Number(b.dataset.rmfile); gen.names.splice(i, 1); gen.files.splice(i, 1); rerender(); });
  const fl = main.querySelector('[data-files]');
  if (fl) fl.onchange = async () => {
    for (const f of [...fl.files].slice(0, 3)) {
      if (/\.(docx|pptx)$/i.test(f.name)) { gen.text += '\n' + await officeText(f); gen.names.push(f.name); gen.files.push(null); }
      else { gen.files.push(await fileToPart(f)); gen.names.push(f.name); }
    }
    rerender();
  };
  main.querySelector('.ts-title').oninput = e => { test.title = e.target.value; later(); };

  const gb = main.querySelector('[data-generate]');
  if (gb) gb.onclick = async () => {
    const title = main.querySelector('.ts-title').value.trim();
    if (!title && !gen.files.filter(Boolean).length && !gen.text.trim()) return toast(t('ts.needTopic'));
    test.title = title; busy = true; rerender();
    try {
      const res = await generateJSON(testPrompt(title, gen), { files: gen.files.filter(Boolean) });
      const got = (Array.isArray(res.questions) ? res.questions : []).map(normQ).filter(q => q.q);
      if (!got.length) throw new AiError('bad');
      test.questions = [...test.questions, ...got];
      if (res.title && !title) test.title = String(res.title);
      if (!title && res.title) main.querySelector('.ts-title').value = res.title;
      busy = false;
      await store(true);
    } catch (e) { busy = false; toast(e.message); rerender(); }
  };

  main.querySelectorAll('[data-addq]').forEach(b => b.onclick = async () => {
    test.questions.push({ type: 'single', q: '', options: ['', '', '', ''], answer: 0, points: 1 });
    active = test.questions.length - 1;
    await store(true);
    const inp = main.querySelector('.q-text'); if (inp) inp.focus();
  });
  main.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { active = Number(b.dataset.open); rerender(); });

  const card = main.querySelector('.q-card');
  if (card) {
    card.addEventListener('input', e => {
      const el = e.target;
      if (el.dataset.f && el.tagName !== 'SELECT') { setQ({ [el.dataset.f]: el.dataset.f === 'tolerance' ? parseFloat(el.value.replace(',', '.')) || 0 : el.value }); later(); }
      if (el.dataset.opt != null) { const q = normQ(Q()); q.options[Number(el.dataset.opt)] = el.value; setQ({ options: q.options }); later(); }
    });
    card.addEventListener('change', async e => {
      const el = e.target;
      const q = normQ(Q());
      if (el.dataset.f === 'type') {
        const type = el.value;
        const patch = { type };
        if ((type === 'single' || type === 'multiple') && q.options.length < 2) patch.options = ['', '', '', ''];
        if (type === 'multiple') patch.answers = [q.answer];
        setQ(patch);
      } else if (el.dataset.f === 'points') setQ({ points: Number(el.value) });
      else if (el.dataset.right != null) {
        const k = Number(el.dataset.right);
        if (q.type === 'single') setQ({ answer: k });
        else setQ({ answers: el.checked ? [...new Set([...q.answers, k])] : q.answers.filter(x => x !== k) });
      } else if (el.dataset.tf != null) setQ({ isTrue: el.dataset.tf === 'true' });
      else if (el.dataset.img != null) {
        const f = el.files[0]; if (!f) return;
        setQ({ image: await smallImage(f) });
      } else return;
      await store(true);
    });
    card.addEventListener('click', async e => {
      const b = e.target.closest('button');
      if (!b) return;
      const q = normQ(Q());
      if (b.dataset.addopt != null) setQ({ options: [...q.options, ''] });
      else if (b.dataset.rmopt != null) { const k = Number(b.dataset.rmopt); const options = q.options.filter((_, x) => x !== k); setQ({ options, answer: q.answer === k ? 0 : q.answer > k ? q.answer - 1 : q.answer, answers: q.answers.filter(x => x !== k).map(x => (x > k ? x - 1 : x)) }); }
      else if (b.dataset.expl != null) setQ({ showExpl: true });
      else if (b.dataset.rmimg != null) setQ({ image: null });
      else if (b.dataset.dup != null) { test.questions.splice(active + 1, 0, JSON.parse(JSON.stringify(test.questions[active]))); active++; }
      else if (b.dataset.delq != null) { test.questions.splice(active, 1); active = Math.max(0, active - 1); }
      else if (b.dataset.improve != null) {
        b.disabled = true;
        try {
          const res = await generateJSON(`[part:improve]\nУлучши вопрос школьного теста${main.querySelector('.ts-title').value ? ` «${main.querySelector('.ts-title').value}»` : ''}: сделай формулировку ясной, варианты — правдоподобными, добавь короткое пояснение. Тип и правильный ответ сохрани. Язык — тот же, что у вопроса.\nВопрос (JSON): ${JSON.stringify(q)}\nВерни ТОЛЬКО JSON вопроса в том же формате.`);
          setQ(normQ({ ...q, ...res, type: q.type }));
        } catch (err) { toast(err.message); b.disabled = false; return; }
      } else return;
      await store(true);
    });
  }

  main.querySelector('[data-preview]').onclick = () => {
    if (!test.questions.length) return toast(t('ts.needQ'));
    openModal({ title: main.querySelector('.ts-title').value || t('ts.untitled'), body: '<div class="tp-host"></div>', wide: true });
    playTest(document.querySelector('.modal-back:last-child .tp-host'), test);
  };
  main.querySelector('[data-hw]').onclick = async () => {
    if (!test.questions.length) return toast(t('ts.needQ'));
    await store(false);
    const lesson = test.lessonId ? await db.lessons.get(test.lessonId) : null;
    const hw = await db.homework.create({ lessonId: test.lessonId || null, classId: lesson ? lesson.classId : null, kind: 'online', testId: test.id, title: main.querySelector('.ts-title').value || t('ts.untitled'), instructions: '', questions: test.questions, dueDate: null, status: 'draft' });
    toast(t('ts.hwMade'));
    location.hash = '#/homework?id=' + hw.id;
  };
  main.querySelector('[data-run]').onclick = e => { if (!test.questions.length) { e.preventDefault(); toast(t('ts.needQ')); } };
}

function testPrompt(title, g) {
  const levels = { easy: 'лёгкие, на узнавание', medium: 'средней сложности, на понимание и применение', hard: 'сложные, на анализ и задачи' };
  return `[part:tests]
Составь школьный тест${title ? ` «${title}»` : ''} по приложенному материалу${title ? ' и названию' : ''} для учителя из Казахстана.
Вопросов: ${g.count}. Сложность: ${levels[g.level]}. Используй только эти типы вопросов: ${g.types.join(', ')}.
Пиши ${langPrompt(lang())} (если материал на другом языке — на языке материала).
${g.text.trim() ? `Текст материала:\n"""\n${g.text.trim().slice(0, 20000)}\n"""` : ''}
Формат ответа — ТОЛЬКО JSON:
{ "title": "короткое название теста", "questions": [
  { "type": "single", "q": "…", "options": ["…","…","…","…"], "answer": 0, "points": 1, "explanation": "…" },
  { "type": "multiple", "q": "…", "options": ["…","…","…","…"], "answers": [0, 2], "points": 2, "explanation": "…" },
  { "type": "truefalse", "q": "утверждение", "isTrue": true, "points": 1, "explanation": "…" },
  { "type": "open", "q": "…", "answerText": "короткий правильный ответ|вариант написания", "points": 2 },
  { "type": "number", "q": "задача", "answerNumber": 3, "tolerance": 0, "points": 2, "explanation": "решение" }
] }
Правильные ответы распредели по разным позициям.`;
}

function smallImage(file, max = 1000) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.85)); };
    img.src = URL.createObjectURL(file);
  });
}

async function testList(main) {
  const tests = (await db.tests.list()).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  main.innerHTML = html`
    <div class="page-head center"><div class="head-left"><h1 class="title title-md">${t('ts.listTitle')}</h1>${tabs('test')}</div><a class="btn-k btn-md" href="#/tests?new=1">${t('ts.newTest')}</a></div>
    ${tests.length ? html`<div class="card" style="gap:0">${tests.map(x => html`<div class="row-link"><a href="#/tests?id=${x.id}" class="grow"><b style="font-weight:600">${x.title || t('ts.untitled')}</b></a>
      <span class="small">${x.kind === 'quiz' ? t('ts.quizKind') + ' · ' : ''}${t('ts.meta', { n: x.questions.length, p: totalPoints(x.questions), m: minutes(x.questions) })} · ${shortDate((x.updatedAt || x.createdAt).slice(0, 10))}</span>
      <button type="button" class="icon-btn" data-del="${x.id}" aria-label="${t('ts.del')}">${icon('trash', 15)}</button></div>`)}</div>`
      : html`<div class="empty"><p>${t('ts.none')}</p><div class="row"><a class="btn-k" href="#/tests?new=1">${t('ts.newTest')}</a></div></div>`}`;
  main.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    const x = tests.find(y => y.id === b.dataset.del);
    if (!(await confirmModal(t('ts.deleteConfirm', { name: x.title })))) return;
    await db.tests.remove(x.id);
    if (testId === x.id) testId = null;
    toast(t('ts.deleted')); testList(main);
  });
}

/* ---------- Games (screen 9) ---------- */

async function games(main, query) {
  if (query.new || query.game) return builder(main, query);
  const [settings, mine, quizzes, lesson] = await Promise.all([db.settings.get(), db.games.list(), db.tests.list({ kind: 'quiz' }), query.lesson ? db.lessons.get(query.lesson) : null]);
  const use = settings.gameUse || {};
  const order = [...DEFAULT_ORDER].sort((a, b) => (use[b] || 0) - (use[a] || 0) || DEFAULT_ORDER.indexOf(a) - DEFAULT_ORDER.indexOf(b));
  const top = order.slice(0, 4), rest = order.slice(4);
  const TOP_COLORS = [['#DDF0FF', '#2F4B63'], ['#FFE6D9', '#6B3A22'], ['#FFF1C9', '#6B5310'], ['#ECE5FF', '#45367A']];
  let list = [...mine.map(g => ({ ...g, src: 'game' })), ...quizzes.map(q => ({ ...q, type: 'quiz', src: 'test' }))];
  if (lesson) list = list.filter(g => g.lessonId === lesson.id);
  list.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));

  main.innerHTML = html`
    <div class="page-head center">
      <div class="head-left"><h1 class="title title-md">${t('ts.title')}</h1>${tabs('games')}</div>
      <span class="search-fold"><button type="button" class="tool-toggle" data-searchtoggle aria-label="${t('gm.search')}">${icon('M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-3.5-3.5', 16)}${t('gm.searchBtn')}</button>
        <label class="search-box" hidden>${icon('M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-3.5-3.5')}<input placeholder="${t('gm.search')}" aria-label="${t('gm.search')}" data-search></label></span>
    </div>
    ${lesson ? '' : html`
    <div class="gm-sec"><div class="sec-label">${t('gm.frequent')}</div>
      <div class="gm-top">${top.map((id, i) => html`<a class="gm-big" href="#/tests?tab=games&new=${id}" data-name="${t('g.' + id)}" style="background:${TOP_COLORS[i][0]}">
        <span class="gm-ic">${icon(GAMES[id].icon, 24)}</span><span><b>${t('g.' + id)}</b><span style="color:${TOP_COLORS[i][1]}">${use[id] ? t('gm.used', { n: use[id] }) : t('gm.notUsed')}</span></span></a>`)}</div></div>
    <div class="gm-sec"><div class="sec-label">${t('gm.other')}</div>
      <div class="gm-rest">${rest.map(id => html`<a class="gm-small" href="#/tests?tab=games&new=${id}" data-name="${t('g.' + id)}">${icon(GAMES[id].icon, 20)}<b>${t('g.' + id)}</b></a>`)}</div></div>`}
    <div class="gm-sec"><div class="sec-label">${lesson ? t('gm.forLesson', { name: lesson.topic }) : t('gm.mine')}${lesson ? html` · <a class="link-btn" href="#/tests?tab=games">${t('gm.all')}</a>` : ''}</div>
      ${list.length ? html`<div class="gm-mine">${list.map(g => html`<div class="card gm-item" data-name="${g.title || ''}">
        <span class="gm-ic sm">${icon(GAMES[g.type] ? GAMES[g.type].icon : 'tests', 18)}</span>
        <span class="grow"><b>${g.title || t('g.' + g.type)}</b><span class="small">${t('g.' + g.type)}</span></span>
        <button type="button" class="btn-k btn-sm" data-play="${g.src}:${g.id}">${t('gm.play')}</button>
        <a class="btn-o btn-sm" href="${g.src === 'test' ? '#/tests?id=' + g.id : '#/tests?tab=games&game=' + g.id}">${t('gm.edit')}</a>
        <button type="button" class="icon-btn" data-delg="${g.src}:${g.id}" aria-label="${t('ts.del')}">${icon('trash', 14)}</button></div>`)}</div>`
        : html`<p class="muted-note">${t('gm.noneMine')}</p>`}
    </div>
    ${lesson ? '' : html`<div class="gm-sec grow"><div class="sec-label">${t('gm.new')} <span class="soon">${t('gm.soon')}</span></div>
      <div class="gm-new">${[1, 2, 3].map(n => html`<div class="gm-ph"><span>+</span><b>${t('gm.phName', { n })}</b><span class="small">${t('gm.ph' + n)}</span></div>`)}</div></div>`}`;

  main.querySelector('[data-searchtoggle]').onclick = e => { e.currentTarget.hidden = true; const box = main.querySelector('.search-fold .search-box'); box.hidden = false; box.querySelector('input').focus(); };
  main.querySelector('[data-search]').oninput = e => {
    const q = e.target.value.trim().toLowerCase();
    main.querySelectorAll('[data-name]').forEach(el => { el.hidden = !!q && !el.dataset.name.toLowerCase().includes(q); });
  };
  main.querySelectorAll('[data-play]').forEach(b => b.onclick = () => {
    const [src, id] = b.dataset.play.split(':');
    const g = list.find(x => x.id === id && x.src === src);
    openModal({ title: g.title || t('g.' + g.type), body: '<div class="gp-host"></div>', wide: true });
    playGame(document.querySelector('.modal-back:last-child .gp-host'), g);
    countUse(g.type);
  });
  main.querySelectorAll('[data-delg]').forEach(b => b.onclick = async () => {
    const [src, id] = b.dataset.delg.split(':');
    const g = list.find(x => x.id === id && x.src === src);
    if (!(await confirmModal(t('gm.deleteConfirm', { name: g.title || t('g.' + g.type) })))) return;
    await (src === 'test' ? db.tests : db.games).remove(id);
    toast(t('ts.deleted')); games(main, query);
  });
}

async function countUse(type) {
  const s = await db.settings.get();
  await db.settings.set({ gameUse: { ...(s.gameUse || {}), [type]: ((s.gameUse || {})[type] || 0) + 1 } });
}

async function builder(main, query) {
  const existing = query.game ? await db.games.get(query.game) : null;
  const type = existing ? existing.type : query.new;
  if (!GAMES[type]) { location.hash = '#/tests?tab=games'; return; }
  let text = existing ? gameText(existing) : sample(type);
  main.innerHTML = html`
    <div class="page-head center"><div class="head-left"><h1 class="title title-md">${t('gm.builder', { type: t('g.' + type) })}</h1>${tabs('games')}</div>
      <button type="button" class="btn-k btn-md" data-save>${t('gm.save')}</button></div>
    <div class="ts-body">
      <aside class="ts-side">
        <label class="field muted">${t('gm.titlePh')}<input name="title" value="${existing ? existing.title : ''}" placeholder="${t('g.' + type)}"></label>
        <label class="field muted">${t('gm.text')}<textarea name="raw" class="mono" rows="12">${text}</textarea><span class="hint">${t('gh.' + type)}</span></label>
        <button type="button" class="link-btn" data-sample style="align-self:flex-start">${t('gm.sample')}</button>
        <div class="grow"></div>
        <div class="new-row"><label class="field muted grow">${t('gm.aiTopic')}<input name="topic" placeholder="Past Simple"></label><button type="button" class="btn-o" data-ai style="align-self:flex-end;height:42px">${t('gm.aiFill')}</button></div>
      </aside>
      <section class="ts-main"><div class="sec-label">${t('gm.preview')}</div><div class="card gp-card"><div class="gp-host"></div></div></section>
    </div>`;
  const ta = main.querySelector('[name=raw]');
  const host = main.querySelector('.gp-host');
  const draw = () => playGame(host, { type, raw: ta.value });
  let timer; ta.oninput = () => { clearTimeout(timer); timer = setTimeout(draw, 350); };
  draw();
  main.querySelector('[data-sample]').onclick = () => { ta.value = sample(type); draw(); };
  main.querySelector('[data-ai]').onclick = async e => {
    const topic = main.querySelector('[name=topic]').value.trim() || main.querySelector('[name=title]').value.trim();
    if (!topic) return toast(t('pr.topicRequired'));
    e.target.disabled = true;
    try {
      const res = await generateJSON(`[part:game]\nСоставь содержание школьной игры «${t('g.' + type)}» по теме «${topic}». Пиши ${langPrompt(lang())} (если тема на другом языке — на языке темы).\nФормат содержания: ${t('gh.' + type)}\nПример формата:\n${sample(type)}\nВерни ТОЛЬКО JSON: { "title": "короткое название", "text": "содержание в этом формате, строки через \\n" }`);
      ta.value = String(res.text || ''); if (res.title && !main.querySelector('[name=title]').value) main.querySelector('[name=title]').value = res.title;
      draw();
    } catch (err) { toast(err.message); }
    e.target.disabled = false;
  };
  main.querySelector('[data-save]').onclick = async () => {
    const data = { type, title: main.querySelector('[name=title]').value.trim() || t('g.' + type), raw: ta.value, pairs: undefined };
    if (existing) await db.games.update(existing.id, data); else await db.games.create({ lessonId: null, ...data });
    if (!existing) countUse(type);
    toast(t('gm.saved'));
    location.hash = '#/tests?tab=games';
  };
}
