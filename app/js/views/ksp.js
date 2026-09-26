/* Screen 4 · KSP — the plan in the official format, Word download and a
 * view-only link for observers. */
import { add, t, lang } from '../i18n.js';
import { html, raw, icon, toast } from '../ui.js';
import { db } from '../data/store.js';
import { shortDate, today, addDays } from '../school.js';
import { kspHtml, kspDocx, docLangOf } from '../ksp/doc.js';

add({
  ru: {
    'ks.title': 'КСП', 'ks.none': 'КСП пока нет — он создаётся вместе с уроком.', 'ks.create': 'Создать урок', 'ks.open': 'Открыть',
    'ks.download': 'Скачать', 'ks.word': 'Скачать Word (.docx)', 'ks.wordNote': 'Внутри: план по этапам, страницы слайдов, названия игр и викторин, ссылка на ДЗ', 'ks.making': 'Готовим файл…',
    'ks.share': 'Ссылка для наблюдателей', 'ks.shareNote': 'Для коллег и администрации школы, которые хотят посмотреть план урока',
    'ks.f1': 'Только просмотр', 'ks.f2': 'Нельзя скачать, копировать и печатать', 'ks.f3': 'Слайды — только уменьшенный просмотр', 'ks.f4': 'Водяной знак с именем зрителя',
    'ks.expiry': 'Срок действия', 'ks.d1': '1 день', 'ks.d3': '3 дня', 'ks.d7': '7 дней', 'ks.d30': '30 дней', 'ks.copy': 'Копировать', 'ks.copied': 'Ссылка скопирована', 'ks.until': 'до {d}', 'ks.off': 'Ссылка выключена',
    'ks.views': 'Просмотры', 'ks.noViews': 'Пока никто не открывал.', 'ks.today': 'сегодня', 'ks.editHint': 'Нажмите на любую ячейку, чтобы исправить текст. Изменения сохраняются сами.',
    'ks.serverNote': 'Ссылка откроется у других людей, когда платформа подключится к серверной базе данных. Сейчас её можно проверить на этом устройстве.', 'ks.lesson': 'Урок'
  },
  kk: {
    'ks.title': 'ҚМЖ', 'ks.none': 'Әзірге ҚМЖ жоқ — ол сабақпен бірге құрылады.', 'ks.create': 'Сабақ құру', 'ks.open': 'Ашу',
    'ks.download': 'Жүктеу', 'ks.word': 'Word жүктеу (.docx)', 'ks.wordNote': 'Ішінде: кезеңдер бойынша жоспар, слайд беттері, ойын мен викторина атаулары, ҮТ сілтемесі', 'ks.making': 'Файл дайындалуда…',
    'ks.share': 'Бақылаушыларға сілтеме', 'ks.shareNote': 'Сабақ жоспарын көргісі келетін әріптестер мен мектеп әкімшілігіне',
    'ks.f1': 'Тек қарау', 'ks.f2': 'Жүктеуге, көшіруге, басып шығаруға болмайды', 'ks.f3': 'Слайдтар — тек кішірейтілген түрде', 'ks.f4': 'Қараушының аты жазылған су белгісі',
    'ks.expiry': 'Жарамдылық мерзімі', 'ks.d1': '1 күн', 'ks.d3': '3 күн', 'ks.d7': '7 күн', 'ks.d30': '30 күн', 'ks.copy': 'Көшіру', 'ks.copied': 'Сілтеме көшірілді', 'ks.until': '{d} дейін', 'ks.off': 'Сілтеме өшірулі',
    'ks.views': 'Қаралымдар', 'ks.noViews': 'Әзірге ешкім ашпады.', 'ks.today': 'бүгін', 'ks.editHint': 'Мәтінді түзету үшін кез келген ұяшықты басыңыз. Өзгерістер өзі сақталады.',
    'ks.serverNote': 'Сілтеме басқа адамдарда платформа серверлік дерекқорға қосылғанда ашылады. Қазір оны осы құрылғыда тексеруге болады.', 'ks.lesson': 'Сабақ'
  },
  en: {
    'ks.title': 'Lesson plans', 'ks.none': 'No lesson plans yet — one is made with every lesson.', 'ks.create': 'Create lesson', 'ks.open': 'Open',
    'ks.download': 'Download', 'ks.word': 'Download Word (.docx)', 'ks.wordNote': 'Inside: the plan by stages, slide numbers, game and quiz names, the homework link', 'ks.making': 'Preparing the file…',
    'ks.share': 'Link for observers', 'ks.shareNote': 'For colleagues and school leaders who want to see the lesson plan',
    'ks.f1': 'View only', 'ks.f2': 'No downloading, copying or printing', 'ks.f3': 'Slides as small previews only', 'ks.f4': 'Watermark with the viewer’s name',
    'ks.expiry': 'Expires after', 'ks.d1': '1 day', 'ks.d3': '3 days', 'ks.d7': '7 days', 'ks.d30': '30 days', 'ks.copy': 'Copy', 'ks.copied': 'Link copied', 'ks.until': 'until {d}', 'ks.off': 'Link is off',
    'ks.views': 'Views', 'ks.noViews': 'Nobody has opened it yet.', 'ks.today': 'today', 'ks.editHint': 'Click any cell to fix the text. Changes save themselves.',
    'ks.serverNote': 'Other people can open the link once the platform is connected to the server database. For now you can check it on this device.', 'ks.lesson': 'Lesson'
  }
});

let docLang = null;

/** Everything the document needs besides the KSP itself. */
export async function kspContext(ksp, dl) {
  const lesson = ksp.lessonId ? await db.lessons.get(ksp.lessonId) : null;
  const p = (lesson && lesson.parts) || {};
  const [cls, settings, games, quiz, hw] = await Promise.all([
    (ksp.classId || (lesson && lesson.classId)) ? db.classes.get(ksp.classId || lesson.classId) : null, db.settings.get(),
    Promise.all((p.gameIds || []).map(id => db.games.get(id))), p.quizId ? db.tests.get(p.quizId) : null, p.homeworkId ? db.homework.get(p.homeworkId) : null
  ]);
  const profile = settings.profile || {};
  return {
    lesson, docLang: dl, className: cls ? cls.name : '', date: (lesson && lesson.date) || today(),
    teacher: profile.name || '', school: profile.school || '',
    games: games.filter(Boolean).map(g => g.title), quiz: quiz && quiz.title,
    hwLink: hw ? `${location.origin}${location.pathname}#/s/${hw.id}` : ''
  };
}

export async function render(main, { query }) {
  if (!query.id) return list(main);
  const ksp = await db.ksp.get(query.id);
  if (!ksp) { location.hash = '#/ksp'; return; }
  const dl = docLang || docLangOf(ksp.lang, lang());
  const ctx = await kspContext(ksp, dl);
  const share = (await db.shares.list(s => s.kind === 'ksp' && s.refId === ksp.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const link = share ? `${location.origin}${location.pathname}#/view/${share.id}` : '';
  const alive = share && share.active && share.expiresAt >= today();
  const days = share ? share.days || 7 : 7;

  main.innerHTML = html`
    <div class="ks">
      <div class="ks-main">
        <div class="ks-top">
          <div class="small" style="font-size:14px;color:var(--ink-2)">${t('ks.title')} · ${ksp.topic || ''}${ctx.className ? ' · ' + ctx.className : ''}${ctx.lesson ? html` · <a class="link-btn" href="#/lessons?id=${ctx.lesson.id}">${t('ks.lesson')}</a>` : ''}</div>
          <div class="seg">${[['kk', 'Қаз'], ['ru', 'Рус'], ['en', 'Eng']].map(([id, label]) => html`<button type="button" data-dl="${id}" aria-selected="${id === dl}">${label}</button>`)}</div>
        </div>
        <div class="ks-paper">${raw(kspHtml(ksp, ctx, { edit: true }))}</div>
        <div class="small">${t('ks.editHint')}</div>
      </div>
      <aside class="ks-side">
        <div class="card"><div class="card-title">${t('ks.download')}</div>
          <button type="button" class="btn-k btn-md" data-word>${t('ks.word')}</button>
          <div class="small" style="line-height:1.5">${t('ks.wordNote')}</div></div>
        <div class="card">
          <div class="card-head" style="align-items:center"><span class="card-title">${t('ks.share')}</span>
            <label class="pk-toggle" aria-label="${t('ks.share')}"><input type="checkbox" data-share ${alive ? 'checked' : ''}><i></i></label></div>
          <div class="small" style="font-size:13px;line-height:1.5;color:var(--ink-2)">${t('ks.shareNote')}</div>
          <div class="ks-feats">${['f1', 'f2', 'f3', 'f4'].map(f => html`<span>${icon('check', 16, 'style="color:var(--up)"')}${t('ks.' + f)}</span>`)}</div>
          <div class="pn-row"><span style="color:var(--ink-2)">${t('ks.expiry')}</span><select class="pill-sel" data-days>${[1, 3, 7, 30].map(d => html`<option value="${d}" ${d === days ? 'selected' : ''}>${t('ks.d' + d)}</option>`)}</select></div>
          ${alive ? html`<div class="ks-link"><input readonly value="${link}" aria-label="${t('ks.share')}"><button type="button" class="btn-o" data-copy>${t('ks.copy')}</button></div>
            <div class="small">${t('ks.until', { d: shortDate(share.expiresAt) })} · ${t('ks.serverNote')}</div>` : html`<div class="small">${t('ks.off')}</div>`}
        </div>
        <div class="card"><div class="card-title">${t('ks.views')}</div>
          ${share && (share.views || []).length ? share.views.slice().reverse().slice(0, 8).map(v => html`<div class="pn-row"><span>${v.name}</span><span class="small">${v.at.slice(0, 10) === today() ? t('ks.today') + ', ' + v.at.slice(11, 16) : shortDate(v.at.slice(0, 10))}</span></div>`) : html`<p class="muted-note">${t('ks.noViews')}</p>`}
        </div>
      </aside>
    </div>`;

  main.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { docLang = b.dataset.dl; render(main, { query }); });
  // Editing the document in place
  let timer;
  main.querySelector('.ks-paper').addEventListener('input', e => {
    const el = e.target.closest('[data-k]'); if (!el) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const k = el.dataset.k, v = el.innerText.trim();
      if (k === '$school' || k === '$teacher') {
        const s = await db.settings.get();
        await db.settings.set({ profile: { ...(s.profile || {}), [k === '$school' ? 'school' : 'name']: v } });
        return;
      }
      const cur = await db.ksp.get(ksp.id);
      if (k.startsWith('stages.')) {
        const [, i, f] = k.split('.');
        const stages = [...(cur.stages || [])];
        let val = v;
        if (f === 'stage') { const mm = v.match(/^(.*?)\s*·\s*(\d+)\s*\S*$/); if (mm) { val = mm[1]; stages[i] = { ...stages[i], minutes: Number(mm[2]) }; } }
        stages[i] = { ...stages[i], [f]: val };
        await db.ksp.update(ksp.id, { stages });
      } else if (['learningObjectives', 'lessonGoals', 'successCriteria'].includes(k)) await db.ksp.update(ksp.id, { [k]: v.split('\n').map(x => x.trim()).filter(Boolean) });
      else await db.ksp.update(ksp.id, { [k]: v });
    }, 500);
  });
  main.querySelector('[data-word]').onclick = async e => {
    const b = e.currentTarget; b.disabled = true; b.textContent = t('ks.making');
    try {
      const fresh = await db.ksp.get(ksp.id);
      const blob = await kspDocx(fresh, await kspContext(fresh, dl));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `KSP ${(fresh.topic || 'alaqai').replace(/[\\/:*?"<>|]/g, ' ').slice(0, 60)}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch (err) { console.error(err); toast(t('ai.err.offline')); }
    b.disabled = false; b.textContent = t('ks.word');
  };
  const setShare = async (on, d) => {
    if (share) await db.shares.update(share.id, { active: on, days: d, expiresAt: addDays(today(), d) });
    else if (on) await db.shares.create({ kind: 'ksp', refId: ksp.id, active: true, days: d, expiresAt: addDays(today(), d), views: [] });
    render(main, { query });
  };
  main.querySelector('[data-share]').onchange = e => setShare(e.target.checked, days);
  main.querySelector('[data-days]').onchange = e => setShare(alive || !share, Number(e.target.value));
  const cp = main.querySelector('[data-copy]');
  if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(link); } catch (err) { main.querySelector('.ks-link input').select(); document.execCommand('copy'); } toast(t('ks.copied')); };
}

async function list(main) {
  const [items, lessons, classes] = await Promise.all([db.ksp.list(), db.lessons.list(), db.classes.list()]);
  items.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  const lessonOf = new Map(lessons.map(l => [l.id, l]));
  const clsName = new Map(classes.map(c => [c.id, c.name]));
  main.innerHTML = html`
    <div class="page-head center"><h1 class="title title-md">${t('ks.title')}</h1><a class="btn-k btn-md" href="#/new">${icon('plus', 14)}${t('ks.create')}</a></div>
    ${items.length ? html`<div class="card" style="gap:0">${items.map(k => {
      const l = lessonOf.get(k.lessonId);
      return html`<a class="row-link" href="#/ksp?id=${k.id}"><b style="font-weight:600">${k.topic || '—'}</b><span class="small">${[clsName.get(k.classId || (l && l.classId)), l && l.date ? shortDate(l.date) : ''].filter(Boolean).join(' · ')}</span></a>`;
    })}</div>` : html`<div class="empty"><p>${t('ks.none')}</p><div class="row"><a class="btn-k" href="#/new">${t('ks.create')}</a></div></div>`}`;
}
