import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PHONE, LAPTOP, LOGO } from './assets.js';
import { CHAPTERS, drawPhone, drawLaptop } from './screens.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage = document.getElementById('stage');
const canvas = document.getElementById('gl');
const hint = document.getElementById('hint');

// ---------- render ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); scene.add(key);
const rim = new THREE.PointLight(0x36c46c, 6, 8); rim.position.set(-2.2, 1.6, -1.8); scene.add(rim);

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
const controls = new OrbitControls(camera, canvas);
controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.6; controls.minPolarAngle = Math.PI * 0.28; controls.maxPolarAngle = Math.PI * 0.52;
controls.minAzimuthAngle = -1.1; controls.maxAzimuthAngle = 1.1;
// en pantallas táctiles el arrastre debe desplazar la página, no girar el modelo
const touch = matchMedia('(pointer: coarse)').matches;
if (touch) { controls.enableRotate = false; canvas.style.touchAction = 'pan-y'; hint.textContent = ''; }
controls.addEventListener('start', () => { hint.style.opacity = '0'; });

// piso: sombra de contacto + anillo holográfico
function radialTex(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(0,0,0,.75)'], [0.55, 'rgba(0,0,0,.25)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.001; scene.add(shadow);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x36c46c, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
const ring = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.565, 128, 1, 0, Math.PI * 1.6), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring);
const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.757, 128), new THREE.MeshBasicMaterial({ color: 0x26332c, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.002; scene.add(ring2);

// ---------- pantallas (texturas vivas) ----------
const logo = new Image(); logo.src = LOGO;
function screenTex(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return { c, ctx: c.getContext('2d'), tex };
}
const PH = { lw: 320, lh: Math.round(320 / 0.4631) }; PH.s = screenTex(PH.lw * 2, PH.lh * 2);
const LP = { lw: 1280, lh: 800 }; LP.s = screenTex(1600, 1000);

// ---------- modelos GLB ----------
const loader = new GLTFLoader();
const b64 = (s) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0)).buffer;
const load = (s) => new Promise((res, rej) => loader.parse(b64(s), '', res, rej));
const devices = {};

Promise.all([load(PHONE), load(LAPTOP)]).then(([p, l]) => {
  const phone = new THREE.Group(); phone.add(p.scene);
  p.scene.position.y = 0.92; p.scene.rotation.set(-0.08, -0.5, 0);
  attachScreen(p.scene, PH.s.tex);
  const lap = new THREE.Group(); lap.add(l.scene);
  l.scene.rotation.y = -0.42; l.scene.position.set(0, 0, 0.1); l.scene.scale.setScalar(0.92);
  attachScreen(l.scene, LP.s.tex);
  devices.phone = { group: phone, target: new THREE.Vector3(0, 0.88, 0), dist: 3.9, lid: null };
  devices.laptop = { group: lap, target: new THREE.Vector3(0, 0.62, 0), dist: 5.9, lid: l.scene.getObjectByName('Lid') };
  devices.laptop.lidOpen = devices.laptop.lid.rotation.x;
  [phone, lap].forEach((g) => { g.scale.setScalar(0.0001); scene.add(g); });
  setDevice('phone', true);
  stage.classList.add('ready');
});
function attachScreen(root, tex) {
  root.traverse((o) => { if (o.isMesh && o.name.startsWith('Screen')) o.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); });
}

// ---------- estado ----------
let current = null, prev = null, switchAt = 0, chapter = 0, chStart = 0, clock = 0;
const ENTER = 0.75, LID = 1.3;
function setDevice(name, instant) {
  if (current === name) return;
  prev = current; current = name; switchAt = clock;
  if (instant) switchAt = clock - ENTER;
  const d = devices[name];
  if (d.lid) d.lid.rotation.x = Math.PI / 2 - 0.04; // tapa cerrada; se abre al entrar
  jump(0, name === 'laptop' && !instant ? ENTER + LID * 0.7 : 0.3);
  document.querySelectorAll('[data-device]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.device === name)));
}
function jump(i, delay = 0) { chapter = i; chStart = clock + delay; renderChips(); }
document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => setDevice(b.dataset.device)));

const chipsEl = document.getElementById('chips');
CHAPTERS.forEach((c, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = c.label; b.className = 'chip';
  b.addEventListener('click', () => jump(i)); chipsEl.appendChild(b);
});
function renderChips() { [...chipsEl.children].forEach((b, i) => b.setAttribute('aria-current', String(i === chapter))); }
const progEl = document.getElementById('prog');

// ---------- loop ----------
const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const easeBack = (x) => { x = Math.min(1, Math.max(0, x)); const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const camPos = new THREE.Vector3(), tgt = new THREE.Vector3(0, 0.8, 0);
let last = performance.now(), camInit = false;

function resize() {
  const r = stage.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
  if (current) {
    const d = devices[current], since = clock - switchAt;
    // entrada del nuevo equipo / salida del anterior
    d.group.scale.setScalar(Math.max(0.0001, easeBack(since / ENTER)));
    if (prev) devices[prev].group.scale.setScalar(Math.max(0.0001, 1 - easeOut(since / 0.35)));
    if (d.lid) d.lid.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.04, devices.laptop.lidOpen, easeOut((since - ENTER * 0.6) / LID));
    // flotación
    const fl = reduce ? 0 : Math.sin(clock * 1.2) * 0.035;
    d.group.position.y = fl; d.group.rotation.y = reduce ? 0 : Math.sin(clock * 0.5) * (touch ? 0.22 : 0.06);
    shadow.scale.setScalar(current === 'laptop' ? 1.15 : 0.7);
    shadow.material.opacity = document.documentElement.dataset.theme === 'light' ? 0.45 : 1;
    // cámara hacia el encuadre del equipo
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    if (!camInit) { camera.position.set(0.4, 1.7, d.dist); controls.target.copy(d.target); camInit = true; }
    else {
      controls.target.lerp(d.target, 0.06);
      // en pantallas angostas se aleja la cámara para que el equipo entre completo
      const hHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
      const need = current === 'laptop' ? 1.55 / hHalf : 0.62 / hHalf;
      const dist = Math.max(d.dist, need);
      const len = offset.length(); offset.setLength(THREE.MathUtils.lerp(len, dist, 0.06));
      camera.position.copy(controls.target).add(offset);
    }
    // capítulo de la app
    let lt = clock - chStart;
    if (lt > CHAPTERS[chapter].dur) { chapter = (chapter + 1) % CHAPTERS.length; chStart = clock; lt = 0; renderChips(); }
    progEl.style.transform = `scaleX(${Math.max(0, lt / CHAPTERS[chapter].dur)})`;
    const power = current === 'laptop' ? easeOut((since - ENTER * 0.6 - LID * 0.5) / 0.6) : easeOut(since / 0.6);
    const L = Math.max(0, lt);
    if (current === 'phone') {
      const { ctx, c, tex } = PH.s; ctx.setTransform(c.width / PH.lw, 0, 0, c.height / PH.lh, 0, 0);
      drawPhone(ctx, PH.lw, PH.lh, chapter, L, clock, logo.complete ? logo : null, power); tex.needsUpdate = true;
    } else {
      const { ctx, c, tex } = LP.s; ctx.setTransform(c.width / LP.lw, 0, 0, c.height / LP.lh, 0, 0);
      drawLaptop(ctx, LP.lw, LP.lh, chapter, L, clock, logo.complete ? logo : null, power); tex.needsUpdate = true;
    }
  }
  if (!reduce) { ring.rotation.z += dt * 0.25; ringMat.opacity = 0.3 + Math.sin(clock * 2) * 0.15; }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// copiar comando
const copyBtn = document.getElementById('copy');
copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(copyBtn.dataset.cmd); } catch (e) {}
  copyBtn.textContent = 'Copiado'; setTimeout(() => (copyBtn.textContent = 'Copiar'), 1600);
});
