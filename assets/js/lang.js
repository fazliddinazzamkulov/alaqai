/* alaqai — interface language (kk / ru / en), shared by the landing and the platform.
 *
 * Order: ?lang= in the URL → saved choice (localStorage "alaqai_lang") → browser language → ru.
 * AlaqaiLang.set(lang) saves the choice, updates <html lang> and fires "alaqai:langchange".
 */
(function () {
  'use strict';

  var SUPPORTED = ['kk', 'ru', 'en'];
  var KEY = 'alaqai_lang';
  var LABELS = { kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' };
  var NAMES = { kk: 'Қазақша', ru: 'Русский', en: 'English' };
  var current = null;

  function normalize(value) {
    var code = String(value || '').toLowerCase().slice(0, 2);
    if (code === 'kz') code = 'kk';
    return SUPPORTED.indexOf(code) >= 0 ? code : null;
  }

  function readSaved() {
    try { return normalize(localStorage.getItem(KEY)); } catch (e) { return null; }
  }

  function save(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* private mode — keep it for this page only */ }
  }

  function fromQuery() {
    try { return normalize(new URLSearchParams(location.search).get('lang')); } catch (e) { return null; }
  }

  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var lang = normalize(list[i]);
      if (lang) return lang;
    }
    return null;
  }

  function get() {
    if (current) return current;
    var fromUrl = fromQuery();
    if (fromUrl) save(fromUrl);
    current = fromUrl || readSaved() || fromBrowser() || 'ru';
    return current;
  }

  function set(value) {
    var lang = normalize(value);
    if (!lang) return get();
    current = lang;
    save(lang);
    document.documentElement.lang = lang;
    // Keep a shared ?lang= link in sync so a reload doesn't switch back.
    try {
      var url = new URL(location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', lang);
        history.replaceState(history.state, '', url);
      }
    } catch (e) { /* old browser — nothing to sync */ }
    document.dispatchEvent(new CustomEvent('alaqai:langchange', { detail: { lang: lang } }));
    return lang;
  }

  window.AlaqaiLang = { KEY: KEY, SUPPORTED: SUPPORTED, LABELS: LABELS, NAMES: NAMES, get: get, set: set };
  document.documentElement.lang = get();
})();
