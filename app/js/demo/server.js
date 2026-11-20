/* Demo copy: answers the platform's /api calls inside the browser, so the demo works
 * without the alaqai server. Data lives under the 'alaqai:demo:' prefix (never mixed
 * with real lessons). The live lesson is simulated: made-up students join, answer and
 * one asks for help. AI and photo search are off in the demo. */
(function () {
  'use strict';
  var BASE = window.ALAQAI_API_BASE, PREFIX = window.ALAQAI_STORE_PREFIX;
  var LAST = 'alaqai_last_user', SAVED_LAST = 'alaqai_demo_prev_last';
  var USER = window.ALAQAI_DEMO_USER;

  function read(k) { try { return JSON.parse(localStorage.getItem(PREFIX + k) || 'null'); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* quota */ } }
  function wipe() { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PREFIX) === 0) localStorage.removeItem(k); }); } catch (e) { /* private mode */ } }

  /* ---------- fresh start on /demo/ ---------- */
  function seed() {
    wipe();
    var data = window.ALAQAI_DEMO_SEED();
    Object.keys(data).forEach(function (k) { write(k, data[k]); });
    write('__owner', USER.id); // the sync module treats this data as the demo teacher's
  }
  if (window.ALAQAI_DEMO_FRESH || !read('__owner')) seed();
  try {
    if (window.ALAQAI_DEMO_FRESH) {
      if (sessionStorage.getItem(SAVED_LAST) == null) sessionStorage.setItem(SAVED_LAST, localStorage.getItem(LAST) || '');
      history.replaceState(null, '', location.pathname + location.search.replace(/([?&])demo=1(&|$)/, '$1').replace(/[?&]$/, '') + location.hash);
    }
  } catch (e) { /* private mode */ }
  // The real app remembers the last signed-in teacher for offline work: give it back when the tab closes.
  function restoreLast() { try { var v = sessionStorage.getItem(SAVED_LAST); if (v == null) return; if (v) localStorage.setItem(LAST, v); else localStorage.removeItem(LAST); } catch (e) { /* private mode */ } }
  window.addEventListener('pagehide', restoreLast);

  function exitDemo() {
    restoreLast(); wipe();
    try { sessionStorage.removeItem('alaqai_demo'); sessionStorage.removeItem(SAVED_LAST); } catch (e) { /* private mode */ }
    location.href = '../';
  }
  window.ALAQAI_DEMO_EXIT = exitDemo;

  /* ---------- live lesson simulation ---------- */
  var METHODS = ['steps', 'example', 'error'];
  var live = null;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function openLive(lessonId) {
    var lessons = read('lessons') || [], lesson = lessons.filter(function (l) { return l.id === lessonId; })[0];
    if (!lesson) return null;
    var cls = (read('classes') || []).filter(function (c) { return c.id === lesson.classId; })[0] || {};
    var list = (read('students') || []).filter(function (s) { return s.classId === lesson.classId; });
    var now = Date.now();
    live = { code: '482615', lessonId: lessonId, classId: lesson.classId, topic: lesson.topic, className: cls.name || '', startedAt: now, screenMs: 0, tick: now,
      slide: 0, mode: 'levels', ranking: null, breakUntil: null, breakText: '', round: 0,
      students: list.map(function (s, i) {
        var absent = i === list.length - 2; // one student is not in class today
        return { id: s.id, name: s.name, level: s.level || 'B', method: null, status: 'off', correct: 0, total: 0, grade: null, online: false,
          joinAt: absent ? Infinity : now + 1500 + i * 900 + rand(0, 600), doneAt: null, helpAt: s.level === 'A' && i < 4 ? now + 9000 : null };
      }) };
    return live;
  }
  function newTask(x, now) { x.method = x.method || METHODS[Math.floor(Math.random() * 3)]; x.status = 'work'; x.doneAt = now + rand(7000, 20000) + ({ A: 5000, B: 2000, C: 0 })[x.level]; }
  function answer(x, now) {
    var total = 2, p = ({ A: 0.5, B: 0.68, C: 0.82 })[x.level];
    var correct = Math.max(0, Math.min(total, Math.round(total * (p + (Math.random() - 0.5) * 0.4))));
    x.correct += correct; x.total += total; x.status = 'done'; x.doneAt = null;
    var at = { id: 'dla' + now.toString(36) + Math.random().toString(36).slice(2, 6), lessonId: live.lessonId, classId: live.classId, studentId: x.id,
      template: 'steps', method: live.mode === 'common' ? 'common' : x.method, level: x.level, mode: live.mode, correct: correct, total: total, at: new Date(now).toISOString() };
    var rows = read('attempts') || []; rows.push(at); write('attempts', rows);
  }
  function step() {
    var now = Date.now();
    var onBreak = live.breakUntil && now < live.breakUntil;
    if (live.breakUntil && now >= live.breakUntil) live.breakUntil = null;
    if (!onBreak && live.mode !== 'notebook') live.screenMs += now - live.tick;
    live.tick = now;
    live.students.forEach(function (x) {
      if (x.status === 'off' && now >= x.joinAt) { x.online = true; newTask(x, now); }
      if (onBreak || live.mode === 'notebook' || live.mode === 'slides') return;
      if (x.helpAt && now >= x.helpAt && x.status === 'work') { x.status = 'help'; x.helpAt = null; x.doneAt = now + 12000; return; }
      if (x.status === 'help' && now >= x.doneAt) { x.status = 'work'; x.doneAt = now + 6000; return; }
      if (x.status === 'work' && x.doneAt && now >= x.doneAt) answer(x, now);
    });
  }
  function board() {
    step();
    return { code: live.code, topic: live.topic, className: live.className, slide: live.slide, mode: live.mode, ranking: live.ranking,
      breakUntil: live.breakUntil ? new Date(live.breakUntil).toISOString() : null, breakText: live.breakText,
      screenMinutes: Math.floor(live.screenMs / 60000), limit: 30, minutes: Math.floor((Date.now() - live.startedAt) / 60000),
      students: live.students.map(function (x) { return { id: x.id, name: x.name, level: x.level, method: x.method, status: x.status, correct: x.correct, total: x.total, grade: x.grade, online: x.online }; }) };
  }
  function control(b) {
    var now = Date.now();
    if (typeof b.slide === 'number') live.slide = Math.max(0, b.slide | 0);
    if (b.mode && ['levels', 'common', 'notebook', 'slides'].indexOf(b.mode) >= 0) live.mode = b.mode;
    if (b.next) { live.round++; live.students.forEach(function (x) { if (x.status === 'done') newTask(x, now); }); }
    if ('break' in b) { live.breakUntil = b.break ? now + Math.min(15, Math.max(1, Number(b.break.minutes) || 5)) * 60000 : null; live.breakText = b.break ? String(b.break.text || '') : ''; }
    if ('ranking' in b && (b.ranking === null || b.ranking === 'top5' || b.ranking === 'place')) live.ranking = b.ranking;
    if (b.level) { live.students.forEach(function (x) { if (x.id === b.level.studentId && /^[ABC]$/.test(b.level.level)) x.level = b.level.level; });
      var st = read('students') || []; st.forEach(function (s) { if (s.id === b.level.studentId && /^[ABC]$/.test(b.level.level)) s.level = b.level.level; }); write('students', st); }
    if (b.grade) live.students.forEach(function (x) { if (x.id === b.grade.studentId) x.grade = Math.min(5, Math.max(2, b.grade.grade | 0)); });
    if (b.end) { var out = board(); live = null; return out; }
    return board();
  }

  /* ---------- the fake /api ---------- */
  function reply(status, data) { return Promise.resolve(new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json' } })); }
  function handle(path, method, body) {
    var q = path.indexOf('?'), p = q < 0 ? path : path.slice(0, q);
    if (p === '/api/config') return reply(200, { googleClientId: '' });
    if (p === '/api/auth/me') return reply(200, { user: USER });
    if (p === '/api/auth/logout' || p === '/api/auth/logout-all' || p === '/api/account/terms') return reply(200, { ok: true, user: USER });
    if (p === '/api/sync') return method === 'POST' ? reply(200, { rejected: [] }) : reply(200, { records: [], rev: 1, more: false });
    if (p.indexOf('/api/ai/') === 0) return reply(503, { error: 'demo', message: 'Демо-нұсқада ЖИ өшірулі. Дайын «CSS: селекторлар және стильдер» сабағын ашып көріңіз.' });
    if (p === '/api/images/search') return reply(404, { error: 'demo' });
    if (p === '/api/live' && method === 'POST') { var s = openLive(body && body.lessonId); return s ? reply(200, { code: s.code }) : reply(404, { error: 'not_found' }); }
    var m = p.match(/^\/api\/live\/(\d+)\/(board|control)$/);
    if (m) {
      if (!live || live.code !== m[1]) return reply(404, { error: 'ended' });
      return reply(200, m[2] === 'board' ? board() : control(body || {}));
    }
    return reply(404, { error: 'demo' });
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : input && input.url;
    if (url && url.indexOf(BASE) === 0) {
      var body = null;
      try { body = init && init.body ? JSON.parse(init.body) : null; } catch (e) { body = null; }
      return handle(url.slice(BASE.length), ((init && init.method) || 'GET').toUpperCase(), body);
    }
    return realFetch(input, init);
  };

  /* ---------- banner and sign-out ---------- */
  var TXT = {
    kk: ['Демо-нұсқа', 'сынып, оқушылар мен нәтижелер ойдан алынған; ЖИ өшірулі', 'Демодан шығу'],
    ru: ['Демо-версия', 'класс, ученики и результаты вымышлены; ИИ отключён', 'Выйти из демо'],
    en: ['Demo', 'the class, students and results are made up; AI is off', 'Leave demo']
  };
  function lang() { try { return TXT[localStorage.getItem('alaqai_lang')] ? localStorage.getItem('alaqai_lang') : 'kk'; } catch (e) { return 'kk'; } }
  document.addEventListener('DOMContentLoaded', function () {
    var t = TXT[lang()];
    var bar = document.createElement('div');
    bar.className = 'demo-bar'; bar.setAttribute('role', 'note'); bar.setAttribute('data-demo-bar', '');
    bar.innerHTML = '<b>' + t[0] + '</b><span>' + t[1] + '</span><button type="button" data-demo-exit>' + t[2] + '</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.classList.add('is-demo');
    bar.querySelector('[data-demo-exit]').onclick = exitDemo;
  });
  // "Sign out" in the demo leaves the demo (there is no account to sign out of).
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-logout]')) { e.preventDefault(); e.stopImmediatePropagation(); exitDemo(); }
  }, true);
})();
