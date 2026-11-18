// Phong cách "cat-dan": phim tài liệu cắt dán giấy (Vox / "Documentary paper collage").
// Nền giấy báo cũ, ảnh thật in halftone đen trắng cắt kéo viền trắng, giấy xé, băng dính, dấu mộc đỏ,
// dải chữ đánh máy, ghim và dây đỏ, nét bút dạ đỏ tự vẽ, số lớn, dòng thời gian, lưới biểu tượng, biểu đồ.
// Chuyển động kiểu stop-motion "quay đôi" (12 hình/giây), từng mảnh giấy vào cảnh rồi đứng yên như poster sống.
// Vẽ thẳng lên canvas (raster), không qua Recorder. Định dạng: SCENE_FORMAT.md, mục "Phong cách cắt dán".
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {clamp, ease, backOut, rng} from './math.mjs';

export const COLLAGE_TYPES = ['plate', 'cutout', 'scrap', 'tape', 'stampbox', 'strip', 'tack', 'yarn', 'scribble', 'bigstat', 'timeline', 'icons', 'shape', 'headline', 'doc', 'chart'];
export const PAL = {ink: '#1B1916', paper: '#EFE8D8', news: '#E4DAC4', tan: '#D6C4A0', kraft: '#C8A877', red: '#D7261E', yellow: '#F2C230', gray: '#8E8A82', white: '#F7F3EA', black: '#161412', cork: '#B88A57'};
const col = c => PAL[c] || c || PAL.ink;
const HEAD = 'QBKHead', TYPE = 'QBKType';
const FPS_ANIM = 12; // stop-motion "on twos"

// ---------- assets ----------
const imgCache = new Map();
export async function preloadCollage(s) {
  s._cimg ||= new Map();
  for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'cutout' && e.path && !s._cimg.has(e.path)) {
    const f = path.join(s.base, e.path); if (!imgCache.has(f)) imgCache.set(f, await loadImage(f)); s._cimg.set(e.path, imgCache.get(f));
  }
}
export function validateCollage(s, e, where, err) {
  if (!COLLAGE_TYPES.includes(e.type)) return false;
  if (e.type === 'cutout' && e.path && !fs.existsSync(path.join(s.base, e.path))) err(`${where}: missing image ${e.path}`);
  if (e.type === 'cutout' && !e.path && !e.silhouette) err(`${where}: cutout cần "path" (ảnh thật) hoặc "silhouette"`);
  if (e.type === 'yarn' && !(e.points?.length >= 2)) err(`${where}: yarn cần points [[x,y],...]`);
  if (['scrap', 'stampbox', 'strip', 'headline'].includes(e.type) && e.text === undefined) err(`${where}: ${e.type} cần text`);
  return true;
}
// Paper ASMR tự động: mỗi mảnh giấy vào cảnh có một tiếng nhỏ (tắt bằng "paperSfx": false ở cấp scene)
export function collageSfx(s) {
  if (s.paperSfx === false) return;
  const K = {cutout: ['paper', 0.32], scrap: ['paper', 0.22], headline: ['paper', 0.22], tape: ['tape', 0.25], stampbox: ['thud', 0.4], tack: ['tap', 0.25], strip: ['tap', 0.15], shape: ['paper', 0.2], doc: ['paper', 0.25], bigstat: ['tap', 0.2]};
  for (const sh of s.shots) {
    sh.sfx ||= [];
    for (const e of sh.elements || []) { const k = K[e.type]; if (!k || e.enter === 'none' || e.sfx === false) continue; const t = (e.from ?? 0) + (e.type === 'stampbox' ? 0.12 : 0.05); if (t < sh.end - sh.start) sh.sfx.push({t, kind: k[0], gain: k[1]}); }
    if (sh.elements?.some(e => e.type === 'yarn' && e.enter !== 'none')) for (const e of sh.elements.filter(e => e.type === 'yarn')) sh.sfx.push({t: (e.from ?? 0) + (e.grow?.at ?? 0), kind: 'scribble', dur: e.grow?.dur ?? 0.6, gain: 0.12});
  }
}

// ---------- timing ----------
const loc = (e, t) => t - (e.from ?? 0);
const q = t => Math.floor(t * FPS_ANIM + 1e-6) / FPS_ANIM;  // stepped time
function enterK(e, t, dur = 0.42) { if (e.enter === 'none') return 1; return clamp(q(loc(e, t)) / (e.enterDur ?? dur)); }
function exitA(e, t) { return e.to !== undefined && e.exit === 'fade' ? clamp((e.to - t) / 0.25) : 1; }
// living poster: tiny boil every 1/6 s after landing
function boil(e, t, amp = 1) { if (e.still) return [0, 0, 0]; const r = rng(((Math.floor(t * 6) + 1) * 7919 + (e.seed ?? 3) * 131) | 0); return [(r() - 0.5) * 1.6 * amp, (r() - 0.5) * 1.6 * amp, (r() - 0.5) * 0.004 * amp]; }
// Entrance transform: {dx, dy, sc, rot, a, lift}
function entrance(e, t, s) {
  const k = enterK(e, t), kind = e.enter ?? 'slide';
  if (k >= 1 || kind === 'none') return {dx: 0, dy: 0, sc: 1, rot: 0, a: 1, lift: 0};
  const b = backOut(k), lift = 1 - k;
  if (kind === 'slide') { const d = e.dir ?? (((e.x ?? 540) < s.width / 2) ? 'left' : 'right'), D = 900; const v = (1 - b);
    return {dx: d === 'left' ? -D * v : d === 'right' ? D * v : 0, dy: d === 'up' ? -D * v : d === 'down' ? D * v : 0, sc: 1, rot: (1 - k) * 0.08 * (d === 'left' ? -1 : 1), a: 1, lift}; }
  if (kind === 'drop') return {dx: 0, dy: -40 * (1 - k), sc: 1 + 0.18 * (1 - b), rot: 0.03 * (1 - k), a: clamp(k * 3), lift};
  if (kind === 'pop') return {dx: 0, dy: 0, sc: 0.4 + 0.6 * b, rot: 0, a: clamp(k * 3), lift};
  if (kind === 'stamp') return {dx: 0, dy: 0, sc: 1 + 0.9 * (1 - b), rot: 0.05 * (1 - k), a: clamp(k * 4), lift};
  if (kind === 'fade') return {dx: 0, dy: 0, sc: 1, rot: 0, a: ease(k), lift: 0};
  return {dx: 0, dy: 0, sc: 1, rot: 0, a: 1, lift: 0};
}
function place(ctx, e, t, s, fn) {
  const en = entrance(e, t, s), [bx, by, br] = boil(e, t, en.lift ? 0 : 1);
  const x = (e.x ?? s.width / 2) + en.dx + bx, y = (e.y ?? s.height / 2) + en.dy + by;
  ctx.save(); ctx.globalAlpha *= en.a * exitA(e, t) * (e.alpha ?? 1); ctx.translate(x, y); ctx.rotate((e.rotate ?? 0) + en.rot + br); ctx.scale(en.sc * (e.scale ?? 1), en.sc * (e.scale ?? 1));
  fn(en.lift); ctx.restore();
}
function shadow(ctx, lift = 0, k = 1) { ctx.shadowColor = `rgba(20,14,6,${(0.32 + 0.1 * lift) * k})`; ctx.shadowBlur = 10 + 26 * lift; ctx.shadowOffsetX = 3 + 10 * lift; ctx.shadowOffsetY = 6 + 22 * lift; }
function noShadow(ctx) { ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

// ---------- edges ----------
// polygon around a w×h rect centred at 0; style 'cut' (scissor: long straight runs, small angle changes) or 'torn' (fibrous)
function edgePoly(w, h, seed, style = 'cut', sides = 'all') {
  const r = rng(seed * 97 + 13), pts = [], step = style === 'torn' ? 9 : 46, amp = style === 'torn' ? 6 : 2.6;
  const S = sides === 'all' ? 'tblr' : sides;
  const run = (x0, y0, x1, y1, side) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / step)), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    for (let i = 0; i < n; i++) { const u = i / n, j = S.includes(side) ? (r() - 0.5) * 2 * amp * (style === 'torn' && r() < 0.15 ? 2.2 : 1) : 0; pts.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]); } };
  const W = w / 2, H = h / 2; run(-W, -H, W, -H, 't'); run(W, -H, W, H, 'r'); run(W, H, -W, H, 'b'); run(-W, H, -W, -H, 'l');
  return pts;
}
function polyPath(ctx, P, ox = 0, oy = 0) { ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(x + ox, y + oy) : ctx.moveTo(x + ox, y + oy)); ctx.closePath(); }
function grain(ctx, w, h, seed, n, dark = 0.05, light = 0.05) { const r = rng(seed); for (let i = 0; i < n; i++) { ctx.fillStyle = r() < 0.5 ? `rgba(60,40,20,${(r() * dark).toFixed(3)})` : `rgba(255,255,250,${(r() * light).toFixed(3)})`; ctx.fillRect(r() * w - w / 2, r() * h - h / 2, 1 + r() * 2, 1 + r() * 2); } }

// ---------- paper plates (cached full-frame backgrounds) ----------
const plates = new Map();
export function getPlate(kind, W, H, seed = 1) {
  const key = `${kind}:${W}x${H}:${seed}`; if (plates.has(key)) return plates.get(key);
  const cv = createCanvas(W, H), c = cv.getContext('2d'), r = rng(seed * 31 + kind.length);
  const base = {newsprint: '#E6DCC6', tan: '#D9C7A2', map: '#DCCBA6', cork: '#B88A57', grid: '#F1ECE1', white: '#F3EFE6', red: '#C9241C', black: '#1C1A17', kraft: '#C4A272'}[kind] || kind;
  c.fillStyle = base; c.fillRect(0, 0, W, H);
  // crumple facets
  for (let i = 0; i < 70; i++) { c.fillStyle = r() < 0.5 ? `rgba(255,255,255,${(r() * 0.05).toFixed(3)})` : `rgba(70,50,20,${(r() * 0.05).toFixed(3)})`; c.beginPath(); const x = r() * W, y = r() * H; c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 700, y + (r() - 0.5) * 700); c.lineTo(x + (r() - 0.5) * 700, y + (r() - 0.5) * 700); c.closePath(); c.fill(); }
  if (kind === 'newsprint') { // faint columns of "type" + headlines
    const cols = 4, gw = (W - 80) / cols; c.fillStyle = 'rgba(40,32,22,.11)';
    for (let k = 0; k < cols; k++) { let y = 40 + r() * 30; const x0 = 40 + k * gw + 8;
      while (y < H - 30) { if (r() < 0.06) { c.fillStyle = 'rgba(40,32,22,.16)'; c.fillRect(x0, y, gw * (0.6 + r() * 0.3), 26); y += 44; c.fillStyle = 'rgba(40,32,22,.11)'; continue; }
        if (r() < 0.04) { c.fillStyle = 'rgba(40,32,22,.07)'; c.fillRect(x0, y, gw - 18, 120 + r() * 120); y += 260; c.fillStyle = 'rgba(40,32,22,.11)'; continue; }
        let x = x0; while (x < x0 + gw - 26) { const ww = 8 + r() * 34; c.fillRect(x, y, Math.min(ww, x0 + gw - 18 - x), 7); x += ww + 6; } y += 15; }
      c.fillStyle = 'rgba(40,32,22,.08)'; c.fillRect(40 + (k + 1) * gw - 4, 30, 1.5, H - 60); c.fillStyle = 'rgba(40,32,22,.11)'; }
    // soft wash so type stays background
    c.fillStyle = 'rgba(230,220,198,.45)'; c.fillRect(0, 0, W, H);
  }
  if (kind === 'map') { c.lineWidth = 2; c.strokeStyle = 'rgba(90,60,30,.18)';
    for (let i = 0; i < 9; i++) { c.beginPath(); const y0 = r() * H; c.moveTo(-20, y0); for (let x = 0; x <= W + 40; x += 40) c.lineTo(x, y0 + Math.sin(x / 140 + i) * 60 + (r() - 0.5) * 18); c.stroke(); }
    c.strokeStyle = 'rgba(90,60,30,.12)'; c.lineWidth = 1.5; for (let x = 90; x < W; x += 180) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 90; y < H; y += 180) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.setLineDash([10, 8]); c.strokeStyle = 'rgba(120,50,30,.22)'; c.lineWidth = 3; c.beginPath(); c.moveTo(W * 0.1, H * 0.2); for (let i = 1; i < 12; i++) c.lineTo(W * (0.1 + 0.8 * i / 11) + (r() - 0.5) * 80, H * (0.2 + 0.6 * i / 11) + (r() - 0.5) * 60); c.stroke(); c.setLineDash([]); }
  if (kind === 'cork') for (let i = 0; i < 9000; i++) { c.fillStyle = r() < 0.5 ? `rgba(80,45,15,${(0.1 + r() * 0.25).toFixed(3)})` : `rgba(240,200,150,${(r() * 0.2).toFixed(3)})`; c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 2.5, 0, 6.3); c.fill(); }
  if (kind === 'grid') { c.lineWidth = 1; for (let x = 0; x <= W; x += 36) { c.strokeStyle = x % 180 ? 'rgba(80,120,160,.13)' : 'rgba(80,120,160,.25)'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 36) { c.strokeStyle = y % 180 ? 'rgba(80,120,160,.13)' : 'rgba(80,120,160,.25)'; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  // stains
  if (!['red', 'black'].includes(kind)) for (let i = 0; i < 3; i++) { const x = r() * W, y = r() * H, R = 60 + r() * 90; c.strokeStyle = `rgba(120,80,30,${(0.05 + r() * 0.06).toFixed(3)})`; c.lineWidth = 3 + r() * 5; c.beginPath(); c.arc(x, y, R, r() * 6, r() * 6 + 4.5); c.stroke(); c.fillStyle = 'rgba(140,100,40,.035)'; c.beginPath(); c.arc(x + 10, y + 6, R * 0.9, 0, 6.3); c.fill(); }
  // fibres + grain + edge vignette
  c.save(); c.translate(W / 2, H / 2); grain(c, W, H, seed + 5, 26000, kind === 'black' ? 0.2 : 0.07, 0.08); c.restore();
  for (let i = 0; i < 260; i++) { c.strokeStyle = `rgba(90,70,40,${(r() * 0.08).toFixed(3)})`; c.lineWidth = 1; const x = r() * W, y = r() * H, a = r() * 6.3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.stroke(); }
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, kind === 'black' ? 'rgba(0,0,0,.4)' : 'rgba(90,60,20,.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  plates.set(key, cv); return cv;
}
export function paintPaper(ctx, W, H, kind = 'newsprint', seed = 1) { ctx.drawImage(getPlate(kind, W, H, seed), 0, 0); }

// ---------- halftone ----------
const htCache = new Map(), imgIds = new Map();
// returns canvas w×h: halftone of image (cover crop, focus), ink dots on paper (or transparent where source alpha is 0)
function halftone(im, w, h, o = {}) {
  if (!imgIds.has(im)) imgIds.set(im, imgIds.size + 1);
  const key = [imgIds.get(im), w, h, o.focus, o.dot, o.tone, o.halftone, o.contrast, o.alpha, o.bg].join('|'); if (htCache.has(key)) return htCache.get(key);
  w = Math.round(w); h = Math.round(h);
  const src = createCanvas(w, h), sc = src.getContext('2d'), k = Math.max(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k, fx = o.focus?.[0] ?? 0.5, fy = o.focus?.[1] ?? 0.5;
  sc.drawImage(im, (w - iw) * fx, (h - ih) * fy, iw, ih);
  const d = sc.getImageData(0, 0, w, h).data, out = createCanvas(w, h), oc = out.getContext('2d');
  const ink = col(o.tone === 'red' ? 'red' : o.tone === 'navy' ? '#1F2B4A' : 'ink'), paper = o.bg === 'none' ? null : col(o.bg ?? (o.tone === 'yellow' ? 'yellow' : 'paper'));
  if (paper && !o.alpha) { oc.fillStyle = paper; oc.fillRect(0, 0, w, h); }
  const C = o.contrast ?? 1.35, lum = (x, y) => { const i = ((y | 0) * w + (x | 0)) * 4; let v = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255; v = clamp((v - 0.5) * C + 0.52); return [v, d[i + 3] / 255]; };
  if (o.halftone === false) { // grainy grayscale print
    const id = oc.getImageData(0, 0, w, h), D = id.data, r = rng(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [v, a] = lum(x, y), j = (y * w + x) * 4, n = (r() - 0.5) * 0.12, g = clamp(v + n) * 225 + 18;
      D[j] = g * 0.98 + (o.tone === 'red' ? 40 : 0); D[j + 1] = g * 0.95; D[j + 2] = g * 0.88; D[j + 3] = o.alpha ? a * 255 : 255; }
    oc.putImageData(id, 0, 0);
  } else {
    const s = o.dot ?? Math.max(5, Math.round(w / 120)); oc.fillStyle = ink;
    if (o.alpha && paper) { // paper under the subject only
      for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const [, a] = lum(x, y); if (a > 0.5) { oc.fillStyle = paper; oc.fillRect(x, y, 2, 2); } } oc.fillStyle = ink; }
    for (let row = 0, y = 0; y < h + s; y += s * 0.866, row++) for (let x = (row % 2) * s / 2; x < w + s; x += s) {
      const [v, a] = lum(clamp(x, 0, w - 1), clamp(y, 0, h - 1)); if (o.alpha && a < 0.5) continue;
      const rad = s * 0.62 * Math.sqrt(1 - v); if (rad < 0.35) continue; oc.beginPath(); oc.arc(x, y, rad, 0, 6.2832); oc.fill(); }
  }
  htCache.set(key, out); return out;
}
// white (or coloured) outline around an alpha subject
function outlineAlpha(img, B, color) {
  const w = img.width + 2 * B, h = img.height + 2 * B, cv = createCanvas(w, h), c = cv.getContext('2d');
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832; c.drawImage(img, B + Math.cos(a) * B, B + Math.sin(a) * B); }
  c.globalCompositeOperation = 'source-in'; c.fillStyle = color; c.fillRect(0, 0, w, h); return cv;
}

// ---------- painters ----------
function plate(ctx, e, t, s) { ctx.save(); ctx.globalAlpha *= exitA(e, t) * (e.enter === 'fade' ? enterK(e, t) : 1); paintPaper(ctx, s.width, s.height, e.kind ?? 'newsprint', e.seed ?? 1); ctx.restore(); }

const cutCache = new Map();
function buildCutout(s, e) {
  const key = JSON.stringify([e.path, e.silhouette, e.w, e.h, e.shape, e.focus, e.dot, e.tone, e.halftone, e.border, e.seed, e.contrast, e.bg]); if (cutCache.has(key)) return cutCache.get(key);
  const im = e.path ? s._cimg.get(e.path) : null, W = e.w ?? 640, ratio = e.h ? e.h / W : im ? im.height / im.width : 1.2, H = Math.round(W * ratio), B = e.border ?? 12, shape = e.shape ?? (e.alpha ? 'alpha' : 'cut');
  let art;
  if (im) art = halftone(im, W, H, {focus: e.focus, dot: e.dot, tone: e.tone, halftone: e.halftone, contrast: e.contrast, alpha: shape === 'alpha', bg: e.bg});
  else { art = createCanvas(W, H); silhouette(art.getContext('2d'), e.silhouette, W, H, e); }
  const pad = B + 30, cv = createCanvas(W + 2 * pad, H + 2 * pad), c = cv.getContext('2d'); c.translate(pad, pad);
  let mask;
  if (shape === 'alpha' || !im && e.silhouette) { const o = outlineAlpha(art, B, col(e.borderColor ?? 'white')); c.drawImage(o, -B, -B); c.drawImage(art, 0, 0); mask = o; }
  else {
    const P = shape === 'circle' ? Array.from({length: 90}, (_, i) => { const a = i / 90 * 6.2832, j = 1 + (rng(i + (e.seed ?? 1) * 7)() - 0.5) * 0.012; return [Math.cos(a) * W / 2 * j, Math.sin(a) * H / 2 * j]; }) : edgePoly(W, H, e.seed ?? 1, shape === 'torn' ? 'torn' : 'cut');
    c.save(); c.translate(W / 2, H / 2);
    if (B > 0) { const Pb = P.map(([x, y]) => [x * (1 + 2 * B / W), y * (1 + 2 * B / H)]); c.fillStyle = col(e.borderColor ?? 'white'); polyPath(c, Pb); c.fill(); }
    polyPath(c, P); c.clip(); c.drawImage(art, -W / 2, -H / 2); c.restore();
  }
  const res = {cv, pad, W, H, B}; cutCache.set(key, res); return res;
}
// Simple drawn silhouettes (no photo): person, crowd, building, car, ship, plane, house
function silhouette(c, kind, W, H, e) {
  c.fillStyle = col(e.fill ?? 'ink'); const cx = W / 2;
  if (kind === 'person') { c.beginPath(); c.ellipse(cx, H * 0.19, W * 0.17, H * 0.14, 0, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(cx - W * 0.42, H); c.bezierCurveTo(cx - W * 0.44, H * 0.5, cx - W * 0.3, H * 0.36, cx, H * 0.36); c.bezierCurveTo(cx + W * 0.3, H * 0.36, cx + W * 0.44, H * 0.5, cx + W * 0.42, H); c.closePath(); c.fill(); }
  else if (kind === 'building') { c.fillRect(W * 0.1, H * 0.15, W * 0.8, H * 0.85); c.fillStyle = col('paper'); for (let y = H * 0.22; y < H * 0.95; y += H * 0.1) for (let x = W * 0.18; x < W * 0.82; x += W * 0.16) c.fillRect(x, y, W * 0.08, H * 0.05); }
  else if (kind === 'house') { c.beginPath(); c.moveTo(W * 0.05, H * 0.45); c.lineTo(cx, H * 0.05); c.lineTo(W * 0.95, H * 0.45); c.fill(); c.fillRect(W * 0.15, H * 0.45, W * 0.7, H * 0.55); }
  else { c.beginPath(); c.ellipse(cx, H / 2, W * 0.45, H * 0.45, 0, 0, 6.3); c.fill(); }
}
function cutout(ctx, e, t, s) {
  const C = buildCutout(s, e);
  place(ctx, e, t, s, lift => {
    const ox = -C.cv.width / 2, oy = -C.cv.height / 2;
    if (e.offset) { ctx.save(); const o = e.offsetBy ?? [16, 12]; ctx.globalAlpha *= 0.95; const tint = tintCache(C.cv, col(e.offset)); ctx.drawImage(tint, ox + o[0], oy + o[1]); ctx.restore(); }
    ctx.save(); shadow(ctx, lift); ctx.drawImage(C.cv, ox, oy); ctx.restore();
    if (e.censor) { const [fx, fy, fw, fh] = e.censor; ctx.save(); ctx.translate((fx - 0.5) * C.W, (fy - 0.5) * C.H); ctx.rotate(-0.03); ctx.fillStyle = PAL.black; ctx.fillRect(-fw * C.W / 2, -(fh ?? 0.07) * C.H / 2, fw * C.W, (fh ?? 0.07) * C.H); ctx.restore(); }
    if (e.credit) { ctx.save(); ctx.font = `17px ${TYPE}`; ctx.fillStyle = 'rgba(30,25,20,.75)'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; let cr = e.credit; while (ctx.measureText(cr).width > C.W && cr.length > 8) cr = cr.slice(0, -2); ctx.fillText(cr, -C.W / 2, C.H / 2 + C.B + 6); ctx.restore(); }
  });
}
const tints = new WeakMap();
function tintCache(cv, color) { let m = tints.get(cv); if (!m) tints.set(cv, m = new Map()); if (m.has(color)) return m.get(color); const o = createCanvas(cv.width, cv.height), c = o.getContext('2d'); c.drawImage(cv, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = color; c.fillRect(0, 0, o.width, o.height); m.set(color, o); return o; }

function fitText(ctx, text, family, size, maxW, weight = '') { let sz = size; do { ctx.font = `${weight}${sz}px ${family}`; if (ctx.measureText(text).width <= maxW) break; sz -= 2; } while (sz > 14); return sz; }
// torn paper scrap with optional label
const scrapCache = new Map();
function scrapCanvas(e) {
  const font = e.font === 'type' ? TYPE : HEAD, size = e.size ?? 64, lines = String(e.text ?? '').split('\n'), up = e.upper !== false && font === HEAD;
  const m = createCanvas(10, 10).getContext('2d'); m.font = `${size}px ${font}`;
  const tw = Math.max(...lines.map(l => m.measureText(up ? l.toUpperCase() : l).width), 0), lh = size * (font === HEAD ? 1.08 : 1.25);
  const w = e.w ?? Math.round(tw + size * 0.9), h = e.h ?? Math.round(lines.length * lh + size * 0.55);
  const key = JSON.stringify([e.text, e.color, e.textColor, w, h, size, font, e.seed, e.edge]); if (scrapCache.has(key)) return scrapCache.get(key);
  const pad = 24, cv = createCanvas(w + 2 * pad, h + 2 * pad), c = cv.getContext('2d'); c.translate(pad + w / 2, pad + h / 2);
  const P = edgePoly(w, h, e.seed ?? 2, e.edge ?? 'torn', e.sides ?? 'all'), bg = e.color ?? 'paper';
  if ((e.edge ?? 'torn') === 'torn') { c.fillStyle = 'rgba(250,247,238,.95)'; polyPath(c, P.map(([x, y]) => [x * (1 + 8 / w), y * (1 + 8 / h)])); c.fill(); }
  c.save(); polyPath(c, P); c.clip();
  if (bg === 'news') c.drawImage(getPlate('newsprint', 1080, 1920, (e.seed ?? 2) + 9), -540 - (e.seed ?? 0) * 13 % 300, -960); else { c.fillStyle = col(bg); c.fillRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10); }
  grain(c, w, h, (e.seed ?? 2) + 1, Math.round(w * h / 60), 0.08, 0.06); c.restore();
  if (lines.length && e.text !== '') { c.fillStyle = col(e.textColor ?? (['red', 'black'].includes(bg) ? 'white' : 'ink')); c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => { const L = up ? l.toUpperCase() : l; fitText(c, L, font, size, w - size * 0.5); c.fillText(L, 0, (i - (lines.length - 1) / 2) * lh + size * 0.04); }); }
  const res = {cv, w, h, pad}; scrapCache.set(key, res); return res;
}
function scrap(ctx, e, t, s) { const S = scrapCanvas(e); place(ctx, e, t, s, lift => { shadow(ctx, lift, e.flat ? 0.4 : 1); ctx.drawImage(S.cv, -S.cv.width / 2, -S.cv.height / 2); }); }
function headline(ctx, e, t, s) { // kinetic type: huge condensed words, optional marker swipe behind
  const size = e.size ?? 150, lines = String(e.text).split('\n'), k = clamp(q(loc(e, t)) / (e.enterDur ?? 0.35)), a = (e.enter === 'none' ? 1 : clamp(k * 3)) * exitA(e, t);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(e.x ?? s.width / 2, e.y ?? 420); ctx.rotate(e.rotate ?? -0.02);
  const sc = e.enter === 'none' ? 1 : 1 + 0.25 * (1 - backOut(k)); ctx.scale(sc, sc); ctx.textAlign = e.align ?? 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { const L = l.toUpperCase(), sz = fitText(ctx, L, HEAD, size, (e.maxW ?? s.width - 100)), y = (i - (lines.length - 1) / 2) * sz * 1.14, tw = ctx.measureText(L).width;
    const x0 = ctx.textAlign === 'center' ? -tw / 2 : ctx.textAlign === 'left' ? 0 : -tw;
    const hl = e.highlight === true ? i === lines.length - 1 : e.highlight === i || (Array.isArray(e.highlight) && e.highlight.includes(i));
    if (hl || e.bg) { const sw = clamp((q(loc(e, t)) - 0.15 - i * 0.12) / 0.3), r = rng(i + 5); ctx.save(); ctx.fillStyle = col(e.bg ?? 'yellow'); ctx.beginPath(); ctx.moveTo(x0 - 18, y - sz * 0.56 + r() * 6);
      ctx.lineTo(x0 - 18 + (tw + 36) * sw, y - sz * 0.6 + r() * 6); ctx.lineTo(x0 - 18 + (tw + 36) * sw, y + sz * 0.44 - r() * 6); ctx.lineTo(x0 - 18, y + sz * 0.4 - r() * 6); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = col(e.color ?? ((e.bg === 'red' || e.bg === 'black') ? 'white' : 'ink')); ctx.fillText(L, ctx.textAlign === 'center' ? 0 : 0, y); });
  ctx.restore();
}
function tape(ctx, e, t, s) { const w = e.w ?? 170, h = e.h ?? 48; place(ctx, {...e, enter: e.enter ?? 'drop', enterDur: e.enterDur ?? 0.2}, t, s, lift => {
  const P = edgePoly(w, h, e.seed ?? 4, 'torn', 'lr'); shadow(ctx, lift, 0.35); ctx.fillStyle = e.color === 'red' ? 'rgba(200,50,40,.8)' : 'rgba(232,220,180,.82)'; polyPath(ctx, P); ctx.fill(); noShadow(ctx);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; for (let x = -w / 2 + 12; x < w / 2; x += 18) { ctx.beginPath(); ctx.moveTo(x, -h / 2); ctx.lineTo(x + 6, h / 2); ctx.stroke(); } }); }
function stampbox(ctx, e, t, s) { // rubber stamp: red box, distressed ink
  const size = e.size ?? 64, txt = String(e.text).toUpperCase();
  place(ctx, {...e, enter: e.enter ?? 'stamp', enterDur: e.enterDur ?? 0.18, rotate: e.rotate ?? -0.12}, t, s, () => {
    ctx.font = `${size}px ${HEAD}`; const tw = ctx.measureText(txt).width, w = tw + size * 0.8, h = size * 1.45, c = col(e.color ?? 'red');
    ctx.globalAlpha *= 0.9; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = size * 0.09; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.lineWidth = size * 0.035; ctx.strokeRect(-w / 2 + size * 0.14, -h / 2 + size * 0.14, w - size * 0.28, h - size * 0.28);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, size * 0.05);
    ctx.globalCompositeOperation = 'destination-out'; const r = rng((e.seed ?? 7) * 17); for (let i = 0; i < 160; i++) { ctx.globalAlpha = 0.3 + r() * 0.6; ctx.beginPath(); ctx.arc((r() - 0.5) * w, (r() - 0.5) * h, 1 + r() * 3.5, 0, 6.3); ctx.fill(); } }); }
function strip(ctx, e, t, s) { // typewriter caption strip, letters type in
  const size = e.size ?? 34, txt = String(e.text), k = loc(e, t), shown = e.typing === false ? txt.length : Math.floor(clamp((k - 0.15) / (e.typeDur ?? Math.min(0.9, txt.length * 0.045))) * txt.length);
  const m = createCanvas(4, 4).getContext('2d'); m.font = `${size}px ${TYPE}`; const w = e.w ?? Math.round(m.measureText(txt).width + size * 1.1), h = Math.round(size * 1.7);
  const S = scrapCanvas({text: '', w, h, color: e.color ?? 'white', edge: 'cut', seed: e.seed ?? 5});
  place(ctx, {...e, enter: e.enter ?? 'slide', enterDur: e.enterDur ?? 0.3}, t, s, lift => { shadow(ctx, lift, 0.6); ctx.drawImage(S.cv, -S.cv.width / 2, -S.cv.height / 2); noShadow(ctx);
    ctx.font = `${size}px ${TYPE}`; ctx.fillStyle = col(e.textColor ?? 'ink'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt.slice(0, shown), -w / 2 + size * 0.55, 2); });
}
function tack(ctx, e, t, s) { place(ctx, {...e, enter: e.enter ?? 'drop', enterDur: e.enterDur ?? 0.16}, t, s, lift => { const c = col(e.color ?? 'red'), r = e.size ?? 14; shadow(ctx, lift, 0.8); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.fill(); noShadow(ctx); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.32, 0, 6.3); ctx.fill(); }); }
function partialPath(P, p) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); const T = L.at(-1) * p, o = [P[0]];
  for (let i = 1; i < P.length; i++) { if (L[i] <= T) { o.push(P[i]); continue; } const u = (T - L[i - 1]) / ((L[i] - L[i - 1]) || 1); o.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u]); break; } return o; }
function growK(e, t) { const g = e.grow ?? {}; if (e.enter === 'none') return 1; return clamp((q(loc(e, t)) - (g.at ?? 0)) / (g.dur ?? 0.6)); }
function yarn(ctx, e, t, s) { // red string pin to pin, sagging, draws itself
  const P = []; e.points.forEach((p, i) => { if (i) { const a = e.points[i - 1], sag = e.sag ?? 26; for (let j = 1; j <= 12; j++) { const u = j / 12; P.push([a[0] + (p[0] - a[0]) * u, a[1] + (p[1] - a[1]) * u + Math.sin(Math.PI * u) * sag]); } } else P.push(p); });
  const k = growK(e, t); if (k <= 0) return; const D = partialPath(P, k);
  ctx.save(); ctx.globalAlpha *= exitA(e, t); ctx.strokeStyle = col(e.color ?? 'red'); ctx.lineWidth = e.width ?? 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 3;
  ctx.beginPath(); D.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
  if (e.pins !== false) e.points.forEach((p, i) => { const at = i / Math.max(1, e.points.length - 1); if (k >= at - 0.001) tack(ctx, {x: p[0], y: p[1], enter: 'none', seed: i, color: e.pinColor}, t, s); });
}
// marker scribbles: circle, underline, arrow, cross, check, bracket — drawn progressively, rough double stroke
function scribble(ctx, e, t, s) {
  const k = growK(e, t); if (k <= 0) return; const r = rng((e.seed ?? 9) * 37), x = e.x ?? 540, y = e.y ?? 960, w = e.w ?? 300, h = e.h ?? 140; let P = [];
  if (e.kind === 'circle' || !e.kind) { const n = 64, turns = 1.12; for (let i = 0; i <= n; i++) { const a = -2.2 + i / n * 6.2832 * turns, j = 1 + (r() - 0.5) * 0.05 + i / n * 0.06; P.push([x + Math.cos(a) * w / 2 * j, y + Math.sin(a) * h / 2 * j]); } }
  else if (e.kind === 'underline') { for (let i = 0; i <= 12; i++) P.push([x - w / 2 + w * i / 12, y + Math.sin(i * 0.7) * 3 + (r() - 0.5) * 3]); }
  else if (e.kind === 'arrow') { const pts = e.points ?? [[x - w / 2, y + h / 2], [x + w / 2, y - h / 2]]; const [a, b] = [pts[0], pts.at(-1)], mx = (a[0] + b[0]) / 2 + (e.bend ?? 60), my = (a[1] + b[1]) / 2 - (e.bend ?? 60) * 0.5; for (let i = 0; i <= 20; i++) { const u = i / 20; P.push([(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * my + u * u * b[1]]); } }
  else if (e.kind === 'cross') { P = [[x - w / 2, y - h / 2], [x + w / 2, y + h / 2]]; }
  else if (e.kind === 'check') { P = [[x - w / 2, y], [x - w / 6, y + h / 2], [x + w / 2, y - h / 2]]; }
  else if (e.kind === 'bracket') { P = [[x - w / 2, y - h / 2], [x - w / 2 - 20, y - h / 2], [x - w / 2 - 20, y + h / 2], [x - w / 2, y + h / 2]]; }
  const D = partialPath(P, e.kind === 'cross' ? Math.min(1, k * 2) : k);
  ctx.save(); ctx.globalAlpha *= exitA(e, t) * 0.92; ctx.strokeStyle = col(e.color ?? 'red'); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = e.width ?? 9;
  for (const off of [0, 1]) { ctx.beginPath(); D.forEach(([px, py], i) => { const ox = off * 2.5, oy = off * -2; i ? ctx.lineTo(px + ox, py + oy) : ctx.moveTo(px + ox, py + oy); }); ctx.globalAlpha *= off ? 0.6 : 1; ctx.stroke(); }
  if (e.kind === 'cross' && k > 0.5) { const D2 = partialPath([[x + w / 2, y - h / 2], [x - w / 2, y + h / 2]], (k - 0.5) * 2); ctx.beginPath(); D2.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); }
  if (e.kind === 'arrow' && k >= 1) { const [a, b] = [P.at(-3), P.at(-1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = (e.width ?? 9) * 3.6; ctx.beginPath(); ctx.moveTo(b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L); ctx.stroke(); }
  if (e.note && k >= 1) { ctx.font = `${e.noteSize ?? 66}px Hand`; ctx.fillStyle = col(e.color ?? 'red'); ctx.textAlign = 'center'; ctx.fillText(e.note, e.noteX ?? x, e.noteY ?? y - h / 2 - 24); }
  ctx.restore();
}
function bigstat(ctx, e, t, s) { // big number (count-up) + label on torn strip + red underline
  const k = loc(e, t), m = String(e.value).match(/^([^\d-]*)(-?[\d.,]+)(.*)$/), size = e.size ?? 230;
  let txt = String(e.value); if (m && e.count !== false) { const raw = m[2], target = parseFloat(raw.replace(/\./g, '').replace(',', '.')), u = ease(clamp(q(k) / (e.countDur ?? 0.9))), dec = raw.includes(',') ? raw.split(',')[1].length : 0; let v = (target * u).toFixed(dec).replace('.', ','); v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); if (dec) { const [i, d] = (target * u).toFixed(dec).split('.'); v = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d; } txt = m[1] + v + m[3]; }
  place(ctx, {...e, enter: e.enter ?? 'pop', enterDur: e.enterDur ?? 0.3}, t, s, () => {
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; const sz = fitText(ctx, String(e.value), HEAD, size, s.width - 120); ctx.font = `${sz}px ${HEAD}`;
    ctx.fillStyle = col(e.color ?? 'red'); ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowOffsetY = 5; ctx.shadowBlur = 0; ctx.fillText(txt, 0, 0); noShadow(ctx);
    const tw = ctx.measureText(String(e.value)).width; if (e.underline !== false) scribble(ctx, {kind: 'underline', x: 0, y: sz * 0.14, w: tw * 0.9, from: 0, grow: {at: (e.countDur ?? 0.9) - 0.1, dur: 0.3}, color: e.underlineColor ?? 'ink', width: 10}, k, s);
    if (e.label) { const S = scrapCanvas({text: e.label, size: e.labelSize ?? 46, color: e.labelColor ?? 'black', seed: 11}); ctx.globalAlpha *= clamp((k - 0.4) / 0.2); ctx.drawImage(S.cv, -S.cv.width / 2, sz * 0.22); }
  });
}
function timeline(ctx, e, t, s) { // dotted line, red dots, staggered big years, optional labels
  const y = e.y ?? 960, x0 = e.x0 ?? 170, x1 = e.x1 ?? s.width - 170, items = e.items ?? [], k = loc(e, t), st = e.stagger ?? 0.45, lk = e.enter === 'none' ? 1 : clamp(q(k) / 0.5);
  ctx.save(); ctx.globalAlpha *= exitA(e, t); ctx.strokeStyle = col('ink'); ctx.lineWidth = 4; ctx.setLineDash([6, 12]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * lk, y); ctx.stroke(); ctx.setLineDash([]);
  items.forEach((it, i) => { const a = clamp((q(k) - 0.3 - i * st) / 0.2); if (a <= 0) return; const x = it.x ?? x0 + (x1 - x0) * (items.length === 1 ? 0.5 : i / (items.length - 1)), up = it.up ?? (i % 2 === 0);
    ctx.globalAlpha = a * exitA(e, t); ctx.fillStyle = col(it.color ?? 'red'); ctx.beginPath(); ctx.arc(x, y, 13 * (0.6 + 0.4 * backOut(a)), 0, 6.3); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const ys = up ? y - (e.gap ?? 110) : y + (e.gap ?? 110); fitText(ctx, String(it.year ?? it.label), HEAD, e.size ?? 96, (x1 - x0) / Math.max(1, items.length) + 60); ctx.fillText(String(it.year ?? ''), x, ys);
    if (it.text) { ctx.font = `${e.textSize ?? 30}px ${TYPE}`; ctx.fillStyle = col('ink'); const L = String(it.text).split('\n'); L.forEach((l, j) => ctx.fillText(l, x, up ? ys - 74 - (L.length - 1 - j) * 38 : ys + 74 + j * 38)); } });
  ctx.restore();
}
function icons(ctx, e, t, s) { // grid & scale repetition: rows of people icons, some highlighted
  const cols = e.cols ?? 10, n = e.n ?? 30, size = e.size ?? 70, gap = e.gap ?? size * 1.25, rows = Math.ceil(n / cols), x0 = (e.x ?? s.width / 2) - (cols - 1) * gap / 2, y0 = (e.y ?? 900) - (rows - 1) * gap * 1.3 / 2, hl = new Set(e.highlight ?? []), k = loc(e, t), st = e.stagger ?? 0.02;
  ctx.save(); ctx.globalAlpha *= exitA(e, t);
  for (let i = 0; i < n; i++) { const a = e.enter === 'none' ? 1 : clamp((q(k) - i * st) / 0.12); if (a <= 0) continue; const x = x0 + (i % cols) * gap, y = y0 + Math.floor(i / cols) * gap * 1.3, on = hl.has(i) || (e.highlightFrom !== undefined && i >= e.highlightFrom && q(k) >= (e.highlightAt ?? 0));
    ctx.fillStyle = col(on ? (e.hlColor ?? 'red') : (e.color ?? 'ink')); ctx.globalAlpha = a * exitA(e, t); const sc = size / 70 * (0.6 + 0.4 * backOut(a));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); if ((e.icon ?? 'person') === 'person') { ctx.beginPath(); ctx.arc(0, -26, 12, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.roundRect(-14, -10, 28, 44, 9); ctx.fill(); } else if (e.icon === 'house') { ctx.beginPath(); ctx.moveTo(-22, -4); ctx.lineTo(0, -26); ctx.lineTo(22, -4); ctx.fill(); ctx.fillRect(-16, -4, 32, 30); } else { ctx.beginPath(); ctx.arc(0, 0, 22, 0, 6.3); ctx.fill(); } ctx.restore(); }
  if (e.caption) { ctx.globalAlpha = exitA(e, t) * clamp((q(k) - n * st) / 0.2); ctx.font = `${e.captionSize ?? 54}px Hand`; ctx.fillStyle = col('red'); ctx.textAlign = 'center'; ctx.fillText(e.caption, e.x ?? s.width / 2, y0 + rows * gap * 1.3 + 30); }
  ctx.restore();
}
function shape(ctx, e, t, s) { // bold geometric paper (archival duotone poster): triangle, circle, rect, burst, bar
  const w = e.w ?? 600, h = e.h ?? w, c = col(e.color ?? 'red');
  place(ctx, {...e, enter: e.enter ?? 'drop'}, t, s, lift => { shadow(ctx, lift, 0.5); ctx.fillStyle = c; ctx.beginPath();
    if (e.kind === 'circle') ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 6.3);
    else if (e.kind === 'rect' || e.kind === 'bar') polyPath(ctx, edgePoly(w, h, e.seed ?? 3, 'cut'));
    else if (e.kind === 'burst') { for (let i = 0; i < 28; i++) { const a = i / 28 * 6.2832, R = i % 2 ? w * 0.34 : w / 2; ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R * h / w); } ctx.closePath(); }
    else { ctx.moveTo(0, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); }
    ctx.fill(); noShadow(ctx); ctx.save(); ctx.clip(); grain(ctx, w, h, 4, Math.round(w * h / 80), 0.12, 0.08); ctx.restore(); });
}
function doc(ctx, e, t, s) { // document forensics: paper sheet with grey lines, one passage highlighted
  const w = e.w ?? 760, h = e.h ?? 900, n = e.lines ?? 14, hl = new Set(e.highlight ?? [5]), k = loc(e, t);
  place(ctx, {...e, enter: e.enter ?? 'slide', dir: e.dir ?? 'up'}, t, s, lift => {
    const S = scrapCanvas({text: '', w, h, color: e.color ?? 'white', edge: 'cut', seed: e.seed ?? 21}); shadow(ctx, lift); ctx.drawImage(S.cv, -S.cv.width / 2, -S.cv.height / 2); noShadow(ctx);
    let y = -h / 2 + 70; if (e.title) { ctx.font = `${e.titleSize ?? 46}px ${HEAD}`; ctx.fillStyle = col('ink'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(String(e.title).toUpperCase(), -w / 2 + 50, y); y += 70; }
    const r = rng(e.seed ?? 21), lh = (h / 2 - 40 - y) / n;
    for (let i = 0; i < n; i++, y += lh) { const L = (w - 100) * (i === n - 1 ? 0.5 : 0.8 + r() * 0.2);
      if (hl.has(i)) { const sw = clamp((q(k) - (e.hlAt ?? 0.5)) / 0.35); ctx.fillStyle = col(e.hlColor ?? 'yellow'); ctx.fillRect(-w / 2 + 44, y - lh * 0.36, (L + 12) * sw, lh * 0.72); }
      if (e.text && hl.has(i)) { ctx.font = `${Math.round(Math.max(30, lh * 0.7))}px ${TYPE}`; ctx.fillStyle = col('ink'); ctx.textAlign = 'left'; ctx.fillText(e.text, -w / 2 + 50, y + 2); }
      else { ctx.fillStyle = 'rgba(40,36,30,.45)'; ctx.fillRect(-w / 2 + 50, y - 5, L, 10); } }
    if (e.blur !== false && hl.size) { /* unfocused lines: soft wash */ ctx.fillStyle = 'rgba(247,243,234,.25)'; ctx.fillRect(-w / 2, -h / 2, w, h); }
  });
}
function chart(ctx, e, t, s) { // annotated data viz: minimal axes, grey bars or one red line drawing itself
  const w = e.w ?? 860, h = e.h ?? 560, v = e.values ?? [2, 3, 5, 4, 7, 9], mx = e.max ?? Math.max(...v), k = loc(e, t), x0 = (e.x ?? s.width / 2) - w / 2, y0 = (e.y ?? 960) + h / 2;
  ctx.save(); ctx.globalAlpha *= exitA(e, t) * (e.enter === 'none' ? 1 : clamp(q(k) / 0.2)); ctx.strokeStyle = col('ink'); ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0 - h); ctx.lineTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.stroke();
  const g = growK({...e, grow: e.grow ?? {at: 0.3, dur: 1.2}}, t), n = v.length, bw = w / n;
  if ((e.kind ?? 'line') === 'bar') v.forEach((val, i) => { const hh = h * 0.9 * val / mx * clamp(g * n - i); ctx.fillStyle = col((e.hl ?? n - 1) === i ? (e.color ?? 'red') : (e.barColor ?? 'yellow')); ctx.fillRect(x0 + i * bw + bw * 0.18, y0 - hh, bw * 0.64, hh);
    if (e.labels?.[i] && hh > 0) { ctx.font = `30px ${TYPE}`; ctx.fillStyle = col('ink'); ctx.textAlign = 'center'; ctx.fillText(e.labels[i], x0 + (i + 0.5) * bw, y0 + 40); } });
  else { if (e.ghost) for (const gv of [].concat(e.ghost.length && Array.isArray(e.ghost[0]) ? e.ghost : [e.ghost])) { ctx.strokeStyle = 'rgba(120,115,105,.5)'; ctx.lineWidth = 4; ctx.beginPath(); gv.forEach((val, i) => { const px = x0 + (i + 0.5) * w / gv.length, py = y0 - h * 0.9 * val / mx; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); }
    const P = v.map((val, i) => [x0 + (i + 0.5) * bw, y0 - h * 0.9 * val / mx]), D = partialPath(P, g); ctx.strokeStyle = col(e.color ?? 'red'); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.beginPath(); D.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    if (e.labels) e.labels.forEach((l, i) => { if (!l) return; ctx.font = `30px ${TYPE}`; ctx.fillStyle = col('ink'); ctx.textAlign = 'center'; ctx.fillText(l, x0 + (i + 0.5) * bw, y0 + 40); }); }
  ctx.restore();
}

const PAINT = {plate, cutout, scrap, tape, stampbox, strip, tack, yarn, scribble, bigstat, timeline, icons, shape, headline, doc, chart};
export function drawCollage(ctx, e, t, s) { PAINT[e.type](ctx, e, t, s); }

// Caption on a torn paper strip (captionBox: 'paper')
export function paperCaption(ctx, s, cue, size, y) {
  const text = cue.text; ctx.font = `${size}px ${HEAD}`; const tw = ctx.measureText(text).width, w = tw + size * 0.9, h = size * 1.5, seed = Math.round(cue.start * 10);
  const S = scrapCanvas({text: '', w: Math.round(w), h: Math.round(h), color: 'white', edge: 'torn', seed});
  ctx.save(); ctx.translate(s.width / 2, y); ctx.rotate(((seed % 5) - 2) * 0.006); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5; ctx.drawImage(S.cv, -S.cv.width / 2, -S.cv.height / 2); noShadow(ctx);
  ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.04); ctx.restore();
}
// Transition 'tear': the previous frame's paper rips away upward with a torn edge (drawn over the new shot)
export function tearTransition(ctx, s, k) {
  const W = s.width, H = s.height, y = -H * ease(k) * 1.1, r = rng(17); ctx.save(); ctx.beginPath(); ctx.moveTo(0, y - 10); ctx.lineTo(W, y - 10);
  for (let x = W; x >= 0; x -= 18) ctx.lineTo(x, y + H + (r() - 0.5) * 34); ctx.closePath(); ctx.clip(); ctx.drawImage(getPlate('newsprint', W, H, 3), 0, y); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(250,247,238,.9)'; ctx.lineWidth = 7; const r2 = rng(17); ctx.beginPath(); for (let x = W; x >= 0; x -= 18) ctx.lineTo(x, y + H + (r2() - 0.5) * 34); ctx.stroke(); ctx.restore();
}
