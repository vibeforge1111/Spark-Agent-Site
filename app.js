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

  // 2. swarm count in the hero lead
  const rtSwarm = $('#rt-swarm');
  setTimeout(() => {
    if (rtSwarm) countTo(rtSwarm, 4829, 1600);
  }, 1100);
  setInterval(() => {
    if (!rtSwarm) return;
    const cur = parseInt((rtSwarm.textContent || '4829').replace(/,/g, ''), 10);
    const next = clamp(cur + Math.floor(rand(-2, 4)), 4780, 4950);
    rtSwarm.textContent = next.toLocaleString('en-US');
  }, 2800);

  // 3. LIVING SPEC CARD · the transformation proof
  const specVer     = $('#spec-version');
  const specVerNext = $('#spec-version-next');
  const specState   = specVer ? specVer.closest('.spec-meta') : null;
  const spLessons   = $('#sp-lessons');
  const spTools     = $('#sp-tools');
  const spMistakes  = $('#sp-mistakes');
  const spPeers     = $('#sp-peers');
  const spCountdown = $('#sp-countdown');

  const fmtVersion = (n) => 'v0.' + String(n).padStart(4, '0');

  // 3a. fill mastery bars once the card is on screen
  const masteries = $$('.mastery');
  setTimeout(() => {
    masteries.forEach((el, i) => {
      setTimeout(() => el.classList.add('is-filled'), i * 180);
    });
  }, 1400);

  // 3b. animate tonight counters on reveal
  setTimeout(() => {
    if (spLessons) countTo(spLessons, 38, 1600);
    if (spPeers)   countTo(spPeers, 847, 1800);
  }, 1800);

  // 3c. version ticker + bump every ~7s
  let verN = 841;
  setInterval(() => {
    if (!specVer || !specVerNext) return;
    verN += 1;
    specVer.textContent     = fmtVersion(verN);
    specVerNext.textContent = fmtVersion(verN + 1);
    specVer.classList.add('pulse');
    if (specState) specState.classList.add('tick');
    setTimeout(() => {
      specVer.classList.remove('pulse');
      if (specState) specState.classList.remove('tick');
    }, 900);

    // lessons + peers drift with the version
    if (spLessons) {
      const cur = parseInt(spLessons.textContent || '38', 10);
      spLessons.textContent = String(clamp(cur + Math.floor(rand(0, 3)), 38, 999));
    }
    if (spPeers) {
      const cur = parseInt(spPeers.textContent || '847', 10);
      spPeers.textContent = String(clamp(cur + Math.floor(rand(-2, 5)), 800, 1200));
    }
    // occasionally bump tools / mistakes
    if (spTools && Math.random() < 0.28) {
      spTools.textContent = String(parseInt(spTools.textContent || '2', 10) + 1);
    }
    if (spMistakes && Math.random() < 0.18) {
      spMistakes.textContent = String(parseInt(spMistakes.textContent || '1', 10) + 1);
    }
  }, 7000);

  // 3d. recursive loop strip · active step cycles, loops counter increments
  const slSteps = $$('#sl-steps li');
  const slLoops = $('#sl-loops');
  if (slSteps.length) {
    let step = 0;
    const tickStep = () => {
      slSteps.forEach((el, i) => el.classList.toggle('active', i === step));
      step = (step + 1) % slSteps.length;
      // when wrapping back to 0, a full loop just completed
      if (step === 0 && slLoops) {
        const cur = parseInt((slLoops.textContent || '27418').replace(/,/g, ''), 10);
        slLoops.textContent = (cur + 1).toLocaleString('en-US');
      }
    };
    tickStep();
    setInterval(tickStep, 1800);
  }

  // 3e. countdown to next compound · decrements every second
  if (spCountdown) {
    let totalSec = 4 * 3600 + 12 * 60 + 8;
    const fmt = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };
    spCountdown.textContent = fmt(totalSec);
    setInterval(() => {
      totalSec = totalSec > 0 ? totalSec - 1 : 6 * 3600; // reset to 6h when hits zero
      spCountdown.textContent = fmt(totalSec);
    }, 1000);
  }

  // 4. hero background is now a CSS dot field · canvas disabled

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
     SWARM CANVAS · port of sparkswarm.ai's WaitlistNetworkCanvas
     ══════════════════════════════════════════════════════════════ */
  const makeSwarmNetwork = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CATEGORY_COLORS = {
      agent:          '#2FCA94',
      specialization: '#B8A8DC',
      path:           '#D8C868',
      insight:        '#8890B0',
    };

    const agentNames = [
      'nova-research','zero-to-one','atlas-build','drift-ops','signal-hunter','echo-analyst',
      'forge-engine','pulse-monitor','vortex-scan','helix-runner','quasar-mind','nebula-trace',
      'cipher-flow','apex-solver','tide-watch','ember-logic','prism-lens','rift-walker',
      'bloom-synth','frost-core','storm-pilot','volt-spark','onyx-guard','zenith-probe',
      'cobalt-mind','lumen-index','stratos-agent','crest-builder','flux-engine','gale-tracker',
      'iron-lattice','jade-planner','kite-render','lyra-mapper','mesa-scout','noir-agent',
      'orbit-sync','pike-analyst','reef-solver','sage-tuner','thorn-watch','ultra-parse',
      'vale-miner','wren-seeker','xeno-pattern','yoke-bridge','zeal-runner','arc-welder',
      'bolt-finder','core-drift','dusk-agent','edge-pulse','fern-logic','grid-hawk'
    ];
    const specNames = [
      'content-strategy','yc-startup','devops','ml-pipelines','b2b-sales',
      'growth-hacking','security-audit','data-science','ai-agents','product-strategy'
    ];
    const pathNames = [
      'lead-qualifier','launch-sprint','infra-hardener','model-tuner',
      'copy-editor','metric-driver','audit-trail','feature-engine'
    ];
    const insightNames = [
      'audience-segments','founder-led-sales','canary-deploys','lora-fine-tune',
      'churn-predictor','prompt-patterns'
    ];

    const rawNodes = [
      ...agentNames.map((slash, i) => ({ id: 'a'+i, slash, category: 'agent' })),
      ...specNames.map((slash, i) => ({ id: 's'+i, slash, category: 'specialization' })),
      ...pathNames.map((slash, i) => ({ id: 'p'+i, slash, category: 'path' })),
      ...insightNames.map((slash, i) => ({ id: 'i'+i, slash, category: 'insight' })),
    ];

    const nodes = rawNodes.map((n) => ({
      ...n,
      x: 0, y: 0,
      renderX: 0, renderY: 0,
      radius: n.category === 'specialization' ? 24
            : n.category === 'path'           ? 18
            : n.category === 'insight'        ? 16
            :                                    6.5,
      orbitAngle:  rand(0, Math.PI * 2),
      orbitRadius: rand(3, 9),
      orbitSpeed:  rand(-1, 1) * 0.0015,
      entranceT:   0,
    }));
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const byCat = c => nodes.filter(n => n.category === c);
    const agents  = byCat('agent');
    const specs   = byCat('specialization');
    const paths   = byCat('path');
    const insights= byCat('insight');

    const edges = [];
    agents.forEach(a => {
      const spec = specs[Math.floor(Math.random() * specs.length)];
      edges.push({ source: a.id, target: spec.id });
      if (Math.random() < 0.28) {
        const spec2 = specs[Math.floor(Math.random() * specs.length)];
        if (spec2.id !== spec.id) edges.push({ source: a.id, target: spec2.id });
      }
    });
    specs.forEach(s => {
      paths.forEach(p => { if (Math.random() < 0.35) edges.push({ source: s.id, target: p.id }); });
      insights.forEach(i => { if (Math.random() < 0.25) edges.push({ source: s.id, target: i.id }); });
    });
    paths.forEach(p => {
      insights.forEach(i => { if (Math.random() < 0.2) edges.push({ source: p.id, target: i.id }); });
    });

    let W = 0, H = 0, dpr = 1;
    const resizeSN = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      layout();
    };

    const layout = () => {
      // Use the larger dimension so nodes push against + past edges (zoomed-in feel)
      const R = Math.max(W, H);
      specs.forEach((s, i) => {
        const a = (i / specs.length) * Math.PI * 2 + 0.3;
        const r = R * 0.22;
        s.x = Math.cos(a) * r; s.y = Math.sin(a) * r * 0.6;
      });
      agents.forEach((n) => {
        const a = rand(0, Math.PI * 2);
        const r = R * 0.42 * (0.5 + Math.random() * 0.75);
        n.x = Math.cos(a) * r; n.y = Math.sin(a) * r * 0.66;
      });
      paths.forEach((n, i) => {
        const a = (i / paths.length) * Math.PI * 2 - 0.2;
        const r = R * 0.5;
        n.x = Math.cos(a) * r; n.y = Math.sin(a) * r * 0.66;
      });
      insights.forEach((n, i) => {
        const a = (i / insights.length) * Math.PI * 2 + 0.7;
        const r = R * 0.56;
        n.x = Math.cos(a) * r; n.y = Math.sin(a) * r * 0.66;
      });
    };

    const particles = reduced ? [] : edges
      .filter(e => !(nodeMap[e.source].category === 'agent' && nodeMap[e.target].category === 'agent'))
      .map(e => ({ edge: e, t: Math.random(), speed: 0.0012 + Math.random() * 0.0014 }));

    // camera drift for life (same as sparkswarm.ai)
    const cam = { x: 0, y: 0, angle: Math.random() * Math.PI * 2 };
    const CAM_SPEED = 0.00009;

    const getBezier = (src, tgt) => {
      const mx = (src.renderX + tgt.renderX) / 2;
      const my = (src.renderY + tgt.renderY) / 2;
      const dx = tgt.renderX - src.renderX;
      const dy = tgt.renderY - src.renderY;
      return {
        sx: src.renderX, sy: src.renderY,
        cx: mx + (-dy * 0.12), cy: my + (dx * 0.12),
        ex: tgt.renderX, ey: tgt.renderY,
      };
    };
    const pointOnBezier = (b, t) => {
      const u = 1 - t;
      return {
        x: u*u*b.sx + 2*u*t*b.cx + t*t*b.ex,
        y: u*u*b.sy + 2*u*t*b.cy + t*t*b.ey,
      };
    };
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const drawIcon = (ctx, x, y, s, col, cat) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.4;
      if (cat === 'specialization') {
        ctx.beginPath();
        ctx.moveTo(x, y - s*0.28);
        ctx.lineTo(x + s*0.28, y);
        ctx.lineTo(x, y + s*0.28);
        ctx.lineTo(x - s*0.28, y);
        ctx.closePath();
        ctx.stroke();
      } else if (cat === 'path') {
        ctx.beginPath();
        ctx.moveTo(x - s*0.24, y + s*0.14);
        ctx.lineTo(x - s*0.08, y - s*0.14);
        ctx.lineTo(x + s*0.08, y + s*0.14);
        ctx.lineTo(x + s*0.24, y - s*0.14);
        ctx.stroke();
      } else if (cat === 'insight') {
        const r = s * 0.22;
        ctx.beginPath(); ctx.moveTo(x, y-r);   ctx.lineTo(x, y+r);   ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x-r, y);   ctx.lineTo(x+r, y);   ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x-r*0.6, y-r*0.6); ctx.lineTo(x+r*0.6, y+r*0.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r*0.6, y-r*0.6); ctx.lineTo(x-r*0.6, y+r*0.6); ctx.stroke();
      }
    };

    resizeSN();
    addEventListener('resize', resizeSN);

    const entranceStart = performance.now();
    const NODE_STAGGER = reduced ? 0 : 35;
    let pulsePhase = 0;

    const render = (now) => {
      requestAnimationFrame(render);
      const elapsed = now - entranceStart;
      pulsePhase = now * 0.002;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // dot grid background
      ctx.fillStyle = 'rgba(47,202,148,0.025)';
      for (let gx = 0; gx < W; gx += 36) {
        for (let gy = 0; gy < H; gy += 36) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      ctx.save();
      if (!reduced) {
        cam.angle += CAM_SPEED;
        cam.x = Math.cos(cam.angle)         * 28;
        cam.y = Math.sin(cam.angle * 0.7)   * 20;
      }
      ctx.translate(W / 2 - cam.x, H / 2 - cam.y);

      if (!reduced) {
        nodes.forEach(n => {
          n.orbitAngle += n.orbitSpeed;
          n.renderX = n.x + Math.cos(n.orbitAngle) * n.orbitRadius;
          n.renderY = n.y + Math.sin(n.orbitAngle) * n.orbitRadius;
        });
      } else {
        nodes.forEach(n => { n.renderX = n.x; n.renderY = n.y; });
      }

      nodes.forEach((n, i) => {
        const ns = 100 + i * NODE_STAGGER;
        n.entranceT = reduced ? 1 : Math.min(1, Math.max(0, (elapsed - ns) / 700));
      });

      // edges
      edges.forEach(e => {
        const src = nodeMap[e.source], tgt = nodeMap[e.target];
        if (!src || !tgt || src.entranceT < 0.3 || tgt.entranceT < 0.3) return;
        const b = getBezier(src, tgt);
        const color = CATEGORY_COLORS[src.category];
        const edgeT = Math.min(src.entranceT, tgt.entranceT);
        const bothAg = src.category === 'agent' && tgt.category === 'agent';
        const hasAg  = src.category === 'agent' || tgt.category === 'agent';
        const alpha = bothAg ? 0.08 : hasAg ? 0.18 : 0.32;
        const lw    = bothAg ? 0.5  : hasAg ? 0.85 : 1.2;
        ctx.globalAlpha = alpha * edgeT;
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sy);
        ctx.quadraticCurveTo(b.cx, b.cy, b.ex, b.ey);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // particles
      if (!reduced) {
        particles.forEach(p => {
          const src = nodeMap[p.edge.source], tgt = nodeMap[p.edge.target];
          if (!src || !tgt || src.entranceT < 0.7 || tgt.entranceT < 0.7) return;
          p.t += p.speed;
          if (p.t > 1) p.t -= 1;
          const b = getBezier(src, tgt);
          const pt = pointOnBezier(b, p.t);
          const color = CATEGORY_COLORS[src.category];
          ctx.save();
          ctx.globalAlpha = 0.65;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // nodes
      nodes.forEach(n => {
        if (n.entranceT <= 0) return;
        const et = easeOut(n.entranceT);
        const offY = (1 - et) * 20;
        const color = CATEGORY_COLORS[n.category];
        const rx = n.renderX, ry = n.renderY + offY;
        const isAg = n.category === 'agent';
        const pulse = isAg ? 1 + Math.sin(pulsePhase + n.orbitAngle) * 0.08 : 1;
        const drawR = n.radius * pulse;

        ctx.globalAlpha = isAg ? et * 0.75 : et;

        if (!isAg) {
          const glowR = drawR * 2.8;
          const grad = ctx.createRadialGradient(rx, ry, drawR * 0.3, rx, ry, glowR);
          grad.addColorStop(0, color + '22');
          grad.addColorStop(1, color + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(rx, ry, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = isAg ? color + '32' : '#181C26';
        ctx.strokeStyle = color + (isAg ? '60' : '80');
        ctx.lineWidth = isAg ? 0.6 : 1.3;
        ctx.beginPath();
        ctx.arc(rx, ry, drawR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!isAg) {
          ctx.save();
          ctx.globalAlpha = et * 0.75;
          drawIcon(ctx, rx, ry, drawR, color, n.category);
          ctx.restore();
        }

        if (n.category === 'specialization') {
          ctx.font = `500 10px "DM Mono", ui-monospace, monospace`;
          ctx.textAlign = 'center';
          ctx.fillStyle = color;
          ctx.globalAlpha = et * 0.85;
          ctx.fillText(n.slash, rx, ry + drawR + 14);
        }
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      // edge fades (fade to surface bg)
      const fadeH = H * 0.18;
      const bg = '#141820';
      let g = ctx.createLinearGradient(0, 0, 0, fadeH);
      g.addColorStop(0, bg); g.addColorStop(1, bg + '00');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, fadeH);
      g = ctx.createLinearGradient(0, H - fadeH, 0, H);
      g.addColorStop(0, bg + '00'); g.addColorStop(1, bg);
      ctx.fillStyle = g; ctx.fillRect(0, H - fadeH, W, fadeH);
    };
    requestAnimationFrame(render);
  };

  makeSwarmNetwork($('#swarm-canvas'));

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
