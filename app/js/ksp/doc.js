/* KSP (short-term lesson plan) in the official Kazakhstan format: the on-screen
 * document (screen 4, the observer page) and the Word file. */
import { esc } from '../ui.js';

/** Labels language for a KSP made in materials language `l` (English lessons get the notes language). */
export function docLangOf(l, ui = 'ru') {
  const s = String(l || '');
  if (s.startsWith('en+')) return s.slice(3, 5);
  if (s === 'kk' || s === 'ru' || s === 'en') return s;
  return ui;
}

export const LABELS = {
  kk: {
    title: 'Қысқа мерзімді (сабақ) жоспары', school: 'Мектеп атауы', section: 'Бөлім:', teacher: 'Педагогтің аты-жөні:', date: 'Күні:', grade: 'Сынып:', present: 'Қатысушылар саны: ___', absent: 'Қатыспағандар саны: ___',
    topic: 'Сабақтың тақырыбы:', objectives: 'Оқу бағдарламасына сәйкес оқыту мақсаттары:', goals: 'Сабақтың мақсаты:', criteria: 'Бағалау критерийлері:', language: 'Тілдік мақсаттар:', values: 'Құндылықтарды дарыту:',
    cross: 'Пәнаралық байланыс:', prior: 'Алдыңғы білім:', course: 'Сабақтың барысы', stage: 'Сабақтың кезеңі / уақыт', tAct: 'Педагогтің әрекеті', sAct: 'Оқушының әрекеті', assess: 'Бағалау', res: 'Ресурстар',
    diff: 'Саралау', assessNote: 'Бағалау', reflection: 'Рефлексия', hw: 'Үй тапсырмасы', min: 'мин', slides: 'Слайдтар', game: 'Ойын', quiz: 'Викторина', test: 'Тест', hwLink: 'Үй тапсырмасы'
  },
  ru: {
    title: 'Краткосрочный (поурочный) план', school: 'Название школы', section: 'Раздел:', teacher: 'ФИО педагога:', date: 'Дата:', grade: 'Класс:', present: 'Количество присутствующих: ___', absent: 'отсутствующих: ___',
    topic: 'Тема урока:', objectives: 'Цели обучения в соответствии с учебной программой:', goals: 'Цели урока:', criteria: 'Критерии оценивания:', language: 'Языковые цели:', values: 'Привитие ценностей:',
    cross: 'Межпредметные связи:', prior: 'Предварительные знания:', course: 'Ход урока', stage: 'Этап урока / время', tAct: 'Действия педагога', sAct: 'Действия учащихся', assess: 'Оценивание', res: 'Ресурсы',
    diff: 'Дифференциация', assessNote: 'Оценивание', reflection: 'Рефлексия', hw: 'Домашнее задание', min: 'мин', slides: 'Слайды', game: 'Игра', quiz: 'Викторина', test: 'Тест', hwLink: 'Домашнее задание'
  },
  en: {
    title: 'Short-term (lesson) plan', school: 'School name', section: 'Unit:', teacher: 'Teacher:', date: 'Date:', grade: 'Grade:', present: 'Number present: ___', absent: 'absent: ___',
    topic: 'Lesson title:', objectives: 'Learning objectives (curriculum):', goals: 'Lesson objectives:', criteria: 'Assessment criteria:', language: 'Language objectives:', values: 'Values:',
    cross: 'Cross-curricular links:', prior: 'Previous learning:', course: 'Lesson plan', stage: 'Stage / time', tAct: 'Teacher actions', sAct: 'Student actions', assess: 'Assessment', res: 'Resources',
    diff: 'Differentiation', assessNote: 'Assessment', reflection: 'Reflection', hw: 'Homework', min: 'min', slides: 'Slides', game: 'Game', quiz: 'Quiz', test: 'Test', hwLink: 'Homework'
  }
};

const list = v => (Array.isArray(v) ? v.filter(Boolean).join('\n') : v || '');

/** All rows of the document in one place, so screen and Word stay the same. */
export function kspModel(ksp, ctx) {
  const L = LABELS[ctx.docLang] || LABELS.ru;
  const d = ctx.date ? ctx.date.split('-').reverse().join('.') : '';
  const info = [
    ['section', L.section, ksp.section || ''],
    ['teacher', L.teacher, ctx.teacher || ''],
    ['date', L.date, d],
    ['grade', `${L.grade} ${ctx.className || ''}`, `${L.present}   ${L.absent}`, true],
    ['topic', L.topic, ksp.topic || ''],
    ['learningObjectives', L.objectives, list(ksp.learningObjectives)],
    ['lessonGoals', L.goals, list(ksp.lessonGoals)],
    ['successCriteria', L.criteria, list(ksp.successCriteria)],
    ['languageGoals', L.language, ksp.languageGoals || ''],
    ['values', L.values, ksp.values || ''],
    ['crossCurricular', L.cross, ksp.crossCurricular || ''],
    ['priorKnowledge', L.prior, ksp.priorKnowledge || '']
  ].filter(r => r[3] || r[2] || ['section', 'teacher', 'date', 'topic', 'learningObjectives', 'lessonGoals'].includes(r[0]));
  // Links to the lesson materials go into the last "resources" cell.
  const extra = [];
  if (ctx.games && ctx.games.length) extra.push(`${L.game}: ${ctx.games.map(g => `«${g}»`).join(', ')}`);
  if (ctx.quiz) extra.push(`${L.quiz}: «${ctx.quiz}»`);
  if (ctx.hwLink) extra.push(`${L.hwLink}: ${ctx.hwLink}`);
  const stages = (ksp.stages || []).map((s, i, arr) => ({ ...s, resources: [s.resources, i === arr.length - 1 && extra.length && !String(s.resources || '').includes(ctx.hwLink || '§§') ? extra.join(' · ') : ''].filter(Boolean).join(' · ') }));
  const after = [['differentiation', L.diff, ksp.differentiation || ''], ['assessmentNote', L.assessNote, ksp.assessmentNote || ''], ['reflection', L.reflection, ksp.reflection || '']].filter(r => r[2]);
  return { L, info, stages, after, school: ctx.school || '' };
}

/** HTML document; `edit` makes cells contenteditable (data-k = field path). */
export function kspHtml(ksp, ctx, { edit = false } = {}) {
  const m = kspModel(ksp, ctx);
  const ce = k => (edit && k ? ` contenteditable="true" data-k="${k}"` : '');
  const cell = v => esc(v).replace(/\n/g, '<br>');
  return `<div class="ksp-doc">
    <div class="kd-school"${ce('$school')}>${cell(m.school || (edit ? `[${m.L.school}]` : ''))}</div>
    <div class="kd-title">${esc(m.L.title)}</div>
    <div class="kd-topic">${cell(ksp.topic || '')}</div>
    <div class="kd-info">${m.info.map(([k, label, v, fixed]) => `<div class="l">${esc(label)}</div><div class="v"${fixed || k === 'date' ? '' : ce(k === 'teacher' ? '$teacher' : k)}>${cell(v)}</div>`).join('')}</div>
    <div class="kd-h">${esc(m.L.course)}</div>
    <div class="kd-course">
      <div class="th">${esc(m.L.stage)}</div><div class="th">${esc(m.L.tAct)}</div><div class="th">${esc(m.L.sAct)}</div><div class="th">${esc(m.L.assess)}</div><div class="th">${esc(m.L.res)}</div>
      ${m.stages.map((s, i) => `<div${ce(`stages.${i}.stage`)}>${cell(s.stage)}${s.minutes ? ` · ${s.minutes} ${esc(m.L.min)}` : ''}</div><div${ce(`stages.${i}.teacher`)}>${cell(s.teacher)}</div><div${ce(`stages.${i}.students`)}>${cell(s.students)}</div><div${ce(`stages.${i}.assessment`)}>${cell(s.assessment)}</div><div${ce(`stages.${i}.resources`)}>${cell(s.resources)}</div>`).join('')}
    </div>
    ${m.after.length ? `<div class="kd-info after">${m.after.map(([k, label, v]) => `<div class="l">${esc(label)}</div><div class="v"${ce(k)}>${cell(v)}</div>`).join('')}</div>` : ''}
  </div>`;
}

/* ---------- Word (.docx) built by hand with JSZip ---------- */

let zipLoading = null;
function loadJSZip() {
  if (!zipLoading) zipLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = () => res(window.JSZip); s.onerror = rej; document.head.appendChild(s); });
  return zipLoading;
}

const x = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const run = (text, { b = false, sz = 22, u = false } = {}) => String(text ?? '').split('\n').map((line, i) =>
  `${i ? '<w:r><w:br/></w:r>' : ''}<w:r><w:rPr>${b ? '<w:b/>' : ''}${u ? '<w:u w:val="single"/>' : ''}<w:sz w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${x(line)}</w:t></w:r>`).join('');
const para = (inner, { center = false, after = 60 } = {}) => `<w:p><w:pPr>${center ? '<w:jc w:val="center"/>' : ''}<w:spacing w:before="0" w:after="${after}"/></w:pPr>${inner}</w:p>`;
const tc = (content, w, { b = false, shade = false, sz = 20 } = {}) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${shade ? '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>' : ''}</w:tcPr>${para(run(content, { b, sz }), { after: 0 })}</w:tc>`;
const table = (rows, widths) => `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="000000"/>`).join('')}</w:tblBorders><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(w => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${rows.join('')}</w:tbl>`;

export async function kspDocx(ksp, ctx) {
  const JSZip = await loadJSZip();
  const m = kspModel(ksp, ctx);
  const W = 10466; // A4 width minus margins, in twentieths of a point
  const infoRows = m.info.map(([, label, v]) => `<w:tr>${tc(label, 3400, { b: true })}${tc(v, W - 3400)}</w:tr>`);
  const cw = [1500, 2600, 2300, 1500, 2566];
  const courseRows = [`<w:tr>${[m.L.stage, m.L.tAct, m.L.sAct, m.L.assess, m.L.res].map((h, i) => tc(h, cw[i], { b: true, shade: true })).join('')}</w:tr>`,
    ...m.stages.map(s => `<w:tr>${[`${s.stage}${s.minutes ? ` · ${s.minutes} ${m.L.min}` : ''}`, s.teacher, s.students, s.assessment, s.resources].map((v, i) => tc(v, cw[i])).join('')}</w:tr>`)];
  const afterRows = m.after.map(([, label, v]) => `<w:tr>${tc(label, 3400, { b: true })}${tc(v, W - 3400)}</w:tr>`);
  const body = [
    m.school ? para(run(m.school, { sz: 22 }), { center: true }) : '',
    para(run(m.L.title, { b: true, sz: 28 }), { center: true }),
    para(run(ksp.topic || '', { sz: 24, u: true }), { center: true, after: 160 }),
    table(infoRows, [3400, W - 3400]),
    para(run(m.L.course, { b: true, sz: 24 }), { center: true, after: 80 }).replace('<w:spacing w:before="0"', '<w:spacing w:before="200"'),
    table(courseRows, cw),
    afterRows.length ? para('', { after: 120 }) + table(afterRows, [3400, W - 3400]) : ''
  ].join('');
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="22"/><w:lang w:val="${ctx.docLang === 'kk' ? 'kk-KZ' : ctx.docLang === 'en' ? 'en-GB' : 'ru-RU'}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`;
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('word/document.xml', doc);
  zip.file('word/styles.xml', styles);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
