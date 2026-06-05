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
        const cur = parseInt((slLoops.textContent || '27418').replace(/[,\s  ]/g, ''), 10);
        slLoops.textContent = (cur + 1).toLocaleString();
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
    $$('[data-step-node]', stage).forEach(btn => btn.classList.toggle('active', btn.dataset.stepNode === id));
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
    $$('[data-step-node]', stage).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.stepNode;
        setInspector(id);
      });
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
     SWARM CANVAS · calmer mastery map
     ══════════════════════════════════════════════════════════════ */
  const makeSwarmNetwork = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, dpr = 1;
    let skillNodes = [];
    let agentNodes = [];
    let lanes = [];
    let localLinks = [];
    let signalParticles = [];

    const skillNames = [
      'content creation', 'startups', 'sales', 'research',
      'ui/ux', 'trading', 'game dev', 'security',
      'ops', 'writing', 'automation', 'product'
    ];

    const desktopSlots = [
      [0.40, 0.18], [0.62, 0.12], [0.84, 0.19],
      [0.52, 0.34], [0.76, 0.36],
      [0.42, 0.55], [0.64, 0.55], [0.86, 0.58],
      [0.52, 0.76], [0.74, 0.78],
      [0.92, 0.34], [0.40, 0.34],
    ];
    const mobileSlots = [
      [0.25, 0.23], [0.56, 0.19],
      [0.40, 0.34], [0.68, 0.36],
      [0.24, 0.47], [0.55, 0.50],
      [0.73, 0.58], [0.36, 0.62],
      [0.62, 0.70], [0.26, 0.78],
      [0.50, 0.84], [0.72, 0.84],
    ];

    const stableRand = (seed) => {
      const n = Math.sin(seed * 127.1) * 43758.5453123;
      return n - Math.floor(n);
    };
    const hexToRgb = (hex) => {
      const clean = hex.replace('#', '').trim();
      const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
      };
    };
    const alpha = (hex, a) => {
      const c = hexToRgb(hex || '#2FCA94');
      return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
    };
    const cssVar = (name, fallback) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    const isLightTheme = () => document.documentElement.getAttribute('data-theme') === 'light';

    const buildLayout = () => {
      const compact = W < 620;
      const slots = compact ? mobileSlots : desktopSlots;
      const font = compact ? '10px' : '11px';
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `600 ${font} "DM Mono", ui-monospace, monospace`;

      skillNodes = skillNames.map((label, i) => {
        const slot = slots[i];
        const textW = ctx.measureText(label).width;
        const padX = compact ? 11 : 13;
        const w = Math.ceil(textW + padX * 2 + 13);
        const h = compact ? 29 : 32;
        const x = Math.min(Math.max(slot[0] * W, w / 2 + 8), W - w / 2 - 12);
        const y = Math.min(Math.max(slot[1] * H, h / 2 + 10), H - h / 2 - 12);
        return {
          id: i,
          label,
          x,
          y,
          w,
          h,
          hue: i % 4 === 0 ? '#2FCA94' : i % 4 === 1 ? '#B8A8DC' : i % 4 === 2 ? '#D8C868' : '#7EA7FF',
        };
      });
      ctx.restore();

      agentNodes = skillNodes.flatMap((skill, skillIndex) => {
        const count = compact ? 2 : 3;
        return Array.from({ length: count }, (_, localIndex) => {
          const seed = skillIndex * 10 + localIndex + 1;
          const side = localIndex % 2 === 0 ? -1 : 1;
          const rx = (compact ? 38 : 54) + stableRand(seed) * (compact ? 24 : 44);
          const ry = (compact ? 24 : 34) + stableRand(seed + 4) * (compact ? 20 : 36);
          return {
            skill,
            x: Math.min(Math.max(skill.x + side * rx, 12), W - 12),
            y: Math.min(Math.max(skill.y + (localIndex - 1) * ry * 0.62, 14), H - 14),
            r: compact ? 2.8 : 3.5,
            phase: stableRand(seed + 8) * Math.PI * 2,
            speed: 0.00035 + stableRand(seed + 12) * 0.00025,
          };
        });
      });

      lanes = [
        [0, 1], [1, 2], [3, 4], [5, 6], [6, 7], [8, 9], [4, 10], [3, 11],
        [0, 3], [2, 10], [5, 8], [7, 11]
      ].map(([a, b]) => ({ a: skillNodes[a], b: skillNodes[b] })).filter(l => l.a && l.b);

      localLinks = [];
      skillNodes.forEach(skill => {
        const agents = agentNodes.filter(agent => agent.skill === skill);
        for (let i = 0; i < agents.length - 1; i++) {
          localLinks.push({ a: agents[i], b: agents[i + 1], skill });
        }
      });

      signalParticles = [
        ...lanes.map((lane, i) => ({
          type: 'lane',
          lane,
          t: stableRand(i + 21),
          speed: 0.00018 + stableRand(i + 31) * 0.00016,
          hue: i % 3 === 0 ? lane.a.hue : lane.b.hue,
        })),
        ...agentNodes.filter((_, i) => i % (compact ? 3 : 4) === 0).map((agent, i) => ({
          type: 'spoke',
          agent,
          t: stableRand(i + 61),
          speed: 0.00032 + stableRand(i + 71) * 0.00016,
          hue: agent.skill.hue,
        })),
      ];
    };

    const resizeSN = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      buildLayout();
    };

    const readTheme = () => ({
      bg: cssVar('--bg', '#0E1018'),
      surface: cssVar('--surface', '#181C26'),
      text: cssVar('--text-bright', '#FFFFFF'),
      muted: cssVar('--text-secondary', '#A4ACB8'),
      accent: cssVar('--accent', '#2FCA94'),
      light: isLightTheme(),
    });
    let theme = readTheme();
    const themeObs = new MutationObserver(() => { theme = readTheme(); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    resizeSN();
    addEventListener('resize', resizeSN);

    const entranceStart = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const lanePoint = (lane, t, bend) => {
      const mx = (lane.a.x + lane.b.x) / 2;
      const my = (lane.a.y + lane.b.y) / 2 + bend;
      const u = 1 - t;
      return {
        x: u * u * lane.a.x + 2 * u * t * mx + t * t * lane.b.x,
        y: u * u * lane.a.y + 2 * u * t * my + t * t * lane.b.y,
      };
    };

    const render = (now) => {
      requestAnimationFrame(render);
      const elapsed = now - entranceStart;
      const appear = reduced ? 1 : easeOut(Math.min(1, elapsed / 900));
      const drift = reduced ? 0 : Math.sin(now * 0.00028) * 8;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, W, H);

      const dotColor = theme.light ? 'rgba(24, 120, 88, 0.09)' : 'rgba(47, 202, 148, 0.055)';
      ctx.fillStyle = dotColor;
      for (let gx = 0; gx < W; gx += 42) {
        for (let gy = 0; gy < H; gy += 42) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      ctx.save();
      ctx.translate(drift, reduced ? 0 : Math.cos(now * 0.0002) * 5);

      lanes.forEach((lane, i) => {
        const bend = (i % 2 === 0 ? 1 : -1) * Math.min(62, W * 0.06);
        const mx = (lane.a.x + lane.b.x) / 2;
        const my = (lane.a.y + lane.b.y) / 2;
        ctx.globalAlpha = appear * (theme.light ? 0.17 : 0.28);
        ctx.strokeStyle = alpha(theme.accent, 1);
        ctx.lineWidth = i < 8 ? 1.15 : 0.75;
        ctx.beginPath();
        ctx.moveTo(lane.a.x, lane.a.y);
        ctx.quadraticCurveTo(mx, my + bend, lane.b.x, lane.b.y);
        ctx.stroke();
      });

      localLinks.forEach(link => {
        ctx.globalAlpha = appear * (theme.light ? 0.18 : 0.25);
        ctx.strokeStyle = alpha(link.skill.hue, 1);
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(link.a.x, link.a.y);
        ctx.lineTo(link.b.x, link.b.y);
        ctx.stroke();
      });

      agentNodes.forEach(agent => {
        const wobble = reduced ? 0 : Math.sin(now * agent.speed + agent.phase) * 2.2;
        const x = agent.x + wobble;
        const y = agent.y + wobble * 0.6;
        ctx.globalAlpha = appear * (theme.light ? 0.22 : 0.32);
        ctx.strokeStyle = alpha(agent.skill.hue, 1);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(agent.skill.x, agent.skill.y);
        ctx.stroke();
        const pulse = reduced ? 1 : 1 + Math.sin(now * 0.002 + agent.phase) * 0.22;
        ctx.globalAlpha = appear * (theme.light ? 0.68 : 0.84);
        ctx.fillStyle = alpha(agent.skill.hue, theme.light ? 0.62 : 0.82);
        ctx.shadowColor = alpha(agent.skill.hue, theme.light ? 0.16 : 0.38);
        ctx.shadowBlur = theme.light ? 4 : 8;
        ctx.beginPath();
        ctx.arc(x, y, agent.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!reduced) {
        signalParticles.forEach((particle, i) => {
          particle.t += particle.speed;
          if (particle.t > 1) particle.t -= 1;
          let pt;
          if (particle.type === 'lane') {
            const laneIndex = lanes.indexOf(particle.lane);
            const bend = (laneIndex % 2 === 0 ? 1 : -1) * Math.min(62, W * 0.06);
            pt = lanePoint(particle.lane, particle.t, bend);
          } else {
            const agent = particle.agent;
            const wobble = Math.sin(now * agent.speed + agent.phase) * 2.2;
            const ax = agent.x + wobble;
            const ay = agent.y + wobble * 0.6;
            pt = {
              x: ax + (agent.skill.x - ax) * particle.t,
              y: ay + (agent.skill.y - ay) * particle.t,
            };
          }
          const size = particle.type === 'lane' ? 2.3 : 1.6;
          ctx.save();
          ctx.globalAlpha = appear * (theme.light ? 0.58 : 0.74) * (0.65 + Math.sin(now * 0.003 + i) * 0.2);
          ctx.shadowColor = alpha(particle.hue, theme.light ? 0.24 : 0.62);
          ctx.shadowBlur = particle.type === 'lane' ? 12 : 8;
          ctx.fillStyle = alpha(particle.hue, 1);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      skillNodes.forEach((skill, i) => {
        const t = reduced ? 1 : easeOut(Math.min(1, Math.max(0, (elapsed - i * 45) / 700)));
        const x = skill.x - skill.w / 2;
        const y = skill.y - skill.h / 2;
        const ring = reduced ? 0 : Math.sin(now * 0.0014 + i) * 0.5 + 0.5;
        ctx.globalAlpha = appear * t * (theme.light ? 0.10 : 0.18) * ring;
        ctx.strokeStyle = alpha(skill.hue, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x - 8 - ring * 5, y - 6 - ring * 4, skill.w + 16 + ring * 10, skill.h + 12 + ring * 8, 11);
        ctx.stroke();

        ctx.globalAlpha = appear * t;
        ctx.shadowColor = alpha(skill.hue, theme.light ? 0.12 : 0.28);
        ctx.shadowBlur = theme.light ? 8 : 18;
        ctx.fillStyle = theme.light ? 'rgba(255,255,255,0.76)' : 'rgba(14, 16, 24, 0.72)';
        ctx.strokeStyle = alpha(skill.hue, theme.light ? 0.36 : 0.48);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, skill.w, skill.h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = alpha(skill.hue, theme.light ? 0.86 : 1);
        ctx.beginPath();
        ctx.arc(x + 13, skill.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = theme.light ? '#17201B' : '#F7FFF9';
        ctx.font = `600 ${W < 620 ? 10 : 11}px "DM Mono", ui-monospace, monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.label, x + 23, skill.y + 0.5);
      });

      ctx.globalAlpha = 1;
      ctx.restore();

      const fadeH = H * 0.22;
      let g = ctx.createLinearGradient(0, 0, 0, fadeH);
      g.addColorStop(0, theme.bg); g.addColorStop(1, alpha(theme.bg, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, fadeH);
      g = ctx.createLinearGradient(0, H - fadeH, 0, H);
      g.addColorStop(0, alpha(theme.bg, 0)); g.addColorStop(1, theme.bg);
      ctx.fillStyle = g; ctx.fillRect(0, H - fadeH, W, fadeH);

      const fadeW = W * 0.15;
      g = ctx.createLinearGradient(0, 0, fadeW, 0);
      g.addColorStop(0, theme.bg); g.addColorStop(1, alpha(theme.bg, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, fadeW, H);
      g = ctx.createLinearGradient(W - fadeW, 0, W, 0);
      g.addColorStop(0, alpha(theme.bg, 0)); g.addColorStop(1, theme.bg);
      ctx.fillStyle = g; ctx.fillRect(W - fadeW, 0, fadeW, H);

      const cGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.38);
      cGrad.addColorStop(0, alpha(theme.bg, theme.light ? 0.52 : 0.36));
      cGrad.addColorStop(0.6, alpha(theme.bg, theme.light ? 0.18 : 0.10));
      cGrad.addColorStop(1, alpha(theme.bg, 0));
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
  const ALLOWED_THEMES = new Set(['light', 'dark']);
  const saved = localStorage.getItem('spark-theme');
  if (saved && ALLOWED_THEMES.has(saved)) document.documentElement.dataset.theme = saved;
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
