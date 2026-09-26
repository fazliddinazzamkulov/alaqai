/* Interface texts in three languages. Every module registers its own strings:
 *
 *   add({ ru: { 'home.title': '…' }, kk: { … }, en: { … } });
 *   t('home.title')            t('home.greeting', { name })
 *
 * The language itself is kept by assets/js/lang.js (shared with the landing).
 */

const dicts = { ru: {}, kk: {}, en: {} };

export function add(d) {
  for (const l of Object.keys(d)) Object.assign(dicts[l] || (dicts[l] = {}), d[l]);
}

export function lang() { return window.AlaqaiLang.get(); }
export function setLang(l) { return window.AlaqaiLang.set(l); }

export function t(key, vars) {
  const l = lang();
  let s = dicts[l][key];
  if (s == null) s = dicts.ru[key];
  if (s == null) { console.warn('i18n: missing', key); s = key; }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}

/** plural(5, 'unit.lessons') with 'урок|урока|уроков' (ru), 'lesson|lessons' (en), 'сабақ' (kk); '#' is the number. */
export function plural(n, key) {
  const forms = t(key).split('|');
  let f;
  if (lang() === 'ru' && forms.length >= 3) {
    const a = Math.abs(n) % 100, b = a % 10;
    f = a > 10 && a < 20 ? forms[2] : b > 1 && b < 5 ? forms[1] : b === 1 ? forms[0] : forms[2];
  } else {
    f = n === 1 || forms.length === 1 ? forms[0] : forms[1];
  }
  return f.replace('#', n);
}

export function locale() { return { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' }[lang()]; }

/** 4.1 → "4,1" in ru/kk, "4.1" in en. */
export function num(n, digits = 1) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString(lang() === 'en' ? 'en-GB' : 'ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function onChange(fn) {
  document.addEventListener('alaqai:langchange', () => fn(lang()));
}
