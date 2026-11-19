/* Languages of lesson materials, subjects and slide formats shared by
 * "Create lesson", presentations and tests. */
import { add, t } from '../i18n.js';
import { enhance } from '../controls.js';

add({
  ru: { 'mat.en+ru': 'English + пояснения на русском', 'mat.en+kk': 'English + пояснения на казахском' },
  kk: { 'mat.en+ru': 'English + орысша түсініктеме', 'mat.en+kk': 'English + қазақша түсініктеме' },
  en: { 'mat.en+ru': 'English + notes in Russian', 'mat.en+kk': 'English + notes in Kazakh' }
});

// `prompt` tells the model which language to write in.
const LANGS = [
  { id: 'kk', label: () => 'Қазақша', prompt: 'на казахском языке (кириллица)' },
  { id: 'ru', label: () => 'Русский', prompt: 'на русском языке' },
  { id: 'en', label: () => 'English', prompt: 'на английском языке' },
  { id: 'en+ru', label: () => t('mat.en+ru'), prompt: 'на английском языке, с короткими пояснениями грамматики и новых слов на русском' },
  { id: 'en+kk', label: () => t('mat.en+kk'), prompt: 'на английском языке, с короткими пояснениями грамматики и новых слов на казахском' },
  { id: 'uz-latn', label: () => 'Oʻzbekcha (lotin)', prompt: 'на узбекском языке, латиницей' },
  { id: 'uz-cyrl', label: () => 'Ўзбекча (кирилл)', prompt: 'на узбекском языке, кириллицей' }
];

export function materialLangs() { return LANGS.map(l => ({ id: l.id, label: l.label() })); }
export function langPrompt(id) { return (LANGS.find(l => l.id === id) || LANGS[1]).prompt; }
export function langLabel(id) { const l = LANGS.find(x => x.id === id); return l ? l.label() : id; }

/** Presentation-only languages (screen 6): kk / ru / en / uz latin / uz cyrillic. */
export const SLIDE_LANGS = ['kk', 'ru', 'en', 'uz-latn', 'uz-cyrl'];

/** Sensible default: material language follows the interface language; English lessons get notes. */
export function defaultMaterialLang(subject, uiLang) {
  if (/англ|ағылшын|english/i.test(subject || '')) return uiLang === 'kk' ? 'en+kk' : uiLang === 'en' ? 'en' : 'en+ru';
  return uiLang;
}

export const RATIOS = ['16:9', '4:3'];

// School subjects of the updated Kazakhstan curriculum (grades 1–11).
const ALL_SUBJECTS_INIT = {};
const SUBJECT_TEXTS = {
  ru: { 'subjects': 'Казахский язык|Казахская литература|Казахский язык и литература|Русский язык|Русская литература|Английский язык|Обучение грамоте|Литературное чтение|Математика|Алгебра|Геометрия|Алгебра и начала анализа|Информатика|Цифровая грамотность|Познание мира|Естествознание|Физика|Химия|Биология|География|История Казахстана|Всемирная история|Основы права|Самопознание|Художественный труд|Графика и проектирование|Музыка|Физическая культура|Начальная военная и технологическая подготовка',
        'subj.pick': 'Выберите предмет', 'subj.manual': 'Ввести предмет вручную', 'subj.manualPh': 'Название предмета' },
  kk: { 'subjects': 'Қазақ тілі|Қазақ әдебиеті|Қазақ тілі мен әдебиеті|Орыс тілі|Орыс әдебиеті|Ағылшын тілі|Сауат ашу|Әдебиеттік оқу|Математика|Алгебра|Геометрия|Алгебра және анализ бастамалары|Информатика|Цифрлық сауаттылық|Дүниетану|Жаратылыстану|Физика|Химия|Биология|География|Қазақстан тарихы|Дүниежүзі тарихы|Құқық негіздері|Өзін-өзі тану|Көркем еңбек|Графика және жобалау|Музыка|Дене шынықтыру|Алғашқы әскери және технологиялық дайындық',
        'subj.pick': 'Пәнді таңдаңыз', 'subj.manual': 'Пәнді қолмен енгізу', 'subj.manualPh': 'Пән атауы' },
  en: { 'subjects': 'Kazakh language|Kazakh literature|Kazakh language and literature|Russian language|Russian literature|English|Literacy|Literary reading|Mathematics|Algebra|Geometry|Algebra and calculus|Computer science|Digital literacy|World around us|Natural science|Physics|Chemistry|Biology|Geography|History of Kazakhstan|World history|Basics of law|Self-knowledge|Arts and crafts|Graphics and design|Music|Physical education|Basic military and technological training',
        'subj.pick': 'Choose a subject', 'subj.manual': 'Type the subject myself', 'subj.manualPh': 'Subject name' }
};
add(SUBJECT_TEXTS);
for (const l of Object.keys(SUBJECT_TEXTS)) ALL_SUBJECTS_INIT[l] = SUBJECT_TEXTS[l].subjects.split('|');
export function subjects() { return t('subjects').split('|'); }

/** The same subject in the interface language ("Ағылшын тілі" → "Английский язык"), or the value as typed. */
const ALL_SUBJECTS = ALL_SUBJECTS_INIT;
export function localSubject(value) {
  if (!value) return value;
  const list = subjects();
  if (list.includes(value)) return value;
  for (const l of ['ru', 'kk', 'en']) {
    const other = ALL_SUBJECTS[l] || [];
    const i = other.findIndex(x => x.toLowerCase() === String(value).toLowerCase());
    if (i >= 0) return list[i] || value;
  }
  return value;
}

const escA = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * Subject chooser: a list of ready subjects, or — with the check box on — a
 * field to type one. The value lives in <input name="subject">.
 */
export function subjectField(value, label, cls = 'field muted') {
  const list = subjects();
  value = localSubject(value);
  const manual = !!value && !list.includes(value);
  return `<div class="${cls} subj" data-subject>${escA(label)}
    <select data-subj-pick ${manual ? 'disabled' : ''}><option value="">${escA(t('subj.pick'))}</option>${list.map(s => `<option ${s === value ? 'selected' : ''}>${escA(s)}</option>`).join('')}</select>
    <input name="subject" value="${escA(value || '')}" maxlength="60" placeholder="${escA(t('subj.manualPh'))}" autocomplete="off" ${manual ? '' : 'hidden'}>
    <label class="subj-manual"><input type="checkbox" data-subj-manual ${manual ? 'checked' : ''}><span>${escA(t('subj.manual'))}</span></label></div>`;
}

export function bindSubject(root) {
  root.querySelectorAll('[data-subject]').forEach(box => {
    const pick = box.querySelector('[data-subj-pick]');
    const input = box.querySelector('input[name="subject"]');
    const manual = box.querySelector('[data-subj-manual]');
    const btn = () => pick.nextElementSibling && pick.nextElementSibling.classList.contains('dd') ? pick.nextElementSibling : null;
    const sync = () => {
      input.hidden = !manual.checked;
      pick.disabled = manual.checked;
      const b = btn(); if (b) { b.hidden = manual.checked; b.disabled = manual.checked; }
    };
    pick.addEventListener('change', () => { input.value = pick.value; input.dispatchEvent(new Event('input', { bubbles: true })); });
    manual.addEventListener('change', () => {
      if (manual.checked) { input.value = ''; sync(); input.focus(); }
      else { input.value = pick.value; sync(); }
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    enhance(box);
    sync();
  });
}
