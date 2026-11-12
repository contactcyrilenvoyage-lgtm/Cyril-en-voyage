/* Cyril en voyage · la route, la moto et la carte. */
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
  var nextAdventure = document.getElementById('prochaine-aventure');
  var backToTop = document.querySelector('.back-to-top');

  var W = 84, H = 0, VH = innerHeight, VW = innerWidth, breakY = 0;
  var MOTO_AT = 0.62;                       // the moto rides at 62% of the viewport
  var DEPART_FROM = 0.1, DEPART_TO = 0.62;  // next adventure progress window

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
    var top = nextAdventure.getBoundingClientRect().top + scrollY;
    return top + DEPART_FROM * (nextAdventure.offsetHeight - VH);
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

  function frame() {
    backToTop.hidden = scrollY < VH * 0.65;
    if (reduce) return;

    var docY = scrollY + VH * MOTO_AT;
    traceRect.setAttribute('height', Math.min(docY, breakY));

    var mx = roadX(Math.min(docY, breakY)), my = VH * MOTO_AT;
    var rot = -Math.atan(roadSlope(docY)) * 180 / Math.PI;
    var sc = 1, op = 1;

    var r = nextAdventure.getBoundingClientRect();
    var p = clamp(-r.top / Math.max(1, nextAdventure.offsetHeight - VH), 0, 1);
    if (r.top < VH && r.bottom > 0 || p >= 1) {
      var t = ease(clamp((p - DEPART_FROM) / (DEPART_TO - DEPART_FROM), 0, 1));
      if (r.bottom <= 0) t = 1;
      if (t > 0) {
        var st = getComputedStyle(nextAdventure);
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

  var map = document.querySelector('.carte__map');
  var card = document.getElementById('mapCard');
  var destinations = {
    usa: ['États-Unis', 'Le désert, la côte et les diners au bord de la route.'],
    bresil: ['Brésil', 'Des dunes blanches et des rues en couleurs.'],
    thailande: ['Thaïlande', 'Des rizières dans la brume et des marchés de nuit.']
  };

  function showDestination(event) {
    var target = event.target.closest('[data-chapter]');
    if (!target) return;
    var id = target.getAttribute('data-chapter');
    var destination = destinations[id];
    if (!destination) return;

    var pin = map.querySelector('.pin[data-chapter="' + id + '"]');
    var link = document.createElement('a');
    link.setAttribute('href', pin.getAttribute('href'));
    link.textContent = 'Ouvrir le carnet';
    card.querySelector('.carte__card-name').textContent = destination[0];
    card.querySelector('.carte__card-note').replaceChildren(destination[1] + ' ', link);
    map.querySelectorAll('.land[data-chapter]').forEach(function (land) {
      land.classList.toggle('is-hot', land.getAttribute('data-chapter') === id);
    });
  }

  map.addEventListener('pointerover', showDestination);
  map.addEventListener('focusin', showDestination);
  map.addEventListener('click', function (event) {
    if (event.target.closest('.land')) showDestination(event);
  });
})();
