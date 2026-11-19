/* Legal pages: show the Kazakh or Russian text (English readers get Russian). */
(function () {
  var L = window.AlaqaiLang;
  function paint() {
    var l = (L && L.get()) || 'kk';
    var shown = l === 'kk' ? 'kk' : 'ru';
    document.documentElement.lang = shown;
    document.querySelectorAll('[data-l]').forEach(function (el) { el.classList.toggle('on', el.getAttribute('data-l') === shown); });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === shown)); });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-lang]'); if (b && L) { L.set(b.getAttribute('data-lang')); paint(); } });
  window.addEventListener('alaqai:langchange', paint);
  paint();
})();
