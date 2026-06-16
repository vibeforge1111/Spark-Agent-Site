/* Spark landing redesign - external script (CSP: script-src 'self', no inline) */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll reveals
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // install tabs
  var tabs = document.querySelectorAll('.tabs button');
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) {
        x.classList.remove('active');
        x.setAttribute('aria-selected', 'false');
      });
      b.classList.add('active');
      b.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.cmd[data-install-panel]').forEach(function (p) {
        p.hidden = p.dataset.installPanel !== b.dataset.tab;
      });
    });
  });

  // copy buttons
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var value = b.dataset.copyValue || '';
      navigator.clipboard.writeText(value).then(function () {
        var prev = b.textContent;
        b.textContent = 'copied ✓';
        setTimeout(function () { b.textContent = prev; }, 1600);
      });
    });
  });

  // spark loop · the logo runs as the loop (CSS flow + SMIL marker).
  // JS only counts cycles to brighten the track (capped) and pauses offscreen.
  var stage = document.querySelector('.spark-loop');
  if (stage && !reducedMotion) {
    var stageSvg = stage.querySelector('svg');
    var flow = stage.querySelector('.sl-flow');
    var laps = 0;
    if (flow) {
      flow.addEventListener('animationiteration', function () {
        if (laps < 10) {
          laps++;
          stage.style.setProperty('--laps', String(laps));
        }
      });
    }
    var stageIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        stage.classList.toggle('paused', !e.isIntersecting);
        if (stageSvg && stageSvg.pauseAnimations) {
          if (e.isIntersecting) { stageSvg.unpauseAnimations(); } else { stageSvg.pauseAnimations(); }
        }
      });
    }, { threshold: 0 });
    stageIo.observe(stage);
  } else if (stage && reducedMotion) {
    var svgEl = stage.querySelector('svg');
    if (svgEl && svgEl.pauseAnimations) { svgEl.pauseAnimations(); }
  }

  // loop progress · the mark fills left-to-right with scroll, click closes the loop.
  // Direct handler (no rAF/ticking flag that could stick) + clip covers the FULL
  // viewBox at completion (293), so the mark always finishes fully green at bottom.
  var lp = document.querySelector('.loop-progress');
  if (lp) {
    var revealRect = lp.querySelector('clipPath rect');
    var VBW = 293; // full viewBox width; at p=1 the green clip covers the whole mark
    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      // snap to complete near the bottom (fractional scroll never hits max exactly)
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2 || p > 0.98) p = 1;
      if (revealRect) revealRect.setAttribute('width', (p * VBW).toFixed(1));
      lp.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    lp.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

})();
