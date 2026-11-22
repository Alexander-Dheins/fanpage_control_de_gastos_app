// Dibuja la UI de la app (celular y laptop) en un canvas 2D según el tiempo.
export const C = {
  bg: '#070A08', panel: '#0B100D', panel2: '#101712', line: '#1B2520', line2: '#26332C',
  ink: '#EEF3EF', muted: '#9BA69F', dim: '#6F7B73', accent: '#36C46C', accentInk: '#04140A', gold: '#F2B533', mint: '#8FD9AA', slate: '#3B4A41',
};
const F = { d: "'Space Grotesk', Inter, sans-serif", b: 'Inter, system-ui, sans-serif', m: "'JetBrains Mono', ui-monospace, monospace" };
export const CHAPTERS = [
  { label: 'Login', dur: 4.8 }, { label: 'Resumen', dur: 5 }, { label: 'Movimientos', dur: 5 }, { label: 'Reportes', dur: 5 },
];
const EMAIL = 'alex@pydev.app';
const MOVS = [
  ['Pago de cliente', 'Ingreso, freelance', 1200, '21 nov'], ['Supermercado', 'Comida', -184.3, '21 nov'],
  ['Recarga de pasaje', 'Transporte', -50, '20 nov'], ['Sueldo', 'Ingreso, trabajo', 3650, '20 nov'],
  ['Luz y agua', 'Servicios', -132.9, '19 nov'], ['Almuerzo', 'Comida', -18.5, '19 nov'], ['Internet', 'Servicios', -89.9, '18 nov'],
];
const CATS = [['Vivienda', 0.38, C.gold], ['Comida', 0.24, C.accent], ['Transporte', 0.16, C.mint], ['Otros', 0.22, C.slate]];
const WEEKS = [[62, 40], [70, 55], [58, 38], [82, 50], [74, 62], [90, 48], [66, 44], [78, 58], [72, 41], [88, 52], [80, 60], [94, 47]];

const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const fmt = (n) => (n < 0 ? '−' : '+') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const money = (n) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillRR(ctx, x, y, w, h, r, c) { rr(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function strokeRR(ctx, x, y, w, h, r, c, lw = 1) { rr(ctx, x, y, w, h, r); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function text(ctx, s, x, y, size, color, font = F.b, weight = 400, align = 'left') {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
function enter(ctx, lt, fn) { // transición de entrada de cada pantalla
  const k = ease(lt / 0.5); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 36, 0); fn(); ctx.restore();
}
function loginState(lt) {
  const n = Math.max(0, Math.min(EMAIL.length, Math.floor((lt - 0.8) / 0.09)));
  const dots = Math.max(0, Math.min(8, Math.floor((lt - 2.3) / 0.1)));
  return { typed: EMAIL.slice(0, n), dots: '•'.repeat(dots), caret: lt < 2.3 && Math.floor(lt * 2) % 2 === 0, focusEmail: lt > 0.6 && lt < 2.3,
    focusPass: lt >= 2.3 && lt < 3.4, press: lt > 3.5 && lt < 3.8, loading: lt > 3.5 };
}
function spinner(ctx, cx, cy, r, t, color) {
  ctx.beginPath(); ctx.arc(cx, cy, r, t * 6, t * 6 + 4.2); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
}

// ================= CELULAR (lienzo lógico 320 × H) =================
export function drawPhone(ctx, W, H, ch, lt, t, logo, power) {
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (ch === 0) enter(ctx, lt, () => phoneLogin(ctx, W, H, lt, t, logo));
  if (ch === 1) enter(ctx, lt, () => phoneResumen(ctx, W, lt));
  if (ch === 2) enter(ctx, lt, () => phoneMovs(ctx, W, lt));
  if (ch === 3) enter(ctx, lt, () => phoneRep(ctx, W, lt));
  if (ch > 0) phoneNav(ctx, W, H, ch);
  if (power < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - power})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
function phoneLogin(ctx, W, H, lt, t, logo) {
  const s = loginState(lt), cx = W / 2;
  if (logo) ctx.drawImage(logo, cx - 46, 96, 92, 92);
  text(ctx, 'Bienvenido', cx, 236, 26, C.ink, F.d, 700, 'center');
  text(ctx, 'Ingresa para ver tu saldo', cx, 260, 13, C.muted, F.b, 400, 'center');
  text(ctx, 'Correo', 24, 306, 12, C.muted);
  fillRR(ctx, 24, 314, W - 48, 46, 12, C.panel); strokeRR(ctx, 24.5, 314.5, W - 49, 45, 12, s.focusEmail ? C.accent : C.line2);
  text(ctx, s.typed, 38, 343, 14, C.ink);
  if (s.caret && s.focusEmail) { ctx.font = `400 14px ${F.b}`; const w = ctx.measureText(s.typed).width; ctx.fillStyle = C.ink; ctx.fillRect(39 + w, 329, 1.5, 18); }
  text(ctx, 'Contraseña', 24, 384, 12, C.muted);
  fillRR(ctx, 24, 392, W - 48, 46, 12, C.panel); strokeRR(ctx, 24.5, 392.5, W - 49, 45, 12, s.focusPass ? C.accent : C.line2);
  text(ctx, s.dots, 38, 421, 18, C.ink);
  ctx.save(); const k = s.press ? 0.95 : 1; ctx.translate(cx, 486); ctx.scale(k, k);
  fillRR(ctx, -(W - 48) / 2, -24, W - 48, 48, 12, C.accent);
  if (s.loading) spinner(ctx, 0, 0, 9, t, C.accentInk); else text(ctx, 'Ingresar', 0, 5, 15, C.accentInk, F.b, 700, 'center');
  ctx.restore();
  text(ctx, '¿Nuevo? ', cx - 40, H - 40, 12, C.muted, F.b, 400, 'center');
  text(ctx, 'Crea tu cuenta', cx + 28, H - 40, 12, C.accent, F.b, 500, 'center');
}
function phoneResumen(ctx, W, lt) {
  text(ctx, 'Noviembre 2026', 20, 74, 12, C.muted); text(ctx, 'Hola, Alex', 20, 100, 22, C.ink, F.d, 700);
  fillRR(ctx, 20, 118, W - 40, 92, 18, C.panel2); strokeRR(ctx, 20.5, 118.5, W - 41, 91, 18, C.line);
  text(ctx, 'Saldo disponible', 36, 146, 12, C.muted);
  text(ctx, 'S/ ' + money(2531.6 * ease(lt / 1.4)), 36, 188, 30, C.ink, F.m, 500);
  const tw = (W - 50) / 2;
  [[20, 'Ingresos', '+4 850.00', C.accent], [30 + tw, 'Egresos', '−2 318.40', C.gold]].forEach(([x, l, v, c]) => {
    strokeRR(ctx, x + 0.5, 222.5, tw - 1, 62, 14, C.line); text(ctx, l, x + 12, 246, 11, C.muted); text(ctx, v, x + 12, 270, 15, c, F.m, 500);
  });
  text(ctx, 'Últimas 6 semanas', 20, 312, 12, C.muted);
  const bx = 20, bw = W - 40, by = 440, bh = 110, gw = bw / 6;
  WEEKS.slice(0, 6).forEach(([a, b], i) => {
    const k1 = ease((lt - 0.2 - i * 0.07) / 0.6), k2 = ease((lt - 0.25 - i * 0.07) / 0.6);
    const w = (gw - 12) / 2;
    fillRR(ctx, bx + i * gw + 4, by - bh * a / 100 * k1, w, bh * a / 100 * k1 + 0.01, [4, 4, 0, 0], C.accent);
    fillRR(ctx, bx + i * gw + 7 + w, by - bh * b / 100 * k2, w, bh * b / 100 * k2 + 0.01, [4, 4, 0, 0], C.gold);
  });
  ctx.fillStyle = C.line; ctx.fillRect(bx, by + 2, bw, 1);
  text(ctx, 'Recientes', 20, 476, 14, C.ink, F.b, 700);
  MOVS.slice(0, 3).forEach((m, i) => phoneRow(ctx, W, 490 + i * 52, m, lt - 0.5 - i * 0.1));
}
function phoneRow(ctx, W, y, m, k0) {
  const k = ease(k0 / 0.5); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 12);
  const pos = m[2] > 0, c = pos ? C.accent : C.gold;
  fillRR(ctx, 20, y + 8, 34, 34, 10, C.panel2); strokeRR(ctx, 20.5, y + 8.5, 33, 33, 10, C.line2);
  text(ctx, pos ? '+' : '−', 37, y + 31, 15, c, F.m, 500, 'center');
  text(ctx, m[0], 64, y + 24, 13, C.ink, F.b, 500); text(ctx, m[1], 64, y + 40, 11, C.muted);
  text(ctx, fmt(m[2]), W - 20, y + 30, 13, c, F.m, 500, 'right');
  ctx.fillStyle = C.line; ctx.fillRect(20, y + 50, W - 40, 1); ctx.restore();
}
function chip(ctx, x, y, label, on, size = 12) {
  ctx.font = `500 ${size}px ${F.b}`; const w = ctx.measureText(label).width + size * 2;
  if (on) fillRR(ctx, x, y, w, size * 2.2, 999, C.ink); else strokeRR(ctx, x + 0.5, y + 0.5, w - 1, size * 2.2 - 1, 999, C.line2);
  text(ctx, label, x + w / 2, y + size * 1.48, size, on ? C.bg : C.muted, F.b, 500, 'center'); return w;
}
function phoneMovs(ctx, W, lt) {
  text(ctx, 'Movimientos', 20, 96, 22, C.ink, F.d, 700);
  let x = 20; ['Todos', 'Ingresos', 'Egresos'].forEach((l, i) => { x += chip(ctx, x, 112, l, i === 0) + 6; });
  MOVS.slice(0, 7).forEach((m, i) => phoneRow(ctx, W, 150 + i * 56, m, lt - 0.2 - i * 0.09));
}
function phoneRep(ctx, W, lt) {
  text(ctx, 'Egresos de noviembre', 20, 74, 12, C.muted); text(ctx, 'Reportes', 20, 100, 22, C.ink, F.d, 700);
  donut(ctx, W / 2, 220, 84, 26, lt);
  text(ctx, 'Total', W / 2, 214, 11, C.muted, F.b, 400, 'center'); text(ctx, 'S/ 2 318', W / 2, 236, 16, C.ink, F.m, 500, 'center');
  CATS.forEach((c, i) => {
    const k = ease((lt - 0.6 - i * 0.1) / 0.5); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k; const y = 350 + i * 34;
    fillRR(ctx, 20, y - 10, 10, 10, 3, c[2]); text(ctx, c[0], 40, y, 13, C.ink); text(ctx, Math.round(c[1] * 100) + '%', W - 20, y, 13, C.muted, F.m, 500, 'right');
    ctx.restore();
  });
  strokeRR(ctx, 20.5, 500.5, W - 41, 43, 12, C.line2); text(ctx, 'Exportar PDF / Excel', W / 2, 527, 13, C.ink, F.b, 500, 'center');
}
function donut(ctx, cx, cy, r, w, lt) {
  const k = ease(lt / 1.1); let a = -Math.PI / 2;
  ctx.lineWidth = w; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = C.line; ctx.stroke();
  CATS.forEach((c) => { const da = c[1] * Math.PI * 2 * k; ctx.beginPath(); ctx.arc(cx, cy, r, a + 0.02, a + da - 0.02); ctx.strokeStyle = c[2]; ctx.stroke(); a += da; });
}
function phoneNav(ctx, W, H, ch) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, H - 74, W, 74); ctx.fillStyle = C.line; ctx.fillRect(0, H - 74, W, 1);
  ['Inicio', 'Movs', 'Reportes', 'Perfil'].forEach((n, i) => {
    const x = W / 8 + (i * W) / 4, c = i + 1 === ch ? C.accent : C.dim;
    fillRR(ctx, x - 10, H - 58, 20, 3, 2, c); text(ctx, n, x, H - 38, 10, c, F.b, 500, 'center');
  });
}

// ================= LAPTOP (lienzo lógico 1280 × 800) =================
export function drawLaptop(ctx, W, H, ch, lt, t, logo, power) {
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (ch === 0) enter(ctx, lt, () => lapLogin(ctx, W, H, lt, t, logo));
  else {
    lapShell(ctx, W, H, ch, logo);
    ctx.save(); ctx.beginPath(); ctx.rect(240, 0, W - 240, H); ctx.clip();
    if (ch === 1) enter(ctx, lt, () => lapResumen(ctx, W, H, lt));
    if (ch === 2) enter(ctx, lt, () => lapMovs(ctx, W, H, lt));
    if (ch === 3) enter(ctx, lt, () => lapRep(ctx, W, H, lt));
    ctx.restore();
  }
  if (power < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - power})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
function lapLogin(ctx, W, H, lt, t, logo) {
  // panel de marca
  ctx.fillStyle = C.panel; ctx.fillRect(0, 0, W / 2, H);
  ctx.strokeStyle = C.line; ctx.lineWidth = 1;
  for (let x = 0; x < W / 2; x += 40) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W / 2, y + 0.5); ctx.stroke(); }
  if (logo) ctx.drawImage(logo, 80, 220, 120, 120);
  text(ctx, 'Controla', 80, 420, 56, C.ink, F.d, 700); text(ctx, 'gastos', 80, 482, 56, C.ink, F.d, 700);
  text(ctx, 'PY.DEV, ingresos y egresos', 80, 530, 18, C.muted);
  // formulario
  const s = loginState(lt), fx = W / 2 + 120, fw = W / 2 - 240;
  text(ctx, 'Bienvenido', fx, 230, 34, C.ink, F.d, 700); text(ctx, 'Ingresa para ver tu saldo', fx, 262, 16, C.muted);
  text(ctx, 'Correo', fx, 318, 14, C.muted);
  fillRR(ctx, fx, 328, fw, 54, 12, C.panel); strokeRR(ctx, fx + 0.5, 328.5, fw - 1, 53, 12, s.focusEmail ? C.accent : C.line2);
  text(ctx, s.typed, fx + 18, 362, 17, C.ink);
  if (s.caret && s.focusEmail) { ctx.font = `400 17px ${F.b}`; const w = ctx.measureText(s.typed).width; ctx.fillStyle = C.ink; ctx.fillRect(fx + 19 + w, 343, 2, 22); }
  text(ctx, 'Contraseña', fx, 414, 14, C.muted);
  fillRR(ctx, fx, 424, fw, 54, 12, C.panel); strokeRR(ctx, fx + 0.5, 424.5, fw - 1, 53, 12, s.focusPass ? C.accent : C.line2);
  text(ctx, s.dots, fx + 18, 459, 22, C.ink);
  ctx.save(); ctx.translate(fx + fw / 2, 536); const k = s.press ? 0.96 : 1; ctx.scale(k, k);
  fillRR(ctx, -fw / 2, -28, fw, 56, 12, C.accent);
  if (s.loading) spinner(ctx, 0, 0, 11, t, C.accentInk); else text(ctx, 'Ingresar', 0, 6, 17, C.accentInk, F.b, 700, 'center');
  ctx.restore();
  text(ctx, '¿Nuevo? Crea tu cuenta', fx + fw / 2, 610, 14, C.muted, F.b, 400, 'center');
}
function lapShell(ctx, W, H, ch, logo) {
  ctx.fillStyle = C.panel; ctx.fillRect(0, 0, 240, H); ctx.fillStyle = C.line; ctx.fillRect(240, 0, 1, H);
  if (logo) ctx.drawImage(logo, 28, 30, 40, 40);
  text(ctx, 'PY.DEV', 78, 58, 20, C.ink, F.d, 700);
  ['Resumen', 'Movimientos', 'Reportes', 'Ajustes'].forEach((n, i) => {
    const y = 120 + i * 52, on = i + 1 === ch;
    if (on) fillRR(ctx, 16, y, 208, 42, 10, C.panel2);
    if (on) fillRR(ctx, 16, y + 12, 3, 18, 2, C.accent);
    text(ctx, n, 36, y + 27, 15, on ? C.ink : C.muted, F.b, on ? 500 : 400);
  });
  fillRR(ctx, 16, H - 72, 208, 52, 12, C.bg); text(ctx, 'Alex', 32, H - 42, 14, C.ink, F.b, 500); text(ctx, 'alex@pydev.app', 32, H - 26, 12, C.muted);
}
function lapTop(ctx, W, title, sub) {
  text(ctx, sub, 280, 62, 14, C.muted); text(ctx, title, 280, 96, 30, C.ink, F.d, 700);
  fillRR(ctx, W - 250, 52, 210, 46, 12, C.accent); text(ctx, '+ Nuevo movimiento', W - 145, 81, 15, C.accentInk, F.b, 700, 'center');
}
function lapResumen(ctx, W, H, lt) {
  lapTop(ctx, W, 'Hola, Alex', 'Noviembre 2026');
  const cw = (W - 280 - 40 - 32) / 3;
  [['Saldo disponible', 'S/ ' + money(2531.6 * ease(lt / 1.4)), C.ink], ['Ingresos', '+' + money(4850 * ease(lt / 1.4)), C.accent], ['Egresos', '−' + money(2318.4 * ease(lt / 1.4)), C.gold]].forEach(([l, v, c], i) => {
    const x = 280 + i * (cw + 16);
    fillRR(ctx, x, 128, cw, 110, 16, i === 0 ? C.panel2 : C.panel); strokeRR(ctx, x + 0.5, 128.5, cw - 1, 109, 16, C.line);
    text(ctx, l, x + 22, 164, 14, C.muted); text(ctx, v, x + 22, 214, 30, c, F.m, 500);
  });
  // gráfico
  const gx = 280, gy = 262, gw = 600, gh = 470;
  fillRR(ctx, gx, gy, gw, gh, 16, C.panel); strokeRR(ctx, gx + 0.5, gy + 0.5, gw - 1, gh - 1, 16, C.line);
  text(ctx, 'Ingresos y egresos, últimas 12 semanas', gx + 24, gy + 40, 15, C.ink, F.b, 500);
  const base = gy + gh - 40, bh = 330, step = (gw - 48) / 12;
  for (let i = 0; i < 4; i++) { ctx.fillStyle = C.line; ctx.fillRect(gx + 24, base - (bh * i) / 3, gw - 48, 1); }
  WEEKS.forEach(([a, b], i) => {
    const k1 = ease((lt - 0.2 - i * 0.05) / 0.6), k2 = ease((lt - 0.25 - i * 0.05) / 0.6), w = (step - 14) / 2, x = gx + 24 + i * step + 4;
    fillRR(ctx, x, base - (bh * a) / 100 * k1, w, (bh * a) / 100 * k1 + 0.01, [5, 5, 0, 0], C.accent);
    fillRR(ctx, x + w + 4, base - (bh * b) / 100 * k2, w, (bh * b) / 100 * k2 + 0.01, [5, 5, 0, 0], C.gold);
  });
  // recientes
  const rx = gx + gw + 16, rw = W - 40 - rx;
  fillRR(ctx, rx, gy, rw, gh, 16, C.panel); strokeRR(ctx, rx + 0.5, gy + 0.5, rw - 1, gh - 1, 16, C.line);
  text(ctx, 'Recientes', rx + 22, gy + 40, 15, C.ink, F.b, 500);
  MOVS.slice(0, 6).forEach((m, i) => {
    const k = ease((lt - 0.5 - i * 0.08) / 0.5); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k; const y = gy + 76 + i * 64, c = m[2] > 0 ? C.accent : C.gold;
    text(ctx, m[0], rx + 22, y + 10, 14, C.ink, F.b, 500); text(ctx, m[1], rx + 22, y + 30, 12, C.muted);
    text(ctx, fmt(m[2]), rx + rw - 22, y + 18, 14, c, F.m, 500, 'right');
    ctx.fillStyle = C.line; ctx.fillRect(rx + 22, y + 46, rw - 44, 1); ctx.restore();
  });
}
function lapMovs(ctx, W, H, lt) {
  lapTop(ctx, W, 'Movimientos', '7 movimientos esta semana');
  let x = 280; ['Todos', 'Ingresos', 'Egresos', 'Comida', 'Servicios'].forEach((l, i) => { x += chip(ctx, x, 124, l, i === 0, 14) + 8; });
  const tx = 280, tw = W - 320, ty = 180;
  fillRR(ctx, tx, ty, tw, 560, 16, C.panel); strokeRR(ctx, tx + 0.5, ty + 0.5, tw - 1, 559, 16, C.line);
  const cols = [tx + 28, tx + 160, tx + 520, tx + tw - 28];
  ['Fecha', 'Descripción', 'Categoría', 'Monto'].forEach((h, i) => text(ctx, h, cols[i], ty + 42, 13, C.muted, F.b, 500, i === 3 ? 'right' : 'left'));
  ctx.fillStyle = C.line; ctx.fillRect(tx, ty + 60, tw, 1);
  MOVS.forEach((m, i) => {
    const k = ease((lt - 0.2 - i * 0.08) / 0.5); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 14); const y = ty + 100 + i * 64, c = m[2] > 0 ? C.accent : C.gold;
    text(ctx, m[3], cols[0], y, 15, C.muted, F.m, 500); text(ctx, m[0], cols[1], y, 15, C.ink, F.b, 500);
    chip(ctx, cols[2], y - 19, m[1].split(',')[0], false, 13);
    text(ctx, fmt(m[2]), cols[3], y, 16, c, F.m, 500, 'right');
    ctx.fillStyle = C.line; ctx.fillRect(tx + 28, y + 24, tw - 56, 1); ctx.restore();
  });
}
function lapRep(ctx, W, H, lt) {
  lapTop(ctx, W, 'Reportes', 'Egresos de noviembre');
  const px = 280, py = 128, pw = 460, ph = 610;
  fillRR(ctx, px, py, pw, ph, 16, C.panel); strokeRR(ctx, px + 0.5, py + 0.5, pw - 1, ph - 1, 16, C.line);
  donut(ctx, px + pw / 2, py + 260, 150, 40, lt);
  text(ctx, 'Total', px + pw / 2, py + 250, 15, C.muted, F.b, 400, 'center'); text(ctx, 'S/ 2 318.40', px + pw / 2, py + 282, 26, C.ink, F.m, 500, 'center');
  const bx = px + pw + 16, bw = W - 40 - bx;
  fillRR(ctx, bx, py, bw, 400, 16, C.panel); strokeRR(ctx, bx + 0.5, py + 0.5, bw - 1, 399, 16, C.line);
  text(ctx, 'Por categoría', bx + 28, py + 44, 16, C.ink, F.b, 500);
  CATS.forEach((c, i) => {
    const y = py + 100 + i * 72, k = ease((lt - 0.4 - i * 0.1) / 0.7);
    text(ctx, c[0], bx + 28, y, 15, C.ink); text(ctx, Math.round(c[1] * 100) + '%', bx + bw - 28, y, 15, C.muted, F.m, 500, 'right');
    fillRR(ctx, bx + 28, y + 14, bw - 56, 10, 5, C.line); fillRR(ctx, bx + 28, y + 14, Math.max(0.01, (bw - 56) * c[1] * 2 * k), 10, 5, c[2]);
  });
  const ey = py + 416, ew = (bw - 16) / 2;
  [['noviembre.pdf', C.gold], ['noviembre.xlsx', C.accent]].forEach(([n, c], i) => {
    const x = bx + i * (ew + 16);
    fillRR(ctx, x, ey, ew, 194, 16, C.panel); strokeRR(ctx, x + 0.5, ey + 0.5, ew - 1, 193, 16, C.line);
    strokeRR(ctx, x + 28.5, ey + 30.5, 36, 46, 6, c, 2); text(ctx, n, x + 28, ey + 120, 15, C.ink, F.m, 500); text(ctx, 'Exportar', x + 28, ey + 150, 14, C.accent, F.b, 500);
  });
}
