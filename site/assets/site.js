/* 株式会社CORLY — site behaviour (no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* ---- split hero headline into characters ---- */
  var h1 = document.querySelector('[data-split]');
  if (h1) {
    h1.querySelectorAll('.ln').forEach(function (ln, li) {
      var walker = [];
      ln.childNodes.forEach(function (n) { walker.push(n); });
      walker.forEach(function (n) {
        var target = n.nodeType === 3 ? ln : n;           // text directly in .ln, or inside <em>
        var text = n.textContent;
        var frag = document.createDocumentFragment();
        Array.from(text).forEach(function (ch, i) {
          var s = document.createElement('span');
          s.className = 'ch'; s.textContent = ch;
          s.style.transitionDelay = (li * 0.18 + i * 0.05) + 's';
          frag.appendChild(s);
        });
        if (n.nodeType === 3) { ln.replaceChild(frag, n); } else { n.textContent = ''; n.appendChild(frag); }
      });
    });
  }
  var hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('loaded'); }); });

  /* ---- live water caustics (WebGL) behind the hero ---- */
  var cv = document.getElementById('water');
  if (cv && !reduce) {
    try {
      var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (gl) {
        var vsrc = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        var fsrc = 'precision mediump float;uniform vec2 r;uniform float t;' +
          'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}' +
          'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}' +
          'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.1,3.3);a*=.5;}return v;}' +
          'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2+1.7;float tt=t*.06;float c=0.;' +
          'for(int i=0;i<2;i++){vec2 q=p+vec2(fbm(p*.8+tt+float(i)),fbm(p*.8-tt+float(i)*2.))*1.6;float n=noise(q*1.6+tt);float s=1.-abs(fract(n*2.)-.5)*2.;c+=pow(s,3.5)*(.6+.4*float(i));}' +
          'c*=.55;float soft=fbm(p*1.5+tt)*.35;vec3 CY=vec3(.36,.88,.9),CY2=vec3(.05,.55,.6),INK=vec3(.02,.03,.045);' +
          'vec3 col=INK+CY2*(c*1.1+soft*.5)+CY*pow(c,2.)*.8;float vig=smoothstep(1.5,.2,length(uv-vec2(.5,.45))*1.2);col*=mix(.45,1.,vig);gl_FragColor=vec4(col,1.);}';
        var mk = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
        var vs = mk(gl.VERTEX_SHADER, vsrc), fs = mk(gl.FRAGMENT_SHADER, fsrc);
        if (vs && fs) {
          var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
          var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          var a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
          var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');
          var visible = true, start = performance.now();
          var resize = function () {
            var dpr = Math.min(window.devicePixelRatio || 1, 1.25), scale = 0.6;   // render at reduced resolution: it is a soft texture
            cv.width = Math.floor(cv.clientWidth * dpr * scale); cv.height = Math.floor(cv.clientHeight * dpr * scale);
            gl.viewport(0, 0, cv.width, cv.height);
          };
          resize(); window.addEventListener('resize', resize);
          var frame = function (now) {
            if (visible) { gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, (now - start) / 1000); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
            requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
          cv.classList.add('on');
          if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
          document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
        }
      }
    } catch (e) { /* static image stays */ }
  }

  /* ---- header state ---- */
  var header = document.querySelector('.header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- reveal + panel image zoom ---- */
  var revealEls = document.querySelectorAll('.reveal, .panel');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- parallax on images ---- */
  var px = Array.prototype.slice.call(document.querySelectorAll('.parallax img'));
  if (px.length && !reduce) {
    var tick = false;
    var run = function () {
      tick = false;
      var vh = window.innerHeight;
      px.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;          // -1 .. 1
        img.style.transform = 'translateY(' + (p * -6) + '%) scale(1.12)';
      });
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---- counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, end = parseFloat(el.getAttribute('data-count')), t0 = performance.now(), dur = 1400;
        var step = function (now) {
          var k = Math.min(1, (now - t0) / dur); k = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(end * k); if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
  }

  /* ---- before / after slider ---- */
  var ba = document.getElementById('ba-slider');
  if (ba) {
    var range = ba.querySelector('input'), after = ba.querySelector('.after'), handle = ba.querySelector('.handle');
    var set = function (v) { after.style.clipPath = 'inset(0 0 0 ' + v + '%)'; handle.style.left = v + '%'; };
    range.addEventListener('input', function () { set(range.value); });
    set(50);
  }

  /* ---- cursor glow ---- */
  var glow = document.querySelector('.glow');
  if (glow && fine && !reduce) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    var loop = function () { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; glow.style.transform = 'translate(' + (gx - 260) + 'px,' + (gy - 260) + 'px)'; requestAnimationFrame(loop); };
    glow.style.transform = 'translate(' + (gx - 260) + 'px,' + (gy - 260) + 'px)';
    loop();
  }

  /* ---- mobile menu ---- */
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', function () { var o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---- contact form: timestamp + status message ---- */
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
    if (key === 'sent' && form) form.reset();
  }
})();
