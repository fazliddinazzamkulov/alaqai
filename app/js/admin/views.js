/* Admin screens 29–32 (+ payments, AI keys, administrators, activity log). */
import { add, t, lang } from '../i18n.js';
import { html, raw, icon, toast, openModal, initials, segmented, confirmModal, moreBox } from '../ui.js';
import * as S from './source.js';

add({
  ru: {
    'av.demo': 'демо-данные', 'av.today': 'Сегодня', 'av.week': 'Неделя', 'av.month': 'Месяц', 'av.export': 'Экспорт', 'av.exportCsv': 'Экспорт CSV',
    'av.k.users': 'Пользователи', 'av.k.newWeek': '+{n} за неделю', 'av.k.subs': 'Активные подписки', 'av.k.revenue': 'Выручка за период', 'av.k.ai': 'Расходы на ИИ', 'av.k.aiShare': '{p} от выручки', 'av.k.lessons': 'Уроков создано', 'av.k.aiToday': 'Запросов к ИИ за сутки', 'av.k.trial': 'На пробном периоде', 'av.k.suspended': 'Приостановлено',
    'av.revenueDays': 'Выручка по дням', 'av.byPlan': 'Пользователи по тарифам', 'av.methods': 'Оплаты: {list}', 'av.lastPays': 'Последние платежи', 'av.all': 'Все', 'av.attention': 'Требует внимания',
    'av.a.failed': 'Неудачные платежи — повторить списание', 'av.a.schools': 'Заявки от школ ждут ответа', 'av.a.noKey': 'Нет активного ключа Gemini — ИИ не работает', 'av.a.suspended': 'Приостановленные аккаунты', 'av.a.none': 'Всё спокойно.',
    'av.soonPay': 'Появится после подключения платёжного шлюза и Kaspi.', 'av.soonDb': 'Появится после переноса данных учителей в базу на сервере.',
    'av.t.users': 'Пользователи', 'av.t.lessons': 'Уроки', 'av.t.subs': 'Подписки', 'av.t.pays': 'Платежи', 'av.t.schools': 'Школы', 'av.filters': 'Поиск и фильтры', 'av.search': 'Имя, телефон, email или школа',
    'av.f.plan': 'Тариф', 'av.f.status': 'Статус', 'av.f.via': 'Вход', 'av.f.all': 'все', 'av.c.user': 'Пользователь', 'av.c.via': 'Вход', 'av.c.school': 'Школа', 'av.c.plan': 'Тариф', 'av.c.status': 'Статус', 'av.c.ai': 'ИИ/нед', 'av.c.since': 'С нами с', 'av.c.last': 'Активность',
    'av.c.lessons': 'Уроков', 'av.c.until': 'До', 'av.c.renew': 'Продление', 'av.c.date': 'Дата', 'av.c.what': 'Что', 'av.c.how': 'Способ', 'av.c.sum': 'Сумма', 'av.c.teachers': 'Учителей', 'av.c.req': 'Заявка',
    'av.range': '{a}–{b} из {n}', 'av.prev': 'Назад', 'av.next': 'Дальше', 'av.none': 'Ничего не найдено', 'av.on': 'вкл.', 'av.off': 'выкл.', 'av.new': 'новая',
    'av.s.active': 'Активен', 'av.s.trial': 'Пробный', 'av.s.expired': 'Закончился', 'av.p.pending': 'Ждёт', 'av.p.refunded': 'Возврат', 'av.m.promo': 'Промокод', 'av.m.admin': 'Админ', 'av.kaspiWait': 'Kaspi: ждут подтверждения', 'av.kaspiNote': 'Найдите перевод в Kaspi Pay по сумме и коду в комментарии, затем нажмите «Подтвердить» — тариф включится у учителя сразу.', 'av.confirm': 'Подтвердить', 'av.reject': 'Отклонить', 'av.confirmed': 'Оплата подтверждена, тариф включён', 'av.rejected': 'Платёж отклонён', 'av.s.debt': 'Долг', 'av.s.blocked': 'Заблокирован', 'av.s.free': 'Бесплатно', 'av.via.google': 'Google', 'av.via.phone': 'Телефон',
    'av.p.paid': 'Оплачено', 'av.p.failed': 'Ошибка', 'av.m.card': 'Карта', 'av.m.kaspi': 'Kaspi QR', 'av.m.apple': 'Apple Pay', 'av.m.google': 'Google Pay', 'av.period1': 'месяц', 'av.period6': '6 мес',
    'av.justNow': 'сегодня', 'av.daysAgo': '{n} дн. назад', 'av.back': 'База данных · Пользователи', 'av.pickUser': 'Выберите пользователя в «Базе данных».',
    'av.info': 'Данные', 'av.phone': 'Телефон', 'av.google': 'Google', 'av.notConnected': 'не подключён', 'av.region': 'Регион', 'av.reg': 'Регистрация', 'av.lastLogin': 'Последний вход', 'av.role': 'Роль',
    'av.danger': 'Опасная зона', 'av.resetSessions': 'Сбросить сессии на всех устройствах', 'av.block': 'Заблокировать аккаунт', 'av.unblock': 'Разблокировать аккаунт', 'av.delete': 'Удалить аккаунт', 'av.sessionsReset': 'Сессии сброшены: {n}',
    'av.sub': 'Подписка', 'av.renewOn': 'автопродление включено', 'av.renewOff': 'автопродление выключено', 'av.untilD': 'до {d}', 'av.changePlan': 'Сменить тариф', 'av.apply': 'Применить', 'av.extend': 'Продлить вручную', 'av.days': '{n} дней', 'av.extendBtn': 'Продлить',
    'av.resetLimit': 'Сбросить недельный лимит', 'av.givePromo': 'Выдать промокод', 'av.refund': 'Вернуть платёж', 'av.stopRenew': 'Отключить продление', 'av.saved': 'Сохранено', 'av.soon': 'Заработает после подключения оплаты и базы',
    'av.k.aiCalls': 'запросов к ИИ за неделю', 'av.aiWeek': 'Уроки с ИИ на неделе', 'av.aiCost': 'Расход на ИИ, месяц', 'av.taught': 'Уроков проведено', 'av.pays': 'Платежи', 'av.log': 'Журнал действий', 'av.noPays': 'Платежей нет', 'av.noLog': 'Записей нет',
    'av.saveAll': 'Сохранить изменения', 'av.savedLocal': 'Сохранено в этом браузере — платформа уже берёт цены отсюда. На сервер — после подключения базы.', 'av.savedServer': 'Сохранено на сервере', 'av.savedDemo': 'Это пример — изменения не сохраняются',
    'av.nUsers': '{n} пользователей', 'av.nSchools': '{n} школ', 'av.pm': 'Цена / мес', 'av.p6': 'Цена / 6 мес', 'av.aiPerWeek': 'Уроки с ИИ / нед', 'av.unlimitedHint': 'пусто = без лимита', 'av.analysis': 'Анализ уроков', 'av.agent': 'Агент открыт. урока / мес', 'av.minTeachers': 'Мин. учителей', 'av.price': 'Цена', 'av.deal': 'договорная', 'av.games': 'Игры без ИИ', 'av.yes': 'да',
    'av.payMethods': 'Способы оплаты', 'av.pm.card': 'Банковские карты', 'av.pm.cardN': 'Через платёжный шлюз', 'av.pm.kaspi': 'Kaspi QR', 'av.pm.kaspiN': 'Оплата по QR в приложении Kaspi.kz', 'av.pm.apple': 'Apple Pay', 'av.pm.appleN': 'Safari на iPhone, iPad, Mac', 'av.pm.google': 'Google Pay', 'av.pm.googleN': 'Chrome и Android', 'av.connected': 'подключён', 'av.notYet': 'не подключён',
    'av.promos': 'Промокоды', 'av.create': '+ Создать', 'av.code': 'Код', 'av.off2': 'Скидка', 'av.plan': 'Тариф', 'av.used': 'Использован', 'av.till': 'До', 'av.allPlans': 'Все', 'av.freeM': '{n} мес бесплатно', 'av.newPromo': 'Новый промокод', 'av.discount': 'Скидка, %', 'av.orFree': 'или бесплатных месяцев', 'av.limit': 'Сколько раз (0 — без лимита)', 'av.removePromo': 'Удалить',
    'av.schoolReq': 'Заявки от школ · {n}.', 'av.open': 'Открыть',
    'av.keys': 'Ключи API', 'av.keysNote': 'Ключи хранятся только на сервере в зашифрованном виде; браузер видит лишь начало и конец ключа. Можно добавить до 3 ключей на сервис — если один упрётся в лимит, сервер возьмёт следующий.', 'av.provider': 'Сервис', 'av.slot': 'Слот', 'av.label': 'Подпись', 'av.value': 'Ключ', 'av.addKey': 'Добавить ключ', 'av.lastUsed': 'Использован', 'av.fails': 'Ошибок', 'av.never': 'ещё нет', 'av.keySaved': 'Ключ сохранён', 'av.noKeys': 'Ключей нет — ИИ и поиск картинок не работают.',
    'av.adminsNote': 'Роли выдаёт только владелец. Владельцы задаются на сервере (OWNER_EMAILS).', 'av.makeAdmin': 'Сделать администратором', 'av.makeTeacher': 'Снять роль', 'av.findUser': 'Найти пользователя по имени или email', 'av.r.owner': 'владелец', 'av.r.admin': 'администратор', 'av.r.teacher': 'учитель',
    'av.l.at': 'Когда', 'av.l.actor': 'Кто', 'av.l.action': 'Действие', 'av.l.target': 'Над чем', 'av.ownerOnly': 'Журнал доступен только владельцу.'
  },
  kk: {
    'av.demo': 'демо-деректер', 'av.today': 'Бүгін', 'av.week': 'Апта', 'av.month': 'Ай', 'av.export': 'Экспорт', 'av.exportCsv': 'CSV экспорт',
    'av.k.users': 'Пайдаланушылар', 'av.k.newWeek': 'аптада +{n}', 'av.k.subs': 'Белсенді жазылымдар', 'av.k.revenue': 'Кезеңдегі түсім', 'av.k.ai': 'ЖИ шығыны', 'av.k.aiShare': 'түсімнің {p}', 'av.k.lessons': 'Құрылған сабақтар', 'av.k.aiToday': 'Тәулікте ЖИ сұраулары', 'av.k.trial': 'Сынақ кезеңінде', 'av.k.suspended': 'Тоқтатылған',
    'av.revenueDays': 'Күндер бойынша түсім', 'av.byPlan': 'Тарифтер бойынша пайдаланушылар', 'av.methods': 'Төлемдер: {list}', 'av.lastPays': 'Соңғы төлемдер', 'av.all': 'Барлығы', 'av.attention': 'Назар керек',
    'av.a.failed': 'Сәтсіз төлемдер — қайта шегеру', 'av.a.schools': 'Мектеп өтінімдері жауап күтуде', 'av.a.noKey': 'Белсенді Gemini кілті жоқ — ЖИ жұмыс істемейді', 'av.a.suspended': 'Тоқтатылған аккаунттар', 'av.a.none': 'Бәрі тыныш.',
    'av.soonPay': 'Төлем шлюзі мен Kaspi қосылғаннан кейін шығады.', 'av.soonDb': 'Мұғалімдер деректері сервердегі дерекқорға көшкеннен кейін шығады.',
    'av.t.users': 'Пайдаланушылар', 'av.t.lessons': 'Сабақтар', 'av.t.subs': 'Жазылымдар', 'av.t.pays': 'Төлемдер', 'av.t.schools': 'Мектептер', 'av.filters': 'Іздеу және сүзгілер', 'av.search': 'Аты, телефон, email немесе мектеп',
    'av.f.plan': 'Тариф', 'av.f.status': 'Күйі', 'av.f.via': 'Кіру', 'av.f.all': 'барлығы', 'av.c.user': 'Пайдаланушы', 'av.c.via': 'Кіру', 'av.c.school': 'Мектеп', 'av.c.plan': 'Тариф', 'av.c.status': 'Күйі', 'av.c.ai': 'ЖИ/апта', 'av.c.since': 'Бізбен бірге', 'av.c.last': 'Белсенділік',
    'av.c.lessons': 'Сабақ', 'av.c.until': 'Дейін', 'av.c.renew': 'Ұзарту', 'av.c.date': 'Күні', 'av.c.what': 'Не', 'av.c.how': 'Тәсіл', 'av.c.sum': 'Сома', 'av.c.teachers': 'Мұғалім', 'av.c.req': 'Өтінім',
    'av.range': '{n} ішінен {a}–{b}', 'av.prev': 'Артқа', 'av.next': 'Әрі қарай', 'av.none': 'Ештеңе табылмады', 'av.on': 'қосулы', 'av.off': 'өшірулі', 'av.new': 'жаңа',
    'av.s.active': 'Белсенді', 'av.s.trial': 'Сынақ', 'av.s.expired': 'Аяқталды', 'av.p.pending': 'Күтуде', 'av.p.refunded': 'Қайтарылды', 'av.m.promo': 'Промокод', 'av.m.admin': 'Әкімші', 'av.kaspiWait': 'Kaspi: растауды күтуде', 'av.kaspiNote': 'Kaspi Pay-де аударымды сома мен пікірдегі код бойынша тауып, «Растау» басыңыз — мұғалімде тариф бірден қосылады.', 'av.confirm': 'Растау', 'av.reject': 'Қабылдамау', 'av.confirmed': 'Төлем расталды, тариф қосылды', 'av.rejected': 'Төлем қабылданбады', 'av.s.debt': 'Қарыз', 'av.s.blocked': 'Бұғатталған', 'av.s.free': 'Тегін', 'av.via.google': 'Google', 'av.via.phone': 'Телефон',
    'av.p.paid': 'Төленді', 'av.p.failed': 'Қате', 'av.m.card': 'Карта', 'av.m.kaspi': 'Kaspi QR', 'av.m.apple': 'Apple Pay', 'av.m.google': 'Google Pay', 'av.period1': 'ай', 'av.period6': '6 ай',
    'av.justNow': 'бүгін', 'av.daysAgo': '{n} күн бұрын', 'av.back': 'Дерекқор · Пайдаланушылар', 'av.pickUser': '«Дерекқордан» пайдаланушыны таңдаңыз.',
    'av.info': 'Деректер', 'av.phone': 'Телефон', 'av.google': 'Google', 'av.notConnected': 'қосылмаған', 'av.region': 'Өңір', 'av.reg': 'Тіркелді', 'av.lastLogin': 'Соңғы кіру', 'av.role': 'Рөлі',
    'av.danger': 'Қауіпті аймақ', 'av.resetSessions': 'Барлық құрылғыдағы сессияларды тастау', 'av.block': 'Аккаунтты бұғаттау', 'av.unblock': 'Бұғатты алу', 'av.delete': 'Аккаунтты жою', 'av.sessionsReset': 'Сессиялар тасталды: {n}',
    'av.sub': 'Жазылым', 'av.renewOn': 'автоұзарту қосулы', 'av.renewOff': 'автоұзарту өшірулі', 'av.untilD': '{d} дейін', 'av.changePlan': 'Тарифті ауыстыру', 'av.apply': 'Қолдану', 'av.extend': 'Қолмен ұзарту', 'av.days': '{n} күн', 'av.extendBtn': 'Ұзарту',
    'av.resetLimit': 'Апталық лимитті тастау', 'av.givePromo': 'Промокод беру', 'av.refund': 'Төлемді қайтару', 'av.stopRenew': 'Ұзартуды өшіру', 'av.saved': 'Сақталды', 'av.soon': 'Төлем мен дерекқор қосылғаннан кейін жұмыс істейді',
    'av.k.aiCalls': 'аптадағы ЖИ сұраулары', 'av.aiWeek': 'Аптадағы ЖИ-сабақтар', 'av.aiCost': 'ЖИ шығыны, ай', 'av.taught': 'Өткізілген сабақтар', 'av.pays': 'Төлемдер', 'av.log': 'Әрекеттер журналы', 'av.noPays': 'Төлем жоқ', 'av.noLog': 'Жазба жоқ',
    'av.saveAll': 'Өзгерістерді сақтау', 'av.savedLocal': 'Осы браузерде сақталды — платформа бағаларды осыдан алады. Серверге — дерекқор қосылғаннан кейін.', 'av.savedServer': 'Серверде сақталды', 'av.savedDemo': 'Бұл мысал — өзгерістер сақталмайды',
    'av.nUsers': '{n} пайдаланушы', 'av.nSchools': '{n} мектеп', 'av.pm': 'Баға / ай', 'av.p6': 'Баға / 6 ай', 'av.aiPerWeek': 'ЖИ-сабақ / апта', 'av.unlimitedHint': 'бос = шектеусіз', 'av.analysis': 'Сабақ талдауы', 'av.agent': 'Ашық сабақ агенті / ай', 'av.minTeachers': 'Ең аз мұғалім', 'av.price': 'Баға', 'av.deal': 'келісім бойынша', 'av.games': 'ЖИ-сыз ойындар', 'av.yes': 'иә',
    'av.payMethods': 'Төлем тәсілдері', 'av.pm.card': 'Банк карталары', 'av.pm.cardN': 'Төлем шлюзі арқылы', 'av.pm.kaspi': 'Kaspi QR', 'av.pm.kaspiN': 'Kaspi.kz қосымшасында QR арқылы', 'av.pm.apple': 'Apple Pay', 'av.pm.appleN': 'iPhone, iPad, Mac-тағы Safari', 'av.pm.google': 'Google Pay', 'av.pm.googleN': 'Chrome және Android', 'av.connected': 'қосылған', 'av.notYet': 'қосылмаған',
    'av.promos': 'Промокодтар', 'av.create': '+ Құру', 'av.code': 'Код', 'av.off2': 'Жеңілдік', 'av.plan': 'Тариф', 'av.used': 'Қолданылды', 'av.till': 'Дейін', 'av.allPlans': 'Барлығы', 'av.freeM': '{n} ай тегін', 'av.newPromo': 'Жаңа промокод', 'av.discount': 'Жеңілдік, %', 'av.orFree': 'немесе тегін айлар', 'av.limit': 'Неше рет (0 — шектеусіз)', 'av.removePromo': 'Жою',
    'av.schoolReq': 'Мектептерден өтінімдер · {n}.', 'av.open': 'Ашу',
    'av.keys': 'API кілттері', 'av.keysNote': 'Кілттер тек серверде шифрланып сақталады; браузер кілттің басы мен соңын ғана көреді. Әр сервиске 3 кілтке дейін — біреуі лимитке жетсе, сервер келесісін алады.', 'av.provider': 'Сервис', 'av.slot': 'Слот', 'av.label': 'Белгі', 'av.value': 'Кілт', 'av.addKey': 'Кілт қосу', 'av.lastUsed': 'Қолданылды', 'av.fails': 'Қате', 'av.never': 'әлі жоқ', 'av.keySaved': 'Кілт сақталды', 'av.noKeys': 'Кілт жоқ — ЖИ мен сурет іздеу жұмыс істемейді.',
    'av.adminsNote': 'Рөлдерді тек иесі береді. Иелер серверде беріледі (OWNER_EMAILS).', 'av.makeAdmin': 'Әкімші ету', 'av.makeTeacher': 'Рөлді алу', 'av.findUser': 'Пайдаланушыны аты не email бойынша табу', 'av.r.owner': 'иесі', 'av.r.admin': 'әкімші', 'av.r.teacher': 'мұғалім',
    'av.l.at': 'Қашан', 'av.l.actor': 'Кім', 'av.l.action': 'Әрекет', 'av.l.target': 'Неге', 'av.ownerOnly': 'Журнал тек иесіне қолжетімді.'
  },
  en: {
    'av.demo': 'demo data', 'av.today': 'Today', 'av.week': 'Week', 'av.month': 'Month', 'av.export': 'Export', 'av.exportCsv': 'Export CSV',
    'av.k.users': 'Users', 'av.k.newWeek': '+{n} this week', 'av.k.subs': 'Active subscriptions', 'av.k.revenue': 'Revenue for the period', 'av.k.ai': 'AI costs', 'av.k.aiShare': '{p} of revenue', 'av.k.lessons': 'Lessons created', 'av.k.aiToday': 'AI requests in 24 h', 'av.k.trial': 'On trial', 'av.k.suspended': 'Suspended',
    'av.revenueDays': 'Revenue by day', 'av.byPlan': 'Users by plan', 'av.methods': 'Payments: {list}', 'av.lastPays': 'Latest payments', 'av.all': 'All', 'av.attention': 'Needs attention',
    'av.a.failed': 'Failed payments — retry the charge', 'av.a.schools': 'School requests waiting for a reply', 'av.a.noKey': 'No active Gemini key — AI is off', 'av.a.suspended': 'Suspended accounts', 'av.a.none': 'All quiet.',
    'av.soonPay': 'Appears once the payment gateway and Kaspi are connected.', 'av.soonDb': 'Appears once teachers’ data moves to the server database.',
    'av.t.users': 'Users', 'av.t.lessons': 'Lessons', 'av.t.subs': 'Subscriptions', 'av.t.pays': 'Payments', 'av.t.schools': 'Schools', 'av.filters': 'Search and filters', 'av.search': 'Name, phone, email or school',
    'av.f.plan': 'Plan', 'av.f.status': 'Status', 'av.f.via': 'Sign-in', 'av.f.all': 'all', 'av.c.user': 'User', 'av.c.via': 'Sign-in', 'av.c.school': 'School', 'av.c.plan': 'Plan', 'av.c.status': 'Status', 'av.c.ai': 'AI/wk', 'av.c.since': 'Joined', 'av.c.last': 'Active',
    'av.c.lessons': 'Lessons', 'av.c.until': 'Until', 'av.c.renew': 'Renewal', 'av.c.date': 'Date', 'av.c.what': 'What', 'av.c.how': 'Method', 'av.c.sum': 'Amount', 'av.c.teachers': 'Teachers', 'av.c.req': 'Request',
    'av.range': '{a}–{b} of {n}', 'av.prev': 'Previous', 'av.next': 'Next', 'av.none': 'Nothing found', 'av.on': 'on', 'av.off': 'off', 'av.new': 'new',
    'av.s.active': 'Active', 'av.s.trial': 'Trial', 'av.s.expired': 'Ended', 'av.p.pending': 'Waiting', 'av.p.refunded': 'Refunded', 'av.m.promo': 'Promo code', 'av.m.admin': 'Admin', 'av.kaspiWait': 'Kaspi: waiting for confirmation', 'av.kaspiNote': 'Find the transfer in Kaspi Pay by the amount and the code in the comment, then press “Confirm” — the teacher’s plan switches on at once.', 'av.confirm': 'Confirm', 'av.reject': 'Reject', 'av.confirmed': 'Payment confirmed, plan switched on', 'av.rejected': 'Payment rejected', 'av.s.debt': 'Overdue', 'av.s.blocked': 'Blocked', 'av.s.free': 'Free', 'av.via.google': 'Google', 'av.via.phone': 'Phone',
    'av.p.paid': 'Paid', 'av.p.failed': 'Failed', 'av.m.card': 'Card', 'av.m.kaspi': 'Kaspi QR', 'av.m.apple': 'Apple Pay', 'av.m.google': 'Google Pay', 'av.period1': 'month', 'av.period6': '6 mo',
    'av.justNow': 'today', 'av.daysAgo': '{n} days ago', 'av.back': 'Database · Users', 'av.pickUser': 'Choose a user in “Database”.',
    'av.info': 'Details', 'av.phone': 'Phone', 'av.google': 'Google', 'av.notConnected': 'not connected', 'av.region': 'Region', 'av.reg': 'Joined', 'av.lastLogin': 'Last sign-in', 'av.role': 'Role',
    'av.danger': 'Danger zone', 'av.resetSessions': 'Sign out on all devices', 'av.block': 'Block the account', 'av.unblock': 'Unblock the account', 'av.delete': 'Delete the account', 'av.sessionsReset': 'Sessions ended: {n}',
    'av.sub': 'Subscription', 'av.renewOn': 'auto-renewal on', 'av.renewOff': 'auto-renewal off', 'av.untilD': 'until {d}', 'av.changePlan': 'Change plan', 'av.apply': 'Apply', 'av.extend': 'Extend by hand', 'av.days': '{n} days', 'av.extendBtn': 'Extend',
    'av.resetLimit': 'Reset the weekly limit', 'av.givePromo': 'Give a promo code', 'av.refund': 'Refund a payment', 'av.stopRenew': 'Turn off renewal', 'av.saved': 'Saved', 'av.soon': 'Works once payments and the database are connected',
    'av.k.aiCalls': 'AI requests this week', 'av.aiWeek': 'AI lessons this week', 'av.aiCost': 'AI cost, month', 'av.taught': 'Lessons taught', 'av.pays': 'Payments', 'av.log': 'Activity log', 'av.noPays': 'No payments', 'av.noLog': 'No entries',
    'av.saveAll': 'Save changes', 'av.savedLocal': 'Saved in this browser — the platform already uses these prices. Server copy once the database is connected.', 'av.savedServer': 'Saved on the server', 'av.savedDemo': 'This is an example — changes are not saved',
    'av.nUsers': '{n} users', 'av.nSchools': '{n} schools', 'av.pm': 'Price / mo', 'av.p6': 'Price / 6 mo', 'av.aiPerWeek': 'AI lessons / week', 'av.unlimitedHint': 'empty = unlimited', 'av.analysis': 'Lesson analysis', 'av.agent': 'Open-lesson agent / mo', 'av.minTeachers': 'Min. teachers', 'av.price': 'Price', 'av.deal': 'by agreement', 'av.games': 'Games without AI', 'av.yes': 'yes',
    'av.payMethods': 'Payment methods', 'av.pm.card': 'Bank cards', 'av.pm.cardN': 'Through the payment gateway', 'av.pm.kaspi': 'Kaspi QR', 'av.pm.kaspiN': 'QR payment in the Kaspi.kz app', 'av.pm.apple': 'Apple Pay', 'av.pm.appleN': 'Safari on iPhone, iPad, Mac', 'av.pm.google': 'Google Pay', 'av.pm.googleN': 'Chrome and Android', 'av.connected': 'connected', 'av.notYet': 'not connected',
    'av.promos': 'Promo codes', 'av.create': '+ Create', 'av.code': 'Code', 'av.off2': 'Discount', 'av.plan': 'Plan', 'av.used': 'Used', 'av.till': 'Until', 'av.allPlans': 'All', 'av.freeM': '{n} mo free', 'av.newPromo': 'New promo code', 'av.discount': 'Discount, %', 'av.orFree': 'or free months', 'av.limit': 'How many uses (0 — unlimited)', 'av.removePromo': 'Delete',
    'av.schoolReq': 'School requests · {n}.', 'av.open': 'Open',
    'av.keys': 'API keys', 'av.keysNote': 'Keys are stored only on the server, encrypted; the browser sees just the start and end. Up to 3 keys per service — if one hits its limit, the server takes the next.', 'av.provider': 'Service', 'av.slot': 'Slot', 'av.label': 'Label', 'av.value': 'Key', 'av.addKey': 'Add a key', 'av.lastUsed': 'Last used', 'av.fails': 'Errors', 'av.never': 'not yet', 'av.keySaved': 'Key saved', 'av.noKeys': 'No keys — AI and picture search are off.',
    'av.adminsNote': 'Only the owner gives roles. Owners are set on the server (OWNER_EMAILS).', 'av.makeAdmin': 'Make administrator', 'av.makeTeacher': 'Remove the role', 'av.findUser': 'Find a user by name or email', 'av.r.owner': 'owner', 'av.r.admin': 'administrator', 'av.r.teacher': 'teacher',
    'av.l.at': 'When', 'av.l.actor': 'Who', 'av.l.action': 'Action', 'av.l.target': 'On what', 'av.ownerOnly': 'The log is available to the owner only.'
  }
});

const money = n => (n == null ? '—' : new Intl.NumberFormat('ru-RU').format(n) + ' ₸');
const numF = n => (n == null ? '—' : new Intl.NumberFormat('ru-RU').format(n));
const d8 = iso => (iso ? new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—');
const ago = iso => { if (!iso) return '—'; const n = Math.floor((Date.now() - Date.parse(iso)) / 86400000); return n <= 0 ? t('av.justNow') : t('av.daysAgo', { n }); };
const planName = id => t('plan.' + id);
const badge = st => html`<span class="av-st ${st}">${t('av.s.' + st)}</span>`;
const demoPill = () => (S.getMode() === 'demo' ? html`<span class="tag">${t('av.demo')}</span>` : '');
const soonBox = text => html`<div class="av-soon">${icon('M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 8v5M12 16h.01', 16)}<span>${text}</span></div>`;

function csv(rows, name) {
  const text = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- 29 · Overview ---------- */

export async function overview(main, { setAlerts }) {
  let period = 'month';
  const [st, list, pays, methods, keys, schools] = await Promise.all([S.stats(), S.users(), S.payments(), S.paymentMethods(), S.keys().catch(() => null), S.schoolRequests()]);
  const paysOk = Array.isArray(pays);
  const noGemini = keys && !keys.keys.some(k => k.provider === 'gemini' && k.active);
  setAlerts({ payments: paysOk ? pays.filter(p => p.status === 'failed').length || '' : '' });
  const draw = () => {
    const days = { today: 1, week: 7, month: 30 }[period];
    const from = Date.now() - days * 86400000;
    const inP = paysOk ? pays.filter(p => Date.parse(p.at) > from && p.status === 'paid') : [];
    const revenue = paysOk ? inP.reduce((s, p) => s + p.sum, 0) : null;
    const aiCost = revenue != null && S.getMode() === 'demo' ? Math.round(revenue * 0.24) : null;
    const byDay = paysOk ? Array.from({ length: Math.max(days, 7) }, (_, i) => { const d0 = new Date(); d0.setHours(0, 0, 0, 0); const a = d0.getTime() - (Math.max(days, 7) - 1 - i) * 86400000; return pays.filter(p => p.status === 'paid' && Date.parse(p.at) >= a && Date.parse(p.at) < a + 86400000).reduce((s, p) => s + p.sum, 0); }) : [];
    const maxDay = Math.max(1, ...byDay);
    const byPlan = ['basic', 'standard', 'max', 'school'].map(id => ({ id, n: list.filter(u => u.plan === id).length }));
    const maxPlan = Math.max(1, ...byPlan.map(p => p.n));
    const kpis = S.getMode() === 'demo' || st.revenue !== null
      ? [[t('av.k.users'), numF(st.totalUsers), st.newWeek != null ? t('av.k.newWeek', { n: st.newWeek }) : ''], [t('av.k.subs'), numF(st.activeSubs), ''], [t('av.k.revenue'), money(revenue), ''], [t('av.k.ai'), aiCost == null && st.aiWeek != null ? numF(st.aiWeek) : money(aiCost), aiCost != null && revenue ? t('av.k.aiShare', { p: '24%' }) : st.aiWeek != null ? t('av.k.aiCalls') : ''], [t('av.k.lessons'), numF(st.lessons), '']]
      : [[t('av.k.users'), numF(st.totalUsers), ''], [t('av.k.subs'), numF(st.activeSubs), ''], [t('av.k.revenue'), '—', ''], [t('av.k.aiToday'), numF(st.aiToday), ''], [t('av.k.suspended'), numF(st.suspended), '']];
    const attention = [
      paysOk && pays.filter(p => p.status === 'failed').length ? [pays.filter(p => p.status === 'failed').length, t('av.a.failed'), '#/payments'] : null,
      schools.length ? [schools.length, t('av.a.schools'), '#/plans'] : null,
      noGemini ? ['!', t('av.a.noKey'), '#/ai'] : null,
      st.suspended ? [st.suspended, t('av.a.suspended'), '#/db'] : null
    ].filter(Boolean);
    const share = methods.filter(m => m.share).map(m => `${t('av.m.' + m.id)} ${m.share}%`).join(' · ');
    main.innerHTML = html`
      <div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.overview')}</h1>${demoPill()}</div>
        <div class="head-right">${segmented('period', [{ id: 'today', label: t('av.today') }, { id: 'week', label: t('av.week') }, { id: 'month', label: t('av.month') }], period, 'lg')}<button type="button" class="btn-o btn-md" data-export>${t('av.export')}</button></div></div>
      <div class="stats c5">${kpis.map(([l, v, d], i) => html`<div class="stat${i === 2 ? ' dark' : ''}"><div class="stat-l">${l}</div><div class="stat-v av-v">${v}</div><div class="av-d${i === 3 ? ' neg' : ''}">${d}</div></div>`)}</div>
      <div class="av-row2">
        <div class="card"><div class="card-head"><span class="card-title">${t('av.revenueDays')}</span><span class="small">${t('av.' + period)}</span></div>
          ${paysOk ? html`<div class="av-bars">${byDay.map((v, i) => html`<span title="${money(v)}" style="height:${Math.max(3, Math.round(v / maxDay * 100))}%" class="${i === byDay.length - 1 ? 'last' : ''}"></span>`)}</div>` : soonBox(t('av.soonPay'))}</div>
        <div class="card"><span class="card-title">${t('av.byPlan')}</span>
          ${byPlan.map(p => html`<div class="bar-row"><span class="n w">${planName(p.id)}</span><span class="bar"><i style="width:${Math.round(p.n / maxPlan * 100)}%"></i></span><span class="v">${p.n}</span></div>`)}
          ${share ? html`<span class="small">${t('av.methods', { list: share })}</span>` : ''}</div>
      </div>
      <div class="av-row2 b">
        <div class="card"><div class="card-head"><span class="card-title">${t('av.lastPays')}</span><a class="card-link" href="#/payments">${t('av.all')}</a></div>
          ${paysOk ? (pays.length ? pays.slice(0, 5).map(p => html`<a class="av-pay" href="#/user/${p.userId}"><b>${p.who}</b><span>${planName(p.plan)} · ${t('av.period' + p.period)}</span><span>${t('av.m.' + p.method)}</span><b>${money(p.sum)}</b><span class="${p.status}">${t('av.p.' + p.status)}</span></a>`) : html`<p class="muted-note">${t('av.noPays')}</p>`) : soonBox(t('av.soonPay'))}</div>
        <div class="card"><span class="card-title">${t('av.attention')}</span>
          ${attention.length ? attention.map(([n, text, href]) => html`<a class="av-att" href="${href}"><b>${n}</b><span>${text}</span></a>`) : html`<p class="muted-note">${t('av.a.none')}</p>`}</div>
      </div>`;
    main.querySelectorAll('[data-seg="period"]').forEach(b => b.onclick = () => { period = b.dataset.id; draw(); });
    main.querySelector('[data-export]').onclick = () => csv([['id', 'name', 'email', 'phone', 'plan', 'status', 'since', 'last'], ...list.map(u => [u.id, u.name, u.email, u.phone, u.plan, u.status, u.since, u.last])], 'alaqai-users.csv');
  };
  draw();
}

/* ---------- 30 · Database ---------- */

export async function database(main, { query }) {
  let tab = query.tab || 'users', q = query.q || '', page = 0;
  const F = { plan: '', status: '', via: '' };
  let list = await S.users();
  const pays = await S.payments();
  const schools = await S.schoolRequests();
  const demo = S.getMode() === 'demo';
  const PER = 12;
  const draw = () => {
    const s = q.trim().toLowerCase();
    const users = list.filter(u => (!s || [u.name, u.email, u.phone, u.school].some(v => v && v.toLowerCase().includes(s))) && (!F.plan || u.plan === F.plan) && (!F.status || u.status === F.status) && (!F.via || u.via === F.via));
    const subs = users.filter(u => u.plan !== 'basic');
    const counts = { users: list.length, lessons: demo ? list.reduce((a, u) => a + u.lessons, 0) : null, subs: list.filter(u => u.plan !== 'basic').length, pays: Array.isArray(pays) ? pays.length : null, schools: demo ? schools.length : null };
    let head = [], rows = [], total = 0, body;
    if (tab === 'users') {
      total = users.length;
      head = ['', t('av.c.user'), t('av.c.via'), t('av.c.school'), t('av.c.plan'), t('av.c.status'), t('av.c.ai'), t('av.c.since'), t('av.c.last')];
      rows = users.slice(page * PER, page * PER + PER).map(u => html`<a class="av-tr users" href="#/user/${u.id}"><span class="avatar sm">${initials(u.name)}</span><span class="who"><b>${u.name}</b><span>${u.email || u.phone || ''}</span></span><span>${t('av.via.' + u.via)}</span><span>${u.school || '—'}</span><span>${planName(u.plan)}</span><span>${badge(u.status)}</span><span>${u.aiWeek == null ? '—' : u.plan === 'max' ? u.aiWeek : u.aiWeek + '/20'}</span><span>${d8(u.since)}</span><span>${ago(u.last)}</span></a>`);
    } else if (tab === 'subs') {
      total = subs.length;
      head = ['', t('av.c.user'), t('av.c.plan'), t('av.c.status'), t('av.c.until'), t('av.c.renew')];
      rows = subs.slice(page * PER, page * PER + PER).map(u => html`<a class="av-tr subs" href="#/user/${u.id}"><span class="avatar sm">${initials(u.name)}</span><span class="who"><b>${u.name}</b><span>${u.email || u.phone || ''}</span></span><span>${planName(u.plan)}</span><span>${badge(u.status)}</span><span>${d8(u.until)}</span><span>${u.autoRenew === false ? t('av.off') : u.autoRenew ? t('av.on') : '—'}</span></a>`);
    } else if (tab === 'lessons' && demo) {
      const top = [...users].sort((a, b) => b.lessons - a.lessons);
      total = top.length;
      head = ['', t('av.c.user'), t('av.c.school'), t('av.c.plan'), t('av.c.lessons')];
      rows = top.slice(page * PER, page * PER + PER).map(u => html`<a class="av-tr lessons" href="#/user/${u.id}"><span class="avatar sm">${initials(u.name)}</span><span class="who"><b>${u.name}</b><span>${u.email || u.phone || ''}</span></span><span>${u.school}</span><span>${planName(u.plan)}</span><b>${u.lessons}</b></a>`);
    } else if (tab === 'pays' && Array.isArray(pays)) {
      total = pays.length;
      head = [t('av.c.date'), t('av.c.user'), t('av.c.what'), t('av.c.how'), t('av.c.sum'), t('av.c.status')];
      rows = pays.slice(page * PER, page * PER + PER).map(p => payRow(p));
    } else if (tab === 'schools' && demo) {
      total = schools.length;
      head = [t('av.c.school'), t('av.c.teachers'), t('av.c.req')];
      rows = schools.map(x => html`<div class="av-tr schools"><b>${x.name}</b><span>${x.teachers}</span><span class="tag lime">${t('av.new')}</span></div>`);
    } else body = soonBox(tab === 'pays' ? t('av.soonPay') : t('av.soonDb'));
    main.innerHTML = html`
      <div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.db')}</h1>${demoPill()}</div><div class="head-right"><button type="button" class="btn-o btn-md" data-export>${t('av.exportCsv')}</button></div></div>
      <div class="av-tabs">${['users', 'lessons', 'subs', 'pays', 'schools'].map(id => html`<button type="button" data-tab="${id}" class="${tab === id ? 'on' : ''}">${t('av.t.' + id)} <span>${counts[id] == null ? '' : numF(counts[id])}</span></button>`)}</div>
      ${tab === 'users' || tab === 'subs' ? moreBox('adm-filters', html`<div class="av-filters"><label class="av-search">${icon('M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4', 16)}<input name="q" value="${q}" placeholder="${t('av.search')}" aria-label="${t('av.search')}"></label>
        ${[['plan', ['basic', 'standard', 'max', 'school'], planName], ['status', ['active', 'debt', 'blocked', 'free'], x => t('av.s.' + x)], ['via', ['google', 'phone'], x => t('av.via.' + x)]].map(([k, opts, lab]) => html`<select data-f="${k}" aria-label="${t('av.f.' + k)}"><option value="">${t('av.f.' + k)}: ${t('av.f.all')}</option>${opts.map(o => html`<option value="${o}" ${F[k] === o ? raw('selected') : ''}>${t('av.f.' + k)}: ${lab(o)}</option>`)}</select>`)}</div>`.toString(), [q, F.plan && planName(F.plan), F.status && t('av.s.' + F.status), F.via && t('av.via.' + F.via)].filter(Boolean).join(' · '), t('av.filters')) : ''}
      <div class="card av-table">
        ${body || html`${head.length ? html`<div class="av-tr h ${tab}">${head.map(h => html`<span>${h}</span>`)}</div>` : ''}${rows.length ? rows : html`<p class="muted-note av-empty">${t('av.none')}</p>`}
        ${total > PER ? html`<div class="av-pager"><span>${t('av.range', { a: page * PER + 1, b: Math.min(total, page * PER + PER), n: numF(total) })}</span><span><button type="button" class="icon-btn" data-page="-1" aria-label="${t('av.prev')}" ${page === 0 ? raw('disabled') : ''}>${icon('chevronLeft')}</button><button type="button" class="icon-btn" data-page="1" aria-label="${t('av.next')}" ${(page + 1) * PER >= total ? raw('disabled') : ''}>${icon('chevronRight')}</button></span></div>` : ''}`}
      </div>`;
    main.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; page = 0; draw(); });
    main.querySelectorAll('[data-page]').forEach(b => b.onclick = () => { page += Number(b.dataset.page); draw(); });
    main.querySelectorAll('[data-f]').forEach(sel => sel.onchange = () => { F[sel.dataset.f] = sel.value; page = 0; draw(); });
    const inp = main.querySelector('[name="q"]');
    if (inp) {
      let timer;
      inp.oninput = () => { clearTimeout(timer); timer = setTimeout(async () => { q = inp.value; page = 0; if (!demo) list = await S.users(q); draw(); const n = main.querySelector('[name="q"]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
    }
    main.querySelector('[data-export]').onclick = () => csv([['id', 'name', 'email', 'phone', 'school', 'plan', 'status', 'since', 'last'], ...users.map(u => [u.id, u.name, u.email, u.phone, u.school, u.plan, u.status, u.since, u.last])], 'alaqai-users.csv');
  };
  draw();
}

function payRow(p) {
  return html`<a class="av-tr pays" href="#/user/${p.userId}"><span>${d8(p.at)}</span><b>${p.who}</b><span>${planName(p.plan)} · ${t('av.period' + p.period)}</span><span>${t('av.m.' + p.method)}</span><b>${money(p.sum)}</b><span class="${p.status}">${t('av.p.' + p.status)}</span></a>`;
}

/* ---------- 31 · Account ---------- */

export async function account(main, { args }) {
  if (!args[0]) { main.innerHTML = html`<div class="empty"><h2>${t('ad.user')}</h2><p>${t('av.pickUser')}</p><div class="row"><a class="btn-k" href="#/db">${t('ad.db')}</a></div></div>`; return; }
  const u = await S.user(args[0]);
  if (!u) { main.innerHTML = html`<div class="empty"><h2>${t('av.none')}</h2><div class="row"><a class="btn-k" href="#/db">${t('ad.db')}</a></div></div>`; return; }
  const [pays, log, plans] = await Promise.all([S.payments(), S.userLog(u), S.plansConfig()]);
  const mine = Array.isArray(pays) ? pays.filter(p => String(p.userId) === String(u.id)) : null;
  const soon = () => toast(t('av.soon'));
  const draw = () => {
    const limit = u.plan === 'max' || u.plan === 'school' ? null : plans[u.plan] && plans[u.plan].aiLessonsPerWeek;
    main.innerHTML = html`
      <a class="av-back" href="#/db">${icon('chevronLeft', 16)}${t('av.back')}</a>
      <div class="av-uhead"><span class="avatar xl">${initials(u.name)}</span><div class="grow"><div class="av-h"><h1 class="title title-sm">${u.name}</h1>${badge(u.status)}${demoPill()}</div>
        <div class="small">ID ${u.id}${u.school ? ' · ' + u.school : ''}${u.region ? ', ' + u.region : ''} · ${t('av.r.' + (u.role || 'teacher'))}</div></div></div>
      <div class="av-ugrid">
        <div class="av-col">
          <div class="card"><span class="card-title">${t('av.info')}</span>
            ${[[t('av.phone'), u.phone || t('av.notConnected')], [t('av.google'), u.email || t('av.notConnected')], [t('av.region'), u.region || '—'], [t('av.reg'), d8(u.since)], [t('av.lastLogin'), u.last ? new Date(u.last).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—']].map(([k, v]) => html`<div class="av-kv"><span>${k}</span><b>${v}</b></div>`)}</div>
          <div class="card av-danger"><span class="card-title">${t('av.danger')}</span>
            <button type="button" class="btn-o" data-sessions>${t('av.resetSessions')}</button>
            <button type="button" class="btn-o" data-block>${u.status === 'blocked' ? t('av.unblock') : t('av.block')}</button>
            <button type="button" class="btn-o red" data-delete>${t('av.delete')}</button></div>
        </div>
        <div class="av-col">
          <div class="card"><div class="card-head"><span class="card-title">${t('av.sub')}</span>${u.plan !== 'basic' ? html`<span class="small">${u.autoRenew === false ? t('av.renewOff') : t('av.renewOn')}</span>` : ''}</div>
            <div class="av-plan"><b>${planName(u.plan)}</b>${u.until ? html`<span>${t('av.untilD', { d: d8(u.until) })}</span>` : ''}</div>
            <div class="av-ctrl">
              <label class="field muted sm">${t('av.changePlan')}<span class="av-inline"><select name="plan">${['basic', 'standard', 'max', 'school'].map(p => html`<option value="${p}" ${p === u.plan ? raw('selected') : ''}>${planName(p)}</option>`)}</select><button type="button" class="btn-o btn-sm" data-plan>${t('av.apply')}</button></span></label>
              <label class="field muted sm">${t('av.extend')}<span class="av-inline"><select name="days">${[7, 30, 90, 180].map(n => html`<option value="${n}" ${n === 30 ? raw('selected') : ''}>${t('av.days', { n })}</option>`)}</select><button type="button" class="btn-k btn-sm" data-extend>${t('av.extendBtn')}</button></span></label>
            </div>
            <div class="av-btns"><button type="button" class="btn-o btn-sm" data-soon>${t('av.resetLimit')}</button><button type="button" class="btn-o btn-sm" data-soon>${t('av.givePromo')}</button><button type="button" class="btn-o btn-sm" data-soon>${t('av.refund')}</button><button type="button" class="btn-o btn-sm" data-soon>${t('av.stopRenew')}</button></div>
          </div>
          <div class="stats c3">
            <div class="stat"><div class="stat-l">${t('av.aiWeek')}</div><div class="stat-v av-v">${u.aiWeek == null ? '—' : limit ? `${u.aiWeek} / ${limit}` : u.aiWeek}</div></div>
            <div class="stat"><div class="stat-l">${t('av.aiCost')}</div><div class="stat-v av-v">${u.aiCostMonth != null ? money(u.aiCostMonth) : '—'}</div></div>
            <div class="stat"><div class="stat-l">${t('av.taught')}</div><div class="stat-v av-v">${u.lessons != null ? u.lessons : '—'}</div></div>
          </div>
          <div class="card"><span class="card-title">${t('av.pays')}</span>
            ${mine ? (mine.length ? mine.map(p => html`<div class="av-tr upays"><span>${d8(p.at)}</span><span>${planName(p.plan)} · ${t('av.period' + p.period)}</span><span>${t('av.m.' + p.method)}</span><b>${money(p.sum)}</b><span class="${p.status}">${t('av.p.' + p.status)}</span></div>`) : html`<p class="muted-note">${t('av.noPays')}</p>`) : soonBox(t('av.soonPay'))}</div>
        </div>
        <div class="card av-log"><span class="card-title">${t('av.log')}</span>
          ${log.length ? log.map(l => html`<div class="av-logrow"><span>${l.at}</span><span>${l.text}</span></div>`) : html`<p class="muted-note">${t('av.noLog')}</p>`}</div>
      </div>`;
    main.querySelectorAll('[data-soon]').forEach(b => b.onclick = soon);
    main.querySelector('[data-delete]').onclick = soon;
    main.querySelector('[data-plan]').onclick = async () => { try { Object.assign(u, await S.updateUser(u, { plan: main.querySelector('[name="plan"]').value })); toast(t('av.saved')); draw(); } catch (e) { toast(e.message); } };
    main.querySelector('[data-extend]').onclick = async () => {
      const base = u.until && Date.parse(u.until) > Date.now() ? Date.parse(u.until) : Date.now();
      try { Object.assign(u, await S.updateUser(u, { until: new Date(base + Number(main.querySelector('[name="days"]').value) * 86400000).toISOString() })); toast(t('av.saved')); draw(); } catch (e) { toast(e.message); }
    };
    main.querySelector('[data-block]').onclick = async () => { try { Object.assign(u, await S.updateUser(u, { blocked: u.status !== 'blocked' })); toast(t('av.saved')); draw(); } catch (e) { toast(e.message); } };
    main.querySelector('[data-sessions]').onclick = async () => {
      try { const list = await S.sessionsOf(u); for (const s of list) await S.revokeSession(s.id); toast(t('av.sessionsReset', { n: list.length })); } catch (e) { toast(e.status === 403 ? t('av.ownerOnly') : e.message); }
    };
  };
  draw();
}

/* ---------- 32 · Plans, payment methods, promo codes ---------- */

export async function plans(main) {
  const [cfg, list, methods, promoList, schools] = await Promise.all([S.plansConfig(), S.users(), S.paymentMethods(), S.promos(), S.schoolRequests()]);
  const P = JSON.parse(JSON.stringify(cfg));
  let promos = [...promoList];
  const count = id => list.filter(u => u.plan === id).length;
  const inp = (plan, key, label, hint = '') => html`<label class="av-pf">${label}<input data-p="${plan}" data-k="${key}" inputmode="numeric" value="${P[plan][key] == null ? '' : P[plan][key]}" placeholder="${hint}"></label>`;
  const ro = (label, value) => html`<label class="av-pf">${label}<input value="${value}" disabled></label>`;
  const draw = () => {
    main.innerHTML = html`
      <div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.plans')}</h1>${demoPill()}</div><button type="button" class="btn-k btn-md" data-save>${t('av.saveAll')}</button></div>
      <div class="av-plans">
        <div class="card"><div class="card-head"><span class="card-title">${planName('basic')}</span></div><span class="small">${t('av.nUsers', { n: count('basic') })}</span>
          ${ro(t('av.pm'), '0 ₸')}${ro(t('av.aiPerWeek'), '0')}${ro(t('av.games'), t('av.yes'))}</div>
        <div class="card"><div class="card-head"><span class="card-title">${planName('standard')}</span></div><span class="small">${t('av.nUsers', { n: count('standard') })}</span>
          ${inp('standard', 'priceMonth', t('av.pm'))}${inp('standard', 'price6', t('av.p6'))}${inp('standard', 'aiLessonsPerWeek', t('av.aiPerWeek'))}
          <label class="pk-toggle av-tg"><span>${t('av.analysis')}</span><input type="checkbox" data-p="standard" data-k="lessonAnalysis" ${P.standard.lessonAnalysis ? raw('checked') : ''}><i></i></label></div>
        <div class="card"><div class="card-head"><span class="card-title">${planName('max')}</span></div><span class="small">${t('av.nUsers', { n: count('max') })}</span>
          ${inp('max', 'priceMonth', t('av.pm'))}${inp('max', 'price6', t('av.p6'))}${inp('max', 'aiLessonsPerWeek', t('av.aiPerWeek'), t('av.unlimitedHint'))}${inp('max', 'openLessonAgentPerMonth', t('av.agent'))}</div>
        <div class="card soft"><div class="card-head"><span class="card-title">${planName('school')}</span></div><span class="small">${t('av.nSchools', { n: count('school') })}</span>
          ${ro(t('av.price'), t('av.deal'))}${inp('school', 'minTeachers', t('av.minTeachers'))}${inp('school', 'aiLessonsPerWeek', t('av.aiPerWeek'), t('av.unlimitedHint'))}</div>
      </div>
      <div class="av-row2 c">
        <div class="card"><span class="card-title">${t('av.payMethods')}</span>
          ${methods.map(m => html`<div class="av-method"><span class="chip-pay ${m.id === 'kaspi' ? 'kaspi' : m.id === 'apple' ? 'apple' : ''}">${{ card: 'VISA · MC', kaspi: 'Kaspi', apple: 'Pay', google: 'G Pay' }[m.id]}</span>
            <span class="grow"><b>${t('av.pm.' + m.id)}</b><span>${t('av.pm.' + m.id + 'N')}</span></span>${m.share ? html`<span class="small">${m.share}%</span>` : ''}<span class="av-st ${m.on ? 'active' : 'free'}">${m.on ? t('av.connected') : t('av.notYet')}</span></div>`)}</div>
        <div class="card av-x"><div class="card-head"><span class="card-title">${t('av.promos')}</span><button type="button" class="btn-o btn-sm" data-newpromo>${t('av.create')}</button></div>
          <div class="av-tr h promos"><span>${t('av.code')}</span><span>${t('av.off2')}</span><span>${t('av.plan')}</span><span>${t('av.used')}</span><span>${t('av.till')}</span><span></span></div>
          ${promos.length ? promos.map((c, i) => html`<div class="av-tr promos"><b class="mono">${c.code}</b><span>${c.off ? '−' + Math.round(c.off * 100) + '%' : t('av.freeM', { n: c.freeMonths })}</span><span>${!c.plan || c.plan === 'all' ? t('av.allPlans') : planName(c.plan)}</span><span>${c.used || 0} / ${c.limit || '∞'}</span><span>${c.till ? d8(c.till) : '—'}</span><button type="button" class="link-btn danger" data-rm="${i}">${t('av.removePromo')}</button></div>`) : html`<p class="muted-note">${t('av.none')}</p>`}
          ${schools.length ? html`<div class="av-req"><b>${t('av.schoolReq', { n: schools.length })}</b> ${schools.map(s => `${s.name} — ${s.teachers}`).join(', ')}. <a href="#/db?tab=schools">${t('av.open')}</a></div>` : ''}
        </div>
      </div>`;
    main.querySelectorAll('[data-p]').forEach(el => el.onchange = () => {
      const v = el.type === 'checkbox' ? el.checked : el.value.trim() === '' ? null : Number(el.value.replace(/\s/g, ''));
      if (el.type !== 'checkbox' && v != null && Number.isNaN(v)) { el.value = P[el.dataset.p][el.dataset.k] ?? ''; return; }
      P[el.dataset.p][el.dataset.k] = v;
    });
    main.querySelector('[data-save]').onclick = async () => {
      const where = await S.savePlans({ standard: P.standard, max: P.max, school: P.school });
      await S.savePromos(promos);
      toast(where === 'server' ? t('av.savedServer') : where === 'demo' ? t('av.savedDemo') : t('av.savedLocal'));
    };
    main.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { promos.splice(Number(b.dataset.rm), 1); draw(); });
    main.querySelector('[data-newpromo]').onclick = () => openModal({
      title: t('av.newPromo'),
      body: html`<div class="fields"><label class="field">${t('av.code')}<input name="code" required maxlength="24" style="text-transform:uppercase"></label>
        <div class="av-2"><label class="field">${t('av.discount')}<input name="off" type="number" min="0" max="100"></label><label class="field">${t('av.orFree')}<input name="free" type="number" min="0" max="12"></label></div>
        <div class="av-2"><label class="field">${t('av.plan')}<select name="plan"><option value="all">${t('av.allPlans')}</option><option value="standard">${planName('standard')}</option><option value="max">${planName('max')}</option></select></label><label class="field">${t('av.till')}<input name="till" type="date"></label></div>
        <label class="field">${t('av.limit')}<input name="limit" type="number" min="0" value="0"></label></div>`.toString(),
      onSubmit: f => {
        const code = f.code.value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        const off = Number(f.off.value) || 0, free = Number(f.free.value) || 0;
        if (!code || (!off && !free)) return false;
        promos.push({ code, ...(off ? { off: Math.min(100, off) / 100 } : { freeMonths: free }), plan: f.plan.value, used: 0, limit: Number(f.limit.value) || 0, till: f.till.value || '' });
        draw();
      }
    });
  };
  draw();
}

/* ---------- Payments ---------- */

export async function paymentsPage(main) {
  const pays = await S.payments();
  const waiting = Array.isArray(pays) ? pays.filter(p => p.status === 'pending' && p.method === 'kaspi') : [];
  main.innerHTML = html`<div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.payments')}</h1>${demoPill()}</div></div>
    ${waiting.length ? html`<div class="card av-kaspi"><span class="card-title">${t('av.kaspiWait')} · ${waiting.length}</span><p class="muted-note">${t('av.kaspiNote')}</p>
      ${waiting.map(p => html`<div class="av-tr kwait"><span>${d8(p.at)}</span><b>${p.who || '—'}</b><span class="mono">${p.code}</span><b>${money(p.sum)}</b>
        <span class="av-btns"><button type="button" class="btn-k btn-sm" data-ok="${p.id}">${t('av.confirm')}</button><button type="button" class="btn-o btn-sm" data-no="${p.id}">${t('av.reject')}</button></span></div>`)}</div>` : ''}
    <div class="card av-table">${Array.isArray(pays) ? html`<div class="av-tr h pays">${[t('av.c.date'), t('av.c.user'), t('av.c.what'), t('av.c.how'), t('av.c.sum'), t('av.c.status')].map(h => html`<span>${h}</span>`)}</div>${pays.length ? pays.filter(p => p.status !== 'pending').slice(0, 100).map(payRow) : html`<p class="muted-note av-empty">${t('av.noPays')}</p>`}` : soonBox(t('av.soonPay'))}</div>`;
  const act = (attr, status, msg) => main.querySelectorAll(`[${attr}]`).forEach(b => b.onclick = async () => {
    b.disabled = true;
    try { await S.setPaymentStatus(b.getAttribute(attr), status); toast(t(msg)); paymentsPage(main); } catch (e) { toast(e.message); b.disabled = false; }
  });
  act('data-ok', 'paid', 'av.confirmed');
  act('data-no', 'failed', 'av.rejected');
}

/* ---------- AI keys and costs ---------- */

export async function aiPage(main) {
  const [st, data] = await Promise.all([S.stats(), S.keys()]);
  const draw = () => {
    main.innerHTML = html`<div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.ai')}</h1>${demoPill()}</div></div>
      <div class="stats c3"><div class="stat"><div class="stat-l">${t('av.k.aiToday')}</div><div class="stat-v av-v">${numF(st.aiToday ?? (S.getMode() === 'demo' ? 1284 : null))}</div></div>
        <div class="stat"><div class="stat-l">${t('av.k.ai')}</div><div class="stat-v av-v">${money(st.aiCost)}</div></div>
        <div class="stat"><div class="stat-l">${t('av.keys')}</div><div class="stat-v av-v">${data.keys.filter(k => k.active).length}</div></div></div>
      <div class="card av-x"><span class="card-title">${t('av.keys')}</span><p class="muted-note">${t('av.keysNote')}</p>
        ${data.keys.length ? html`<div class="av-tr h keys"><span>${t('av.provider')}</span><span>${t('av.slot')}</span><span>${t('av.label')}</span><span>${t('av.value')}</span><span>${t('av.lastUsed')}</span><span>${t('av.fails')}</span><span></span></div>
          ${data.keys.map(k => html`<div class="av-tr keys"><b>${k.provider}</b><span>${k.slot}</span><span>${k.label || '—'}</span><span class="mono">${k.preview}</span><span>${k.last_used_at ? ago(k.last_used_at) : t('av.never')}</span><span>${k.fail_count}</span>
            <span class="av-inline"><label class="pk-toggle"><input type="checkbox" data-toggle="${k.id}" ${k.active ? raw('checked') : ''}><i></i></label><button type="button" class="link-btn danger" data-delkey="${k.id}">${t('ui.delete')}</button></span></div>`)}` : html`<p class="av-warn">${t('av.noKeys')}</p>`}
        <form class="av-keyform"><select name="provider" aria-label="${t('av.provider')}">${data.providers.map(p => html`<option>${p}</option>`)}</select>
          <select name="slot" aria-label="${t('av.slot')}">${Array.from({ length: data.maxSlots }, (_, i) => html`<option>${i + 1}</option>`)}</select>
          <input name="label" placeholder="${t('av.label')}" maxlength="40"><input name="value" type="password" placeholder="${t('av.value')}" autocomplete="off" required><button class="btn-k btn-md">${t('av.addKey')}</button></form>
      </div>`;
    main.querySelector('.av-keyform').onsubmit = async e => {
      e.preventDefault();
      const f = e.target;
      if (S.getMode() === 'demo') { f.value.value = ''; toast(t('av.savedDemo')); return; }
      try { await S.saveKey({ provider: f.provider.value, slot: Number(f.slot.value), label: f.label.value.trim(), value: f.value.value.trim() }); toast(t('av.keySaved')); Object.assign(data, await S.keys()); draw(); } catch (err) { toast(err.message); }
    };
    main.querySelectorAll('[data-toggle]').forEach(c => c.onchange = async () => { try { await S.toggleKey(c.dataset.toggle, c.checked); } catch (err) { toast(err.message); } });
    main.querySelectorAll('[data-delkey]').forEach(b => b.onclick = async () => { if (!(await confirmModal(t('ui.confirmDelete')))) return; try { await S.deleteKey(b.dataset.delkey); Object.assign(data, await S.keys()); draw(); } catch (err) { toast(err.message); } });
  };
  draw();
}

/* ---------- Administrators ---------- */

export async function admins(main, { who }) {
  let list = await S.users();
  const isOwner = S.getMode() === 'demo' || (who && who.role === 'owner');
  let q = '';
  const draw = () => {
    const staff = list.filter(u => u.role === 'owner' || u.role === 'admin');
    const found = q ? list.filter(u => u.role === 'teacher' && [u.name, u.email].some(v => v && v.toLowerCase().includes(q.toLowerCase()))).slice(0, 6) : [];
    main.innerHTML = html`<div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.admins')}</h1>${demoPill()}</div></div>
      <p class="muted-note">${t('av.adminsNote')}</p>
      <div class="card av-table">${staff.map(u => html`<div class="av-tr staff"><span class="avatar sm">${initials(u.name)}</span><span class="who"><b>${u.name}</b><span>${u.email || u.phone || ''}</span></span><span class="tag">${t('av.r.' + u.role)}</span>
        ${isOwner && u.role === 'admin' ? html`<button type="button" class="link-btn danger" data-role="teacher" data-id="${u.id}">${t('av.makeTeacher')}</button>` : html`<span></span>`}</div>`)}</div>
      ${isOwner ? html`<div class="card"><label class="av-search">${icon('M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4', 16)}<input name="q" value="${q}" placeholder="${t('av.findUser')}"></label>
        ${found.map(u => html`<div class="av-tr staff"><span class="avatar sm">${initials(u.name)}</span><span class="who"><b>${u.name}</b><span>${u.email || u.phone || ''}</span></span><span></span><button type="button" class="btn-o btn-sm" data-role="admin" data-id="${u.id}">${t('av.makeAdmin')}</button></div>`)}</div>` : ''}`;
    main.querySelectorAll('[data-role]').forEach(b => b.onclick = async () => {
      const u = list.find(x => String(x.id) === b.dataset.id);
      try { Object.assign(u, await S.updateUser(u, { role: b.dataset.role })); toast(t('av.saved')); draw(); } catch (e) { toast(e.message); }
    });
    const inp = main.querySelector('[name="q"]');
    if (inp) inp.oninput = () => { q = inp.value; draw(); const n = main.querySelector('[name="q"]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  };
  draw();
}

/* ---------- Activity log ---------- */

export async function logPage(main) {
  let rows;
  try { rows = await S.auditLog(); } catch (e) { rows = e.status === 403 ? 'owner' : []; }
  main.innerHTML = html`<div class="page-head center"><div class="av-h"><h1 class="title title-md">${t('ad.log')}</h1>${demoPill()}</div></div>
    <div class="card av-table">${rows === 'owner' ? html`<p class="muted-note av-empty">${t('av.ownerOnly')}</p>` : html`<div class="av-tr h log">${[t('av.l.at'), t('av.l.actor'), t('av.l.action'), t('av.l.target')].map(h => html`<span>${h}</span>`)}</div>
      ${rows.length ? rows.map(r => html`<div class="av-tr log"><span>${new Date(r.at).toLocaleString(lang() === 'en' ? 'en-GB' : 'ru-RU')}</span><span>${r.actor || '—'}</span><b class="mono">${r.action}</b><span>${r.target || '—'}</span></div>`) : html`<p class="muted-note av-empty">${t('av.noLog')}</p>`}`}</div>`;
}
