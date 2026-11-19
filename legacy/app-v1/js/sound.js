/* Short sounds made in the browser (no files to download): clicks, right and
 * wrong answers, a win, wheel and drum ticks, the timer's last seconds and its
 * alarm. One switch turns all of them off (kept in this browser). */

let ctx = null;
const KEY = 'alaqai_sound';

export function soundOn() { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } }
export function setSound(on) { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* private mode */ } }

function ac() {
  if (!soundOn()) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}

/** One tone: frequency (Hz), start offset and length (s), wave, loudness. */
function tone(f, at = 0, len = 0.12, type = 'sine', vol = 0.18, slideTo = null) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + len);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  o.connect(g); g.connect(a.destination);
  o.start(t0); o.stop(t0 + len + 0.02);
}

function noiseBurst(at = 0, len = 0.04, vol = 0.12) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + at;
  const buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * len)), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 1800;
  g.gain.value = vol; s.buffer = buf;
  s.connect(f); f.connect(g); g.connect(a.destination);
  s.start(t0);
}

export const sfx = {
  click: () => tone(660, 0, 0.05, 'triangle', 0.08),
  tick: () => noiseBurst(0, 0.025, 0.16),
  drum: () => { tone(90, 0, 0.09, 'sine', 0.25, 50); noiseBurst(0, 0.03, 0.06); },
  right: () => { tone(660, 0, 0.12, 'triangle'); tone(990, 0.1, 0.18, 'triangle'); },
  wrong: () => { tone(220, 0, 0.18, 'sawtooth', 0.08, 160); tone(165, 0.14, 0.22, 'sawtooth', 0.07, 120); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, i === 3 ? 0.45 : 0.14, 'triangle', 0.2)),
  reveal: () => { tone(784, 0, 0.12, 'triangle', 0.18); tone(1175, 0.1, 0.3, 'triangle', 0.18); },
  flip: () => tone(420, 0, 0.12, 'sine', 0.12, 900),
  start: () => { tone(523, 0, 0.1, 'sine', 0.15); tone(784, 0.09, 0.14, 'sine', 0.15); },
  count: () => tone(880, 0, 0.09, 'square', 0.06),
  alarm: () => { for (let i = 0; i < 3; i++) { tone(988, i * 0.42, 0.16, 'square', 0.1); tone(1319, i * 0.42 + 0.17, 0.2, 'square', 0.1); } },
  shh: () => tone(300, 0, 0.5, 'sine', 0.08, 240)
};

/** Ticks while a wheel or drum spins: fast at first, slowing down over `ms`. */
export function spinTicks(ms, kind = 'tick') {
  if (!soundOn()) return () => {};
  let stopped = false, elapsed = 0;
  const step = () => {
    if (stopped || elapsed >= ms) return;
    (kind === 'drum' ? sfx.drum : sfx.tick)();
    const p = elapsed / ms;
    const gap = 45 + p * p * 330;
    elapsed += gap;
    setTimeout(step, gap);
  };
  step();
  return () => { stopped = true; };
}
