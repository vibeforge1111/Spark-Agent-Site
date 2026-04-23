/* ══════════════════════════════════════════════════════════════
   SPARK AGENT · avatar-3d.js
   Renders the Pulse head.glb as the Jarvis avatar centerpiece.
   ══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas  = document.getElementById('avatar-canvas');
const loadEl  = document.getElementById('avatar-loading');
const stage   = document.getElementById('avatar-stage');
if (!canvas || !stage) throw new Error('avatar stage missing');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 0.05, 3.2);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const resize = () => {
  const size = canvas.clientWidth || canvas.offsetWidth || 400;
  renderer.setSize(size, size, false);
};
resize();
addEventListener('resize', resize);

/* ─── LIGHTING (Pulse teal/cyan + iris rim) ─────────────────── */
scene.add(new THREE.AmbientLight(0x2FCA94, 0.55));

const key = new THREE.DirectionalLight(0x4DE3A8, 1.4);
key.position.set(2, 3, 3);
scene.add(key);

const rim = new THREE.DirectionalLight(0xB8A8DC, 0.9);
rim.position.set(-2.5, 0.8, -2);
scene.add(rim);

const top = new THREE.DirectionalLight(0xFFFFFF, 0.35);
top.position.set(0, 4, 1);
scene.add(top);

const underGlow = new THREE.PointLight(0x2FCA94, 1.2, 4);
underGlow.position.set(0, -0.4, 1.2);
scene.add(underGlow);

/* ─── GLB LOAD ──────────────────────────────────────────────── */
let head = null;

const loader = new GLTFLoader();
loader.load(
  './head.glb',
  (gltf) => {
    head = gltf.scene;

    // centre + uniform-scale to fit the canvas
    const box = new THREE.Box3().setFromObject(head);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.35 / maxDim;
    head.position.set(-centre.x * scale, -centre.y * scale + 0.02, -centre.z * scale);
    head.scale.setScalar(scale);

    // Pulse-signature wireframe overlay on every mesh
    const overlays = [];
    head.traverse((obj) => {
      if (obj.isMesh && obj.geometry) {
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x4DE3A8,
          wireframe: true,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
        });
        const wireMesh = new THREE.Mesh(obj.geometry, wireMat);
        wireMesh.scale.setScalar(1.004);
        obj.add(wireMesh);
        overlays.push(wireMat);
      }
    });

    scene.add(head);

    // fade loading indicator out
    if (loadEl) {
      loadEl.classList.add('done');
      setTimeout(() => loadEl.remove(), 500);
    }
    canvas.classList.add('is-loaded');
  },
  (ev) => {
    if (loadEl && ev.total) {
      const pct = Math.min(100, Math.floor((ev.loaded / ev.total) * 100));
      const k = loadEl.querySelector('.al-k');
      if (k) k.textContent = `booting avatar · ${String(pct).padStart(3, '0')}`;
    }
  },
  (err) => {
    console.error('head.glb load failed:', err);
    if (loadEl) {
      const k = loadEl.querySelector('.al-k');
      const detail = (err && (err.message || err.type)) || 'unknown';
      if (k) k.textContent = `avatar · fallback (${detail.slice(0, 40)})`;
      loadEl.classList.add('err');
    }
  }
);

/* ─── MOUSE-FOLLOW ROTATION ─────────────────────────────────── */
let targetRX = 0, targetRY = 0;
if (!isTouch) {
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    targetRY = dx * 0.45;
    targetRX = dy * -0.22;
  });
  stage.addEventListener('mouseleave', () => { targetRX = 0; targetRY = 0; });
}

/* ─── LOOP ──────────────────────────────────────────────────── */
let t = 0;
const loop = () => {
  t += 0.008;
  if (head) {
    const driftY = Math.sin(t * 0.35) * 0.08;
    const driftX = Math.sin(t * 0.5)  * 0.04;
    const gy = targetRY + driftY;
    const gx = targetRX + driftX;
    head.rotation.y += (gy - head.rotation.y) * 0.06;
    head.rotation.x += (gx - head.rotation.x) * 0.06;

    // subtle breathing scale
    const s = head.scale.x;
    const base = s / (1 + Math.sin((t - 0.008) * 0.9) * 0.004);
    const breath = base * (1 + Math.sin(t * 0.9) * 0.004);
    head.scale.setScalar(breath);
  }
  renderer.render(scene, camera);
  if (!reduced) requestAnimationFrame(loop);
};
loop();
