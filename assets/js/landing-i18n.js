/* alaqai landing — texts in three languages, taken from the design (Main.dc.html).
 * index.html holds the Russian text as markup; elements carry data-t="path" and
 * data-ta="path" (aria-label) that point into these dictionaries.
 */
window.ALAQAI_LANDING_I18N = {
  ru: {
    meta: {
      title: 'alaqai — готовый урок за одну минуту',
      description: 'Платформа для учителей Казахстана: напишите тему — alaqai соберёт КСП, презентацию, игры, тест и домашнее задание.'
    },
    langLabel: 'Язык', menuLabel: 'Меню', navLabel: 'Разделы',
    nav: ['Как это работает', 'Возможности', 'На уроке', 'Тарифы'], login: 'Войти', cta: 'Начать бесплатно',
    eyebrow: 'Платформа для учителей Казахстана', h1a: 'Готовый урок', h1b: 'за одну минуту',
    sub: 'Напишите тему — alaqai соберёт КСП, презентацию, игры, тест и домашнее задание. Вам останется только провести урок.',
    cta2: 'Как это работает', noteA: 'Без установки · вход через Google', noteB: 'базовые функции бесплатно навсегда',
    prompt: 'Past Simple, 7 класс, английский язык', promptShort: 'Past Simple, 7 класс',
    promptBtn: 'Создать урок', promptBtnShort: 'Создать',
    hp: ['КСП', 'Презентация', 'Игры', 'Тест', 'Домашнее задание', 'Анализ урока'], hp5note: 'после урока',
    trust: ['КСП по новому формату', 'Қазақша · Русский · English', 'Любой экран — 16:9 и 4:3'],
    howLabel: 'Как это работает', howTitle: 'Три шага до готового урока',
    steps: [
      { t: 'Напишите тему', d: 'Или загрузите страницу учебника — alaqai разберётся в материале.' },
      { t: 'Проверьте', d: 'Поправьте любой слайд или вопрос сами — или попросите ИИ-агента.' },
      { t: 'Проведите урок', d: 'Презентация — на весь экран, а журнал, игры и таймер — в одной панели.' }
    ],
    featLabel: 'Возможности', featTitle: 'Всё для урока — в одном месте',
    bSlidesT: 'Презентация', bSlidesD: 'Слайды с фото, примерами и вопросами классу. Правьте вручную или с ИИ-агентом.',
    bKspT: 'КСП в Word', bKspD: 'По новому формату: цели, этапы урока, ресурсы и ссылки.',
    bGamesT: 'Игры и викторины', bGamesD: 'Совпадения, кроссворд, мемори — класс не скучает.',
    bTestT: 'Тесты', bTestD: 'Из учебника с ИИ или вручную. Проверка — автоматическая.',
    bHwT: 'Домашнее задание', bHwD: 'Онлайн-тест или задание в тетради — ученик присылает фото.',
    classA: 'На уроке — презентация во весь экран.', classB: 'Инструменты — в одной панели.',
    classSub: 'Презентация, которую создал alaqai, или ваша собственная открывается во весь экран. Журнал, игры, таймер и выбор ученика — в тонкой панели внизу.',
    mats: ['Презентация', 'Игра', 'Викторина', 'Тест', 'Задание'],
    dockTools: 'ИИ-чат · Таймер · Выбор ученика · Шумомер · Журнал · Группы',
    dockShort: 'Презентация · Игра · Тест | Таймер · Выбор · Шумомер · Журнал',
    quiet: 'тишина · 04:12',
    tile0T: 'Колесо фортуны', tile0D: 'Выберет, кто отвечает — из всего класса или из группы.',
    tile1T: 'Монстрик тишины', tile1D: 'Спит, пока в классе тихо, и просыпается от шума. Со своим таймером.',
    tile2T: 'Журнал в одно касание', tile2D: 'Посещаемость, баллы и группы — сбоку, не закрывая слайд.',
    afterLabel: 'После урока', afterTitle: 'Видно, что понял класс',
    afterItems: ['Анализ каждого урока и совет на следующий', 'Качество знаний по классам и неделям', 'Домашние задания проверяются сами, работы в тетради — с подсказками ИИ', 'Лучшие ученики и те, кому нужна помощь'],
    kq: 'Качество знаний', hwDone: 'Сдали домашнее задание',
    adminLabel: 'Для администрации', adminTitle: 'Делитесь планом урока безопасно',
    adminSub: 'Завуч и коллеги получают ссылку только для просмотра — без скачивания, копирования и печати.',
    adminChips: ['Только просмотр', 'Без скачивания', 'Водяной знак', 'Срок действия ссылки'],
    priceLabel: 'Тарифы', priceTitle: 'Начните бесплатно', priceSub: 'Базовые функции бесплатны навсегда. Подписка нужна только для работы с ИИ.',
    plans: [
      { name: 'Базовый', badge: 'навсегда', price: '0 ₸', per: '', alt: 'без ограничений по времени',
        items: ['Своя презентация и урок — без ограничений', 'Журнал и посещаемость', 'Монстрик тишины с таймером', 'Колесо фортуны и выбор ученика', 'Игры без ИИ', 'Базовая статистика'], cta: 'Начать бесплатно' },
      { name: 'Стандарт', badge: '', price: '4 990 ₸', per: '/ мес', alt: 'или 25 900 ₸ за 6 месяцев',
        items: ['Всё из Базового', '20 уроков с ИИ в неделю', 'Анализ уроков', 'Анализ домашних заданий', 'КСП в Word'], cta: 'Выбрать Стандарт' },
      { name: 'Max', badge: 'без ограничений', price: '9 990 ₸', per: '/ мес', alt: 'или 49 900 ₸ за 6 месяцев',
        items: ['Всё из Стандарта', 'Уроки без ограничений', 'ИИ-агент для подготовки к уроку', 'ИИ-агент для открытого урока — 4 раза в месяц'], cta: 'Выбрать Max' },
      { name: 'Для школ', badge: '', price: 'Договорная', per: '', alt: 'для всех учителей школы',
        items: ['Подключим всех учителей', 'Цена и условия — по договорённости'], cta: 'Связаться' }
    ],
    faqTitle: 'Частые вопросы',
    faq: [
      { q: 'Нужно ли что-то устанавливать?', a: 'Нет. alaqai работает в браузере — на компьютере, ноутбуке и интерактивной доске. Вход через Google.' },
      { q: 'Это правда бесплатно?', a: 'Да. Проводить уроки со своей презентацией, вести журнал, пользоваться колесом и монстриком тишины можно бесплатно и без ограничений. Подписка нужна только для работы с ИИ.' },
      { q: 'На каких языках работает alaqai?', a: 'Платформа, презентации и КСП — на казахском, русском и английском.' }
    ],
    finalTitle: 'Попробуйте на следующем уроке', finalSub: 'Базовые функции — бесплатно навсегда.', guideLink: 'Бесплатная инструкция',
    tagline: 'Платформа для учителей', city: 'Түркістан, Қазақстан'
  },

  kk: {
    meta: {
      title: 'alaqai — дайын сабақ бір минутта',
      description: 'Қазақстан мұғалімдеріне арналған платформа: тақырыпты жазыңыз — alaqai ҚМЖ, презентация, ойындар, тест және үй тапсырмасын дайындайды.'
    },
    langLabel: 'Тіл', menuLabel: 'Мәзір', navLabel: 'Бөлімдер',
    nav: ['Қалай жұмыс істейді', 'Мүмкіндіктер', 'Сабақта', 'Тарифтер'], login: 'Кіру', cta: 'Тегін бастау',
    eyebrow: 'Қазақстан мұғалімдеріне арналған платформа', h1a: 'Дайын сабақ', h1b: 'бір минутта',
    sub: 'Тақырыпты жазыңыз — alaqai ҚМЖ, презентация, ойындар, тест және үй тапсырмасын дайындайды. Сізге тек сабақты өткізу қалады.',
    cta2: 'Қалай жұмыс істейді', noteA: 'Орнатудың қажеті жоқ · Google арқылы кіру', noteB: 'негізгі функциялар мәңгі тегін',
    prompt: 'Past Simple, 7-сынып, ағылшын тілі', promptShort: 'Past Simple, 7-сынып',
    promptBtn: 'Сабақ құру', promptBtnShort: 'Құру',
    hp: ['ҚМЖ', 'Презентация', 'Ойындар', 'Тест', 'Үй тапсырмасы', 'Сабақ талдауы'], hp5note: 'сабақтан кейін',
    trust: ['Жаңа форматтағы ҚМЖ', 'Қазақша · Русский · English', 'Кез келген экран — 16:9 және 4:3'],
    howLabel: 'Қалай жұмыс істейді', howTitle: 'Дайын сабаққа үш қадам',
    steps: [
      { t: 'Тақырыпты жазыңыз', d: 'Немесе оқулық бетін жүктеңіз — alaqai материалды өзі талдайды.' },
      { t: 'Тексеріңіз', d: 'Кез келген слайд пен сұрақты өзіңіз түзетіңіз немесе ЖИ-агентке тапсырыңыз.' },
      { t: 'Сабақ өткізіңіз', d: 'Презентация — толық экранда, ал журнал, ойын және таймер — бір панельде.' }
    ],
    featLabel: 'Мүмкіндіктер', featTitle: 'Сабаққа қажеттінің бәрі — бір жерде',
    bSlidesT: 'Презентация', bSlidesD: 'Фото, мысал және сыныпқа сұрақтар бар слайдтар. Қолмен немесе ЖИ-агентпен түзетіңіз.',
    bKspT: 'ҚМЖ Word-та', bKspD: 'Жаңа формат бойынша: мақсаттар, сабақ кезеңдері, ресурстар мен сілтемелер.',
    bGamesT: 'Ойындар мен викториналар', bGamesD: 'Сәйкестендіру, сөзжұмбақ, мемори — сынып жалықпайды.',
    bTestT: 'Тесттер', bTestD: 'Оқулықтан ЖИ көмегімен немесе қолмен. Тексеру — автоматты.',
    bHwT: 'Үй тапсырмасы', bHwD: 'Онлайн-тест немесе дәптердегі тапсырма — оқушы фотосын жібереді.',
    classA: 'Сабақта — презентация толық экранда.', classB: 'Құралдар — бір панельде.',
    classSub: 'alaqai жасаған немесе өзіңіздің презентацияңыз толық экранда ашылады. Журнал, ойын, таймер және оқушы таңдау — төменгі жұқа панельде.',
    mats: ['Презентация', 'Ойын', 'Викторина', 'Тест', 'Тапсырма'],
    dockTools: 'ЖИ-чат · Таймер · Оқушы таңдау · Шуөлшегіш · Журнал · Топтар',
    dockShort: 'Презентация · Ойын · Тест | Таймер · Таңдау · Шуөлшегіш · Журнал',
    quiet: 'тыныштық · 04:12',
    tile0T: 'Бақыт дөңгелегі', tile0D: 'Кім жауап беретінін таңдайды — бүкіл сыныптан немесе топтан.',
    tile1T: 'Тыныштық күзетшісі', tile1D: 'Сынып тыныш болса — ұйықтайды, шу көтерілсе — оянады. Өз таймері бар.',
    tile2T: 'Журнал бір басумен', tile2D: 'Қатысу, балл және топтар — бүйірде, слайдты жаппайды.',
    afterLabel: 'Сабақтан кейін', afterTitle: 'Сынып не түсінгені көрінеді',
    afterItems: ['Әр сабақты талдау және келесі сабаққа кеңес', 'Сыныптар мен апталар бойынша білім сапасы', 'Үй тапсырмасы өзі тексеріледі, дәптердегі жұмыс — ЖИ кеңесімен', 'Үздік оқушылар және көмек керек оқушылар'],
    kq: 'Білім сапасы', hwDone: 'Үй тапсырмасын орындағандар',
    adminLabel: 'Әкімшілікке', adminTitle: 'Сабақ жоспарымен қауіпсіз бөлісіңіз',
    adminSub: 'Завуч пен әріптестер тек қарауға арналған сілтеме алады — жүктеусіз, көшірусіз және басып шығарусыз.',
    adminChips: ['Тек қарау', 'Жүктеуге болмайды', 'Су белгісі', 'Сілтеменің мерзімі'],
    priceLabel: 'Тарифтер', priceTitle: 'Тегін бастаңыз', priceSub: 'Негізгі функциялар мәңгі тегін. Жазылым тек ЖИ-мен жұмыс үшін керек.',
    plans: [
      { name: 'Базалық', badge: 'мәңгі', price: '0 ₸', per: '', alt: 'мерзімі шектелмеген',
        items: ['Өз презентацияңыз бен сабақ — шектеусіз', 'Журнал және қатысу', 'Таймері бар тыныштық күзетшісі', 'Бақыт дөңгелегі және оқушы таңдау', 'ЖИ-сіз ойындар', 'Базалық статистика'], cta: 'Тегін бастау' },
      { name: 'Стандарт', badge: '', price: '4 990 ₸', per: '/ ай', alt: 'немесе 6 айға 25 900 ₸',
        items: ['Базалықтағының бәрі', 'Аптасына ЖИ-мен 20 сабақ', 'Сабақты талдау', 'Үй тапсырмаларын талдау', 'ҚМЖ Word-та'], cta: 'Стандартты таңдау' },
      { name: 'Max', badge: 'шектеусіз', price: '9 990 ₸', per: '/ ай', alt: 'немесе 6 айға 49 900 ₸',
        items: ['Стандарттағының бәрі', 'Шектеусіз сабақтар', 'Сабаққа дайындалуға ЖИ-агент', 'Ашық сабаққа ЖИ-агент — айына 4 рет'], cta: 'Max таңдау' },
      { name: 'Мектептерге', badge: '', price: 'Келісім бойынша', per: '', alt: 'мектептің барлық мұғалімдеріне',
        items: ['Барлық мұғалімді қосамыз', 'Баға мен шарттар — келісім бойынша'], cta: 'Байланысу' }
    ],
    faqTitle: 'Жиі қойылатын сұрақтар',
    faq: [
      { q: 'Бірдеңе орнату керек пе?', a: 'Жоқ. alaqai браузерде жұмыс істейді — компьютерде, ноутбукта және интерактивті тақтада. Кіру — Google арқылы.' },
      { q: 'Шынымен тегін бе?', a: 'Иә. Өз презентацияңызбен сабақ өткізу, журнал жүргізу, дөңгелек пен тыныштық күзетшісін пайдалану — тегін және шектеусіз. Жазылым тек ЖИ-мен жұмыс үшін керек.' },
      { q: 'alaqai қай тілдерде жұмыс істейді?', a: 'Платформа, презентациялар және ҚМЖ — қазақ, орыс және ағылшын тілдерінде.' }
    ],
    finalTitle: 'Келесі сабағыңызда байқап көріңіз', finalSub: 'Негізгі функциялар — мәңгі тегін.', guideLink: 'Тегін нұсқаулық',
    tagline: 'Мұғалімдерге арналған платформа', city: 'Түркістан, Қазақстан'
  },

  en: {
    meta: {
      title: 'alaqai — a ready lesson in one minute',
      description: 'A platform for teachers in Kazakhstan: type a topic and alaqai builds the lesson plan, slides, games, a test and homework.'
    },
    langLabel: 'Language', menuLabel: 'Menu', navLabel: 'Sections',
    nav: ['How it works', 'Features', 'In class', 'Pricing'], login: 'Log in', cta: 'Start for free',
    eyebrow: 'A platform for teachers in Kazakhstan', h1a: 'A ready lesson', h1b: 'in one minute',
    sub: 'Type a topic — alaqai builds the lesson plan, slides, games, a test and homework. All that is left is to teach.',
    cta2: 'See how it works', noteA: 'Nothing to install · Sign in with Google', noteB: 'Core features free forever',
    prompt: 'Past Simple, Grade 7, English', promptShort: 'Past Simple, Grade 7',
    promptBtn: 'Create lesson', promptBtnShort: 'Create',
    hp: ['Lesson plan', 'Slides', 'Games', 'Test', 'Homework', 'Lesson analysis'], hp5note: 'after class',
    trust: ['Lesson plans in the official format', 'Қазақша · Русский · English', 'Any screen — 16:9 and 4:3'],
    howLabel: 'How it works', howTitle: 'Three steps to a ready lesson',
    steps: [
      { t: 'Type a topic', d: 'Or upload a textbook page — alaqai works through the material.' },
      { t: 'Review', d: 'Edit any slide or question yourself — or ask the AI agent.' },
      { t: 'Teach', d: 'Slides fill the screen; register, games and timer sit in one bar.' }
    ],
    featLabel: 'Features', featTitle: 'Everything for your lesson, in one place',
    bSlidesT: 'Slides', bSlidesD: 'Slides with photos, examples and questions for the class. Edit by hand or with the AI agent.',
    bKspT: 'Lesson plan in Word', bKspD: 'In the official format: goals, lesson stages, resources and links.',
    bGamesT: 'Games and quizzes', bGamesD: 'Matching, crosswords, memory — no one gets bored.',
    bTestT: 'Tests', bTestD: 'From a textbook with AI or by hand. Checked automatically.',
    bHwT: 'Homework', bHwD: 'An online test or a notebook task — students send a photo.',
    classA: 'In class, slides fill the screen.', classB: 'Your tools sit in one bar.',
    classSub: 'Slides made by alaqai, or your own, open full screen. Register, games, timer and student picker live in a slim bar at the bottom.',
    mats: ['Slides', 'Game', 'Quiz', 'Test', 'Homework'],
    dockTools: 'AI chat · Timer · Student picker · Noise meter · Register · Groups',
    dockShort: 'Slides · Game · Test | Timer · Picker · Noise meter · Register',
    quiet: 'quiet · 04:12',
    tile0T: 'Wheel of fortune', tile0D: 'Picks who answers — from the whole class or from a group.',
    tile1T: 'Quiet monster', tile1D: 'Sleeps while the class is quiet and wakes up when it gets loud. With its own timer.',
    tile2T: 'One-tap register', tile2D: 'Attendance, points and groups on the side — never over your slides.',
    afterLabel: 'After class', afterTitle: 'See what the class understood',
    afterItems: ['Analysis of every lesson, with advice for the next one', 'Knowledge quality by class and by week', 'Homework checks itself; notebook work gets AI hints', 'Top students and those who need help'],
    kq: 'Knowledge quality', hwDone: 'Homework done',
    adminLabel: 'For school leaders', adminTitle: 'Share your lesson plan safely',
    adminSub: 'The deputy head and colleagues get a view-only link — no downloading, copying or printing.',
    adminChips: ['View only', 'No downloads', 'Watermark', 'Link expiry'],
    priceLabel: 'Pricing', priceTitle: 'Start for free', priceSub: 'Core features are free forever. You only need a subscription for AI.',
    plans: [
      { name: 'Basic', badge: 'forever', price: '0 ₸', per: '', alt: 'no time limit',
        items: ['Your own slides and lessons — unlimited', 'Register and attendance', 'Quiet monster with timer', 'Wheel of fortune and student picker', 'Games without AI', 'Basic statistics'], cta: 'Start for free' },
      { name: 'Standard', badge: '', price: '4 990 ₸', per: '/ mo', alt: 'or 25 900 ₸ for 6 months',
        items: ['Everything in Basic', '20 AI lessons a week', 'Lesson analysis', 'Homework analysis', 'Lesson plans in Word'], cta: 'Choose Standard' },
      { name: 'Max', badge: 'no limits', price: '9 990 ₸', per: '/ mo', alt: 'or 49 900 ₸ for 6 months',
        items: ['Everything in Standard', 'Unlimited lessons', 'AI agent for lesson prep', 'AI agent for open lessons — 4 times a month'], cta: 'Choose Max' },
      { name: 'For schools', badge: '', price: 'Custom', per: '', alt: 'for every teacher in your school',
        items: ['We set up all your teachers', 'Price and terms by agreement'], cta: 'Contact us' }
    ],
    faqTitle: 'Questions',
    faq: [
      { q: 'Do I need to install anything?', a: 'No. alaqai runs in the browser — on a computer, laptop or interactive whiteboard. Sign in with Google.' },
      { q: 'Is it really free?', a: 'Yes. Teaching with your own slides, keeping the register, the wheel and the quiet monster are free with no limits. You only need a subscription for AI.' },
      { q: 'Which languages does alaqai support?', a: 'The platform, slides and lesson plans work in Kazakh, Russian and English.' }
    ],
    finalTitle: 'Try it in your next lesson', finalSub: 'Core features are free forever.', guideLink: 'Free guide',
    tagline: 'A platform for teachers', city: 'Turkistan, Kazakhstan'
  }
};
