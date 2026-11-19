/* The 50-template slide engine (app/slides/player.html) in an iframe, driven by postMessage. */
const SRC = new URL('../../slides/player.html', import.meta.url).href;

/**
 * Shows `deck` in `el`. Returns { el, setDeck(deck, index), goto(index), destroy() }.
 * onSlide(index) — the player changed slide; onResult(msg) — a task slide reported {template, correct, total}.
 */
export function mountPlayer(el, deck, { lang, index = 0, onSlide, onResult, onReady } = {}) {
  const f = document.createElement('iframe');
  f.dataset.player = '';
  f.title = 'alaqai slides';
  f.allow = 'fullscreen';
  // The deck is data from the AI or the teacher: the frame cannot reach this page's storage.
  f.setAttribute('sandbox', 'allow-scripts allow-popups');
  f.src = SRC;
  let ready = false, pending = { deck, index, lang };
  const send = m => { try { f.contentWindow.postMessage({ source: 'alaqai', ...m }, '*'); } catch (e) { /* frame gone */ } };
  const onMsg = e => {
    if (e.source !== f.contentWindow) return;
    const m = e.data;
    if (!m || m.source !== 'alaqai-slides') return;
    if (m.type === 'ready') { ready = true; if (pending) { send({ type: 'deck', ...pending }); pending = null; } if (onReady) onReady(); }
    else if (m.type === 'slide' && onSlide) onSlide(m.index);
    else if (m.type === 'result' && onResult) onResult(m);
  };
  window.addEventListener('message', onMsg);
  el.appendChild(f);
  return {
    el: f,
    setDeck(d, i = 0) { if (ready) send({ type: 'deck', deck: d, index: i, lang }); else pending = { deck: d, index: i, lang }; },
    goto(i) { send({ type: 'goto', index: i }); },
    destroy() { window.removeEventListener('message', onMsg); f.remove(); }
  };
}
