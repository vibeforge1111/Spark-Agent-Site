/* ══════════════════════════════════════════════════════════════
   SPARK AGENT · agent.sparkswarm.ai · interactions
   ══════════════════════════════════════════════════════════════ */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;

  const countTo = (el, target, dur = 1800) => {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.floor(from + (target - from) * eased);
      el.textContent = String(v).padStart(String(target).length, '0');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* shared node-field renderer (hero background + swarm section) */
  const makeNodeField = (canvas, opts = {}) => {
    if (!canvas) return;
    const cfg = {
      density: 18,
      linkDist: 140,
      hoverDist: 150,
      irisPct: 0.18,
      broadcast: false,
      broadcastRate: 0.015,
      nodeR: [0.8, 2.2],
      cursorReactive: true,
      ...opts,
    };
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let bursts = [];
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width  = rect.width  + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
    };
    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      const n = Math.min(120, Math.max(50, Math.floor(rect.width / cfg.density)));
      nodes = Array.from({ length: n }, () => ({
        x: rand(0, rect.width),
        y: rand(0, rect.height),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.18, 0.18),
        r: rand(cfg.nodeR[0], cfg.nodeR[1]),
        iris: Math.random() < cfg.irisPct,
        pulse: rand(0, Math.PI * 2),
      }));
      bursts = [];
    };
    let mouseX = -9999, mouseY = -9999;
    if (cfg.cursorReactive) {
      addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });
      canvas.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });
    }
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < cfg.linkDist) {
            const o = (1 - d / cfg.linkDist) * 0.25;
            ctx.strokeStyle = `rgba(47,202,148,${o})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (cfg.cursorReactive && mouseX > -1000) {
          const dmx = a.x - mouseX, dmy = a.y - mouseY;
          const dm = Math.sqrt(dmx*dmx + dmy*dmy);
          if (dm < cfg.hoverDist) {
            const o = (1 - dm / cfg.hoverDist) * 0.6;
            ctx.strokeStyle = `rgba(77,227,168,${o})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
      }

      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.03;
        if (p.x < 0 || p.x > rect.width)  p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;
        const pr = p.r + Math.sin(p.pulse) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = p.iris ? 'rgba(184,168,220,0.85)' : 'rgba(47,202,148,0.85)';
        ctx.shadowColor = p.iris ? '#B8A8DC' : '#2FCA94';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (cfg.broadcast) {
        if (Math.random() < cfg.broadcastRate) {
          const origin = nodes[Math.floor(Math.random() * nodes.length)];
          if (origin) bursts.push({ x: origin.x, y: origin.y, rad: 0, o: 1, iris: origin.iris });
        }
        bursts = bursts.filter(b => b.o > 0);
        for (const b of bursts) {
          b.rad += 1.8; b.o -= 0.012;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.rad, 0, Math.PI * 2);
          ctx.strokeStyle = b.iris
            ? `rgba(184,168,220,${b.o})`
            : `rgba(47,202,148,${b.o * 0.9})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(render);
    };
    resize(); seed();
    addEventListener('resize', () => { resize(); seed(); });
    render();
  };

  /* ══════════════════════════════════════════════════════════════
     LOADER
     ══════════════════════════════════════════════════════════════ */
  const loader = $('#loader');
  const counter = $('#loader-counter');
  const runLoader = () => {
    if (reduced) { loader.classList.add('done'); return; }
    let v = 0;
    const tick = () => {
      v += rand(1.2, 4.5);
      if (v >= 100) {
        counter.textContent = '100';
        setTimeout(() => {
          loader.classList.add('reveal');
          setTimeout(() => {
            loader.classList.add('reveal-out');
            setTimeout(() => loader.classList.add('done'), 750);
          }, 350);
        }, 200);
        return;
      }
      counter.textContent = String(Math.floor(v)).padStart(3, '0');
      setTimeout(tick, rand(14, 40));
    };
    tick();
  };
  runLoader();

  /* ══════════════════════════════════════════════════════════════
     CUSTOM CURSOR
     ══════════════════════════════════════════════════════════════ */
  if (isTouch) {
    document.body.classList.add('cursor-native');
  } else {
    const dot = $('#cursor-dot');
    let mx = innerWidth / 2, my = innerHeight / 2;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    const loop = () => {
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    const markHover = () => document.body.classList.add('hover-target');
    const unmarkHover = () => document.body.classList.remove('hover-target');
    $$('a, button, [data-magnetic], .mod-card, .cmd-row, .board-node, .orbit-node').forEach(el => {
      el.addEventListener('mouseenter', markHover);
      el.addEventListener('mouseleave', unmarkHover);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     MAGNETIC BUTTONS
     ══════════════════════════════════════════════════════════════ */
  if (!isTouch) {
    $$('[data-magnetic]').forEach(el => {
      let rafId;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx * 0.15}px, ${dy * 0.2}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     BACKGROUND PARTICLES
     ══════════════════════════════════════════════════════════════ */
  const bgc = $('#bg-particles');
  const bgctx = bgc.getContext('2d');
  let bgParticles = [];
  const resizeBG = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    bgc.width = innerWidth * dpr;
    bgc.height = innerHeight * dpr;
    bgc.style.width = innerWidth + 'px';
    bgc.style.height = innerHeight + 'px';
    bgctx.scale(dpr, dpr);
  };
  const seedBG = () => {
    const n = Math.min(60, Math.floor(innerWidth / 24));
    bgParticles = Array.from({ length: n }, () => ({
      x: rand(0, innerWidth),
      y: rand(0, innerHeight),
      vx: rand(-0.08, 0.08),
      vy: rand(-0.04, 0.04),
      r: rand(0.4, 1.4),
      o: rand(0.1, 0.45),
    }));
  };
  resizeBG(); seedBG();
  addEventListener('resize', () => { resizeBG(); seedBG(); });
  const renderBG = () => {
    bgctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of bgParticles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = innerWidth;
      if (p.x > innerWidth) p.x = 0;
      if (p.y < 0) p.y = innerHeight;
      if (p.y > innerHeight) p.y = 0;
      bgctx.beginPath();
      bgctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgctx.fillStyle = `rgba(47,202,148,${p.o})`;
      bgctx.fill();
    }
    requestAnimationFrame(renderBG);
  };
  if (!reduced) renderBG();

  /* ══════════════════════════════════════════════════════════════
     HERO v3 · Jarvis core · scramble, live counters, node field
     ══════════════════════════════════════════════════════════════ */

  // 1. scramble-resolve reveal on hero title words (after fade-in)
  const scrambleChars = '!<>-_\\/[]{}=+*^?#█░▒01';
  $$('.hero-title .hk-w').forEach((el, i) => {
    if (reduced) return;
    const original = el.dataset.text || el.textContent;
    const base = 1700 + i * 70;
    setTimeout(() => {
      let start = null;
      const dur = 460;
      const tick = (ts) => {
        if (start === null) start = ts;
        const k = Math.min(1, (ts - start) / dur);
        if (k >= 1) { el.textContent = original; return; }
        const revealed = Math.floor(original.length * k);
        let out = '';
        for (let j = 0; j < original.length; j++) {
          const ch = original[j];
          if (j < revealed || ch === ' ' || ch === '.') out += ch;
          else out += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
        el.textContent = out;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, base);
  });

  // 2. runtime live counters + jitter
  const rtSwarm   = $('#rt-swarm');
  const rtLatency = $('#rt-latency');
  const liveCount = $('#live-count');
  const livePeers = $('#live-peers');

  setTimeout(() => {
    countTo(rtSwarm,   4829, 1600);
    countTo(liveCount, 4829, 1600);
    countTo(livePeers, 1274, 1400);
  }, 1200);

  setInterval(() => {
    if (rtLatency) rtLatency.textContent = 210 + Math.floor(rand(0, 90));
    if (liveCount) {
      const cur = parseInt(liveCount.textContent || '4829', 10);
      const drift = Math.floor(rand(-2, 3));
      const next = clamp(cur + drift, 4780, 4900);
      liveCount.textContent = String(next).padStart(4, '0');
    }
  }, 2200);

  // Jarvis HUD · bio, coord, freq, status cycling
  const hudBio  = $('#hud-bio');
  const hudX    = $('#hud-x');
  const hudY    = $('#hud-y');
  const hudFreq = $('#hud-freq');
  const hudStat = $('#hud-status');

  setInterval(() => {
    if (hudBio)  hudBio.textContent  = (97 + Math.random() * 2.9).toFixed(1);
    if (hudFreq) hudFreq.textContent = (143.5 + Math.random() * 1.4).toFixed(2);
    if (hudX)    hudX.textContent    = (rand(-0.5, 0.5)).toFixed(2);
    if (hudY)    hudY.textContent    = (rand(-0.5, 0.5)).toFixed(2);
  }, 900);

  const missions = [
    'scanning environment',
    'indexing memory',
    'swarm handshake',
    'claude handshake · ok',
    'chip registry sync',
    'trust posture nominal',
    'awaiting mission',
    'telegram channel idle',
    'reasoning loop armed',
  ];
  let missionI = 0;
  setInterval(() => {
    if (!hudStat) return;
    missionI = (missionI + 1) % missions.length;
    hudStat.style.opacity = '0';
    setTimeout(() => {
      hudStat.textContent = missions[missionI];
      hudStat.style.opacity = '1';
    }, 180);
  }, 3400);

  // 3. cursor parallax on the avatar
  const avStage = $('#avatar-stage');
  if (avStage && !isTouch) {
    const svg = $('.avatar-svg', avStage);
    avStage.addEventListener('mousemove', (e) => {
      const r = avStage.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (svg) svg.style.transform = `translate(${dx * 16}px, ${dy * 16}px)`;
    });
    avStage.addEventListener('mouseleave', () => {
      if (svg) svg.style.transform = '';
    });
  }

  // 4. hero-field canvas · sparkswarm-style node network behind the avatar
  makeNodeField($('#hero-field'), {
    density: 18,
    linkDist: 140,
    hoverDist: 150,
    irisPct: 0.18,
    broadcast: false,
    cursorReactive: true,
  });

  /* ══════════════════════════════════════════════════════════════
     BOARD · draggable nodes + cables
     ══════════════════════════════════════════════════════════════ */
  const stage = $('#board-stage');
  const cables = $('#board-cables');
  const connections = [
    ['input',  'memory'],
    ['input',  'brain'],
    ['memory', 'brain'],
    ['brain',  'chip'],
    ['chip',   'output'],
    ['brain',  'output'],
  ];
  const nodeEl = (id) => $(`.board-node[data-node="${id}"]`, stage);

  const drawCables = () => {
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    cables.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    cables.innerHTML = '';
    for (const [a, b] of connections) {
      const ea = nodeEl(a), eb = nodeEl(b);
      if (!ea || !eb) continue;
      const ra = ea.getBoundingClientRect();
      const rb = eb.getBoundingClientRect();
      const x1 = ra.left - rect.left + ra.width;
      const y1 = ra.top  - rect.top  + ra.height / 2;
      const x2 = rb.left - rect.left;
      const y2 = rb.top  - rect.top  + rb.height / 2;
      const cx = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      cables.appendChild(path);
    }
  };

  const setupDrag = () => {
    if (!stage) return;
    $$('.board-node', stage).forEach(node => {
      let startX, startY, nx, ny;
      const onDown = (e) => {
        if (e.target.closest('a, button')) return;
        const p = e.touches ? e.touches[0] : e;
        startX = p.clientX; startY = p.clientY;
        const s = stage.getBoundingClientRect();
        nx = (node.offsetLeft / s.width) * 100;
        ny = (node.offsetTop / s.height) * 100;
        node.classList.add('dragging');
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
      };
      const onMove = (e) => {
        const p = e.touches ? e.touches[0] : e;
        if (e.cancelable) e.preventDefault();
        const dx = p.clientX - startX;
        const dy = p.clientY - startY;
        const s = stage.getBoundingClientRect();
        const newLeft = clamp(nx + (dx / s.width) * 100, 1, 90);
        const newTop  = clamp(ny + (dy / s.height) * 100, 1, 80);
        node.style.left = newLeft + '%';
        node.style.top  = newTop  + '%';
        drawCables();
      };
      const onUp = () => {
        node.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
      };
      node.addEventListener('mousedown', onDown);
      node.addEventListener('touchstart', onDown, { passive: true });
    });
  };

  requestAnimationFrame(() => { drawCables(); setupDrag(); });
  addEventListener('resize', drawCables);

  /* ══════════════════════════════════════════════════════════════
     MARQUEE · build module tiles
     ══════════════════════════════════════════════════════════════ */
  const mq = $('#marquee-track');
  if (mq) {
    const tiles = [
      { name: 'memory',       tier: 'free' },
      { name: 'telegram',     tier: 'free' },
      { name: 'discord',      tier: 'free' },
      { name: 'browser',      tier: 'free' },
      { name: 'researcher',   tier: 'free' },
      { name: 'swarm',        tier: 'free' },
      { name: 'voice',        tier: 'free' },
      { name: 'x-twitter',    tier: 'free' },
      { name: 'h70-corpus',   tier: 'pro'  },
      { name: 'orchestrator', tier: 'pro'  },
      { name: 'memory-sync',  tier: 'pro'  },
      { name: 'security-chip',tier: 'pro'  },
      { name: 'growth-chip',  tier: 'pro'  },
      { name: 'ops-chip',     tier: 'pro'  },
      { name: 'trading-chip', tier: 'pro'  },
      { name: 'calendar',     tier: 'free' },
      { name: 'gmail',        tier: 'free' },
      { name: 'github',       tier: 'free' },
    ];
    const make = () => tiles.map(t =>
      `<span class="marquee-tile ${t.tier}"><span class="mt-k">${t.tier === 'pro' ? '◆' : '▸'}</span>spark install ${t.name}</span>`
    ).join('');
    mq.innerHTML = make() + make();
  }

  /* ══════════════════════════════════════════════════════════════
     SWARM CANVAS · same node-field as the hero, plus broadcast pulses
     ══════════════════════════════════════════════════════════════ */
  makeNodeField($('#swarm-canvas'), {
    density: 16,
    linkDist: 135,
    hoverDist: 160,
    irisPct: 0.14,
    broadcast: true,
    broadcastRate: 0.018,
    nodeR: [1.0, 2.6],
    cursorReactive: true,
  });

  /* ══════════════════════════════════════════════════════════════
     LOOP COUNTER
     ══════════════════════════════════════════════════════════════ */
  const loopCount = $('#loop-count');
  if (loopCount) {
    const tickLoop = () => {
      countTo(loopCount, 847 + Math.floor(Math.random() * 30), 1200);
      setTimeout(tickLoop, 4200);
    };
    tickLoop();
  }

  /* ══════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER · reveals + triggers
     ══════════════════════════════════════════════════════════════ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        // swarm counters
        if (e.target.id === 'swarm') {
          const a = $('#swarm-agents');
          const b = $('#swarm-lessons');
          const c = $('#swarm-graphs');
          if (a && !a.dataset.done) { countTo(a, 4829); a.dataset.done = '1'; }
          if (b && !b.dataset.done) { countTo(b, 1274); b.dataset.done = '1'; }
          if (c && !c.dataset.done) { countTo(c, 138);  c.dataset.done = '1'; }
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

  $$('[data-reveal], #swarm').forEach(el => io.observe(el));

  /* ══════════════════════════════════════════════════════════════
     COPY TO CLIPBOARD
     ══════════════════════════════════════════════════════════════ */
  const copyText = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
    }
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
    }
  };

  // hero primary cta
  const ctaInstall = $('#cta-install');
  if (ctaInstall) {
    ctaInstall.addEventListener('click', (e) => {
      e.preventDefault();
      copyText('brew install spark', $('#cta-copy'));
      ctaInstall.classList.add('copied');
      setTimeout(() => ctaInstall.classList.remove('copied'), 1600);
    });
  }

  // install cmds
  $$('.cmd-row').forEach(row => {
    const code = $('.cmd', row);
    const btn = $('[data-copy-btn]', row);
    const action = () => copyText(code.textContent, btn);
    row.addEventListener('click', action);
  });

  /* ══════════════════════════════════════════════════════════════
     THEME TOGGLE
     ══════════════════════════════════════════════════════════════ */
  const themeBtn = $('#theme-toggle');
  const saved = localStorage.getItem('spark-theme');
  if (saved) document.documentElement.dataset.theme = saved;
  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('spark-theme', next);
    themeBtn.textContent = next === 'light' ? '◑' : '◐';
  });

  /* ══════════════════════════════════════════════════════════════
     SMOOTH SCROLL (nav anchors)
     ══════════════════════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

})();
