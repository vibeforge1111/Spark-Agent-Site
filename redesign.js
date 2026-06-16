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

  // loop progress · the mark fills left-to-right with scroll, click closes the loop
  var lp = document.querySelector('.loop-progress');
  if (lp) {
    var revealRect = lp.querySelector('clipPath rect');
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom || p > 0.985) p = 1;
        // 264 = the mark's ink width; the reveal tracks the drawing, not the viewBox
        if (revealRect) revealRect.setAttribute('width', String(p * 264));
        lp.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    lp.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

})();
