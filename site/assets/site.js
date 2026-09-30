/* 株式会社CORLY — behaviour (no dependencies, CSP: script-src 'self') */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: solid after scroll, hide on scroll down / show on scroll up */
  var header = document.querySelector('.header');
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) {
      header.classList.toggle('solid', y > 24);
      if (y > 360 && y > lastY + 6) header.classList.add('hide');
      else if (y < lastY - 6 || y < 360) header.classList.remove('hide');
    }
    if (heroImg && !reduce) heroImg.style.transform = 'translateY(' + Math.min(y, 1200) * -0.12 + 'px)';
    lastY = y; ticking = false;
  }
  var heroImg = document.querySelector('.hero .pic img');
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* mobile menu */
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      doc.style.overflow = o ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); doc.style.overflow = ''; } });
  }

  /* reveal on scroll */
  var hero = document.querySelector('.hero');
  var els = document.querySelectorAll('.rv, .rv-pic, .flow');
  function showAll() { els.forEach(function (el) { el.classList.add('in'); }); if (hero) hero.classList.add('in'); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('in'); }); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* contact form: fill timestamp, show result message */
  var form = document.querySelector('form[data-contact]');
  if (form) { var ts = form.querySelector('input[name="ts"]'); if (ts) ts.value = String(Math.floor(Date.now() / 1000)); }
  var params = new URLSearchParams(window.location.search), box = document.getElementById('form-status');
  if (box && (params.has('sent') || params.has('error'))) {
    var msg = {
      sent: 'お問い合わせを受け付けました。内容を確認のうえ、担当者よりご連絡いたします。',
      required: '未入力の必須項目があります。ご確認のうえ再度送信してください。',
      email: 'メールアドレスの形式をご確認ください。',
      consent: 'プライバシーポリシーへの同意が必要です。',
      ratelimit: '短時間に送信が集中しています。しばらく時間をおいて再度お試しください。',
      spam: '送信を受け付けられませんでした。お手数ですがお電話またはメールでご連絡ください。',
      mail: '送信処理でエラーが発生しました。お手数ですがお電話またはメールでご連絡ください。'
    };
    var key = params.has('sent') ? 'sent' : params.get('error');
    box.textContent = msg[key] || msg.mail; box.className = 'alert' + (key === 'sent' ? '' : ' err'); box.hidden = false;
  }
})();
