/* Screens 13–19 · Lesson mode. The slide fills the whole screen. Two floating
 * "islands" hold the controls: lesson time and Finish at the top, materials and
 * tools at the bottom — the bottom one folds away so nothing covers the slide.
 * The register (with attendance and groups) and the AI chat open on the right;
 * the timer and the noise meter are small windows that can be open together. */
import { add, t, lang } from '../i18n.js';
import { esc, icon, toast } from '../ui.js';
import { db } from '../data/store.js';
import { today, shortDate } from '../school.js';
import { slideBox, fillImages } from '../deck.js';
import { bindGames, renderMath, plain } from '../slides.js';
import { playGame } from '../games.js';
import { playTest } from '../testlogic.js';
import { generateJSON } from '../ai.js';
import { openPicker, MARKS, TINTS } from '../lesson/picker.js';
import { monsterSvg, moodOf, Mic, Balls } from '../lesson/noise.js';
import { openFile } from '../lesson/files.js';
import { sfx, soundOn, setSound } from '../sound.js';

add({
  ru: {
    'lm.t.whiteboard': 'Белая доска', 'lm.t.pencil': 'Карандаш', 'lm.s.whiteboard': 'Доска', 'lm.s.pencil': 'Карандаш', 'lm.s.sound': 'Звук', 'lm.hide': 'Свернуть кнопки', 'lm.s.hide': 'Скрыть', 'lm.show': 'Показать кнопки', 'lm.full': 'Во весь экран', 'lm.others': 'Другие', 'lm.pick.game': 'Игры', 'lm.pick.quiz': 'Викторины', 'lm.pick.test': 'Тесты', 'lm.pick.hw': 'Домашние задания', 'lm.pick.none': 'Пока ничего нет — создайте в разделе.', 'lm.thisLesson': 'этот урок', 'lm.pick.title': 'Выберите: {what}', 'lm.back': 'Вернуться', 'lm.size': 'Толщина', 'lm.whiteOn': 'Белая доска', 'lm.calibrating': 'Слушаю класс… (3 секунды тишины)', 'lm.recalibrate': 'Настроить заново', 'lm.micAsk': 'Разрешите доступ к микрофону — шумомер слушает класс сам', 'lm.who': 'Кто начнёт', 'lm.lessonTime': 'Время урока', 'lm.sound.on': 'Звук включён', 'lm.sound.off': 'Звук выключен',
    'lm.startTitle': 'Начать урок', 'lm.startText': 'Загрузите свою презентацию или откройте готовый урок. Журнал, таймер, колесо, группы, шумомер и доска внизу работают и без файла.', 'lm.drop': 'Загрузить свою презентацию', 'lm.dropHint': 'PDF, PowerPoint (PPTX), Word или картинка · можно перетащить сюда', 'lm.classFor': 'Класс', 'lm.noClassPick': 'Без класса', 'lm.myLessons': 'Мои уроки', 'lm.myDecks': 'Мои презентации', 'lm.opening': 'Открываю файл…', 'lm.s.ai': 'ИИ', 'lm.s.timer': 'Таймер', 'lm.s.picker': 'Ученик', 'lm.s.noise': 'Шум', 'lm.s.journal': 'Журнал', 'lm.s.groups': 'Группы', 'lm.s.board': 'Доска', 'lm.s.dark': 'Экран', 'lm.s.upload': 'Файл', 'lm.material': 'Материал',
    'lm.slides': 'Презентация', 'lm.game': 'Игра', 'lm.quiz': 'Викторина', 'lm.test': 'Тест', 'lm.hw': 'ДЗ', 'lm.file': 'Файл', 'lm.upload': 'Открыть свой файл (PDF, PPTX, DOCX)',
    'lm.prev': 'Назад', 'lm.next': 'Вперёд', 'lm.finish': 'Завершить', 'lm.exit': 'Выйти из урока',
    'lm.t.ai': 'ИИ-чат', 'lm.t.timer': 'Таймер', 'lm.t.picker': 'Выбор ученика', 'lm.t.noise': 'Шумомер', 'lm.t.journal': 'Журнал и посещаемость', 'lm.t.groups': 'Группы', 'lm.t.board': 'Доска', 'lm.t.dark': 'Затемнить экран',
    'lm.none.slides': 'В этом уроке нет презентации.', 'lm.none.game': 'В этом уроке нет игр.', 'lm.none.quiz': 'В этом уроке нет викторины.', 'lm.none.test': 'В этом уроке нет теста.', 'lm.none.hw': 'Домашнее задание не создано.', 'lm.none.file': 'Откройте свой файл — PDF, PPTX или DOCX.',
    'lm.make': 'Создать', 'lm.chooseFile': 'Выбрать файл', 'lm.fileErr': 'Не удалось открыть файл', 'lm.fileLabel': 'Файл', 'lm.pageOf': '{r} · {i} из {n}',
    'lm.hwDue': 'Сдать до {d}', 'lm.hwOnline': 'Онлайн-тест · {n} вопросов', 'lm.hwNotebook': 'Задание в тетради — пришлите фото',
    'lm.autosave': 'Сохраняется автоматически', 'lm.close': 'Закрыть панель', 'lm.journal': 'Журнал', 'lm.attendance': 'Посещаемость', 'lm.groups': 'Группы', 'lm.came': 'Пришли {n} из {total}', 'lm.plusAll': '+1 всем', 'lm.allHere': 'Все пришли',
    'lm.here': 'Пришёл', 'lm.absent': 'Нет на уроке', 'lm.minus': 'Минус балл', 'lm.plus': 'Плюс балл', 'lm.noClass': 'Выберите класс, чтобы вести журнал', 'lm.noStudents': 'В классе нет учеников — добавьте их в «Классах».',
    'lm.groupsSub': 'Только пришедшие · {n}', 'lm.howMany': 'Сколько групп', 'lm.howSplit': 'Как делить', 'lm.byPoints': 'Поровну по баллам', 'lm.random': 'Случайно', 'lm.group': 'Группа {n}', 'lm.shuffle': 'Перемешать', 'lm.groupWheel': 'Колесо групп', 'lm.makeGroups': 'Разделить на группы',
    'lm.noise': 'Шумомер', 'lm.noiseSub': 'Показывается в углу слайда', 'lm.balls': 'Шарики', 'lm.ballsSub': 'прыгают от шума', 'lm.monster': 'Монстрик', 'lm.scale': 'Шкала',
    'lm.mood.sleep': 'Тихо — монстрик спит', 'lm.mood.mid': 'Шумновато — монстрик приоткрыл глаза', 'lm.mood.loud': 'Громко! Монстрик проснулся и просит потише', 'lm.shh': 'Тсс… потише!',
    'lm.silence': 'Таймер тишины', 'lm.silenceSub': 'Идёт, пока в классе тихо', 'lm.min': '{n} мин', 'lm.pause': 'Пауза', 'lm.play': 'Пуск', 'lm.reset': 'Сначала',
    'lm.mic': 'Включить микрофон', 'lm.micOff': 'Выключить микрофон', 'lm.micErr': 'Нет доступа к микрофону — разрешите его в браузере', 'lm.testLevel': 'Проверить: громкость класса', 'lm.quiet': 'тихо', 'lm.loud': 'громко', 'lm.threshold': 'порог: {n}%',
    'lm.timer': 'Таймер', 'lm.timerSub': 'Показывается внизу вместо часов', 'lm.stopwatch': 'Секундомер', 'lm.timeUp': 'Время вышло',
    'lm.ai': 'ИИ-чат', 'lm.aiSub': 'Помощник на уроке', 'lm.send': 'Отправить', 'lm.aiPh': 'Спросите что-нибудь…', 'lm.aiHello': 'Спросите: «объясни проще», «дай ещё пример», «придумай вопрос классу».', 'lm.ai.simpler': 'Объясни проще', 'lm.ai.example': 'Ещё пример', 'lm.ai.question': 'Вопрос классу',
    'lm.board': 'Доска', 'lm.eraser': 'Ластик', 'lm.clear': 'Очистить', 'lm.darkHint': 'Нажмите, чтобы вернуться', 'lm.finished': 'Урок завершён — журнал сохранён', 'lm.notFound': 'Урок не найден',
    'lm.answering': 'Отвечает', 'lm.nobody': '—'
  },
  kk: {
    'lm.t.whiteboard': 'Ақ тақта', 'lm.t.pencil': 'Қарындаш', 'lm.s.whiteboard': 'Тақта', 'lm.s.pencil': 'Қарындаш', 'lm.s.sound': 'Дыбыс', 'lm.hide': 'Батырмаларды жасыру', 'lm.s.hide': 'Жасыру', 'lm.show': 'Батырмаларды көрсету', 'lm.full': 'Толық экран', 'lm.others': 'Басқалар', 'lm.pick.game': 'Ойындар', 'lm.pick.quiz': 'Викториналар', 'lm.pick.test': 'Тесттер', 'lm.pick.hw': 'Үй тапсырмалары', 'lm.pick.none': 'Әзірге ештеңе жоқ — бөлімде құрыңыз.', 'lm.thisLesson': 'осы сабақ', 'lm.pick.title': 'Таңдаңыз: {what}', 'lm.back': 'Қайту', 'lm.size': 'Қалыңдығы', 'lm.whiteOn': 'Ақ тақта', 'lm.calibrating': 'Сыныпты тыңдап жатырмын… (3 секунд тыныштық)', 'lm.recalibrate': 'Қайта баптау', 'lm.micAsk': 'Микрофонға рұқсат беріңіз — шуөлшегіш сыныпты өзі тыңдайды', 'lm.who': 'Кім бастайды', 'lm.lessonTime': 'Сабақ уақыты', 'lm.sound.on': 'Дыбыс қосулы', 'lm.sound.off': 'Дыбыс өшірулі',
    'lm.startTitle': 'Сабақты бастау', 'lm.startText': 'Өз презентацияңызды жүктеңіз немесе дайын сабақты ашыңыз. Төмендегі журнал, таймер, дөңгелек, топтар, шуөлшегіш және тақта файлсыз да жұмыс істейді.', 'lm.drop': 'Өз презентацияңызды жүктеу', 'lm.dropHint': 'PDF, PowerPoint (PPTX), Word немесе сурет · осында сүйреп әкелуге болады', 'lm.classFor': 'Сынып', 'lm.noClassPick': 'Сыныпсыз', 'lm.myLessons': 'Менің сабақтарым', 'lm.myDecks': 'Менің презентацияларым', 'lm.opening': 'Файлды ашып жатырмын…', 'lm.s.ai': 'ЖИ', 'lm.s.timer': 'Таймер', 'lm.s.picker': 'Оқушы', 'lm.s.noise': 'Шу', 'lm.s.journal': 'Журнал', 'lm.s.groups': 'Топтар', 'lm.s.board': 'Тақта', 'lm.s.dark': 'Экран', 'lm.s.upload': 'Файл', 'lm.material': 'Материал',
    'lm.slides': 'Презентация', 'lm.game': 'Ойын', 'lm.quiz': 'Викторина', 'lm.test': 'Тест', 'lm.hw': 'ҮТ', 'lm.file': 'Файл', 'lm.upload': 'Өз файлыңызды ашу (PDF, PPTX, DOCX)',
    'lm.prev': 'Артқа', 'lm.next': 'Алға', 'lm.finish': 'Аяқтау', 'lm.exit': 'Сабақтан шығу',
    'lm.t.ai': 'ЖИ-чат', 'lm.t.timer': 'Таймер', 'lm.t.picker': 'Оқушы таңдау', 'lm.t.noise': 'Шуөлшегіш', 'lm.t.journal': 'Журнал және қатысу', 'lm.t.groups': 'Топтар', 'lm.t.board': 'Тақта', 'lm.t.dark': 'Экранды қарайту',
    'lm.none.slides': 'Бұл сабақта презентация жоқ.', 'lm.none.game': 'Бұл сабақта ойын жоқ.', 'lm.none.quiz': 'Бұл сабақта викторина жоқ.', 'lm.none.test': 'Бұл сабақта тест жоқ.', 'lm.none.hw': 'Үй тапсырмасы құрылмаған.', 'lm.none.file': 'Өз файлыңызды ашыңыз — PDF, PPTX немесе DOCX.',
    'lm.make': 'Құру', 'lm.chooseFile': 'Файл таңдау', 'lm.fileErr': 'Файлды ашу мүмкін болмады', 'lm.fileLabel': 'Файл', 'lm.pageOf': '{r} · {n}-дан {i}',
    'lm.hwDue': '{d} дейін тапсыру', 'lm.hwOnline': 'Онлайн-тест · {n} сұрақ', 'lm.hwNotebook': 'Дәптердегі тапсырма — фото жіберіңіз',
    'lm.autosave': 'Өздігінен сақталады', 'lm.close': 'Панельді жабу', 'lm.journal': 'Журнал', 'lm.attendance': 'Қатысу', 'lm.groups': 'Топтар', 'lm.came': '{total}-дан {n} келді', 'lm.plusAll': 'Барлығына +1', 'lm.allHere': 'Бәрі келді',
    'lm.here': 'Келді', 'lm.absent': 'Сабақта жоқ', 'lm.minus': 'Балл алу', 'lm.plus': 'Балл қосу', 'lm.noClass': 'Журнал жүргізу үшін сыныпты таңдаңыз', 'lm.noStudents': 'Сыныпта оқушы жоқ — «Сыныптар» бөлімінде қосыңыз.',
    'lm.groupsSub': 'Тек келгендер · {n}', 'lm.howMany': 'Топ саны', 'lm.howSplit': 'Қалай бөлу', 'lm.byPoints': 'Балл бойынша тең', 'lm.random': 'Кездейсоқ', 'lm.group': '{n}-топ', 'lm.shuffle': 'Араластыру', 'lm.groupWheel': 'Топтар дөңгелегі', 'lm.makeGroups': 'Топқа бөлу',
    'lm.noise': 'Шуөлшегіш', 'lm.noiseSub': 'Слайдтың бұрышында көрсетіледі', 'lm.balls': 'Шарлар', 'lm.ballsSub': 'шудан секіреді', 'lm.monster': 'Күзетші', 'lm.scale': 'Шкала',
    'lm.mood.sleep': 'Тыныш — күзетші ұйықтап жатыр', 'lm.mood.mid': 'Сәл шулы — күзетші көзін ашты', 'lm.mood.loud': 'Шулы! Күзетші оянып, тынышырақ болуды сұрайды', 'lm.shh': 'Тсс… тынышырақ!',
    'lm.silence': 'Тыныштық таймері', 'lm.silenceSub': 'Сынып тыныш болғанда жүреді', 'lm.min': '{n} мин', 'lm.pause': 'Кідірту', 'lm.play': 'Бастау', 'lm.reset': 'Басынан',
    'lm.mic': 'Микрофонды қосу', 'lm.micOff': 'Микрофонды өшіру', 'lm.micErr': 'Микрофонға рұқсат жоқ — браузерде рұқсат беріңіз', 'lm.testLevel': 'Тексеру: сынып дауысы', 'lm.quiet': 'тыныш', 'lm.loud': 'шулы', 'lm.threshold': 'шегі: {n}%',
    'lm.timer': 'Таймер', 'lm.timerSub': 'Төменде сағаттың орнына көрсетіледі', 'lm.stopwatch': 'Секундомер', 'lm.timeUp': 'Уақыт бітті',
    'lm.ai': 'ЖИ-чат', 'lm.aiSub': 'Сабақтағы көмекші', 'lm.send': 'Жіберу', 'lm.aiPh': 'Бірдеңе сұраңыз…', 'lm.aiHello': 'Сұраңыз: «жеңілірек түсіндір», «тағы мысал», «сыныпқа сұрақ ойлап тап».', 'lm.ai.simpler': 'Жеңілірек түсіндір', 'lm.ai.example': 'Тағы мысал', 'lm.ai.question': 'Сыныпқа сұрақ',
    'lm.board': 'Тақта', 'lm.eraser': 'Өшіргіш', 'lm.clear': 'Тазалау', 'lm.darkHint': 'Қайту үшін басыңыз', 'lm.finished': 'Сабақ аяқталды — журнал сақталды', 'lm.notFound': 'Сабақ табылмады',
    'lm.answering': 'Жауап береді', 'lm.nobody': '—'
  },
  en: {
    'lm.t.whiteboard': 'Whiteboard', 'lm.t.pencil': 'Pencil', 'lm.s.whiteboard': 'Board', 'lm.s.pencil': 'Pencil', 'lm.s.sound': 'Sound', 'lm.hide': 'Hide buttons', 'lm.s.hide': 'Hide', 'lm.show': 'Show buttons', 'lm.full': 'Full screen', 'lm.others': 'Others', 'lm.pick.game': 'Games', 'lm.pick.quiz': 'Quizzes', 'lm.pick.test': 'Tests', 'lm.pick.hw': 'Homework', 'lm.pick.none': 'Nothing yet — make one in its section.', 'lm.thisLesson': 'this lesson', 'lm.pick.title': 'Choose: {what}', 'lm.back': 'Back', 'lm.size': 'Size', 'lm.whiteOn': 'Whiteboard', 'lm.calibrating': 'Listening to the class… (3 seconds of quiet)', 'lm.recalibrate': 'Tune again', 'lm.micAsk': 'Allow the microphone — the noise meter listens to the class by itself', 'lm.who': 'Who starts', 'lm.lessonTime': 'Lesson time', 'lm.sound.on': 'Sound on', 'lm.sound.off': 'Sound off',
    'lm.startTitle': 'Start a lesson', 'lm.startText': 'Upload your own slides or open a ready lesson. The register, timer, wheel, groups, noise meter and board below work without a file too.', 'lm.drop': 'Upload your own slides', 'lm.dropHint': 'PDF, PowerPoint (PPTX), Word or an image · you can drag it here', 'lm.classFor': 'Class', 'lm.noClassPick': 'No class', 'lm.myLessons': 'My lessons', 'lm.myDecks': 'My presentations', 'lm.opening': 'Opening the file…', 'lm.s.ai': 'AI', 'lm.s.timer': 'Timer', 'lm.s.picker': 'Student', 'lm.s.noise': 'Noise', 'lm.s.journal': 'Register', 'lm.s.groups': 'Groups', 'lm.s.board': 'Board', 'lm.s.dark': 'Screen', 'lm.s.upload': 'File', 'lm.material': 'Material',
    'lm.slides': 'Slides', 'lm.game': 'Game', 'lm.quiz': 'Quiz', 'lm.test': 'Test', 'lm.hw': 'Homework', 'lm.file': 'File', 'lm.upload': 'Open your own file (PDF, PPTX, DOCX)',
    'lm.prev': 'Back', 'lm.next': 'Next', 'lm.finish': 'Finish', 'lm.exit': 'Leave the lesson',
    'lm.t.ai': 'AI chat', 'lm.t.timer': 'Timer', 'lm.t.picker': 'Student picker', 'lm.t.noise': 'Noise meter', 'lm.t.journal': 'Register and attendance', 'lm.t.groups': 'Groups', 'lm.t.board': 'Board', 'lm.t.dark': 'Black out the screen',
    'lm.none.slides': 'This lesson has no slides.', 'lm.none.game': 'This lesson has no games.', 'lm.none.quiz': 'This lesson has no quiz.', 'lm.none.test': 'This lesson has no test.', 'lm.none.hw': 'No homework yet.', 'lm.none.file': 'Open your own file — PDF, PPTX or DOCX.',
    'lm.make': 'Create', 'lm.chooseFile': 'Choose a file', 'lm.fileErr': 'Could not open the file', 'lm.fileLabel': 'File', 'lm.pageOf': '{r} · {i} of {n}',
    'lm.hwDue': 'Due {d}', 'lm.hwOnline': 'Online test · {n} questions', 'lm.hwNotebook': 'Notebook task — send a photo',
    'lm.autosave': 'Saved automatically', 'lm.close': 'Close panel', 'lm.journal': 'Register', 'lm.attendance': 'Attendance', 'lm.groups': 'Groups', 'lm.came': '{n} of {total} here', 'lm.plusAll': '+1 everyone', 'lm.allHere': 'Everyone is here',
    'lm.here': 'Here', 'lm.absent': 'Absent', 'lm.minus': 'Minus a point', 'lm.plus': 'Plus a point', 'lm.noClass': 'Choose a class to keep the register', 'lm.noStudents': 'No students in this class — add them in Classes.',
    'lm.groupsSub': 'Only those here · {n}', 'lm.howMany': 'How many groups', 'lm.howSplit': 'How to split', 'lm.byPoints': 'Evenly by points', 'lm.random': 'Randomly', 'lm.group': 'Group {n}', 'lm.shuffle': 'Shuffle', 'lm.groupWheel': 'Group wheel', 'lm.makeGroups': 'Split into groups',
    'lm.noise': 'Noise meter', 'lm.noiseSub': 'Shown in the corner of the slide', 'lm.balls': 'Balls', 'lm.ballsSub': 'jump with the noise', 'lm.monster': 'Monster', 'lm.scale': 'Scale',
    'lm.mood.sleep': 'Quiet — the monster is asleep', 'lm.mood.mid': 'A bit noisy — the monster opened its eyes', 'lm.mood.loud': 'Loud! The monster woke up and asks for quiet', 'lm.shh': 'Shh… a little quieter!',
    'lm.silence': 'Silence timer', 'lm.silenceSub': 'Runs while the class is quiet', 'lm.min': '{n} min', 'lm.pause': 'Pause', 'lm.play': 'Start', 'lm.reset': 'Reset',
    'lm.mic': 'Turn on the microphone', 'lm.micOff': 'Turn off the microphone', 'lm.micErr': 'No microphone access — allow it in the browser', 'lm.testLevel': 'Try it: class volume', 'lm.quiet': 'quiet', 'lm.loud': 'loud', 'lm.threshold': 'threshold: {n}%',
    'lm.timer': 'Timer', 'lm.timerSub': 'Shown at the bottom instead of the clock', 'lm.stopwatch': 'Stopwatch', 'lm.timeUp': 'Time is up',
    'lm.ai': 'AI chat', 'lm.aiSub': 'Your helper in class', 'lm.send': 'Send', 'lm.aiPh': 'Ask anything…', 'lm.aiHello': 'Ask: “explain it simpler”, “one more example”, “a question for the class”.', 'lm.ai.simpler': 'Explain simpler', 'lm.ai.example': 'One more example', 'lm.ai.question': 'Class question',
    'lm.board': 'Board', 'lm.eraser': 'Eraser', 'lm.clear': 'Clear', 'lm.darkHint': 'Tap to come back', 'lm.finished': 'Lesson finished — register saved', 'lm.notFound': 'Lesson not found',
    'lm.answering': 'Answering', 'lm.nobody': '—'
  }
});

// Minimal line icons for the lesson tools (24×24, thin stroke).
const TOOLS = [
  ['ai', 'M12 4v4M12 16v4M4 12h4M16 12h4M7 7l1.5 1.5M15.5 15.5L17 17M17 7l-1.5 1.5M8.5 15.5L7 17'],
  ['timer', 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2'],
  ['picker', 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 3v18M3 12h18'],
  ['noise', 'M6 10v4M10 7v10M14 5v14M18 9v6'],
  ['journal', 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01'],
  ['groups', 'M8 8a3 3 0 1 0 0 6a3 3 0 1 0 0-6M16 8a3 3 0 1 0 0 6a3 3 0 1 0 0-6M3 20c.8-2.5 2.7-4 5-4s4.2 1.5 5 4M11 20c.8-2.5 2.7-4 5-4s4.2 1.5 5 4'],
  ['whiteboard', 'M3 5h18v12H3zM12 17v3'],
  ['pencil', 'M5 19l1-4L16 5l3 3L9 18z'],
  ['dark', 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 3v18']
];
const I = {
  upload: 'M12 15V4M8 8l4-4 4 4M5 20h14',
  list: 'M4 7h16M4 12h16M4 17h10',
  hide: 'M6 15l6-6 6 6',
  show: 'M6 9l6 6 6-6',
  full: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  soundOn: 'M5 9v6h4l5 4V5L9 9zM17 9a4 4 0 0 1 0 6',
  soundOff: 'M5 9v6h4l5 4V5L9 9zM17 10l4 4M21 10l-4 4',
  prev: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7'
};
const SIDE = ['ai', 'journal', 'groups']; // open on the right, the slide gets smaller
const MATS = ['slides', 'game', 'quiz', 'test', 'hw'];

let S = null; // everything about the lesson on screen

export async function render(main, { args, query }) {
  const key = args[0];
  const lesson = key && !['deck', 'test', 'file'].includes(key) ? await db.lessons.get(key) : null;
  if (key && !['deck', 'test', 'file'].includes(key) && !lesson) {
    main.innerHTML = `<div class="empty" style="margin:40px"><h2>${esc(t('lm.notFound'))}</h2><div class="row"><a class="btn-k" href="#/lessons">${esc(t('les.back'))}</a></div></div>`;
    return;
  }
  const p = (lesson && lesson.parts) || {};
  const [deck, games, quiz, test, hw, classes, settings] = await Promise.all([
    query.deck ? db.presentations.get(query.deck) : p.presentationId ? db.presentations.get(p.presentationId) : null,
    Promise.all((p.gameIds || []).map(id => db.games.get(id))).then(x => x.filter(Boolean)),
    p.quizId ? db.tests.get(p.quizId) : null,
    query.test ? db.tests.get(query.test) : p.testId ? db.tests.get(p.testId) : null,
    p.homeworkId ? db.homework.get(p.homeworkId) : null,
    db.classes.list(), db.settings.get()
  ]);
  const live = (lesson && lesson.live) || {};
  S = {
    main, lesson, deck, games, quiz, test, hw, classes, settings, quick: !lesson && !deck && !test,
    classId: (lesson && lesson.classId) || live.classId || null, students: [], journal: new Map(),
    material: query.test ? 'test' : live.material || (deck ? 'slides' : games.length ? 'game' : test ? 'test' : 'file'),
    page: live.page || 0, gameIdx: 0, panel: null, file: null, filePage: 0, choosing: null,
    groups: live.groups || null, groupScores: live.groupScores || [], quizLog: live.quizLog || [], startedAt: live.startedAt || new Date().toISOString(), answered: new Set(live.answered || []), lastPicked: null,
    timer: { mode: 'down', total: 300, left: 300, running: false, start: 0, acc: 0 },
    noise: { display: live.noiseDisplay || 'monster', level: 0, threshold: 65, mic: null, balls: null, silence: 300, silenceLeft: 300, silenceRunning: false, error: '' },
    wins: { timer: false, noise: false }, pos: {}, collapsed: false,
    started: Date.now(), chat: [], saveTimer: null, tick: null, board: null, uiTimer: null
  };
  await loadClass(S.classId);
  draw();
  bindKeys();
  S.tick = setInterval(tick, 1000);
  if (deck && deck.slides.some(x => !x.imageUrl && !x.imageTried && x.image_query)) {
    fillImages(deck.id, d => { if (S && S.deck && S.deck.id === d.id) { S.deck = d; if (S.material === 'slides') drawContent(); } });
  }
  return cleanup;
}

async function loadClass(classId) {
  S.classId = classId;
  S.students = classId ? (await db.students.list({ classId })).sort((a, b) => a.name.localeCompare(b.name, 'ru')) : [];
  S.journal = new Map();
  if (S.lesson) (await db.marks.list({ lessonId: S.lesson.id })).forEach(m => S.journal.set(m.studentId, m));
  S.students.forEach(s => { if (!S.journal.has(s.id)) S.journal.set(s.id, { studentId: s.id, present: true, points: 0 }); });
}

function cleanup() {
  clearInterval(S.tick);
  clearTimeout(S.uiTimer);
  stopMic();
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('pointermove', showUi);
  saveNow();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  S = null;
}

/* ---------- saving the register and the live state ---------- */

async function ensureLesson() {
  if (S.lesson) return S.lesson;
  S.lesson = await db.lessons.create({ classId: S.classId, topic: (S.deck && S.deck.title) || (S.test && S.test.title) || '', subject: (S.classes.find(c => c.id === S.classId) || {}).subject || '', date: today(), slot: null, status: 'ready', parts: { presentationId: S.deck ? S.deck.id : null, testId: S.test ? S.test.id : null } });
  return S.lesson;
}
function save() { clearTimeout(S.saveTimer); S.saveTimer = setTimeout(saveNow, 700); }
async function saveNow() {
  if (!S) return;
  clearTimeout(S.saveTimer);
  const st = S;
  if (!st.classId && !st.lesson) return;
  const lesson = await ensureLesson();
  await db.lessons.update(lesson.id, { classId: st.classId, live: { material: st.material, page: st.page, groups: st.groups, groupScores: st.groupScores, answered: [...st.answered], classId: st.classId, noiseDisplay: st.noise.display, quizLog: st.quizLog, startedAt: st.startedAt } });
  for (const [sid, m] of st.journal) {
    const data = { lessonId: lesson.id, classId: st.classId, studentId: sid, date: lesson.date || today(), present: m.present, points: m.points || 0 };
    if (m.id) await db.marks.update(m.id, data);
    else if (m.touched) { const created = await db.marks.create(data); m.id = created.id; }
  }
}

/* ---------- drawing ---------- */

const matAvailable = m => ({ slides: !!S.deck, game: S.games.length > 0, quiz: !!(S.quiz && S.quiz.questions.length), test: !!(S.test && S.test.questions.length), hw: !!S.hw, file: !!S.file })[m];
const ratioOf = () => (S.material === 'file' && S.file ? S.file.ratio : S.material === 'slides' && S.deck && S.deck.ratio === '4:3' ? 4 / 3 : 16 / 9);
const side = () => SIDE.includes(S.panel);

function draw() {
  const m = S.main;
  m.innerHTML = `<div class="lm${side() ? ' has-panel' : ''}${S.collapsed ? ' collapsed' : ''}">
    <div class="lm-left" data-left>
      <div class="lm-stage" data-stage>
        <div class="lm-fit" style="--r:${ratioOf()}"><div class="lm-content" data-content></div>
          <canvas class="lm-board" data-board hidden></canvas>
        </div>
        <button type="button" class="lm-arrow prev" data-prev aria-label="${esc(t('lm.prev'))}">${icon(I.prev, 30).__raw}</button>
        <button type="button" class="lm-arrow next" data-next aria-label="${esc(t('lm.next'))}">${icon(I.next, 30).__raw}</button>
        <div class="lm-wins" data-wins></div>
      </div>
      <div class="lm-isle top" data-top></div>
      <div class="lm-isle bottom" data-bottom></div>
    </div>
    ${side() ? `<aside class="lm-panel" data-panel></aside>` : ''}
  </div><input type="file" accept=".pdf,.pptx,.docx,image/*" hidden data-fileinput>`;
  drawIsles();
  drawContent();
  if (side()) drawPanel();
  drawWins();
  bindStage();
  if (S.board) board(S.board.mode, true);
}

/* The two floating "islands": time + Finish at the top, materials and tools at the bottom. */
function drawIsles() {
  const top = S.main.querySelector('[data-top]'), bottom = S.main.querySelector('[data-bottom]');
  const tm = S.timer;
  const timerBadge = tm.running || (tm.mode === 'down' && tm.left !== tm.total) || (tm.mode === 'up' && tm.acc)
    ? `<button type="button" class="isle-timer${tm.left === 0 && tm.mode === 'down' ? ' done' : ''}" data-tool="timer">${icon('M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2', 16).__raw}<b data-isletimer>${fmt(tm.mode === 'down' ? tm.left : elapsedTimer())}</b></button>` : '';
  top.innerHTML = `<span class="isle-time" title="${esc(t('lm.lessonTime'))}"><i class="rec"></i><b data-clock>${fmt((Date.now() - S.started) / 1000)}</b></span>${timerBadge}
    <button type="button" class="isle-ic" data-full aria-label="${esc(t('lm.full'))}" title="${esc(t('lm.full'))}">${icon(I.full, 18).__raw}</button>
    <button type="button" class="isle-finish" data-finish>${esc(t('lm.finish'))}</button>`;
  if (S.collapsed) {
    bottom.innerHTML = `<button type="button" class="isle-ic wide" data-collapse aria-label="${esc(t('lm.show'))}" title="${esc(t('lm.show'))}">${icon(I.hide, 20).__raw}<span>${esc(t('lm.show'))}</span></button>`;
  } else {
    const mats = [...MATS, ...(S.file ? ['file'] : [])];
    const pi = pager();
    const on = id => (S.panel === id || S.wins[id] || (S.board && S.board.mode === id) ? ' on' : '');
    bottom.innerHTML = `
      <select class="dk-sel" data-matsel aria-label="${esc(t('lm.material'))}">${mats.map(x => `<option value="${x}" ${x === S.material ? 'selected' : ''}>${esc(t('lm.' + x))}</option>`).join('')}</select>
      ${['game', 'quiz', 'test', 'hw'].includes(S.material) ? `<button type="button" class="isle-ic" data-choose aria-label="${esc(t('lm.others'))}" title="${esc(t('lm.others'))}">${icon(I.list, 20).__raw}<span>${esc(t('lm.others'))}</span></button>` : ''}
      <button type="button" class="isle-ic" data-upload aria-label="${esc(t('lm.upload'))}" title="${esc(t('lm.upload'))}">${icon(I.upload, 20).__raw}<span>${esc(t('lm.s.upload'))}</span></button>
      ${pi ? `<span class="isle-page">${pi.i} / ${pi.n}</span>` : ''}
      <span class="isle-sep"></span>
      ${TOOLS.map(([id, d]) => `<button type="button" class="isle-ic${on(id)}" data-tool="${id}" aria-label="${esc(t('lm.t.' + id))}" title="${esc(t('lm.t.' + id))}">${icon(d, 20).__raw}<span>${esc(t('lm.s.' + id))}</span></button>`).join('')}
      <span class="isle-sep"></span>
      <button type="button" class="isle-ic" data-sound aria-label="${esc(soundOn() ? t('lm.sound.on') : t('lm.sound.off'))}" title="${esc(soundOn() ? t('lm.sound.on') : t('lm.sound.off'))}">${icon(soundOn() ? I.soundOn : I.soundOff, 20).__raw}<span>${esc(t('lm.s.sound'))}</span></button>
      <button type="button" class="isle-ic" data-collapse aria-label="${esc(t('lm.hide'))}" title="${esc(t('lm.hide'))}">${icon(I.show, 20).__raw}<span>${esc(t('lm.s.hide'))}</span></button>`;
  }
  bindIsles();
}

/** The first screen of "Start lesson" without a prepared lesson: own file + class. */
function startCard(el) {
  el.parentElement.classList.add('free');
  el.innerHTML = `<div class="lm-start">
    <h2>${esc(t('lm.startTitle'))}</h2><p>${esc(t('lm.startText'))}</p>
    <button type="button" class="lm-drop" data-upload2>${icon(I.upload, 30).__raw}<b>${esc(t('lm.drop'))}</b><span>${esc(t('lm.dropHint'))}</span></button>
    ${S.classes.length ? `<div class="lm-start-row"><span class="k">${esc(t('lm.classFor'))}</span>${S.classes.map(c => `<button type="button" class="lm-chip${c.id === S.classId ? ' on' : ''}" data-startclass="${c.id}">${esc(c.name)}</button>`).join('')}<button type="button" class="lm-chip${S.classId ? '' : ' on'}" data-startclass="">${esc(t('lm.noClassPick'))}</button></div>` : ''}
    <div class="lm-start-row links"><a href="#/lessons">${esc(t('lm.myLessons'))} →</a><a href="#/presentations?list=1">${esc(t('lm.myDecks'))} →</a></div>
  </div>`;
  el.querySelector('[data-upload2]').onclick = () => S.main.querySelector('[data-fileinput]').click();
  el.querySelectorAll('[data-startclass]').forEach(b => b.onclick = async () => { await loadClass(b.dataset.startclass || null); drawContent(); if (side()) drawPanel(); });
}

async function loadOwnFile(f) {
  if (!f) return;
  const el = S.main.querySelector('[data-content]');
  if (el && !S.file) el.innerHTML = `<div class="lm-none"><span class="np-dot run"></span><p>${esc(t('lm.opening'))}</p></div>`;
  try { S.file = await openFile(f); S.filePage = 0; S.material = 'file'; S.choosing = null; draw(); }
  catch (err) { console.error(err); toast(t('lm.fileErr')); drawContent(); }
}

function pager() {
  if (S.choosing) return null;
  if (S.material === 'slides' && S.deck) return { i: S.page + 1, n: S.deck.slides.length };
  if (S.material === 'file' && S.file) return { i: S.filePage + 1, n: S.file.pages.length };
  if (S.material === 'game' && S.games.length > 1) return { i: S.gameIdx + 1, n: S.games.length };
  return null;
}

function drawContent() {
  const el = S.main.querySelector('[data-content]');
  const box = S.main.querySelector('.lm-fit');
  el.className = 'lm-content mat-' + S.material;
  el.parentElement.classList.remove('free');
  const arrows = !!pager();
  S.main.querySelectorAll('.lm-arrow').forEach(a => { a.hidden = !arrows; });
  if (S.choosing || (!matAvailable(S.material) && ['game', 'quiz', 'test', 'hw'].includes(S.material))) return chooser(el, S.choosing || S.material);
  if (!matAvailable(S.material)) {
    if (S.material === 'file' && S.quick) return startCard(el);
    const make = { slides: '#/presentations', file: null }[S.material];
    el.innerHTML = `<div class="lm-none"><p>${esc(t('lm.none.' + S.material))}</p>${S.material === 'file'
      ? `<button type="button" class="btn-k btn-md" data-upload2>${esc(t('lm.chooseFile'))}</button>`
      : `<a class="btn-o btn-md" href="${make}">${esc(t('lm.make'))}</a>`}</div>`;
    const u = el.querySelector('[data-upload2]'); if (u) u.onclick = () => S.main.querySelector('[data-fileinput]').click();
    return;
  }
  if (S.material === 'slides') {
    S.page = Math.max(0, Math.min(S.page, S.deck.slides.length - 1));
    el.innerHTML = slideBox(S.deck.slides[S.page], S.deck, S.page, 'present');
    bindGames(el);
    renderMath(el);
  } else if (S.material === 'game') {
    el.innerHTML = '<div class="lm-card"><div data-g></div></div>';
    playGame(el.querySelector('[data-g]'), S.games[S.gameIdx]);
  } else if (S.material === 'quiz') {
    el.innerHTML = '<div class="lm-card"><div data-g></div></div>';
    playGame(el.querySelector('[data-g]'), { type: 'quiz', questions: S.quiz.questions }, {
      onAnswer: (i, ok) => { const r = S.quizLog[i] || { ok: 0, all: 0 }; S.quizLog[i] = { ok: r.ok + (ok ? 1 : 0), all: r.all + 1 }; save(); }
    });
  } else if (S.material === 'test') {
    el.innerHTML = `<div class="lm-card scroll"><h2 class="lm-h">${esc(S.test.title || '')}</h2><div data-g></div></div>`;
    playTest(el.querySelector('[data-g]'), S.test);
  } else if (S.material === 'hw') {
    const h = S.hw;
    el.innerHTML = `<div class="lm-card hw"><span class="k">${esc(t('lm.hw'))}</span><h2 class="lm-h big">${esc(h.title || '')}</h2>
      <p class="lead">${esc(h.kind === 'online' ? t('lm.hwOnline', { n: (h.questions || []).length }) : t('lm.hwNotebook'))}</p>
      ${h.instructions ? `<p class="txt">${esc(h.instructions)}</p>` : ''}${h.dueDate ? `<span class="due">${esc(t('lm.hwDue', { d: shortDate(h.dueDate) }))}</span>` : ''}</div>`;
  } else if (S.material === 'file') drawFilePage(el, box);
}

/* Games, quizzes, tests and homework: the ones made for this lesson first, then all the older ones. */
async function chooser(el, what) {
  el.parentElement.classList.add('free');
  const lessonId = S.lesson && S.lesson.id;
  let items = [];
  if (what === 'game') items = (await db.games.list()).map(g => ({ id: g.id, title: g.title || t('g.' + g.type), meta: t('g.' + g.type), lessonId: g.lessonId, at: g.updatedAt || g.createdAt, row: g }));
  else if (what === 'quiz') items = (await db.tests.list(x => x.kind === 'quiz')).map(q => ({ id: q.id, title: q.title || t('lm.quiz'), meta: t('lm.hwOnline', { n: q.questions.length }).split('·').pop().trim(), lessonId: q.lessonId, at: q.updatedAt || q.createdAt, row: q }));
  else if (what === 'test') items = (await db.tests.list(x => x.kind !== 'quiz')).map(q => ({ id: q.id, title: q.title || t('lm.test'), meta: t('lm.hwOnline', { n: q.questions.length }).split('·').pop().trim(), lessonId: q.lessonId, at: q.updatedAt || q.createdAt, row: q }));
  else items = (await db.homework.list()).map(h => ({ id: h.id, title: h.title || t('lm.hw'), meta: h.kind === 'online' ? t('lm.hwOnline', { n: (h.questions || []).length }) : t('lm.hwNotebook'), lessonId: h.lessonId, at: h.updatedAt || h.createdAt, row: h }));
  if (!S || !el.isConnected) return;
  items.sort((a, b) => (b.lessonId === lessonId && lessonId ? 1 : 0) - (a.lessonId === lessonId && lessonId ? 1 : 0) || String(b.at).localeCompare(String(a.at)));
  const current = { game: S.games[S.gameIdx], quiz: S.quiz, test: S.test, hw: S.hw }[what];
  const make = { game: '#/tests?tab=games', quiz: '#/tests?tab=games', test: '#/tests?new=1', hw: '#/homework' }[what];
  el.innerHTML = `<div class="lm-choose">
    <div class="lm-choose-h"><h2>${esc(t('lm.pick.title', { what: t('lm.pick.' + what) }))}</h2>${current ? `<button type="button" class="btn-o btn-md" data-chooseback>${esc(t('lm.back'))}</button>` : ''}</div>
    ${items.length ? `<div class="lm-choose-list">${items.map(x => `<button type="button" class="lm-item${current && current.id === x.id ? ' on' : ''}" data-pick="${x.id}">
      <b>${esc(x.title)}</b><span>${esc(x.meta)}${x.lessonId && x.lessonId === lessonId ? ` · <i>${esc(t('lm.thisLesson'))}</i>` : ''}</span></button>`).join('')}</div>`
      : `<div class="lm-none"><p>${esc(t('lm.pick.none'))}</p><a class="btn-o btn-md" href="${make}">${esc(t('lm.make'))}</a></div>`}
  </div>`;
  const back = el.querySelector('[data-chooseback]'); if (back) back.onclick = () => { S.choosing = null; drawContent(); drawIsles(); };
  el.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const x = items.find(i => i.id === b.dataset.pick).row;
    if (what === 'game') { const k = S.games.findIndex(g => g.id === x.id); if (k >= 0) S.gameIdx = k; else { S.games = [x, ...S.games]; S.gameIdx = 0; } }
    else if (what === 'quiz') { S.quiz = x; S.quizLog = []; }
    else if (what === 'test') S.test = x;
    else S.hw = x;
    S.choosing = null; S.material = what;
    sfx.click();
    drawContent(); drawIsles(); save();
  });
}

async function drawFilePage(el, box) {
  const pg = S.file.pages[S.filePage];
  if (pg.type === 'pdf') {
    el.innerHTML = '<canvas class="lm-pdf"></canvas>';
    await pg.render(el.querySelector('canvas'), box.clientWidth || 1200);
  } else if (pg.type === 'image') el.innerHTML = `<img class="lm-img" src="${esc(pg.src)}" alt="">`;
  else if (pg.type === 'doc') {
    const doc = new DOMParser().parseFromString(pg.html, 'text/html');
    doc.querySelectorAll('script,style,iframe,object').forEach(x => x.remove());
    doc.querySelectorAll('*').forEach(x => [...x.attributes].forEach(a => { if (/^on/i.test(a.name) || (a.name === 'href' && /^javascript:/i.test(a.value))) x.removeAttribute(a.name); }));
    el.innerHTML = `<div class="lm-doc">${doc.body.innerHTML}</div>`;
  } else {
    el.innerHTML = `<div class="lm-pptx"><h2>${esc(pg.title)}</h2><div class="cols">${pg.body.length ? `<ul>${pg.body.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}${pg.images.length ? `<div class="imgs">${pg.images.slice(0, 4).map(src => `<img src="${esc(src)}" alt="">`).join('')}</div>` : ''}</div></div>`;
  }
}

/* ---------- small floating windows: timer and noise meter (both can be open) ---------- */

function drawWins() {
  const host = S.main.querySelector('[data-wins]');
  if (!host) return;
  host.innerHTML = ['timer', 'noise'].filter(w => S.wins[w]).map(w => {
    const pos = S.pos[w];
    const style = pos ? `left:${pos.x}px;top:${pos.y}px` : '';
    return `<div class="lm-win win-${w}" data-win="${w}" style="${style}"><div class="win-h" data-drag="${w}"><b>${esc(t('lm.' + w))}</b><button type="button" class="pn-x" data-closewin="${w}" aria-label="${esc(t('lm.close'))}">${icon('close', 12).__raw}</button></div><div class="win-b">${w === 'timer' ? timerBody() : noiseBody()}</div></div>`;
  }).join('');
  // Windows the teacher has not moved stack down the right side without covering each other.
  let y = 70;
  host.querySelectorAll('[data-win]').forEach(win => {
    if (!S.pos[win.dataset.win]) { win.style.right = '18px'; win.style.top = y + 'px'; }
    y += win.offsetHeight + 12;
  });
  bindWins(host);
  const c = host.querySelector('[data-ballscanvas]');
  if (S.noise.balls) { S.noise.balls.stop(); S.noise.balls = null; }
  if (c) { S.noise.balls = new Balls(c); S.noise.balls.level = S.noise.level; }
}

function timerBody() {
  const tm = S.timer;
  return `<div class="tm-big${tm.mode === 'down' && tm.left <= 5 && tm.running ? ' warn' : ''}" data-tmbig>${fmt(tm.mode === 'down' ? tm.left : elapsedTimer())}</div>
    <div class="nums wide">${[1, 3, 5, 10, 15].map(m => `<button type="button" class="${tm.mode === 'down' && tm.total === m * 60 ? 'on' : ''}" data-tmset="${m}">${esc(t('lm.min', { n: m }))}</button>`).join('')}</div>
    <div class="pn-row gap"><button type="button" class="btn-o grow" data-tmminus>−1</button><button type="button" class="btn-o grow" data-tmplus>+1</button><button type="button" class="btn-o grow${tm.mode === 'up' ? ' on' : ''}" data-tmup>${esc(t('lm.stopwatch'))}</button></div>
    <div class="pn-row gap"><button type="button" class="btn-k grow btn-md" data-tmplay>${esc(tm.running ? t('lm.pause') : t('lm.play'))}</button><button type="button" class="btn-o grow btn-md" data-tmreset>${esc(t('lm.reset'))}</button></div>`;
}

function noiseBody() {
  const n = S.noise, mood = moodOf(n.level, n.threshold);
  const status = n.error ? n.error : !n.mic ? t('lm.micAsk') : n.mic.calibrating ? t('lm.calibrating') : t('lm.mood.' + mood);
  const visual = n.display === 'monster' ? `<div class="nz-monster" data-nzvis>${monsterSvg(mood, 150)}</div>`
    : n.display === 'scale' ? `<div class="nz-scale"><i data-nzbar style="width:${n.level}%;background:${mood === 'loud' ? '#FF5A5F' : mood === 'mid' ? '#FFB400' : '#06D6A0'}"></i></div>`
      : '<canvas class="nz-balls" data-ballscanvas></canvas>';
  return `<div class="seg pn-tabs">${['monster', 'balls', 'scale'].map(x => `<button type="button" data-disp="${x}" aria-selected="${n.display === x}">${esc(t('lm.' + x))}</button>`).join('')}</div>
    ${visual}
    <div class="nz-status${mood === 'loud' && n.mic && !n.mic.calibrating ? ' loud' : ''}" data-nzstatus>${esc(status)}</div>
    <div class="nz-sil"><div class="grow"><span class="small">${esc(t('lm.silence'))}</span><b data-silence>${fmt(n.silenceLeft)}</b></div>
      <div class="nums">${[3, 5, 10].map(m => `<button type="button" class="${n.silence === m * 60 ? 'on' : ''}" data-sil="${m}">${m}′</button>`).join('')}<button type="button" data-silplay aria-label="${esc(n.silenceRunning ? t('lm.pause') : t('lm.play'))}">${n.silenceRunning ? '❚❚' : '▶'}</button></div></div>
    ${n.mic && !n.mic.calibrating ? `<button type="button" class="link-btn" data-recal>${esc(t('lm.recalibrate'))}</button>` : ''}`;
}

async function startMic() {
  const n = S.noise;
  if (n.mic) return;
  n.error = '';
  try {
    n.mic = new Mic(level => { n.level = level; onLevel(); }, () => { if (S && S.wins.noise) drawWins(); });
    await n.mic.start();
  } catch (e) { n.mic = null; n.error = t('lm.micErr'); }
  if (S && S.wins.noise) drawWins();
}
function stopMic() {
  const n = S && S.noise; if (!n) return;
  if (n.mic) { n.mic.stop(); n.mic = null; }
  if (n.balls) { n.balls.stop(); n.balls = null; }
}

function onLevel() {
  if (!S) return;
  const n = S.noise;
  if (n.balls) n.balls.level = n.level;
  const mood = moodOf(n.level, n.threshold);
  if (mood !== n.lastMood) {
    n.lastMood = mood;
    if (mood === 'loud' && Date.now() - (n.lastShh || 0) > 8000) { n.lastShh = Date.now(); sfx.shh(); }
    const vis = S.main.querySelector('[data-nzvis]'); if (vis) vis.innerHTML = monsterSvg(mood, 150);
    const st = S.main.querySelector('[data-nzstatus]'); if (st && n.mic && !n.mic.calibrating) { st.textContent = t('lm.mood.' + mood); st.classList.toggle('loud', mood === 'loud'); }
  }
  const bar = S.main.querySelector('[data-nzbar]');
  if (bar) { bar.style.width = n.level + '%'; bar.style.background = mood === 'loud' ? '#FF5A5F' : mood === 'mid' ? '#FFB400' : '#06D6A0'; }
}

function bindWins(host) {
  const on = (s, fn) => host.querySelectorAll(s).forEach(b => b.onclick = e => fn(b, e));
  on('[data-closewin]', b => { const w = b.dataset.closewin; S.wins[w] = false; if (w === 'noise') stopMic(); drawWins(); drawIsles(); });
  // timer
  const tm = S.timer;
  const redraw = () => { drawWins(); drawIsles(); };
  on('[data-tmset]', b => { tm.mode = 'down'; tm.total = tm.left = Number(b.dataset.tmset) * 60; tm.running = false; sfx.click(); redraw(); });
  on('[data-tmminus]', () => { tm.mode = 'down'; tm.total = tm.left = Math.max(60, tm.left - 60); redraw(); });
  on('[data-tmplus]', () => { tm.mode = 'down'; tm.left += 60; tm.total = Math.max(tm.total, tm.left); redraw(); });
  on('[data-tmup]', () => { tm.mode = 'up'; tm.running = false; tm.acc = 0; redraw(); });
  on('[data-tmplay]', () => {
    if (tm.mode === 'down' && tm.left === 0) tm.left = tm.total;
    tm.running = !tm.running; tm.start = Date.now();
    if (tm.running) sfx.start(); else if (tm.mode === 'up') tm.acc = elapsedTimer();
    redraw();
  });
  on('[data-tmreset]', () => { tm.running = false; tm.left = tm.total; tm.acc = 0; redraw(); });
  // noise
  on('[data-disp]', b => { S.noise.display = b.dataset.disp; drawWins(); save(); });
  on('[data-sil]', b => { S.noise.silence = S.noise.silenceLeft = Number(b.dataset.sil) * 60; drawWins(); });
  on('[data-silplay]', () => { S.noise.silenceRunning = !S.noise.silenceRunning; drawWins(); });
  on('[data-recal]', () => { if (S.noise.mic) { S.noise.mic.recalibrate(); drawWins(); } });
  // drag windows by their header
  host.querySelectorAll('[data-drag]').forEach(h => {
    h.onpointerdown = e => {
      if (e.target.closest('button')) return;
      const win = h.closest('[data-win]'), stage = S.main.querySelector('[data-stage]');
      const r = win.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      h.setPointerCapture(e.pointerId);
      h.onpointermove = ev => {
        const x = Math.max(0, Math.min(sr.width - r.width, ev.clientX - sr.left - dx));
        const y = Math.max(0, Math.min(sr.height - 40, ev.clientY - sr.top - dy));
        win.style.left = x + 'px'; win.style.top = y + 'px'; win.style.right = 'auto';
        S.pos[win.dataset.win] = { x, y };
      };
      h.onpointerup = () => { h.onpointermove = null; };
    };
  });
}

/* ---------- right panel: register with attendance and groups together, or AI chat ---------- */

function drawPanel() {
  const el = S.main.querySelector('[data-panel]');
  if (!el) return;
  const cls = S.classes.find(c => c.id === S.classId);
  const head = (title, sub) => `<div class="pn-head"><div><b>${esc(title)}</b><span>${esc(sub)}</span></div><button type="button" class="pn-x" data-closepanel aria-label="${esc(t('lm.close'))}">${icon('close', 13).__raw}</button></div>`;
  let body = '';
  if (S.panel === 'ai') body = head(t('lm.ai'), t('lm.aiSub')) + aiBody();
  else {
    const title = [cls && cls.name, S.lesson && S.lesson.topic].filter(Boolean).join(' · ') || t('lm.journal');
    if (!S.classId) body = head(t('lm.journal'), t('lm.noClass')) + `<div class="pn-classes">${S.classes.map(c => `<button type="button" class="btn-o" data-pickclass="${c.id}">${esc(c.name)}</button>`).join('')}</div>`;
    else if (!S.students.length) body = head(title, t('lm.autosave')) + `<p class="muted-note">${esc(t('lm.noStudents'))}</p>`;
    else {
      const here = present().length;
      body = head(title, t('lm.autosave')) + `
        <div class="pn-scroll">
          <div class="pn-row"><b>${esc(t('lm.came', { n: here, total: S.students.length }))}</b><span class="pn-acts"><button type="button" class="btn-o btn-sm" data-allhere>${esc(t('lm.allHere'))}</button><button type="button" class="btn-o btn-sm" data-plusall>${esc(t('lm.plusAll'))}</button></span></div>
          <div class="pn-list">${S.students.map(s => {
            const m = S.journal.get(s.id);
            const g = S.groups ? S.groups.findIndex(x => x.includes(s.id)) : -1;
            return `<div class="st${m.present ? '' : ' away'}">
              <button type="button" class="att${m.present ? ' on' : ''}" data-att="${s.id}" aria-label="${esc(m.present ? t('lm.here') : t('lm.absent'))}" title="${esc(m.present ? t('lm.here') : t('lm.absent'))}">${icon(m.present ? 'check' : 'close', 13).__raw}</button>
              <span class="nm">${esc(s.name)}</span>${g >= 0 ? `<span class="gm" style="color:${TINTS[g]}">${MARKS[g]}</span>` : ''}
              <button type="button" class="pm" data-pt="${s.id}|-1" aria-label="${esc(t('lm.minus'))}">−</button><span class="sc">${m.points || 0}</span><button type="button" class="pm plus" data-pt="${s.id}|1" aria-label="${esc(t('lm.plus'))}">+</button>
            </div>`;
          }).join('')}</div>
          <div class="pn-sec" data-groupsec><b>${esc(t('lm.groups'))}</b><span class="small">${esc(t('lm.groupsSub', { n: here }))}</span></div>
          ${groupsBody()}
        </div>`;
    }
  }
  el.innerHTML = body;
  el.className = 'lm-panel pn-' + S.panel;
  bindPanel(el);
  if (S.panel === 'groups') { const g = el.querySelector('[data-groupsec]'); if (g) g.scrollIntoView({ block: 'start' }); }
  if (S.panel === 'ai') { const log = el.querySelector('.ag-log'); if (log) log.scrollTop = log.scrollHeight; }
}

const present = () => S.students.filter(s => S.journal.get(s.id).present);

function groupsBody() {
  const count = S.groups ? S.groups.length : 4;
  return `<div class="pn-row"><span class="lbl">${esc(t('lm.howMany'))}</span><span class="nums">${[2, 3, 4, 5].map(n => `<button type="button" class="${n === count ? 'on' : ''}" data-gcount="${n}">${n}</button>`).join('')}</span></div>
    <div class="pn-row"><span class="lbl">${esc(t('lm.howSplit'))}</span><select class="pill-sel" data-gmethod><option value="points">${esc(t('lm.byPoints'))}</option><option value="random" ${S.gmethod === 'random' ? 'selected' : ''}>${esc(t('lm.random'))}</option></select></div>
    ${S.groups ? `<div class="pn-groups">${S.groups.map((g, i) => `<div class="grp">
      <span class="mk" style="color:${TINTS[i]}">${MARKS[i]}</span>
      <span class="grow"><b>${esc(t('lm.group', { n: i + 1 }))}</b><span class="small">${esc(g.map(id => (S.students.find(s => s.id === id) || { name: '' }).name.split(' ')[0]).join(', '))}</span></span>
      <button type="button" class="pm" data-gpt="${i}|-1" aria-label="${esc(t('lm.minus'))}">−</button><span class="sc">${S.groupScores[i] || 0}</span><button type="button" class="pm plus" data-gpt="${i}|1" aria-label="${esc(t('lm.plus'))}">+</button>
    </div>`).join('')}</div>` : ''}
    <div class="pn-row gap">${S.groups ? `<button type="button" class="btn-o grow" data-gmake>${esc(t('lm.shuffle'))}</button><button type="button" class="btn-k grow" data-gwheel>${esc(t('lm.who'))}</button>` : `<button type="button" class="btn-k grow" data-gmake>${esc(t('lm.makeGroups'))}</button>`}</div>`;
}

function aiBody() {
  return `<div class="ag-log">${S.chat.length ? '' : `<div class="ag-msg bot"><span>${esc(t('lm.aiHello'))}</span></div>`}
    ${S.chat.map(c => `<div class="ag-msg ${c.role}">${esc(c.text)}</div>`).join('')}${S.aiBusy ? `<div class="ag-msg bot typing">${esc(t('ag.thinking'))}</div>` : ''}</div>
    <div class="ag-chips">${['simpler', 'example', 'question'].map(x => `<button type="button" class="chip" data-aiq="${x}">${esc(t('lm.ai.' + x))}</button>`).join('')}</div>
    <form class="ag-input" data-aiform><input name="q" placeholder="${esc(t('lm.aiPh'))}" aria-label="${esc(t('lm.aiPh'))}" autocomplete="off"><button type="submit" aria-label="${esc(t('lm.send'))}">${icon('M12 19V5M5 12l7-7 7 7').__raw}</button></form>`;
}

/* ---------- events ---------- */

function setPanel(id) {
  S.panel = S.panel === id || (id === 'groups' && S.panel === 'journal') ? null : id;
  draw();
}

function go(dir) {
  if (S.choosing) return;
  if (S.material === 'slides' && S.deck) S.page = Math.max(0, Math.min(S.deck.slides.length - 1, S.page + dir));
  else if (S.material === 'file' && S.file) S.filePage = Math.max(0, Math.min(S.file.pages.length - 1, S.filePage + dir));
  else if (S.material === 'game' && S.games.length > 1) S.gameIdx = (S.gameIdx + dir + S.games.length) % S.games.length;
  else return;
  drawContent();
  const pg = S.main.querySelector('.isle-page'), pi = pager(); if (pg && pi) pg.textContent = `${pi.i} / ${pi.n}`;
  save();
}

function showUi() {
  const left = S && S.main.querySelector('[data-left]');
  if (!left) return;
  left.classList.add('show-ui');
  clearTimeout(S.uiTimer);
  S.uiTimer = setTimeout(() => { if (S) { const l = S.main.querySelector('[data-left]'); if (l) l.classList.remove('show-ui'); } }, 2500);
}

function bindIsles() {
  const m = S.main;
  const q = s => m.querySelector(s);
  const sel = q('[data-matsel]'); if (sel) sel.onchange = () => { S.material = sel.value; S.choosing = null; sfx.click(); draw(); save(); };
  m.querySelectorAll('.lm-isle [data-tool]').forEach(b => b.onclick = () => tool(b.dataset.tool));
  q('[data-finish]').onclick = finish;
  q('[data-full]').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); };
  const up = q('[data-upload]'); if (up) up.onclick = () => q('[data-fileinput]').click();
  const ch = q('[data-choose]'); if (ch) ch.onclick = () => { S.choosing = S.choosing ? null : S.material; drawContent(); drawIsles(); };
  const snd = q('[data-sound]'); if (snd) snd.onclick = () => { setSound(!soundOn()); if (soundOn()) sfx.click(); drawIsles(); toast(soundOn() ? t('lm.sound.on') : t('lm.sound.off')); };
  q('[data-collapse]').onclick = () => { S.collapsed = !S.collapsed; draw(); };
}

function bindStage() {
  const m = S.main;
  m.querySelector('[data-prev]').onclick = () => go(-1);
  m.querySelector('[data-next]').onclick = () => go(1);
  m.querySelector('[data-fileinput]').onchange = e => loadOwnFile(e.target.files[0]);
  document.removeEventListener('pointermove', showUi);
  document.addEventListener('pointermove', showUi);
  const stage = m.querySelector('[data-stage]');
  stage.addEventListener('dragover', e => { e.preventDefault(); stage.classList.add('dropping'); });
  stage.addEventListener('dragleave', () => stage.classList.remove('dropping'));
  stage.addEventListener('drop', e => { e.preventDefault(); stage.classList.remove('dropping'); loadOwnFile(e.dataTransfer.files[0]); });
  // Swipe on the slide (interactive boards and tablets)
  let x0 = null;
  stage.addEventListener('pointerdown', e => { if (!S.board && !e.target.closest('.lm-win')) x0 = e.clientX; });
  stage.addEventListener('pointerup', e => { if (x0 != null && Math.abs(e.clientX - x0) > 80 && !e.target.closest('button, input, .lm-card, .lm-win')) go(e.clientX < x0 ? 1 : -1); x0 = null; });
}

function tool(id) {
  sfx.click();
  if (SIDE.includes(id)) return setPanel(id);
  if (id === 'timer' || id === 'noise') {
    S.wins[id] = !S.wins[id];
    if (id === 'noise') { if (S.wins.noise) startMic(); else stopMic(); }
    drawWins(); drawIsles();
    return;
  }
  if (id === 'picker') return picker();
  if (id === 'whiteboard' || id === 'pencil') return board(id);
  if (id === 'dark') {
    const d = document.createElement('div');
    d.className = 'lm-dark';
    d.innerHTML = `<span>${esc(t('lm.darkHint'))}</span>`;
    d.onclick = () => d.remove();
    S.main.appendChild(d);
  }
}

function picker() {
  const host = S.main.querySelector('[data-stage]');
  if (!present().length) { S.panel = 'journal'; draw(); return; }
  openPicker(host, {
    students: present().map(s => ({ id: s.id, name: s.name })),
    groups: S.groups ? S.groups.map(g => g.filter(id => S.journal.get(id) && S.journal.get(id).present)) : null,
    answered: S.answered,
    addPoint: (ids, n) => { addPoint(ids, n); S.lastPicked = ids[0]; },
    addGroupPoint: (gi, n) => { S.groupScores[gi] = (S.groupScores[gi] || 0) + n; save(); if (side()) drawPanel(); },
    openGroups: () => { S.panel = 'groups'; draw(); }
  }, () => { save(); });
}

function addPoint(ids, n) {
  ids.forEach(id => { const m = S.journal.get(id); if (m) { m.points = Math.max(0, (m.points || 0) + n); m.touched = true; } });
  save();
  if (side()) drawPanel();
}

function bindPanel(el) {
  const q = s => el.querySelector(s);
  const on = (s, fn) => el.querySelectorAll(s).forEach(b => b.onclick = () => fn(b));
  const keep = fn => { const sc = el.querySelector('.pn-scroll'); const top = sc ? sc.scrollTop : 0; fn(); const sc2 = el.querySelector('.pn-scroll'); if (sc2) sc2.scrollTop = top; };
  on('[data-closepanel]', () => { S.panel = null; draw(); });
  on('[data-pickclass]', async b => { await loadClass(b.dataset.pickclass); drawPanel(); save(); });
  on('[data-att]', b => { const m = S.journal.get(b.dataset.att); m.present = !m.present; m.touched = true; save(); keep(drawPanel); });
  on('[data-pt]', b => { const [id, n] = b.dataset.pt.split('|'); if (Number(n) > 0) sfx.right(); keep(() => addPoint([id], Number(n))); });
  on('[data-plusall]', () => { sfx.right(); keep(() => addPoint(present().map(s => s.id), 1)); });
  on('[data-allhere]', () => { S.journal.forEach(m => { m.present = true; m.touched = true; }); save(); keep(drawPanel); });
  on('[data-gcount]', b => keep(() => makeGroups(Number(b.dataset.gcount))));
  on('[data-gmake]', () => keep(() => makeGroups(S.groups ? S.groups.length : 4)));
  on('[data-gpt]', b => { const [i, n] = b.dataset.gpt.split('|').map(Number); if (n > 0) sfx.right(); S.groupScores[i] = Math.max(0, (S.groupScores[i] || 0) + n); save(); keep(drawPanel); });
  on('[data-gwheel]', () => picker());
  const gm = q('[data-gmethod]'); if (gm) gm.onchange = () => { S.gmethod = gm.value; keep(() => makeGroups(S.groups ? S.groups.length : 4)); };
  on('[data-aiq]', b => ask(t('lm.ai.' + b.dataset.aiq)));
  const f = q('[data-aiform]'); if (f) f.onsubmit = e => { e.preventDefault(); const v = f.q.value.trim(); if (v) ask(v); };
}

function makeGroups(count) {
  const here = present();
  let order;
  if (S.gmethod === 'random') order = [...here].sort(() => Math.random() - 0.5);
  else order = [...here].sort((a, b) => (S.journal.get(b.id).points || 0) - (S.journal.get(a.id).points || 0) || Math.random() - 0.5); // snake draft by points
  const groups = Array.from({ length: count }, () => []);
  order.forEach((s, i) => { const r = Math.floor(i / count), k = i % count; groups[r % 2 ? count - 1 - k : k].push(s.id); });
  S.groups = groups; S.groupScores = groups.map(() => 0);
  sfx.flip();
  save(); drawPanel();
}

async function ask(text) {
  S.chat.push({ role: 'user', text });
  S.aiBusy = true; drawPanel();
  const slide = S.deck && S.material === 'slides' ? S.deck.slides[S.page] : null;
  try {
    const res = await generateJSON(`[part:lessonchat]\nТы — помощник учителя прямо на уроке. Тема урока: "${(S.lesson && S.lesson.topic) || (S.deck && S.deck.title) || ''}". ${slide ? 'Сейчас на экране слайд: ' + JSON.stringify({ title: plain(slide.title), bullets: (slide.bullets || []).map(plain), question: slide.question }) : ''}
Ответь коротко (2–5 предложений), чтобы учитель мог сразу сказать это классу. Язык ответа — язык вопроса учителя (${lang() === 'kk' ? 'казахский' : lang() === 'en' ? 'английский' : 'русский'} по умолчанию).
Вопрос учителя: "${text}"\nВерни ТОЛЬКО JSON: { "reply": "…" }`, { temperature: 0.6 });
    S.chat.push({ role: 'bot', text: String(res.reply || '') });
  } catch (e) { S.chat.push({ role: 'bot', text: e.message }); }
  S.aiBusy = false;
  if (S && S.panel === 'ai') drawPanel();
}

/* ---------- white board and pencil (separately or together) ---------- */

function board(mode, restore) {
  const c = S.main.querySelector('[data-board]');
  const fit = S.main.querySelector('.lm-fit');
  if (!restore && S.board && S.board.mode === mode) { S.board = null; c.hidden = true; const bar = S.main.querySelector('.lm-boardbar'); if (bar) bar.remove(); drawIsles(); return; }
  const prev = S.board;
  S.board = { mode, color: prev ? prev.color : '#16170F', size: prev ? prev.size : 4, erase: false, image: prev && prev.image };
  c.hidden = false;
  c.classList.toggle('white', mode === 'whiteboard');
  c.width = fit.clientWidth * 2; c.height = fit.clientHeight * 2;
  const ctx = c.getContext('2d'); ctx.scale(2, 2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (S.board.image) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, fit.clientWidth, fit.clientHeight); img.src = S.board.image; }
  let bar = S.main.querySelector('.lm-boardbar');
  if (!bar) { bar = document.createElement('div'); bar.className = 'lm-boardbar'; S.main.querySelector('[data-stage]').appendChild(bar); }
  const paintBar = () => {
    const B = S.board;
    bar.innerHTML = `${['#16170F', '#FF5A5F', '#3A86FF', '#06D6A0', '#FFB400'].map(col => `<button type="button" class="sw${col === B.color && !B.erase ? ' on' : ''}" data-col="${col}" style="background:${col}" aria-label="${col}"></button>`).join('')}
      <span class="bsep"></span>${[3, 7, 14].map(sz => `<button type="button" class="bsz${sz === B.size ? ' on' : ''}" data-size="${sz}" aria-label="${esc(t('lm.size'))} ${sz}"><i style="width:${sz + 2}px;height:${sz + 2}px"></i></button>`).join('')}
      <span class="bsep"></span><button type="button" class="${B.erase ? 'on' : ''}" data-erase>${esc(t('lm.eraser'))}</button><button type="button" data-clearb>${esc(t('lm.clear'))}</button>
      <label class="pk-toggle bwhite"><span>${esc(t('lm.whiteOn'))}</span><input type="checkbox" data-white ${B.mode === 'whiteboard' ? 'checked' : ''}><i></i></label>
      <button type="button" data-closeb aria-label="${esc(t('ui.close'))}">${icon('close', 14).__raw}</button>`;
    bar.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { B.color = b.dataset.col; B.erase = false; paintBar(); });
    bar.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { B.size = Number(b.dataset.size); paintBar(); });
    bar.querySelector('[data-erase]').onclick = () => { B.erase = !B.erase; paintBar(); };
    bar.querySelector('[data-clearb]').onclick = () => { ctx.clearRect(0, 0, c.width, c.height); B.image = null; };
    bar.querySelector('[data-white]').onchange = e => { B.mode = e.target.checked ? 'whiteboard' : 'pencil'; c.classList.toggle('white', B.mode === 'whiteboard'); drawIsles(); };
    bar.querySelector('[data-closeb]').onclick = () => { S.board = null; c.hidden = true; bar.remove(); drawIsles(); };
  };
  paintBar();
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * (fit.clientWidth / r.width), (e.clientY - r.top) * (fit.clientHeight / r.height)]; };
  let drawing = false;
  c.onpointerdown = e => { drawing = true; c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); };
  c.onpointermove = e => {
    if (!drawing) return;
    const B = S.board;
    ctx.globalCompositeOperation = B.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = B.color; ctx.lineWidth = B.erase ? 30 : B.size;
    ctx.lineTo(...pos(e)); ctx.stroke();
  };
  c.onpointerup = () => { drawing = false; if (S.board) S.board.image = c.toDataURL(); };
  drawIsles();
}

/* ---------- clock, timers ---------- */

const fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const elapsedTimer = () => (S.timer.acc || 0) + (S.timer.running && S.timer.mode === 'up' ? (Date.now() - S.timer.start) / 1000 : 0);

function tick() {
  if (!S) return;
  const tm = S.timer;
  if (tm.running && tm.mode === 'down') {
    tm.left = Math.max(0, tm.left - 1);
    if (tm.left > 0 && tm.left <= 5) sfx.count();
    if (tm.left === 0) { tm.running = false; toast(t('lm.timeUp')); sfx.alarm(); drawIsles(); if (S.wins.timer) drawWins(); }
  }
  const n = S.noise;
  if (n.silenceRunning && moodOf(n.level, n.threshold) !== 'loud') {
    n.silenceLeft = Math.max(0, n.silenceLeft - 1);
    if (!n.silenceLeft) { n.silenceRunning = false; sfx.win(); }
  }
  const m = S.main;
  const set = (s, v) => { const e = m.querySelector(s); if (e) e.textContent = v; };
  set('[data-clock]', fmt((Date.now() - S.started) / 1000));
  const tv = fmt(tm.mode === 'down' ? tm.left : elapsedTimer());
  set('[data-tmbig]', tv);
  set('[data-isletimer]', tv);
  const big = m.querySelector('[data-tmbig]'); if (big) big.classList.toggle('warn', tm.mode === 'down' && tm.running && tm.left <= 5);
  if (tm.running && !m.querySelector('[data-isletimer]')) drawIsles();
  set('[data-silence]', fmt(n.silenceLeft));
}

/* ---------- keys, finishing ---------- */

function onKey(e) {
  if (!S || e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  else if (e.key === 'Escape') { const d = S.main.querySelector('.lm-dark'); if (d) d.remove(); else if (S.panel) { S.panel = null; draw(); } }
  else if (e.key.toLowerCase() === 'f') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }
  else if (e.key.toLowerCase() === 'b') tool('dark');
  else if (e.key.toLowerCase() === 'h') { S.collapsed = !S.collapsed; draw(); }
}
function bindKeys() { document.addEventListener('keydown', onKey); }

async function finish() {
  S.journal.forEach(m => { m.touched = true; });
  await saveNow();
  if (S.lesson) await db.lessons.update(S.lesson.id, { status: 'done', date: S.lesson.date || today(), finishedAt: new Date().toISOString() });
  toast(t('lm.finished'));
  const id = S.lesson ? S.lesson.id : null;
  location.hash = id ? '#/results/' + id : '#/lessons';
}
