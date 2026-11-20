/* Demo copy: made-up data for a 10th-grade web-programming class (informatics).
 * Names, results and points are invented for showing the platform — not real students.
 * window.ALAQAI_DEMO_SEED() returns { collection: rows }; dates are counted back from today. */
(function () {
  'use strict';
  var DAY = 86400000;
  function iso(daysAgo, hour) { var d = new Date(Date.now() - daysAgo * DAY); d.setHours(hour || 9, 0, 0, 0); return d.toISOString(); }
  function ymd(daysAgo) { return iso(daysAgo).slice(0, 10); }

  var CLASS = { id: 'c10a', name: '10 «А»', subject: 'Информатика' };
  var NAMES = [['Аружан Сейтқали', 'B'], ['Тимур Каримов', 'C'], ['Нұрлан Бекұлы', 'A'], ['Дана Жұмабай', 'B'], ['Әлихан Тоқтар', 'B'], ['Мадина Серік', 'C'], ['Ерасыл Қайрат', 'A'],
    ['Жансая Нұрболат', 'B'], ['Абылай Ержан', 'B'], ['Томирис Асқар', 'C'], ['Санжар Мұрат', 'A'], ['Айым Болат', 'B'], ['Бекзат Әділ', 'B'], ['Камила Рахым', 'C']];
  var students = NAMES.map(function (n, i) { return { id: 'ds' + (i + 1), classId: CLASS.id, name: n[0], level: n[1], createdAt: iso(40) }; });

  /* ---------- past lessons: short decks so they open ---------- */
  function shortDeck(title, def, points, lang, code, steps, summary, next) {
    return { lang: 'kk', slides: [
      { type: 'title', subject: 'Информатика · 10-сынып', title: title, subtitle: 'Веб-бағдарламалау', goals: points.slice(0, 3) },
      { type: 'notes', title: 'Негізгі ұғымдар', definition: def, points: points, remember: 'Тегтер жұппен жазылады: ашылатын және жабылатын' },
      { type: 'code', title: 'Кодты жол-жолымен оқимыз', language: lang, code: code, steps: steps },
      { type: 'summary', title: 'Не үйрендік?', points: summary, keywords: [], next: next }
    ] };
  }
  var PAST = [
    { id: 'dl1', days: 28, topic: 'HTML құжатының құрылымы', deck: shortDeck('==HTML== құжатының құрылымы', '**HTML** — веб-беттің мазмұны мен құрылымын сипаттайтын белгілеу тілі',
      ['<!DOCTYPE html> — құжат түрі', '<head> — бет туралы мәлімет (title)', '<body> — экранда көрінетін мазмұн'], 'html',
      '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Менің бетім</title>\n  </head>\n  <body>\n    <h1>Сәлем!</h1>\n  </body>\n</html>',
      [{ line: 1, text: 'Құжат түрі — HTML5' }, { line: 4, text: 'Браузер қойындысындағы атау' }, { line: 7, text: 'Беттегі ең үлкен тақырып' }],
      ['HTML құжаты head және body бөлімдерінен тұрады', 'title қойындыда көрінеді', 'h1 — бас тақырып'], 'Мәтін және тізім тегтері') },
    { id: 'dl2', days: 21, topic: 'Мәтін және тізім тегтері', deck: shortDeck('Мәтін және ==тізім== тегтері', '**Тізім** — элементтерді рет-ретімен немесе таңбалаумен көрсету',
      ['<p> — абзац, <b>/<i> — қалың және көлбеу', '<ul> — таңбаланған тізім', '<ol> — нөмірленген тізім, <li> — тізім элементі'], 'html',
      '<ol>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ol>',
      [{ line: 1, text: 'Нөмірленген тізім басталады' }, { line: 2, text: 'Бірінші элемент', out: '1. HTML' }, { line: 5, text: 'Тізім жабылады' }],
      ['p — абзац', 'ul және ol — тізім түрлері', 'li — тізім элементі'], 'Сілтемелер мен суреттер') },
    { id: 'dl3', days: 14, topic: 'Сілтемелер мен суреттер', deck: shortDeck('==Сілтемелер== мен суреттер', '**Сілтеме** — басқа бетке немесе файлға өтетін мәтін не сурет',
      ['<a href="..."> — сілтеме', '<img src="..." alt="..."> — сурет', 'alt — сурет ашылмаса көрінетін мәтін'], 'html',
      '<a href="https://www.alaqai.online">alaqai</a>\n<img src="cat.jpg" alt="Мысық" width="200">',
      [{ line: 1, text: 'href — сілтеме мекенжайы' }, { line: 2, text: 'src — сурет файлы, alt — сипаттамасы' }],
      ['a тегі href атрибутымен жұмыс істейді', 'img тегінің жабылатын тегі жоқ', 'alt атрибутын әрқашан жазамыз'], 'HTML кестелері') },
    { id: 'dl4', days: 7, topic: 'HTML кестелері', deck: shortDeck('HTML ==кестелері==', '**Кесте** — деректерді жолдар мен бағандарда көрсету',
      ['<table> — кесте', '<tr> — жол, <td> — ұяшық', '<th> — тақырып ұяшығы'], 'html',
      '<table border="1">\n  <tr><th>Аты</th><th>Бағасы</th></tr>\n  <tr><td>Дәптер</td><td>150</td></tr>\n</table>',
      [{ line: 2, text: 'Тақырып жолы: th ұяшықтары' }, { line: 3, text: 'Деректер жолы: td ұяшықтары' }],
      ['table ішінде tr, tr ішінде td', 'th — қалың тақырып ұяшығы', 'border — жиек'], 'CSS: селекторлар және стильдер') }
  ];

  /* ---------- the ready lesson: CSS selectors and styles ---------- */
  var deck = { lang: 'kk', slides: [
    { type: 'title', subject: 'Информатика · 10-сынып', title: '==CSS==: селекторлар және стильдер', subtitle: 'Веб-беттің сыртқы түрін безендіру', goals: ['CSS ережесінің құрылымын түсіну', 'Тег, класс және id селекторларын ажырату', 'Түс, қаріп және шегініс қасиеттерін қолдану'] },
    { type: 'quiz', title: 'Еске түсірейік', time: 20, questions: [
      { q: 'Кестенің жолын қай тег жасайды?', options: ['<td>', '<tr>', '<th>', '<table>'], answer: 1 },
      { q: 'Суретті бетке қай тег қосады?', options: ['<a>', '<pic>', '<img>', '<src>'], answer: 2 }] },
    { type: 'predict', title: 'Болжап көр', language: 'html', code: '<p style="color: red">Сәлем, әлем!</p>', question: 'Мәтін қандай түсті болады?', answer: 'қызыл' },
    { type: 'notes', title: 'CSS деген не?', definition: '**CSS** (Cascading Style Sheets) — веб-беттің сыртқы түрін сипаттайтын тіл', points: ['HTML — мазмұн, CSS — безендіру', 'Ереже: селектор { қасиет: мән; }', 'CSS <style> тегіне немесе бөлек .css файлына жазылады'], remember: 'Әр қасиеттен кейін нүктелі үтір (;) қойылады' },
    { type: 'code', title: 'Ереженің құрылымы', language: 'css', code: 'h1 {\n  color: navy;\n  font-size: 32px;\n}', steps: [{ line: 1, text: 'h1 — селектор: беттегі барлық h1 тақырыптары' }, { line: 2, text: 'color — мәтін түсі' }, { line: 3, text: 'font-size — қаріп өлшемі' }, { line: 4, text: 'Ереже жүйелі жақшамен жабылады' }] },
    { type: 'compare', title: 'Селектор түрлері', columns: ['Жазылуы', 'Нені таңдайды', 'Мысал'], rows: [
      { label: 'Тег', cells: ['p', 'барлық <p> элементтерін', 'p { color: gray; }'] },
      { label: 'Класс', cells: ['.note', 'class="note" элементтерін', '.note { background-color: yellow; }'] },
      { label: 'Идентификатор', cells: ['#logo', 'id="logo" бір элементін', '#logo { width: 120px; }'] }] },
    { type: 'notes', title: 'Негізгі қасиеттер', points: ['color — мәтін түсі, background-color — фон түсі', 'font-size, font-family — қаріп өлшемі мен түрі', 'text-align — туралау (left, center, right)', 'margin — сыртқы, padding — ішкі шегініс, border — жиек'], remember: 'Түсті атымен (red), #ff0000 немесе rgb(255, 0, 0) түрінде жазуға болады' },
    { type: 'example', title: 'Үлгі есеп', task: 'class="card" блогына ақшыл көк фон, 16px ішкі шегініс және сұр жиек бер', steps: ['.card {', '  background-color: lightblue;', '  padding: 16px;', '  border: 1px solid gray;', '}'], answer: 'Блоктың фоны көк, жиегі бар, мәтін жиектен 16px ішкері' },
    { type: 'match', title: 'Жалпы сұрақ 1: қасиет және мағынасы', pairs: [['color', 'мәтін түсі'], ['background-color', 'фон түсі'], ['font-size', 'қаріп өлшемі'], ['text-align', 'туралау']] },
    { type: 'codefill', title: 'Жалпы сұрақ 2: кодты толықтыр', language: 'css', code: '[[.]]title {\n  [[color]]: green;\n  font-size: 24px[[;]]\n}', distractors: ['#', 'size', ':'] },
    { type: 'quiz', title: 'Жалпы сұрақ 3', time: 20, questions: [{ q: '#menu селекторы нені таңдайды?', options: ['Барлық <menu> тегтерін', 'class="menu" элементтерін', 'id="menu" элементін', 'Ештеңені'], answer: 2 }] },
    { type: 'notes', title: 'Жеке жұмыс', points: ['alaqai.online/join бетіне сабақ кодымен кір', 'Өзіңе ыңғайлы әдісті таңда: қадамдап, үлгі бойынша немесе қатені тап', 'Компьютер жоқ болса — тапсырманы дәптерде орында'], remember: 'Компьютер алдында — 8 минут' },
    { type: 'summary', title: 'Не үйрендік?', points: ['CSS ережесі: селектор { қасиет: мән; }', 'Тег, .класс және #id селекторлары', 'Түс, қаріп, шегініс және жиек қасиеттері'], keywords: ['селектор', 'қасиет', 'мән', 'класс', 'id'], next: 'CSS: блоктық модель және орналасу' },
    { type: 'reflection', title: 'Сабақ саған қалай болды?', prompts: ['Бүгін мен білдім…', 'Маған қиын болды…', 'Келесі сабақта білгім келеді…'] },
    { type: 'homework', title: 'Үй тапсырмасы', items: [{ level: 'A', text: 'Өз парағыңдағы h1 мен p тегтеріне түс және қаріп өлшемін бер' }, { level: 'B', text: '«Менің хоббиім» бетіне екі класс жасап, әр түрлі фон бер' }, { level: 'C', text: 'Мәзір (nav) жасап, сілтемелерді id және класс селекторларымен безендір' }] }
  ] };

  function step(title, code, qs) { return { type: 'steps', title: title, code: code, steps: qs }; }
  var tasks = {
    common: [deck.slides[8], deck.slides[9], deck.slides[10]],
    levels: {
      A: {
        steps: [step('Селекторды анықта', 'p {\n  color: red;\n}', [{ q: 'Бұл ереженің селекторы қайсы?', answer: 'p' }, { q: 'Мәтін қандай түсті болады? (ағылшынша)', answer: 'red' }])],
        example: [{ type: 'example', title: 'Үлгі', task: 'Барлық h2 тақырыптарын көк түсті ет', steps: ['h2 {', '  color: blue;', '}'], answer: 'h2 тақырыптары көк' }, { type: 'input', title: 'Енді өзің', tasks: [{ q: 'font-size: 20px; ережесінде қаріп өлшемі неше пиксель?', answer: 20 }] }],
        error: [{ type: 'error', title: 'Қатені тап', code: true, steps: ['h1 {', '  color: green', '  font-size: 30px;', '}'], wrong: 1, fix: '  color: green;', explain: 'Әр қасиеттен кейін нүктелі үтір (;) керек' }]
      },
      B: {
        steps: [step('Класс селекторы', '.warn {\n  color: white;\n  background-color: red;\n}', [{ q: 'HTML-де элементке қандай класс жазамыз? class="…"', answer: 'warn' }, { q: 'Фон түсі қандай? (ағылшынша)', answer: 'red' }])],
        example: [{ type: 'example', title: 'Үлгі', task: 'class="price" элементтерін қалың және жасыл ет', steps: ['.price {', '  font-weight: bold;', '  color: green;', '}'], answer: 'Бағалар қалың, жасыл' }, { type: 'input', title: 'Енді өзің', tasks: [{ q: 'padding: 10px; — әр жақтан неше пиксель ішкі шегініс?', answer: 10 }] }],
        error: [{ type: 'error', title: 'Қатені тап', code: true, steps: ['#header {', '  background-color: #333;', '  text-align: centre;', '}'], wrong: 2, fix: '  text-align: center;', explain: 'CSS-те center сөзі американдық жазылуымен: center' }]
      },
      C: {
        steps: [step('Қай ереже жеңеді?', 'p { color: black; }\n.note { color: blue; }\n#first { color: red; }', [{ q: '<p class="note"> мәтіні қандай түсті?', answer: 'blue' }, { q: '<p id="first" class="note"> мәтіні қандай түсті?', answer: 'red' }])],
        example: [{ type: 'example', title: 'Үлгі', task: 'Ені 300px блокты бетте ортаға қой', steps: ['.box {', '  width: 300px;', '  margin: 0 auto;', '}'], answer: 'margin: 0 auto блокты ортаға қояды' }, { type: 'input', title: 'Енді өзің', tasks: [{ q: 'margin: 10px 20px; — сол жақ сыртқы шегініс неше px?', answer: 20 }] }],
        error: [{ type: 'error', title: 'Қатені тап', code: true, steps: ['nav a {', '  color: white;', '  text-decoration: none;', '  padding 8px 12px;', '}'], wrong: 3, fix: '  padding: 8px 12px;', explain: 'Қасиет пен мәннің арасында қос нүкте (:) болуы керек' }]
      }
    }
  };

  var ksp = {
    section: 'Веб-бағдарламалау', learningObjectives: ['CSS стильдерін қолданып веб-беттің сыртқы түрін безендіру'],
    lessonGoals: ['Барлық оқушылар: CSS ережесінің құрылымын түсінеді', 'Оқушылардың көпшілігі: тег, класс және id селекторларын қолданады', 'Кейбір оқушылар: бірнеше ереже қатар келгенде қайсысы жеңетінін түсіндіреді'],
    successCriteria: ['CSS ережесін дұрыс жазады', 'Селектор түрлерін ажыратады', 'Түс, қаріп, шегініс қасиеттерін қолданады'],
    languageGoals: 'селектор, қасиет, мән, класс, идентификатор, шегініс', values: 'Жасампаздық және жаңашылдық; еңбекқорлық және кәсіпқойлық',
    crossCurricular: 'Бейнелеу өнері — түс үйлесімі; ағылшын тілі — қасиет атаулары', priorKnowledge: 'HTML тегтері: p, h1–h6, a, img, table',
    methods: 'болжау, миға шабуыл, жалпы сұрақтар, деңгейлік саралау (A/B/C), оқушының әдіс таңдауы, формативті бағалау',
    stages: [
      { stage: 'Сабақтың басы', minutes: 3, screen: false, teacher: 'Сәлемдеседі, мақсатты таныстырады, «Еске түсірейік» сұрақтары', students: 'Сұрақтарға жауап береді', assessment: 'Ауызша кері байланыс', resources: 'Презентация 1–2 слайд' },
      { stage: 'Жаңа материал', minutes: 8, screen: false, teacher: 'Болжау тапсырмасы, CSS ережесін, селектор түрлерін және негізгі қасиеттерді түсіндіреді, үлгі есепті талдайды', students: 'Болжайды, дәптерге жазады', assessment: 'Бақылау', resources: 'Презентация 3–8 слайд' },
      { stage: 'Жалпы сұрақтар', minutes: 5, screen: false, teacher: 'Бүкіл сыныпқа 3 сұрақ қояды', students: 'Тақтада бірге шешеді', assessment: 'Бас бармақ, өзара бағалау', resources: 'Презентация 9–11 слайд' },
      { stage: 'Деңгейлік жеке жұмыс', minutes: 8, screen: true, teacher: 'Сабақ кодын береді, оқушылар картасын бақылайды, көмек сұрағандарға көмектеседі', students: 'Әдісін таңдап, деңгейлік тапсырма орындайды', assessment: 'Автоматты тексеру', resources: 'alaqai.online' },
      { stage: 'Экраннан демалыс', minutes: 3, screen: false, rest: true, teacher: 'Компьютерлерді өшіртеді, көзге жаттығу жасатады, дәптерге тапсырма береді', students: 'Көзге жаттығу, дәптерде ереже жазады', assessment: 'Дәптерді тексеру', resources: 'Дәптер' },
      { stage: 'Компьютерде практика', minutes: 10, screen: true, teacher: 'Өз парағын безендіруді тапсырады, кеңес береді', students: 'HTML бетіне CSS ережелерін жазады', assessment: 'Критерий бойынша', resources: 'Блокнот / VS Code, браузер' },
      { stage: 'Сабақтың соңы', minutes: 3, screen: false, teacher: 'Қорытынды, рефлексия, үй тапсырмасы', students: 'Рефлексия жасайды', assessment: 'Өзін-өзі бағалау', resources: 'Презентация 13–15 слайд' }
    ],
    differentiation: 'A — қадамдап, кеңеспен; B — өз бетінше; C — күрделірек және түсіндіру. Оқушы өзіне ыңғайлы әдісті таңдайды. ЖИ нәтиже бойынша ұсыныс береді, шешімді мұғалім қабылдайды. Оқушыға деңгейі көрсетілмейді.',
    assessmentNote: 'Формативті бағалау: автоматты тексеру, дәптер, өзін-өзі бағалау', health: 'Компьютер алдында 18 минут (8 + 10), арасында 3 минут экраннан демалыс және көзге жаттығу', reflection: 'Бүгін мен білдім… Маған қиын болды…'
  };

  /* ---------- results of past lessons (invented) ---------- */
  var METHODS = ['steps', 'example', 'error'];
  var seed = 11; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  var attempts = [], marks = [];
  students.forEach(function (s, si) {
    var best = METHODS[si % 3];
    PAST.forEach(function (l, li) {
      if (si === 12 && li === 1) return; // was absent
      for (var k = 0; k < 3; k++) {
        var m = k === 0 ? best : METHODS[(si + k) % 3];
        var p = { A: 0.45, B: 0.6, C: 0.74 }[s.level] + li * 0.05 + (m === best ? 0.12 : 0);
        var total = 2, correct = Math.max(0, Math.min(2, Math.round(total * (p + (rnd() - 0.5) * 0.3))));
        attempts.push({ id: 'da' + si + '-' + li + '-' + k, studentId: s.id, lessonId: l.id, classId: CLASS.id, method: m, template: 'steps', level: s.level, correct: correct, total: total, at: iso(l.days, 9) });
      }
      // notebook work checked by the teacher (points by hand) in the 2nd and 4th lessons
      if (li === 1 || li === 3) {
        var mx = 5, got = Math.max(1, Math.min(5, Math.round(mx * ({ A: 0.55, B: 0.72, C: 0.88 }[s.level] + (rnd() - 0.5) * 0.3))));
        marks.push({ id: 'dm' + si + '-' + li, lessonId: l.id, classId: CLASS.id, studentId: s.id, date: iso(l.days, 10), points: got, maxPoints: mx, note: 'Дәптердегі жұмыс' });
      }
    });
  });

  window.ALAQAI_DEMO_SEED = function () {
    var lessons = PAST.map(function (l) {
      return { id: l.id, classId: CLASS.id, topic: l.topic, subject: 'Информатика', grade: 10, lang: 'kk', date: ymd(l.days), status: 'done', createdAt: iso(l.days + 1), parts: { presentationId: 'dp-' + l.id } };
    });
    lessons.push({ id: 'dl5', classId: CLASS.id, topic: 'CSS: селекторлар және стильдер', subject: 'Информатика', grade: 10, lang: 'kk', className: CLASS.name, date: ymd(0), status: 'ready', createdAt: iso(1), parts: { presentationId: 'dp-dl5', tasksId: 'dt-dl5', kspId: 'dk-dl5' } });
    var presentations = PAST.map(function (l) { return { id: 'dp-' + l.id, lessonId: l.id, title: l.topic, lang: 'kk', deck: l.deck }; });
    presentations.push({ id: 'dp-dl5', lessonId: 'dl5', title: 'CSS: селекторлар және стильдер', lang: 'kk', deck: deck });
    var t = { id: 'dt-dl5', lessonId: 'dl5' }; for (var k in tasks) t[k] = tasks[k];
    var kk = { id: 'dk-dl5', lessonId: 'dl5' }; for (var j in ksp) kk[j] = ksp[j];
    return { classes: [CLASS], students: students, lessons: lessons, presentations: presentations, tasks: [t], ksp: [kk], attempts: attempts, marks: marks, settings: { lang: 'kk' } };
  };
  window.ALAQAI_DEMO_USER = { id: 'demo-teacher', name: 'Демо мұғалім', email: 'demo@alaqai.online', school: 'Демо мектеп', role: 'teacher', plan: 'demo', termsVersion: '2026-11-19' };
})();
