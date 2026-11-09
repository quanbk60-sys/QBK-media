// Phong cách "ve-tinh": nền ảnh vệ tinh thật (kim tự tháp zoom từ studio/tools/satmap.py), quả địa cầu,
// ghim + nhãn, đường đi tự vẽ, vùng, chấm, thẻ ảnh polaroid, tiêu đề kiểu bản tin, ô số liệu, mây.
// Các phần tử này vẽ thẳng lên canvas (ảnh raster), không qua Recorder, nên không có hiệu ứng bàn tay vẽ.
// Định dạng: SCENE_FORMAT.md, mục "Phong cách vệ tinh".
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {clamp, ease, backOut, sampleTrack, rng} from './math.mjs';

export const ORANGE = '#FF8A1F', WHITE = '#FFFFFF', DARK = '#111418';
export const GEO_TYPES = ['satmap', 'globe', 'stars', 'marker', 'tag', 'route', 'area', 'dots', 'title', 'photo', 'stats', 'clouds', 'note', 'shade'];
const col = c => ({orange: ORANGE, white: WHITE, dark: DARK, blue: '#3FB6FF', red: '#E5484D', yellow: '#FFD23F', green: '#46C46B'}[c] || c || ORANGE);
const F = {black: 'QBKBlack', italic: 'QBKItalic', bold: 'QBKBold'};

// ---------- Web Mercator ----------
export const merc = (lat, lon) => { const s = Math.sin(clamp(lat, -85.05, 85.05) * Math.PI / 180); return [(lon + 180) / 360, 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)]; };
const worldPx = z => 256 * 2 ** z;

// view track: [{t, lat, lon, zoom, ease}] → {c:[mx,my], zoom, lat}
// Zoom flights keep the destination (zoom-in) or origin (zoom-out) point moving smoothly on screen.
export function sampleView(keys, t) {
  if (!keys?.length) return null;
  const K = keys.map(k => ({...k, m: merc(k.lat, k.lon)}));
  if (t <= K[0].t) return {c: K[0].m, zoom: K[0].zoom, lat: K[0].lat};
  const i = K.findIndex(k => k.t > t); if (i < 0) { const k = K.at(-1); return {c: k.m, zoom: k.zoom, lat: k.lat}; }
  const a = K[i - 1], b = K[i], u = (t - a.t) / (b.t - a.t), e = b.ease === 'linear' ? u : ease(u);
  const Z = a.zoom + (b.zoom - a.zoom) * e; let c;
  if (b.zoom > a.zoom + 0.01) { const f = 2 ** (a.zoom - Z) * (1 - e); c = [b.m[0] - (b.m[0] - a.m[0]) * f, b.m[1] - (b.m[1] - a.m[1]) * f]; }
  else if (a.zoom > b.zoom + 0.01) { const g = 2 ** (b.zoom - Z) * e; c = [a.m[0] + (b.m[0] - a.m[0]) * g, a.m[1] + (b.m[1] - a.m[1]) * g]; }
  else c = [a.m[0] + (b.m[0] - a.m[0]) * e, a.m[1] + (b.m[1] - a.m[1]) * e];
  return {c, zoom: Z, lat: a.lat + (b.lat - a.lat) * e};
}
export const project = (v, s, lat, lon) => { const m = merc(lat, lon), W = worldPx(v.zoom); return [s.width / 2 + (m[0] - v.c[0]) * W, s.height / 2 + (m[1] - v.c[1]) * W]; };

// ---------- assets ----------
const cache = new Map();
async function loadSat(s) {
  if (!s.satmap) return null;
  const f = path.join(s.base, s.satmap); if (cache.has(f)) return cache.get(f);
  const meta = JSON.parse(fs.readFileSync(f, 'utf8')), dir = path.dirname(f);
  for (const l of meta.levels) l.img = await loadImage(path.join(dir, l.file));
  cache.set(f, meta); return meta;
}
export async function preloadGeo(s) {
  s._sat = await loadSat(s);
  s._photos = new Map();
  for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'photo' && !s._photos.has(e.path)) s._photos.set(e.path, await loadImage(path.join(s.base, e.path)));
  if (s.shots.some(sh => (sh.elements || []).some(e => e.type === 'globe'))) {
    const w = s._sat?.levels.filter(l => l.world).at(-1); if (!w) throw new Error('globe cần một mức "world" trong satmap.json (satmap.py --level 4:world)');
    const cv = createCanvas(w.w, w.h), c = cv.getContext('2d'); c.drawImage(w.img, 0, 0);
    s._globeTex = {data: c.getImageData(0, 0, w.w, w.h).data, w: w.w, h: w.h};
  }
}
export function validateGeo(s, e, where, err) {
  if (!GEO_TYPES.includes(e.type)) return false;
  if (['satmap', 'globe'].includes(e.type) && !s.satmap) err(`${where}: scene cần "satmap": "đường/dẫn/satmap.json"`);
  if (e.type === 'photo' && !fs.existsSync(path.join(s.base, e.path || ''))) err(`${where}: missing photo ${e.path}`);
  if (e.type === 'route' && !(e.path?.length >= 2)) err(`${where}: route cần path [[lat,lon],...]`);
  return true;
}

// ---------- helpers ----------
const local = (e, t) => t - (e.from ?? 0);
function grow(e, t) { const g = e.grow; if (!g) return 1; return clamp((local(e, t) - (g.at ?? 0)) / (g.dur ?? 1)); }
function fadeA(e, t) { let a = e.alpha ?? 1; const k = local(e, t); if (e.enter !== 'none') a *= clamp(k / (e.enterDur ?? 0.35)); if (e.to !== undefined && e.exit !== 'none') a *= clamp((e.to - t) / 0.3); const tr = sampleTrack(e.track, t, ['alpha']); if (tr.alpha !== undefined) a *= tr.alpha; return a; }
function pos(e, t, s, v) {
  const tr = sampleTrack(e.track, t, ['x', 'y']);
  if (e.geo && v) { const [x, y] = project(v, s, e.geo[0], e.geo[1]); return [x + (e.dx || 0), y + (e.dy || 0)]; }
  return [tr.x ?? e.x ?? s.width / 2, tr.y ?? e.y ?? s.height / 2];
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fitFont(ctx, text, family, size, maxW) { let sz = size; do { ctx.font = `${sz}px ${family}`; if (ctx.measureText(text).width <= maxW) break; sz -= 2; } while (sz > 20); return sz; }

// ---------- painters ----------
function satmap(ctx, e, t, s, v) {
  const sat = s._sat; if (!sat || !v) return;
  ctx.save(); ctx.globalAlpha = fadeA({...e, enter: e.enter ?? 'none'}, t); ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#05080C'; ctx.fillRect(0, 0, s.width, s.height);
  const Wv = worldPx(v.zoom);
  const vis = sat.levels.filter(l => l.z <= v.zoom + 1.6);
  for (const l of vis) {
    const Wz = worldPx(l.z), k = Wv / Wz, dx = s.width / 2 + (l.x0 / Wz - v.c[0]) * Wv, dy = s.height / 2 + (l.y0 / Wz - v.c[1]) * Wv;
    if (dx > s.width || dy > s.height || dx + l.w * k < 0 || dy + l.h * k < 0) continue;
    if (l.world) for (const off of [-1, 0, 1]) ctx.drawImage(l.img, dx + off * Wv, dy, l.w * k, l.h * k); else ctx.drawImage(l.img, dx, dy, l.w * k, l.h * k);
  }
  if (e.dim) { ctx.fillStyle = `rgba(0,0,0,${e.dim})`; ctx.fillRect(0, 0, s.width, s.height); }
  ctx.restore();
  if (e.shade !== false) shade(ctx, {}, t, s);
}
function shade(ctx, e, t, s) {
  const H = s.height, W = s.width;
  let g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, `rgba(0,0,0,${e.top ?? 0.55})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 520);
  g = ctx.createLinearGradient(0, H * 0.55, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, `rgba(0,0,0,${(e.bottom ?? 0.7) * 0.75})`); g.addColorStop(1, `rgba(0,0,0,${e.bottom ?? 0.7})`); ctx.fillStyle = g; ctx.fillRect(0, H * 0.55, W, H * 0.45);
}
function stars(ctx, e, t, s) {
  ctx.fillStyle = '#020306'; ctx.fillRect(0, 0, s.width, s.height); const r = rng(e.seed ?? 11);
  for (let i = 0; i < (e.n ?? 260); i++) { const x = r() * s.width, y = r() * s.height, b = r(); ctx.fillStyle = `rgba(255,255,255,${(0.15 + 0.6 * b * (0.75 + 0.25 * Math.sin(t * 2 + i))).toFixed(3)})`; ctx.fillRect(x, y, b > 0.92 ? 3 : 2, b > 0.92 ? 3 : 2); }
}
function globe(ctx, e, t, s, v) {
  const tex = s._globeTex; if (!tex || !v) return;
  const lat0 = v.lat * Math.PI / 180, lon0 = (v.c[0] * 360 - 180) * Math.PI / 180;
  const R = worldPx(v.zoom) / (2 * Math.PI * Math.cos(lat0)), cx = s.width / 2, cy = s.height / 2;
  const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(s.width, Math.ceil(cx + R)), y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(s.height, Math.ceil(cy + R));
  // atmosphere glow
  const ga = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.12); ga.addColorStop(0, 'rgba(90,170,255,0.55)'); ga.addColorStop(1, 'rgba(90,170,255,0)');
  ctx.save(); ctx.globalAlpha = fadeA({...e, enter: e.enter ?? 'none'}, t); ctx.fillStyle = ga; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  if (x1 <= x0 || y1 <= y0) return;
  const w = x1 - x0, h = y1 - y0, img = ctx.getImageData(x0, y0, w, h), d = img.data, sl = Math.sin(lat0), cl = Math.cos(lat0), a = fadeA({...e, enter: e.enter ?? 'none'}, t);
  for (let j = 0; j < h; j++) {
    const yy = -(y0 + j + 0.5 - cy) / R;
    for (let i = 0; i < w; i++) {
      const xx = (x0 + i + 0.5 - cx) / R, rho = xx * xx + yy * yy; if (rho > 1) continue;
      const z = Math.sqrt(1 - rho), lat = Math.asin(z * sl + yy * cl), lon = lon0 + Math.atan2(xx, z * cl - yy * sl);
      let u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1, la = Math.min(1.4844, Math.max(-1.4844, lat)), vv = 0.5 - Math.log(Math.tan(Math.PI / 4 + la / 2)) / (2 * Math.PI);
      const p = ((Math.min(tex.h - 1, vv * tex.h | 0)) * tex.w + (u * tex.w | 0)) * 4, sh = 0.35 + 0.65 * Math.pow(z, 0.6), q = (j * w + i) * 4, edge = clamp((1 - Math.sqrt(rho)) * R / 2);
      const k = a * edge;
      d[q] = d[q] * (1 - k) + tex.data[p] * sh * k; d[q + 1] = d[q + 1] * (1 - k) + tex.data[p + 1] * sh * k; d[q + 2] = d[q + 2] * (1 - k) + Math.min(255, tex.data[p + 2] * sh + 10 * (1 - z)) * k;
    }
  }
  ctx.putImageData(img, x0, y0);
}
function pinShape(ctx, x, y, size, fill) {
  const r = 15 * size; ctx.save(); ctx.translate(x, y); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10;
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-r * 0.4, -r * 1.2, -r * 1.25, -r * 1.55, -r * 1.25, -r * 2.35); ctx.arc(0, -r * 2.35, r * 1.25, Math.PI, 0); ctx.bezierCurveTo(r * 1.25, -r * 1.55, r * 0.4, -r * 1.2, 0, 0); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = DARK; ctx.beginPath(); ctx.arc(0, -r * 2.35, r * 0.48, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function tagBox(ctx, x, y, text, o = {}) {
  const size = o.size ?? 30; ctx.font = `${size}px ${F.black}`; const tw = ctx.measureText(text).width, padX = size * 0.45, ic = o.icon ? size * 0.9 : 0, w = tw + padX * 2 + ic, h = size * 1.55;
  const bx = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2, by = y - h / 2;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 12; ctx.fillStyle = o.bg ? col(o.bg) : WHITE; rr(ctx, bx, by, w, h, 6); ctx.fill(); ctx.shadowBlur = 0;
  if (o.icon) pinShape(ctx, bx + padX + ic * 0.32, by + h * 0.8, size / 48, o.bg === 'orange' ? WHITE : DARK);
  ctx.fillStyle = o.color ? col(o.color) : DARK; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(text, bx + padX + ic, by + h / 2 + 1); ctx.restore();
  return {x: bx, y: by, w, h};
}
function marker(ctx, e, t, s, v) {
  const [x, y] = pos(e, t, s, v), k = local(e, t), a = fadeA(e, t), pop = backOut(clamp(k / 0.45));
  ctx.save(); ctx.globalAlpha = a;
  if (e.pulse !== false) { const ph = (k * 0.9) % 1; ctx.strokeStyle = col(e.color || 'white'); ctx.globalAlpha = a * (1 - ph) * 0.8; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 20 + 70 * ph, (20 + 70 * ph) * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = a; }
  pinShape(ctx, x, y - (1 - pop) * 60, (e.size ?? 1.6) * (0.5 + 0.5 * pop), col(e.color || 'white'));
  if (e.label) { const side = e.side ?? 1, ly = y - 35 * (e.size ?? 1.6) - (e.labelDy ?? 0); ctx.globalAlpha = a * clamp((k - 0.25) / 0.3); tagBox(ctx, side === 0 ? x : x + side * 48, side === 0 ? ly - 70 : ly, e.label, {align: side === 0 ? 'center' : side > 0 ? 'left' : 'right', size: e.labelSize ?? 30, bg: e.labelBg, color: e.labelColor}); }
  ctx.restore();
}
function tag(ctx, e, t, s, v) { const [x, y] = pos(e, t, s, v); ctx.save(); ctx.globalAlpha = fadeA(e, t); const k = backOut(clamp(local(e, t) / 0.4)); ctx.translate(x, y); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k); tagBox(ctx, 0, 0, e.text, {size: e.size, icon: e.icon, bg: e.bg, color: e.color, align: e.align}); ctx.restore(); }
function polyline(e, s, v) { return e.path.map(p => project(v, s, p[0], p[1])); }
function partial(pts, p) {
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const target = L.at(-1) * p, out = [pts[0]]; let ang = 0;
  for (let i = 1; i < pts.length; i++) { if (L[i] <= target) { out.push(pts[i]); ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]); continue; }
    const u = (target - L[i - 1]) / ((L[i] - L[i - 1]) || 1); out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]); ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]); break; }
  return {pts: out, ang};
}
function route(ctx, e, t, s, v) {
  if (!v) return; let pts = polyline(e, s, v); if (e.smooth !== false) pts = chaikin(chaikin(pts));
  const p = grow(e, t); if (p <= 0) return; const {pts: P, ang} = partial(pts, p), c = col(e.color), w = e.width ?? 9;
  ctx.save(); ctx.globalAlpha = fadeA({...e, enter: e.enter ?? 'none'}, t); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (e.dashed) ctx.setLineDash([w * 2.2, w * 1.6]);
  if (e.glow !== false) { ctx.strokeStyle = c; ctx.globalAlpha *= 0.35; ctx.lineWidth = w * 2.6; ctx.shadowColor = c; ctx.shadowBlur = 18; line(ctx, P); ctx.globalAlpha /= 0.35; ctx.shadowBlur = 0; }
  ctx.strokeStyle = c; ctx.lineWidth = w; line(ctx, P); ctx.setLineDash([]);
  const [hx, hy] = P.at(-1);
  if (e.head === 'arrow' && p > 0.02) { ctx.fillStyle = c; ctx.translate(hx, hy); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(w * 2.6, 0); ctx.lineTo(-w * 1.4, -w * 2); ctx.lineTo(-w * 0.6, 0); ctx.lineTo(-w * 1.4, w * 2); ctx.closePath(); ctx.fill(); }
  else if (e.head === 'dot' && p > 0.02) { ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(hx, hy, w * 1.1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy, w * 0.65, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  if (e.label && p > 0.6) { ctx.save(); ctx.globalAlpha = clamp((p - 0.6) / 0.25) * fadeA(e, t); const m = pts[Math.floor(pts.length * (e.labelAt ?? 0.5))]; tagBox(ctx, m[0] + (e.labelDx ?? 0), m[1] + (e.labelDy ?? 0), e.label, {size: e.labelSize ?? 26, bg: e.labelBg ?? e.color, color: e.labelColor ?? (e.color === 'white' ? 'dark' : 'white')}); ctx.restore(); }
}
function line(ctx, P) { ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); }
function chaikin(P) { if (P.length < 3) return P; const o = [P[0]]; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } o.push(P.at(-1)); return o; }
function area(ctx, e, t, s, v) {
  if (!v) return; const P = chaikin(polyline(e, s, v)), c = col(e.color), a = fadeA(e, t), pulse = e.pulse ? 0.75 + 0.25 * Math.sin(local(e, t) * 4) : 1;
  ctx.save(); ctx.globalAlpha = a * (e.fillAlpha ?? 0.28) * pulse; ctx.fillStyle = c; ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = e.width ?? 5; ctx.setLineDash(e.dashed === false ? [] : [16, 10]); ctx.stroke(); ctx.restore();
}
function dots(ctx, e, t, s, v) {
  const k = local(e, t), a = fadeA(e, t), c = col(e.color), st = e.stagger ?? 0.06;
  const pts = e.points ? e.points.map(p => project(v, s, p[0], p[1])) : (() => { const [x, y] = pos(e, t, s, v), r = rng(e.seed ?? 3), o = []; for (let i = 0; i < (e.n ?? 30); i++) o.push([x + (r() - 0.5) * (e.w ?? 200), y + (r() - 0.5) * (e.h ?? 80)]); return o; })();
  ctx.save(); pts.forEach(([x, y], i) => { const q = clamp((k - i * st) / 0.3); if (q <= 0) return; const r = (e.size ?? 7) * backOut(q); ctx.globalAlpha = a; ctx.fillStyle = DARK; ctx.beginPath(); ctx.arc(x, y, r + 2.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }); ctx.restore();
}
function title(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: e.enter ?? 'none'}, t), align = e.align || 'left', x = e.x ?? (align === 'center' ? s.width / 2 : 66), maxW = s.width - 2 * 60;
  let y = e.y ?? 300; const size = e.size ?? 108;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 3;
  if (e.kicker) { const ks = e.kickerSize ?? Math.round(size * 0.42); fitFont(ctx, e.kicker, F.italic, ks, maxW); ctx.globalAlpha = a * clamp(k / 0.3); ctx.fillStyle = col(e.kickerColor || 'orange'); ctx.fillText(e.kicker.toUpperCase(), x, y); y += size * 0.98; ctx.globalAlpha = a; }
  const lines = String(e.title || '').split('\n'), td = e.typing === false ? 0 : (e.typeDur ?? 0.5), total = lines.join('').length; let shown = td ? Math.floor(clamp((k - (e.kicker ? 0.12 : 0)) / td) * total + 0.001) : total;
  for (const ln of lines) { const sz = fitFont(ctx, ln.toUpperCase(), F.black, size, maxW); ctx.fillStyle = col(e.color || 'white'); ctx.fillText(ln.toUpperCase().slice(0, Math.max(0, shown)), x, y); shown -= ln.length; y += sz * 1.02; }
  if (e.sub) for (const ln of String(e.sub).split('\n')) { const ss = e.subSize ?? Math.round(size * 0.78), q = clamp((k - td - 0.05) / 0.3); const sz = fitFont(ctx, ln.toUpperCase(), F.black, ss, maxW); ctx.globalAlpha = a * q; ctx.fillStyle = col(e.subColor || 'orange'); ctx.fillText(ln.toUpperCase(), x + (1 - ease(q)) * (align === 'center' ? 0 : -30), y); y += sz * 1.02; }
  if (e.badge) { ctx.shadowBlur = 0; const q = clamp((k - td - 0.2) / 0.3); ctx.globalAlpha = a * q; ctx.font = `${e.badgeSize ?? 30}px ${F.black}`; const bw = ctx.measureText(e.badge.toUpperCase()).width + 30, bx = align === 'center' ? x - bw / 2 : x; ctx.fillStyle = ORANGE; ctx.fillRect(bx, y - 30, bw, 46); ctx.fillStyle = WHITE; ctx.textAlign = 'left'; ctx.fillText(e.badge.toUpperCase(), bx + 15, y + 4); }
  ctx.restore();
}
function photo(ctx, e, t, s) {
  const im = s._photos.get(e.path), k = local(e, t), dur = (e.to ?? (e._shotDur ?? 4)) - (e.from ?? 0), a = fadeA({...e, enter: 'none'}, t);
  const kb = 1 + ((e.kenburns ?? 1.08) - 1) * clamp(k / Math.max(1, dur));
  if (e.full) { // full-frame photo background
    const sc = Math.max(s.width / im.width, s.height / im.height) * kb, w = im.width * sc, h = im.height * sc, fx = e.focus?.[0] ?? 0.5, fy = e.focus?.[1] ?? 0.5;
    ctx.save(); ctx.globalAlpha = a * clamp(k / (e.enterDur ?? 0.4)); ctx.drawImage(im, (s.width - w) * fx, (s.height - h) * fy, w, h);
    if (e.dim !== 0) { ctx.fillStyle = `rgba(0,0,0,${e.dim ?? 0.25})`; ctx.fillRect(0, 0, s.width, s.height); }
    ctx.restore(); if (e.shade !== false) shade(ctx, {}, t, s); if (e.credit) credit(ctx, s, e.credit, s.height - 330, 'left'); return;
  }
  const W = e.w ?? 760, ratio = e.ratio ?? (im.height / im.width), H = W * ratio, B = e.border ?? 16, CB = e.credit ? 44 : B;
  const q = clamp(k / 0.55), [x, y0] = [e.x ?? s.width / 2, e.y ?? 960], y = y0 + (1 - backOut(q)) * 260, rot = (e.rotate ?? -0.03) + (1 - ease(q)) * 0.12;
  ctx.save(); ctx.globalAlpha = a * clamp(q * 2.5); ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; ctx.fillStyle = '#F7F5F0'; ctx.fillRect(-W / 2 - B, -H / 2 - B, W + 2 * B, H + B + CB); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.save(); ctx.beginPath(); ctx.rect(-W / 2, -H / 2, W, H); ctx.clip();
  const sc = Math.max(W / im.width, H / im.height) * kb, iw = im.width * sc, ih = im.height * sc, fx = e.focus?.[0] ?? 0.5, fy = e.focus?.[1] ?? 0.5;
  ctx.drawImage(im, -W / 2 + (W - iw) * fx, -H / 2 + (H - ih) * fy, iw, ih); ctx.restore();
  if (e.credit) { ctx.font = `20px ${F.bold}`; ctx.fillStyle = '#6B6B6B'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; let c = e.credit; while (ctx.measureText(c).width > W && c.length > 8) c = c.slice(0, -2); ctx.fillText(c, -W / 2, H / 2 + CB / 2); }
  if (e.caption) { ctx.restore(); ctx.save(); ctx.globalAlpha = a * clamp((k - 0.35) / 0.3); tagBox(ctx, x - W / 2 + (e.captionDx ?? 0), y + H / 2 - 30, e.caption, {align: 'left', size: 26}); }
  ctx.restore();
}
const ICONS = {
  calendar: c => { c.strokeRect(-14, -11, 28, 25); c.beginPath(); c.moveTo(-14, -3); c.lineTo(14, -3); c.moveTo(-7, -16); c.lineTo(-7, -8); c.moveTo(7, -16); c.lineTo(7, -8); c.stroke(); },
  ship: c => { c.beginPath(); c.moveTo(-17, 4); c.lineTo(17, 4); c.lineTo(11, 13); c.lineTo(-11, 13); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 2); c.lineTo(0, -17); c.lineTo(12, 0); c.closePath(); c.fill(); },
  stake: c => { for (const dx of [-11, 0, 11]) { c.beginPath(); c.moveTo(dx - 4, 14); c.lineTo(dx - 4, -6); c.lineTo(dx, -16); c.lineTo(dx + 4, -6); c.lineTo(dx + 4, 14); c.closePath(); c.fill(); } },
  water: c => { for (const dy of [-8, 1, 10]) { c.beginPath(); c.moveTo(-16, dy); for (let i = 0; i <= 4; i++) c.quadraticCurveTo(-16 + i * 8 + 4, dy + (i % 2 ? 5 : -5), -16 + (i + 1) * 8, dy); c.stroke(); } },
  sword: c => { c.beginPath(); c.moveTo(-14, 14); c.lineTo(12, -12); c.moveTo(-8, 4); c.lineTo(-4, 8); c.moveTo(-16, 16); c.lineTo(-12, 12); c.stroke(); c.beginPath(); c.moveTo(12, -12); c.lineTo(16, -16); c.lineTo(14, -10); c.closePath(); c.fill(); },
  crown: c => { c.beginPath(); c.moveTo(-16, 10); c.lineTo(-16, -8); c.lineTo(-8, 0); c.lineTo(0, -12); c.lineTo(8, 0); c.lineTo(16, -8); c.lineTo(16, 10); c.closePath(); c.fill(); },
  clock: c => { c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.moveTo(0, -9); c.lineTo(0, 0); c.lineTo(7, 5); c.stroke(); },
  pin: c => { c.beginPath(); c.arc(0, -4, 10, Math.PI, 0); c.lineTo(0, 16); c.closePath(); c.fill(); },
  people: c => { for (const dx of [-9, 9]) { c.beginPath(); c.arc(dx, -7, 6, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(dx, 13, 10, Math.PI, 0); c.fill(); } },
  flag: c => { c.beginPath(); c.moveTo(-12, 16); c.lineTo(-12, -16); c.stroke(); c.beginPath(); c.moveTo(-12, -16); c.lineTo(14, -9); c.lineTo(-12, -1); c.closePath(); c.fill(); },
  area: c => { c.strokeRect(-14, -14, 28, 28); c.beginPath(); c.moveTo(-14, 4); c.lineTo(4, -14); c.moveTo(-4, 14); c.lineTo(14, -4); c.stroke(); },
  ruler: c => { c.beginPath(); c.moveTo(-16, 0); c.lineTo(16, 0); c.moveTo(-16, -8); c.lineTo(-16, 8); c.moveTo(16, -8); c.lineTo(16, 8); c.stroke(); },
};
function stats(ctx, e, t, s) {
  const items = e.items || [], k = local(e, t), a = fadeA({...e, enter: 'none'}, t), n = items.length, W = e.w ?? (s.width - 120), cw = W / n, x0 = (s.width - W) / 2, y = e.y ?? 1220;
  ctx.save();
  items.forEach((it, i) => {
    const q = clamp((k - i * (e.stagger ?? 0.3)) / 0.4); if (q <= 0) return; const cx = x0 + cw * (i + 0.5), sc = backOut(q);
    ctx.globalAlpha = a * clamp(q * 2); ctx.save(); ctx.translate(cx, y); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 12; ctx.fillStyle = ORANGE; rr(ctx, -38, -38, 76, 76, 12); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = WHITE; ctx.strokeStyle = WHITE; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.scale(1.25, 1.25); (ICONS[it.icon] || ICONS.pin)(ctx); ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 10;
    fitFont(ctx, it.value, F.black, e.valueSize ?? 58, cw - 16); ctx.fillStyle = WHITE; ctx.fillText(it.value, cx, y + 102);
    if (it.label) { fitFont(ctx, it.label.toUpperCase(), F.bold, e.labelSize ?? 24, cw - 10); ctx.fillStyle = '#C9CED6'; ctx.fillText(it.label.toUpperCase(), cx, y + 138); }
    ctx.shadowBlur = 0;
  });
  ctx.restore();
}
function clouds(ctx, e, t, s) {
  const r = rng(e.seed ?? 5), n = e.n ?? 6, sp = e.speed ?? 14, a = fadeA({...e, enter: e.enter ?? 'none'}, t) * (e.opacity ?? 0.85);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const bx = r() * (s.width + 600) - 300, by = (e.y0 ?? 300) + r() * ((e.y1 ?? 1300) - (e.y0 ?? 300)), sz = 90 + r() * 120, x = ((bx + t * sp * (0.6 + r() * 0.8)) % (s.width + 600)) - 300;
    for (let j = 0; j < 7; j++) { const ox = (r() - 0.5) * sz * 2.2, oy = (r() - 0.5) * sz * 0.8, rad = sz * (0.45 + r() * 0.5), g = ctx.createRadialGradient(x + ox, by + oy, 0, x + ox, by + oy, rad);
      g.addColorStop(0, `rgba(255,255,255,${(0.9 * a).toFixed(3)})`); g.addColorStop(0.55, `rgba(255,255,255,${(0.55 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + ox, by + oy, rad, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}
function note(ctx, e, t, s) { ctx.save(); ctx.globalAlpha = fadeA(e, t) * 0.85; ctx.font = `${e.size ?? 22}px ${F.bold}`; ctx.fillStyle = '#D5D9DF'; ctx.textAlign = e.align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(e.text, e.x ?? 66, e.y ?? 1330); ctx.restore(); }
export function credit(ctx, s, text, y = 120, align = 'right') { ctx.save(); ctx.font = `18px ${F.bold}`; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text, align === 'right' ? s.width - 40 : 40, y); ctx.restore(); }

const PAINT = {satmap, globe, stars, marker, tag, route, area, dots, title, photo, stats, clouds, note, shade};
export function drawGeo(ctx, e, t, s, v, shotDur) { e._shotDur = shotDur; PAINT[e.type](ctx, e, t, s, v); }
