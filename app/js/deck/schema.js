/* Which slide templates the AI may use, the JSON shape it must return for each
 * (app/slides/player.html renders them), and a normalizer that repairs or drops
 * broken slides so a deck from the AI always opens. Pure module: no DOM. */

const S = 'строка', A = 'массив строк';

/** kind: teach — объясняет; task — ученик выполняет и получает результат. */
export const TEMPLATES = {
  title: { kind: 'teach', prompt: `{"type":"title","subject":"Предмет · класс","title":"тема (==маркер== для ключевого слова)","subtitle":"${S}","goals":["3–4 цели урока"]}` },
  notes: { kind: 'teach', prompt: `{"type":"notes","title":"${S}","definition":"**термин** — определение","points":["3–4 пункта для тетради"],"remember":"${S}"}` },
  figure: { kind: 'teach', prompt: `{"type":"figure","title":"${S}","text":"${S}","items":[{"label":"${S}","text":"${S}"}],"image_query":"английский запрос для фото","caption":"${S}"}` },
  formula: { kind: 'teach', prompt: `{"type":"formula","title":"${S}","lead":"${S}","tex":"LaTeX, например I = \\\\dfrac{q}{t}","related":["выражения из формулы в LaTeX"],"legend":[{"sym":"I","name":"${S}","unit":"${S}"}],"remember":"${S}"}` },
  example: { kind: 'teach', prompt: `{"type":"example","title":"${S}","task":"условие задачи","given":["$q = 60\\\\ Кл$"],"find":"$I$ — ?","steps":["шаги решения"],"answer":"${S}"}` },
  code: { kind: 'teach', prompt: `{"type":"code","title":"${S}","language":"python","code":"код, строки через \\n","steps":[{"line":1,"text":"объяснение строки","out":"вывод, если строка печатает"}]}` },
  flowchart: { kind: 'teach', prompt: `{"type":"flowchart","title":"${S}","blanks":false,"blocks":[{"t":"start|io|process|decision|end","text":"${S}","no":"текст ветки «нет» — только для decision"}]}` },
  compare: { kind: 'teach', prompt: `{"type":"compare","title":"${S}","columns":["2–3 столбца"],"rows":[{"label":"${S}","cells":["по ячейке на столбец"]}]}` },
  process: { kind: 'teach', prompt: `{"type":"process","title":"${S}","cycle":true,"steps":[{"title":"${S}","text":"${S}"}]}` },
  mindmap: { kind: 'teach', prompt: `{"type":"mindmap","title":"${S}","center":"${S}","branches":[{"title":"${S}","items":["${S}"]}]}` },
  timeline: { kind: 'teach', prompt: `{"type":"timeline","title":"${S}","events":[{"date":"${S}","title":"${S}","text":"${S}"}]}` },
  facts: { kind: 'teach', prompt: `{"type":"facts","title":"${S}","facts":[{"value":"число","unit":"${S}","label":"${S}"}]}` },
  rule: { kind: 'teach', prompt: `{"type":"rule","title":"${S}","rule":"${S}","tex":"LaTeX или пусто","examples":[{"text":"${S}","ok":true},{"text":"${S}","ok":false,"fix":"${S}"}]}` },
  reaction: { kind: 'teach', prompt: `{"type":"reaction","title":"${S}","eq":"Zn + 2HCl -> ZnCl2 + H2 ^","reactants":[{"f":"Zn","name":"${S}"}],"products":[{"f":"ZnCl2","name":"${S}"}],"kind":"тип реакции","note":"${S}"}` },
  lab: { kind: 'teach', prompt: `{"type":"lab","title":"${S}","goal":"${S}","equipment":["${S}"],"steps":["${S}"],"columns":[{"key":"U","name":"$U$, В"},{"key":"I","name":"$I$, А"},{"key":"R","name":"$R$, Ом","calc":"U/I"}],"rows":3,"conclusion":"${S}"}` },
  graph: { kind: 'teach', prompt: `{"type":"graph","title":"${S}","fn":"a*x^2 + b*x + c","tex":"y = ax^2 + bx + c","params":[{"name":"a","min":-3,"max":3,"step":0.5,"value":1}],"x":[-6,6],"y":[-6,10],"notes":["${S}"]}` },
  geometry: { kind: 'teach', prompt: `{"type":"geometry","title":"${S}","shape":"right-triangle|triangle|square|rectangle|parallelogram|trapezoid|circle","params":[{"name":"a","min":1,"max":8,"step":1,"value":3}],"formulas":["LaTeX"],"results":[{"name":"S","calc":"a*b/2","unit":"см²"}]}` },
  cause: { kind: 'teach', prompt: `{"type":"cause","title":"${S}","rows":[{"cause":"${S}","effect":"${S}"}]}` },
  summary: { kind: 'teach', prompt: `{"type":"summary","title":"${S}","points":["3 вывода урока"],"keywords":["${S}"],"next":"тема следующего урока"}` },
  homework: { kind: 'teach', prompt: `{"type":"homework","title":"${S}","items":[{"level":"A","text":"${S}"},{"level":"B","text":"${S}"},{"level":"C","text":"${S}"}]}` },
  reflection: { kind: 'teach', prompt: `{"type":"reflection","title":"вопрос классу","prompts":["Сегодня я узнал…","Было трудно…"]}` },
  predict: { kind: 'task', prompt: `{"type":"predict","title":"${S}","language":"python","code":"короткая программа","question":"что напечатает программа?","answer":"точный вывод программы"}` },
  codefill: { kind: 'task', prompt: `{"type":"codefill","title":"${S}","language":"python","code":"код, пропуски в [[двойных скобках]]","distractors":["2–3 неверных слова"]}` },
  parsons: { kind: 'task', prompt: `{"type":"parsons","title":"${S}","language":"python","lines":["строки программы в ПРАВИЛЬНОМ порядке, с отступами"]}` },
  steps: { kind: 'task', prompt: `{"type":"steps","title":"${S}","task":"${S}","code":"код или пусто","steps":[{"q":"вопрос шага","answer":"короткий ответ (число или слово)"}]}` },
  error: { kind: 'task', prompt: `{"type":"error","title":"${S}","code":true,"steps":["строки решения или кода"],"wrong":1,"fix":"исправленная строка","explain":"почему"}` },
  input: { kind: 'task', prompt: `{"type":"input","title":"${S}","tasks":[{"q":"${S}","answer":120,"unit":"с"}]}` },
  order: { kind: 'task', prompt: `{"type":"order","title":"${S}","items":["шаги в ПРАВИЛЬНОМ порядке"]}` },
  fill: { kind: 'task', prompt: `{"type":"fill","title":"${S}","text":"текст, пропуски в [[двойных скобках]]","distractors":["${S}"]}` },
  match: { kind: 'task', prompt: `{"type":"match","title":"${S}","pairs":[["термин","пара"]]}` },
  sort: { kind: 'task', prompt: `{"type":"sort","title":"${S}","groups":["2–3 группы"],"items":[{"text":"${S}","group":0}]}` },
  quiz: { kind: 'task', prompt: `{"type":"quiz","title":"${S}","time":20,"questions":[{"q":"${S}","options":["4 варианта"],"answer":0}]}` },
  label: { kind: 'task', prompt: `{"type":"label","title":"${S}","image_query":"английский запрос для схемы","points":[{"label":"${S}"}]}` },
  build: { kind: 'task', prompt: `{"type":"build","title":"${S}","text":"${S}","tex":"I = \\\\dfrac{[[U]]}{[[R]]}","extra":["лишние символы"]}` },
  balance: { kind: 'task', prompt: `{"type":"balance","title":"${S}","left":["Al","O2"],"right":["Al2O3"]}` }
};

const COMMON = ['title', 'notes', 'example', 'compare', 'process', 'mindmap', 'steps', 'error', 'input', 'order', 'fill', 'match', 'quiz', 'summary', 'reflection', 'homework'];
const BY_SUBJECT = [
  [/информ|ақпарат|informat|computer|программ/i, ['code', 'flowchart', 'predict', 'codefill', 'parsons']],
  [/физ|phys/i, ['formula', 'figure', 'lab', 'graph']],
  [/хим|chem/i, ['formula', 'reaction', 'balance', 'lab', 'figure']],
  [/биол|bio|жаратылыс|естеств|science/i, ['figure', 'label', 'cause', 'lab']],
  [/мат|алгеб|геом|math/i, ['formula', 'rule', 'graph', 'geometry', 'build']],
  [/геогр|geog/i, ['figure', 'facts', 'cause', 'timeline', 'label']],
  [/истор|тарих|hist/i, ['timeline', 'facts', 'cause', 'figure']]
];

/** Templates to offer for a subject (in a stable order, no duplicates). */
export function templatesFor(subject) {
  const extra = [];
  BY_SUBJECT.forEach(([re, list]) => { if (re.test(String(subject || ''))) extra.push(...list); });
  if (!extra.length) extra.push('figure', 'facts', 'timeline', 'rule');
  const set = new Set([...COMMON, ...extra]);
  return Object.keys(TEMPLATES).filter(k => set.has(k));
}

/* ---------- normalizer ---------- */

const str = v => (v == null ? '' : String(v)).trim();
const strs = v => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
const blanks = t => (String(t || '').match(/\[\[.+?\]\]/g) || []).length;

// Returns the repaired slide, or null when it cannot be shown.
const FIX = {
  title: d => ({ ...d, title: str(d.title), goals: strs(d.goals) }),
  notes: d => (str(d.title) && (strs(d.points).length || str(d.definition)) ? { ...d, points: strs(d.points) } : null),
  code: d => (str(d.code) ? { ...d, steps: Array.isArray(d.steps) ? d.steps.filter(s => s && str(s.text)) : [] } : null),
  predict: d => (str(d.code) && str(d.answer) ? d : null),
  codefill: d => (blanks(d.code) ? { ...d, distractors: strs(d.distractors) } : null),
  parsons: d => (strs(d.lines).length >= 2 ? { ...d, lines: (d.lines || []).map(l => String(l).replace(/\s+$/, '')).filter(l => l.trim()) } : null),
  steps: d => { const st = (d.steps || []).filter(s => s && str(s.q) && str(s.answer)); return st.length ? { ...d, steps: st } : null; },
  error: d => { const st = strs(d.steps), w = [].concat(d.wrong).map(Number).filter(n => n >= 0 && n < st.length); return st.length >= 2 && w.length ? { ...d, steps: st, wrong: w.length === 1 ? w[0] : w } : null; },
  input: d => { const t = (d.tasks || []).filter(x => x && str(x.q) && x.answer != null && str(x.answer)); return t.length ? { ...d, tasks: t } : null; },
  order: d => (strs(d.items).length >= 3 ? { ...d, items: strs(d.items) } : null),
  fill: d => (blanks(d.text) ? { ...d, distractors: strs(d.distractors) } : null),
  match: d => { const p = (d.pairs || []).filter(x => Array.isArray(x) && str(x[0]) && str(x[1])); return p.length >= 3 ? { ...d, pairs: p } : null; },
  sort: d => { const g = strs(d.groups), it = (d.items || []).filter(x => x && str(x.text) && Number(x.group) >= 0 && Number(x.group) < g.length); return g.length >= 2 && it.length >= 4 ? { ...d, groups: g, items: it } : null; },
  quiz: d => { const q = (d.questions || []).filter(x => x && str(x.q) && strs(x.options).length >= 2 && Number.isInteger(x.answer) && x.answer >= 0 && x.answer < strs(x.options).length); return q.length ? { ...d, questions: q } : null; },
  formula: d => (str(d.tex) ? d : null),
  example: d => (strs(d.steps).length ? d : null),
  flowchart: d => ((d.blocks || []).length >= 3 ? d : null),
  compare: d => (strs(d.columns).length >= 2 && (d.rows || []).length ? d : null),
  process: d => ((d.steps || []).length >= 2 ? d : null),
  mindmap: d => (str(d.center) && (d.branches || []).length >= 2 ? d : null),
  summary: d => (strs(d.points).length ? d : null),
  homework: d => ((d.items || []).length ? d : null),
  label: d => ((d.points || []).length >= 2 && (d.image || d.svg || d.image_query) ? d : null),
  build: d => (blanks(d.tex) ? d : null),
  balance: d => (strs(d.left).length && strs(d.right).length ? d : null)
};

/**
 * Repairs an AI deck: unknown types and broken slides are dropped; the first
 * slide is always a title (made from `topic` when missing).
 */
export function normalizeDeck(raw, { topic = '' } = {}) {
  const input = raw && Array.isArray(raw.slides) ? raw.slides : [];
  let dropped = 0;
  const slides = [];
  for (const s of input) {
    if (!s || !TEMPLATES[s.type]) { dropped++; continue; }
    const fixed = FIX[s.type] ? FIX[s.type](s) : s;
    if (!fixed) { dropped++; continue; }
    slides.push(fixed);
  }
  if (!slides.length || slides[0].type !== 'title') slides.unshift({ type: 'title', title: str(topic) || str(raw && raw.title) || '—', goals: [] });
  return { ...(raw || {}), slides, dropped };
}
