/* ══════════════════════════════════════════════════════════════
   SPARK AGENT · node-bust avatar
   Pulse-style holographic bust, constructed entirely from nodes.
   No three.js, no GLB download — ships instantly, on-brand for a
   swarm: the avatar is literally emergent from the node field.
   ══════════════════════════════════════════════════════════════ */

(() => {
  const canvas = document.getElementById('avatar-canvas');
  const loadEl = document.getElementById('avatar-loading');
  const stage  = document.getElementById('avatar-stage');
  if (!canvas || !stage) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const ctx = canvas.getContext('2d');

  const rand = (a, b) => Math.random() * (b - a) + a;

  /* ─── bust silhouette path (500×500 coord system, centered) ─ */
  const buildSilhouette = (cx, cy, scale) => {
    const s = scale;
    const p = new Path2D();
    p.moveTo(cx + 0, cy - 230 * s);
    p.bezierCurveTo(cx - 95 * s, cy - 230 * s, cx - 108 * s, cy - 135 * s, cx - 100 * s, cy -  90 * s);
    p.bezierCurveTo(cx -  94 * s, cy -  55 * s, cx -  60 * s, cy -  35 * s, cx -  28 * s, cy -  32 * s);
    p.lineTo(cx -  32 * s, cy +  22 * s);
    p.bezierCurveTo(cx -  90 * s, cy +  38 * s, cx - 185 * s, cy +  58 * s, cx - 220 * s, cy + 108 * s);
    p.lineTo(cx - 232 * s, cy + 220 * s);
    p.lineTo(cx + 232 * s, cy + 220 * s);
    p.lineTo(cx + 220 * s, cy + 108 * s);
    p.bezierCurveTo(cx + 185 * s, cy +  58 * s, cx +  90 * s, cy +  38 * s, cx +  32 * s, cy +  22 * s);
    p.lineTo(cx +  28 * s, cy -  32 * s);
    p.bezierCurveTo(cx +  60 * s, cy -  35 * s, cx +  94 * s, cy -  55 * s, cx + 100 * s, cy -  90 * s);
    p.bezierCurveTo(cx + 108 * s, cy - 135 * s, cx +  95 * s, cy - 230 * s, cx + 0,       cy - 230 * s);
    p.closePath();
    return p;
  };

  /* ─── state ──────────────────────────────────────────────── */
  let W = 0, H = 0, dpr = 1, scale = 1, cx = 0, cy = 0;
  let path = null;
  let nodes = [];
  let veinPaths = [];   // {points, particles}

  const resize = () => {
    dpr = isTouch ? 1 : Math.min(devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);

    cx = W / 2;
    cy = H / 2 + H * 0.02;
    scale = Math.min(W, H) / 540;
    path = buildSilhouette(cx, cy, scale);
    seedNodes();
    seedVeins();
  };

  const seedNodes = () => {
    nodes = [];
    const step = isTouch ? 18 : 11;
    const jitter = step * 0.35;
    for (let x = 0; x < W; x += step) {
      for (let y = 0; y < H; y += step) {
        const px = x + rand(-jitter, jitter);
        const py = y + rand(-jitter, jitter);
        if (!ctx.isPointInPath(path, px, py)) continue;
        nodes.push({
          bx: px, by: py,
          phase: rand(0, Math.PI * 2),
          pSpeed: rand(0.006, 0.018),
          pAmp:   rand(0.5, 1.4),
          r: rand(0.8, 2.0),
          isEdge: false,
          isEye: false,
        });
      }
    }
    // mark edge nodes (near silhouette border)
    const tol = 11;
    const tests = [[tol,0],[-tol,0],[0,tol],[0,-tol],[tol*0.7,tol*0.7],[-tol*0.7,-tol*0.7]];
    for (const n of nodes) {
      for (const [dx, dy] of tests) {
        if (!ctx.isPointInPath(path, n.bx + dx, n.by + dy)) {
          n.isEdge = true;
          n.r = rand(1.3, 2.6);
          break;
        }
      }
    }
    // mark eye clusters (two glowing zones)
    const eyeY = cy - 128 * scale;
    const eyeOffX = 35 * scale;
    const eyeR  = 18 * scale;
    for (const n of nodes) {
      const dxL = n.bx - (cx - eyeOffX), dyL = n.by - eyeY;
      const dxR = n.bx - (cx + eyeOffX), dyR = n.by - eyeY;
      if (Math.sqrt(dxL*dxL + dyL*dyL) < eyeR || Math.sqrt(dxR*dxR + dyR*dyR) < eyeR) {
        n.isEye = true;
        n.r = rand(1.6, 2.8);
      }
    }
  };

  const seedVeins = () => {
    veinPaths = [];
    const s = scale;
    // define bezier vein paths in (x, y) absolute canvas coords
    const veins = [
      // left collarbone
      [[cx -  32 * s, cy +  20 * s], [cx - 120 * s, cy +  60 * s], [cx - 200 * s, cy + 100 * s]],
      // right collarbone
      [[cx +  32 * s, cy +  20 * s], [cx + 120 * s, cy +  60 * s], [cx + 200 * s, cy + 100 * s]],
      // left neck vein
      [[cx -  15 * s, cy -  70 * s], [cx -  40 * s, cy -  30 * s], [cx -  50 * s, cy +  40 * s]],
      // right neck vein
      [[cx +  15 * s, cy -  70 * s], [cx +  40 * s, cy -  30 * s], [cx +  50 * s, cy +  40 * s]],
    ];
    for (const v of veins) {
      const particles = Array.from({ length: 2 }, () => ({
        t: Math.random(),
        speed: rand(0.0035, 0.006),
        size: rand(1.4, 2.2),
      }));
      veinPaths.push({ start: v[0], ctl: v[1], end: v[2], particles });
    }
  };

  resize();
  addEventListener('resize', resize);

  // quickly hide the loading pill since we boot instantly now
  if (loadEl) {
    loadEl.classList.add('done');
    setTimeout(() => loadEl.remove(), 400);
  }
  canvas.classList.add('is-loaded');

  /* ─── cursor for subtle head sway ─────────────────────────── */
  let mx = 0, my = 0;
  if (!isTouch) {
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      mx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      my = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    });
    stage.addEventListener('mouseleave', () => { mx = 0; my = 0; });
  }

  /* ─── bezier helper ───────────────────────────────────────── */
  const bezAt = (a, b, c, t) => {
    const u = 1 - t;
    return {
      x: u*u*a[0] + 2*u*t*b[0] + t*t*c[0],
      y: u*u*a[1] + 2*u*t*b[1] + t*t*c[1],
    };
  };

  /* ─── scan line state ─────────────────────────────────────── */
  const scanState = { y: -0.3, dir: 1, speed: 0.004 };

  /* ─── render loop ─────────────────────────────────────────── */
  let t = 0;
  let swayX = 0, swayY = 0;
  let scaleSway = 1;

  let lastFrame = 0;

const loop = () => {
  requestAnimationFrame(loop);

  const now = performance.now();

  if (isTouch && now - lastFrame < 33) {
    return;
  }

  lastFrame = now;
  t += 0.012;

      // sway + breathing
    const targetRX = mx * 0.06;
    const targetRY = my * 0.03;
    swayX += (targetRX - swayX) * 0.06;
    swayY += (targetRY - swayY) * 0.06;
    scaleSway = 1 + Math.sin(t * 0.35) * 0.006;

    ctx.clearRect(0, 0, W, H);

    // background veil (soft radial behind bust)
    const vg = ctx.createRadialGradient(cx, cy, 20 * scale, cx, cy, 260 * scale);
    vg.addColorStop(0, 'rgba(47,202,148,0.12)');
    vg.addColorStop(0.5, 'rgba(47,202,148,0.04)');
    vg.addColorStop(1, 'rgba(47,202,148,0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // transform for sway + breathing, center on bust
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(swayX * 0.15);
    ctx.scale(scaleSway, scaleSway);
    ctx.translate(-cx, -cy + swayY * 4);

    // scan sweep band (moves top→bottom→top on the head)
    if (!reduced) {
      scanState.y += scanState.speed * scanState.dir;
      if (scanState.y > 0.45) scanState.dir = -1;
      if (scanState.y < -0.35) scanState.dir =  1;
    }
    const scanAbsY = cy + scanState.y * 420 * scale;

    // nodes
    for (const n of nodes) {
      const wobble = reduced ? 0 : Math.sin(t + n.phase) * n.pAmp;
      const wx = n.bx + wobble * Math.cos(n.phase);
      const wy = n.by + wobble * Math.sin(n.phase);

      // proximity to scan band boosts brightness
      const scanBoost = Math.max(0, 1 - Math.abs(wy - scanAbsY) / (60 * scale));
      const sb = scanBoost * 0.6;

      let color, alpha, radius, blur;
      if (n.isEye) {
        const pulse = 0.9 + Math.sin(t * 2 + n.phase) * 0.15;
        color = '#B7FFE0';
        alpha = (0.85 + sb * 0.15) * pulse;
        radius = n.r + Math.sin(t * 2.4) * 0.4;
        blur = 10;
      } else if (n.isEdge) {
        color = '#4DE3A8';
        alpha = 0.65 + sb * 0.3;
        radius = n.r;
        blur = 5;
      } else {
        color = sb > 0.05 ? '#2FCA94' : '#1F8C66';
        alpha = 0.28 + sb * 0.5;
        radius = n.r * 0.85;
        blur = 2 + sb * 4;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.beginPath();
      ctx.arc(wx, wy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // vein particles riding along collarbone + neck paths
    if (!reduced) {
      for (const v of veinPaths) {
        for (const p of v.particles) {
          p.t += p.speed;
          if (p.t > 1) p.t -= 1;
          const pt = bezAt(v.start, v.ctl, v.end, p.t);
          const fade = Math.sin(p.t * Math.PI); // brighter middle
          ctx.fillStyle = '#4DE3A8';
          ctx.globalAlpha = 0.55 + fade * 0.35;
          ctx.shadowColor = '#4DE3A8';
          ctx.shadowBlur = 9;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  loop();
  if (reduced) loop(); // one frame so it renders statically

})();
