// Genera phone.glb y laptop.glb con three.js + GLTFExporter (Node).
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'fs';

// Polyfill mínimo de FileReader para el exportador binario
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend && this.onloadend(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then((b) => { this.result = 'data:application/octet-stream;base64,' + Buffer.from(b).toString('base64'); this.onloadend && this.onloadend(); }); }
};

function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
// Plano redondeado con UV 0..1 (para la textura de pantalla)
function rrPlane(w, h, r, seg = 12) {
  const g = new THREE.ShapeGeometry(rrShape(w, h, r), seg);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
}
function extrudeRR(w, h, r, depth, bevel) {
  const g = new THREE.ExtrudeGeometry(rrShape(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel)), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 24 });
  g.translate(0, 0, -depth / 2);
  return g;
}

const M = {
  frame: new THREE.MeshStandardMaterial({ name: 'Frame', color: 0x2a312d, metalness: 0.85, roughness: 0.32 }),
  glass: new THREE.MeshStandardMaterial({ name: 'Glass', color: 0x020303, metalness: 0.2, roughness: 0.08 }),
  black: new THREE.MeshStandardMaterial({ name: 'Black', color: 0x000000, metalness: 0.1, roughness: 0.4 }),
  lens: new THREE.MeshStandardMaterial({ name: 'Lens', color: 0x0a0d0c, metalness: 0.6, roughness: 0.15 }),
  screen: new THREE.MeshBasicMaterial({ name: 'ScreenMat', color: 0xffffff }),
  alu: new THREE.MeshStandardMaterial({ name: 'Aluminium', color: 0x7b827e, metalness: 0.9, roughness: 0.34 }),
  aluDark: new THREE.MeshStandardMaterial({ name: 'AluminiumDark', color: 0x4a504c, metalness: 0.85, roughness: 0.4 }),
  key: new THREE.MeshStandardMaterial({ name: 'Keys', color: 0x111413, metalness: 0.1, roughness: 0.6 }),
  pad: new THREE.MeshStandardMaterial({ name: 'Trackpad', color: 0x6a716d, metalness: 0.7, roughness: 0.25 }),
};

// ---------- CELULAR ----------
function phone() {
  const root = new THREE.Group(); root.name = 'Phone';
  const W = 0.75, H = 1.55, D = 0.08, R = 0.12;
  const body = new THREE.Mesh(extrudeRR(W, H, R, D - 0.02, 0.012), M.frame); body.name = 'Body'; root.add(body);
  const glass = new THREE.Mesh(rrPlane(W - 0.012, H - 0.012, R - 0.006), M.glass); glass.position.z = D / 2 + 0.003; glass.name = 'FrontGlass'; root.add(glass);
  const sw = W - 0.06, sh = H - 0.06;
  const screen = new THREE.Mesh(rrPlane(sw, sh, R - 0.03, 16), M.screen); screen.position.z = D / 2 + 0.0042; screen.name = 'Screen';
  screen.userData = { aspect: sw / sh }; root.add(screen);
  const island = new THREE.Mesh(rrPlane(0.2, 0.06, 0.03), M.black); island.position.set(0, sh / 2 - 0.065, D / 2 + 0.0055); island.name = 'Island'; root.add(island);
  // botones laterales
  const btn = (y, h, x) => { const b = new THREE.Mesh(new RoundedBoxGeometry(0.012, h, 0.03, 2, 0.005), M.frame); b.position.set(x, y, 0); root.add(b); };
  btn(0.35, 0.18, W / 2 + 0.004); btn(0.42, 0.09, -W / 2 - 0.004); btn(0.27, 0.09, -W / 2 - 0.004);
  // cámara trasera
  const bump = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.3, 0.02, 3, 0.06), M.frame); bump.position.set(-W / 2 + 0.2, H / 2 - 0.2, -D / 2 - 0.006); bump.name = 'CameraBump'; root.add(bump);
  [[-0.06, 0.06], [-0.06, -0.06], [0.06, 0]].forEach(([x, y]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 32), M.lens); l.rotation.x = Math.PI / 2;
    l.position.set(bump.position.x + x, bump.position.y + y, -D / 2 - 0.02); root.add(l);
  });
  return root;
}

// ---------- LAPTOP ----------
function laptop() {
  const root = new THREE.Group(); root.name = 'Laptop';
  const W = 2.4, Dp = 1.62, T = 0.07;
  const base = new THREE.Mesh(new RoundedBoxGeometry(W, T, Dp, 4, 0.03), M.alu); base.name = 'Base'; base.position.y = T / 2; root.add(base);
  // zona del teclado
  const well = new THREE.Mesh(new RoundedBoxGeometry(W * 0.86, 0.004, Dp * 0.44, 2, 0.002), M.aluDark); well.position.set(0, T + 0.001, -Dp * 0.18); root.add(well);
  const keys = []; const rows = 6, cols = 14, kw = (W * 0.84) / cols, kd = (Dp * 0.42) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r === rows - 1 && c > 3 && c < 10) { if (c === 4) { const g = new RoundedBoxGeometry(kw * 6 - 0.012, 0.012, kd - 0.012, 1, 0.004); g.translate(-W * 0.42 + kw * 7, T + 0.008, -Dp * 0.18 - Dp * 0.21 + kd * (r + 0.5)); keys.push(g); } continue; }
    const g = new RoundedBoxGeometry(kw - 0.012, 0.012, kd - 0.012, 1, 0.004);
    g.translate(-W * 0.42 + kw * (c + 0.5), T + 0.008, -Dp * 0.18 - Dp * 0.21 + kd * (r + 0.5)); keys.push(g);
  }
  const kb = new THREE.Mesh(mergeGeometries(keys), M.key); kb.name = 'Keyboard'; root.add(kb);
  const pad = new THREE.Mesh(new RoundedBoxGeometry(W * 0.34, 0.004, Dp * 0.28, 2, 0.002), M.pad); pad.position.set(0, T + 0.001, Dp * 0.27); pad.name = 'Trackpad'; root.add(pad);
  // tapa con bisagra (pivote en el borde trasero)
  const lid = new THREE.Group(); lid.name = 'Lid'; lid.position.set(0, T, -Dp / 2 + 0.01);
  const LH = 1.52, LT = 0.045;
  const shell = new THREE.Mesh(new RoundedBoxGeometry(W, LH, LT, 4, 0.02), M.alu); shell.position.set(0, LH / 2, -LT / 2); lid.add(shell);
  const bezel = new THREE.Mesh(rrPlane(W - 0.02, LH - 0.02, 0.03), M.glass); bezel.position.set(0, LH / 2, 0.0006); lid.add(bezel);
  const sw = W - 0.16, sh = sw / 1.6;
  const screen = new THREE.Mesh(rrPlane(sw, sh, 0.012), M.screen); screen.position.set(0, LH / 2 + 0.03, 0.0014); screen.name = 'Screen'; screen.userData = { aspect: 1.6 }; lid.add(screen);
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), M.lens); cam.position.set(0, LH - 0.04, 0.002); lid.add(cam);
  lid.rotation.x = -0.32; // abierta ~108°
  root.add(lid);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, W * 0.8, 24), M.aluDark); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, T, -Dp / 2 + 0.02); root.add(hinge);
  return root;
}

const exporter = new GLTFExporter();
async function save(obj, file) {
  const scene = new THREE.Scene(); scene.add(obj);
  const buf = await exporter.parseAsync(scene, { binary: true });
  fs.writeFileSync(file, Buffer.from(buf));
  console.log(file, (fs.statSync(file).size / 1024).toFixed(1) + ' KB');
}
await save(phone(), 'phone.glb');
await save(laptop(), 'laptop.glb');
