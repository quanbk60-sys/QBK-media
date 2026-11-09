#!/usr/bin/env node
// Phong cảnh anime "đạp xe đổ dốc" (phong cách phong-canh-3d), vẽ 100% bằng code.
// Học từ mẫu TikTok vt.tiktok.com/ZSpDC6Ceu: người đạp xe đội nón, đeo ba lô, camera bám sau lưng từ trên cao,
// đường lát đá đổ dốc, hoa hai bên mờ chuyển động, biển và thị trấn phía xa, mây tích trắng, trời xanh đậm.
// Phối cảnh giả 3D (mặt đường chiếu theo độ sâu z), các lớp tranh vẽ sẵn, mờ chuyển động hướng tâm.
//
// node phong-canh.mjs ../../projects/<slug>/phongcanh.json [--from S] [--to S] [--name preview] [--fps 30] [--still T]
// phongcanh.json: {"fps":30, "shots":[{"start":0,"end":8,"theme":"bien","seed":3,"speed":4.2}, ...],
//                  "music": true | {"path":"audio/music.mp3","gain":0.3}, "narration": {...}, "captions": {...}}
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {SR, writeWav} from '../engine/lib/audio.mjs';
const require = createRequire(new URL('../engine/package.json', import.meta.url));
const {createCanvas, GlobalFonts, loadImage} = require('@napi-rs/canvas');
const FONTS = new URL('../engine/fonts/', import.meta.url).pathname;
try { GlobalFonts.registerFromPath(path.join(FONTS, 'InterDisplay-Black.otf'), 'Blk'); } catch {}

const W = 1080, H = 1920, CX = W / 2;
// ----- phối cảnh: camera cao 4,2 m bám sau xe, mặt dốc làm điểm tụ của đường thấp hơn đường chân trời -----
const F = 1091, CAMH = 4.2, ZMIN = 1.6, ZMAX = 58, CELL = 0.3;
const R = seed => { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
const mk = (w, h) => { const c = createCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))); return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const smooth = k => k * k * (3 - 2 * k);

// ===================== THEMES =====================
const THEMES = {
  bien: { // đổ dốc ra biển, thị trấn ven biển, hoa trắng hồng
    yH: 300, yV: 770, bend: [1.6, 0.05, 0.5, 0.11],
    sky: ['#0636a8', '#1f63cf', '#5fa6ea', '#cfe7f8'],
    flowers: [['#ffffff', '#f4d24a', 0.45], ['#ffb3c7', '#ffffff', 0.18], ['#ff6f91', '#ffe08a', 0.12], ['#b98cff', '#ffffff', 0.08], ['#fff3a8', '#e8a020', 0.17]],
    grass: [100, 118], house: true, tree: 0.5, bg: 'sea'},
  nui: { // đường đá men sườn núi, hoa cúc cam, thung lũng và núi xanh
    yH: 560, yV: 880, bend: [2.2, 0.055, 0.6, 0.09],
    sky: ['#0a3aa6', '#1e66d0', '#6aaeea', '#d7ecf8'],
    flowers: [['#ff9a1f', '#ffd25a', 0.62], ['#ffb733', '#ff7a00', 0.2], ['#ffffff', '#f4d24a', 0.1], ['#ff6f91', '#ffe08a', 0.08]],
    grass: [92, 112], house: true, tree: 0.7, bg: 'valley', slopeRight: true},
};

// ===================== SPRITES (vẽ sẵn) =====================
function cloudSprite(r, w, h, tower = 0.7) {
  const [c, g] = mk(w, h), puffs = [];
  const n = 16 + (r() * 12 | 0);
  for (let i = 0; i < n; i++) {
    const u = 0.1 + 0.8 * r(), hump = Math.exp(-(((u - 0.5) / 0.22) ** 2));
    const pr = w * (0.06 + 0.07 * r() + hump * 0.09 * tower);
    puffs.push([u * w, Math.max(pr * 1.02, h * 0.9 - pr * 0.5 - hump * tower * h * 0.62 * (0.4 + 0.6 * r())), pr]);
  }
  for (let i = 0; i < 9; i++) { const u = 0.08 + 0.84 * i / 8; puffs.push([u * w, h * 0.86, w * (0.05 + 0.04 * r())]); }
  g.save(); g.beginPath(); g.rect(0, 0, w, h * 0.9); g.clip();
  const layer = (col, dx, dy, k) => { g.fillStyle = col; for (const [x, y, p] of puffs) { g.beginPath(); g.arc(x + dx * p, y + dy * p, p * k, 0, 7); g.fill(); } };
  layer('#8ea6cf', 0, 0, 1); layer('#c4d3ec', -0.08, -0.14, 0.9); layer('#eef3fb', -0.16, -0.26, 0.74); layer('#ffffff', -0.22, -0.36, 0.55);
  g.restore();
  const gr = g.createLinearGradient(0, h * 0.7, 0, h * 0.9); gr.addColorStop(0, 'rgba(120,145,195,0)'); gr.addColorStop(1, 'rgba(120,145,195,0.55)');
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr; g.fillRect(0, 0, w, h);
  return c;
}

function bladeTuft(g, r, x0, y0, w, h, hue, n, light = 0) {
  for (let i = 0; i < n; i++) {
    const bx = x0 + (r() - 0.5) * w, bh = h * (0.45 + 0.55 * r()), lean = (r() - 0.5) * w * 0.7, bw = 2 + r() * w * 0.035;
    g.fillStyle = hsl(hue + (r() - 0.5) * 26, 45 + r() * 25, 20 + r() * 28 + light);
    g.beginPath(); g.moveTo(bx - bw, y0); g.quadraticCurveTo(bx + lean * 0.3, y0 - bh * 0.6, bx + lean, y0 - bh); g.quadraticCurveTo(bx + lean * 0.3 + bw, y0 - bh * 0.6, bx + bw, y0); g.fill();
  }
}
function tuftSprite(r, hue) { const w = 200, h = 220, [c, g] = mk(w, h); bladeTuft(g, r, w / 2, h, w * 0.8, h * 0.95, hue, 46); bladeTuft(g, r, w / 2 + 10, h, w * 0.6, h * 0.6, hue, 18, 18); return c; }
function flowerSprite(r, hue, [petal, mid, ], kind) {
  const w = 240, h = 260, [c, g] = mk(w, h);
  bladeTuft(g, r, w / 2, h, w * 0.85, h * 0.7, hue, 40);
  const n = 12 + (r() * 12 | 0);
  for (let i = 0; i < n; i++) {
    const x = w * (0.12 + 0.76 * r()), y = h * (0.1 + 0.5 * r()), s = 13 + r() * 14;
    g.strokeStyle = hsl(hue, 50, 30); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 20, h); g.stroke();
    if (kind === 'daisy') {
      g.fillStyle = petal; for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283 + r() * 0.3; g.beginPath(); g.ellipse(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.45, s * 0.42, s * 0.2, a, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(0,0,30,0.12)'; g.beginPath(); g.ellipse(x + 2, y + s * 0.25, s * 0.9, s * 0.35, 0, 0, 3.14); g.fill();
      g.fillStyle = mid; g.beginPath(); g.arc(x, y, s * 0.24, 0, 7); g.fill();
    } else if (kind === 'ball') { // cúc vạn thọ / hoa tròn: chùm chấm
      for (let k = 0; k < 14; k++) { const a = r() * 6.283, d = r() * s * 0.7; g.fillStyle = k < 9 ? petal : mid; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, s * (0.22 + r() * 0.18), 0, 7); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(x - s * 0.25, y - s * 0.3, s * 0.18, 0, 7); g.fill();
    } else { // chùm nhỏ (hoa hồng dại, oải hương)
      for (let k = 0; k < 6; k++) { g.fillStyle = k % 3 ? petal : mid; g.beginPath(); g.arc(x + (r() - 0.5) * s, y - k * s * 0.25, s * 0.28, 0, 7); g.fill(); }
    }
  }
  bladeTuft(g, r, w / 2, h, w * 0.7, h * 0.35, hue, 16, 14);
  return c;
}
function foliage(g, r, cx, cy, rw, rh, hue, n, sun = [0.6, -0.8]) {
  const blobs = []; for (let i = 0; i < n * 2.5; i++) { const a = r() * 6.283, d = Math.sqrt(r()); blobs.push([cx + Math.cos(a) * d * rw, cy + Math.sin(a) * d * rh, (0.13 + 0.16 * r()) * Math.min(rw, rh) * 1.2]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [x, y, s] of blobs) {
    const lit = clamp(0.5 + ((x - cx) / rw * sun[0] + (y - cy) / rh * sun[1]) * 0.5);
    g.fillStyle = hsl(hue + 15 - lit * 18, 50 + lit * 15, 11 + lit * 13); g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
    g.fillStyle = hsl(hue + 5 - lit * 30, 55 + lit * 20, 19 + lit * 24); g.beginPath(); g.arc(x - s * 0.08 + sun[0] * s * 0.15, y + sun[1] * s * 0.18, s * 0.8, 0, 7); g.fill();
    if (lit > 0.5) { g.fillStyle = hsl(hue - 40, 70, 48 + lit * 12, 0.85); for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + sun[0] * s * 0.35 + (r() - 0.5) * s * 0.6, y + sun[1] * s * 0.35 + (r() - 0.5) * s * 0.5, s * 0.16, s * 0.09, r() * 3, 0, 7); g.fill(); } }
  }
}
function bushSprite(r, hue) { const w = 320, h = 260, [c, g] = mk(w, h); foliage(g, r, w / 2, h * 0.58, w * 0.4, h * 0.36, hue, 24); bladeTuft(g, r, w / 2, h, w * 0.9, h * 0.3, hue, 30); return c; }
function treeSprite(r, hue) { // tán xòe: cụm lá mọc ở đầu từng cành, bóng tối phía dưới tán
  const w = 900, h = 1000, [c, g] = mk(w, h), tips = [];
  g.lineCap = 'round';
  const branch = (x, y, a, len, wd, d) => {
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    g.lineWidth = wd; g.strokeStyle = d ? '#4f3a2a' : '#3e2b1d'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * len * 0.3, (y + y2) / 2 + (r() - 0.5) * len * 0.2, x2, y2); g.stroke();
    if (d >= 4 || len < 40) { tips.push([x2, y2, d]); return; }
    const k = d === 0 ? 3 : 2; for (let i = 0; i < k; i++) branch(x2, y2, a + (i - (k - 1) / 2) * (0.7 + r() * 0.4) + (r() - 0.5) * 0.3, len * (0.62 + r() * 0.14), wd * 0.6, d + 1);
  };
  branch(w / 2, h, -Math.PI / 2 + (r() - 0.5) * 0.25, h * 0.3, 52, 0);
  g.fillStyle = 'rgba(255,230,190,0.16)'; g.fillRect(w / 2 + 8, h * 0.72, 12, h * 0.28);
  // lớp tối dưới tán
  for (const [x, y] of tips) { g.fillStyle = hsl(hue + 20, 45, 9, 0.9); g.beginPath(); g.ellipse(x, y + 30, 120 + r() * 40, 60 + r() * 25, 0, 0, 7); g.fill(); }
  tips.sort((p, q) => q[1] - p[1]);
  for (const [x, y] of tips) foliage(g, r, x, y, 95 + r() * 55, 55 + r() * 30, hue, 9);
  // lá lẻ rủ ra mép tán
  for (let i = 0; i < 140; i++) { const [x, y] = tips[r() * tips.length | 0], a = r() * 6.283, d = 110 + r() * 70; g.fillStyle = hsl(hue - 10 + r() * 20, 55, 18 + r() * 22); g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 10 + r() * 8, 5 + r() * 4, a, 0, 7); g.fill(); }
  bladeTuft(g, r, w / 2, h, w * 0.3, h * 0.07, hue, 30);
  return c;
}
function houseSprite(r) { // nhà gỗ hai tầng nhìn chéo, mái ván
  const w = 520, h = 700, [c, g] = mk(w, h);
  const wall = '#8a5a36', wallD = '#5e3b22', roof = '#7a4b2c';
  g.fillStyle = wallD; g.fillRect(w * 0.05, h * 0.34, w * 0.55, h * 0.66);
  g.fillStyle = wall; g.beginPath(); g.moveTo(w * 0.6, h * 0.34); g.lineTo(w * 0.98, h * 0.42); g.lineTo(w * 0.98, h); g.lineTo(w * 0.6, h); g.fill();
  g.strokeStyle = 'rgba(40,20,10,0.5)'; g.lineWidth = 2; for (let y = h * 0.36; y < h; y += 18) { g.beginPath(); g.moveTo(w * 0.05, y); g.lineTo(w * 0.6, y); g.stroke(); g.beginPath(); g.moveTo(w * 0.6, y); g.lineTo(w * 0.98, y + (h - y) * 0 + 0.08 * h * (1 - (y - h * 0.34) / (h * 0.66))); g.stroke(); }
  for (const [x, y] of [[0.12, 0.42], [0.36, 0.42], [0.12, 0.68], [0.36, 0.68]]) { g.fillStyle = '#2b3f5c'; g.fillRect(w * x, h * y, w * 0.16, h * 0.12); g.fillStyle = 'rgba(160,210,255,0.55)'; g.fillRect(w * x + 4, h * y + 4, w * 0.07, h * 0.05); g.strokeStyle = '#e8d2a8'; g.lineWidth = 5; g.strokeRect(w * x, h * y, w * 0.16, h * 0.12); }
  g.fillStyle = '#3a2416'; g.fillRect(w * 0.7, h * 0.66, w * 0.14, h * 0.3);
  g.fillStyle = roof; g.beginPath(); g.moveTo(0, h * 0.36); g.lineTo(w * 0.3, h * 0.08); g.lineTo(w * 0.66, h * 0.36); g.fill();
  g.fillStyle = '#9c6a40'; g.beginPath(); g.moveTo(w * 0.3, h * 0.08); g.lineTo(w * 0.78, h * 0.12); g.lineTo(w, h * 0.44); g.lineTo(w * 0.6, h * 0.36); g.fill();
  g.strokeStyle = 'rgba(50,25,10,0.45)'; for (let k = 0; k < 14; k++) { const u = k / 14; g.beginPath(); g.moveTo(lerp(w * 0.3, w * 0.78, u), lerp(h * 0.08, h * 0.12, u)); g.lineTo(lerp(w * 0.6, w, u), lerp(h * 0.36, h * 0.44, u)); g.stroke(); }
  g.fillStyle = '#5a3a24'; g.fillRect(w * 0.0, h * 0.53, w * 0.62, h * 0.03); // ban công
  for (let x = 0.02; x < 0.6; x += 0.05) g.fillRect(w * x, h * 0.53, 5, h * 0.08);
  return c;
}

// ===================== BACKGROUND (tranh nền vẽ một lần) =====================
function town(g, r, pts, yTop, yBot, n) { // pts: polygon of land where town lies
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const roofs = ['#f2efe6', '#e6e1d4', '#c9c2b4', '#a9a49b', '#c86b4a', '#8b5a43', '#5b7fa8', '#d9cdb4', '#ffffff'];
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = yTop + (yBot - yTop) * Math.pow(r(), 0.8); if (!inside(x, y)) continue;
    if (Math.sin(x * 0.021 + 1.3) + Math.sin(y * 0.05 + x * 0.008) + Math.sin(x * 0.006 - y * 0.02) < -0.2 + r() * 0.6) continue;
    const k = 0.35 + 1.6 * (y - yTop) / (yBot - yTop), s = (2.2 + r() * 2.8) * k;
    g.fillStyle = 'rgba(30,50,40,0.35)'; g.fillRect(x + s * 0.3, y + s * 0.4, s * 1.4, s * 0.8);
    g.fillStyle = roofs[r() * roofs.length | 0]; g.fillRect(x, y, s * 1.4, s * 0.8);
    if (r() < 0.25) { g.fillStyle = hsl(110, 45, 28 + r() * 10); g.beginPath(); g.arc(x + s * 2, y + s * 0.5, s * 0.7, 0, 7); g.fill(); }
  }
}
function ridge(g, r, y0, amp, freq, fill, x0 = 0, x1 = W, base = H) {
  g.fillStyle = fill; g.beginPath(); g.moveTo(x0, base); const p = r() * 10, p2 = r() * 10;
  for (let x = x0; x <= x1; x += 6) g.lineTo(x, y0 - amp * (0.6 * Math.sin(x * freq + p) + 0.4 * Math.sin(x * freq * 2.3 + p2)));
  g.lineTo(x1, base); g.fill();
}
function texDots(g, r, x0, y0, x1, y1, n, cols, s0, s1) { for (let i = 0; i < n; i++) { const y = lerp(y0, y1, r()); g.fillStyle = cols[r() * cols.length | 0]; const s = lerp(s0, s1, (y - y0) / (y1 - y0 || 1)) * (0.6 + r() * 0.8); g.beginPath(); g.arc(lerp(x0, x1, r()), y, s, 0, 7); g.fill(); } }

function skyAndClouds(th, r, layers) {
  const [c, g] = mk(W, H); const {yH} = th;
  const gr = g.createLinearGradient(0, 0, 0, yH + 10); gr.addColorStop(0, th.sky[0]); gr.addColorStop(0.45, th.sky[1]); gr.addColorStop(0.85, th.sky[2]); gr.addColorStop(1, th.sky[3]);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // mây: dải mây tích ở chân trời + vài cụm lẻ trên cao (vẽ riêng để trôi)
  const big = [], xs = [80, 420, 760, 1060, -200];
  for (const [i, cx] of xs.entries()) { const w = (i % 2 ? 330 : 260) + r() * 160, h = Math.min(yH - 50, w * (0.7 + r() * 0.35)); big.push({spr: cloudSprite(r, w, h, 0.75 + r() * 0.5), x: cx - w / 2 + (r() - 0.5) * 80, y: yH - h * 0.88 + 4, v: 2 + r() * 2}); }
  for (let i = 0; i < 6; i++) { const w = 160 + r() * 160, h = w * 0.5; big.push({spr: cloudSprite(r, w, h, 0.4), x: r() * W, y: yH - h * 0.85 + 2, v: 3 + r() * 2}); }
  big.sort((a, b) => b.spr.height - a.spr.height);
  const small = []; for (let i = 0; i < 7; i++) { const w = 70 + r() * 120; small.push({spr: cloudSprite(r, w, w * 0.45, 0.25), x: r() * W, y: 30 + r() * (yH * 0.5), v: 4 + r() * 4}); }
  layers.clouds = [...small, ...big];
  return c;
}

function bgSea(th, r) {
  const layers = {}; const sky = skyAndClouds(th, r, layers), {yH} = th;
  const [c, g] = mk(W, H);
  // biển
  const sea = g.createLinearGradient(0, yH, 0, H * 0.6); sea.addColorStop(0, '#2c6fc4'); sea.addColorStop(0.08, '#0d4aa8'); sea.addColorStop(1, '#0a3a8c');
  g.fillStyle = sea; g.fillRect(0, yH, W, H - yH);
  for (let i = 0; i < 900; i++) { const y = yH + Math.pow(r(), 1.6) * (H * 0.5 - yH), k = (y - yH) / (H * 0.5 - yH); g.fillStyle = `rgba(${r() < 0.5 ? '120,180,255' : '255,255,255'},${0.08 + r() * 0.25})`; g.fillRect(r() * W, y, 4 + k * 40 * r(), 1 + k * 2); }
  // bờ biển: đường cong từ giữa xuống trái, đất liền bên phải
  const coast = u => [lerp(W * 0.6, W * 0.06, smooth(u)) + Math.sin(u * 9) * 14, lerp(yH + 40, th.yV + 140, u)];
  const land = [[W * 0.56, yH + 28], [W * 0.75, yH + 18], [W, yH + 22], [W, H], [0, H], [0, th.yV + 160]];
  const cpts = []; for (let u = 1; u >= 0; u -= 0.02) cpts.push(coast(u));
  const poly = [...land, ...cpts];
  // sóng bạc đầu dọc bờ
  for (let k = 0; k < 4; k++) for (let u = 0.15; u <= 1; u += 0.009) { const [x, y] = coast(u); const off = 14 + k * k * (10 + u * 22) + Math.sin(u * 40 + k) * 6; g.fillStyle = `rgba(255,255,255,${(0.85 - k * 0.11) * (0.5 + u * 0.5)})`; g.fillRect(x - off - u * 10, y + k * 2, 4 + u * 14 + r() * 8, 1.5 + u * 3.5); }
  // bãi cát
  g.fillStyle = '#ead9ae'; g.beginPath(); cpts.forEach(([x, y], i) => i ? g.lineTo(x - 12 - (y - yH) * 0.04, y) : g.moveTo(x - 12, y)); for (let i = cpts.length - 1; i >= 0; i--) g.lineTo(cpts[i][0] + 14, cpts[i][1]); g.fill();
  // đất
  g.fillStyle = '#6f9a4a'; g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.fill();
  g.save(); g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.clip();
  // ruộng xa (mảng xanh nhạt)
  for (let i = 0; i < 220; i++) { const y = yH + 20 + Math.pow(r(), 1.5) * 220, x = r() * W, s = 6 + (y - yH) * 0.25; g.fillStyle = hsl(80 + r() * 30, 40 + r() * 20, 40 + r() * 18, 0.8); g.fillRect(x, y, s * (1 + r()), s * 0.3); }
  // núi đồi bên phải
  g.fillStyle = '#3f6e34'; g.beginPath(); g.moveTo(W * 0.55, th.yV + 200); g.bezierCurveTo(W * 0.7, yH + 150, W * 0.82, yH + 70, W, yH + 60); g.lineTo(W, th.yV + 200); g.fill();
  for (let i = 0; i < 70; i++) { const y = lerp(yH + 80, th.yV + 120, r()), k = (y - yH) / (th.yV - yH), x = lerp(W * 0.62, W, r()) + (1 - k) * 60; foliage(g, r, x, y, 16 + 40 * k, 8 + 22 * k, 112, 10); }
  for (let i = 0; i < 40; i++) { const y = lerp(yH + 60, th.yV - 40, r()), k = (y - yH) / (th.yV - yH), x = lerp(W * 0.3, W * 0.65, r()); foliage(g, r, x, y, 8 + 20 * k, 4 + 10 * k, 110, 6); }
  g.restore();
  town(g, r, [[W * 0.5, yH + 50], [W * 0.66, yH + 45], [W * 0.8, yH + 140], [W * 0.62, th.yV + 40], [W * 0.25, th.yV + 120], [W * 0.18, th.yV + 60]], yH + 40, th.yV + 130, 5200);
  // sương xa
  const haze = g.createLinearGradient(0, yH - 4, 0, yH + 110); haze.addColorStop(0, 'rgba(210,232,250,0.75)'); haze.addColorStop(1, 'rgba(210,232,250,0)'); g.fillStyle = haze; g.fillRect(0, yH - 4, W, 114);
  layers.sky = sky; layers.ground = c; return layers;
}

function bgValley(th, r) {
  const layers = {}; const sky = skyAndClouds(th, r, layers), {yH} = th;
  const [c, g] = mk(W, H);
  ridge(g, r, yH - 10, 40, 0.006, '#7aa3d6'); ridge(g, r, yH + 30, 55, 0.008, '#4f7fbf');
  ridge(g, r, yH + 80, 50, 0.011, '#3b6aa0');
  ridge(g, r, yH + 140, 40, 0.014, '#3f7a52');
  texDots(g, r, 0, yH + 120, W, yH + 300, 900, ['#2f6a40', '#4a8a50', '#5d9e58'], 2, 6);
  town(g, r, [[0, yH + 160], [W, yH + 140], [W, yH + 320], [0, yH + 340]], yH + 150, yH + 330, 3800);
  ridge(g, r, yH + 330, 30, 0.01, '#3c7a3c');
  texDots(g, r, 0, yH + 300, W, H, 1500, ['#2c5f30', '#3e7d3c', '#56984a'], 5, 14);
  const haze = g.createLinearGradient(0, yH - 80, 0, yH + 200); haze.addColorStop(0, 'rgba(200,225,250,0.0)'); haze.addColorStop(0.4, 'rgba(200,225,250,0.45)'); haze.addColorStop(1, 'rgba(200,225,250,0)'); g.fillStyle = haze; g.fillRect(0, yH - 80, W, 280);
  layers.sky = sky; layers.ground = c; return layers;
}

function bgImage(img, horizon, th) { // ảnh phủ ngang khung, đường chân trời của ảnh trùng th.yH
  const k = W / img.width * 1.04, dy = th.yH - horizon * img.height * k;
  const [sky, sx] = mk(W, H), [c, g] = mk(W, H);
  const [p, px] = mk(1, 1); px.drawImage(img, img.width / 2, 2, 1, 1, 0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data;
  sx.fillStyle = `rgb(${d[0]},${d[1]},${d[2]})`; sx.fillRect(0, 0, W, H);
  g.drawImage(img, (W - img.width * k) / 2, dy, img.width * k, img.height * k);
  return {sky, ground: c, clouds: []};
}

// ===================== NHÂN VẬT ĐẠP XE (nhìn từ sau, trên cao) =====================
function cyclist(g, x, yF, t, k = 1) {
  const ph = t * 2 * Math.PI * 0.9, bob = Math.sin(ph * 2) * 2.5 * k;
  g.save(); g.translate(x, yF); g.scale(k, k);
  // bóng đổ (nắng từ trước-phải -> bóng ngả ra sau-trái)
  g.fillStyle = 'rgba(20,30,40,0.38)'; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.quadraticCurveTo(-60, 60, -150, 120); g.quadraticCurveTo(-200, 150, -230, 120); g.quadraticCurveTo(-190, 80, -110, 70); g.quadraticCurveTo(-40, 40, -6, 0); g.fill();
  g.beginPath(); g.ellipse(-120, 105, 70, 26, -0.5, 0, 7); g.fill();
  g.strokeStyle = 'rgba(20,30,40,0.38)'; g.lineWidth = 4; g.beginPath(); g.ellipse(-60, 50, 50, 22, -0.6, 0, 7); g.stroke();
  // bánh trước (lấp ló phía trên)
  g.strokeStyle = '#1d1d22'; g.lineWidth = 9; g.beginPath(); g.ellipse(4, -250, 7, 55, 0, 0, 7); g.stroke();
  // chân (quần kaki), đạp luân phiên
  const leg = (side, a) => {
    const hip = [side * 26, -235 + bob], ped = [side * 34, -80 + Math.sin(a) * 34], knee = [side * 44 + (ped[0] - hip[0]) * 0.1, (hip[1] + ped[1]) / 2 - 18 + Math.cos(a) * 6];
    g.strokeStyle = side < 0 ? '#9a865e' : '#b29b6c'; g.lineWidth = 34; g.lineCap = 'round';
    g.beginPath(); g.moveTo(...hip); g.lineTo(...knee); g.lineTo(ped[0], ped[1] - 10); g.stroke();
    g.fillStyle = '#4a2f1c'; g.beginPath(); g.ellipse(ped[0], ped[1] + 4, 17, 24, 0, 0, 7); g.fill();
  };
  leg(-1, ph); leg(1, ph + Math.PI);
  // bánh sau, chắn bùn, giá chở hàng có túi đỏ
  g.strokeStyle = '#151518'; g.lineWidth = 13; g.beginPath(); g.ellipse(0, -72, 8, 72, 0, 0, 7); g.stroke();
  g.strokeStyle = '#8a8f96'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -140); g.lineTo(0, -10); g.stroke();
  g.fillStyle = '#b8b2a8'; g.fillRect(-8, -150, 16, 70);
  g.fillStyle = '#7d2a22'; g.beginPath(); g.roundRect(-32, -205 + bob * 0.3, 64, 62, 8); g.fill();
  g.fillStyle = '#a63a2c'; g.beginPath(); g.roundRect(-30, -205 + bob * 0.3, 60, 22, 6); g.fill();
  g.fillStyle = '#d24a36'; g.fillRect(-26, -182 + bob * 0.3, 52, 4);
  g.fillStyle = '#e8463a'; g.beginPath(); g.arc(0, -148, 6, 0, 7); g.fill(); // đèn hậu
  // thân áo xanh
  g.translate(0, bob);
  g.fillStyle = '#183f8f'; g.beginPath(); g.moveTo(-50, -230); g.quadraticCurveTo(-64, -330, -66, -392); g.quadraticCurveTo(0, -414, 66, -392); g.quadraticCurveTo(64, -330, 50, -230); g.quadraticCurveTo(0, -218, -50, -230); g.fill();
  // tay áo + cẳng tay vươn tới ghi đông
  for (const s of [-1, 1]) {
    g.strokeStyle = s < 0 ? '#163a84' : '#2252b0'; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(s * 60, -385); g.lineTo(s * 84, -330); g.stroke();
    g.strokeStyle = '#d9a37a'; g.lineWidth = 18; g.beginPath(); g.moveTo(s * 84, -330); g.lineTo(s * 70, -300); g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(30, -395); g.quadraticCurveTo(62, -340, 50, -240); g.lineTo(38, -240); g.quadraticCurveTo(48, -330, 22, -395); g.fill();
  // ba lô vải
  g.fillStyle = '#6e4f32'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 34, -400); g.quadraticCurveTo(s * 58, -380, s * 54, -340); g.lineTo(s * 44, -340); g.quadraticCurveTo(s * 46, -378, s * 26, -394); g.fill(); }
  g.fillStyle = '#a9835a'; g.beginPath(); g.roundRect(-48, -392, 96, 128, 22); g.fill();
  g.fillStyle = '#c29a6c'; g.beginPath(); g.roundRect(-44, -390, 70, 120, 20); g.fill();
  g.fillStyle = '#8c6a46'; g.beginPath(); g.roundRect(-46, -398, 92, 46, [20, 20, 10, 10]); g.fill(); // nắp
  g.fillStyle = '#b48c60'; g.beginPath(); g.roundRect(-40, -396, 62, 36, [18, 18, 8, 8]); g.fill();
  g.fillStyle = '#5c4128'; g.fillRect(-3, -360, 6, 14);
  g.fillStyle = '#9b7650'; g.beginPath(); g.roundRect(-36, -318, 72, 44, 10); g.fill(); g.fillStyle = '#b38c62'; g.beginPath(); g.roundRect(-34, -318, 50, 40, 9); g.fill();
  g.strokeStyle = 'rgba(60,40,20,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, -300); g.lineTo(34, -300); g.stroke();
  // cổ, tóc, nón lá rộng vành (nón cói)
  g.fillStyle = '#c98f66'; g.fillRect(-12, -420, 24, 20);
  g.fillStyle = '#2a1d16'; g.beginPath(); g.ellipse(0, -432, 26, 22, 0, 0, 7); g.fill();
  g.fillStyle = '#a88a5a'; g.beginPath(); g.ellipse(4, -444, 82, 32, 0.05, 0, 7); g.fill();
  g.fillStyle = '#e6d3a4'; g.beginPath(); g.ellipse(2, -449, 80, 30, 0.05, 0, 7); g.fill();
  g.fillStyle = '#d8c290'; g.beginPath(); g.ellipse(2, -462, 32, 26, 0, Math.PI, 0); g.fill(); g.fillRect(-30, -462, 64, 8);
  g.fillStyle = '#f3e6c2'; g.beginPath(); g.ellipse(12, -470, 16, 12, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#5a3a22'; g.fillRect(-31, -462, 66, 7);
  g.restore();
}

// ===================== THẾ GIỚI (đường đá, cỏ hoa, cây, nhà) =====================
function makeWorld(th, seed, art = {}) {
  const r = R(seed * 31 + 7), hue0 = th.grass[0], hue1 = th.grass[1];
  const spr = {tuft: [], flower: [], bush: [], tree: [], house: houseSprite(r)};
  for (let i = 0; i < 8; i++) spr.tuft.push(tuftSprite(r, lerp(hue0, hue1, r())));
  const kinds = ['daisy', 'ball', 'cluster'];
  for (const [pi, f] of th.flowers.entries()) for (let i = 0; i < 4; i++) {
    const kind = f[0] === '#ffffff' || f[0] === '#fff3a8' ? 'daisy' : f[0].startsWith('#ff9') || f[0].startsWith('#ffb') ? 'ball' : kinds[(pi + i) % 3];
    spr.flower.push({c: flowerSprite(r, lerp(hue0, hue1, r()), f, kind), w: f[2]});
  }
  for (let i = 0; i < 6; i++) spr.bush.push(bushSprite(r, lerp(hue0, hue1, r())));
  for (let i = 0; i < 3; i++) spr.tree.push(treeSprite(r, lerp(hue0 - 5, hue1, r())));
  // bộ hình vẽ sẵn (ảnh Gemini đã xóa nền) thay cho hình vẽ code khi có
  if (art.tree?.length) spr.tree = art.tree;
  if (art.house) spr.house = art.house;
  if (art.bush?.length) spr.bush = Array.from({length: 6}, (_, i) => art.bush[i % art.bush.length]);
  const pickFlower0 = q => { let a = q * th.flowers.reduce((s, f) => s + f[2], 0) * 4; for (const f of spr.flower) { a -= f.w; if (a <= 0) return f.c; } return spr.flower[0].c; };
  const AF = 0.3, pickFlower = q => art.flower?.length && q < AF ? art.flower[Math.floor(q / AF * art.flower.length) % art.flower.length] : pickFlower0(art.flower?.length ? (q - AF) / (1 - AF) : q);
  // vật thể theo ô: deterministic theo chỉ số ô
  const cache = new Map();
  const cell = i => {
    if (cache.has(i)) return cache.get(i);
    const q = R(seed * 7919 + i * 104729 + 13), zw = i * CELL, out = [];
    for (const s of [-1, 1]) {
      out.push({X: s * (1.08 + q() * 0.25), zw: zw + q() * CELL, img: spr.tuft[q() * 8 | 0], hw: 0.45 + q() * 0.4, flip: q() < 0.5});
      for (let k = 0; k < 1; k++) out.push({X: s * (1.4 + Math.pow(q(), 1.3) * 9), zw: zw + q() * CELL, img: spr.tuft[q() * 8 | 0], hw: 0.5 + q() * 0.6, flip: q() < 0.5});
      if (q() < 0.95) out.push({X: s * (1.2 + q() * 1.2), zw: zw + q() * CELL, img: pickFlower(q()), hw: 0.8 + q() * 0.9, flip: q() < 0.5});
      if (q() < 0.7) out.push({X: s * (2.4 + q() * 3.5), zw: zw + q() * CELL, img: q() < 0.65 ? pickFlower(q()) : spr.tuft[q() * 8 | 0], hw: 1 + q() * 1, flip: q() < 0.5});
      if (q() < 0.05) out.push({X: s * (2.6 + q() * 3), zw: zw + q() * CELL, img: spr.bush[q() * 6 | 0], hw: 1.4 + q() * 1.2, flip: q() < 0.5});
      if (q() < 0.07) out.push({X: s * (5 + q() * 6), zw: zw + q() * CELL, img: spr.bush[q() * 6 | 0], hw: 2 + q() * 2, flip: q() < 0.5});
    }
    // cây lớn bên phải, nhà gỗ bên trái theo nhịp
    if (i % 40 === 23 && q() < th.tree + 0.3) out.push({X: 2.7 + q() * 1.4, zw, img: spr.tree[q() * spr.tree.length | 0], hw: 7 + q() * 2.5, flip: q() < 0.5, big: true});
    if (i % 40 === 5 && q() < th.tree) out.push({X: -(3 + q() * 1.6), zw, img: spr.tree[q() * spr.tree.length | 0], hw: 6 + q() * 2, flip: true, big: true});
    if (th.house && i % 120 === 30) out.push({X: -3.4, zw, img: spr.house, hw: 7, flip: false, big: true});
    cache.set(i, out); if (cache.size > 2000) cache.delete(cache.keys().next().value);
    return out;
  };
  return {cell, r};
}

// ===================== KHUNG HÌNH =====================
function makeShotRenderer(sh) {
  const th0 = THEMES[sh.theme || 'bien']; if (!th0) throw new Error('theme? ' + sh.theme);
  // ảnh nền vẽ sẵn (ảnh Gemini): đặt đường chân trời của ảnh vào yH, điểm tụ của đường dịch theo
  const yH = sh.bg ? (sh.yH ?? 430) : th0.yH, th = {...th0, yH, yV: sh.yV ?? th0.yV + (yH - th0.yH) * 0.35};
  const seed = sh.seed ?? 3, r = R(seed);
  const bg = sh._img ? bgImage(sh._img, sh.horizon ?? 0.3, th) : th.bg === 'sea' ? bgSea(th, r) : bgValley(th, r);
  const world = makeWorld(th, seed, sh._art || {});
  const [fg, fgx] = mk(W, H), [tmp, tmpx] = mk(W, H), [mask, maskx] = mk(W, H), [out, o] = mk(W, H), [fin, fx] = mk(W, H);
  // mặt nạ mờ chuyển động: trong suốt ở giữa (quanh xe và điểm tụ), đậm dần ra mép và đáy
  { const gr = maskx.createRadialGradient(CX, th.yV + 240, 120, CX, th.yV + 300, 900); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); maskx.fillStyle = gr; maskx.fillRect(0, 0, W, H); }
  const [A, w1, B, w2] = th.bend, curve = zw => A * Math.sin(zw * w1 + seed) + B * Math.sin(zw * w2 + seed * 2);
  const speed = sh.speed ?? 4.2;
  const bands = []; for (let v = 0; v < 6; v++) { const [b, bx] = mk(2400, 140), hue = lerp(th.grass[0], th.grass[1], v / 5);
    for (let i = 0; i < 2600; i++) { const x = r() * 2400, bh = 50 + r() * 88, lean = (r() - 0.5) * 30, bw = 2.5 + r() * 4.5, back = i < 900;
      bx.fillStyle = hsl(hue + (r() - 0.5) * 26, 42 + r() * 25, back ? 14 + r() * 12 : 22 + r() * 30 + (v % 3) * 3);
      bx.beginPath(); bx.moveTo(x - bw, 140); bx.quadraticCurveTo(x + lean * 0.3, 140 - bh * 0.6, x + lean, 140 - bh); bx.quadraticCurveTo(x + lean * 0.3 + bw, 140 - bh * 0.6, x + bw, 140); bx.fill(); }
    bands.push(b); }
  // nền đất: chỉ một dải màu trơn (mọi chi tiết cỏ đều chạy theo phối cảnh, không có lớp vẽ đứng yên)
  const [verge, vx] = mk(W, H);
  { const gr = vx.createLinearGradient(0, th.yV, 0, H); gr.addColorStop(0, hsl(th.grass[0] - 8, 40, 32)); gr.addColorStop(1, hsl(th.grass[1], 45, 20)); vx.fillStyle = gr; vx.fillRect(0, th.yV - 30, W, H);
  }

  return (t, tl) => { // t: thời gian tuyệt đối, tl: thời gian trong shot
    const s = 3 + tl * speed, ctx = fgx;
    const cam = curve(s), dcam = (curve(s + 0.5) - curve(s)) / 0.5;
    const bendAt = z => curve(s + z) - cam - z * dcam;
    const sway = Math.sin(tl * 0.6) * 8 + dcam * 40, roll0 = -dcam * 0.03;
    const yOf = z => th.yV + CAMH * F / z, xOf = (X, z) => CX + sway + (X + bendAt(z)) * F / z;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1;
    // nền: trời + mây trôi + đất xa, phóng chậm (camera tiến tới)
    const zoom = 1 + tl * 0.006, ox = -dcam * 25 - sway * 0.3;
    o.drawImage(bg.sky, 0, 0);
    for (const cl of bg.clouds) { const x = ((cl.x + t * cl.v + 300) % (W + 600)) - 300; o.drawImage(cl.spr, x + ox * 0.3, cl.y); }
    o.save(); o.translate(CX, th.yH); o.scale(zoom, zoom); o.translate(-CX + ox, -th.yH); o.drawImage(bg.ground, 0, 0); o.restore();
    // tiền cảnh
    ctx.clearRect(0, 0, W, H);
    // nền cỏ: chỉ phần dưới đường viền đồi (zmax)
    const crest = yOf(ZMAX);
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, crest + 30 + 22 * Math.sin(x * 0.013 + seed) + (th.slopeRight ? -(x - CX) * 0.05 : 0)); ctx.lineTo(W, H); ctx.clip(); ctx.drawImage(verge, 0, 0); ctx.restore();
    // thảm cỏ: từng hàng cỏ gắn với mặt đất ở độ sâu z, trôi và to dần theo phối cảnh (không có lớp cỏ đứng yên)
    const GR = 0.32, gFar = Math.floor((s + ZMAX) / GR), gNear = Math.floor((s + 1.0) / GR);
    for (let gi = gFar; gi >= gNear; gi--) {
      const q = R(gi * 40503 + seed * 17), z = gi * GR - s; if (z < 1.0) continue;
      const band = bands[gi % bands.length], bh = 0.42 * F / z * 0.55, xL = xOf(-16, z), xR = xOf(16, z), sw = band.width * 0.5, sx = q() * (band.width - sw);
      ctx.globalAlpha = clamp((ZMAX - z) / 8);
      ctx.drawImage(band, sx, 0, sw, band.height, xL, yOf(z) - bh, xR - xL, bh * 1.08);
    }
    ctx.globalAlpha = 1;
    // mặt đường: dải nền rồi từng hàng đá, xa -> gần
    const iFar = Math.floor((s + ZMAX) / CELL), iNear = Math.floor((s + ZMIN * 0.6) / CELL);
    const pathW = 1.1;
    ctx.fillStyle = '#5a6a3a';
    ctx.beginPath(); for (let z = ZMAX; z >= ZMIN * 0.6; z *= 0.93) ctx.lineTo(xOf(-pathW - 0.05, z), yOf(z)); ctx.lineTo(xOf(-pathW, 0.5), H * 1.5); ctx.lineTo(xOf(pathW, 0.5), H * 1.5); for (let z = ZMIN * 0.6; z <= ZMAX; z /= 0.93) ctx.lineTo(xOf(pathW + 0.05, z), yOf(z)); ctx.fill();
    const ROW = 0.42, rFar = Math.floor((s + ZMAX) / ROW), rNear = Math.floor((s + 0.9) / ROW);
    for (let ri = rFar; ri >= rNear; ri--) {
      const q = R(ri * 2654435761 + seed), z0 = ri * ROW - s, z1 = z0 + ROW * 0.9; if (z1 < 0.9) continue;
      const za = Math.max(0.9, z0 + 0.03), zb = z1;
      const n = 3 + (q() < 0.4 ? 1 : 0), cuts = [-pathW]; for (let k = 1; k < n; k++) cuts.push(-pathW + 2 * pathW * (k + (q() - 0.5) * 0.5) / n); cuts.push(pathW);
      const fade = clamp((ZMAX - za) / 8);
      for (let k = 0; k < n; k++) {
        const x0 = cuts[k] + 0.04, x1 = cuts[k + 1] - 0.04, l = 62 + q() * 16, hh = 34 + q() * 12, sat = 16 + q() * 18, j = () => (q() - 0.5) * 0.08;
        const P = [[x0 + j(), zb + j()], [x1 + j(), zb + j()], [x1 + j(), za + j() * 0.5], [x0 + j(), za + j() * 0.5]].map(([X, z]) => [xOf(X, Math.max(0.85, z)), yOf(Math.max(0.85, z))]);
        const th3 = 0.06 * F / za * 0.35; // độ dày mặt trước
        ctx.globalAlpha = fade;
        roundPoly(ctx, P.map(([x, y]) => [x, y + th3]), 0.3); ctx.fillStyle = hsl(hh, sat, l * 0.62); ctx.fill();
        roundPoly(ctx, P, 0.3); ctx.fillStyle = hsl(hh, sat, l); ctx.fill();
        if (sh._art?.stone && za < 30) { // vân đá vẽ sẵn: mỗi viên lấy một mảng khác nhau
          const st = sh._art.stone, xs = P.map(p => p[0]), ys = P.map(p => p[1]), bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh2 = Math.max(...ys) - by;
          const sw = st.width * (0.3 + q() * 0.25), sh2 = sw * clamp(bh2 / Math.max(1, bw), 0.25, 1);
          ctx.save(); roundPoly(ctx, P, 0.3); ctx.clip(); ctx.globalAlpha = fade * 0.82; ctx.drawImage(st, q() * (st.width - sw), q() * (st.height - sh2), sw, sh2, bx, by, bw, bh2); ctx.restore();
          ctx.globalAlpha = fade * 0.18; roundPoly(ctx, P, 0.3); ctx.fillStyle = hsl(hh, sat, l); ctx.fill(); ctx.globalAlpha = fade;
        }
        if (za < 14) { // ánh sáng mép xa, vệt nứt
          ctx.strokeStyle = hsl(hh, sat, Math.min(94, l + 14), 0.8); ctx.lineWidth = Math.max(1, 5 / za * 2); ctx.beginPath(); ctx.moveTo(lerp(P[0][0], P[1][0], 0.15), lerp(P[0][1], P[1][1], 0.15) + 2); ctx.lineTo(lerp(P[0][0], P[1][0], 0.85), lerp(P[0][1], P[1][1], 0.85) + 2); ctx.stroke();
          if (q() < 0.4) { ctx.strokeStyle = hsl(hh, sat, l * 0.6, 0.6); ctx.lineWidth = Math.max(1, 3 / za * 2); ctx.beginPath(); const u = 0.3 + q() * 0.4; ctx.moveTo(lerp(P[0][0], P[1][0], u), lerp(P[0][1], P[1][1], u) + 3); ctx.lineTo(lerp(P[3][0], P[2][0], u + (q() - 0.5) * 0.3), lerp(P[3][1], P[2][1], 0.5)); ctx.stroke(); }
          if (q() < 0.5) { ctx.fillStyle = hsl(95, 45, 35, 0.7); const u = q(); ctx.beginPath(); ctx.ellipse(lerp(P[3][0], P[2][0], u), P[3][1] + 2, 10 / za * 3, 3 / za * 3, 0, 0, 7); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
      }
    }
    // vật thể hai bên, xa -> gần; xe chen vào đúng độ sâu
    const ZCYC = 6.4;
    const objs = []; for (let i = iFar; i >= iNear; i--) for (const ob of world.cell(i)) { const z = ob.zw - s; if (z > ZMIN * (ob.big ? 1.2 : 0.75) && z < ZMAX) objs.push([z, ob]); }
    objs.sort((a, b) => b[0] - a[0]);
    for (const [z, ob] of objs) {
      const asp = ob.img.width / ob.img.height, h = ob.hw * F / z * 0.55 / (!ob.big && asp > 1.3 ? asp * 0.7 : 1), w = h * asp; if (h < 3) continue;
      const x = xOf(ob.X, z), y = yOf(z) + h * 0.04;
      const a = clamp((ZMAX - z) / 6);
      ctx.globalAlpha = a;
      // bóng dưới gốc (nắng trước-phải -> bóng ngả sau-trái) để vật "mọc" từ đất
      ctx.fillStyle = 'rgba(8,28,10,0.32)'; ctx.beginPath(); ctx.ellipse(x - w * (ob.big ? 0.12 : 0.08), y + h * 0.01, w * (ob.big ? 0.22 : 0.42), Math.max(1, w * (ob.big ? 0.05 : 0.1) * CAMH / z), 0, 0, 7); ctx.fill();
      if (ob.big) { ctx.save(); ctx.translate(x, y); if (ob.flip) ctx.scale(-1, 1); if (z < 4) ctx.filter = `blur(${((4 - z) * 3).toFixed(1)}px)`; ctx.drawImage(ob.img, -w / 2, -h, w, h); ctx.restore(); }
      else if (z < 3.4) { // gần sát ống kính: nhòe theo độ sâu + vệt hướng tâm
        ctx.filter = `blur(${((3.4 - z) * 5 + 1).toFixed(1)}px)`;
        const dx = (x - CX), dy = (y - th.yV); for (let k = 2; k >= 0; k--) { ctx.globalAlpha = a * (k ? 0.3 : 0.85); const m = 1 + k * 0.05; ctx.drawImage(ob.img, CX + dx * m - w / 2 * m, th.yV + dy * m - h * m, w * m, h * m); }
        ctx.filter = 'none';
      } else { if (ob.flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(ob.img, -w / 2, y - h, w, h); ctx.restore(); } else ctx.drawImage(ob.img, x - w / 2, y - h, w, h); }
      ctx.globalAlpha = 1;
    }
    // mờ chuyển động hướng tâm cho tiền cảnh
    tmpx.clearRect(0, 0, W, H);
    for (let k = 1; k <= 3; k++) { const m = 1 + k * 0.022; tmpx.globalAlpha = 0.3; tmpx.drawImage(fg, CX - CX * m, th.yV - th.yV * m, W * m, H * m); }
    tmpx.globalAlpha = 1; tmpx.globalCompositeOperation = 'destination-in'; tmpx.drawImage(mask, 0, 0); tmpx.globalCompositeOperation = 'source-over';
    o.drawImage(fg, 0, 0); o.drawImage(tmp, 0, 0);
    // xe vẽ sau cùng (không mờ)
    const cxp = CX + sway * 0.6 + Math.sin(tl * 0.9) * 6, cyp = yOf(ZCYC);
    if (sh._art?.cyclist) { // người đạp xe vẽ sẵn: bóng đổ + nhún theo nhịp đạp + lắc nhẹ
      const img = sh._art.cyclist, hh = 560, ww = hh * img.width / img.height, ph = t * 2 * Math.PI * 0.9;
      o.fillStyle = 'rgba(20,30,40,0.36)'; o.beginPath(); o.moveTo(cxp - 6, cyp); o.quadraticCurveTo(cxp - 70, cyp + 60, cxp - 170, cyp + 115); o.quadraticCurveTo(cxp - 215, cyp + 140, cxp - 235, cyp + 112); o.quadraticCurveTo(cxp - 150, cyp + 70, cxp + 6, cyp); o.fill();
      o.save(); o.translate(cxp, cyp + Math.sin(ph * 2) * 2.5); o.rotate(Math.sin(ph) * 0.018 + roll0);
      const A = sh._art;
      if (A.cyclistTop && A.cyclistBike) { // thân trên + xe vẽ sẵn, chân đạp vẽ bằng code ở giữa hai lớp
        const k = hh / img.height; o.scale(k, k); o.translate(-img.width / 2, -img.height);
        drawLegs(o, ph); o.drawImage(A.cyclistTop, 0, 0); o.drawImage(A.cyclistBike, 0, 0);
      } else o.drawImage(img, -ww / 2, -hh, ww, hh);
      o.restore();
    } else cyclist(o, cxp, cyp, t, 0.98);
    // ánh nắng + họa tiết màu
    const sun = o.createRadialGradient(W * 0.85, th.yH * 0.4, 20, W * 0.85, th.yH * 0.4, 900); sun.addColorStop(0, 'rgba(255,250,225,0.35)'); sun.addColorStop(1, 'rgba(255,250,225,0)'); o.fillStyle = sun; o.fillRect(0, 0, W, H);
    const vg = o.createRadialGradient(CX, H * 0.48, H * 0.35, CX, H * 0.5, H * 0.75); vg.addColorStop(0, 'rgba(0,10,30,0)'); vg.addColorStop(1, 'rgba(0,10,30,0.28)'); o.fillStyle = vg; o.fillRect(0, 0, W, H);
    // camera nghiêng nhẹ theo khúc cua và rung tay
    const curv = (curve(s + 10) - 2 * curve(s + 5) + curve(s)) / 25, roll = clamp(-curv * 6, -0.025, 0.025) + Math.sin(tl * 0.8) * 0.005;
    fx.setTransform(1, 0, 0, 1, 0, 0); fx.translate(CX, H * 0.55); fx.rotate(roll); fx.scale(1.065, 1.065); fx.translate(-CX, -H * 0.55); fx.drawImage(out, 0, 0); fx.setTransform(1, 0, 0, 1, 0, 0);
    return fin;
  };
}
// Chân đạp xe nhìn từ sau, toạ độ theo ảnh cyclist.png (301x900): hông y≈445, trục giữa x≈152, đùi giò cùng màu quần kaki của ảnh.
function drawLegs(g, ph) {
  // Nhìn từ sau, hơi cao: bàn đạp quay quanh trục giữa (x 152, y 690) nên bàn chân chủ yếu lên xuống sát hai bên bánh xe.
  // Chân lên: gối nhấc cao, bắp chân ngắn lại (gập gối, bị phối cảnh rút ngắn). Chân xuống: gần như duỗi thẳng.
  const PANT_L = '#dcc497', SHOE = '#8a472a', SHOE_D = '#4d2918';
  const limb = (p, q, w1, w2, col) => { // khối thon: thân là tứ giác hai mép hơi phồng, hai đầu tròn
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, wm = (w1 + w2) / 2 * 1.1;
    g.fillStyle = col; g.beginPath();
    g.moveTo(p[0] + nx * w1 / 2, p[1] + ny * w1 / 2); g.quadraticCurveTo(mx + nx * wm / 2, my + ny * wm / 2, q[0] + nx * w2 / 2, q[1] + ny * w2 / 2);
    g.lineTo(q[0] - nx * w2 / 2, q[1] - ny * w2 / 2); g.quadraticCurveTo(mx - nx * wm / 2, my - ny * wm / 2, p[0] - nx * w1 / 2, p[1] - ny * w1 / 2); g.closePath(); g.fill();
    g.beginPath(); g.arc(p[0], p[1], w1 / 2, 0, 7); g.fill(); g.beginPath(); g.arc(q[0], q[1], w2 / 2, 0, 7); g.fill();
  };
  const legs = [-1, 1].map(side => {
    const a = ph + (side > 0 ? Math.PI : 0), up = (1 - Math.cos(a)) / 2; // up: 0 = bàn đạp dưới cùng, 1 = trên cùng
    const foot = [152 + side * (46 + 4 * Math.sin(a)), 748 - 112 * up];
    const hip = [152 + side * 76, 445];
    const knee = [152 + side * (58 + 14 * up), lerp(612, 522, up)];
    const ankle = [foot[0] + side * 2, foot[1] - 22];
    return {side, up, foot, hip, knee, ankle};
  });
  legs.sort((p, q) => q.up - p.up); // chân đang nhấc cao vẽ trước (xa camera hơn một chút)
  for (const L of legs) {
    const {side, foot, hip, knee, ankle} = L, sh = side * 3;
    const PANT = side < 0 ? '#ad9061' : '#c8a974', PANT_D = side < 0 ? '#7a6140' : '#927650'; // khớp màu quần trong ảnh: chân trái khuất nắng
    limb(hip, knee, 80, 54, PANT_D); limb(knee, ankle, 52, 38, PANT_D);
    limb([hip[0] + sh, hip[1]], [knee[0] + sh, knee[1]], 70, 46, PANT); limb([knee[0] + sh, knee[1]], [ankle[0] + sh, ankle[1]], 44, 31, PANT);
    limb([hip[0] + side * 18, hip[1] + 8], [knee[0] + side * 13, knee[1] - 4], 12, 8, PANT_L);
    g.strokeStyle = PANT_D; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(knee[0] - 17, knee[1] - 6); g.quadraticCurveTo(knee[0], knee[1] + 7, knee[0] + 17, knee[1] - 6); g.stroke();
    g.beginPath(); g.moveTo(knee[0] - 10, knee[1] + 14); g.quadraticCurveTo(knee[0] + side * 4, knee[1] + 24, knee[0] + 12, knee[1] + 16); g.stroke();
    g.fillStyle = PANT_D; g.beginPath(); g.ellipse(ankle[0], ankle[1] + 3, 19, 7, 0, 0, 7); g.fill();
    g.fillStyle = '#2a2a2e'; g.fillRect(foot[0] - 20, foot[1] + 14, 40, 7); // bàn đạp
    g.fillStyle = SHOE_D; g.beginPath(); g.ellipse(foot[0], foot[1] + 5, 21, 17, 0, 0, 7); g.fill();
    g.fillStyle = SHOE; g.beginPath(); g.ellipse(foot[0] - 1, foot[1] + 1, 18, 14, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,220,180,0.35)'; g.beginPath(); g.ellipse(foot[0] + 5, foot[1] - 4, 7, 4, 0, 0, 7); g.fill();
  }
}
function roundPoly(g, P, k) { g.beginPath(); const n = P.length; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n], p = P[(i + n - 1) % n]; const s = [lerp(a[0], p[0], k * 0.5), lerp(a[1], p[1], k * 0.5)], e = [lerp(a[0], b[0], k * 0.5), lerp(a[1], b[1], k * 0.5)]; i ? g.lineTo(...s) : g.moveTo(...s); g.quadraticCurveTo(a[0], a[1], ...e); } g.closePath(); }

// ===================== ÂM THANH: gió, chim, nhạc nền êm tự tổng hợp =====================
function ambience(dur, music) {
  const N = Math.ceil(dur * SR), buf = new Float32Array(N), r = R(99);
  let lp = 0, lp2 = 0;
  for (let i = 0; i < N; i++) { const t = i / SR; lp += 0.015 * ((r() * 2 - 1) - lp); lp2 += 0.04 * (lp - lp2); buf[i] = lp2 * 3.2 * (0.6 + 0.4 * Math.sin(t * 0.7) * Math.sin(t * 0.23 + 1)) * Math.min(1, t / 1.5, (dur - t) / 1.5); }
  for (let b = 0; b < dur / 2.2; b++) { const t0 = 0.8 + b * 2.2 + r() * 1.5, f0 = 2800 + r() * 1800, nn = 2 + (r() * 3 | 0); for (let c = 0; c < nn; c++) { const st = t0 + c * 0.13, L = 0.09; for (let j = 0; j < L * SR; j++) { const i = Math.round(st * SR) + j; if (i >= N) break; const u = j / (L * SR); buf[i] += Math.sin(2 * Math.PI * (f0 + 900 * Math.sin(u * 3.14)) * j / SR) * Math.sin(Math.PI * u) * 0.05; } } }
  if (music) { // vòng hợp âm I–vi–IV–V (Fa trưởng), pad mềm + nốt gảy
    const chords = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 58]], hz = m => 440 * 2 ** ((m - 69) / 12), bar = 2.4;
    for (let i = 0; i < N; i++) { const t = i / SR, c = chords[Math.floor(t / bar) % 4], u = (t % bar) / bar; let v = 0; for (const m of c) v += Math.sin(2 * Math.PI * hz(m) * t) * 0.5 + Math.sin(2 * Math.PI * hz(m) * 2 * t) * 0.12; buf[i] += v * 0.028 * Math.min(1, u * 6, (1 - u) * 6 + 0.5) * Math.min(1, t / 2, (dur - t) / 2); }
    const mel = [72, 76, 77, 76, 74, 72, 69, 72]; for (let n = 0; n * 0.6 < dur - 1; n++) { if (r() < 0.25) continue; const st = n * 0.6, m = mel[n % 8] + (Math.floor(n / 8) % 2 ? 0 : 0); for (let j = 0; j < 1.2 * SR; j++) { const i = Math.round(st * SR) + j; if (i >= N) break; const tt = j / SR; buf[i] += Math.sin(2 * Math.PI * hz(m) * tt) * Math.exp(-tt * 3.2) * 0.07 * Math.min(1, (dur - st) / 2); } }
  }
  return buf;
}

// ===================== MAIN =====================
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const file = args.find(a => a.endsWith('.json')); if (!file) { console.error('usage: node phong-canh.mjs phongcanh.json [--from S] [--to S] [--still T]'); process.exit(2); }
const base = path.dirname(path.resolve(file)), S = JSON.parse(fs.readFileSync(file, 'utf8'));
const fps = Number(opt('--fps', S.fps || 30)), dur = S.duration || S.shots.at(-1).end;
const artCache = {}, img = async f => artCache[f] ??= await loadImage(f);
for (const sh of S.shots) {
  if (sh.bg) sh._img = await img(path.join(base, sh.bg));
  const a = sh.art ?? S.art; if (!a) continue; // {"dir": "...", "tree": [...], "house": "...", "flower": [...], "bush": [...], "cyclist": "..."}
  const d = path.join(base, a.dir || '.'), load = async x => x ? img(path.join(d, x.endsWith('.png') ? x : x + '.png')) : undefined;
  sh._art = {tree: await Promise.all((a.tree || []).map(load)), house: await load(a.house), stone: await load(a.stone), cyclistTop: a.cyclist ? await load(a.cyclist + '-top').catch(() => undefined) : undefined, cyclistBike: a.cyclist ? await load(a.cyclist + '-bike').catch(() => undefined) : undefined, flower: await Promise.all((sh.flowersArt || a.flower || []).map(load)), bush: await Promise.all((a.bush || []).map(load)), cyclist: await load(a.cyclist)};
}
const renderers = S.shots.map(sh => ({sh, f: makeShotRenderer(sh)}));
const XF = S.crossfade ?? 0.6;
function frameAt(t) {
  const i = renderers.findIndex(x => t < x.sh.end), k = i < 0 ? renderers.length - 1 : i, cur = renderers[k];
  const img = cur.f(t, t - cur.sh.start);
  const prev = renderers[k - 1]; if (prev && t - cur.sh.start < XF) { const g = img.getContext('2d'), p = prev.f(t, t - prev.sh.start); g.globalAlpha = 1 - (t - cur.sh.start) / XF; g.drawImage(p, 0, 0); g.globalAlpha = 1; }
  return img;
}
const out = path.join(base, 'output'); fs.mkdirSync(out, {recursive: true});
if (opt('--still')) { for (const ts of opt('--still').split(',')) { const p = path.join(out, `still-${ts}.png`); fs.writeFileSync(p, frameAt(Number(ts)).toBuffer('image/png')); console.log(p); } process.exit(0); }
const from = Number(opt('--from', 0)), to = Math.min(Number(opt('--to', dur)), dur), name = opt('--name', from > 0 || to < dur ? 'preview' : 'final');
const tmpV = path.join(out, `.${name}.v.mp4`), tmpA = path.join(out, `.${name}.a.wav`), mp4 = path.join(out, `${name}.mp4`);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', `${fps}`, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', tmpV], {stdio: ['pipe', 'inherit', 'inherit']});
const frames = Math.round((to - from) * fps), t0 = Date.now();
for (let i = 0; i < frames; i++) {
  const jpg = await frameAt(from + i / fps).encode('jpeg', 92);
  if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 60 === 0) process.stderr.write(`  ${i}/${frames} khung, ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r));
writeWav(tmpA, ambience(to - from, S.music === true));
const inputs = ['-i', tmpV, '-i', tmpA], filters = []; let mixIn = '[1:a]';
if (S.narration?.path) { const l = S.narration.lead ?? 0.3; inputs.push('-ss', `${Math.max(0, from - l)}`, '-i', path.join(base, S.narration.path)); filters.push(`[1:a]volume=0.5[amb]`, `[2:a]aresample=${SR},adelay=${Math.round(Math.max(0, l - from) * 1000)}:all=1[nar]`, `[amb][nar]amix=inputs=2:duration=first:normalize=0[mix]`); mixIn = '[mix]'; }
if (S.music?.path) { const idx = inputs.filter(x => x === '-i').length; inputs.push('-stream_loop', '-1', '-i', path.join(base, S.music.path)); filters.push(`[${idx}:a]aresample=${SR},volume=${S.music.gain ?? 0.3}[mus]`, `${mixIn}[mus]amix=inputs=2:duration=first:normalize=0[mx2]`); mixIn = '[mx2]'; }
const fargs = filters.length ? ['-filter_complex', filters.join(';'), '-map', '0:v', '-map', mixIn] : ['-map', '0:v', '-map', '1:a'];
const res = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, ...fargs, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', `${to - from}`, mp4], {stdio: 'inherit'});
if (res.status !== 0) process.exit(1); fs.rmSync(tmpV); fs.rmSync(tmpA);
console.log(JSON.stringify({output: mp4, seconds: +(to - from).toFixed(2), frames, render_s: +((Date.now() - t0) / 1000).toFixed(1)}));
