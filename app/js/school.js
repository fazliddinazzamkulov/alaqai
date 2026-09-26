/* School calendar: dates, quarters, weeks and the bell schedule, in three languages. */
import { add, t, lang } from './i18n.js';

add({
  ru: {
    'date.quarter': '{n} четверть', 'date.week': '{n} неделя', 'date.today': 'сегодня',
    'date.lessonN': '{n} урок'
  },
  kk: {
    'date.quarter': '{n}-тоқсан', 'date.week': '{n}-апта', 'date.today': 'бүгін',
    'date.lessonN': '{n}-сабақ'
  },
  en: {
    'date.quarter': 'Term {n}', 'date.week': 'week {n}', 'date.today': 'today',
    'date.lessonN': 'Lesson {n}'
  }
});

const NAMES = {
  ru: {
    days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    short: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    monthsGen: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.']
  },
  kk: {
    days: ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі'],
    short: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
    monthsGen: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
    months: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'],
    monthsShort: ['қаң.', 'ақп.', 'нау.', 'сәу.', 'мам.', 'мау.', 'шіл.', 'там.', 'қыр.', 'қаз.', 'қар.', 'жел.']
  },
  en: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthsGen: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
};
const N = () => NAMES[lang()] || NAMES.ru;

export const DEFAULT_BELLS = ['08:30', '09:25', '10:20', '11:25', '12:20', '13:15'];

/* ---------- plain date helpers (local time, 'YYYY-MM-DD' strings) ---------- */

export function iso(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function today() { return iso(new Date()); }
export function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
export function weekStart(s) { const d = parse(s); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return iso(d); }
export function monthStart(s) { const d = parse(s); return iso(new Date(d.getFullYear(), d.getMonth(), 1)); }
export function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }

/* ---------- quarters ---------- */

/** Default quarter bounds of the Kazakhstan school year (month is 1-based). */
const QUARTERS = [
  { n: 1, from: [9, 1], to: [10, 31] },
  { n: 2, from: [11, 1], to: [12, 31] },
  { n: 3, from: [1, 1], to: [3, 24] },
  { n: 4, from: [3, 25], to: [8, 31] }
];

export function quarterOf(s) {
  const d = parse(s);
  const y = d.getFullYear(), m = d.getMonth() + 1;
  const schoolYear = m >= 9 ? y : y - 1;
  for (const q of QUARTERS) {
    const fy = q.from[0] >= 9 ? schoolYear : schoolYear + 1;
    const ty = q.to[0] >= 9 ? schoolYear : schoolYear + 1;
    const from = iso(new Date(fy, q.from[0] - 1, q.from[1]));
    const to = iso(new Date(ty, q.to[0] - 1, q.to[1]));
    if (s >= from && s <= to) {
      const week = Math.floor(daysBetween(weekStart(from), weekStart(s)) / 7) + 1;
      return { n: q.n, from, to, week };
    }
  }
  return { n: 1, from: s, to: s, week: 1 };
}

/* ---------- labels ---------- */

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

export function dayName(s) { return N().days[parse(s).getDay()]; }
export function dayShort(s) { return N().short[parse(s).getDay()]; }
export function monthName(s) { return N().months[parse(s).getMonth()]; }

/** "Суббота, 26 сентября" / "Сенбі, 26 қыркүйек" / "Saturday, 26 September" */
export function longDate(s) {
  const d = parse(s);
  return `${cap(N().days[d.getDay()])}, ${d.getDate()} ${N().monthsGen[d.getMonth()]}`;
}
/** "23 сент." */
export function shortDate(s) {
  const d = parse(s);
  return `${d.getDate()} ${N().monthsShort[d.getMonth()]}`;
}
/** "21–26 сентября" or "28 сентября – 3 октября" */
export function rangeLabel(a, b) {
  const x = parse(a), y = parse(b), g = N().monthsGen;
  if (x.getMonth() === y.getMonth()) return `${x.getDate()}–${y.getDate()} ${g[y.getMonth()]}`;
  return `${x.getDate()} ${g[x.getMonth()]} – ${y.getDate()} ${g[y.getMonth()]}`;
}
export function monthLabel(s) { const d = parse(s); return `${N().months[d.getMonth()]} ${d.getFullYear()}`; }

export function quarterLabel(s) {
  const q = quarterOf(s);
  return { quarter: t('date.quarter', { n: q.n }), week: t('date.week', { n: q.week }) };
}
