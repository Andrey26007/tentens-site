/* TENTENS Tech — site behaviour: shared nav/footer, EN/UA, binary scramble, smooth scroll,
   pinned product scroll, live product widgets, stacked product cards, 3D stack */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var LANG = store.get('tt-lang') === 'uk' ? 'uk' : 'en';
  var T = {
    approved: { en: 'Approved', uk: 'Схвалено' },
    blocked: { en: 'Blocked', uk: 'Заблоковано' },
    review: { en: 'Review', uk: 'Перевірка' },
    sending: { en: 'sending', uk: 'надсилається' },
    queued: { en: 'queued', uk: 'у черзі' },
    done: { en: 'done', uk: 'готово' },
    live: { en: 'live', uk: 'активна' },
    provider: { en: 'Provider', uk: 'Провайдер' },
    degraded: { en: 'degraded', uk: 'збій' },
    failover: { en: 'Failover', uk: 'Перемикання' },
    rolling: { en: 'Rolling out', uk: 'Розгортання' },
    released: { en: 'Released', uk: 'Випущено' },
    investigating: { en: 'Investigating', uk: 'Розслідування' },
    mitigating: { en: 'Mitigating', uk: 'Усунення' },
    resolved: { en: 'Resolved', uk: 'Вирішено' },
    anomaly: { en: 'Anomaly detected · AI SRE notified', uk: 'Аномалію виявлено · AI SRE сповіщено' },
    sent: { en: 'Thanks. This preview doesn’t send requests yet — on the live site this form goes straight to the team.', uk: 'Дякуємо. Це прев’ю ще не надсилає заявки — на робочому сайті форма надходитиме одразу команді.' },
    email: { en: 'Enter a work email so we can reply.', uk: 'Вкажіть робочий email, щоб ми могли відповісти.' }
  };
  function t(k) { return T[k][LANG]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function slice(l) { return Array.prototype.slice.call(l); }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, LANG === 'uk' ? ' ' : ','); }
  function L(en, uk) { return '<span data-uk="' + uk + '">' + en + '</span>'; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- brand media from tentens.tech ---------- */
  var ORIGIN = 'https://tentens.tech/';
  var MEDIA = {
    map: ORIGIN + 'map.8a3f7432.mp4',
    pillars: ORIGIN + 'slider_1.1fb7c1ed.mp4',
    highway: ORIGIN + 'slider_2.48f60993.mp4',
    speed: ORIGIN + 'slider_3.ebb00306.mp4',
    career: ORIGIN + 'Career.a854ac9a.mp4'
  };
  var LOGO_IMG = '<img class="logo__img" src="' + ORIGIN + 'logo2.26e019c9.svg" alt="" width="110" height="40">';

  /* ---------- shared templates ---------- */
  var NAV = [
    ['products.html', 'products', 'Products', 'Продукти'],
    ['services.html', 'services', 'Services', 'Послуги'],
    ['./#company', 'company', 'Company', 'Компанія'],
    ['careers.html', 'careers', 'Careers', 'Кар’єра']
  ];
  function navHTML(active) {
    var links = NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[1] === active ? ' aria-current="page"' : '') + ' data-uk="' + n[3] + '">' + n[2] + '</a>';
    }).join('');
    return '<div class="wrap nav__in">' +
      '<a class="logo" href="./" aria-label="TENTENS Tech — home" data-uk-aria="TENTENS Tech — головна">' + LOGO_IMG +
      '<span class="logo__text" aria-hidden="true"><span class="logo__bin">0101010001000101<br>0100111001010100</span>' +
      '<span class="logo__word"><span class="logo__tt">TENTENS</span><span class="logo__tech">TECH</span></span></span></a>' +
      '<nav class="nav__links" aria-label="Main" data-uk-aria="Головне меню">' + links + '</nav>' +
      '<div class="nav__side">' +
      '<div class="lang" role="group" aria-label="Language"><button type="button" data-lang-set="en" aria-pressed="true">EN</button><button type="button" data-lang-set="uk" aria-pressed="false">UA</button></div>' +
      '<a class="nav__sales" href="#contact" data-uk="Відділ продажів">Contact sales</a>' +
      '<a class="btn btn--light btn--sm" href="#contact" data-magnet><span data-uk="Замовити демо">Book a demo</span><span class="arr" aria-hidden="true">→</span></a>' +
      '</div></div>';
  }
  function opt(id, en, uk, on) {
    return '<button type="button" class="opt" data-opt="' + id + '" aria-pressed="' + (on ? 'true' : 'false') + '"><span data-uk="' + uk + '">' + en + '</span></button>';
  }
  function footerHTML() {
    return '' +
    '<section class="contact" id="contact"><div class="wrap pad"><div class="contact__grid">' +
      '<div style="display:flex;flex-direction:column;gap:32px">' +
        '<p class="eyebrow"><b>■</b><span data-uk="Контакт">Contact</span></p>' +
        '<h2 class="d d-l"><span class="metal" data-scramble data-uk="Створімо">Let’s build</span><br><span class="dim" data-scramble data-uk="наступний крок.">what’s next.</span></h2>' +
        '<p class="lead" data-uk="Розкажіть про продукт, навантаження і що саме треба змінити. Ми зв’яжемося, щоб домовитися про дзвінок із потрібною командою.">Tell us about your product, your load and what needs to change. We’ll follow up to set up a call with the right team.</p>' +
        '<dl class="facts">' +
          '<dt class="label">Email</dt><dd>info@tentens.tech</dd>' +
          '<dt class="label" data-uk="Компанія">Company</dt><dd data-uk="Українська tech-компанія · працюємо віддалено">Ukrainian tech company · working remotely</dd>' +
          '<dt class="label" data-uk="Київ">Kyiv time</dt><dd data-clock>--:--</dd>' +
          '<dt class="label" data-uk="Кар’єра">Careers</dt><dd><a class="mint" style="text-decoration:none" href="https://jobs.ashbyhq.com/TENTENS-Tech" target="_blank" rel="noopener" data-uk="Відкриті вакансії ↗">Open roles ↗</a></dd>' +
        '</dl>' +
      '</div>' +
      '<form class="form" id="contact-form" novalidate>' +
        '<fieldset><legend class="label" data-uk="Мене цікавить">I’m interested in</legend><div class="opts">' +
          opt('demo', 'A product demo', 'Демо продукту', true) +
          opt('team', 'An engineering team', 'Інженерна команда') +
          opt('sre', 'Platform & SRE', 'Platform та SRE') +
          opt('tns', 'Trust & Safety or CX', 'Trust & Safety або CX') +
          opt('other', 'Something else', 'Інше') +
        '</div></fieldset>' +
        '<div class="fields">' +
          '<div class="field"><label class="label" for="cf-name" data-uk="Ім’я">Name</label><input id="cf-name" name="name" type="text" autocomplete="name" placeholder="Full name" data-uk-ph="Ім’я та прізвище"></div>' +
          '<div class="field"><label class="label" for="cf-email" data-uk="Робочий email *">Work email *</label><input id="cf-email" name="email" type="email" autocomplete="email" placeholder="name@company.com" required></div>' +
          '<div class="field"><label class="label" for="cf-company" data-uk="Компанія">Company</label><input id="cf-company" name="company" type="text" autocomplete="organization" placeholder="Company name" data-uk-ph="Назва компанії"></div>' +
          '<div class="field"><label class="label" for="cf-scale" data-uk="Активних користувачів на місяць">Monthly active users</label><select id="cf-scale" name="scale"><option data-uk="До 100 тис.">Under 100K</option><option data-uk="100 тис. – 1 млн">100K – 1M</option><option data-uk="1 – 10 млн">1M – 10M</option><option data-uk="10 млн+">10M+</option></select></div>' +
        '</div>' +
        '<div class="field"><label class="label" for="cf-task" data-uk="Що ви будуєте?">What are you building?</label><textarea id="cf-task" name="task" rows="3" placeholder="A few words about the product and the challenge" data-uk-ph="Кілька слів про продукт і задачу"></textarea></div>' +
        '<div class="form__end">' +
          '<label class="consent" for="cf-consent"><input id="cf-consent" type="checkbox"><span data-uk="Погоджуюся на обробку моїх даних відповідно до Політики конфіденційності.">I agree to the processing of my data under the Privacy Policy.</span></label>' +
          '<button type="submit" class="btn btn--primary" data-magnet><span data-uk="Надіслати запит">Send request</span><span class="arr" aria-hidden="true">→</span></button>' +
        '</div>' +
        '<p class="form__msg" role="status" aria-live="polite"></p>' +
      '</form>' +
    '</div></div></section>' +
    '<footer class="footer"><div class="wrap">' +
      '<div class="footer__cols">' +
        '<div style="display:flex;flex-direction:column;gap:14px"><span class="logo logo--foot" role="img" aria-label="TENTENS Tech">' + LOGO_IMG + '<span class="logo__text" aria-hidden="true"><span class="logo__word"><span class="logo__tt" style="font-size:28px">TENTENS</span><span class="logo__tech">TECH</span></span></span></span>' +
        '<span class="txt" style="max-width:240px;font-size:14px" data-uk="High-load продукти та інженерні команди, перевірені на платформах для мільйонів людей.">High-load products and engineering teams, proven on platforms used by millions.</span></div>' +
        '<nav aria-label="Products" data-uk-aria="Продукти"><span class="label" data-uk="Продукти">Products</span>' +
          '<a href="products.html#afs">Anti-Fraud System</a><a href="products.html#po">Payment Orchestrator</a><a href="products.html#esp">Email Provider</a><a href="products.html#vts">Version Tracking System</a><a href="products.html#sre">AI SRE</a><a href="products.html#dp">Data Platform</a><a href="products.html#obs">Observability Platform</a></nav>' +
        '<nav aria-label="Services" data-uk-aria="Послуги"><span class="label" data-uk="Послуги">Services</span>' +
          '<a href="services.html" data-uk="Розробка ПЗ на замовлення">Custom Software Development</a><a href="services.html" data-uk="Platform та SRE-інжиніринг">Platform &amp; SRE Engineering</a><a href="services.html" data-uk="Дизайн">Design</a><a href="services.html" data-uk="Продакт-менеджмент">Product Management</a>' +
          '<a href="services.html#tns" data-uk="Trust &amp; Safety рішення">Trust &amp; Safety Solutions</a><a href="services.html#tns" data-uk="Модерація контенту">Content Moderation</a><a href="services.html#tns" data-uk="AI Safety та оптимізація моделей">AI Safety &amp; Model Optimization</a><a href="services.html#tns" data-uk="Клієнтський досвід">Customer Experience</a></nav>' +
        '<nav aria-label="Company" data-uk-aria="Компанія"><span class="label" data-uk="Компанія">Company</span>' +
          '<a href="./#company" data-uk="Про нас">About</a><a href="careers.html" data-uk="Кар’єра">Careers</a><a href="#contact" data-uk="Контакти">Contact</a>' +
          '<a href="https://www.linkedin.com/company/tentens-tech/about/" target="_blank" rel="noopener">LinkedIn</a><a href="https://www.instagram.com/tentens.tech/" target="_blank" rel="noopener">Instagram</a><a href="https://www.facebook.com/profile.php?id=100093463065114" target="_blank" rel="noopener">Facebook</a></nav>' +
      '</div>' +
      '<div class="footer__bar"><span data-uk="© 2023–2026 TENTENS Tech. Усі права захищено.">© 2023–2026 TENTENS Tech. All rights reserved.</span>' +
        '<span data-uk="Інтерфейси продуктів на сайті ілюстративні; ключові показники — з продакшну TENTENS.">Product interfaces shown are illustrative; headline figures come from TENTENS production data.</span>' +
        '<span style="display:flex;gap:24px"><a href="#" data-uk="Політика конфіденційності">Privacy Policy</a><a href="#" data-uk="Налаштування cookie">Cookie settings</a></span></div>' +
      '<p class="footer__mark" aria-hidden="true" data-parallax>TENTENS</p>' +
    '</div></footer>';
  }
  document.querySelectorAll('[data-include="nav"]').forEach(function (el) { el.innerHTML = navHTML(el.getAttribute('data-active')); });
  document.querySelectorAll('[data-include="footer"]').forEach(function (el) { el.outerHTML = footerHTML(); });
  document.querySelectorAll('.logo__img').forEach(function (img) {
    var fail = function () { img.closest('.logo').classList.add('is-fallback'); };
    if (img.complete && !img.naturalWidth) fail(); else img.addEventListener('error', fail);
  });

  /* videos load near the viewport, play only while visible; the binary field shows if a video can’t load */
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var src = MEDIA[box.getAttribute('data-video')];
    if (!src) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    box.insertBefore(v, box.firstChild);
    var ready = function () { box.classList.add('is-ready'); };
    v.addEventListener('playing', ready);
    v.addEventListener('loadeddata', ready);
    v.addEventListener('error', function () { box.classList.add('is-failed'); });
    var loaded = false;
    var play = function () { if (reduce) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var load = function () { if (!loaded) { loaded = true; v.src = src; } };
    if (io) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { load(); play(); } else if (loaded) v.pause();
    }, { rootMargin: '300px 0px' }).observe(box);
    else { load(); play(); }
  });

  /* ---------- icons ---------- */
  var ICONS = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    cpu: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17v-5a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3"/>',
    shuffle: '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    send: '<path d="M21 3 3 10l7 3 3 7z"/><path d="m10 13 4-4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    eye: '<path d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7s-7-2-10-7z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-11 7"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>'
  };
  document.querySelectorAll('[data-ico]').forEach(function (i) {
    var p = ICONS[i.getAttribute('data-ico')];
    if (p) { i.setAttribute('aria-hidden', 'true'); i.innerHTML = '<svg viewBox="0 0 24 24">' + p + '</svg>'; }
  });

  /* ---------- live product widgets ---------- */
  var W = {};
  var NS = 'http://www.w3.org/2000/svg';
  function q(el, k) { return el.querySelector('[data-k="' + k + '"]'); }

  /* Anti-Fraud System: risk gauge, signals, live decision feed, counters */
  W.afs = {
    html: function (id) {
      var ticks = '';
      for (var k = 0; k <= 10; k++) {
        var a = Math.PI - k * Math.PI / 10;
        ticks += '<line x1="' + (100 + Math.cos(a) * 66).toFixed(1) + '" y1="' + (100 - Math.sin(a) * 66).toFixed(1) + '" x2="' + (100 + Math.cos(a) * 74).toFixed(1) + '" y2="' + (100 - Math.sin(a) * 74).toFixed(1) + '" stroke="#2A2E2C" stroke-width="1"/>';
      }
      var sig = [['New device', 'Новий пристрій'], ['Geo mismatch', 'Невідповідність гео'], ['Velocity', 'Швидкість операцій']].map(function (s, i) {
        return '<div class="w-sig__row">' + L(s[0], s[1]) + '<span class="w-sig__bar"><span data-k="s' + i + '" style="width:10%"></span></span><b data-k="v' + i + '">+0.02</b></div>';
      }).join('');
      var rows = [['48 222', '$880.00', '0.61', 'review', 'warn'], ['48 221', '$19.99', '0.02', 'approved', 'ok'], ['48 220', '$2,400.00', '0.94', 'blocked', 'bad'], ['48 219', '$49.90', '0.08', 'approved', 'ok']].map(function (r) {
        return '<div class="row4' + (r[3] === 'blocked' ? ' blocked' : '') + '"><span>TX-' + r[0] + '</span><span>' + r[1] + '</span><span class="' + r[4] + '">' + r[2] + '</span><span class="' + r[4] + '" data-st="' + r[3] + '">' + T[r[3]].en + '</span></div>';
      }).join('');
      return '<div class="ui w">' +
        '<div class="ui__bar"><span>anti-fraud / decisions</span><span class="mint">● ' + L('real-time', 'реальний час') + '</span></div>' +
        '<div class="w-afs__top">' +
          '<div class="gauge"><svg viewBox="0 0 200 108" aria-hidden="true"><defs><linearGradient id="' + id + 'g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#00F3BC"/><stop offset=".55" stop-color="#F2C94C"/><stop offset="1" stop-color="#FF6B5E"/></linearGradient></defs>' +
            '<path d="M12 100 A88 88 0 0 1 188 100" fill="none" stroke="#1A1D1C" stroke-width="10"/>' +
            '<path d="M12 100 A88 88 0 0 1 188 100" fill="none" stroke="url(#' + id + 'g)" stroke-width="2"/>' + ticks +
            '<line class="gauge__needle" x1="100" y1="100" x2="100" y2="32" stroke="#F2F4F1" stroke-width="2" stroke-linecap="round"/><circle cx="100" cy="100" r="5" fill="#F2F4F1"/></svg>' +
            '<div class="gauge__read"><b data-k="risk" class="ok">0.04</b><span data-k="verdict" class="ok" data-st="approved">Approved</span></div>' +
          '</div>' +
          '<div class="w-sig"><p class="label">' + L('Signals', 'Сигнали') + '</p>' + sig + '</div>' +
        '</div>' +
        '<div data-k="feed"><div class="row4 row4--h">' + L('Transaction', 'Транзакція') + L('Amount', 'Сума') + L('Risk', 'Ризик') + L('Decision', 'Рішення') + '</div>' + rows + '</div>' +
        '<div class="w-stats">' +
          '<div><span class="label">' + L('Scored today', 'Оцінено сьогодні') + '</span><b data-k="c0">0</b></div>' +
          '<div><span class="label">' + L('Blocked', 'Заблоковано') + '</span><b data-k="c1" class="bad">0</b></div>' +
          '<div><span class="label">' + L('In review', 'На перевірці') + '</span><b data-k="c2" class="warn">0</b></div>' +
        '</div></div>';
    },
    init: function (el) {
      var needle = el.querySelector('.gauge__needle'), riskEl = q(el, 'risk'), verdict = q(el, 'verdict'), feed = q(el, 'feed');
      var bars = [0, 1, 2].map(function (i) { return [q(el, 's' + i), q(el, 'v' + i)]; });
      var cnt = [q(el, 'c0'), q(el, 'c1'), q(el, 'c2')], vals = [184320, 2146, 418], shown = [-1, -1, -1];
      var acc = 1500, n = 48223;
      needle.style.transform = 'rotate(-82.8deg)';
      function render() { for (var i = 0; i < 3; i++) { var r = Math.floor(vals[i]); if (r !== shown[i]) { shown[i] = r; cnt[i].textContent = fmt(r); } } }
      function push() {
        var x = Math.random(), st, cls, risk;
        if (x < 0.16) { st = 'blocked'; cls = 'bad'; risk = rand(0.82, 0.99); }
        else if (x < 0.3) { st = 'review'; cls = 'warn'; risk = rand(0.48, 0.74); }
        else { st = 'approved'; cls = 'ok'; risk = rand(0.01, 0.14); }
        needle.style.transform = 'rotate(' + (-90 + risk * 180).toFixed(1) + 'deg)';
        riskEl.textContent = risk.toFixed(2); riskEl.className = cls;
        verdict.textContent = t(st); verdict.className = cls; verdict.setAttribute('data-st', st);
        var parts = [risk * rand(0.25, 0.45), risk * rand(0.18, 0.36), risk * rand(0.05, 0.2)];
        bars.forEach(function (b, i) {
          var v = parts[i];
          b[0].style.width = clamp(v / 0.4 * 100, 6, 100).toFixed(0) + '%';
          b[0].style.background = v > 0.2 ? '#FF6B5E' : v > 0.1 ? '#F2C94C' : '#00F3BC';
          b[1].textContent = '+' + v.toFixed(2); b[1].className = v > 0.2 ? 'bad' : v > 0.1 ? 'warn' : 'ok';
        });
        var amt = st === 'blocked' ? rand(600, 3800) : rand(9, 420);
        var row = document.createElement('div');
        row.className = 'row4 is-new' + (st === 'blocked' ? ' blocked' : '');
        row.innerHTML = '<span>TX-' + String(n++).replace(/(\d{2})(\d{3})$/, '$1 $2') + '</span><span>$' + amt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</span><span class="' + cls + '">' + risk.toFixed(2) + '</span><span class="' + cls + '" data-st="' + st + '">' + t(st) + '</span>';
        var head = feed.querySelector('.row4--h');
        feed.insertBefore(row, head.nextSibling);
        var all = feed.querySelectorAll('.row4:not(.row4--h)');
        if (all.length > 4) all[all.length - 1].remove();
        if (st === 'blocked') vals[1] += 1;
        if (st === 'review') vals[2] += 1;
      }
      render();
      return {
        frame: function (now, dt) { vals[0] += dt * 0.047; acc += dt; if (acc > 2300) { acc = 0; push(); } render(); },
        lang: function () { shown = [-1, -1, -1]; render(); el.querySelectorAll('[data-st]').forEach(function (s) { s.textContent = t(s.getAttribute('data-st')); }); }
      };
    }
  };

  /* Payment Orchestrator: packets routed to providers, latency jitter, failover */
  W.po = {
    html: function () {
      var ys = [16, 68, 120, 172], prov = '';
      ys.forEach(function (y, i) {
        var c = 'ABCD'[i];
        prov += '<path class="wire" data-k="leg' + i + '" d="M290 107 C 336 107 334 ' + (y + 18) + ' 380 ' + (y + 18) + '"/>' +
          '<rect class="n prov" data-k="box' + i + '" x="380" y="' + y + '" width="134" height="36"/>' +
          '<text class="nt" x="392" y="' + (y + 22) + '" data-uk="Провайдер ' + c + '">Provider ' + c + '</text>' +
          '<text class="lat" data-k="lat' + i + '" x="506" y="' + (y + 22) + '">— ms</text>';
      });
      return '<div class="ui w w-po">' +
        '<div class="ui__bar"><span>orchestrator / routing</span><span>PCI DSS</span></div>' +
        '<div class="w-po__svg"><svg viewBox="0 0 520 226" aria-hidden="true">' +
          '<path class="wire" data-k="trunk" d="M110 107 L200 107"/>' + prov +
          '<rect class="n" x="6" y="89" width="104" height="36"/><text class="nt" x="58" y="111" text-anchor="middle">checkout</text>' +
          '<rect class="n n--hub" x="200" y="85" width="90" height="44"/><text class="nt nt--hub" x="245" y="111" text-anchor="middle">ROUTER</text>' +
          '<g data-k="pk"></g></svg></div>' +
        '<div class="w-po__foot"><span class="label">' + L('Rule', 'Правило') + '</span><span>' + L('lowest latency · healthy providers only', 'найменша затримка · лише справні провайдери') + '</span><span class="w-ev" data-k="ev"></span></div>' +
        '</div>';
    },
    init: function (el) {
      var trunk = q(el, 'trunk'), pk = q(el, 'pk'), ev = q(el, 'ev');
      var legs = [0, 1, 2, 3].map(function (i) { return q(el, 'leg' + i); });
      var boxes = [0, 1, 2, 3].map(function (i) { return q(el, 'box' + i); });
      var lats = [0, 1, 2, 3].map(function (i) { return q(el, 'lat' + i); });
      var tLen = trunk.getTotalLength ? trunk.getTotalLength() : 90;
      var lLen = legs.map(function (l) { return l.getTotalLength ? l.getTotalLength() : 110; });
      var base = [212, 138, 176, 236], lat = base.slice(), bad = -1, badT = 0, nextBad = 4200, spawn = 0, jit = 999, packets = [], evT = 0;
      function best(excl) { var b = -1; for (var i = 0; i < 4; i++) if (i !== excl && (b < 0 || lat[i] < lat[b])) b = i; return b; }
      function pick() {
        var w = lat.map(function (l, i) { return i === bad ? 0 : 1 / Math.pow(l, 4); }), s = w.reduce(function (a, b) { return a + b; }, 0), r = Math.random() * s;
        for (var i = 0; i < 4; i++) { r -= w[i]; if (r <= 0) return i; }
        return best(bad);
      }
      function paint() {
        for (var i = 0; i < 4; i++) {
          var b = i === bad;
          boxes[i].classList.toggle('is-bad', b); legs[i].classList.toggle('is-bad', b); lats[i].classList.toggle('is-bad', b);
          lats[i].textContent = b ? t('degraded') : Math.round(lat[i]) + ' ms';
        }
      }
      function setBad(i) {
        bad = i; paint();
        if (i >= 0) { ev.textContent = t('failover') + ' · ' + 'ABCD'[i] + ' → ' + 'ABCD'[best(i)]; ev.classList.add('is-on'); evT = 3400; }
      }
      paint();
      return {
        frame: function (now, dt) {
          spawn += dt;
          if (spawn > 240 && packets.length < 26) {
            spawn = 0;
            var c = document.createElementNS(NS, 'circle');
            c.setAttribute('r', '3'); c.setAttribute('class', 'pk'); c.setAttribute('cx', '110'); c.setAttribute('cy', '107');
            pk.appendChild(c); packets.push({ el: c, seg: 0, t: 0, p: -1 });
          }
          for (var k = packets.length - 1; k >= 0; k--) {
            var p = packets[k];
            if (p.seg === 0) {
              p.t += dt * 0.2 / tLen;
              if (p.t >= 1) { p.seg = 1; p.t = 0; p.p = pick(); }
              else { var a = trunk.getPointAtLength(p.t * tLen); p.el.setAttribute('cx', a.x.toFixed(1)); p.el.setAttribute('cy', a.y.toFixed(1)); }
            }
            if (p.seg === 1) {
              p.t += dt * 0.2 / lLen[p.p];
              if (p.t >= 1) {
                var bx = boxes[p.p]; bx.classList.add('hit'); setTimeout(function () { bx.classList.remove('hit'); }, 160);
                p.el.remove(); packets.splice(k, 1); continue;
              }
              var b2 = legs[p.p].getPointAtLength(p.t * lLen[p.p]); p.el.setAttribute('cx', b2.x.toFixed(1)); p.el.setAttribute('cy', b2.y.toFixed(1));
            }
          }
          jit += dt;
          if (jit > 700) { jit = 0; for (var i = 0; i < 4; i++) lat[i] = base[i] + rand(-12, 12); paint(); }
          badT += dt;
          if (bad < 0 && badT > nextBad) { badT = 0; setBad((Math.random() * 4) | 0); }
          else if (bad >= 0 && badT > 4200) { badT = 0; nextBad = rand(4500, 7500); setBad(-1); }
          if (evT > 0) { evT -= dt; if (evT <= 0) ev.classList.remove('is-on'); }
        },
        lang: paint
      };
    }
  };

  /* Email Provider: send counter, rate sparkline, campaigns */
  W.esp = {
    html: function (id) {
      var C = [['welcome', 'Welcome series', 'Welcome-серія', 'lifecycle'], ['reset', 'Password reset', 'Скидання пароля', 'transact.'], ['digest', 'Weekly digest', 'Щотижневий дайджест', 'retention'], ['receipt', 'Payment receipt', 'Квитанція платежу', 'transact.'], ['winback', 'Win-back · day 30', 'Win-back · 30-й день', 'retention']];
      return '<div class="ui w w-esp">' +
        '<div class="ui__bar"><span>email / delivery</span><span>' + L('today', 'сьогодні') + '</span></div>' +
        '<div class="w-esp__top"><div><span class="label">' + L('Sent today', 'Надіслано сьогодні') + '</span><p class="w-big" data-k="sent">0</p></div>' +
          '<div><span class="label">' + L('Send rate', 'Швидкість надсилання') + '</span><svg class="spark" viewBox="0 0 240 64" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + id + 'a" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#00F3BC" stop-opacity=".25"/><stop offset="1" stop-color="#00F3BC" stop-opacity="0"/></linearGradient></defs><path data-k="area" fill="url(#' + id + 'a)"/><polyline data-k="line" fill="none" stroke="#00F3BC" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg></div></div>' +
        C.map(function (c, i) {
          return '<div class="prog-row"><span data-uk="' + c[2] + '">' + c[1] + '</span><span>' + c[3] + '</span><span class="track"><span data-k="b' + i + '"></span></span><span data-k="st' + i + '">' + T.sending.en + '</span></div>';
        }).join('') + '</div>';
    },
    init: function (el) {
      var sent = q(el, 'sent'), line = q(el, 'line'), area = q(el, 'area'), v = 1284560, shown = -1;
      var rows = [{ m: 'c', p: 0.62, r: 0.00011 }, { m: 'l' }, { m: 'c', p: 0.3, r: 0.00007 }, { m: 'l' }, { m: 'c', p: 0, r: 0.00015, st: 'queued', h: 900 }];
      rows.forEach(function (r, i) { r.b = q(el, 'b' + i); r.s = q(el, 'st' + i); if (r.m === 'l') { r.st = 'live'; r.b.style.width = '100%'; r.b.classList.add('pulse'); } else if (!r.st) r.st = 'sending'; r.shown = ''; });
      var pts = []; for (var i = 0; i < 48; i++) pts.push(0.5 + 0.2 * Math.sin(i / 4) + rand(-0.08, 0.08));
      var sAcc = 0, ph = 0;
      function drawSpark() {
        var d = pts.map(function (y, i) { return (i * 240 / 47).toFixed(1) + ',' + (64 - y * 58).toFixed(1); });
        line.setAttribute('points', d.join(' '));
        area.setAttribute('d', 'M0,64 L' + d.join(' L') + ' L240,64 Z');
      }
      function paint(force) {
        rows.forEach(function (r) {
          if (r.m === 'c') r.b.style.width = (r.p * 100).toFixed(1) + '%';
          if (force || r.shown !== r.st) { r.shown = r.st; r.s.textContent = t(r.st); r.s.className = r.st === 'queued' ? 'dim' : r.st === 'done' ? '' : 'mint'; }
        });
      }
      drawSpark(); paint(true);
      return {
        frame: function (now, dt) {
          v += dt * 0.21; var rv = Math.floor(v); if (rv !== shown) { shown = rv; sent.textContent = fmt(rv); }
          rows.forEach(function (r) {
            if (r.m !== 'c') return;
            if (r.st === 'sending') { r.p += r.r * dt; if (r.p >= 1) { r.p = 1; r.st = 'done'; r.h = 1800; } }
            else if (r.st === 'done') { r.h -= dt; if (r.h <= 0) { r.st = 'queued'; r.p = 0; r.h = 1100; } }
            else if (r.st === 'queued') { r.h -= dt; if (r.h <= 0) r.st = 'sending'; }
          });
          paint(false);
          sAcc += dt; if (sAcc > 380) { sAcc = 0; ph += 0.35; pts.shift(); pts.push(clamp(0.52 + 0.22 * Math.sin(ph) + rand(-0.1, 0.1), 0.08, 0.98)); drawSpark(); }
        },
        lang: function () { shown = -1; paint(true); }
      };
    }
  };

  /* Version Tracking System: environment matrix with live promotion and rollout */
  W.vts = {
    html: function () {
      var S = ['api-gateway', 'payments', 'anti-fraud', 'media-delivery', 'email'];
      return '<div class="ui w w-vts">' +
        '<div class="ui__bar"><span>releases / environments</span><span class="mint">● ' + L('live', 'наживо') + '</span></div>' +
        '<div class="row-v row-v--h"><span>' + L('Service', 'Сервіс') + '</span><span>Dev</span><span>Staging</span><span>Production</span></div>' +
        S.map(function (s, i) { return '<div class="row-v"><span>' + s + '</span><span><i class="chip-v" data-k="d' + i + '"></i></span><span><i class="chip-v" data-k="s' + i + '"></i></span><span><i class="chip-v is-prod" data-k="p' + i + '"></i></span></div>'; }).join('') +
        '<div class="w-roll"><div class="w-roll__head"><span data-k="rt"></span><b data-k="pct">0%</b></div>' +
          '<div class="w-roll__bar"><span data-k="rb"></span></div>' +
          '<div class="w-roll__steps"><span data-k="k0">Build</span><span data-k="k1">Staging</span><span data-k="k2">Canary</span><span data-k="k3">Production</span></div></div>' +
        '</div>';
    },
    init: function (el) {
      var S = ['api-gateway', 'payments', 'anti-fraud', 'media-delivery', 'email'];
      var V = [[[4, 13, 0], [4, 13, 0], [4, 12, 0]], [[2, 8, 3], [2, 8, 3], [2, 8, 3]], [[9, 1, 0], [9, 1, 0], [9, 0, 4]], [[7, 1, 1], [7, 1, 1], [7, 1, 0]], [[3, 4, 2], [3, 4, 2], [3, 4, 2]]];
      var cell = function (c, i) { return q(el, c + i); };
      var vs = function (v) { return 'v' + v.join('.'); };
      var rt = q(el, 'rt'), pct = q(el, 'pct'), rb = q(el, 'rb'), steps = [0, 1, 2, 3].map(function (i) { return q(el, 'k' + i); });
      var cur = 3, phase = 0, tm = 0, nv = null, done = false;
      function flash(e) { e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }
      function paintAll() { S.forEach(function (s, i) { cell('d', i).textContent = vs(V[i][0]); cell('s', i).textContent = vs(V[i][1]); cell('p', i).textContent = vs(V[i][2]); }); }
      function head() {
        rt.textContent = done ? '✓ ' + t('released') + ' · ' + S[cur] + ' ' + vs(nv) : t('rolling') + ' · ' + S[cur] + ' ' + vs(nv) + ' → production';
        steps.forEach(function (s, i) { s.className = i < phase || (done && i === 3) ? 'on' : i === phase ? 'now' : ''; });
      }
      function start() {
        cur = (cur + 1) % S.length; nv = V[cur][0].slice(); nv[2] += 1; done = false; phase = 0; tm = 0;
        V[cur][0] = nv.slice(); cell('d', cur).textContent = vs(nv); flash(cell('d', cur));
        rb.style.width = '0%'; pct.textContent = '0%'; head();
      }
      paintAll(); nv = V[cur][2].slice(); V[cur][1] = V[cur][0].slice(); start();
      return {
        frame: function (now, dt) {
          tm += dt;
          if (phase === 0 && tm > 1100) { phase = 1; tm = 0; V[cur][1] = nv.slice(); cell('s', cur).textContent = vs(nv); flash(cell('s', cur)); head(); }
          else if (phase === 1 && tm > 1100) { phase = 2; tm = 0; head(); }
          else if (phase === 2) {
            var p = clamp(tm / 3200, 0, 1);
            rb.style.width = (p * 100).toFixed(1) + '%'; pct.textContent = Math.round(p * 100) + '%';
            var pc = cell('p', cur); pc.textContent = vs(nv) + ' · ' + Math.round(p * 100) + '%'; pc.classList.add('is-roll');
            if (p >= 1) { phase = 3; tm = 0; done = true; V[cur][2] = nv.slice(); pc.classList.remove('is-roll'); pc.textContent = vs(nv); flash(pc); head(); }
          } else if (phase === 3 && tm > 1700) { start(); }
        },
        lang: head
      };
    }
  };

  /* AI SRE: incident timeline typed live */
  var SRE = [
    ['03:12:04', 'alert', 'bad', 'p99 latency above SLO · media delivery', 'p99 вище SLO · доставка медіа'],
    ['03:12:05', 'alert', 'bad', '5xx rate rising · media-cdn', 'зростання 5xx · media-cdn'],
    ['03:12:09', 'group', '', '214 related alerts → 1 incident', '214 пов’язаних алертів → 1 інцидент'],
    ['03:12:15', 'cause', 'warn', 'cache eviction after deploy v7.1.0', 'витіснення кешу після деплою v7.1.0'],
    ['03:12:16', 'suggest', 'ok', 'roll back v7.1.0 · runbook RB-112', 'відкат v7.1.0 · ранбук RB-112'],
    ['03:12:41', 'rollback', '', 'v7.1.0 → v7.0.9 complete', 'v7.1.0 → v7.0.9 завершено'],
    ['03:13:02', 'resolved', 'ok', 'p99 back under SLO', 'p99 знову в межах SLO']
  ];
  var TAGS = { alert: ['ALERT', 'АЛЕРТ'], group: ['GROUP', 'ГРУПА'], cause: ['CAUSE', 'ПРИЧИНА'], suggest: ['SUGGEST', 'ПОРАДА'], rollback: ['ROLLBACK', 'ВІДКАТ'], resolved: ['RESOLVED', 'ВИРІШЕНО'] };
  W.sre = {
    html: function () {
      return '<div class="ui w w-sre">' +
        '<div class="ui__bar"><span>on-call / INC-2207</span><span class="w-chip" data-k="status"></span></div>' +
        '<div class="w-stats">' +
          '<div><span class="label">' + L('Alerts grouped', 'Алертів згруповано') + '</span><b data-k="al">0</b></div>' +
          '<div><span class="label">' + L('Incidents', 'Інцидентів') + '</span><b data-k="inc">0</b></div>' +
          '<div><span class="label">' + L('Elapsed', 'Минуло') + '</span><b data-k="el">00:00</b></div>' +
        '</div>' +
        '<div class="w-term" data-k="term"></div></div>';
    },
    init: function (el) {
      var term = q(el, 'term'), status = q(el, 'status'), al = q(el, 'al'), inc = q(el, 'inc'), elT = q(el, 'el');
      var line = 0, ch = 0, wait = 600, cur = null, alerts = 0, target = 0, sim = 0, shownA = -1;
      function msg(i) { return LANG === 'uk' ? SRE[i][4] : SRE[i][3]; }
      function st() {
        var s = line >= 6 && !cur ? 'resolved' : line >= 5 ? 'mitigating' : 'investigating';
        if (line === 6 && cur) s = 'mitigating';
        status.textContent = t(s); status.className = 'w-chip ' + (s === 'resolved' ? 'ok' : 'warn');
      }
      function reset() { term.innerHTML = ''; line = 0; ch = 0; wait = 700; cur = null; alerts = 0; target = 0; sim = 0; inc.textContent = '0'; st(); }
      function newLine() {
        var d = SRE[line], row = document.createElement('div');
        row.innerHTML = '<span class="t">' + d[0] + '</span><span class="' + d[2] + '">' + TAGS[d[1]][LANG === 'uk' ? 1 : 0] + '</span><span class="m"></span>';
        term.appendChild(row); cur = { el: row.querySelector('.m'), text: msg(line) }; ch = 0;
        target = line === 0 ? 38 : line === 1 ? 96 : 214;
        if (line === 2) inc.textContent = '1';
      }
      reset();
      return {
        frame: function (now, dt) {
          sim += dt * 3; var s = Math.floor(sim / 1000); elT.textContent = ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2);
          if (alerts < target) { alerts = Math.min(target, alerts + dt * 0.12); var a = Math.floor(alerts); if (a !== shownA) { shownA = a; al.textContent = fmt(a); } }
          if (cur) {
            ch += dt / 17;
            var n = Math.min(cur.text.length, Math.floor(ch));
            cur.el.innerHTML = cur.text.slice(0, n).replace(/</g, '&lt;') + '<i class="caret"></i>';
            if (n >= cur.text.length) { cur.el.textContent = cur.text; cur = null; line++; wait = line >= SRE.length ? 4200 : 520; st(); }
          } else {
            wait -= dt;
            if (wait <= 0) { if (line >= SRE.length) reset(); else { newLine(); st(); } }
          }
        },
        lang: function () { shownA = -1; st(); }
      };
    }
  };

  /* Data Platform: flowing pipeline, throughput, events chart */
  W.dp = {
    html: function () {
      function lane(col, row, d) { return '<span class="lane" style="grid-column:' + col + ';grid-row:' + row + '"><i style="animation-delay:' + d + 's"></i><i style="animation-delay:' + (d - 0.9).toFixed(2) + 's"></i></span>'; }
      var bars = ''; for (var i = 0; i < 28; i++) bars += '<span style="height:' + (35 + Math.round(30 * Math.sin(i / 3) + 20)) + '%"></span>';
      return '<div class="ui w w-dp">' +
        '<div class="ui__bar"><span>data / pipeline</span><span class="mint">● ' + L('streaming', 'стрімінг') + '</span></div>' +
        '<div class="w-dp__scroll"><div class="w-dp__grid">' +
          '<span class="dp-chip" style="grid-column:1;grid-row:1" data-uk="події застосунку">app events</span>' +
          '<span class="dp-chip" style="grid-column:1;grid-row:2" data-uk="платежі">payments</span>' +
          '<span class="dp-chip" style="grid-column:1;grid-row:3">email</span>' +
          lane(2, 1, 0) + lane(2, 2, -0.4) + lane(2, 3, -0.7) +
          '<div class="dp-node" style="grid-column:3"><span class="label">stream</span><b data-k="eps">0</b><span class="label">ev/s</span></div>' +
          lane(4, 2, -0.2) +
          '<div class="dp-node" style="grid-column:5"><span class="label" data-uk="сховище">warehouse</span><b data-k="rows">0</b><span class="label" data-uk="рядків">rows</span></div>' +
          lane(6, 1, -0.5) + lane(6, 2, -0.1) + lane(6, 3, -0.8) +
          '<span class="dp-chip dp-chip--out" style="grid-column:7;grid-row:1" data-uk="дашборди">dashboards</span>' +
          '<span class="dp-chip dp-chip--out" style="grid-column:7;grid-row:2" data-uk="ML-фічі">ML features</span>' +
          '<span class="dp-chip dp-chip--out" style="grid-column:7;grid-row:3" data-uk="звіти">reports</span>' +
        '</div></div>' +
        '<div class="w-dp__foot"><span class="label">' + L('Events / min', 'Подій / хв') + '</span><div class="w-dp__chart" data-k="chart">' + bars + '</div></div>' +
        '</div>';
    },
    init: function (el) {
      var eps = q(el, 'eps'), rowsEl = q(el, 'rows'), chart = q(el, 'chart'), rows = 4180000, rate = 48200, jit = 999, cAcc = 0, ph = 0, shown = -1;
      return {
        frame: function (now, dt) {
          jit += dt; if (jit > 320) { jit = 0; rate = 48200 + rand(-1400, 1400); eps.textContent = fmt(rate); }
          rows += rate * dt / 1000; var r = Math.floor(rows / 1000); if (r !== shown) { shown = r; rowsEl.textContent = fmt(rows); }
          cAcc += dt;
          if (cAcc > 620) {
            cAcc = 0; ph += 0.45;
            var b = document.createElement('span'); b.style.height = clamp(55 + 28 * Math.sin(ph) + rand(-12, 12), 12, 100).toFixed(0) + '%';
            chart.appendChild(b); chart.firstElementChild.remove();
          }
        },
        lang: function () { shown = -1; eps.textContent = fmt(rate); }
      };
    }
  };

  /* Observability: live latency chart with SLO line and anomaly detection */
  W.obs = {
    html: function () {
      return '<div class="ui w w-obs">' +
        '<div class="ui__bar"><span>observability / api-gateway</span><span>' + L('p99 latency', 'затримка p99') + '</span></div>' +
        '<div class="w-stats w-stats--4">' +
          '<div><span class="label">p50</span><b data-k="p50">—</b></div>' +
          '<div><span class="label">p99</span><b data-k="p99">—</b></div>' +
          '<div><span class="label">' + L('Errors', 'Помилки') + '</span><b data-k="err">—</b></div>' +
          '<div><span class="label">SLO</span><b>200 ms</b></div>' +
        '</div>' +
        '<div class="w-obs__chart"><canvas data-k="cv"></canvas><span class="w-anom" data-k="anom"></span></div>' +
        '</div>';
    },
    init: function (el) {
      var cv = q(el, 'cv'), ctx = cv.getContext('2d'), anomEl = q(el, 'anom');
      var p50 = q(el, 'p50'), p99 = q(el, 'p99'), err = q(el, 'err');
      var N = 72, data = [], w = 0, h = 0, dpr = 1, acc = 0, step = 120, anom = 0, nextAnom = 5200, sinceAnom = 0, ph = 0, sAcc = 999;
      for (var i = 0; i < N; i++) data.push(122 + 16 * Math.sin(i / 6) + rand(-8, 8));
      function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      size(); addEventListener('resize', size);
      var MAX = 340;
      function y(v) { return h - 6 - (v / MAX) * (h - 18); }
      function draw(frac) {
        if (!w) { size(); if (!w) return; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(42,46,44,.6)'; ctx.lineWidth = 1; ctx.setLineDash([]);
        [100, 300].forEach(function (g) { ctx.beginPath(); ctx.moveTo(0, y(g) + 0.5); ctx.lineTo(w, y(g) + 0.5); ctx.stroke(); });
        var sx = w / (N - 2), x0 = -frac * sx;
        ctx.beginPath(); ctx.moveTo(x0, h);
        for (var i = 0; i < N; i++) ctx.lineTo(x0 + i * sx, y(data[i]));
        ctx.lineTo(x0 + (N - 1) * sx, h); ctx.closePath();
        var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,243,188,.16)'); g.addColorStop(1, 'rgba(0,243,188,0)');
        ctx.fillStyle = g; ctx.fill();
        ctx.lineWidth = 1.6;
        for (i = 1; i < N; i++) {
          ctx.strokeStyle = (data[i] > 200 || data[i - 1] > 200) ? '#FF6B5E' : '#00F3BC';
          ctx.beginPath(); ctx.moveTo(x0 + (i - 1) * sx, y(data[i - 1])); ctx.lineTo(x0 + i * sx, y(data[i])); ctx.stroke();
        }
        ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(242,201,76,.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y(200) + 0.5); ctx.lineTo(w, y(200) + 0.5); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(242,201,76,.9)'; ctx.font = '10px "Geist Mono", ui-monospace, monospace'; ctx.textAlign = 'left';
        ctx.fillText('SLO 200 ms', 6, y(200) - 6);
        var lx = x0 + (N - 1) * sx, ly = y(data[N - 1]), hot = data[N - 1] > 200 ? '#FF6B5E' : '#00F3BC';
        ctx.fillStyle = hot; ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(lx, ly, 9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
      function stats() {
        var v = data[N - 1];
        p99.textContent = Math.round(v) + ' ms'; p99.className = v > 200 ? 'bad' : '';
        p50.textContent = Math.round(v * 0.41) + ' ms';
        err.textContent = (anom > 0 ? rand(1.4, 2.2) : rand(0.01, 0.04)).toFixed(2) + '%'; err.className = anom > 0 ? 'bad' : '';
      }
      draw(0); stats();
      return {
        frame: function (now, dt) {
          acc += dt; sinceAnom += dt;
          while (acc >= step) {
            acc -= step; ph += 0.16;
            var v = 122 + 16 * Math.sin(ph) + rand(-9, 9);
            if (anom <= 0 && sinceAnom > nextAnom) { anom = 16; sinceAnom = 0; nextAnom = rand(6500, 9000); anomEl.textContent = '● ' + t('anomaly'); anomEl.classList.add('is-on'); }
            if (anom > 0) { var k = 16 - anom; v += k < 4 ? k * 45 : k < 11 ? 175 + rand(-25, 25) : (16 - k) * 32; anom--; if (anom === 0) setTimeout(function () { anomEl.classList.remove('is-on'); }, 1600); }
            data.shift(); data.push(v);
          }
          draw(acc / step);
          sAcc += dt; if (sAcc > 500) { sAcc = 0; stats(); }
        },
        lang: function () { if (anomEl.classList.contains('is-on')) anomEl.textContent = '● ' + t('anomaly'); }
      };
    }
  };

  /* widget engine — one rAF loop, only visible widgets run */
  var live = [], looping = false, lastT = 0, uid = 0;
  var vobs = io ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { var w = e.target._live; if (w) w.vis = e.isIntersecting; });
    kick();
  }, { threshold: 0.02 }) : null;
  function addLive(el, api) {
    var w = { el: el, api: api, vis: !vobs };
    el._live = w; live.push(w);
    if (vobs) vobs.observe(el);
    return w;
  }
  function kick() { if (!looping && !reduce) { looping = true; lastT = 0; requestAnimationFrame(loop); } }
  function loop(now) {
    var dt = lastT ? Math.min(now - lastT, 60) : 16; lastT = now;
    var any = false;
    for (var i = 0; i < live.length; i++) { var w = live[i]; if (w.vis && w.api && w.api.frame) { any = true; w.api.frame(now, dt); } }
    if (any) requestAnimationFrame(loop); else looping = false;
  }
  var pending = [];
  document.querySelectorAll('[data-widget]').forEach(function (el) {
    var def = W[el.getAttribute('data-widget')];
    if (!def) return;
    el.innerHTML = def.html('w' + (uid++));
    pending.push([el, def]);
  });
  function startWidgets() {
    pending.forEach(function (p) { var api = p[1].init(p[0]); addLive(p[0], api); if (api.lang) api.lang(); });
    pending = [];
    kick();
  }

  /* ---------- language ---------- */
  function capture() {
    document.querySelectorAll('[data-uk],[data-scramble]').forEach(function (el) { if (el.dataset.en == null) el.dataset.en = el.textContent; });
    document.querySelectorAll('[data-uk-ph]').forEach(function (el) { if (el.dataset.enPh == null) el.dataset.enPh = el.getAttribute('placeholder') || ''; });
    document.querySelectorAll('[data-uk-aria]').forEach(function (el) { if (el.dataset.enAria == null) el.dataset.enAria = el.getAttribute('aria-label') || ''; });
  }
  function textFor(el) { return (LANG === 'uk' && el.dataset.uk != null) ? el.dataset.uk : el.dataset.en; }
  function applyLang(lang, animate) {
    LANG = lang;
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'en';
    document.querySelectorAll('[data-uk]').forEach(function (el) { if (el._scr) { cancelAnimationFrame(el._scr); el._scr = null; el.style.minHeight = ''; } if (el.dataset.en != null) el.textContent = textFor(el); });
    document.querySelectorAll('[data-uk-ph]').forEach(function (el) { el.setAttribute('placeholder', lang === 'uk' ? el.dataset.ukPh : el.dataset.enPh); });
    document.querySelectorAll('[data-uk-aria]').forEach(function (el) { el.setAttribute('aria-label', lang === 'uk' ? el.dataset.ukAria : el.dataset.enAria); });
    document.querySelectorAll('[data-lang-set]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.langSet === lang ? 'true' : 'false'); });
    live.forEach(function (w) { if (w.api && w.api.lang) w.api.lang(); });
    store.set('tt-lang', lang);
    if (animate) {
      document.querySelectorAll('[data-scramble]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        el._done = null;
        if (r.bottom > 0 && r.top < innerHeight && el.offsetParent !== null) { scramble(el, 0); el._done = LANG; }
      });
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang-set]');
    if (b && b.dataset.langSet !== LANG) applyLang(b.dataset.langSet, true);
  });

  /* ---------- binary scramble ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function bits(str, from) {
    var o = '';
    for (var i = from; i < str.length; i++) { var c = str[i]; o += /\s/.test(c) ? c : (Math.random() < 0.5 ? '0' : '1'); }
    return o;
  }
  function scramble(el, delay) {
    var text = textFor(el);
    if (text == null) return;
    if (reduce) { el.textContent = text; return; }
    if (el._scr) cancelAnimationFrame(el._scr);
    var n = text.length;
    var dur = Math.min(1500, 480 + n * 26);
    var t0 = performance.now() + (delay || 0);
    var last = 0, tail = bits(text, 0);
    el.style.minHeight = el.offsetHeight + 'px';
    el.innerHTML = '<span class="scr">' + tail + '</span>';
    function frame(now) {
      var p = (now - t0) / dur;
      if (p >= 1) { el.textContent = text; el.style.minHeight = ''; el._scr = null; return; }
      if (p < 0) { if (now - last > 60) { last = now; el.innerHTML = '<span class="scr">' + bits(text, 0) + '</span>'; } el._scr = requestAnimationFrame(frame); return; }
      var e = 1 - Math.pow(1 - p, 2);
      var k = Math.floor(e * n);
      if (now - last > 45) { last = now; tail = bits(text, k); }
      else { tail = tail.slice(tail.length - (n - k)); }
      el.innerHTML = esc(text.slice(0, k)) + '<span class="scr">' + tail + '</span>';
      el._scr = requestAnimationFrame(frame);
    }
    el._scr = requestAnimationFrame(frame);
  }

  /* ---------- observers ---------- */
  function observeScramble() {
    if (!io) return;
    var batch = 0, batchT = 0;
    var ob = new IntersectionObserver(function (entries) {
      var now = performance.now();
      if (now - batchT > 120) batch = 0;
      batchT = now;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el._done === LANG) return;
        el._done = LANG;
        scramble(el, (batch++) * 90);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('[data-scramble]').forEach(function (el) { ob.observe(el); });
  }
  function observeReveal() {
    if (!io || reduce) return;
    var ob = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, parent = el.parentElement;
        if (parent && parent.hasAttribute('data-stagger')) el.style.animationDelay = (Array.prototype.indexOf.call(parent.children, el) * 90) + 'ms';
        el.classList.add('is-in');
        ob.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv,.ln').forEach(function (el) { ob.observe(el); });
  }

  /* ---------- smooth scroll + page transitions ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    try {
      lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
      var rafL = function (time) { lenis.raf(time); requestAnimationFrame(rafL); };
      requestAnimationFrame(rafL);
    } catch (e) { lenis = null; }
  }
  var nav = document.querySelector('.nav');
  function scrollToY(y, dur) {
    if (lenis) lenis.scrollTo(y, { duration: dur || 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  function goTo(target) {
    var sticky = getComputedStyle(target).position === 'sticky';
    if (sticky) target.style.position = 'static';
    var y = target.getBoundingClientRect().top + scrollY;
    if (sticky) target.style.position = '';
    var navH = nav ? nav.offsetHeight : 72;
    scrollToY(Math.max(0, y - (sticky ? navH + 24 : navH + 12)));
  }
  var wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.setAttribute('aria-hidden', 'true');
  wipe.textContent = '01010100 01000101 01001110 01010100 01000101 01001110 01010011';
  document.body.appendChild(wipe);
  window.addEventListener('pageshow', function () { wipe.classList.remove('is-on'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute('href');
    var norm = function (p) { p = p.split('#')[0].replace(/^\.\//, ''); return (p === '' || p === '/' || p === 'index.html') ? 'index' : p; };
    var samePage = href.charAt(0) === '#' || norm(href) === norm(location.pathname.split('/').pop() || '');
    if (samePage) {
      var id = href.split('#')[1];
      if (!id) return;
      var target = document.getElementById(id);
      var tabFor = document.querySelector('[role="tab"][data-hash="' + id + '"]');
      if (tabFor) { selectTab(tabFor.closest('[data-tabs]'), tabFor, true); target = tabFor.closest('[data-tabs]'); }
      if (!target) return;
      e.preventDefault();
      goTo(target);
      return;
    }
    if (/^https?:|^mailto:|^tel:/.test(href) || reduce) return;
    e.preventDefault();
    wipe.classList.add('is-on');
    setTimeout(function () { location.href = href; }, 430);
    setTimeout(function () { wipe.classList.remove('is-on'); }, 2500);
  });

  /* ---------- tabs (services, mobile product suite) ---------- */
  function selectTab(group, tab, fromUser) {
    if (group.classList.contains('is-pinned')) { if (fromUser) scrollToProduct(sTabs.indexOf(tab)); return; }
    group.querySelectorAll('[role="tab"]').forEach(function (x) {
      var on = x === tab;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      var p = document.getElementById(x.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) {
      panel.classList.remove('is-enter'); void panel.offsetWidth; panel.classList.add('is-enter');
      panel.querySelectorAll('[data-scramble]').forEach(function (el, i) { el._done = LANG; scramble(el, i * 80); });
    }
    if (fromUser && group._auto) group._auto.pause(9000);
  }
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var tabs = slice(group.querySelectorAll('[role="tab"]'));
    group.addEventListener('click', function (e) { var tb = e.target.closest('[role="tab"]'); if (tb && group.contains(tb)) selectTab(group, tb, true); });
    group.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement); if (i < 0) return;
      var k = e.key, j = -1;
      if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % tabs.length;
      if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (j > -1) { e.preventDefault(); tabs[j].focus(); selectTab(group, tabs[j], true); }
    });
    if (group.hasAttribute('data-autoplay') && !reduce) {
      var ms = 7000, timer = null, anim = null, paused = false, visible = false, hold = 0;
      var cur = function () { return Math.max(0, tabs.findIndex(function (x) { return x.getAttribute('aria-selected') === 'true'; })); };
      var run = function () {
        clearTimeout(timer); if (anim) anim.cancel();
        if (paused || !visible || group.classList.contains('is-pinned')) return;
        var bar = tabs[cur()].querySelector('.prog');
        if (bar && bar.animate) anim = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: ms, easing: 'linear' });
        timer = setTimeout(function () { selectTab(group, tabs[(cur() + 1) % tabs.length], false); run(); }, ms);
      };
      group._auto = { pause: function (after) { paused = true; clearTimeout(timer); if (anim) anim.cancel(); clearTimeout(hold); hold = setTimeout(function () { paused = false; run(); }, after || 9000); }, run: run };
      group.addEventListener('pointerenter', function () { paused = true; clearTimeout(timer); if (anim) anim.pause(); });
      group.addEventListener('pointerleave', function () { paused = false; run(); });
      if (io) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(); }, { threshold: 0.3 }).observe(group);
    }
  });

  /* ---------- home: pinned product scroll ---------- */
  var suite = document.querySelector('[data-suite]'), track = document.querySelector('[data-suite-track]');
  var pin = track ? track.querySelector('.suite-pin') : null;
  var pinned = false, sTabs = [], sPanels = [], segPx = 600, pinTop = 92, sActive = -1;
  var sCount = suite ? suite.querySelector('[data-suite-count]') : null, sBar = suite ? suite.querySelector('.suite__bar span') : null;
  var suiteEngaged = false, stepLock = 0, lastWheel = 0, streamStart = 0, lastStop = 0, snapT = 0, prevRaw = null;
  function fitPanels(stageH) {
    sPanels.forEach(function (p) {
      var g = p.querySelector('.panel__grid'), bar = p.querySelector('.panel__bar');
      if (!g) return;
      g.style.transform = ''; g.style.width = ''; g.style.transformOrigin = '0 0';
      var avail = stageH - (bar ? bar.offsetHeight : 0), s = 1;
      for (var k = 0; k < 4; k++) {
        g.style.width = (100 / s).toFixed(3) + '%';
        var need = g.offsetHeight;
        if (need * s <= avail + 1) break;
        s = Math.max(0.62, avail / need);
      }
      if (s < 0.999) g.style.transform = 'scale(' + s.toFixed(4) + ')';
      else g.style.width = '';
    });
  }
  function setupSuite() {
    if (!suite || !track || !pin) return;
    sTabs = slice(suite.querySelectorAll('[role="tab"]'));
    sPanels = sTabs.map(function (x) { return document.getElementById(x.getAttribute('aria-controls')); });
    var want = !reduce && window.matchMedia('(min-width: 1000px) and (min-height: 620px)').matches;
    if (want) {
      suite.classList.add('is-pinned'); track.classList.add('is-pinned');
      pinTop = parseFloat(getComputedStyle(pin).top) || 16;
      var stageH = Math.min(innerHeight - pinTop * 2 - 2, 900);
      suite.style.setProperty('--stage-h', stageH + 'px');
      sPanels.forEach(function (p) { p.hidden = false; p.classList.remove('is-enter'); });
      fitPanels(stageH);
      segPx = Math.round(innerHeight * 0.9);
      track.style.height = (pin.offsetHeight + segPx * sPanels.length) + 'px';
      sActive = -1; prevRaw = null;
    } else {
      sPanels.forEach(function (p) { var g = p.querySelector('.panel__grid'); if (g) { g.style.transform = ''; g.style.width = ''; } });
      suite.classList.remove('is-pinned'); track.classList.remove('is-pinned'); track.style.height = '';
      var sel = Math.max(0, sTabs.findIndex(function (x) { return x.getAttribute('aria-selected') === 'true'; }));
      sPanels.forEach(function (p, i) { p.hidden = i !== sel; p.style.transform = ''; p.style.removeProperty('--dim'); });
      sTabs.forEach(function (x) { x.style.removeProperty('--tp'); });
      if (suite._auto) suite._auto.run();
    }
    pinned = want;
  }
  function easeIO(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function rawU() { return (pinTop - track.getBoundingClientRect().top) / segPx; }
  function stepTo(i, ms) {
    i = clamp(i, 0, sPanels.length - 1);
    ms = ms || 900;
    lastStop = i;
    stepLock = performance.now() + ms;
    var y = scrollY + track.getBoundingClientRect().top - pinTop + i * segPx + 1;
    if (lenis) lenis.scrollTo(y, { duration: ms / 1000, easing: easeIO, lock: true, force: true });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function scrollToProduct(i) {
    if (i < 0) return;
    stepTo(i, 700 + 140 * Math.min(4, Math.abs(i - Math.round(clamp(rawU(), 0, sPanels.length - 1)))));
  }
  /* one gesture = one product while the block is pinned */
  window.addEventListener('wheel', function (e) {
    var now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    if (gap > 120) streamStart = now;
    if (!pinned || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !e.deltaY) return;
    var N = sPanels.length, u = rawU(), dir = e.deltaY > 0 ? 1 : -1;
    if (u < -0.02 || u > N - 1 + 0.02) return;
    var mag = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 33 : 1);
    var tail = now < stepLock || (mag < 60 && streamStart < stepLock);
    var atEnd = (dir > 0 && u >= N - 1 - 0.02) || (dir < 0 && u <= 0.02);
    if (atEnd && !tail) return;
    e.preventDefault(); e.stopPropagation();
    if (tail || mag < 4) return;
    var base = Math.round(u);
    stepTo(dir > 0 ? (u > base + 0.05 ? Math.ceil(u) : base + 1) : (u < base - 0.05 ? Math.floor(u) : base - 1));
  }, { passive: false, capture: true });
  document.addEventListener('keydown', function (e) {
    if (!pinned || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var tg = e.target, tag = (tg.tagName || '').toLowerCase();
    if (/^(input|textarea|select)$/.test(tag) || tg.isContentEditable || (tg.closest && tg.closest('[role="tablist"]'))) return;
    var k = e.key;
    if (k === ' ' && /^(button|a|summary)$/.test(tag)) return;
    var dir = (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) ? 1 : (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) ? -1 : 0;
    if (!dir) return;
    var N = sPanels.length, u = rawU();
    if (u < -0.02 || u > N - 1 + 0.02) return;
    if ((dir > 0 && u >= N - 1 - 0.02) || (dir < 0 && u <= 0.02)) return;
    e.preventDefault();
    if (performance.now() < stepLock) return;
    stepTo(Math.round(u) + dir);
  });
  function snapSoon() {
    clearTimeout(snapT);
    snapT = setTimeout(function () {
      if (!pinned || performance.now() < stepLock) return;
      var N = sPanels.length, u = rawU();
      if (u <= 0.02 || u >= N - 1 - 0.02) return;
      var target = Math.abs(u - lastStop) > 1.2 ? Math.round(u) : u > lastStop + 0.15 ? lastStop + 1 : u < lastStop - 0.15 ? lastStop - 1 : lastStop;
      if (Math.abs(u - target) > 0.01) stepTo(target, 560);
    }, 180);
  }
  function updateSuite() {
    var r = track.getBoundingClientRect(), N = sPanels.length;
    var raw = (pinTop - r.top) / segPx;
    if (prevRaw !== null && performance.now() > stepLock) {
      if (prevRaw < 0 && raw >= 0 && raw < 0.9) stepTo(0, 650);
      else if (prevRaw > N - 1 && raw <= N - 1 && raw > N - 1.9) stepTo(N - 1, 650);
    }
    prevRaw = raw;
    suiteEngaged = raw > -0.05 && raw < N;
    if (suiteEngaged) snapSoon();
    var u = clamp(raw, 0, N);
    var e = sPanels.map(function (p, i) { if (i === 0) return 1; var x = clamp((u - (i - 0.4)) / 0.4, 0, 1); return x * x * (3 - 2 * x); });
    var act = 0;
    sPanels.forEach(function (p, i) {
      var c = i + 1 < N ? e[i + 1] : 0;
      p.style.transform = 'translate3d(0,' + ((1 - e[i]) * 100).toFixed(2) + '%,0) translateY(' + (-c * 22).toFixed(1) + 'px) scale(' + (1 - 0.06 * c).toFixed(4) + ')';
      p.style.setProperty('--dim', (c * 0.72).toFixed(3));
      if (e[i] >= 0.5) act = i;
    });
    sTabs.forEach(function (tb, i) { tb.style.setProperty('--tp', i === act ? clamp(u - i + 0.2, 0, 1).toFixed(3) : '0'); });
    if (sBar) sBar.style.transform = 'scaleX(' + (u / N).toFixed(4) + ')';
    if (act !== sActive) {
      sActive = act;
      sTabs.forEach(function (tb, i) { tb.setAttribute('aria-selected', i === act ? 'true' : 'false'); tb.tabIndex = i === act ? 0 : -1; });
      if (sCount) { sCount.dataset.en = '0' + (act + 1); sCount.dataset.uk = '0' + (act + 1); scramble(sCount, 0); }
    }
  }

  /* ---------- products page: stacked cards ---------- */
  var cards = slice(document.querySelectorAll('.pcard'));
  var railCount = document.querySelector('[data-rail-count]');
  var railLinks = slice(document.querySelectorAll('.rail__list a'));
  var railProg = document.querySelector('.rail__progress');
  var activeCard = -1;
  function layoutCards() {
    if (!cards.length) return;
    var wide = innerWidth >= 1000, navH = nav ? nav.offsetHeight : 72;
    cards.forEach(function (c) { c.style.top = wide ? Math.min(navH + 24, innerHeight - c.offsetHeight - 24) + 'px' : ''; });
  }
  function updateCards() {
    var vh = innerHeight, act = 0, sum = 0;
    cards.forEach(function (c, i) {
      if (c.getBoundingClientRect().top < vh * 0.5) act = i;
      var next = cards[i + 1];
      if (!next) { c.style.transform = ''; c.style.setProperty('--dim', 0); return; }
      var myTop = parseFloat(c.style.top) || 0, from = myTop + c.offsetHeight, to = parseFloat(next.style.top) || 0;
      var p = clamp((from - next.getBoundingClientRect().top) / Math.max(1, from - to), 0, 1);
      sum += p;
      c.style.transform = p > 0 ? 'scale(' + (1 - 0.05 * p).toFixed(4) + ')' : '';
      c.style.setProperty('--dim', (p * 0.65).toFixed(3));
    });
    if (railProg) railProg.style.setProperty('--p', (sum / Math.max(1, cards.length - 1)).toFixed(3));
    if (act !== activeCard) {
      activeCard = act;
      railLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === act); });
      if (railCount) { railCount.dataset.en = '0' + (act + 1); railCount.dataset.uk = '0' + (act + 1); scramble(railCount, 0); }
    }
  }

  /* ---------- products page: 3D stack ---------- */
  var st3 = document.querySelector('[data-stack3d]');
  if (st3) {
    var planes = slice(st3.querySelectorAll('.plane:not(.plane--top)')), pi = -1, pAcc = 1600, tx3 = 0, ty3 = 0, cx3 = 0, cy3 = 0;
    if (finePointer && !reduce) (st3.closest('section') || st3).addEventListener('pointermove', function (e) {
      var b = st3.getBoundingClientRect();
      tx3 = clamp((e.clientX - b.left) / b.width - 0.5, -1, 1); ty3 = clamp((e.clientY - b.top) / b.height - 0.5, -1, 1);
    });
    addLive(st3, {
      frame: function (now, dt) {
        cx3 += (tx3 - cx3) * 0.06; cy3 += (ty3 - cy3) * 0.06;
        st3.style.setProperty('--rz', (-40 + cx3 * 16).toFixed(2) + 'deg');
        st3.style.setProperty('--rx', (58 - cy3 * 10).toFixed(2) + 'deg');
        pAcc += dt;
        if (pAcc > 1600) { pAcc = 0; pi = (pi + 1) % planes.length; planes.forEach(function (p, i) { p.classList.toggle('is-on', i === pi); }); }
      }
    });
  }

  /* ---------- products page: where does it hurt ---------- */
  function setupFit() {
    document.querySelectorAll('[data-fit]').forEach(function (box) {
      var opts = slice(box.querySelectorAll('.fit__opt')), out = box.querySelector('.fit__out');
      var nameEl = out.querySelector('[data-fit-name]'), lineEl = out.querySelector('[data-fit-line]'), codeEl = out.querySelector('[data-fit-code]'), link = out.querySelector('[data-fit-link]');
      function choose(b, anim) {
        opts.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        var id = b.getAttribute('data-target'), card = document.getElementById(id);
        if (!card) return;
        var h = card.querySelector('h2'), line = card.querySelector('.big');
        nameEl.dataset.en = h.dataset.en || h.textContent;
        lineEl.dataset.en = line.dataset.en || line.textContent;
        if (line.dataset.uk != null) lineEl.setAttribute('data-uk', line.dataset.uk); else lineEl.removeAttribute('data-uk');
        lineEl.textContent = textFor(lineEl);
        codeEl.textContent = card.getAttribute('data-code') || '';
        link.setAttribute('href', '#' + id);
        if (anim) scramble(nameEl, 0); else nameEl.textContent = textFor(nameEl);
        out.classList.remove('is-enter'); void out.offsetWidth; out.classList.add('is-enter');
      }
      opts.forEach(function (o) { o.addEventListener('click', function () { choose(o, true); }); });
      choose(opts[0], false);
    });
  }

  /* ---------- scroll-driven ---------- */
  var lastY = scrollY, ticking = false;
  var stepsBlocks = document.querySelectorAll('[data-steps]');
  var strikes = document.querySelectorAll('[data-strike]');
  var parallax = document.querySelectorAll('[data-parallax]');
  function onScroll() {
    ticking = false;
    var y = scrollY, vh = innerHeight;
    if (pinned) updateSuite(); else suiteEngaged = false;
    if (nav) {
      if (suiteEngaged || (y > 420 && y > lastY + 4)) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 420) nav.classList.remove('is-hidden');
    }
    lastY = y;
    stepsBlocks.forEach(function (b) {
      var r = b.getBoundingClientRect(), p = clamp((vh * 0.85 - r.top) / (vh * 0.7), 0, 1);
      b.querySelectorAll('.step__bar').forEach(function (bar, i, all) { bar.style.setProperty('--p', clamp(p * all.length - i, 0, 1).toFixed(3)); });
    });
    strikes.forEach(function (s) { var r = s.getBoundingClientRect(); s.style.setProperty('--p', clamp((vh * 0.92 - r.top) / (vh * 0.55), 0, 1).toFixed(3)); });
    parallax.forEach(function (p) { var r = p.parentElement.getBoundingClientRect(); p.style.transform = 'translateY(' + clamp((r.bottom - vh) * 0.18, -120, 160).toFixed(1) + 'px)'; });
    if (cards.length && innerWidth >= 1000) updateCards();
    if (st3) st3.style.setProperty('--gap', (52 + clamp(y / 520, 0, 1) * 38).toFixed(1) + 'px');
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  addEventListener('scroll', schedule, { passive: true });
  var rzT = 0;
  addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () { setupSuite(); layoutCards(); schedule(); }, 150);
  });

  /* ---------- pointer effects ---------- */
  if (finePointer && !reduce) {
    document.addEventListener('pointermove', function (e) {
      var s = e.target.closest && e.target.closest('.spot');
      if (s) { var b = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - b.left) + 'px'); s.style.setProperty('--my', (e.clientY - b.top) + 'px'); }
      var m = e.target.closest && e.target.closest('[data-magnet]');
      document.querySelectorAll('[data-magnet].is-mag').forEach(function (x) { if (x !== m) { x.classList.remove('is-mag'); x.style.transform = ''; } });
      if (!m) return;
      var r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      m.classList.add('is-mag');
      m.style.transform = 'translate(' + (dx * 0.16).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
    }, { passive: true });
  }

  /* ---------- binary field + globe ---------- */
  function globe(canvas) {
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    var pts = [], N = 1150, ga = Math.PI * (3 - Math.sqrt(5)), seed = 11;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < N; i++) {
      var yy = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - yy * yy), th = ga * i;
      pts.push({ x: Math.cos(th) * r, y: yy, z: Math.sin(th) * r, v: rnd() < 0.5 ? '0' : '1', live: rnd() < 0.05, ph: rnd() * 6.28 });
    }
    var w = 0, h = 0, dpr = 1, rot = 0.6, tx = 0, ty = 0, mx = 0, my = 0, flipT = 0;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    size(); addEventListener('resize', size);
    if (finePointer) (canvas.closest('.hero') || canvas.parentElement).addEventListener('pointermove', function (e) {
      var b = canvas.getBoundingClientRect();
      mx = clamp((e.clientX - (b.left + b.width / 2)) / b.width, -1, 1); my = clamp((e.clientY - (b.top + b.height / 2)) / b.height, -1, 1);
    });
    function draw(now, dt) {
      if (!w) size();
      rot += (dt || 16) * 0.00011;
      tx += (my * 0.35 - tx) * 0.05; ty += (mx * 0.5 - ty) * 0.05;
      if (now - flipT > 140) { flipT = now; for (var f = 0; f < 18; f++) { var q2 = pts[(Math.random() * N) | 0]; q2.v = q2.v === '0' ? '1' : '0'; } }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '10px "Geist Mono", ui-monospace, monospace';
      var cx = w / 2, cy = h / 2, R = w * 0.46, base = w / 620;
      var cr = Math.cos(rot + ty), sr = Math.sin(rot + ty), tilt = 0.38 + tx, ct = Math.cos(tilt), st = Math.sin(tilt);
      for (var i = 0; i < N; i++) {
        var p = pts[i], x1 = p.x * cr - p.z * sr, z1 = p.x * sr + p.z * cr, y2 = p.y * ct - z1 * st, z2 = p.y * st + z1 * ct;
        if (z2 < -0.35) continue;
        var s = (0.7 + (z2 + 0.35) * 0.62) * base, a;
        if (p.live && z2 > 0) { a = 0.55 + 0.45 * Math.sin(now * 0.003 + p.ph); ctx.fillStyle = 'rgba(0,243,188,' + a.toFixed(3) + ')'; }
        else { a = z2 < 0 ? 0.05 : 0.07 + z2 * 0.78; ctx.fillStyle = 'rgba(221,229,225,' + a.toFixed(3) + ')'; }
        ctx.setTransform(dpr * s, 0, 0, dpr * s, (cx + x1 * R) * dpr, (cy + y2 * R) * dpr);
        ctx.fillText(p.v, 0, 0);
      }
    }
    draw(performance.now(), 0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(performance.now(), 0); });
    addLive(canvas, { frame: draw });
  }
  function field(canvas) {
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    var w, h, dpr, cols, rows, cells = [], step = 22;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; cols = Math.ceil(w / step); rows = Math.ceil(h / step); cells = [];
      for (var i = 0; i < cols * rows; i++) cells.push(Math.random() < 0.5 ? '0' : '1');
    }
    size(); addEventListener('resize', size);
    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      ctx.font = '11px "Geist Mono", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var k = 0; k < 12; k++) { var j = (Math.random() * cells.length) | 0; cells[j] = cells[j] === '0' ? '1' : '0'; }
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var wave = Math.sin(c * 0.35 + r * 0.22 - now * 0.0012) * 0.5 + 0.5, a = (0.03 + wave * wave * 0.32) * (r / rows);
        ctx.fillStyle = wave > 0.93 ? 'rgba(0,243,188,' + (a + 0.25).toFixed(3) + ')' : 'rgba(221,229,225,' + a.toFixed(3) + ')';
        ctx.fillText(cells[r * cols + c], c * step + step / 2, r * step + step / 2);
      }
    }
    draw(performance.now());
    addLive(canvas, { frame: draw });
  }
  document.querySelectorAll('canvas[data-globe]').forEach(globe);
  document.querySelectorAll('canvas[data-field]').forEach(field);

  /* ---------- form ---------- */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('.opt');
    if (o) o.setAttribute('aria-pressed', o.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('#contact-form'); if (!f) return;
    e.preventDefault();
    var em = f.querySelector('#cf-email'), msg = f.querySelector('.form__msg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { msg.textContent = t('email'); em.focus(); return; }
    msg.textContent = t('sent');
  });

  /* ---------- clock ---------- */
  function clock() {
    var s = '';
    try { s = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' }).format(new Date()); }
    catch (e) { try { s = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kiev' }).format(new Date()); } catch (e2) {} }
    document.querySelectorAll('[data-clock]').forEach(function (el) { el.textContent = s; });
  }
  clock(); setInterval(clock, 30000);

  /* ---------- boot ---------- */
  capture();
  applyLang(LANG, false);
  startWidgets();
  setupFit();
  setupSuite();
  layoutCards();
  var initialTab = location.hash && document.querySelector('[role="tab"][data-hash="' + location.hash.slice(1) + '"]');
  if (initialTab) {
    var tg = initialTab.closest('[data-tabs]');
    selectTab(tg, initialTab, false);
    setTimeout(function () { goTo(tg); }, 120);
  }
  observeScramble();
  observeReveal();
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setupSuite(); layoutCards(); onScroll(); });
})();
