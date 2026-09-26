/* Screens 10–11: homework list with the "new assignment" form, and the review
 * of one assignment (online test results, or notebook photos checked with AI
 * help and graded by the teacher). */
import { add, t, lang, num } from '../i18n.js';
import { html, raw, esc, icon, segmented, toast, openModal, copyText } from '../ui.js';
import { db } from '../data/store.js';
import { today, addDays, shortDate } from '../school.js';
import { hwLink, hwStudents, hwCounts, isOpen, qrSvg, saveHwMark, questionStats } from '../hw.js';
import { normQ, rightAnswer, gradeOf } from '../testlogic.js';
import { generateJSON, AiError } from '../ai.js';
import { currentPlan } from '../plans.js';

add({
  ru: {
    'hw.title': 'Домашние задания', 'hw.active': 'Активные', 'hw.waiting': 'Ждут проверки', 'hw.done': 'Завершённые',
    'hw.online': 'Онлайн-тест', 'hw.paper': 'На бумаге · фото', 'hw.draft': 'Черновик', 'hw.c.auto': 'Проверяется автоматически', 'hw.c.ai': 'ИИ помогает, оценку ставите вы', 'hw.c.self': 'Проверяете сами',
    'hw.until': 'до {d}', 'hw.finished': 'завершено {d}', 'hw.handed': 'Сдали {n} из {total}', 'hw.avgRes': 'Средний результат {p}', 'hw.notYet': 'Не сдали: {n}', 'hw.results': 'Результаты →',
    'hw.checkedN': 'Проверено {n}', 'hw.waitN': 'Ждут вашей проверки: {n}', 'hw.check': 'Проверить →', 'hw.send': 'Отправить →', 'hw.draftNote': 'Создано вместе с уроком — выберите класс и срок и отправьте',
    'hw.empty.active': 'Активных заданий нет', 'hw.empty.waiting': 'Нечего проверять — все работы проверены', 'hw.empty.done': 'Завершённых заданий пока нет', 'hw.emptyNote': 'Задайте онлайн-тест или задание в тетради в форме справа.',
    'hw.new': 'Новое задание', 'hw.edit': 'Черновик задания', 'hw.onlineSub': 'Ученики решают по ссылке, проверка сама', 'hw.paperK': 'На бумаге', 'hw.paperSub': 'Решают в тетради, присылают фото',
    'hw.material': 'Материал', 'hw.pick': 'Выберите тест', 'hw.m.test': 'Тест: {t}', 'hw.m.hw': 'ДЗ урока: {t}', 'hw.m.none': 'Нет готовых тестов — создайте в «Тестах»', 'hw.makeTest': 'Создать тест',
    'hw.task': 'Задание', 'hw.taskPh': 'Например: задачи §12, № 1–4', 'hw.instr': 'Что сделать', 'hw.instrPh': 'Коротко для ученика: что решить и как прислать фото',
    'hw.to': 'Кому', 'hw.pickStudents': 'Выбрать учеников', 'hw.nStudents': 'Учеников: {n}', 'hw.noClasses': 'Сначала добавьте класс', 'hw.due': 'Срок сдачи', 'hw.checker': 'Кто проверяет', 'hw.k.auto': 'Автоматически', 'hw.k.ai': 'ИИ + я', 'hw.k.self': 'Сам',
    'hw.showAnswers': 'Показать ответы после сдачи', 'hw.shuffle': 'Перемешать вопросы', 'hw.sendBtn': 'Отправить ученикам', 'hw.saveDraft': 'Сохранить черновик', 'hw.link': 'Ссылка для класса', 'hw.linkAfter': 'появится после отправки', 'hw.qr': 'QR-код', 'hw.copy': 'Копировать', 'hw.copied': 'Ссылка скопирована',
    'hw.err.class': 'Выберите класс', 'hw.err.material': 'Выберите тест для онлайн-задания', 'hw.err.task': 'Напишите задание', 'hw.err.students': 'Выберите хотя бы одного ученика', 'hw.sent': 'Задание отправлено — поделитесь ссылкой с классом', 'hw.saved': 'Черновик сохранён',
    'hw.qrTitle': 'QR-код для класса', 'hw.qrNote': 'Покажите на экране — ученики откроют задание с телефона.', 'hw.studentsTitle': 'Кому отправить', 'hw.all': 'Весь класс', 'hw.local': 'Пока данные хранятся в этом браузере, ссылка работает на этом устройстве. После подключения базы — у всех учеников.',
    'hw.crumb': 'Проверка', 'hw.st.handed': 'Сдали', 'hw.st.checked': 'Проверено', 'hw.st.left': 'осталось {n}', 'hw.st.avg': 'Средняя оценка', 'hw.st.of5': 'из 5', 'hw.st.hardest': 'Труднее всего', 'hw.st.of': 'из {n}',
    'hw.student': 'Ученик', 'hw.status': 'Статус', 'hw.s.check': 'Проверить', 'hw.s.grade': 'Оценка {g}', 'hw.s.none': 'Не сдал', 'hw.q': 'Вопрос {n}', 'hw.task3': 'Задача {n}',
    'hw.sentAt': 'прислал(а) {d}', 'hw.photos': '{n} фото', 'hw.noSub': 'Работа ещё не сдана', 'hw.noSubNote': 'Отправьте ученику ссылку ещё раз — она в кнопке «Ссылка для класса».', 'hw.noPhotos': 'Фото нет',
    'hw.aiChecked': 'ИИ проверил', 'hw.autoChecked': 'Проверено автоматически', 'hw.suggest': 'Предлагаемая оценка: {g}', 'hw.aiRun': 'Проверить с ИИ', 'hw.aiReady': 'ИИ посмотрит фото и предложит оценку', 'hw.aiRunning': 'ИИ смотрит фото…', 'hw.aiPlan': 'Проверка фото с ИИ — в тарифе Стандарт', 'hw.selfNote': 'Вы выбрали проверять сами — ИИ не подключается.',
    'hw.right': 'верно {n} из {total}', 'hw.mistakes': 'Ошибки: {list}', 'hw.allRight': 'Все ответы верные', 'hw.openQ': 'Открытые ответы проверьте сами: {list}',
    'hw.yourGrade': 'Ваша оценка', 'hw.comment': 'Комментарий ученику', 'hw.saveNext': 'Сохранить и следующий →', 'hw.saveOnly': 'Сохранить', 'hw.gradeFirst': 'Поставьте оценку', 'hw.gradeSaved': 'Оценка сохранена в журнал',
    'hw.given': 'Ответ ученика', 'hw.correct': 'Правильно', 'hw.noAnswer': 'нет ответа', 'hw.notFound': 'Задание не найдено', 'hw.back': 'К заданиям', 'hw.delete': 'Удалить задание', 'hw.remind': 'Скопировать ссылку',
    'hw.allChecked': 'Все сданные работы проверены'
  },
  kk: {
    'hw.title': 'Үй тапсырмалары', 'hw.active': 'Белсенді', 'hw.waiting': 'Тексеруді күтуде', 'hw.done': 'Аяқталған',
    'hw.online': 'Онлайн-тест', 'hw.paper': 'Қағазда · фото', 'hw.draft': 'Жоба', 'hw.c.auto': 'Автоматты тексеріледі', 'hw.c.ai': 'ЖИ көмектеседі, бағаны сіз қоясыз', 'hw.c.self': 'Өзіңіз тексересіз',
    'hw.until': '{d} дейін', 'hw.finished': '{d} аяқталды', 'hw.handed': '{total} оқушының {n}-і тапсырды', 'hw.avgRes': 'Орташа нәтиже {p}', 'hw.notYet': 'Тапсырмағандар: {n}', 'hw.results': 'Нәтижелер →',
    'hw.checkedN': 'Тексерілді {n}', 'hw.waitN': 'Сіздің тексеруіңізді күтуде: {n}', 'hw.check': 'Тексеру →', 'hw.send': 'Жіберу →', 'hw.draftNote': 'Сабақпен бірге құрылды — сынып пен мерзімді таңдап, жіберіңіз',
    'hw.empty.active': 'Белсенді тапсырма жоқ', 'hw.empty.waiting': 'Тексеретін жұмыс жоқ — бәрі тексерілді', 'hw.empty.done': 'Аяқталған тапсырма әзірге жоқ', 'hw.emptyNote': 'Оң жақтағы формада онлайн-тест немесе дәптерге тапсырма беріңіз.',
    'hw.new': 'Жаңа тапсырма', 'hw.edit': 'Тапсырма жобасы', 'hw.onlineSub': 'Оқушылар сілтеме арқылы шешеді, тексеру автоматты', 'hw.paperK': 'Қағазда', 'hw.paperSub': 'Дәптерде шешіп, фото жібереді',
    'hw.material': 'Материал', 'hw.pick': 'Тестті таңдаңыз', 'hw.m.test': 'Тест: {t}', 'hw.m.hw': 'Сабақтың ҮТ: {t}', 'hw.m.none': 'Дайын тест жоқ — «Тестер» бөлімінде құрыңыз', 'hw.makeTest': 'Тест құру',
    'hw.task': 'Тапсырма', 'hw.taskPh': 'Мысалы: §12 есептер, № 1–4', 'hw.instr': 'Не істеу керек', 'hw.instrPh': 'Оқушыға қысқаша: не шешу керек және фотоны қалай жіберу керек',
    'hw.to': 'Кімге', 'hw.pickStudents': 'Оқушыларды таңдау', 'hw.nStudents': 'Оқушылар: {n}', 'hw.noClasses': 'Алдымен сынып қосыңыз', 'hw.due': 'Тапсыру мерзімі', 'hw.checker': 'Кім тексереді', 'hw.k.auto': 'Автоматты', 'hw.k.ai': 'ЖИ + мен', 'hw.k.self': 'Өзім',
    'hw.showAnswers': 'Тапсырғаннан кейін жауаптарды көрсету', 'hw.shuffle': 'Сұрақтарды араластыру', 'hw.sendBtn': 'Оқушыларға жіберу', 'hw.saveDraft': 'Жобаны сақтау', 'hw.link': 'Сыныпқа сілтеме', 'hw.linkAfter': 'жібергеннен кейін пайда болады', 'hw.qr': 'QR-код', 'hw.copy': 'Көшіру', 'hw.copied': 'Сілтеме көшірілді',
    'hw.err.class': 'Сыныпты таңдаңыз', 'hw.err.material': 'Онлайн-тапсырма үшін тестті таңдаңыз', 'hw.err.task': 'Тапсырманы жазыңыз', 'hw.err.students': 'Кемінде бір оқушыны таңдаңыз', 'hw.sent': 'Тапсырма жіберілді — сілтемені сыныппен бөлісіңіз', 'hw.saved': 'Жоба сақталды',
    'hw.qrTitle': 'Сыныпқа арналған QR-код', 'hw.qrNote': 'Экранға шығарыңыз — оқушылар тапсырманы телефоннан ашады.', 'hw.studentsTitle': 'Кімге жіберу', 'hw.all': 'Бүкіл сынып', 'hw.local': 'Әзірге деректер осы браузерде сақталады, сілтеме осы құрылғыда ашылады. Дерекқор қосылғаннан кейін — барлық оқушыда.',
    'hw.crumb': 'Тексеру', 'hw.st.handed': 'Тапсырды', 'hw.st.checked': 'Тексерілді', 'hw.st.left': '{n} қалды', 'hw.st.avg': 'Орташа баға', 'hw.st.of5': '/ 5', 'hw.st.hardest': 'Ең қиыны', 'hw.st.of': '/ {n}',
    'hw.student': 'Оқушы', 'hw.status': 'Күйі', 'hw.s.check': 'Тексеру', 'hw.s.grade': 'Баға {g}', 'hw.s.none': 'Тапсырмады', 'hw.q': '{n}-сұрақ', 'hw.task3': '{n}-есеп',
    'hw.sentAt': '{d} жіберді', 'hw.photos': '{n} фото', 'hw.noSub': 'Жұмыс әлі тапсырылмаған', 'hw.noSubNote': 'Оқушыға сілтемені қайта жіберіңіз — ол «Сыныпқа сілтеме» батырмасында.', 'hw.noPhotos': 'Фото жоқ',
    'hw.aiChecked': 'ЖИ тексерді', 'hw.autoChecked': 'Автоматты тексерілді', 'hw.suggest': 'Ұсынылатын баға: {g}', 'hw.aiRun': 'ЖИ-мен тексеру', 'hw.aiReady': 'ЖИ фотоны қарап, баға ұсынады', 'hw.aiRunning': 'ЖИ фотоны қарап жатыр…', 'hw.aiPlan': 'Фотоны ЖИ-мен тексеру — Стандарт тарифінде', 'hw.selfNote': 'Өзіңіз тексеруді таңдадыңыз — ЖИ қосылмайды.',
    'hw.right': '{total} сұрақтың {n}-і дұрыс', 'hw.mistakes': 'Қателер: {list}', 'hw.allRight': 'Барлық жауап дұрыс', 'hw.openQ': 'Ашық жауаптарды өзіңіз тексеріңіз: {list}',
    'hw.yourGrade': 'Сіздің бағаңыз', 'hw.comment': 'Оқушыға пікір', 'hw.saveNext': 'Сақтап, келесіге →', 'hw.saveOnly': 'Сақтау', 'hw.gradeFirst': 'Баға қойыңыз', 'hw.gradeSaved': 'Баға журналға сақталды',
    'hw.given': 'Оқушы жауабы', 'hw.correct': 'Дұрысы', 'hw.noAnswer': 'жауап жоқ', 'hw.notFound': 'Тапсырма табылмады', 'hw.back': 'Тапсырмаларға', 'hw.delete': 'Тапсырманы жою', 'hw.remind': 'Сілтемені көшіру',
    'hw.allChecked': 'Тапсырылған жұмыстардың бәрі тексерілді'
  },
  en: {
    'hw.title': 'Homework', 'hw.active': 'Active', 'hw.waiting': 'To check', 'hw.done': 'Finished',
    'hw.online': 'Online test', 'hw.paper': 'On paper · photo', 'hw.draft': 'Draft', 'hw.c.auto': 'Checked automatically', 'hw.c.ai': 'AI helps, you give the grade', 'hw.c.self': 'You check it',
    'hw.until': 'due {d}', 'hw.finished': 'finished {d}', 'hw.handed': '{n} of {total} handed in', 'hw.avgRes': 'Average result {p}', 'hw.notYet': 'Not handed in: {n}', 'hw.results': 'Results →',
    'hw.checkedN': 'Checked {n}', 'hw.waitN': 'Waiting for you: {n}', 'hw.check': 'Check →', 'hw.send': 'Send →', 'hw.draftNote': 'Made with the lesson — choose the class and the deadline, then send it',
    'hw.empty.active': 'No active homework', 'hw.empty.waiting': 'Nothing to check — all work is checked', 'hw.empty.done': 'No finished homework yet', 'hw.emptyNote': 'Set an online test or a notebook task in the form on the right.',
    'hw.new': 'New assignment', 'hw.edit': 'Draft assignment', 'hw.onlineSub': 'Students solve it by link, checked automatically', 'hw.paperK': 'On paper', 'hw.paperSub': 'They solve it in a notebook and send a photo',
    'hw.material': 'Material', 'hw.pick': 'Choose a test', 'hw.m.test': 'Test: {t}', 'hw.m.hw': 'Lesson homework: {t}', 'hw.m.none': 'No tests yet — make one in “Tests”', 'hw.makeTest': 'Make a test',
    'hw.task': 'Task', 'hw.taskPh': 'For example: problems §12, № 1–4', 'hw.instr': 'What to do', 'hw.instrPh': 'Briefly for the student: what to solve and how to send the photo',
    'hw.to': 'To', 'hw.pickStudents': 'Choose students', 'hw.nStudents': 'Students: {n}', 'hw.noClasses': 'Add a class first', 'hw.due': 'Deadline', 'hw.checker': 'Who checks', 'hw.k.auto': 'Automatic', 'hw.k.ai': 'AI + me', 'hw.k.self': 'Me',
    'hw.showAnswers': 'Show answers after handing in', 'hw.shuffle': 'Shuffle questions', 'hw.sendBtn': 'Send to students', 'hw.saveDraft': 'Save draft', 'hw.link': 'Class link', 'hw.linkAfter': 'appears after sending', 'hw.qr': 'QR code', 'hw.copy': 'Copy', 'hw.copied': 'Link copied',
    'hw.err.class': 'Choose a class', 'hw.err.material': 'Choose a test for online homework', 'hw.err.task': 'Write the task', 'hw.err.students': 'Choose at least one student', 'hw.sent': 'Homework sent — share the link with the class', 'hw.saved': 'Draft saved',
    'hw.qrTitle': 'QR code for the class', 'hw.qrNote': 'Show it on the screen — students open the homework on their phones.', 'hw.studentsTitle': 'Send to', 'hw.all': 'Whole class', 'hw.local': 'Data is stored in this browser for now, so the link works on this device. Once the database is connected, it works for every student.',
    'hw.crumb': 'Review', 'hw.st.handed': 'Handed in', 'hw.st.checked': 'Checked', 'hw.st.left': '{n} left', 'hw.st.avg': 'Average grade', 'hw.st.of5': 'of 5', 'hw.st.hardest': 'Hardest', 'hw.st.of': 'of {n}',
    'hw.student': 'Student', 'hw.status': 'Status', 'hw.s.check': 'Check', 'hw.s.grade': 'Grade {g}', 'hw.s.none': 'Not handed in', 'hw.q': 'Question {n}', 'hw.task3': 'Problem {n}',
    'hw.sentAt': 'sent {d}', 'hw.photos': '{n} photos', 'hw.noSub': 'Not handed in yet', 'hw.noSubNote': 'Send the student the link again — it is under “Class link”.', 'hw.noPhotos': 'No photos',
    'hw.aiChecked': 'AI checked', 'hw.autoChecked': 'Checked automatically', 'hw.suggest': 'Suggested grade: {g}', 'hw.aiRun': 'Check with AI', 'hw.aiReady': 'AI looks at the photos and suggests a grade', 'hw.aiRunning': 'AI is looking at the photos…', 'hw.aiPlan': 'Photo checking with AI comes with Standard', 'hw.selfNote': 'You chose to check it yourself — AI is off.',
    'hw.right': '{n} of {total} correct', 'hw.mistakes': 'Mistakes: {list}', 'hw.allRight': 'All answers are correct', 'hw.openQ': 'Check the open answers yourself: {list}',
    'hw.yourGrade': 'Your grade', 'hw.comment': 'Comment for the student', 'hw.saveNext': 'Save and next →', 'hw.saveOnly': 'Save', 'hw.gradeFirst': 'Choose a grade', 'hw.gradeSaved': 'Grade saved to the register',
    'hw.given': 'Student’s answer', 'hw.correct': 'Correct', 'hw.noAnswer': 'no answer', 'hw.notFound': 'Homework not found', 'hw.back': 'Back to homework', 'hw.delete': 'Delete homework', 'hw.remind': 'Copy the link',
    'hw.allChecked': 'All handed-in work is checked'
  }
});

export async function render(main, { args, query }) {
  if (args[0]) return review(main, args[0], query);
  if (query.id) {
    const hw = await db.homework.get(query.id);
    if (hw && hw.status !== 'draft') { location.replace('#/homework/' + hw.id); return; }
  }
  return list(main, query);
}

/* ================= Screen 10: list + new assignment ================= */

const dateOf = d => shortDate(d).replace(/\.$/, '');

async function list(main, query) {
  const [homework, subs, classes, tests, lessons] = await Promise.all([db.homework.list(), db.submissions.list(), db.classes.list(), db.tests.list(), db.lessons.list()]);
  classes.sort((a, b) => a.name.localeCompare(b.name, 'ru', { numeric: true }));
  const students = await db.students.list();
  const clsName = id => (classes.find(c => c.id === id) || {}).name || '';
  const targets = hw => { const all = students.filter(s => s.classId === hw.classId); return hw.studentIds && hw.studentIds.length ? all.filter(s => hw.studentIds.includes(s.id)) : all; };

  const rows = homework.map(hw => ({ hw, c: hwCounts(hw, targets(hw), subs) }));
  const groups = {
    active: rows.filter(r => r.hw.status === 'draft' || isOpen(r.hw)),
    waiting: rows.filter(r => r.hw.status === 'sent' && r.c.waiting > 0),
    done: rows.filter(r => r.hw.status === 'sent' && !isOpen(r.hw))
  };
  const byDue = (a, b) => (a.hw.status === 'draft' ? 1 : 0) - (b.hw.status === 'draft' ? 1 : 0) || String(a.hw.dueDate).localeCompare(String(b.hw.dueDate));
  groups.active.sort(byDue); groups.waiting.sort(byDue); groups.done.sort((a, b) => String(b.hw.dueDate).localeCompare(String(a.hw.dueDate)));
  let tab = query.tab && groups[query.tab] ? query.tab : 'active';

  // The form: a draft being edited, or a new assignment (optionally prefilled from a lesson).
  const draft = query.id ? homework.find(h => h.id === query.id && h.status === 'draft') : null;
  const fromLesson = query.lesson ? lessons.find(l => l.id === query.lesson) : null;
  const F = initForm(draft, fromLesson, query, classes, homework);
  let sentId = null;

  const card = ({ hw, c }) => {
    const kind = hw.kind === 'online' ? html`<span class="tag blue">${t('hw.online')}</span>` : html`<span class="tag yellow">${t('hw.paper')}</span>`;
    const title = `${hw.title || ''}${hw.classId ? ' · ' + clsName(hw.classId) : ''}`;
    if (hw.status === 'draft') {
      return html`<a class="hw-card dashed" href="#/homework?id=${hw.id}"><span class="hw-top">${kind}<span class="tag">${t('hw.draft')}</span><span class="grow"></span></span>
        <span class="hw-name">${title}</span><span class="hw-meta"><span>${t('hw.draftNote')}</span><b>${t('hw.send')}</b></span></a>`;
    }
    const closed = !isOpen(hw);
    const share = c.total ? c.submitted / c.total : 0;
    const due = closed ? t('hw.finished', { d: dateOf(hw.dueDate) }) : t('hw.until', { d: dateOf(hw.dueDate) + (hw.dueTime ? ', ' + hw.dueTime : '') });
    if (closed && !c.waiting) {
      return html`<a class="hw-card faded" href="#/homework/${hw.id}"><span class="hw-top">${kind}<span class="grow"></span><span class="hw-due">${due}</span></span>
        <span class="hw-name sm">${title}</span>
        <span class="hw-meta"><span>${t('hw.handed', { n: c.submitted, total: c.total })}${c.avgShare != null ? ' · ' + t('hw.avgRes', { p: Math.round(c.avgShare * 100) + '%' }).toLowerCase() : c.avgGrade != null ? ' · ' + t('hw.st.avg').toLowerCase() + ' ' + num(c.avgGrade) : ''}</span></span></a>`;
    }
    return html`<a class="hw-card${c.waiting ? ' strong' : ''}" href="#/homework/${hw.id}">
      <span class="hw-top">${kind}<span class="tag">${t('hw.c.' + (hw.checker || 'auto'))}</span><span class="grow"></span><span class="hw-due">${due}</span></span>
      <span class="hw-name">${title}</span>
      <span class="hw-prog"><span class="bar"><i style="width:${Math.round(share * 100)}%"></i></span><b>${t('hw.handed', { n: c.submitted, total: c.total })}</b></span>
      <span class="hw-meta">${hw.kind === 'online' && !c.waiting
        ? html`${c.avgShare != null ? html`<span>${t('hw.avgRes', { p: Math.round(c.avgShare * 100) + '%' })}</span>` : ''}<span>${t('hw.notYet', { n: c.total - c.submitted })}</span><b>${t('hw.results')}</b>`
        : html`<span>${t('hw.checkedN', { n: c.checked })}</span>${c.waiting ? html`<span class="warn">${t('hw.waitN', { n: c.waiting })}</span>` : ''}<b>${c.waiting ? t('hw.check') : t('hw.results')}</b>`}</span></a>`;
  };

  const materials = () => {
    const opts = [];
    homework.filter(h => h.status === 'draft' && h.kind === 'online' && (h.questions || []).length).forEach(h => opts.push({ id: 'hw:' + h.id, label: t('hw.m.hw', { t: h.title }) }));
    tests.filter(x => (x.questions || []).length).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).forEach(x => opts.push({ id: 'test:' + x.id, label: t('hw.m.test', { t: x.title || '—' }) }));
    return opts;
  };

  const draw = () => {
    const mats = materials();
    const clsStudents = students.filter(s => s.classId === F.classId);
    const link = sentId ? hwLink(sentId) : null;
    main.innerHTML = html`
      <div class="hw-page">
        <div class="hw-list">
          <h1 class="title title-md">${t('hw.title')}</h1>
          ${segmented('tab', ['active', 'waiting', 'done'].map(id => ({ id, label: t('hw.' + id) + (id !== 'done' && groups[id].length ? ' · ' + (id === 'waiting' ? groups.waiting.reduce((s, r) => s + r.c.waiting, 0) : groups[id].length) : '') })), tab, 'lg hw-tabs')}
          ${groups[tab].length ? groups[tab].map(card) : html`<div class="empty"><h2>${t('hw.empty.' + tab)}</h2><p>${t('hw.emptyNote')}</p></div>`}
        </div>
        <form class="hw-form" novalidate>
          <div class="card-title lg">${F.id ? t('hw.edit') : t('hw.new')}</div>
          <div class="hw-kinds">
            <button type="button" class="kind${F.kind === 'online' ? ' on' : ''}" data-kind="online"><b>${t('hw.online')}</b><span>${t('hw.onlineSub')}</span></button>
            <button type="button" class="kind${F.kind === 'notebook' ? ' on' : ''}" data-kind="notebook"><b>${t('hw.paperK')}</b><span>${t('hw.paperSub')}</span></button>
          </div>
          ${F.kind === 'online'
            ? (mats.length
              ? html`<label class="field muted">${t('hw.material')}<select name="material"><option value="">${t('hw.pick')}</option>${mats.map(m => html`<option value="${m.id}" ${m.id === F.material ? raw('selected') : ''}>${m.label}</option>`)}</select></label>`
              : html`<div class="field muted">${t('hw.material')}<div class="hw-none"><span>${t('hw.m.none')}</span><a class="link-btn" href="#/tests?new=1">${t('hw.makeTest')}</a></div></div>`)
            : html`<label class="field muted">${t('hw.task')}<input name="title" value="${F.title}" placeholder="${t('hw.taskPh')}" maxlength="120"></label>
                   <label class="field muted">${t('hw.instr')}<textarea name="instructions" rows="3" placeholder="${t('hw.instrPh')}">${F.instructions}</textarea></label>`}
          <div class="field muted">${t('hw.to')}
            <div class="chips">${classes.length ? classes.map(c => html`<button type="button" class="chip sq${c.id === F.classId && !F.studentIds ? ' on dark' : ''}" data-cls="${c.id}">${c.name}</button>`) : html`<span class="muted-note">${t('hw.noClasses')}</span>`}
              ${classes.length ? html`<button type="button" class="chip sq${F.studentIds ? ' on dark' : ''}" data-pick>${F.studentIds ? t('hw.nStudents', { n: F.studentIds.length }) : t('hw.pickStudents')}</button>` : ''}</div>
          </div>
          <div class="field muted">${t('hw.due')}<div class="hw-due-row"><input type="date" name="dueDate" value="${F.dueDate}" min="${today()}"><input type="time" name="dueTime" value="${F.dueTime}"></div></div>
          <div class="field muted">${t('hw.checker')}
            <div class="seg2">${(F.kind === 'online' ? ['auto', 'self'] : ['ai', 'self']).map(k => html`<button type="button" data-checker="${k}" aria-pressed="${F.checker === k}">${t('hw.k.' + k)}</button>`)}</div>
          </div>
          ${F.kind === 'online' ? html`
            <label class="pk-toggle hw-tg"><span>${t('hw.showAnswers')}</span><input type="checkbox" name="showAnswers" ${F.showAnswers ? raw('checked') : ''}><i></i></label>
            <label class="pk-toggle hw-tg"><span>${t('hw.shuffle')}</span><input type="checkbox" name="shuffle" ${F.shuffle ? raw('checked') : ''}><i></i></label>` : ''}
          <span class="grow"></span>
          <button type="submit" class="btn-k hw-send">${t('hw.sendBtn')}</button>
          ${F.id ? html`<button type="button" class="link-btn" data-savedraft>${t('hw.saveDraft')}</button>` : ''}
          <div class="hw-linkbox"><span class="grow"><span class="l">${t('hw.link')}</span><b>${link ? link.replace(/^https?:\/\//, '') : '[' + t('hw.linkAfter') + ']'}</b></span>
            ${link ? html`<button type="button" class="btn-w" data-copy>${t('hw.copy')}</button>` : ''}<button type="button" class="btn-w" data-qr ${link ? '' : raw('disabled')}>${t('hw.qr')}</button></div>
        </form>
      </div>`;
    bind(clsStudents);
  };

  const readForm = form => {
    if (form.material) F.material = form.material.value;
    if (form.title) F.title = form.title.value;
    if (form.instructions) F.instructions = form.instructions.value;
    F.dueDate = form.dueDate.value || F.dueDate;
    F.dueTime = form.dueTime.value || F.dueTime;
    if (form.showAnswers) F.showAnswers = form.showAnswers.checked;
    if (form.shuffle) F.shuffle = form.shuffle.checked;
  };

  const bind = clsStudents => {
    const form = main.querySelector('.hw-form');
    main.querySelectorAll('[data-seg="tab"]').forEach(b => b.onclick = () => { tab = b.dataset.id; draw(); });
    form.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => {
      readForm(form); F.kind = b.dataset.kind;
      F.checker = F.kind === 'online' ? (F.checker === 'self' ? 'self' : 'auto') : (F.checker === 'self' ? 'self' : 'ai');
      draw();
    });
    form.querySelectorAll('[data-cls]').forEach(b => b.onclick = () => { readForm(form); F.classId = b.dataset.cls; F.studentIds = null; draw(); });
    form.querySelectorAll('[data-checker]').forEach(b => b.onclick = () => { readForm(form); F.checker = b.dataset.checker; draw(); });
    const pick = form.querySelector('[data-pick]');
    if (pick) pick.onclick = () => {
      readForm(form);
      if (!F.classId) { toast(t('hw.err.class')); return; }
      const chosen = new Set(F.studentIds || clsStudents.map(s => s.id));
      openModal({
        title: t('hw.studentsTitle'),
        body: html`<div class="hw-pick"><label class="pk-check"><input type="checkbox" data-all ${chosen.size === clsStudents.length ? raw('checked') : ''}><span>${t('hw.all')}</span></label>
          ${clsStudents.sort((a, b) => a.name.localeCompare(b.name, 'ru')).map(s => html`<label class="pk-check"><input type="checkbox" name="s" value="${s.id}" ${chosen.has(s.id) ? raw('checked') : ''}><span>${s.name}</span></label>`)}</div>`.toString(),
        onSubmit: f => {
          const ids = [...f.querySelectorAll('[name="s"]:checked')].map(x => x.value);
          if (!ids.length) { toast(t('hw.err.students')); return false; }
          F.studentIds = ids.length === clsStudents.length ? null : ids;
          draw();
        }
      });
      const m = document.querySelector('.modal-back:last-child');
      m.querySelector('[data-all]').onchange = e => m.querySelectorAll('[name="s"]').forEach(x => { x.checked = e.target.checked; });
    };
    const copy = form.querySelector('[data-copy]');
    if (copy) copy.onclick = async () => { await copyText(hwLink(sentId)); toast(t('hw.copied')); };
    form.querySelector('[data-qr]').onclick = () => showQr(sentId);
    const sd = form.querySelector('[data-savedraft]');
    if (sd) sd.onclick = async () => { readForm(form); await db.homework.update(F.id, draftPatch(F)); toast(t('hw.saved')); };
    form.onsubmit = async e => {
      e.preventDefault();
      readForm(form);
      if (!F.classId) return toast(t('hw.err.class'));
      if (F.kind === 'online' && !F.material) return toast(t('hw.err.material'));
      if (F.kind === 'notebook' && !F.title.trim()) return toast(t('hw.err.task'));
      form.querySelector('.hw-send').disabled = true;
      const hw = await sendHomework(F, homework, tests);
      sentId = hw.id;
      toast(t('hw.sent'));
      // Refresh the lists but keep the link box showing the sent assignment.
      const fresh = await db.homework.list();
      homework.splice(0, homework.length, ...fresh);
      rows.splice(0, rows.length, ...homework.map(h => ({ hw: h, c: hwCounts(h, targets(h), subs) })));
      groups.active = rows.filter(r => r.hw.status === 'draft' || isOpen(r.hw)).sort(byDue);
      tab = 'active';
      Object.assign(F, initForm(null, null, {}, classes, homework), { classId: F.classId });
      draw();
    };
  };

  draw();
}

function initForm(draft, lesson, query, classes, homework) {
  const lessonHw = lesson && lesson.parts && lesson.parts.homeworkId ? homework.find(h => h.id === lesson.parts.homeworkId) : null;
  const base = draft || (lessonHw && lessonHw.status === 'draft' ? lessonHw : null);
  const kind = base ? base.kind : 'online';
  let material = '';
  if (base && base.kind === 'online') material = base.testId ? 'test:' + base.testId : 'hw:' + base.id;
  else if (!base && lesson && lesson.parts && lesson.parts.testId) material = 'test:' + lesson.parts.testId;
  const classId = (base && base.classId) || (lesson && lesson.classId) || (classes.length === 1 ? classes[0].id : null);
  const ids = query.students ? query.students.split(',').filter(Boolean) : (base && base.studentIds) || null;
  return {
    id: base ? base.id : null, kind, material, classId, studentIds: ids && ids.length ? ids : null,
    title: base && base.kind === 'notebook' ? base.title || '' : '', instructions: base ? base.instructions || '' : '',
    dueDate: base && base.dueDate && base.dueDate >= today() ? base.dueDate : addDays(today(), 2), dueTime: (base && base.dueTime) || '23:59',
    checker: base && base.checker ? base.checker : kind === 'online' ? 'auto' : 'ai',
    showAnswers: base ? base.showAnswers !== false : true, shuffle: !!(base && base.shuffle), lessonId: (base && base.lessonId) || (lesson && lesson.id) || null
  };
}

function draftPatch(F) {
  return { classId: F.classId, studentIds: F.studentIds, dueDate: F.dueDate, dueTime: F.dueTime, checker: F.checker, showAnswers: F.showAnswers, shuffle: F.shuffle,
    ...(F.kind === 'notebook' ? { title: F.title.trim(), instructions: F.instructions.trim() } : {}) };
}

async function sendHomework(F, homework, tests) {
  const common = { ...draftPatch(F), status: 'sent', sentAt: new Date().toISOString() };
  // Sending the lesson's own draft: update it in place.
  const draftId = F.material.startsWith('hw:') ? F.material.slice(3) : F.id;
  const draft = draftId ? homework.find(h => h.id === draftId) : null;
  if (F.kind === 'online' && F.material.startsWith('test:')) {
    const test = tests.find(x => x.id === F.material.slice(5));
    const data = { ...common, kind: 'online', testId: test.id, title: test.title || '', instructions: '', questions: test.questions, lessonId: test.lessonId || F.lessonId || null };
    if (draft && draft.kind === 'online') return db.homework.update(draft.id, data);
    return db.homework.create(data);
  }
  if (draft && draft.kind === F.kind) return db.homework.update(draft.id, { ...common, kind: F.kind });
  return db.homework.create({ ...common, kind: 'notebook', questions: [], lessonId: F.lessonId });
}

async function showQr(id) {
  if (!id) return;
  let svg = '';
  try { svg = await qrSvg(hwLink(id)); } catch (e) { toast(t('ai.err.offline')); return; }
  openModal({
    title: t('hw.qrTitle'),
    body: `<div class="hw-qr">${svg}<p class="muted-note">${esc(t('hw.qrNote'))}</p><code>${esc(hwLink(id))}</code><p class="muted-note">${esc(t('hw.local'))}</p></div>`
  });
}

/* ================= Screen 11: review ================= */

async function review(main, id, query) {
  const hw = await db.homework.get(id);
  if (!hw) { main.innerHTML = html`<div class="empty"><h2>${t('hw.notFound')}</h2><div class="row"><a class="btn-k" href="#/homework">${t('hw.back')}</a></div></div>`; return; }
  const [cls, students, allSubs, plan] = await Promise.all([hw.classId ? db.classes.get(hw.classId) : null, hwStudents(hw), db.submissions.list({ homeworkId: hw.id }), currentPlan()]);
  const subOf = sid => allSubs.find(s => s.studentId === sid);
  const order = [...students].sort((a, b) => rank(subOf(a.id)) - rank(subOf(b.id)) || a.name.localeCompare(b.name, 'ru'));
  let cur = query.s && students.some(s => s.id === query.s) ? query.s : (order[0] && order[0].id);
  let photo = 0;
  let aiBusy = false;
  const qs = (hw.questions || []).map(normQ);

  const draw = () => {
    const c = hwCounts(hw, students, allSubs);
    const hardest = hardestLabel(hw, allSubs, qs);
    const st = students.find(s => s.id === cur);
    const sub = st ? subOf(st.id) : null;
    main.innerHTML = html`
      <div class="page-head center">
        <div><div class="crumbs"><a href="#/homework">${t('hw.title')}</a>${icon('chevronRight', 14)}<span>${t('hw.crumb')}</span></div>
          <h1 class="title title-md">${hw.title || ''}${cls ? ' · ' + cls.name : ''}</h1></div>
        <div class="head-right"><button type="button" class="btn-o btn-md" data-copylink>${t('hw.remind')}</button><button type="button" class="btn-o btn-md" data-qr>${t('hw.qr')}</button></div>
      </div>
      <div class="stats c4">
        <div class="stat"><div class="stat-l">${t('hw.st.handed')}</div><div class="stat-v">${c.submitted} <small class="mut">${t('hw.st.of', { n: c.total })}</small></div></div>
        <div class="stat"><div class="stat-l">${t('hw.st.checked')}</div><div class="stat-v">${c.checked} <small class="mut">${t('hw.st.left', { n: c.waiting })}</small></div></div>
        <div class="stat"><div class="stat-l">${t('hw.st.avg')}</div><div class="stat-v">${c.avgGrade != null ? num(c.avgGrade) : '—'} <small class="mut">${t('hw.st.of5')}</small></div></div>
        <div class="stat"><div class="stat-l">${t('hw.st.hardest')}</div><div class="stat-v">${hardest || '—'}</div></div>
      </div>
      <div class="hr-body">
        <div class="hr-list">
          <div class="hr-lh"><span>${t('hw.student')}</span><span>${t('hw.status')}</span></div>
          ${order.map(s => { const x = subOf(s.id); const [label, cl] = statusOf(x); return html`<button type="button" class="hr-row${s.id === cur ? ' on' : ''}" data-st="${s.id}"><span class="n">${s.name}</span><span class="badge ${cl}">${label}</span></button>`; })}
        </div>
        <div class="hr-main">${st ? panel(st, sub) : ''}</div>
      </div>
      <div class="les-actions"><button type="button" class="link-btn danger" data-del>${t('hw.delete')}</button></div>`;
    bind();
  };

  const panel = (st, sub) => {
    if (!sub) return html`<div class="hr-work"><div class="hr-wh"><b>${st.name}</b></div><div class="empty grow"><h2>${t('hw.noSub')}</h2><p>${t('hw.noSubNote')}</p></div></div>`;
    const when = sub.submittedAt ? t('hw.sentAt', { d: dateOf(sub.submittedAt.slice(0, 10)) }) : '';
    const suggested = suggestion(hw, sub);
    const grade = sub.grade != null ? sub.grade : suggested;
    const work = hw.kind === 'online'
      ? html`<div class="hr-answers">${qs.map((q, i) => { const a = (sub.answers || [])[i] || {}; const ok = a.points == null ? 'wait' : a.points > 0 ? 'ok' : 'bad'; return html`<div class="hr-a ${ok}"><div class="q"><span class="n">${i + 1}</span>${q.q}</div>
          <div class="g"><span>${t('hw.given')}:</span> <b>${givenText(q, a.given)}</b></div>${ok !== 'ok' ? html`<div class="g"><span>${t('hw.correct')}:</span> ${rightAnswer(q)}</div>` : ''}</div>`; })}</div>`
      : html`${(sub.photos || []).length ? html`<div class="hr-photo"><img src="${sub.photos[Math.min(photo, sub.photos.length - 1)]}" alt=""></div>
          ${sub.photos.length > 1 ? html`<div class="hr-thumbs">${sub.photos.map((p, i) => html`<button type="button" data-ph="${i}" class="${i === photo ? 'on' : ''}"><img src="${p}" alt=""></button>`)}</div>` : ''}` : html`<div class="hr-photo empty-ph">${t('hw.noPhotos')}</div>`}
          ${sub.text ? html`<p class="hr-text">${sub.text}</p>` : ''}`;
    return html`<div class="hr-work">
        <div class="hr-wh"><b>${st.name}</b><span>${when}${hw.kind !== 'online' && (sub.photos || []).length ? ' · ' + t('hw.photos', { n: sub.photos.length }) : ''}</span></div>
        ${work}
      </div>
      <div class="hr-side">
        ${aiCard(sub, suggested)}
        <div class="field muted">${t('hw.yourGrade')}<div class="hr-grades">${[2, 3, 4, 5].map(g => html`<button type="button" data-g="${g}" class="${g === grade ? 'on' : ''}">${g}</button>`)}</div></div>
        <label class="field muted">${t('hw.comment')}<textarea name="comment" rows="3">${sub.comment || (sub.ai && sub.ai.comment) || ''}</textarea></label>
        <span class="grow"></span>
        <button type="button" class="btn-k hw-send" data-save>${nextOf(st.id) ? t('hw.saveNext') : t('hw.saveOnly')}</button>
      </div>`;
  };

  const aiCard = (sub, suggested) => {
    if (hw.kind === 'online') {
      const wrong = qs.map((q, i) => ({ i, a: (sub.answers || [])[i] || {} })).filter(x => x.a.points === 0).map(x => x.i + 1);
      const open = qs.map((q, i) => ({ i, a: (sub.answers || [])[i] || {} })).filter(x => x.a.points == null).map(x => x.i + 1);
      return html`<div class="hr-ai"><span class="h">${icon('check', 14)}${t('hw.autoChecked')}</span>
        <span>${t('hw.right', { n: (sub.answers || []).filter(a => a && a.points > 0).length, total: qs.length })}. ${wrong.length ? t('hw.mistakes', { list: wrong.map(n => '№' + n).join(', ') }) : t('hw.allRight')}</span>
        ${open.length ? html`<span>${t('hw.openQ', { list: open.map(n => '№' + n).join(', ') })}</span>` : ''}
        ${suggested ? html`<span>${raw(esc(t('hw.suggest', { g: '§' })).replace('§', `<b>${suggested}</b>`))}</span>` : ''}</div>`;
    }
    if (hw.checker === 'self') return html`<div class="hr-ai muted"><span>${t('hw.selfNote')}</span></div>`;
    if (sub.ai) {
      return html`<div class="hr-ai"><span class="h">${icon('sparkle', 14)}${t('hw.aiChecked')}</span><span class="pre">${sub.ai.text}</span>
        ${sub.ai.grade ? html`<span>${raw(esc(t('hw.suggest', { g: '§' })).replace('§', `<b>${sub.ai.grade}</b>`))}</span>` : ''}</div>`;
    }
    if (!plan.homeworkAnalysis) return html`<div class="hr-ai muted"><span>${t('hw.aiPlan')}</span><a class="link-btn" href="#/plan">${t('nav.plan')}</a></div>`;
    return html`<div class="hr-ai"><span class="h">${icon('sparkle', 14)}${aiBusy ? t('hw.aiRunning') : t('hw.aiReady')}</span>
      ${aiBusy ? html`<span class="np-dot run"></span>` : html`<button type="button" class="btn-w" data-ai ${(sub.photos || []).length ? '' : raw('disabled')}>${t('hw.aiRun')}</button>`}</div>`;
  };

  const nextOf = sid => {
    const i = order.findIndex(s => s.id === sid);
    return order.slice(i + 1).concat(order.slice(0, i)).find(s => { const x = subOf(s.id); return x && x.status === 'submitted'; });
  };

  const bind = () => {
    main.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { cur = b.dataset.st; photo = 0; draw(); });
    main.querySelectorAll('[data-ph]').forEach(b => b.onclick = () => { photo = Number(b.dataset.ph); draw(); });
    main.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { main.querySelectorAll('[data-g]').forEach(x => x.classList.toggle('on', x === b)); });
    main.querySelector('[data-copylink]').onclick = async () => { await copyText(hwLink(hw.id)); toast(t('hw.copied')); };
    main.querySelector('[data-qr]').onclick = () => showQr(hw.id);
    main.querySelector('[data-del]').onclick = async () => {
      if (!confirm(t('ui.confirmDelete'))) return;
      await db.submissions.removeWhere({ homeworkId: hw.id });
      await db.marks.removeWhere({ homeworkId: hw.id });
      await db.homework.remove(hw.id);
      location.hash = '#/homework';
    };
    const ai = main.querySelector('[data-ai]');
    if (ai) ai.onclick = () => runAi(subOf(cur));
    const save = main.querySelector('[data-save]');
    if (save) save.onclick = async () => {
      const on = main.querySelector('[data-g].on');
      if (!on) { toast(t('hw.gradeFirst')); return; }
      const sub = subOf(cur);
      const grade = Number(on.dataset.g);
      const updated = await db.submissions.update(sub.id, { grade, comment: main.querySelector('[name="comment"]').value.trim(), status: 'checked', checkedAt: new Date().toISOString() });
      Object.assign(sub, updated);
      await saveHwMark(hw, sub, grade);
      toast(t('hw.gradeSaved'));
      const next = nextOf(cur);
      if (next) { cur = next.id; photo = 0; }
      else if (!allSubs.some(s => s.status === 'submitted')) toast(t('hw.allChecked'));
      draw();
    };
  };

  const runAi = async sub => {
    aiBusy = true; draw();
    try {
      const files = (sub.photos || []).map(p => ({ mimeType: p.slice(5, p.indexOf(';')), base64: p.split(',')[1] }));
      const res = await generateJSON(hwCheckPrompt(hw, cls), { files, temperature: 0.2 });
      const g = Number(res.grade);
      const ai = { text: String(res.summary || '').slice(0, 800), grade: g >= 2 && g <= 5 ? g : null, comment: String(res.comment || '').slice(0, 400), hardest: res.hardest ? String(res.hardest).slice(0, 30) : null };
      Object.assign(sub, await db.submissions.update(sub.id, { ai }));
    } catch (e) {
      toast(e instanceof AiError ? e.message : t('ai.err.other', { msg: e.message }));
    }
    aiBusy = false; draw();
  };

  draw();
}

function rank(sub) { return !sub ? 2 : sub.status === 'submitted' ? 0 : 1; }

function statusOf(sub) {
  if (!sub) return [t('hw.s.none'), 'grey'];
  if (sub.status === 'submitted') return [t('hw.s.check'), 'yellow'];
  return [t('hw.s.grade', { g: sub.grade }), 'green'];
}

function suggestion(hw, sub) {
  if (sub.ai && sub.ai.grade) return sub.ai.grade;
  if (hw.kind === 'online' && sub.total) return sub.autoGrade || gradeOf(sub.points / sub.total);
  return null;
}

function givenText(q, given) {
  if (given == null || given === '' || (Array.isArray(given) && !given.length)) return t('hw.noAnswer');
  if (q.type === 'single') return q.options[given] ?? String(given);
  if (q.type === 'multiple') return given.map(i => q.options[i]).join(', ');
  if (q.type === 'truefalse') return given ? t('tp.true') : t('tp.false');
  return String(given);
}

function hardestLabel(hw, subs, qs) {
  if (hw.kind === 'online') {
    const st = questionStats(hw, subs).filter(x => x.share != null && x.share < 1);
    if (!st.length || !qs.length) return '';
    st.sort((a, b) => a.share - b.share);
    return t('hw.q', { n: st[0].i + 1 });
  }
  const counts = {};
  subs.forEach(s => { if (s.ai && s.ai.hardest) counts[s.ai.hardest] = (counts[s.ai.hardest] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : '';
}

function hwCheckPrompt(hw, cls) {
  const l = lang() === 'kk' ? 'казахском' : lang() === 'en' ? 'английском' : 'русском';
  return `[part:hwcheck]
Ты помогаешь учителю${cls ? ` (${cls.name}, ${cls.subject || ''})` : ''} проверить домашнюю работу ученика по фото тетради.
Задание: "${hw.title || ''}". ${hw.instructions ? 'Условие: ' + hw.instructions : ''}
Посмотри на фото, найди решения по номерам, отметь верные и ошибки (коротко, в чём ошибка). Оценку ставит учитель — ты только предлагаешь по 5-балльной шкале.
Если на фото не видно решения, так и напиши и не предлагай оценку.
Пиши на ${l} языке. Верни ТОЛЬКО JSON:
{ "summary": "2–4 коротких строки: какие номера верно, где ошибки", "grade": 4, "comment": "одно доброжелательное предложение ученику", "hardest": "номер задачи с ошибкой, например «№3», или пусто" }`;
}

