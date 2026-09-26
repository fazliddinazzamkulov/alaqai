/* Screen 18 · Noise meter: microphone level, the kind monster (sleeps while the
 * class is quiet, wakes up when it is loud — never scary), bouncing balls and a
 * silence timer that only runs while it is quiet. */

export function monsterSvg(state, size = 120) {
  const eyes = state === 'sleep'
    ? '<path d="M64 92 q12 9 24 0M112 92 q12 9 24 0M93 116 q7 5 14 0" fill="none" stroke="#16170F" stroke-width="3.5" stroke-linecap="round"/><text x="158" y="36" font-size="22" font-weight="700" font-family="Inter, sans-serif" fill="#6B6C62">z Z</text>'
    : state === 'mid'
      ? '<circle cx="76" cy="92" r="10" fill="#FFFFFF" stroke="#16170F" stroke-width="3"/><circle cx="124" cy="92" r="10" fill="#FFFFFF" stroke="#16170F" stroke-width="3"/><circle cx="76" cy="95" r="4" fill="#16170F"/><circle cx="124" cy="95" r="4" fill="#16170F"/><path d="M65 87 h22M113 87 h22M92 118 h16" stroke="#16170F" stroke-width="3.5" stroke-linecap="round"/>'
      : '<circle cx="76" cy="90" r="14" fill="#FFFFFF" stroke="#16170F" stroke-width="3"/><circle cx="124" cy="90" r="14" fill="#FFFFFF" stroke="#16170F" stroke-width="3"/><circle cx="76" cy="92" r="6" fill="#16170F"/><circle cx="124" cy="92" r="6" fill="#16170F"/><ellipse cx="100" cy="120" rx="7" ry="9" fill="#16170F"/>';
  return `<svg class="monster-svg ${state}" width="${size}" height="${Math.round(size * 0.85)}" viewBox="0 0 200 170" role="img" aria-label="monster">
    <circle cx="58" cy="52" r="14" fill="#9FD4FF" stroke="#16170F" stroke-width="3"/><circle cx="142" cy="52" r="14" fill="#9FD4FF" stroke="#16170F" stroke-width="3"/>
    <path d="M30 110 C30 60 60 40 100 40 C140 40 170 60 170 110 C170 145 145 160 100 160 C55 160 30 145 30 110 Z" fill="#BFE3FF" stroke="#16170F" stroke-width="3"/>
    <ellipse cx="62" cy="110" rx="9" ry="6" fill="#FFC7C2"/><ellipse cx="138" cy="110" rx="9" ry="6" fill="#FFC7C2"/>${eyes}</svg>`;
}

export const moodOf = (level, threshold) => (level < threshold * 0.5 ? 'sleep' : level < threshold ? 'mid' : 'loud');

/** Live microphone level 0–100. */
export class Mic {
  constructor(onLevel) { this.onLevel = onLevel; this.stream = null; this.raf = null; this.smooth = 0; }
  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.an = this.ctx.createAnalyser();
    this.an.fftSize = 1024;
    src.connect(this.an);
    const data = new Float32Array(this.an.fftSize);
    const loop = () => {
      this.an.getFloatTimeDomainData(data);
      let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const db = 20 * Math.log10(rms + 1e-8); // about −60 (silence) … 0 (very loud)
      const level = Math.max(0, Math.min(100, (db + 55) * 2.2));
      this.smooth = this.smooth * 0.85 + level * 0.15;
      this.onLevel(Math.round(this.smooth));
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }
  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(tr => tr.stop());
    if (this.ctx) this.ctx.close();
    this.stream = null; this.raf = null;
  }
}

/** Bouncing balls on a canvas; they jump higher the louder the class is. */
export class Balls {
  constructor(canvas) {
    this.c = canvas; this.level = 0;
    const colors = ['#FFB38A', '#8FD0FF', '#FFD166', '#C9B8FF', '#B8E08A', '#FFC7C2', '#D6FF3B'];
    this.balls = Array.from({ length: 16 }, (_, i) => ({ x: Math.random(), y: 1, vx: (Math.random() - 0.5) * 0.004, vy: 0, r: 9 + (i % 4) * 3, c: colors[i % colors.length] }));
    const tick = () => { this.step(); this.raf = requestAnimationFrame(tick); };
    tick();
  }
  step() {
    const c = this.c, ctx = c.getContext('2d');
    const w = c.clientWidth, h = c.clientHeight;
    if (!w) return;
    if (c.width !== w * 2) { c.width = w * 2; c.height = h * 2; }
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);
    this.balls.forEach(b => {
      const floor = h - b.r;
      if (b.y * h >= floor - 1 && Math.random() < 0.08 + this.level / 160) b.vy = -(this.level / 100) * (0.9 + Math.random() * 0.8) * 0.045;
      b.vy += 0.0018;
      b.y = Math.min(floor / h, b.y + b.vy);
      if (b.y * h >= floor) b.vy = 0;
      b.x += b.vx * (0.3 + this.level / 50);
      if (b.x < 0.03 || b.x > 0.97) b.vx *= -1;
      ctx.beginPath(); ctx.arc(b.x * w, b.y * h, b.r, 0, Math.PI * 2); ctx.fillStyle = b.c; ctx.fill();
    });
  }
  stop() { cancelAnimationFrame(this.raf); }
}
