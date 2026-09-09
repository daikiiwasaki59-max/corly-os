/* 株式会社CORLY — minimal behaviour */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  }

  var els = document.querySelectorAll('.fade');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (els.length && !reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

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
