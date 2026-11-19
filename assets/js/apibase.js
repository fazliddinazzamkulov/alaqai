/* Where the alaqai API is. alaqai.com is served by our own server, so /api is on
 * the same address; elsewhere (GitHub Pages, local files) it is api.alaqai.online.
 * A test server can be set with localStorage.setItem('alaqai_api', 'http://127.0.0.1:8787'). */
window.ALAQAI_API_BASE = (function () {
  try { var saved = localStorage.getItem('alaqai_api'); if (saved) return saved; } catch (e) { /* private mode */ }
  return /(^|\.)alaqai\.com$/.test(location.hostname) ? '' : 'https://api.alaqai.online';
})();
