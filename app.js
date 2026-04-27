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

  // 2. LIVING SPEC CARD · mastery bar fill + countdown
  const spCountdown = $('#sp-countdown');

  // fill mastery bars once the card is on screen
  const masteries = $$('.mastery');
  setTimeout(() => {
    masteries.forEach((el, i) => {
      setTimeout(() => el.classList.add('is-filled'), i * 180);
    });
  }, 1400);

  // recursive loop strip · active step cycles, loops counter increments
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

  const runlog = $('#runlog-list');
  if (runlog && !reduced) {
    const events = [
      ['04:12', '/xcontent-virality', 'benchmark passed +0.4'],
      ['04:10', 'thread_score_v3', 'tool kept after 12 evals'],
      ['04:07', 'memory', 'launch strategy salience raised'],
      ['04:03', '/security-audits', 'false-positive rate dropped 8%'],
      ['03:58', 'browser_probe', 'retired after weak score'],
      ['03:51', '/code-refactor', 'rubric promoted to v2.4'],
    ];
    let head = 0;
    setInterval(() => {
      head = (head + 1) % events.length;
      const visible = [0, 1, 2].map(i => events[(head + i) % events.length]);
      runlog.innerHTML = visible.map((event, i) => (
        `<li${i === 0 ? ' class="active"' : ''}><span>${event[0]}</span><strong>${event[1]}</strong> ${event[2]}</li>`
      )).join('');
    }, 2600);
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
  const inspectorData = {
    input: {
      title: 'User message',
      node: 'IN',
      score: '1.00',
      latency: '0.1s',
      seen: 'Telegram message, user profile, and the active mission constraints enter the run.',
      learned: 'Shorter task framing improved downstream scoring, so Spark kept the normalized prompt shape.',
    },
    memory: {
      title: 'Memory recall',
      node: 'MEM',
      score: '0.86',
      latency: '0.4s',
      seen: 'Six high-salience memories, recent launches, and the user preference for terse tactical replies.',
      learned: 'Older launch notes were useful again, so their decay was slowed for this domain chip.',
    },
    brain: {
      title: 'Reason + score',
      node: 'LLM',
      score: '0.91',
      latency: '2.4s',
      seen: 'User intent, recalled memory, chip guidance, and the latest benchmark rubric.',
      learned: 'Third pass produced a clearer answer, so this scoring rubric was kept for the next run.',
    },
    chip: {
      title: 'Domain chip',
      node: 'CHIP',
      score: '0.88',
      latency: '0.7s',
      seen: 'Virality signals, hook patterns, anti-clickbait rules, and examples that passed prior evals.',
      learned: 'The chip promoted a sharper opening-hook test after beating yesterday by 0.4 points.',
    },
    output: {
      title: 'Send reply',
      node: 'OUT',
      score: '0.94',
      latency: '0.2s',
      seen: 'Final response, delivery channel constraints, and safety checks before sending.',
      learned: 'Delivery stayed under the preferred length, so the compact output template remained active.',
    },
  };

  const setInspector = (id) => {
    const data = inspectorData[id];
    if (!stage || !data) return;
    $$('.board-node', stage).forEach(node => node.classList.toggle('is-selected', node.dataset.node === id));
    const setText = (sel, text) => {
      const el = $(sel);
      if (el) el.textContent = text;
    };
    setText('#bi-title', data.title);
    setText('#bi-node', data.node);
    setText('#bi-score', data.score);
    setText('#bi-latency', data.latency);
    setText('#bi-seen', data.seen);
    setText('#bi-learned', data.learned);
  };

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
      node.addEventListener('click', () => setInspector(node.dataset.node));
      node.addEventListener('focus', () => setInspector(node.dataset.node));
    });
  };

  requestAnimationFrame(() => { drawCables(); setupDrag(); });
  addEventListener('resize', drawCables);

  /* ══════════════════════════════════════════════════════════════
     THE BUILD · brick-stack drop-in assembly on scroll-into-view
     Each brick carries data-delay · JS copies it onto a CSS var
     and flips the stage to .is-in when visible.
     ══════════════════════════════════════════════════════════════ */
  const buildStage = $('#build-stage');
  if (buildStage) {
    const bricks = $$('.brick', buildStage);
    bricks.forEach((b, i) => {
      b.style.setProperty('--bd', (parseInt(b.dataset.delay || '0', 10)) + 'ms');
      // inject a connector wire between each brick except the last one
      if (i < bricks.length - 1) {
        const wire = document.createElement('span');
        wire.className = 'brick-wire';
        b.appendChild(wire);
      }
    });
    if (reduced) {
      buildStage.classList.add('is-in');
    } else {
      const bObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            buildStage.classList.add('is-in');
            bObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      bObs.observe(buildStage);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     MARQUEE · build module tiles
     ══════════════════════════════════════════════════════════════ */
  const mq = $('#marquee-track');
  if (mq) {
    const tiles = [
      { slug: 'memory',       tier: 'free', line: 'never forgets who you are' },
      { slug: 'telegram',     tier: 'free', line: 'in your pocket, on your terms' },
      { slug: 'discord',      tier: 'free', line: 'lives in your server' },
      { slug: 'browser',      tier: 'free', line: 'sees only what you show it' },
      { slug: 'researcher',   tier: 'free', line: 'every answer, with the work shown' },
      { slug: 'voice',        tier: 'free', line: 'talks back when you ask' },
      { slug: 'x',            tier: 'free', line: 'posts in your voice, not a bot' },
      { slug: 'calendar',     tier: 'free', line: 'books like you would' },
      { slug: 'gmail',        tier: 'free', line: 'drafts like you taught it' },
      { slug: 'github',       tier: 'free', line: 'ships code with your fingerprints' },
      { slug: 'h70-corpus',   tier: 'pro',  line: '593 expert skills, unlocked' },
      { slug: 'orchestrator', tier: 'pro',  line: 'claude + gpt + gemini, orchestrated' },
      { slug: 'memory-sync',  tier: 'pro',  line: 'same context, every device you own' },
      { slug: 'security',     tier: 'pro',  line: 'red-teams its own output' },
      { slug: 'growth',       tier: 'pro',  line: 'tests your hooks before you ship' },
      { slug: 'ops',          tier: 'pro',  line: 'runs the schedule you never keep' },
      { slug: 'trading',      tier: 'pro',  line: 'reads markets, graded on wins' },
      { slug: 'yours',        tier: 'free', line: 'build your own, the format is open' },
    ];
    const make = () => tiles.map(t =>
      `<span class="marquee-tile ${t.tier}" tabindex="0">
        <span class="mt-slash">/</span><span class="mt-slug">${t.slug}</span>
        <span class="mt-sep">·</span>
        <span class="mt-line">${t.line}</span>
      </span>`
    ).join('');
    mq.innerHTML = make() + make();
  }

  /* ══════════════════════════════════════════════════════════════
     SWARM CANVAS · port of sparkswarm.ai's WaitlistNetworkCanvas
     ══════════════════════════════════════════════════════════════ */
  const makeSwarmNetwork = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* Direct port of sparkswarm.ai/components/WaitlistNetworkCanvas.
       80 agents + 10 specs + 8 paths + 10 insights, force-directed layout,
       camera drift, edge particles, side fades, center radial dim. */

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
      'bolt-finder','core-drift','dusk-agent','edge-pulse','fern-logic','grid-hawk',
      'halo-scan','ink-tracer','jest-probe','knox-shield','leaf-engine','myth-solver',
      'neon-spark','opal-miner','pine-runner','quill-writer','rust-guard','silk-thread',
      'tusk-mover','umber-trace','vine-climber','wave-rider','yarn-weaver','zinc-alloy',
      'aura-field','brine-deep','clay-former','dawn-sweep','elm-branch','flint-coder',
      'glyph-reader','helm-steer'
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
      'churn-predictor','prompt-patterns','viral-loops','blue-green-deploy',
      'threat-modeling','drift-detection'
    ];

    const rawNodes = [
      ...agentNames.map((slash, i) => ({ id: 'a'+i, slash, category: 'agent' })),
      ...specNames.map((slash, i) => ({ id: 's'+i, slash, category: 'specialization' })),
      ...pathNames.map((slash, i) => ({ id: 'p'+i, slash, category: 'path' })),
      ...insightNames.map((slash, i) => ({ id: 'i'+i, slash, category: 'insight' })),
    ];
    const nodeMap = {};
    rawNodes.forEach(n => { nodeMap[n.id] = n; });

    const byCat = c => rawNodes.filter(n => n.category === c);
    const agents = byCat('agent');
    const specs = byCat('specialization');
    const paths = byCat('path');
    const insights = byCat('insight');

    const edges = [];
    agents.forEach(a => {
      const k = 1 + (Math.random() < 0.6 ? 1 : 0) + (Math.random() < 0.2 ? 1 : 0);
      const picked = new Set();
      for (let i = 0; i < k; i++) {
        const s = specs[Math.floor(Math.random() * specs.length)];
        if (!picked.has(s.id)) { picked.add(s.id); edges.push({ source: a.id, target: s.id }); }
      }
    });
    specs.forEach(s => {
      paths.forEach(p => { if (Math.random() < 0.4) edges.push({ source: s.id, target: p.id }); });
      insights.forEach(i => { if (Math.random() < 0.25) edges.push({ source: s.id, target: i.id }); });
    });
    paths.forEach(p => {
      insights.forEach(i => { if (Math.random() < 0.22) edges.push({ source: p.id, target: i.id }); });
    });
    for (let i = 0; i < specs.length; i++) {
      const j = (i + 3 + Math.floor(Math.random() * 3)) % specs.length;
      if (j !== i) edges.push({ source: specs[i].id, target: specs[j].id });
    }
    for (let i = 0; i < 12; i++) {
      const a = agents[Math.floor(Math.random() * agents.length)];
      const b = agents[Math.floor(Math.random() * agents.length)];
      if (a.id !== b.id) edges.push({ source: a.id, target: b.id });
    }

    const connCount = {};
    rawNodes.forEach(n => { connCount[n.id] = 0; });
    edges.forEach(e => {
      connCount[e.source] = (connCount[e.source] || 0) + 1;
      connCount[e.target] = (connCount[e.target] || 0) + 1;
    });

    const nodes = rawNodes.map((n, i) => {
      const cc = connCount[n.id] || 1;
      const baseR = n.category === 'agent'          ? 8 + Math.min(cc, 3) * 1.5
                  : n.category === 'specialization' ? 28 + cc * 1.2
                  : n.category === 'path'           ? 18 + cc * 1
                  :                                    12 + cc * 0.8;
      const angle = (i / rawNodes.length) * Math.PI * 2 + Math.random() * 0.3;
      const r0 = 300 + Math.random() * 200;
      return Object.assign(n, {
        x: Math.cos(angle) * r0,
        y: Math.sin(angle) * r0,
        vx: 0, vy: 0,
        renderX: 0, renderY: 0,
        radius: baseR,
        orbitAngle: rand(0, Math.PI * 2),
        orbitRadius: n.category === 'agent' ? 1.5 + Math.random() * 3 : 3 + Math.random() * 5,
        orbitSpeed: (0.0002 + Math.random() * 0.0002) * (Math.random() > 0.5 ? 1 : -1),
        entranceT: 0,
        connCount: cc,
      });
    });

    /* Force-directed layout — runs once, gives organic clustering.
       Tuned for more spread: stronger repulsion + longer ideal edge. */
    const runForceLayout = (iterations) => {
      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const f = 16000 / (dist * dist);
            const fx = (dx/dist) * f, fy = (dy/dist) * f;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }
        edges.forEach(e => {
          const a = nodeMap[e.source], b = nodeMap[e.target];
          if (!a || !b) return;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const f = (dist - 200) * 0.012;
          const fx = (dx/dist) * f, fy = (dy/dist) * f;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        });
        nodes.forEach(n => { n.vx -= n.x * 0.0008; n.vy -= n.y * 0.0008; });
        nodes.forEach(n => { n.vx *= 0.88; n.vy *= 0.88; n.x += n.vx; n.y += n.vy; });
      }
      nodes.forEach(n => { n.renderX = n.x; n.renderY = n.y; n.vx = 0; n.vy = 0; });
    };
    runForceLayout(260);

    let W = 0, H = 0, dpr = 1;
    const resizeSN = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
    };

    const particles = reduced ? [] : edges
      .filter(e => !(nodeMap[e.source].category === 'agent' && nodeMap[e.target].category === 'agent'))
      .map(e => ({ edge: e, t: Math.random(), speed: 0.0008 + Math.random() * 0.001 }));

    const cam = { x: 0, y: 0, angle: Math.random() * Math.PI * 2 };
    const CAM_SPEED = 0.00006;

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

    const readThemeBg = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      return v || '#0E1018';
    };
    let cachedBg = readThemeBg();
    const themeObs = new MutationObserver(() => { cachedBg = readThemeBg(); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    resizeSN();
    addEventListener('resize', resizeSN);

    const entranceStart = performance.now();
    const NODE_STAGGER = reduced ? 0 : 50;
    let pulsePhase = 0;

    const render = (now) => {
      requestAnimationFrame(render);
      const elapsed = now - entranceStart;
      pulsePhase = now * 0.002;
      const bg = cachedBg;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

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
        cam.x = Math.cos(cam.angle)         * 25;
        cam.y = Math.sin(cam.angle * 0.7)   * 18;
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
        const ns = 150 + i * NODE_STAGGER;
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
        const alpha = bothAg ? 0.08 : hasAg ? 0.15 : 0.3;
        const lw    = bothAg ? 0.5  : hasAg ? 0.8 : 1.2;
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
          ctx.globalAlpha = 0.6;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
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
        const pulse = isAg ? 1 + Math.sin(pulsePhase + n.orbitAngle) * 0.06 : 1;
        const drawR = n.radius * pulse;

        ctx.globalAlpha = isAg ? et * 0.7 : et;

        if (!isAg) {
          const glowR = drawR * 2.8;
          const grad = ctx.createRadialGradient(rx, ry, drawR * 0.3, rx, ry, glowR);
          grad.addColorStop(0, color + '18');
          grad.addColorStop(1, color + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(rx, ry, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = isAg ? color + '30' : '#181C26';
        ctx.strokeStyle = color + (isAg ? '50' : '70');
        ctx.lineWidth = isAg ? 0.6 : 1.2;
        ctx.beginPath();
        ctx.arc(rx, ry, drawR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!isAg) {
          ctx.save();
          ctx.globalAlpha = et * 0.7;
          drawIcon(ctx, rx, ry, drawR, color, n.category);
          ctx.restore();
        }

        if (!isAg) {
          const fontSize = n.category === 'specialization' ? 10 : 8;
          ctx.font = `500 ${fontSize}px "DM Mono", ui-monospace, monospace`;
          ctx.textAlign = 'center';
          ctx.fillStyle = color;
          ctx.globalAlpha = et * 0.85;
          ctx.fillText(n.slash, rx, ry + drawR + 14);
        }
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      // edge fades — top/bottom + left/right
      const fadeH = H * 0.22;
      let g = ctx.createLinearGradient(0, 0, 0, fadeH);
      g.addColorStop(0, bg); g.addColorStop(1, bg + '00');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, fadeH);
      g = ctx.createLinearGradient(0, H - fadeH, 0, H);
      g.addColorStop(0, bg + '00'); g.addColorStop(1, bg);
      ctx.fillStyle = g; ctx.fillRect(0, H - fadeH, W, fadeH);

      const fadeW = W * 0.15;
      g = ctx.createLinearGradient(0, 0, fadeW, 0);
      g.addColorStop(0, bg); g.addColorStop(1, bg + '00');
      ctx.fillStyle = g; ctx.fillRect(0, 0, fadeW, H);
      g = ctx.createLinearGradient(W - fadeW, 0, W, 0);
      g.addColorStop(0, bg + '00'); g.addColorStop(1, bg);
      ctx.fillStyle = g; ctx.fillRect(W - fadeW, 0, fadeW, H);

      // center radial dim — for card readability
      const cGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.38);
      cGrad.addColorStop(0,   bg + '80');
      cGrad.addColorStop(0.6, bg + '30');
      cGrad.addColorStop(1,   bg + '00');
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, W, H);
    };
    requestAnimationFrame(render);
  };

  makeSwarmNetwork($('#swarm-canvas'));

  /* ══════════════════════════════════════════════════════════════
     IRIS REVEAL · "while you sleep" · plays once on scroll-into-view
     ══════════════════════════════════════════════════════════════ */
  const sleepReveal = $('#sleep-reveal');
  if (sleepReveal && !reduced) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          sleepReveal.classList.add('is-open');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    revealObs.observe(sleepReveal);
  } else if (sleepReveal) {
    sleepReveal.classList.add('is-open');
  }

  /* ══════════════════════════════════════════════════════════════
     INFINITY LOOP VIZ · counter + active anchor cycle
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

  // hero primary cta — scroll to install section
  const ctaInstall = $('#cta-install');
  if (ctaInstall) {
    ctaInstall.addEventListener('click', (e) => {
      e.preventDefault();
      $('#install')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // install options — click card to copy command
  const activateInstallPanel = (target) => {
    const normalized = target === 'windows' ? 'windows' : 'unix';
    $$('[data-install-target]').forEach(tab => {
      const active = tab.dataset.installTarget === normalized;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    $$('[data-install-panel]').forEach(panel => {
      const active = panel.dataset.installPanel === normalized;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
      const rec = $('.install-rec', panel);
      if (rec) rec.textContent = active ? 'recommended for this device' : 'alternate installer';
    });
    const label = $('[data-install-mode-label]');
    if (label) label.textContent = normalized === 'windows' ? 'Detected: Windows' : 'Detected: Mac / Linux / WSL';
  };

  const detectInstallPanel = () => {
    const nav = navigator;
    const platform = [
      nav.userAgentData?.platform,
      nav.platform,
      nav.userAgent,
    ].filter(Boolean).join(' ').toLowerCase();
    return platform.includes('win') ? 'windows' : 'unix';
  };

  if ($('[data-install-switcher]')) {
    activateInstallPanel(detectInstallPanel());
    $$('[data-install-target]').forEach(tab => {
      tab.addEventListener('click', () => activateInstallPanel(tab.dataset.installTarget));
    });
  }

  $$('.install-option').forEach(opt => {
    opt.addEventListener('click', async () => {
      const value = opt.dataset.copyValue || '';
      if (!value) return;
      await copyText(value);
      opt.classList.add('copied');
      setTimeout(() => opt.classList.remove('copied'), 1800);
    });
  });

  if (window.location.pathname.replace(/\/$/, '') === '/install') {
    window.requestAnimationFrame(() => {
      $('#install')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }

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
