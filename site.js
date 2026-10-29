/* Cyril en voyage · page-local behaviour. The engine stays untouched.
   1. La route : a winding road drawn down the left margin of the whole page.
   2. La moto : rides that road under the reader's scroll, then leaves the
      margin and drives into the Andes photograph (the peak).
   3. Le tableau de bord : odometer of the reader's own scroll, passport stamps.
   4. La carte : hover / tap a country to read it, click to open its chapter. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;
  var route = document.getElementById('route');
  var svg = document.getElementById('routeSvg');
  var pAsphalt = document.getElementById('routeAsphalt');
  var pLine = document.getElementById('routeLine');
  var pTrace = document.getElementById('routeTrace');
  var pFuture = document.getElementById('routeFuture');
  var traceRect = document.getElementById('traceRect');
  var moto = document.getElementById('moto');
  var odo = document.getElementById('odo');
  var andes = document.getElementById('amerique-du-sud');
  var stamps = [].slice.call(document.querySelectorAll('[data-stamp]'));
  var chapters = [].slice.call(document.querySelectorAll('section[data-chapter]'));

  var W = 84, H = 0, VH = innerHeight, VW = innerWidth, breakY = 0;
  var MOTO_AT = 0.62;                       // the moto rides at 62% of the viewport
  var DEPART_FROM = 0.1, DEPART_TO = 0.62;  // andes act progress window

  function roadX(y) {
    var c = W / 2, a = W * 0.27;
    return c + a * Math.sin(y / 520 + 0.6) * (0.65 + 0.35 * Math.sin(y / 1900));
  }
  function roadSlope(y) { return (roadX(y + 2) - roadX(y - 2)) / 4; }

  function pathBetween(y0, y1) {
    var d = '', step = 24;
    for (var y = y0; y <= y1 + step; y += step) {
      var yy = Math.min(y, y1);
      d += (d ? ' L' : 'M') + roadX(yy).toFixed(1) + ',' + yy.toFixed(0);
      if (yy === y1) break;
    }
    return d;
  }

  function departScrollY() {
    var top = andes.getBoundingClientRect().top + scrollY;
    return top + DEPART_FROM * (andes.offsetHeight - VH);
  }

  function build() {
    VH = innerHeight; VW = innerWidth;
    W = parseFloat(getComputedStyle(doc).getPropertyValue('--road-w')) || 84;
    H = doc.scrollHeight;
    route.style.height = H + 'px';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    breakY = departScrollY() + VH * MOTO_AT;
    var solid = pathBetween(0, breakY);
    pAsphalt.setAttribute('d', solid);
    pLine.setAttribute('d', solid);
    pTrace.setAttribute('d', solid);
    pFuture.setAttribute('d', pathBetween(breakY + 30, H - 40));
    traceRect.setAttribute('width', W);
    if (reduce) traceRect.setAttribute('height', H);
    frame();
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t * t * (3 - 2 * t); }

  var stamped = {};
  function frame() {
    var y = scrollY;
    // odometer: the reader's own scroll, 1 km per 4 px. Honest and labelled.
    odo.textContent = String(Math.round(y / 4)).padStart(5, '0');

    // stamps accumulate as chapters are reached
    for (var i = 0; i < chapters.length; i++) {
      var id = chapters[i].getAttribute('data-chapter');
      if (!stamped[id] && chapters[i].getBoundingClientRect().top < VH * 0.55) {
        stamped[id] = true;
        var s = document.querySelector('[data-stamp="' + id + '"]');
        if (s) s.classList.add('is-stamped');
      }
    }
    if (reduce) return;

    var docY = y + VH * MOTO_AT;
    traceRect.setAttribute('height', Math.min(docY, breakY));

    var mx = roadX(Math.min(docY, breakY)), my = VH * MOTO_AT;
    var rot = -Math.atan(roadSlope(docY)) * 180 / Math.PI;
    var sc = 1, op = 1;

    var r = andes.getBoundingClientRect();
    var p = clamp(-r.top / (andes.offsetHeight - VH), 0, 1);
    if (r.top < VH && r.bottom > 0 || p >= 1) {
      var t = ease(clamp((p - DEPART_FROM) / (DEPART_TO - DEPART_FROM), 0, 1));
      if (r.bottom <= 0) t = 1;
      if (t > 0) {
        var st = getComputedStyle(andes);
        var vx = (parseFloat(st.getPropertyValue('--vp-x')) || 60) / 100 * VW;
        var vy = (parseFloat(st.getPropertyValue('--vp-y')) || 45) / 100 * VH;
        var x0 = roadX(breakY), y0 = VH * MOTO_AT;
        var cx = VW * (vx / VW * 0.95), cy = VH * 1.18;   // swoop to the base of the road, then up it
        var u = 1 - t;
        mx = u * u * x0 + 2 * u * t * cx + t * t * vx;
        my = u * u * y0 + 2 * u * t * cy + t * t * vy;
        var dx = 2 * u * (cx - x0) + 2 * t * (vx - cx), dy = 2 * u * (cy - y0) + 2 * t * (vy - cy);
        var head = Math.atan2(-dx, dy) * 180 / Math.PI;    // nose of the drawing points down
        var blend = clamp(t * 6, 0, 1);
        var d = ((head - rot + 540) % 360) - 180;
        rot = rot + d * blend;
        sc = (1 + 2.1 * Math.sin(Math.PI * clamp(t * 1.5, 0, 1))) * (1 - 0.9 * Math.pow(t, 1.3));
        op = t > 0.92 ? clamp((1 - t) / 0.08, 0, 1) : 1;
      }
    }
    moto.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
    moto.style.opacity = op;
  }

  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; frame(); });
  }, { passive: true });
  var rt;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 120); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(build, 120); }).observe(document.body);
  addEventListener('load', build);
  if (document.fonts) document.fonts.ready.then(build);
  build();

  // ---------------------------------------------------------------- carte
  var info = {
    usa: ['États-Unis', 'Plusieurs road trips. Désert, côte, et diners au bord de la route.'],
    bresil: ['Brésil', 'Road trip. Dunes blanches, lagunes, rues en couleurs.'],
    thailande: ['Thaïlande', 'Road trip. Rizières, autels de bord de route, marchés de nuit.'],
    'amerique-du-sud': ['Amérique du Sud', 'Toute l’Amérique du Sud à moto. En préparation, tracé indicatif.']
  };
  var card = document.getElementById('mapCard');
  var map = document.querySelector('.carte__map');
  function show(id) {
    if (!info[id] || !card) return;
    card.innerHTML = '<p class="carte__card-name">' + info[id][0] + '</p><p class="carte__card-note">' + info[id][1] +
      ' <a href="#' + id + '">Ouvrir le chapitre</a></p>';
    [].forEach.call(map.querySelectorAll('.land'), function (l) { l.classList.toggle('is-hot', l.getAttribute('data-chapter') === id); });
  }
  function go(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  if (map) {
    map.addEventListener('pointerover', function (e) { var t = e.target.closest('[data-chapter]'); if (t) show(t.getAttribute('data-chapter')); });
    map.addEventListener('focusin', function (e) { var t = e.target.closest('[data-chapter]'); if (t) show(t.getAttribute('data-chapter')); });
    map.addEventListener('click', function (e) {
      var t = e.target.closest('[data-chapter]'); if (!t) return;
      var id = t.getAttribute('data-chapter');
      // first tap on touch reads the card, second opens the chapter
      if (e.pointerType === 'touch' && card.dataset.last !== id) { card.dataset.last = id; show(id); return; }
      e.preventDefault(); go(id);
    });
    map.addEventListener('keydown', function (e) {
      var t = e.target.closest('.pin'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(t.getAttribute('data-chapter')); }
    });
  }
})();
