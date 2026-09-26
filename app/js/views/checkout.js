/* Screens 26–27: checkout. Plan, period, promo code and total on the left;
 * payment method on the right (card, Kaspi QR, Google Pay, Apple Pay). */
import { add, t, lang } from '../i18n.js';
import { html, raw, icon, toast } from '../ui.js';
import { billingConfig, plansTable, checkPromo, priceFor, startPayment } from '../billing.js';

add({
  ru: {
    'co.secure': 'Безопасная оплата', 'co.close': 'Закрыть', 'co.title': 'Оформление подписки', 'co.std': '{n} уроков с ИИ в неделю, анализ уроков и заданий', 'co.max': 'Без ограничений, ИИ-агенты',
    'co.m1': '1 месяц', 'co.m6': '6 месяцев · {p}', 'co.promo': 'Промокод', 'co.apply': 'Применить', 'co.promoOk': 'Промокод применён', 'co.promoBad': 'Промокод не найден или истёк', 'co.line': '{plan} · {period}', 'co.p1': '1 месяц', 'co.p6': '6 месяцев',
    'co.discount': 'Скидка', 'co.total': 'Итого', 'co.renew1': 'Подписка продлевается каждый месяц. Отключить продление можно в кабинете в любой момент.', 'co.renew6': 'Подписка продлевается каждые 6 месяцев. Отключить продление можно в кабинете в любой момент.',
    'co.method': 'Способ оплаты', 'co.card': 'Карта', 'co.kaspi': 'Kaspi QR', 'co.google': 'Google Pay', 'co.apple': 'Apple Pay',
    'co.number': 'Номер карты', 'co.exp': 'Срок', 'co.cvc': 'CVC', 'co.save': 'Сохранить карту для продления', 'co.pay': 'Оплатить {p}', 'co.cardNote': 'Оплата проходит через защищённый платёжный шлюз. Данные карты alaqai не хранит.',
    'co.kTitle': 'Оплата через Kaspi QR', 'co.k1': 'Откройте приложение Kaspi.kz', 'co.k2': 'Нажмите «Kaspi QR» и наведите камеру', 'co.k3': 'Подтвердите оплату {p}', 'co.kWait': 'Ждём оплату · код действует {t}', 'co.kOpen': 'Открыть Kaspi.kz на телефоне', 'co.kQr': 'Здесь появится QR-код',
    'co.gNote': 'Откроется окно Google Pay — выберите карту и подтвердите оплату.', 'co.gPay': 'Оплатить через Google Pay · {p}', 'co.aNote': 'Доступно на iPhone, iPad и Mac в Safari. Подтвердите оплату через Face ID или Touch ID.', 'co.aPay': 'Оплатить через Apple Pay · {p}',
    'co.off': 'Этот способ оплаты подключается. Пока тариф может включить администратор — напишите нам в WhatsApp.', 'co.write': 'Написать в WhatsApp', 'co.login': 'Войдите, чтобы оплатить подписку', 'co.loginBtn': 'Войти', 'co.err': 'Не удалось начать оплату: {m}'
  },
  kk: {
    'co.secure': 'Қауіпсіз төлем', 'co.close': 'Жабу', 'co.title': 'Жазылымды рәсімдеу', 'co.std': 'Аптасына {n} ЖИ-сабақ, сабақ пен тапсырма талдауы', 'co.max': 'Шектеусіз, ЖИ-агенттер',
    'co.m1': '1 ай', 'co.m6': '6 ай · {p}', 'co.promo': 'Промокод', 'co.apply': 'Қолдану', 'co.promoOk': 'Промокод қолданылды', 'co.promoBad': 'Промокод табылмады немесе мерзімі өтті', 'co.line': '{plan} · {period}', 'co.p1': '1 ай', 'co.p6': '6 ай',
    'co.discount': 'Жеңілдік', 'co.total': 'Барлығы', 'co.renew1': 'Жазылым ай сайын ұзартылады. Ұзартуды кабинетте кез келген уақытта өшіруге болады.', 'co.renew6': 'Жазылым әр 6 ай сайын ұзартылады. Ұзартуды кабинетте кез келген уақытта өшіруге болады.',
    'co.method': 'Төлем тәсілі', 'co.card': 'Карта', 'co.kaspi': 'Kaspi QR', 'co.google': 'Google Pay', 'co.apple': 'Apple Pay',
    'co.number': 'Карта нөмірі', 'co.exp': 'Мерзімі', 'co.cvc': 'CVC', 'co.save': 'Ұзарту үшін картаны сақтау', 'co.pay': '{p} төлеу', 'co.cardNote': 'Төлем қорғалған төлем шлюзі арқылы өтеді. alaqai карта деректерін сақтамайды.',
    'co.kTitle': 'Kaspi QR арқылы төлеу', 'co.k1': 'Kaspi.kz қосымшасын ашыңыз', 'co.k2': '«Kaspi QR» басып, камераны бағыттаңыз', 'co.k3': '{p} төлемін растаңыз', 'co.kWait': 'Төлемді күтудеміз · код {t} жарамды', 'co.kOpen': 'Телефонда Kaspi.kz ашу', 'co.kQr': 'QR-код осында шығады',
    'co.gNote': 'Google Pay терезесі ашылады — картаны таңдап, төлемді растаңыз.', 'co.gPay': 'Google Pay арқылы төлеу · {p}', 'co.aNote': 'Safari-де iPhone, iPad және Mac-та қолжетімді. Face ID не Touch ID арқылы растаңыз.', 'co.aPay': 'Apple Pay арқылы төлеу · {p}',
    'co.off': 'Бұл төлем тәсілі қосылып жатыр. Әзірге тарифті әкімші қоса алады — бізге WhatsApp-қа жазыңыз.', 'co.write': 'WhatsApp-қа жазу', 'co.login': 'Жазылымды төлеу үшін кіріңіз', 'co.loginBtn': 'Кіру', 'co.err': 'Төлемді бастау мүмкін болмады: {m}'
  },
  en: {
    'co.secure': 'Secure payment', 'co.close': 'Close', 'co.title': 'Your subscription', 'co.std': '{n} AI lessons a week, lesson and homework analysis', 'co.max': 'Unlimited, AI agents',
    'co.m1': '1 month', 'co.m6': '6 months · {p}', 'co.promo': 'Promo code', 'co.apply': 'Apply', 'co.promoOk': 'Promo code applied', 'co.promoBad': 'Promo code not found or expired', 'co.line': '{plan} · {period}', 'co.p1': '1 month', 'co.p6': '6 months',
    'co.discount': 'Discount', 'co.total': 'Total', 'co.renew1': 'The subscription renews every month. You can turn renewal off in your account at any time.', 'co.renew6': 'The subscription renews every 6 months. You can turn renewal off in your account at any time.',
    'co.method': 'Payment method', 'co.card': 'Card', 'co.kaspi': 'Kaspi QR', 'co.google': 'Google Pay', 'co.apple': 'Apple Pay',
    'co.number': 'Card number', 'co.exp': 'Expiry', 'co.cvc': 'CVC', 'co.save': 'Save the card for renewal', 'co.pay': 'Pay {p}', 'co.cardNote': 'Payment goes through a secure payment gateway. alaqai does not store card details.',
    'co.kTitle': 'Pay with Kaspi QR', 'co.k1': 'Open the Kaspi.kz app', 'co.k2': 'Tap “Kaspi QR” and point the camera', 'co.k3': 'Confirm the payment of {p}', 'co.kWait': 'Waiting for payment · the code works for {t}', 'co.kOpen': 'Open Kaspi.kz on the phone', 'co.kQr': 'The QR code appears here',
    'co.gNote': 'A Google Pay window opens — choose a card and confirm.', 'co.gPay': 'Pay with Google Pay · {p}', 'co.aNote': 'Available on iPhone, iPad and Mac in Safari. Confirm with Face ID or Touch ID.', 'co.aPay': 'Pay with Apple Pay · {p}',
    'co.off': 'This payment method is being connected. For now an administrator can switch your plan on — write to us on WhatsApp.', 'co.write': 'Write on WhatsApp', 'co.login': 'Sign in to pay for a subscription', 'co.loginBtn': 'Sign in', 'co.err': 'Could not start the payment: {m}'
  }
});

const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
const CHIPS = { card: ['VISA · MC', ''], kaspi: ['Kaspi', 'kaspi'], google: ['G Pay', ''], apple: ['Pay', 'apple'] };
const WA = 'https://wa.me/77759018100';

export async function render(main, { query }) {
  const [plans, methods] = await Promise.all([plansTable(), billingConfig()]);
  const S = { plan: query.plan === 'max' ? 'max' : 'standard', period: query.period === '6' ? '6' : '1', method: query.method && CHIPS[query.method] ? query.method : 'card', promo: null, promoText: '' };
  let kaspiLeft = 600, timer = null;

  const draw = () => {
    const price = priceFor(plans, S.plan, S.period, S.promo);
    const name = t('plan.' + S.plan);
    const on = methods[S.method];
    const off = html`<div class="co-off">${icon('M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 8v5M12 16h.01', 16)}<span>${t('co.off')}</span><a class="link-btn" href="${WA}" target="_blank" rel="noopener">${t('co.write')}</a></div>`;
    const payBody = {
      card: html`<div class="co-card${on ? '' : ' disabled'}">
          <label class="co-f">${t('co.number')}<input inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" ${on ? '' : raw('disabled')}></label>
          <div class="co-2"><label class="co-f">${t('co.exp')}<input autocomplete="cc-exp" placeholder="${lang() === 'en' ? 'MM / YY' : 'ММ / ГГ'}" ${on ? '' : raw('disabled')}></label><label class="co-f">CVC<input autocomplete="cc-csc" inputmode="numeric" placeholder="•••" ${on ? '' : raw('disabled')}></label></div>
          <label class="co-check"><input type="checkbox" checked ${on ? '' : raw('disabled')}><span>${t('co.save')}</span></label>
          <button type="button" class="btn-k co-pay" data-pay ${on ? '' : raw('disabled')}>${t('co.pay', { p: money(price.total) })}</button>
          <div class="co-note">${t('co.cardNote')}</div></div>${on ? '' : off}`,
      kaspi: html`<div class="co-kaspi"><div class="co-qr${on ? '' : ' empty'}" data-qr>${on ? '' : html`<span>${t('co.kQr')}</span>`}</div>
          <div class="co-steps"><b>${t('co.kTitle')}</b><span><b>1.</b> ${t('co.k1')}</span><span><b>2.</b> ${t('co.k2')}</span><span><b>3.</b> ${t('co.k3', { p: money(price.total) })}</span>
          ${on ? html`<span class="co-wait"><i></i><span data-wait>${t('co.kWait', { t: '10:00' })}</span></span>` : ''}</div></div>
          ${on ? html`<a class="li-gbtn" href="https://kaspi.kz" target="_blank" rel="noopener">${t('co.kOpen')}</a>` : off}`,
      google: html`<div class="co-wallet"><p>${t('co.gNote')}</p><button type="button" class="btn-k co-pay" data-pay ${on ? '' : raw('disabled')}>${t('co.gPay', { p: money(price.total) })}</button></div>${on ? '' : off}`,
      apple: html`<div class="co-wallet"><p>${t('co.aNote')}</p><button type="button" class="btn-k co-pay black" data-pay ${on ? '' : raw('disabled')}>${t('co.aPay', { p: money(price.total) })}</button></div>${on ? '' : off}`
    }[S.method];
    main.innerHTML = html`<div class="co">
      <header class="pv-head"><span class="logo">alaqai<span class="logo-dot"></span></span><span class="co-secure">${icon('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z', 16)}${t('co.secure')}</span>
        <a class="icon-btn lg soft" href="#/plan" aria-label="${t('co.close')}">${icon('close', 18)}</a></header>
      <div class="co-body">
        <div class="co-left">
          <h1 class="title title-md">${t('co.title')}</h1>
          <div class="co-plans">${['standard', 'max'].map(id => html`<label class="co-plan${S.plan === id ? ' on' : ''}"><input type="radio" name="plan" value="${id}" ${S.plan === id ? raw('checked') : ''}><i></i>
            <span class="grow"><b>${t('plan.' + id)}</b><span>${id === 'standard' ? t('co.std', { n: plans.standard.aiLessonsPerWeek }) : t('co.max')}</span></span><b>${money(S.period === '6' ? plans[id].price6 : plans[id].priceMonth)}</b></label>`)}</div>
          <div class="seg lg co-period"><button type="button" data-period="1" aria-selected="${S.period === '1'}">${t('co.m1')}</button><button type="button" data-period="6" aria-selected="${S.period === '6'}">${t('co.m6', { p: money(plans[S.plan].price6) })}</button></div>
          <form class="co-promo"><input name="code" placeholder="${t('co.promo')}" aria-label="${t('co.promo')}" value="${S.promoText}" autocomplete="off"><button class="btn-o">${t('co.apply')}</button></form>
          <div class="co-sum">
            <span><span>${t('co.line', { plan: name, period: t('co.p' + S.period) })}</span><span>${money(price.base)}</span></span>
            <span><span>${t('co.discount')}${S.promo ? ' · ' + S.promo.code : ''}</span><span>${price.discount ? '− ' : ''}${money(price.discount)}</span></span>
            <i></i><span class="tot"><span>${t('co.total')}</span><span>${money(price.total)}</span></span>
          </div>
          <div class="co-note left">${t('co.renew' + S.period)}</div>
        </div>
        <div class="co-right">
          <div class="card-title lg">${t('co.method')}</div>
          <div class="co-methods">${Object.keys(CHIPS).map(id => html`<button type="button" class="${S.method === id ? 'on' : ''}" data-method="${id}"><span class="chip-pay ${CHIPS[id][1]}">${CHIPS[id][0]}</span><span>${t('co.' + id)}</span></button>`)}</div>
          ${payBody}
        </div>
      </div></div>`;
    bind();
  };

  const bind = () => {
    main.querySelectorAll('[name="plan"]').forEach(r => r.onchange = () => { S.plan = r.value; S.promo = null; draw(); });
    main.querySelectorAll('[data-period]').forEach(b => b.onclick = () => { S.period = b.dataset.period; draw(); });
    main.querySelectorAll('[data-method]').forEach(b => b.onclick = () => { S.method = b.dataset.method; draw(); });
    main.querySelector('.co-promo').onsubmit = async e => {
      e.preventDefault();
      S.promoText = e.target.code.value.trim();
      const p = await checkPromo(S.promoText, S.plan);
      S.promo = p ? { ...p, code: S.promoText.toUpperCase() } : null;
      toast(p ? t('co.promoOk') : t('co.promoBad'));
      draw();
    };
    const pay = main.querySelector('[data-pay]');
    if (pay) pay.onclick = async () => {
      pay.disabled = true;
      try {
        const r = await startPayment({ plan: S.plan, period: S.period, method: S.method, promo: S.promo && S.promo.code });
        if (r && r.redirectUrl) location.href = r.redirectUrl;
      } catch (e) {
        if (e.code === 'login') { toast(t('co.login')); location.hash = '#/login?next=' + encodeURIComponent(location.hash); return; }
        toast(t('co.err', { m: e.message })); pay.disabled = false;
      }
    };
    clearInterval(timer);
    if (S.method === 'kaspi' && methods.kaspi) {
      startPayment({ plan: S.plan, period: S.period, method: 'kaspi', promo: S.promo && S.promo.code }).then(r => {
        const q = main.querySelector('[data-qr]');
        if (q && r && r.qrSvg) q.innerHTML = r.qrSvg;
      }).catch(() => {});
      kaspiLeft = 600;
      timer = setInterval(() => {
        const w = main.querySelector('[data-wait]');
        if (!w) return clearInterval(timer);
        kaspiLeft = Math.max(0, kaspiLeft - 1);
        w.textContent = t('co.kWait', { t: `${Math.floor(kaspiLeft / 60)}:${String(kaspiLeft % 60).padStart(2, '0')}` });
      }, 1000);
    }
  };

  draw();
  return () => clearInterval(timer);
}
