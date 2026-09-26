/* Languages of lesson materials, subjects and slide formats shared by
 * "Create lesson", presentations and tests. */
import { add, t } from '../i18n.js';

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

add({
  ru: { 'subjects': 'Английский язык|Русский язык|Казахский язык|Математика|Алгебра|Геометрия|Физика|Химия|Биология|География|История Казахстана|Всемирная история|Литература|Информатика|Естествознание|Познание мира|Самопознание' },
  kk: { 'subjects': 'Ағылшын тілі|Орыс тілі|Қазақ тілі|Математика|Алгебра|Геометрия|Физика|Химия|Биология|География|Қазақстан тарихы|Дүниежүзі тарихы|Әдебиет|Информатика|Жаратылыстану|Дүниетану|Өзін-өзі тану' },
  en: { 'subjects': 'English|Russian|Kazakh|Mathematics|Algebra|Geometry|Physics|Chemistry|Biology|Geography|History of Kazakhstan|World history|Literature|Computer science|Natural science|World around us|Self-knowledge' }
});
export function subjects() { return t('subjects').split('|'); }
