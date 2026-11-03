/* ---------------------------------------------------------------------------
   Black Star Mersch - lafend Leeschten (Sponsoren, Fanshop-Artikelen).

   Fréier ass déi ganz Leescht als een eenzege, ganz breede Sträif mat CSS
   verréckelt ginn (all Elementer zweemol hannereneen). Safari mol esou breet,
   beweegt Ebenen heiansdo nëmmen zum Deel - da bleift e Stéck vun der Leescht
   eidel. Hei beweegt sech all Logo eenzel; et gëtt kee rieseg Sträif méi.

   Usage: bsmMarquee(trackElement, pixelsPerSecond)
   D'Track-Element enthält d'Elementer eemol (net duebel).
--------------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var GAP = 28; /* entsprécht dem fréieren "margin:0 14px" */

  function marquee(track, pxPerSec) {
    if (!track || !track.children.length) return null;
    var originals = [].slice.call(track.children);
    var items = [];
    var layout = [];
    var total = 0, maxW = 0;
    var offset = 0, last = 0, paused = false;
    var speed = pxPerSec;

    track.classList.add('js-marquee');

    function measure() {
      var cs = getComputedStyle(track);
      var padTop = parseFloat(cs.paddingTop) || 0;
      var padBottom = parseFloat(cs.paddingBottom) || 0;
      var viewport = (track.parentElement || track).clientWidth || window.innerWidth;

      /* Kloune wegloossen a fréisch moossen */
      items.forEach(function (el) { if (originals.indexOf(el) < 0) el.remove(); });
      items = originals.slice();

      function widths() {
        total = 0; maxW = 0;
        var maxH = 0;
        layout = items.map(function (el) {
          var w = el.offsetWidth, h = el.offsetHeight;
          var base = total;
          total += w + GAP;
          if (w > maxW) maxW = w;
          if (h > maxH) maxH = h;
          return { el: el, base: base, w: w };
        });
        track.style.height = (maxH + padTop + padBottom) + 'px';
        items.forEach(function (el) { el.style.top = padTop + 'px'; });
      }
      widths();

      /* Genuch Elementer, datt d'Leescht ni eidel gëtt */
      var guard = 0;
      while (total > 0 && total < viewport + 2 * (maxW + GAP) && guard++ < 20) {
        originals.forEach(function (el) {
          var c = el.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          c.tabIndex = -1;
          track.appendChild(c);
          items.push(c);
        });
        widths();
      }
      place();
    }

    function place() {
      if (!total) return;
      var lead = maxW + GAP;
      for (var i = 0; i < layout.length; i++) {
        var x = ((layout[i].base - offset + lead) % total + total) % total - lead;
        layout[i].el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
    }

    function frame(now) {
      if (!last) last = now;
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused && total) {
        offset = (offset + speed * dt) % total;
        place();
      }
      requestAnimationFrame(frame);
    }

    /* nëmme mat enger richteger Maus pauséieren (iPad: :hover bleift soss hänken) */
    if (window.matchMedia && window.matchMedia('(hover:hover)').matches) {
      track.addEventListener('mouseenter', function () { paused = true; });
      track.addEventListener('mouseleave', function () { paused = false; });
    }

    measure();
    /* Logoe kréien hir Breet eréischt, wann d'Bild gelueden ass */
    [].slice.call(track.querySelectorAll('img')).forEach(function (img) {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });
    window.addEventListener('load', measure);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 150); });
    requestAnimationFrame(frame);

    return {
      setSpeed: function (v) { speed = v; },
      width: function () { return originals.reduce(function (s, el) { return s + el.offsetWidth + GAP; }, 0); },
      remeasure: measure
    };
  }

  global.bsmMarquee = marquee;
})(window);
